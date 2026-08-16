from __future__ import annotations

from typing import Any


_HEX = frozenset("0123456789abcdef")


def _sha256(value: Any) -> bool:
    return (
        isinstance(value, str)
        and len(value) == 64
        and all(character in _HEX for character in value)
    )


def _nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _positive_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and value > 0


def assess_preoutcome_readiness(config: dict[str, Any]) -> dict[str, Any]:
    """Assess Weather-JEPA v1 readiness without loading data or outcomes.

    The function inspects only the machine-readable freeze/control surface. Any
    absent or malformed gate fails closed. It does not infer scientific choices
    that the frozen experiment matrix leaves unspecified.
    """

    if not isinstance(config, dict):
        raise TypeError("Weather-JEPA preoutcome freeze must be an object")

    checks: list[dict[str, Any]] = []
    blockers: list[dict[str, str]] = []

    def require(gate_id: str, passed: bool, detail: str) -> None:
        ok = passed is True
        checks.append({"id": gate_id, "passed": ok, "detail": detail})
        if not ok:
            blockers.append({"id": gate_id, "detail": detail})

    require(
        "protocol_identity",
        config.get("protocol_id") == "WEATHER-JEPA-V1"
        and config.get("protocol_state") == "PREOUTCOME_PROTOCOL_FROZEN",
        "protocol identity/state must match the frozen Weather-JEPA v1 study",
    )

    data = config.get("data") if isinstance(config.get("data"), dict) else {}
    require("data_license", data.get("license_verified") is True, "dataset license/usage compatibility must be verified")
    require("data_manifest", _sha256(data.get("data_manifest_sha256")), "DATA_MANIFEST.json SHA-256 must be pinned")
    require("split_manifest", _sha256(data.get("split_manifest_sha256")), "SPLIT_MANIFEST.json SHA-256 must be pinned")
    require("data_snapshot", _nonempty(data.get("exact_snapshot_id")), "exact ERA5/WeatherBench-compatible snapshot identity must be frozen")
    require("spatial_resolution", _nonempty(data.get("spatial_resolution")), "compact spatial resolution must be frozen")
    require("split_hashes", data.get("split_hashes_frozen") is True, "all train/validation/test split hashes must be frozen")

    method = config.get("method_definition") if isinstance(config.get("method_definition"), dict) else {}
    require(
        "normalized_l2_definition",
        _nonempty(method.get("normalized_l2_normalization_axis"))
        and _positive_number(method.get("normalized_l2_epsilon")),
        "normalized-L2 axis/reduction semantics and epsilon must be frozen before implementation/outcome training",
    )
    require(
        "variance_regularizer_definition",
        _nonempty(method.get("variance_regularizer_form"))
        and _positive_number(method.get("variance_regularizer_weight")),
        "variance/collapse regularizer form and a positive non-zero weight must be frozen",
    )
    require(
        "spatial_mask_definition",
        _nonempty(method.get("spatial_block_shape_rule"))
        and _nonempty(method.get("spatial_block_sampling_rule")),
        "spatial block shape and sampling rules must be frozen",
    )
    require(
        "temporal_mask_definition",
        _nonempty(method.get("temporal_future_block_rule")),
        "temporal future-block masking rule must be frozen",
    )
    require(
        "mask_ratio_selection",
        _nonempty(method.get("mask_ratio_selection_rule")),
        "selection rule for the preregistered mask-ratio grid must be frozen without outcome peeking",
    )

    budget = config.get("model_budget") if isinstance(config.get("model_budget"), dict) else {}
    require("model_budget_manifest", _sha256(budget.get("model_budget_sha256")), "MODEL_BUDGET.json SHA-256 must be pinned")
    require("parameter_budget", _positive_number(budget.get("exact_parameter_budget")), "exact trainable-parameter budget must be frozen")
    require("b3_matching_rule", budget.get("b3_matching_rule_frozen") is True, "B3 matched-budget/token rule must be frozen operationally")

    baselines = config.get("baselines") if isinstance(config.get("baselines"), dict) else {}
    for baseline in ("B0_PERSISTENCE", "B1_CLIMATOLOGY", "B2_RIDGE_AR", "B3_DIRECT_NEURAL"):
        state = baselines.get(baseline)
        require(
            f"{baseline.lower()}_implementation",
            isinstance(state, str) and state.startswith("IMPLEMENTED_"),
            f"{baseline} must be implemented and pre-outcome verified before scientific training",
        )

    execution = config.get("execution") if isinstance(config.get("execution"), dict) else {}
    require("environment_lock", _sha256(execution.get("environment_lock_sha256")), "ENVIRONMENT_LOCK.txt SHA-256 must be pinned")
    require("run_plan", _sha256(execution.get("run_plan_sha256")), "RUN_PLAN.json SHA-256 must be pinned")
    require("hardware_identity", _nonempty(execution.get("hardware_identity")), "training hardware/backend identity must be frozen")
    require("uncertainty_estimator", execution.get("uncertainty_estimator_frozen") is True, "bootstrap/t-interval choice and parameters must be frozen")
    require("raw_output_retention", _nonempty(execution.get("raw_output_retention_path")), "raw-output retention path/contract must be frozen")

    prerequisites_closed = len(blockers) == 0
    require(
        "scientific_training_authorization",
        config.get("scientific_outcome_training_authorized") is True,
        "scientific_outcome_training_authorized must be explicitly set true only after reviewed prerequisite closure",
    )

    return {
        "protocol_id": config.get("protocol_id"),
        "prerequisites_closed": prerequisites_closed,
        "scientific_outcome_training_authorized": config.get("scientific_outcome_training_authorized") is True,
        "ready_for_scientific_training": prerequisites_closed
        and config.get("scientific_outcome_training_authorized") is True,
        "blocker_count": len(blockers),
        "blockers": blockers,
        "checks": checks,
    }


def assert_scientific_training_authorized(config: dict[str, Any]) -> dict[str, Any]:
    assessment = assess_preoutcome_readiness(config)
    if not assessment["ready_for_scientific_training"]:
        blocker_ids = ", ".join(blocker["id"] for blocker in assessment["blockers"])
        suffix = f": {blocker_ids}" if blocker_ids else ""
        raise RuntimeError(f"WEATHER_JEPA_SCIENTIFIC_TRAINING_BLOCKED{suffix}")
    return assessment
