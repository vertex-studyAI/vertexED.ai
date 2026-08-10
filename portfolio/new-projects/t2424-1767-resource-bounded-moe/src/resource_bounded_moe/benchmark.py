from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
import json
import random
from statistics import mean

from .model import fit_affine, fit_threshold_moe, rmse


@dataclass(frozen=True)
class TrialResult:
    seed: int
    task: str
    baseline_rmse: float
    moe_rmse: float
    relative_improvement: float
    learned_threshold: float
    active_experts_per_sample: int
    total_experts: int


def make_dataset(seed: int, task: str, n: int = 320) -> tuple[list[float], list[float]]:
    rng = random.Random(seed)
    xs = [rng.uniform(-3.0, 3.0) for _ in range(n)]
    ys: list[float] = []

    for x in xs:
        noise = rng.gauss(0.0, 0.18)
        if task == "piecewise":
            clean = 1.8 * x + 0.6 if x <= 0 else -0.9 * x + 1.2
        elif task == "linear":
            clean = 1.25 * x - 0.4
        else:
            raise ValueError(f"unknown task: {task}")
        ys.append(clean + noise)

    return xs, ys


def split_dataset(
    xs: list[float], ys: list[float], train_fraction: float = 0.7
) -> tuple[list[float], list[float], list[float], list[float]]:
    cut = int(len(xs) * train_fraction)
    return xs[:cut], ys[:cut], xs[cut:], ys[cut:]


def run_trial(seed: int, task: str) -> TrialResult:
    xs, ys = make_dataset(seed, task)
    train_x, train_y, test_x, test_y = split_dataset(xs, ys)

    baseline = fit_affine(train_x, train_y)
    moe = fit_threshold_moe(train_x, train_y)

    baseline_rmse = rmse(test_y, baseline.predict(test_x))
    moe_rmse = rmse(test_y, moe.predict(test_x))
    improvement = (baseline_rmse - moe_rmse) / baseline_rmse

    return TrialResult(
        seed=seed,
        task=task,
        baseline_rmse=baseline_rmse,
        moe_rmse=moe_rmse,
        relative_improvement=improvement,
        learned_threshold=moe.threshold,
        active_experts_per_sample=moe.active_experts_per_sample,
        total_experts=moe.total_experts,
    )


def summarize(results: list[TrialResult]) -> dict:
    return {
        "trials": len(results),
        "mean_baseline_rmse": mean(r.baseline_rmse for r in results),
        "mean_moe_rmse": mean(r.moe_rmse for r in results),
        "mean_relative_improvement": mean(r.relative_improvement for r in results),
        "mean_abs_threshold": mean(abs(r.learned_threshold) for r in results),
        "active_experts_per_sample": results[0].active_experts_per_sample if results else None,
        "total_experts": results[0].total_experts if results else None,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seeds", type=int, default=20)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    output = {}
    for task in ("piecewise", "linear"):
        results = [run_trial(seed, task) for seed in range(args.seeds)]
        output[task] = {
            "summary": summarize(results),
            "trials": [asdict(r) for r in results],
        }

    if args.json:
        print(json.dumps(output, indent=2, sort_keys=True))
        return

    for task, data in output.items():
        summary = data["summary"]
        print(f"{task}:")
        print(f"  trials={summary['trials']}")
        print(f"  mean baseline RMSE={summary['mean_baseline_rmse']:.6f}")
        print(f"  mean MoE RMSE={summary['mean_moe_rmse']:.6f}")
        print(f"  mean relative improvement={summary['mean_relative_improvement']:.3%}")
        print(f"  mean |learned threshold|={summary['mean_abs_threshold']:.6f}")
        print(
            "  routing="
            f"{summary['active_experts_per_sample']}/{summary['total_experts']} experts active"
        )


if __name__ == "__main__":
    main()
