#!/usr/bin/env python3
"""Fail-closed checks for the Space-JEPA AI4AutoSci manuscript package.

This verifier deliberately separates a safe *pre-outcome draft* from an actually
*submission-ready* paper. Passing ``--mode prep`` is not scientific authorization.
``--mode submission`` remains red until retained outcome evidence and manuscript
reconciliation are explicitly recorded in SUBMISSION_STATE_V0.json.
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


def load_state(path: Path = STATE_PATH) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("submission state must be a JSON object")
    return data


def _require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def verify_prep(state: dict[str, Any], tex: str) -> list[str]:
    """Verify that the checked-in manuscript is a safe pre-outcome draft."""

    errors: list[str] = []
    venue = state.get("venue", {})
    manuscript = state.get("manuscript", {})
    primary = state.get("esa_primary", {})
    channel = state.get("esa_channel_secondary", {})
    plasticc = state.get("plasticc_optional", {})
    gate = state.get("submission_gate", {})

    _require(venue.get("double_blind") is True, "venue must remain double-blind", errors)
    _require(venue.get("max_pages") == 10, "frozen workshop max_pages must be 10", errors)
    _require(venue.get("submission_deadline_date") == "2026-10-31", "unexpected workshop deadline date", errors)
    _require("Anonymous Authors" in tex, "pre-outcome manuscript must use anonymous author placeholder", errors)

    _require(manuscript.get("status") == "DRAFT_PRE_OUTCOME", "pre-outcome manuscript status drifted", errors)
    _require(manuscript.get("quantitative_results_inserted") is False, "results cannot be marked inserted in prep mode", errors)
    _require(manuscript.get("superiority_claim_allowed") is False, "superiority claim cannot be enabled pre-outcome", errors)
    _require(manuscript.get("localization_claim_allowed") is False, "localization claim cannot be enabled pre-outcome", errors)

    _require(primary.get("seeds") == [17, 29, 43, 71, 101], "ESA primary seed set drifted", errors)
    _require(primary.get("threshold_quantile") == 0.995, "ESA global threshold quantile drifted", errors)
    _require(primary.get("outcome_access_authorized") is False, "ESA held-out outcome access unexpectedly authorized", errors)
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

    _require("Anonymous Authors" in tex, "double-blind submission must remain anonymous", errors)
    _require(manuscript.get("status") == "SUBMISSION_READY", "manuscript status is not SUBMISSION_READY", errors)
    _require(manuscript.get("quantitative_results_inserted") is True, "quantitative results are not recorded as inserted", errors)
    _require(primary.get("outcome_access_authorized") is True, "ESA primary outcome access is not recorded as independently authorized", errors)
    _require(primary.get("retained_result_package_complete") is True, "ESA primary retained result package is incomplete", errors)

    for key in (
        "scientifically_ready",
        "double_blind_ready",
        "results_section_ready",
        "claims_reconciled_to_evidence",
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
        print("PASS means the draft is safely pre-outcome; it is not execution or submission authorization.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
