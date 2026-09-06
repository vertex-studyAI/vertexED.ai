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

from space_jepa.channel_probe import fit_channel_probe, score_channel_errors
from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler
from space_jepa.model import SpaceJEPA

RIDGE_ALPHA = 1.0
FIT_STRIDE = 4
SCORE_STRIDE = 1
BATCH_SIZE = 128
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


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Fit the frozen train-only Space-JEPA ridge decoder and export per-channel ESA-ADB "
            "prediction residuals without reading anomaly labels."
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
    train_telemetry, _ = _load_telemetry_only(
        args.train_csv, channels, load_timestamps=False
    )
    test_telemetry, test_timestamps = _load_telemetry_only(
        args.test_csv, channels, load_timestamps=True
    )
    if test_timestamps is None:
        raise ValueError("test timestamps are required for channel-score export")

    scaler = RobustScaler.fit(train_telemetry)
    train_x = scaler.transform(train_telemetry)
    test_x = scaler.transform(test_telemetry)
    model = _load_model(source_run, args.run_json.parent, args.device)
    if model.cfg.n_features != len(channels):
        raise ValueError("checkpoint feature count does not match frozen channel list")

    probe = fit_channel_probe(
        model,
        train_x,
        ridge_alpha=RIDGE_ALPHA,
        stride=FIT_STRIDE,
        batch_size=BATCH_SIZE,
        device=args.device,
    )
    warmed = warm_start_test(train_x, test_x, model.cfg.context_length)
    warmed_scores, warmed_coverage = score_channel_errors(
        model,
        probe,
        warmed,
        stride=SCORE_STRIDE,
        batch_size=BATCH_SIZE,
        device=args.device,
    )
    scores = warmed_scores[model.cfg.context_length :]
    coverage = warmed_coverage[model.cfg.context_length :]
    if not np.all(coverage > 0) or not np.isfinite(scores).all():
        raise RuntimeError("per-channel scoring left uncovered or non-finite test rows")

    args.out_dir.mkdir(parents=True, exist_ok=False)
    score_path = args.out_dir / "channel_scores.csv"
    frame: dict[str, object] = {"timestamp": test_timestamps}
    for index, channel in enumerate(channels):
        frame[f"{channel}_score"] = scores[:, index]
    pd.DataFrame(frame).to_csv(score_path, index=False)

    checkpoint_name = str(source_run["artifacts"]["checkpoint"])
    checkpoint_path = args.run_json.parent / checkpoint_name
    receipt = {
        "schema_version": 1,
        "status": "PRE_OUTCOME_CHANNEL_SCORES_ONLY_NOT_OFFICIAL_RESULT",
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
        "artifacts": {
            "channel_scores_csv": score_path.name,
            "channel_scores_csv_sha256": sha256(score_path),
        },
        "claim_boundary": (
            "This artifact is a pre-outcome per-channel score surface. It is not an official ESA-ADB "
            "ChannelAwareFScore or ADTQC result and does not change the frozen global-score claim."
        ),
    }
    receipt_path = args.out_dir / "channel_probe.json"
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
