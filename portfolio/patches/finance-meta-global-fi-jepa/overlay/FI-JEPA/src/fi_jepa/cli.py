from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from .data import chronological_windows, make_synthetic_market
from .model import FIJEPA, fit_ridge_probe


def run(*, seed: int, epochs: int) -> dict[str, object]:
    series = make_synthetic_market(seed=seed)
    split = chronological_windows(series)
    model = FIJEPA(
        features=series.shape[1],
        target_length=split.train_target.shape[1],
        seed=seed,
    )
    losses = model.fit(split.train_context, split.train_target, epochs=epochs)
    metrics = fit_ridge_probe(
        model,
        split.train_context,
        split.train_target,
        split.validation_context,
        split.validation_target,
    )
    return {
        "status": "synthetic_baseline_only",
        "seed": seed,
        "epochs": epochs,
        "train_windows": int(split.train_context.shape[0]),
        "validation_windows": int(split.validation_context.shape[0]),
        "initial_loss": losses[0],
        "final_loss": losses[-1],
        "probe": asdict(metrics),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the synthetic FI-JEPA baseline")
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--epochs", type=int, default=40)
    args = parser.parse_args()
    print(json.dumps(run(seed=args.seed, epochs=args.epochs), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
