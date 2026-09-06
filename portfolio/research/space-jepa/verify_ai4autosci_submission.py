#!/usr/bin/env python3
"""Fail-closed checks for the Space-JEPA AI4AutoSci manuscript package.

This verifier deliberately separates a safe *pre-outcome draft* from an actually
*submission-ready* paper. Passing ``--mode prep`` is not scientific authorization.
``--mode submission`` remains red until retained outcome evidence and manuscript
reconciliation are explicitly recorded in SUBMISSION_STATE_V0.json.

The manuscript package is also bound to the independently frozen ESA primary
endpoint from PR #751. That binding prevents the paper from silently drifting to a
friendlier metric, comparator, seed rule, mission surface, or post-outcome rescue
criterion while the endpoint-control branch is still under review.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
PACKAGE = ROOT / "paper" / "ai4autosci2026"
STATE_PATH = PACKAGE / "SUBMISSION_STATE_V0.json"
TEX_PATH = PACKAGE / "main.tex"

RESULT_MARKERS = (
    "RESULTS\\_BLOCKED\\_PRE\\_OUTCOME",
    "CHANNEL\\_RESULTS\\_BLOCKED\\_PRE\\_OUTCOME",
)

EXPECTED_ENDPOINT_SOURCE = {
    "pull_request": 751,
    "head_sha": "751a788e36d082ba96b0513289afb59e64ccef2f",
    "path": "portfolio/research/space-jepa/ESA_PRIMARY_ENDPOINT_V0.json",
    "blob_sha": "d6f0d48494271f1fb02f23cf6b554f8d2d12be3a",
}
EXPECTED_BENCHMARK = {
    "name": "ESA-ADB",
    "upstream_commit": "aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33",
    "esascores_source_path": "timeeval/metrics/ESA_ADB_metrics.py",
    "esascores_source_git_blob": "dbfe1e20b121012f1f144cff1303710b98ed0df5",
    "metric_view": "anomaly_only",
    "metric_key": "EW_F_0.50",
    "beta": 0.5,
    "direction": "higher_is_better",
}
EXPECTED_SURFACES = ["mission1-lite", "mission2-lite"]
EXPECTED_SEEDS = [17, 29, 43, 71, 101]
EXPECTED_BASELINES = ["robust_zscore", "persistence"]


def load_state(path: Path = STATE_PATH) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("submission state must be a JSON object")
    return data


def _require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def verify_primary_endpoint_binding(primary: dict[str, Any], gate: dict[str, Any]) -> list[str]:
    """Verify exact manuscript-to-preregistration binding without reading outcomes."""

    errors: list[str] = []
    comparison = primary.get("comparison", {})

    _require(primary.get("endpoint_freeze_source") == EXPECTED_ENDPOINT_SOURCE,
             "ESA endpoint freeze source identity drifted", errors)
    _require(primary.get("benchmark") == EXPECTED_BENCHMARK,
             "ESA official primary metric/source binding drifted", errors)
    _require(primary.get("surfaces") == EXPECTED_SURFACES,
             "ESA primary mission surfaces drifted", errors)
    _require(primary.get("seeds") == EXPECTED_SEEDS,
             "ESA primary seed set drifted", errors)
    _require(primary.get("matched_baselines") == EXPECTED_BASELINES,
             "ESA matched baseline family drifted", errors)

    _require(comparison.get("surface_aggregation") == "arithmetic_mean_of_five_paired_seed_deltas",
             "ESA primary seed aggregation drifted", errors)
    _require(comparison.get("mean_paired_delta_strictly_greater_than") == 0.0,
             "ESA primary mean-delta decision threshold drifted", errors)
    _require(comparison.get("strictly_positive_seed_deltas_at_least") == 4,
             "ESA primary seed-consistency rule drifted", errors)
    _require(comparison.get("required_seed_count") == 5,
             "ESA primary required seed count drifted", errors)
    _require(comparison.get("ties_are_wins") is False,
             "ESA primary tie handling drifted", errors)
    _require(comparison.get("overall_success") == "conjunction across mission1-lite and mission2-lite",
             "ESA primary cross-mission conjunction drifted", errors)
    _require(comparison.get("practical_effect_threshold") is None,
             "post-outcome practical-effect threshold is forbidden for ESA primary", errors)
    _require(comparison.get("significance_test") is None,
             "post-outcome significance test is forbidden for ESA primary", errors)
    _require(comparison.get("missing_or_failed_seed_policy") ==
             "fail_closed; do not drop, replace, or selectively rerun a seed",
             "ESA missing/failed-seed policy drifted", errors)
    _require(primary.get("secondary_cannot_rescue_primary") is True,
             "secondary results must not be allowed to rescue ESA primary failure", errors)
    _require(gate.get("primary_endpoint_reconciled_to_freeze") is True,
             "submission package does not record endpoint reconciliation", errors)

    return errors


def verify_prep(state: dict[str, Any], tex: str) -> list[str]:
    """Verify that the checked-in manuscript is a safe pre-outcome draft."""

    errors: list[str] = []
    venue = state.get("venue", {})
    manuscript = state.get("manuscript", {})
    primary = state.get("esa_primary", {})
    channel = state.get("esa_channel_secondary", {})
    plasticc = state.get("plasticc_optional", {})
    gate = state.get("submission_gate", {})

    _require(state.get("schema_version") == 2, "submission state schema must be endpoint-bound v2", errors)
    _require(venue.get("double_blind") is True, "venue must remain double-blind", errors)
    _require(venue.get("max_pages") == 10, "frozen workshop max_pages must be 10", errors)
    _require(venue.get("submission_deadline_date") == "2026-10-31", "unexpected workshop deadline date", errors)
    _require("Anonymous Authors" in tex, "pre-outcome manuscript must use anonymous author placeholder", errors)

    _require(manuscript.get("status") == "DRAFT_PRE_OUTCOME", "pre-outcome manuscript status drifted", errors)
    _require(manuscript.get("quantitative_results_inserted") is False, "results cannot be marked inserted in prep mode", errors)
    _require(manuscript.get("superiority_claim_allowed") is False, "superiority claim cannot be enabled pre-outcome", errors)
    _require(manuscript.get("localization_claim_allowed") is False, "localization claim cannot be enabled pre-outcome", errors)

    errors.extend(verify_primary_endpoint_binding(primary, gate))
    _require(primary.get("threshold_quantile") == 0.995, "ESA global threshold quantile drifted", errors)
    _require(primary.get("outcome_access_authorized") is False, "ESA held-out outcome access unexpectedly authorized", errors)
    _require(primary.get("execution_authorized") is False, "ESA execution unexpectedly authorized", errors)
    _require(primary.get("model_outcomes_generated") is False, "ESA model outcomes unexpectedly marked generated", errors)
    _require(primary.get("retained_result_package_complete") is False, "ESA result package cannot be complete before execution", errors)

    _require(channel.get("ridge_alpha") == 1.0, "channel-probe ridge alpha drifted", errors)
    _require(channel.get("probe_fit_stride") == 4, "channel-probe fit stride drifted", errors)
    _require(channel.get("score_stride") == 1, "channel-probe score stride drifted", errors)
    _require(channel.get("batch_size") == 128, "channel-probe batch size drifted", errors)
    _require(channel.get("threshold_quantile") == 0.995, "channel threshold quantile drifted", errors)
    _require(channel.get("outcome_access_authorized") is False, "channel-aware outcome access unexpectedly authorized", errors)

    _require(plasticc.get("simulated") is True, "PLAsTiCC must remain explicitly marked simulated", errors)
    _require(plasticc.get("publicly_unblinded") is True, "PLAsTiCC public/unblinded status must remain explicit", errors)
    _require(plasticc.get("real_sky_validation_claim_allowed") is False, "PLAsTiCC cannot authorize a real-sky claim", errors)
    _require(plasticc.get("seeds") == [11, 23, 37, 53, 71], "PLAsTiCC seed set drifted", errors)
    _require(plasticc.get("practical_effect_threshold") == 0.02, "PLAsTiCC practical-effect threshold drifted", errors)
    _require(plasticc.get("bootstrap_replicates") == 10000, "PLAsTiCC bootstrap count drifted", errors)
    _require(plasticc.get("bootstrap_seed") == 20260906, "PLAsTiCC bootstrap seed drifted", errors)

    _require(gate.get("scientifically_ready") is False, "prep package must not self-certify scientific readiness", errors)
    _require(gate.get("results_section_ready") is False, "prep package must not self-certify results readiness", errors)

    for marker in RESULT_MARKERS:
        _require(marker in tex, f"required pre-outcome blocker marker missing: {marker}", errors)

    _require("EW\\_F\\_0.50" in tex, "manuscript must name the frozen ESA primary metric", errors)
    _require("mission1-lite" in tex and "mission2-lite" in tex,
             "manuscript must name both frozen ESA primary mission surfaces", errors)
    _require("4/5" in tex, "manuscript must state the frozen per-mission seed-consistency rule", errors)
    _require("conjunction" in tex.lower(), "manuscript must state the frozen cross-mission conjunction", errors)

    return errors


def verify_submission(state: dict[str, Any], tex: str) -> list[str]:
    """Verify the explicit state needed before producing the submission PDF.

    This function does not authorize scientific execution. It only verifies that
    the repository records the evidence gates as closed and that the manuscript no
    longer contains pre-outcome result blockers.
    """

    errors: list[str] = []
    manuscript = state.get("manuscript", {})
    primary = state.get("esa_primary", {})
    channel = state.get("esa_channel_secondary", {})
    gate = state.get("submission_gate", {})

    errors.extend(verify_primary_endpoint_binding(primary, gate))
    _require("Anonymous Authors" in tex, "double-blind submission must remain anonymous", errors)
    _require(manuscript.get("status") == "SUBMISSION_READY", "manuscript status is not SUBMISSION_READY", errors)
    _require(manuscript.get("quantitative_results_inserted") is True, "quantitative results are not recorded as inserted", errors)
    _require(primary.get("execution_authorized") is True, "ESA primary execution is not recorded as independently authorized", errors)
    _require(primary.get("outcome_access_authorized") is True, "ESA primary outcome access is not recorded as independently authorized", errors)
    _require(primary.get("model_outcomes_generated") is True, "ESA primary model outcomes are not recorded as generated", errors)
    _require(primary.get("retained_result_package_complete") is True, "ESA primary retained result package is incomplete", errors)

    for key in (
        "scientifically_ready",
        "double_blind_ready",
        "results_section_ready",
        "claims_reconciled_to_evidence",
        "primary_endpoint_reconciled_to_freeze",
        "final_page_count_checked",
        "official_submission_portal_checked",
    ):
        _require(gate.get(key) is True, f"submission gate is not closed: {key}", errors)

    for marker in RESULT_MARKERS:
        _require(marker not in tex, f"pre-outcome blocker marker remains in submission manuscript: {marker}", errors)

    if manuscript.get("localization_claim_allowed") is True:
        _require(channel.get("outcome_access_authorized") is True, "localization language enabled without channel-aware authorization", errors)
        _require(channel.get("retained_result_package_complete") is True, "localization language enabled without retained channel result package", errors)

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("prep", "submission"), default="prep")
    parser.add_argument("--state", type=Path, default=STATE_PATH)
    parser.add_argument("--tex", type=Path, default=TEX_PATH)
    args = parser.parse_args()

    state = load_state(args.state)
    tex = args.tex.read_text(encoding="utf-8")
    errors = verify_prep(state, tex) if args.mode == "prep" else verify_submission(state, tex)

    if errors:
        print(f"AI4AutoSci {args.mode} verification: FAIL")
        for error in errors:
            print(f"- {error}")
        return 2

    print(f"AI4AutoSci {args.mode} verification: PASS")
    if args.mode == "prep":
        print("PASS means the draft is safely pre-outcome and endpoint-bound; it is not execution or submission authorization.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
