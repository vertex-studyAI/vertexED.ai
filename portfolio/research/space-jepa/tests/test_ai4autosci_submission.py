import copy
import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "verify_ai4autosci_submission.py"
spec = importlib.util.spec_from_file_location("verify_ai4autosci_submission", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


def test_checked_in_package_is_safe_preoutcome_draft():
    state = module.load_state()
    tex = module.TEX_PATH.read_text(encoding="utf-8")
    assert module.verify_prep(state, tex) == []


def test_checked_in_package_is_not_submission_ready():
    state = module.load_state()
    tex = module.TEX_PATH.read_text(encoding="utf-8")
    errors = module.verify_submission(state, tex)
    assert errors
    assert any("SUBMISSION_READY" in error for error in errors)
    assert any("retained result package" in error for error in errors)


def test_localization_claim_requires_channel_evidence():
    state = copy.deepcopy(module.load_state())
    state["manuscript"]["status"] = "SUBMISSION_READY"
    state["manuscript"]["quantitative_results_inserted"] = True
    state["manuscript"]["localization_claim_allowed"] = True
    state["esa_primary"]["outcome_access_authorized"] = True
    state["esa_primary"]["retained_result_package_complete"] = True
    for key in state["submission_gate"]:
        state["submission_gate"][key] = True

    tex = module.TEX_PATH.read_text(encoding="utf-8")
    for marker in module.RESULT_MARKERS:
        tex = tex.replace(marker, "AUTHORIZED_RESULT_PLACEHOLDER_REMOVED")

    errors = module.verify_submission(state, tex)
    assert any("channel-aware authorization" in error for error in errors)
    assert any("channel result package" in error for error in errors)


def test_submission_gate_can_close_only_after_explicit_evidence_state():
    state = copy.deepcopy(module.load_state())
    state["manuscript"]["status"] = "SUBMISSION_READY"
    state["manuscript"]["quantitative_results_inserted"] = True
    state["esa_primary"]["outcome_access_authorized"] = True
    state["esa_primary"]["retained_result_package_complete"] = True
    for key in state["submission_gate"]:
        state["submission_gate"][key] = True

    tex = module.TEX_PATH.read_text(encoding="utf-8")
    for marker in module.RESULT_MARKERS:
        tex = tex.replace(marker, "AUTHORIZED_RESULT_PLACEHOLDER_REMOVED")

    assert module.verify_submission(state, tex) == []
