from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
PAPER_DIR = ROOT / "paper" / "ai4autosci2026"
MODULE_PATH = PAPER_DIR / "verify_paper_artifact.py"

spec = importlib.util.spec_from_file_location("verify_paper_artifact", MODULE_PATH)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def submission_state():
    return json.loads((PAPER_DIR / "SUBMISSION_STATE_V0.json").read_text())


def test_checked_in_preoutcome_state_is_accepted():
    assert module.verify_submission_state(submission_state()) == 10


@pytest.mark.parametrize(
    ("path", "value"),
    [
        (("manuscript", "quantitative_results_inserted"), True),
        (("manuscript", "superiority_claim_allowed"), True),
        (("esa_primary", "execution_authorized"), True),
        (("esa_primary", "outcome_access_authorized"), True),
        (("esa_primary", "model_outcomes_generated"), True),
        (("esa_primary", "retained_result_package_complete"), True),
        (("submission_gate", "scientifically_ready"), True),
        (("submission_gate", "results_section_ready"), True),
        (("submission_gate", "primary_endpoint_reconciled_to_freeze"), False),
    ],
)
def test_scientific_state_drift_fails_closed(path, value):
    state = copy.deepcopy(submission_state())
    state[path[0]][path[1]] = value
    with pytest.raises(ValueError):
        module.verify_submission_state(state)


def test_invalid_page_limit_fails_closed():
    state = copy.deepcopy(submission_state())
    state["venue"]["max_pages"] = True
    with pytest.raises(ValueError):
        module.verify_submission_state(state)


def test_page_count_parser_rejects_missing_or_zero_pages():
    assert module.parse_page_count("Title: x\nPages:          7\n") == 7
    with pytest.raises(ValueError):
        module.parse_page_count("Title: x\n")
    with pytest.raises(ValueError):
        module.parse_page_count("Pages: 0\n")


def test_source_guard_accepts_checked_in_manuscript():
    module.verify_source_text((PAPER_DIR / "main.tex").read_text())


def test_source_guard_rejects_author_identity_and_result_unblock():
    tex = (PAPER_DIR / "main.tex").read_text()
    with pytest.raises(ValueError):
        module.verify_source_text(tex + "\n\\thanks{Identifying affiliation}\n")
    with pytest.raises(ValueError):
        module.verify_source_text(tex + "\nRESULTS_UNBLOCKED\n")


def test_rendered_text_requires_preoutcome_markers():
    good = " ".join(
        [
            "Anonymous Authors",
            "RESULTS_BLOCKED_PRE_OUTCOME",
            "CHANNEL_RESULTS_BLOCKED_PRE_OUTCOME",
            "mission1-lite",
            "mission2-lite",
            "EW_F_0.50",
        ]
    )
    module.verify_rendered_text(good)
    with pytest.raises(ValueError):
        module.verify_rendered_text(good.replace("RESULTS_BLOCKED_PRE_OUTCOME", ""))


def test_rendered_text_accepts_extractor_separator_variants_only():
    extracted = " ".join(
        [
            "Anonymous Authors",
            "RESULTS _ BLOCKED _ PRE _ OUTCOME",
            "CHANNEL [] RESULTS [] BLOCKED [] PRE [] OUTCOME",
            "mission1 - lite",
            "mission2 - lite",
            "EW _ F _ 0 . 50",
        ]
    )
    module.verify_rendered_text(extracted)
