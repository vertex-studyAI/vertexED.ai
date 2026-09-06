#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Mapping

EXPECTED_IMPLEMENTATION = "portfolio/research/space-jepa/space_jepa/plasticc.py"
EXPECTED_REGRESSION = "portfolio/research/space-jepa/tests/test_astronomy_plasticc_readout_parser.py"
EXPECTED_COLUMNS = ["detected", "flux", "flux_err", "mjd", "object_id", "passband"]


class FreezeError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise FreezeError(message)


def mapping(value: Any, name: str) -> Mapping[str, Any]:
    require(isinstance(value, Mapping), f"{name} must be an object")
    return value


def git_blob_sha1(path: Path) -> str:
    data = path.read_bytes()
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def verify(freeze: Mapping[str, Any], *, repo_root: Path) -> dict[str, Any]:
    require(freeze.get("schema_version") == 1, "schema_version drift")
    require(freeze.get("freeze_id") == "space-jepa-plasticc-readout-parser-v0-20260906", "freeze_id drift")
    require(freeze.get("status") == "PRE_OUTCOME_IMPLEMENTATION_FROZEN_NOT_AUTHORIZED", "freeze must remain non-authorizing")
    require(freeze.get("execution_authorized") is False, "freeze must not authorize execution")
    require(freeze.get("heldout_label_access_authorized") is False, "freeze must not authorize heldout label access")
    require(freeze.get("model_outcomes_generated") is False, "freeze must remain pre-outcome")

    implementation = mapping(freeze.get("implementation"), "implementation")
    regression = mapping(freeze.get("regression_suite"), "regression_suite")
    require(implementation.get("path") == EXPECTED_IMPLEMENTATION, "implementation path drift")
    require(regression.get("path") == EXPECTED_REGRESSION, "regression path drift")
    require(regression.get("fixtures") == "synthetic_only", "regression evidence must remain synthetic-only")

    implementation_path = repo_root / EXPECTED_IMPLEMENTATION
    regression_path = repo_root / EXPECTED_REGRESSION
    require(implementation_path.is_file(), "implementation file missing")
    require(regression_path.is_file(), "regression file missing")
    observed_impl = git_blob_sha1(implementation_path)
    observed_test = git_blob_sha1(regression_path)
    require(observed_impl == implementation.get("git_blob_sha1"), "implementation byte identity drift")
    require(observed_test == regression.get("git_blob_sha1"), "regression byte identity drift")

    readout = mapping(freeze.get("probability_readout"), "probability_readout")
    expected_readout = {
        "architecture": "single_affine_softmax_layer",
        "input": "frozen_object_level_representation",
        "standardization": "development_fit_mean_and_population_std_only",
        "class_weighting": "equal_total_weight_per_development_class",
        "optimizer": "deterministic_full_batch_gradient_descent",
        "learning_rate": 0.1,
        "l2_weight_penalty": 0.0001,
        "bias_regularized": False,
        "steps": 2000,
        "early_stopping": False,
        "minimum_development_objects_per_class": 2,
        "class_order": "sorted_unique_development_labels",
        "heldout_input_to_fit_authorized": False,
        "heldout_label_input_to_fit_authorized": False,
    }
    require(dict(readout) == expected_readout, "probability readout freeze drift")

    parser = mapping(freeze.get("outcome_blind_parser"), "outcome_blind_parser")
    require(parser.get("accepted_columns_exact_set") == EXPECTED_COLUMNS, "outcome-blind parser column surface drift")
    require(parser.get("reject_any_extra_column") is True, "parser must reject every extra column")
    require(parser.get("returns_labels") is False, "parser must never return labels")
    require(parser.get("grouping_unit") == "object_id", "parser grouping unit drift")
    require(parser.get("within_object_order") == "ascending_mjd", "parser ordering drift")

    boundary = str(freeze.get("scientific_boundary", "")).lower()
    for term in ("synthetic", "does not establish plasticc freshness", "scientific performance", "execution authorization"):
        require(term in boundary, f"scientific boundary missing {term}")

    return {
        "status": "PLASTICC_IMPLEMENTATION_FREEZE_VERIFIED_NOT_AUTHORIZED",
        "implementation_git_blob_sha1": observed_impl,
        "regression_git_blob_sha1": observed_test,
        "accepted_columns": EXPECTED_COLUMNS,
        "execution_authorized": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "freeze",
        type=Path,
        nargs="?",
        default=Path(__file__).with_name("ASTRONOMY_PLASTICC_IMPLEMENTATION_FREEZE_V0.json"),
    )
    args = parser.parse_args()
    repo_root = Path(__file__).resolve().parents[3]
    try:
        payload = json.loads(args.freeze.read_text(encoding="utf-8"))
        result = verify(payload, repo_root=repo_root)
    except (OSError, json.JSONDecodeError, FreezeError) as exc:
        print(f"FAIL: {exc}")
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
