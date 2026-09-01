#!/usr/bin/env python3
"""Synthetic-only contract tests for olympus_o1_validate_manifest_v1.py."""
from copy import deepcopy

from olympus_o1_validate_manifest_v1 import validate


def fixture():
    rows = []
    for i in range(100):
        rows.append(
            {
                "task_id": f"synthetic-{i:03d}",
                "family": "family-a" if i < 50 else "family-b",
                "input": f"synthetic input {i}",
                "success_rubric": "synthetic deterministic rubric",
                "allowed_tools": ["synthetic-tool"],
                "evidence_requirements": ["synthetic-evidence"],
            }
        )
    return rows


def test_valid_shape_passes():
    result = validate(fixture())
    assert result["status"] == "VALID"
    assert result["task_count"] == 100
    assert result["family_counts"] == {"family-a": 50, "family-b": 50}


def test_wrong_task_count_fails():
    rows = fixture()[:-1]
    result = validate(rows)
    assert result["status"] == "INVALID"
    assert any("exactly 100" in error for error in result["errors"])


def test_duplicate_task_id_fails():
    rows = fixture()
    rows[1]["task_id"] = rows[0]["task_id"]
    result = validate(rows)
    assert result["status"] == "INVALID"
    assert any("duplicate task_id" in error for error in result["errors"])


def test_missing_required_field_fails():
    rows = fixture()
    del rows[0]["success_rubric"]
    result = validate(rows)
    assert result["status"] == "INVALID"
    assert any("missing fields" in error for error in result["errors"])


def test_two_family_imbalance_fails():
    rows = fixture()
    rows[49]["family"] = "family-b"
    result = validate(rows)
    assert result["status"] == "INVALID"
    assert any("at least 50" in error for error in result["errors"])


def test_extra_field_fails_closed():
    rows = deepcopy(fixture())
    rows[0]["posthoc_note"] = "must not silently enter frozen manifest"
    result = validate(rows)
    assert result["status"] == "INVALID"
    assert any("unexpected fields" in error for error in result["errors"])
