from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from typing import Any

import numpy as np
import torch

from space_jepa.baselines import persistence_error, robust_zscore
from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler, load_csv
from space_jepa.metrics import auroc, average_precision, event_f1, point_metrics, threshold_from_nominal
from space_jepa.model import SpaceJEPA
from space_jepa.training import score_series, train_model


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


def evaluate(y: np.ndarray, scores: np.ndarray, threshold: float) -> dict[str, float]:
    result = point_metrics(y, scores, threshold)
    result.update(event_f1(y, scores, threshold))
    result["auroc"] = auroc(y, scores)
    result["average_precision"] = average_precision(y, scores)
    return result


def nominal_train_scores(
    scores: np.ndarray,
    coverage: np.ndarray,
    train_end: int,
    labels: np.ndarray | None,
) -> np.ndarray:
    valid = np.isfinite(scores[:train_end]) & (coverage[:train_end] > 0)
    if labels is not None:
        valid &= labels[:train_end] == 0
    selected = scores[:train_end][valid]
    if selected.size == 0:
        raise ValueError("no valid nominal training scores available for threshold fitting")
    return selected


def load_experiment(path: Path) -> dict[str, Any]:
    config = json.loads(path.read_text(encoding="utf-8"))
    required = {"model", "training", "scoring"}
    missing = required - config.keys()
    if missing:
        raise ValueError(f"experiment config missing keys: {sorted(missing)}")
    return config


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the pre-outcome Space-JEPA path on a flat preprocessed telemetry CSV."
    )
    parser.add_argument("csv", type=Path)
    parser.add_argument("--train-end", type=int, required=True, help="Exclusive training prefix boundary.")
    parser.add_argument("--config", type=Path, default=Path("configs/esa_first_pass.json"))
    parser.add_argument("--label-column", default=None)
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--out-dir", type=Path, default=Path("artifacts/real_runs/seed-17"))
    args = parser.parse_args()

    experiment = load_experiment(args.config)
    declared_seeds = [int(seed) for seed in experiment.get("seeds", [])]
    if declared_seeds and args.seed not in declared_seeds:
        raise ValueError(f"seed {args.seed} is outside frozen seed set {declared_seeds}")

    x, y, feature_names = load_csv(args.csv, args.label_column)
    model_spec = dict(experiment["model"])
    total_window = int(model_spec["context_length"]) + int(model_spec["target_length"])
    if not total_window < args.train_end < len(x):
        raise ValueError(
            f"train-end must be greater than one full window ({total_window}) and less than {len(x)}"
        )

    scaler = RobustScaler.fit(x[: args.train_end])
    x_scaled = scaler.transform(x)
    cfg = SpaceJEPAConfig(n_features=x.shape[1], **model_spec).validate()
    model = SpaceJEPA(cfg)

    training = experiment["training"]
    train_result = train_model(
        model,
        x_scaled[: args.train_end],
        epochs=int(training["epochs"]),
        batch_size=int(training["batch_size"]),
        lr=float(training["lr"]),
        stride=int(training["train_stride"]),
        seed=args.seed,
        device=args.device,
    )

    scoring = experiment["scoring"]
    score_stride = int(scoring["stride"])
    score_batch = int(scoring["batch_size"])
    scores, coverage = score_series(
        model, x_scaled, stride=score_stride, batch_size=score_batch, device=args.device
    )
    train_scores, train_coverage = score_series(
        model,
        x_scaled[: args.train_end],
        stride=score_stride,
        batch_size=score_batch,
        device=args.device,
    )
    threshold_train = nominal_train_scores(train_scores, train_coverage, args.train_end, y)
    threshold = threshold_from_nominal(threshold_train, float(scoring["threshold_quantile"]))

    z_train, z_scores = robust_zscore(x[: args.train_end], x)
    if y is not None:
        z_nominal = z_train[y[: args.train_end] == 0]
    else:
        z_nominal = z_train
    z_threshold = threshold_from_nominal(z_nominal, float(scoring["threshold_quantile"]))

    p_scores = persistence_error(x_scaled)
    p_train = p_scores[1 : args.train_end]
    if y is not None:
        p_train = p_train[y[1 : args.train_end] == 0]
    p_threshold = threshold_from_nominal(p_train, float(scoring["threshold_quantile"]))

    eval_mask = np.arange(len(x)) >= args.train_end
    eval_mask &= np.isfinite(scores) & (coverage > 0)
    metrics: dict[str, Any] = {}
    if y is not None:
        metrics["space_jepa"] = evaluate(y[eval_mask], scores[eval_mask], threshold)
        metrics["robust_zscore"] = evaluate(y[eval_mask], z_scores[eval_mask], z_threshold)
        metrics["persistence"] = evaluate(y[eval_mask], p_scores[eval_mask], p_threshold)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    score_path = args.out_dir / "scores.npz"
    np.savez_compressed(
        score_path,
        space_jepa=scores,
        coverage=coverage,
        robust_zscore=z_scores,
        persistence=p_scores,
        labels=y if y is not None else np.asarray([], dtype=np.int64),
    )
    checkpoint_path = args.out_dir / "model.pt"
    torch.save({"state_dict": model.state_dict(), "config": cfg.to_dict()}, checkpoint_path)

    payload = {
        "status": "PRE_OUTCOME_RUN_NOT_PROMOTED_UNTIL_OFFICIAL_ESA_ADB_EVAL",
        "code_commit": git_head(),
        "dataset": {
            "path": str(args.csv),
            "sha256": sha256(args.csv),
            "rows": len(x),
            "features": feature_names,
            "train_end": args.train_end,
            "labels_available": y is not None,
        },
        "experiment_config": experiment,
        "resolved_model_config": cfg.to_dict(),
        "seed": args.seed,
        "device": args.device,
        "torch_version": torch.__version__,
        "training": {
            "optimizer_steps": len(train_result.losses),
            "initial_loss": train_result.losses[0],
            "final_loss": train_result.losses[-1],
        },
        "thresholds": {
            "space_jepa": threshold,
            "robust_zscore": z_threshold,
            "persistence": p_threshold,
            "source": f"nominal-training-score-quantile-{scoring['threshold_quantile']}",
        },
        "metrics": metrics,
        "artifacts": {
            "scores": score_path.name,
            "checkpoint": checkpoint_path.name,
        },
    }
    (args.out_dir / "run.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
