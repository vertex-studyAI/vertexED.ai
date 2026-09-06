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


def test_primary_endpoint_metric_drift_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["benchmark"]["metric_key"] = "AFF_F_0.50"
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("primary metric/source binding drifted" in error for error in errors)


def test_primary_endpoint_surface_drift_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["surfaces"] = ["mission1-lite"]
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("mission surfaces drifted" in error for error in errors)


def test_primary_endpoint_comparator_drift_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["matched_baselines"] = ["robust_zscore"]
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("baseline family drifted" in error for error in errors)


def test_primary_endpoint_postoutcome_rescue_threshold_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["comparison"]["practical_effect_threshold"] = 0.01
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("practical-effect threshold is forbidden" in error for error in errors)


def test_primary_endpoint_seed_consistency_drift_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["comparison"]["strictly_positive_seed_deltas_at_least"] = 3
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("seed-consistency rule drifted" in error for error in errors)


def test_primary_endpoint_source_identity_drift_fails_closed():
    state = copy.deepcopy(module.load_state())
    state["esa_primary"]["endpoint_freeze_source"]["head_sha"] = "0" * 40
    errors = module.verify_prep(state, module.TEX_PATH.read_text(encoding="utf-8"))
    assert any("freeze source identity drifted" in error for error in errors)
