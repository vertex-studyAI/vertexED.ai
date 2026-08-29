#!/usr/bin/env python3
"""Fail-closed validator for the NPMS successor execution authorization.

This validator checks only authorization completeness and integrity boundaries. It
never evaluates scientific outcomes and cannot authorize execution when any
required identity or threshold is missing.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REQUIRED_ARMS = {
    "NPMS",
    "PARAMETER",
    "STATE_SPACE",
    "SPECTRAL_CONTROL",
    "COMBINED_CONTROL",
}


def fail(message: str) -> None:
    raise SystemExit(f"BLOCKED: {message}")


def require_present(value, field: str) -> None:
    if value is None or value == "" or value == [] or value == {}:
        fail(f"missing required field: {field}")


def require_sha256(value, field: str) -> None:
    require_present(value, field)
    if not isinstance(value, str) or not SHA256_RE.fullmatch(value):
        fail(f"{field} must be a lowercase 64-hex SHA-256")


def validate(doc: dict) -> None:
    if doc.get("protocol") != "NPMS_SUCCESSOR_PREREGISTRATION_V1_20260829":
        fail("unexpected protocol identity")

    if doc.get("held_out_outcomes_accessed") is not False:
        fail("held-out outcomes must remain inaccessible at authorization time")

    require_present(doc.get("canonical_source_commit"), "canonical_source_commit")
    source_commit = doc["canonical_source_commit"]
    if not isinstance(source_commit, str) or not re.fullmatch(r"[0-9a-f]{40}", source_commit):
        fail("canonical_source_commit must be a 40-hex Git commit")

    dataset = doc.get("dataset")
    if not isinstance(dataset, dict):
        fail("dataset must be an object")
    require_present(dataset.get("name"), "dataset.name")
    require_present(dataset.get("version"), "dataset.version")
    require_sha256(dataset.get("sha256"), "dataset.sha256")
    require_present(
        dataset.get("license_or_access_provenance"),
        "dataset.license_or_access_provenance",
    )

    require_sha256(doc.get("split_manifest_sha256"), "split_manifest_sha256")

    arms = doc.get("arms")
    if not isinstance(arms, dict) or set(arms) != REQUIRED_ARMS:
        fail("arms must contain exactly the five preregistered arm identities")
    for arm in sorted(REQUIRED_ARMS):
        require_present(arms[arm], f"arms.{arm}")

    seeds = doc.get("seeds")
    if not isinstance(seeds, list) or not seeds:
        fail("seeds must be a non-empty frozen list")
    if len(seeds) != len(set(map(str, seeds))):
        fail("seeds must be unique")

    require_present(doc.get("primary_metric"), "primary_metric")
    require_present(
        doc.get("practical_equivalence_margin"),
        "practical_equivalence_margin",
    )
    require_present(doc.get("uncertainty_procedure"), "uncertainty_procedure")
    require_present(doc.get("decision_rule"), "decision_rule")
    require_sha256(
        doc.get("matched_budget_table_sha256"),
        "matched_budget_table_sha256",
    )
    require_present(doc.get("environment_identity"), "environment_identity")
    require_present(doc.get("compute_cap"), "compute_cap")
    require_present(
        doc.get("raw_evidence_retention_path"),
        "raw_evidence_retention_path",
    )

    if doc.get("raw_evidence_hash_procedure") != "sha256":
        fail("raw_evidence_hash_procedure must remain sha256")

    if doc.get("status") != "AUTHORIZED":
        fail("status must be explicitly AUTHORIZED after all fields are frozen")


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "portfolio/research/npms_successor_execution_authorization_v1.json"
    )
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"cannot read valid authorization JSON: {exc}")

    if not isinstance(doc, dict):
        fail("authorization root must be an object")

    validate(doc)
    print("AUTHORIZED: NPMS successor execution gate is complete")


if __name__ == "__main__":
    main()
