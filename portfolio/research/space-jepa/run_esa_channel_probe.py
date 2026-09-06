from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from typing import Any

import numpy as np
import pandas as pd
import torch

from space_jepa.baselines import persistence_error_channels, robust_zscore_channels
from space_jepa.channel_probe import (
    apply_channel_thresholds,
    fit_channel_probe,
    fit_channel_thresholds,
    score_channel_errors,
)
from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler
from space_jepa.model import SpaceJEPA

RIDGE_ALPHA = 1.0
FIT_STRIDE = 4
SCORE_STRIDE = 1
BATCH_SIZE = 128
CHANNEL_THRESHOLD_QUANTILE = 0.995
TIMESTAMP_COLUMN = "timestamp"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_head() -> str | None:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL, text=True
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def _load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: expected JSON object")
    return payload


def _expected_sha(run: dict[str, Any], split: str) -> str:
    payload = run.get(split)
    if not isinstance(payload, dict):
        raise ValueError(f"source run is missing {split} provenance")
    value = payload.get("sha256")
    if not isinstance(value, str) or len(value) != 64:
        raise ValueError(f"source run has invalid {split}.sha256")
    return value


def _verify_source_bytes(run: dict[str, Any], train_csv: Path, test_csv: Path) -> None:
    actual_train = sha256(train_csv)
    actual_test = sha256(test_csv)
    if actual_train != _expected_sha(run, "train"):
        raise ValueError("train CSV bytes do not match source run provenance")
    if actual_test != _expected_sha(run, "test"):
        raise ValueError("test CSV bytes do not match source run provenance")


def _load_model(run: dict[str, Any], run_dir: Path, device: str) -> SpaceJEPA:
    cfg_payload = run.get("resolved_model_config")
    if not isinstance(cfg_payload, dict):
        raise ValueError("source run is missing resolved_model_config")
    cfg = SpaceJEPAConfig(**cfg_payload).validate()
    artifacts = run.get("artifacts")
    if not isinstance(artifacts, dict) or not isinstance(artifacts.get("checkpoint"), str):
        raise ValueError("source run is missing checkpoint artifact identity")
    checkpoint_path = run_dir / str(artifacts["checkpoint"])
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
    if not isinstance(checkpoint, dict) or checkpoint.get("config") != cfg.to_dict():
        raise ValueError("checkpoint model config does not match source run")
    state = checkpoint.get("state_dict")
    if not isinstance(state, dict):
        raise ValueError("checkpoint is missing state_dict")
    model = SpaceJEPA(cfg)
    model.load_state_dict(state, strict=True)
    return model


def _source_channels(run: dict[str, Any]) -> tuple[str, ...]:
    contract = run.get("source_contract")
    if not isinstance(contract, dict):
        raise ValueError("source run is missing source_contract")
    channels = contract.get("channels")
    if not isinstance(channels, list) or not channels or any(not isinstance(c, str) for c in channels):
        raise ValueError("source run is missing exact ordered channel list")
    if len(set(channels)) != len(channels):
        raise ValueError("source run contains duplicate channel identities")
    return tuple(channels)


def _load_telemetry_only(
    path: Path,
    channels: tuple[str, ...],
    *,
    load_timestamps: bool,
) -> tuple[np.ndarray, np.ndarray | None]:
    """Read only frozen telemetry columns; annotation columns are never loaded."""

    header = tuple(str(c) for c in pd.read_csv(path, nrows=0).columns)
    missing = [channel for channel in channels if channel not in header]
    if missing:
        raise ValueError(f"ESA-ADB CSV is missing frozen telemetry channels: {missing}")
    usecols = list(channels)
    dtypes: dict[str, object] = {channel: np.float32 for channel in channels}
    if load_timestamps:
        if TIMESTAMP_COLUMN not in header:
            raise ValueError("test ESA-ADB CSV is missing timestamp column")
        usecols.insert(0, TIMESTAMP_COLUMN)
        dtypes[TIMESTAMP_COLUMN] = "string"
    frame = pd.read_csv(path, usecols=usecols, dtype=dtypes)
    telemetry = frame.loc[:, list(channels)].to_numpy(dtype=np.float32, copy=True)
    if telemetry.ndim != 2 or telemetry.shape[1] != len(channels) or len(telemetry) < 1:
        raise ValueError("telemetry-only read produced invalid geometry")
    timestamps = None
    if load_timestamps:
        timestamps = frame[TIMESTAMP_COLUMN].astype(str).to_numpy(copy=True)
        if len(timestamps) != len(telemetry):
            raise ValueError("timestamps must align with telemetry rows")
    return telemetry, timestamps


