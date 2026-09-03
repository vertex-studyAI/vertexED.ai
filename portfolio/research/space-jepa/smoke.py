from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch

from space_jepa.baselines import persistence_error, robust_zscore
from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler, synthetic_telemetry
from space_jepa.metrics import auroc, average_precision, event_f1, point_metrics, threshold_from_nominal
from space_jepa.model import SpaceJEPA
from space_jepa.training import score_series, train_model


def evaluate(y: np.ndarray, scores: np.ndarray, train_scores: np.ndarray) -> dict[str, float]:
    threshold = threshold_from_nominal(train_scores, 0.995)
    metrics = point_metrics(y, scores, threshold)
    metrics.update(event_f1(y, scores, threshold))
    metrics["auroc"] = auroc(y, scores)
    metrics["average_precision"] = average_precision(y, scores)
    metrics["threshold"] = threshold
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Synthetic Space-JEPA smoke run; not research evidence.")
    parser.add_argument("--out", default="artifacts/smoke.json")
    parser.add_argument("--epochs", type=int, default=2)
    args = parser.parse_args()

    x, y = synthetic_telemetry()
    split = 1000  # before injected anomalies
    scaler = RobustScaler.fit(x[:split])
    x_scaled = scaler.transform(x)
    cfg = SpaceJEPAConfig(
        n_features=x.shape[1],
        context_length=48,
        target_length=12,
        d_model=64,
        n_heads=4,
        n_layers=2,
        predictor_layers=1,
        dropout=0.0,
    )
    model = SpaceJEPA(cfg)
    result = train_model(model, x_scaled[:split], epochs=args.epochs, batch_size=64, stride=4)
    train_scores, train_cov = score_series(model, x_scaled[:split])
    test_scores, test_cov = score_series(model, x_scaled)
    train_valid = np.isfinite(train_scores) & (train_cov > 0)
    test_valid = np.isfinite(test_scores) & (test_cov > 0)
    jepa_metrics = evaluate(y[test_valid], test_scores[test_valid], train_scores[train_valid])

    z_train, z_test = robust_zscore(x[:split], x)
    z_metrics = evaluate(y, z_test, z_train)

    persistence = persistence_error(x_scaled)
    persistence_train = persistence[:split]
    # The first persistence score is a boundary placeholder rather than a real forecast error.
    persistence_metrics = evaluate(y[1:], persistence[1:], persistence_train[1:])

    payload = {
        "status": "SYNTHETIC_SMOKE_ONLY_NOT_RESEARCH_EVIDENCE",
        "torch_version": torch.__version__,
        "config": cfg.to_dict(),
        "epochs": args.epochs,
        "optimizer_steps": len(result.losses),
        "initial_loss": result.losses[0],
        "final_loss": result.losses[-1],
        "threshold_source": "nominal-train-score-quantile-0.995",
        "space_jepa": jepa_metrics,
        "robust_zscore_baseline": z_metrics,
        "persistence_baseline": persistence_metrics,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
