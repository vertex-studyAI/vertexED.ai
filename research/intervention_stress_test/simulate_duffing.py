#!/usr/bin/env python3
"""Deterministic forced-Duffing simulator for the preregistered intervention test.

This script produces trajectories only. It does not instantiate or evaluate any learned
model and therefore does not authorize or create a scientific model outcome.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Tuple

State = Tuple[float, float]


def load_manifest(path: Path) -> Dict:
    data = json.loads(path.read_text())
    if data.get("protocol_id") != "TEMPORAL-JEPA-INTERVENTION-DUFFING-v1":
        raise ValueError("unexpected protocol_id")
    return data


def control_fn(t: float, intervention: Dict, enabled: bool) -> float:
    if not enabled:
        return 0.0
    onset = float(intervention["onset_time"])
    duration = float(intervention["duration"])
    if onset <= t < onset + duration:
        return float(intervention["amplitude"])
    return float(intervention["post_intervention_control"])


def derivative(t: float, state: State, params: Dict, u: float) -> State:
    x, v = state
    delta = float(params["delta"])
    alpha = float(params["alpha"])
    beta = float(params["beta"])
    gamma = float(params["gamma"])
    omega = float(params["omega"])
    dx = v
    dv = -delta * v - alpha * x - beta * (x ** 3) + gamma * math.cos(omega * t) + u
    return dx, dv


def rk4_step(t: float, state: State, dt: float, params: Dict, control: Callable[[float], float]) -> State:
    def add(s: State, k: State, scale: float) -> State:
        return s[0] + scale * k[0], s[1] + scale * k[1]

    k1 = derivative(t, state, params, control(t))
    s2 = add(state, k1, dt / 2.0)
    k2 = derivative(t + dt / 2.0, s2, params, control(t + dt / 2.0))
    s3 = add(state, k2, dt / 2.0)
    k3 = derivative(t + dt / 2.0, s3, params, control(t + dt / 2.0))
    s4 = add(state, k3, dt)
    k4 = derivative(t + dt, s4, params, control(t + dt))

    return (
        state[0] + (dt / 6.0) * (k1[0] + 2.0 * k2[0] + 2.0 * k3[0] + k4[0]),
        state[1] + (dt / 6.0) * (k1[1] + 2.0 * k2[1] + 2.0 * k3[1] + k4[1]),
    )


def initial_conditions(rng: random.Random, box: Dict, count: int) -> Iterable[State]:
    for _ in range(count):
        yield (
            rng.uniform(float(box["x_min"]), float(box["x_max"])),
            rng.uniform(float(box["v_min"]), float(box["v_max"])),
        )


def simulate_one(manifest: Dict, state0: State, intervention_enabled: bool) -> Dict:
    params = manifest["system"]["parameters"]
    numerics = manifest["numerics"]
    intervention = manifest["intervention"]
    dt = float(numerics["dt"])
    duration = float(numerics["trajectory_duration"])
    steps_float = duration / dt
    steps = int(round(steps_float))
    if not math.isclose(steps * dt, duration, rel_tol=0.0, abs_tol=1e-12):
        raise ValueError("trajectory_duration must be an integer multiple of dt")

    control = lambda time: control_fn(time, intervention, intervention_enabled)
    state = state0
    rows: List[List[float]] = []

    for i in range(steps + 1):
        t = i * dt
        u = control(t)
        rows.append([t, state[0], state[1], u])
        if i < steps:
            state = rk4_step(t, state, dt, params, control)
            if not (math.isfinite(state[0]) and math.isfinite(state[1])):
                raise FloatingPointError(f"non-finite state at step {i}")

    return {
        "initial_state": [state0[0], state0[1]],
        "intervention_enabled": intervention_enabled,
        "columns": ["t", "x", "v", "u"],
        "rows": rows,
    }


def split_specs(manifest: Dict) -> List[Tuple[str, int, int, bool]]:
    data = manifest["data"]
    return [
        ("train_nominal", int(data["train_seed"]), int(data["train_trajectories"]), False),
        ("validation_nominal", int(data["validation_seed"]), int(data["validation_trajectories"]), False),
        ("test_nominal", int(data["test_seed"]), int(data["nominal_test_trajectories"]), False),
        ("test_intervention", int(data["test_seed"]), int(data["intervention_test_trajectories"]), True),
    ]


def write_jsonl(path: Path, records: Iterable[Dict]) -> str:
    digest = hashlib.sha256()
    with path.open("wb") as handle:
        for record in records:
            line = (json.dumps(record, separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")
            handle.write(line)
            digest.update(line)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("manifest.json"))
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    manifest = load_manifest(args.manifest)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    box = manifest["data"]["initial_condition_box"]

    ledger = {
        "protocol_id": manifest["protocol_id"],
        "manifest_sha256": hashlib.sha256(args.manifest.read_bytes()).hexdigest(),
        "execution_authorized": manifest["execution_authorized"],
        "model_outcomes_created": False,
        "splits": {},
    }

    for name, seed, count, intervention_enabled in split_specs(manifest):
        rng = random.Random(seed)
        states = list(initial_conditions(rng, box, count))

        # Nominal and intervention test sets intentionally share the frozen test initial
        # conditions so the intervention effect can be compared trajectory-by-trajectory.
        records = (
            {
                "trajectory_id": f"{name}-{idx:04d}",
                **simulate_one(manifest, state0, intervention_enabled),
            }
            for idx, state0 in enumerate(states)
        )
        output_path = args.output_dir / f"{name}.jsonl"
        sha256 = write_jsonl(output_path, records)
        ledger["splits"][name] = {
            "seed": seed,
            "trajectory_count": count,
            "intervention_enabled": intervention_enabled,
            "path": output_path.name,
            "sha256": sha256,
        }

    ledger_path = args.output_dir / "dataset_ledger.json"
    ledger_path.write_text(json.dumps(ledger, indent=2, sort_keys=True) + "\n")
    print(json.dumps(ledger, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
