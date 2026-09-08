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

from space_jepa.baselines import persistence_error, robust_zscore
from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler
from space_jepa.esa_adb import CHANNEL_PRESETS, load_esa_adb_csv
from space_jepa.metrics import threshold_from_nominal
from space_jepa.model import SpaceJEPA
from space_jepa.training import score_series, train_model

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


def load_experiment(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    missing = {"model", "training", "scoring"} - payload.keys()
    if missing:
        raise ValueError(f"experiment config missing keys: {sorted(missing)}")
    return payload


def valid_scores(scores: np.ndarray, coverage: np.ndarray) -> np.ndarray:
    valid = np.isfinite(scores) & (coverage > 0)
    selected = scores[valid]
    if selected.size == 0:
        raise ValueError("no valid scores available")
    return selected


def load_test_telemetry_only(
    path: Path,
    channels: tuple[str, ...],
) -> tuple[np.ndarray, np.ndarray]:
    """Load frozen test telemetry and timestamps without reading annotation columns.

    ESA-ADB's preprocessed test CSV interleaves held-out ``is_anomaly_*`` columns
    with telemetry. The global pre-outcome runner must not parse those labels at all;
    official outcome evaluation is a separate, explicitly gated step.
    """

    header = tuple(str(column) for column in pd.read_csv(path, nrows=0).columns)
    missing = [channel for channel in channels if channel not in header]
    if missing:
        raise ValueError(f"ESA-ADB test CSV is missing frozen telemetry channels: {missing}")
    if TIMESTAMP_COLUMN not in header:
        raise ValueError("official ESA-ADB test CSV is missing timestamp column")

    usecols = [TIMESTAMP_COLUMN, *channels]
    dtypes: dict[str, object] = {TIMESTAMP_COLUMN: "string"}
    dtypes.update({channel: np.float32 for channel in channels})
    frame = pd.read_csv(path, usecols=usecols, dtype=dtypes)

    telemetry = frame.loc[:, list(channels)].to_numpy(dtype=np.float32, copy=True)
    timestamps = frame[TIMESTAMP_COLUMN].astype(str).to_numpy(copy=True)
    if telemetry.ndim != 2 or telemetry.shape[1] != len(channels) or len(telemetry) < 1:
        raise ValueError("telemetry-only test read produced invalid geometry")
    if len(timestamps) != len(telemetry):
        raise ValueError("test timestamps must align with telemetry rows")
    return telemetry, timestamps


def warm_start_test(train: np.ndarray, test: np.ndarray, context_length: int) -> np.ndarray:
    if len(train) < context_length:
        raise ValueError("training data is shorter than context_length")
    return np.concatenate([train[-context_length:], test], axis=0)


def write_prediction_csv(
    path: Path,
    timestamps: np.ndarray,
    scores: dict[str, np.ndarray],
    thresholds: dict[str, float],
) -> None:
    if len(timestamps) == 0:
        raise ValueError("timestamps are required for ESA-ADB prediction export")
    payload: dict[str, object] = {"timestamp": timestamps}
    for name, values in scores.items():
        if len(values) != len(timestamps):
            raise ValueError(f"{name} score length does not match test timestamps")
        payload[f"{name}_score"] = values
        payload[f"{name}_pred"] = (values >= thresholds[name]).astype(np.uint8)
    pd.DataFrame(payload).to_csv(path, index=False)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Run Space-JEPA on official ESA-ADB preprocessed train/test CSV files without "
            "reading held-out test annotation columns. Official metric evaluation is separate."
        )
    )
    parser.add_argument("train_csv", type=Path)
    parser.add_argument("test_csv", type=Path)
    parser.add_argument(
        "--preset", choices=sorted(CHANNEL_PRESETS), default="mission1-lite",
        help="Official ESA-ADB channel subset/target preset.",
    )
    parser.add_argument("--channels", default=None, help="Comma-separated explicit channels; overrides preset.")
    parser.add_argument("--config", type=Path, default=Path("configs/esa_first_pass.json"))
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--out-dir", type=Path, default=Path("artifacts/esa_adb/seed-17"))
    args = parser.parse_args()

    experiment = load_experiment(args.config)
    declared_seeds = [int(seed) for seed in experiment.get("seeds", [])]
    if declared_seeds and args.seed not in declared_seeds:
        raise ValueError(f"seed {args.seed} is outside frozen seed set {declared_seeds}")

    explicit_channels = None
    preset = args.preset
    if args.channels:
        explicit_channels = tuple(c.strip() for c in args.channels.split(",") if c.strip())
        preset = None

    # Training annotations may exist in the official preprocessed file, but are not model
    # features. Test annotations are stricter: the pre-outcome runner never loads them.
    train = load_esa_adb_csv(
        args.train_csv, channels=explicit_channels, preset=preset, load_timestamps=False
    )
    test_telemetry, test_timestamps = load_test_telemetry_only(
        args.test_csv, train.feature_names
    )

    scaler = RobustScaler.fit(train.telemetry)
    train_x = scaler.transform(train.telemetry)
    test_x = scaler.transform(test_telemetry)
    cfg = SpaceJEPAConfig(n_features=train_x.shape[1], **dict(experiment["model"])).validate()
    model = SpaceJEPA(cfg)

    training = experiment["training"]
    result = train_model(
        model,
        train_x,
        epochs=int(training["epochs"]),
        batch_size=int(training["batch_size"]),
        lr=float(training["lr"]),
        stride=int(training["train_stride"]),
        seed=args.seed,
        device=args.device,
    )

    scoring = experiment["scoring"]
    stride = int(scoring["stride"])
    score_batch = int(scoring["batch_size"])
    quantile = float(scoring["threshold_quantile"])
    train_scores, train_cov = score_series(
        model, train_x, stride=stride, batch_size=score_batch, device=args.device
    )
    threshold = threshold_from_nominal(valid_scores(train_scores, train_cov), quantile)

    warmed = warm_start_test(train_x, test_x, cfg.context_length)
    warmed_scores, warmed_cov = score_series(
        model, warmed, stride=stride, batch_size=score_batch, device=args.device
    )
    test_scores = warmed_scores[cfg.context_length:]
    test_cov = warmed_cov[cfg.context_length:]
    if not np.all(test_cov > 0):
        raise RuntimeError("test scoring left uncovered rows; use scoring stride=1 for retained ESA runs")

    z_train, _ = robust_zscore(train.telemetry, train.telemetry)
    _, z_test = robust_zscore(train.telemetry, test_telemetry)
    z_threshold = threshold_from_nominal(z_train, quantile)

    persistence_train = persistence_error(train_x)[1:]
    p_threshold = threshold_from_nominal(persistence_train, quantile)
    persistence_warmed = persistence_error(
        np.concatenate([train_x[-1:], test_x], axis=0)
    )[1:]

    thresholds = {
        "space_jepa": threshold,
        "robust_zscore": z_threshold,
        "persistence": p_threshold,
    }
    score_map = {
        "space_jepa": test_scores,
        "robust_zscore": z_test,
        "persistence": persistence_warmed,
    }

    args.out_dir.mkdir(parents=True, exist_ok=True)
    predictions_path = args.out_dir / "predictions.csv"
    write_prediction_csv(predictions_path, test_timestamps, score_map, thresholds)
    checkpoint_path = args.out_dir / "model.pt"
    torch.save({"state_dict": model.state_dict(), "config": cfg.to_dict()}, checkpoint_path)

    payload = {
        "status": "PRE_OUTCOME_ESA_ADB_RUN_REQUIRES_OFFICIAL_METRIC_EVALUATION",
        "code_commit": git_head(),
        "source_contract": {
            "benchmark": "ESA-ADB",
            "expected_preprocessing": "official Mission1/Mission2 semi-supervised preprocessing",
            "preset": preset,
            "channels": list(train.feature_names),
            "annotation_columns_used_as_features": False,
            "test_annotation_columns_loaded": False,
            "heldout_label_access": False,
        },
        "train": {"path": str(args.train_csv), "sha256": sha256(args.train_csv), "rows": len(train.telemetry)},
        "test": {"path": str(args.test_csv), "sha256": sha256(args.test_csv), "rows": len(test_telemetry)},
        "experiment_config": experiment,
        "resolved_model_config": cfg.to_dict(),
        "seed": args.seed,
        "device": args.device,
        "torch_version": torch.__version__,
        "training": {
            "optimizer_steps": len(result.losses),
            "initial_loss": result.losses[0],
            "final_loss": result.losses[-1],
        },
        "thresholds": {
            **thresholds,
            "source": f"label-blind-training-score-quantile-{quantile}",
        },
        "repository_native_diagnostics": {
            "status": "NOT_COMPUTED_PRE_OUTCOME_LABEL_ACCESS_BLOCKED"
        },
        "artifacts": {"predictions": predictions_path.name, "checkpoint": checkpoint_path.name},
    }
    (args.out_dir / "run.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
