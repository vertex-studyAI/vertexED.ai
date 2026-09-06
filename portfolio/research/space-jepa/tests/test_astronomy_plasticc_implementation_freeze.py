from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[2]
MODULE_PATH = ROOT / "verify_astronomy_plasticc_implementation.py"
FREEZE_PATH = ROOT / "ASTRONOMY_PLASTICC_IMPLEMENTATION_FREEZE_V0.json"

spec = importlib.util.spec_from_file_location("verify_astronomy_plasticc_implementation", MODULE_PATH)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
FreezeError = module.FreezeError
verify = module.verify


def _freeze() -> dict:
    return json.loads(FREEZE_PATH.read_text(encoding="utf-8"))


def test_repository_implementation_freeze_is_exact_byte_bound_and_non_authorizing() -> None:
    result = verify(_freeze(), repo_root=REPO_ROOT)
    assert result["status"] == "PLASTICC_IMPLEMENTATION_FREEZE_VERIFIED_NOT_AUTHORIZED"
    assert result["implementation_git_blob_sha1"] == "317a107a549bc67e703a880f564e940fbe5c63e6"
    assert result["regression_git_blob_sha1"] == "67d79726c99dacdc2fd102ae0e363320a635ce17"
    assert result["execution_authorized"] is False


def test_freeze_cannot_authorize_execution_or_heldout_labels() -> None:
    for field in ("execution_authorized", "heldout_label_access_authorized", "model_outcomes_generated"):
        payload = _freeze()
        payload[field] = True
        with pytest.raises(FreezeError):
            verify(payload, repo_root=REPO_ROOT)


def test_readout_hyperparameters_and_parser_surface_cannot_drift() -> None:
    payload = _freeze()
    payload["probability_readout"]["steps"] = 100
    with pytest.raises(FreezeError, match="readout"):
        verify(payload, repo_root=REPO_ROOT)

    payload = _freeze()
    payload["outcome_blind_parser"]["accepted_columns_exact_set"].append("target")
    with pytest.raises(FreezeError, match="column surface"):
        verify(payload, repo_root=REPO_ROOT)

    payload = _freeze()
    payload["outcome_blind_parser"]["reject_any_extra_column"] = False
    with pytest.raises(FreezeError, match="reject every extra"):
        verify(payload, repo_root=REPO_ROOT)


def test_declared_source_byte_identity_cannot_drift() -> None:
    payload = _freeze()
    payload["implementation"]["git_blob_sha1"] = "0" * 40
    with pytest.raises(FreezeError, match="implementation byte identity drift"):
        verify(payload, repo_root=REPO_ROOT)

    payload = _freeze()
    payload["regression_suite"]["git_blob_sha1"] = "0" * 40
    with pytest.raises(FreezeError, match="regression byte identity drift"):
        verify(payload, repo_root=REPO_ROOT)
