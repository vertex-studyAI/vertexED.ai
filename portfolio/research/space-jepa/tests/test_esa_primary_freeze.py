from __future__ import annotations

import json
from pathlib import Path

import pytest

from verify_esa_primary_endpoint import verify_freeze


ROOT = Path(__file__).resolve().parents[1]
FREEZE = ROOT / "ESA_PRIMARY_ENDPOINT_V0.json"


def test_checked_in_primary_freeze_passes_and_cannot_self_authorize() -> None:
    payload = verify_freeze(FREEZE)
    assert payload["authorization"]["execution_authorized"] is False
    assert payload["authorization"]["heldout_label_access_authorized"] is False
    assert payload["authorization"]["model_outcomes_generated"] is False


def test_metric_or_comparator_drift_fails_closed(tmp_path: Path) -> None:
    payload = json.loads(FREEZE.read_text(encoding="utf-8"))
    payload["benchmark"]["metric_key"] = "AFF_F_0.50"
    path = tmp_path / "bad-metric.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(ValueError, match="metric-key drift"):
        verify_freeze(path)

    payload = json.loads(FREEZE.read_text(encoding="utf-8"))
    payload["matched_baselines"] = ["persistence"]
    path = tmp_path / "bad-baseline.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(ValueError, match="comparator drift"):
        verify_freeze(path)


def test_seed_rule_or_authorization_drift_fails_closed(tmp_path: Path) -> None:
    payload = json.loads(FREEZE.read_text(encoding="utf-8"))
    payload["comparison"]["surface_success_requires"]["strictly_positive_seed_deltas_at_least"] = 3
    path = tmp_path / "bad-seed-rule.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(ValueError, match="seed-consistency gate drift"):
        verify_freeze(path)

    payload = json.loads(FREEZE.read_text(encoding="utf-8"))
    payload["authorization"]["execution_authorized"] = True
    path = tmp_path / "bad-auth.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(ValueError, match="self-authorize"):
        verify_freeze(path)


def test_post_outcome_statistical_rescue_cannot_be_added_to_v0(tmp_path: Path) -> None:
    payload = json.loads(FREEZE.read_text(encoding="utf-8"))
    payload["comparison"]["significance_test"] = "paired_t_test"
    path = tmp_path / "bad-stat.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(ValueError, match="significance test"):
        verify_freeze(path)
