#!/usr/bin/env python3
"""Fail-closed validator for TEMPORAL-JEPA-INTERVENTION-DUFFING-v1."""

from __future__ import annotations

import json
import math
from pathlib import Path


HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "manifest.json"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    data = json.loads(MANIFEST.read_text())

    require(data["protocol_id"] == "TEMPORAL-JEPA-INTERVENTION-DUFFING-v1", "protocol id drift")
    require(data["status"] == "PRE_OUTCOME_EXECUTION_NOT_AUTHORIZED", "status must remain pre-outcome")
    require(data["execution_authorized"] is False, "execution must remain unauthorized")

    params = data["system"]["parameters"]
    require(params == {"delta": 0.2, "alpha": -1.0, "beta": 1.0, "gamma": 0.3, "omega": 1.2}, "Duffing parameters drift")

    intervention = data["intervention"]
    require(intervention["type"] == "finite_duration_additive_step", "intervention type drift")
    require(math.isclose(float(intervention["amplitude"]), 0.25), "intervention amplitude drift")
    require(math.isclose(float(intervention["onset_time"]), 20.0), "intervention onset drift")
    require(math.isclose(float(intervention["duration"]), 1.0), "intervention duration drift")
    require(intervention["primary_zero_shot"] is True, "primary must remain zero-shot")

    numerics = data["numerics"]
    require(numerics["integrator"] == "rk4_fixed_step", "integrator drift")
    require(float(numerics["dt"]) > 0.0, "dt must be positive")
    require(float(numerics["trajectory_duration"]) > float(intervention["onset_time"]) + float(intervention["duration"]), "trajectory must extend beyond forcing")

    split = data["data"]
    require(int(split["intervention_examples_in_primary_training"]) == 0, "primary training leaked intervention examples")
    require(len({int(split["train_seed"]), int(split["validation_seed"]), int(split["test_seed"])}) == 3, "train/validation/test seeds must differ")
    require(int(split["train_trajectories"]) > 0, "missing train trajectories")
    require(int(split["validation_trajectories"]) > 0, "missing validation trajectories")
    require(int(split["nominal_test_trajectories"]) == int(split["intervention_test_trajectories"]), "paired test trajectory counts must match")

    models = data["models"]
    required = {
        "persistence",
        "linear_autoregressive_state",
        "matched_compute_next_state_mlp",
        "matched_compute_direct_prediction_representation",
    }
    require(required.issubset(set(models["required_baselines"])), "required baseline missing")
    require(models["intervention_specific_finetuning_primary"] is False, "primary intervention fine-tuning forbidden")

    probe = data["probe"]
    require(probe["type"] == "linear_state_readout", "primary probe drift")
    require(probe["fit_data"] == "nominal_training_only", "probe may only fit nominal training data")
    require(probe["nonlinear_probe_search"] is False, "nonlinear probe search forbidden")

    metric = data["primary_metric"]
    require(metric["name"] == "post_intervention_joint_state_nrmse", "primary metric drift")
    require(metric["window_start"] == "forcing_end", "recovery window must begin at forcing end")

    gate = data["success_gate"]
    require(gate["numeric_thresholds_frozen"] is False, "numeric thresholds unexpectedly marked frozen")
    require(gate["must_beat_persistence"] is True, "persistence comparison must remain required")
    require(gate["must_beat_matched_direct_representation_baseline"] is True, "matched baseline comparison must remain required")

    integrity = data["integrity"]
    for key in (
        "post_outcome_intervention_change_forbidden",
        "post_outcome_horizon_change_forbidden",
        "post_outcome_seed_deletion_forbidden",
        "rescue_tuning_forbidden",
        "retain_negative_and_mixed_results",
    ):
        require(integrity[key] is True, f"integrity lock disabled: {key}")

    blockers = data["authorization_blockers"]
    require(len(blockers) >= 6, "authorization blockers unexpectedly removed")

    print("PASS: intervention manifest remains pre-outcome, zero-shot, and execution-blocked")


if __name__ == "__main__":
    main()