def warm_start_test(train: np.ndarray, test: np.ndarray, context_length: int) -> np.ndarray:
    if len(train) < context_length:
        raise ValueError("training data is shorter than context_length")
    return np.concatenate([train[-context_length:], test], axis=0)


def _write_channel_surface(
    path: Path,
    timestamps: np.ndarray,
    channels: tuple[str, ...],
    scores: np.ndarray,
    predictions: np.ndarray,
) -> None:
    if scores.shape != predictions.shape or scores.shape != (len(timestamps), len(channels)):
        raise ValueError("channel score/prediction geometry does not match timestamps and channels")
    if not np.isfinite(scores).all():
        raise ValueError("retained channel scores must be finite")
    frame: dict[str, object] = {"timestamp": timestamps}
    for index, channel in enumerate(channels):
        frame[f"{channel}_score"] = scores[:, index]
        frame[f"{channel}_pred"] = predictions[:, index]
    pd.DataFrame(frame).to_csv(path, index=False)


def _threshold_payload(channels: tuple[str, ...], thresholds: np.ndarray, source: str) -> dict[str, object]:
    return {
        "source": source,
        "quantile": CHANNEL_THRESHOLD_QUANTILE,
        "comparison": "score >= threshold",
        "values": {channel: float(thresholds[index]) for index, channel in enumerate(channels)},
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Fit the frozen train-only Space-JEPA ridge decoder and matched per-channel comparators, "
            "then export continuous scores plus train-thresholded binary predictions without reading "
            "ESA anomaly labels."
        )
    )
    parser.add_argument("run_json", type=Path)
    parser.add_argument("train_csv", type=Path)
    parser.add_argument("test_csv", type=Path)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    source_run = _load_json(args.run_json)
    _verify_source_bytes(source_run, args.train_csv, args.test_csv)
    channels = _source_channels(source_run)
    train_telemetry, _ = _load_telemetry_only(args.train_csv, channels, load_timestamps=False)
    test_telemetry, test_timestamps = _load_telemetry_only(args.test_csv, channels, load_timestamps=True)
    if test_timestamps is None:
        raise ValueError("test timestamps are required for channel-score export")

    scaler = RobustScaler.fit(train_telemetry)
    train_x = scaler.transform(train_telemetry)
    test_x = scaler.transform(test_telemetry)
    model = _load_model(source_run, args.run_json.parent, args.device)
    if model.cfg.n_features != len(channels):
        raise ValueError("checkpoint feature count does not match frozen channel list")

    # Space-JEPA compatibility head.
    probe = fit_channel_probe(
        model,
        train_x,
        ridge_alpha=RIDGE_ALPHA,
        stride=FIT_STRIDE,
        batch_size=BATCH_SIZE,
        device=args.device,
    )
    train_scores, train_coverage = score_channel_errors(
        model, probe, train_x, stride=SCORE_STRIDE, batch_size=BATCH_SIZE, device=args.device
    )
    thresholds = fit_channel_thresholds(
        train_scores, train_coverage, quantile=CHANNEL_THRESHOLD_QUANTILE
    )
    warmed = warm_start_test(train_x, test_x, model.cfg.context_length)
    warmed_scores, warmed_coverage = score_channel_errors(
        model, probe, warmed, stride=SCORE_STRIDE, batch_size=BATCH_SIZE, device=args.device
    )
    scores = warmed_scores[model.cfg.context_length :]
    coverage = warmed_coverage[model.cfg.context_length :]
    if not np.all(coverage > 0) or not np.isfinite(scores).all():
        raise RuntimeError("Space-JEPA per-channel scoring left uncovered or non-finite test rows")
    predictions = apply_channel_thresholds(scores, thresholds)

    # Matched comparator 1: per-channel absolute robust z score, with train-only robust scaling.
    z_train, z_test = robust_zscore_channels(train_telemetry, test_telemetry)
    z_thresholds = fit_channel_thresholds(
        z_train, np.ones(len(z_train), dtype=np.int64), quantile=CHANNEL_THRESHOLD_QUANTILE
    )
    z_predictions = apply_channel_thresholds(z_test, z_thresholds)

    # Matched comparator 2: per-channel one-step persistence residual on the same normalized surface.
    p_train, p_train_coverage = persistence_error_channels(train_x)
    p_thresholds = fit_channel_thresholds(
        p_train, p_train_coverage, quantile=CHANNEL_THRESHOLD_QUANTILE
    )
    p_warmed, p_warmed_coverage = persistence_error_channels(
        np.concatenate([train_x[-1:], test_x], axis=0)
    )
    p_test = p_warmed[1:]
    p_test_coverage = p_warmed_coverage[1:]
    if not np.all(p_test_coverage > 0) or not np.isfinite(p_test).all():
        raise RuntimeError("persistence comparator left uncovered or non-finite test rows")
    p_predictions = apply_channel_thresholds(p_test, p_thresholds)

    args.out_dir.mkdir(parents=True, exist_ok=False)
    surface_paths = {
        "space_jepa": args.out_dir / "space_jepa_channels.csv",
        "robust_zscore": args.out_dir / "robust_zscore_channels.csv",
        "persistence": args.out_dir / "persistence_channels.csv",
    }
    _write_channel_surface(surface_paths["space_jepa"], test_timestamps, channels, scores, predictions)
    _write_channel_surface(surface_paths["robust_zscore"], test_timestamps, channels, z_test, z_predictions)
    _write_channel_surface(surface_paths["persistence"], test_timestamps, channels, p_test, p_predictions)

    checkpoint_name = str(source_run["artifacts"]["checkpoint"])
    checkpoint_path = args.run_json.parent / checkpoint_name
    receipt = {
        "schema_version": 2,
        "status": "PRE_OUTCOME_MATCHED_CHANNEL_SURFACES_NOT_OFFICIAL_RESULT",
        "code_commit": git_head(),
        "source_run_json_sha256": sha256(args.run_json),
        "source_checkpoint_sha256": sha256(checkpoint_path),
        "train_csv_sha256": sha256(args.train_csv),
        "test_csv_sha256": sha256(args.test_csv),
        "channels": list(channels),
        "annotation_columns_loaded": False,
        "anomaly_label_access": False,
        "probe": {
            **probe.to_dict(),
            "fit_stride": FIT_STRIDE,
            "score_stride": SCORE_STRIDE,
            "batch_size": BATCH_SIZE,
            "fit_surface": "normalized training telemetry only",
            "score_definition": "squared residual per normalized telemetry channel from predicted target latent ridge decode",
        },
        "methods": {
            "space_jepa": {
                "score_definition": "predicted-latent ridge decode squared residual per normalized telemetry channel",
                "thresholds": _threshold_payload(
                    channels, thresholds, "covered normalized-training channel residuals only"
                ),
            },
            "robust_zscore": {
                "score_definition": "absolute robust-scaled telemetry value per channel",
                "scaler_fit_surface": "training telemetry only",
                "thresholds": _threshold_payload(
                    channels, z_thresholds, "training per-channel robust-z scores only"
                ),
            },
            "persistence": {
                "score_definition": "absolute one-step persistence residual per normalized telemetry channel",
                "test_warm_start": "final normalized training row only",
                "thresholds": _threshold_payload(
                    channels, p_thresholds, "covered training per-channel persistence residuals only"
                ),
            },
        },
        "artifacts": {
            method: {"path": path.name, "sha256": sha256(path)}
            for method, path in surface_paths.items()
        },
        "claim_boundary": (
            "These are pre-outcome matched per-channel score/binary-prediction surfaces. They are "
            "not official ESA-ADB ChannelAwareFScore or ADTQC results and do not change the frozen "
            "global-score claim."
        ),
    }
    receipt_path = args.out_dir / "channel_probe.json"
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
