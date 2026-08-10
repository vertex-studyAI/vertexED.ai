from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
import json
import math
import random
from statistics import mean

from .model import fit_local_operator, periodic_laplacian, rmse


@dataclass(frozen=True)
class TrialResult:
    seed: int
    task: str
    learned_coefficient: float
    persistence_rmse: float
    operator_rmse: float
    relative_improvement: float
    stencil_width: int
    grid_size: int


def _initial_state(rng: random.Random, n: int) -> list[float]:
    phase1 = rng.uniform(-math.pi, math.pi)
    phase2 = rng.uniform(-math.pi, math.pi)
    amp1 = rng.uniform(0.6, 1.4)
    amp2 = rng.uniform(0.1, 0.5)
    return [
        amp1 * math.sin(2 * math.pi * i / n + phase1)
        + amp2 * math.sin(6 * math.pi * i / n + phase2)
        for i in range(n)
    ]


def _advance(
    state: list[float],
    alpha: float,
    rng: random.Random,
    noise_std: float,
) -> list[float]:
    lap = periodic_laplacian(state)
    return [u + alpha * l + rng.gauss(0.0, noise_std) for u, l in zip(state, lap)]


def make_transitions(
    seed: int,
    task: str,
    *,
    samples: int = 140,
    grid_size: int = 32,
) -> tuple[list[list[float]], list[list[float]]]:
    rng = random.Random(seed)
    alpha = 0.18 if task == "diffusion" else 0.0
    noise_std = 0.005
    states = []
    next_states = []
    for _ in range(samples):
        state = _initial_state(rng, grid_size)
        nxt = _advance(state, alpha, rng, noise_std)
        states.append(state)
        next_states.append(nxt)
    return states, next_states


def run_trial(seed: int, task: str) -> TrialResult:
    states, next_states = make_transitions(seed, task)
    cut = int(0.7 * len(states))
    train_x, train_y = states[:cut], next_states[:cut]
    test_x, test_y = states[cut:], next_states[cut:]

    operator = fit_local_operator(train_x, train_y)
    persistence = [list(state) for state in test_x]
    prediction = [operator.predict(state) for state in test_x]

    base_rmse = rmse(test_y, persistence)
    op_rmse = rmse(test_y, prediction)
    improvement = (base_rmse - op_rmse) / base_rmse if base_rmse else 0.0

    return TrialResult(
        seed=seed,
        task=task,
        learned_coefficient=operator.coefficient,
        persistence_rmse=base_rmse,
        operator_rmse=op_rmse,
        relative_improvement=improvement,
        stencil_width=operator.stencil_width,
        grid_size=len(test_x[0]),
    )


def summarize(results: list[TrialResult]) -> dict:
    return {
        "trials": len(results),
        "mean_learned_coefficient": mean(r.learned_coefficient for r in results),
        "mean_persistence_rmse": mean(r.persistence_rmse for r in results),
        "mean_operator_rmse": mean(r.operator_rmse for r in results),
        "mean_relative_improvement": mean(r.relative_improvement for r in results),
        "stencil_width": results[0].stencil_width if results else None,
        "grid_size": results[0].grid_size if results else None,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seeds", type=int, default=20)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    output = {}
    for task in ("diffusion", "zero_diffusion"):
        results = [run_trial(seed, task) for seed in range(args.seeds)]
        output[task] = {
            "summary": summarize(results),
            "trials": [asdict(r) for r in results],
        }

    if args.json:
        print(json.dumps(output, indent=2, sort_keys=True))
        return

    for task, data in output.items():
        s = data["summary"]
        print(f"{task}:")
        print(f"  trials={s['trials']}")
        print(f"  mean learned coefficient={s['mean_learned_coefficient']:.6f}")
        print(f"  mean persistence RMSE={s['mean_persistence_rmse']:.6f}")
        print(f"  mean operator RMSE={s['mean_operator_rmse']:.6f}")
        print(f"  mean relative improvement={s['mean_relative_improvement']:.3%}")
        print(f"  locality={s['stencil_width']}-point stencil on {s['grid_size']}-point grid")


if __name__ == "__main__":
    main()
