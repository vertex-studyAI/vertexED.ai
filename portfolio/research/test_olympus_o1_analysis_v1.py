#!/usr/bin/env python3
"""Synthetic contract tests for olympus_o1_analyze_v1.py.

Fixtures below are NOT Olympus experimental evidence and MUST NOT be cited as an
O1 outcome. They only exercise deterministic analysis and fail-closed parity.
"""
from copy import deepcopy

from olympus_o1_analyze_v1 import ARMS, analyze

FREEZE = "a" * 64


def row(task_id: str, arm: str, success: bool, falsification: bool = False, claim: bool = False):
    return {
        "protocol": "olympus-o1-v1",
        "task_id": task_id,
        "family": "synthetic-contract-test",
        "arm": arm,
        "source_revision": "deadbee",
        "execution_freeze_hash": FREEZE,
        "metrics": {
            "reliable_completion": success,
            "schema_valid": True,
            "unsupported_or_incorrect_claim": claim,
            "falsification_caught": falsification,
            "tool_execution_correct": True,
            "evidence_complete": True,
            "latency_seconds": 1.0,
            "token_use": 100,
            "peak_ram_bytes": 1,
        },
        "evidence": {"raw_output_path": "fixture", "tool_trace_path": "fixture", "verdict_path": "fixture"},
    }


def fixture(n: int = 100):
    rows = []
    for i in range(n):
        task = f"synthetic-{i:03d}"
        mono_success = i < 80
        full_success = i < 90
        for arm in ARMS:
            success = full_success if arm == "olympus_full_prometheus_perseus_hermes" else mono_success
            fals = arm == "olympus_full_prometheus_perseus_hermes" and i < 60
            claim = arm == "olympus_without_evidence_enforcement" and i < 20
            rows.append(row(task, arm, success, fals, claim))
    return rows


def test_analysis_is_deterministic():
    rows = fixture()
    assert analyze(deepcopy(rows)) == analyze(deepcopy(rows))


def test_positive_synthetic_fixture_does_not_change_protocol_constants():
    result = analyze(fixture())
    assert result["status"] == "ANALYZED_NOT_EXECUTED_BY_THIS_SCRIPT"
    assert result["task_count"] == 100
    assert result["bootstrap"]["resamples"] == 10_000
    assert result["bootstrap"]["seed"] == 20260829
    assert result["bootstrap"]["delta"] == 0.10
    assert result["gates"]["full_olympus"] is True


def test_budget_parity_fails_closed():
    rows = fixture()
    rows[1]["execution_freeze_hash"] = "b" * 64
    result = analyze(rows)
    assert result["status"] == "INVALID_BUDGET_PARITY"
    assert result["errors"]


def test_missing_arm_fails_closed():
    rows = fixture()
    rows.pop()
    try:
        analyze(rows)
    except ValueError as exc:
        assert "incomplete paired artifacts" in str(exc)
    else:
        raise AssertionError("missing arm must fail closed")
