#!/usr/bin/env python3
"""Read-only verification of the immutable 2026-08-30 registry snapshot.

This is not a source-presence audit, experimental reproduction, or release gate.
A successor snapshot must use a separately reviewed trust anchor, not edit this one.
"""
from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import io
import json
import re
import sys
import zlib
from collections import Counter
from pathlib import Path

SOURCE_COMMIT = "016e1bdc1f6e38f80d7bbe8b596bcb5349fa0c0a"
EXPECTED_CSV_SHA256 = "84066ec134c0f9c216e23f18e9765efa439bee7f6be46dd5d6d29e9178f926d7"
ARCHIVE_NAME = "PROJECT2424_MINIMUM_BASELINE_20260830.csv.gz"
SUMMARY_NAME = "PROJECT2424_MINIMUM_BASELINE_SUMMARY_20260830.json"
MAX_ARCHIVE_BYTES = 8 * 1024 * 1024
MAX_CSV_BYTES = 16 * 1024 * 1024
MAX_SUMMARY_BYTES = 1024 * 1024
MAX_DIAGNOSTICS = 100
EXPECTED_IDS = tuple(f"T2424-{n:04d}" for n in range(1, 2425))
FIELDS = (
    "canonical_id", "title", "namespace", "registry_locator", "identity_status",
    "cross_namespace_status", "source_status", "implementation_status",
    "hypothesis_status", "protocol_status", "dataset_status", "baseline_status",
    "test_status", "experiment_status", "reproduction_status", "scientific_verdict",
    "evidence_strength", "literature_status", "manuscript_status", "release_status",
    "readiness_score", "readiness_band", "ready_to_submit_today", "disposition",
    "exact_blocker", "exact_next_action", "evidence_source", "evidence_paths",
    "registry_revision", "identity_note", "last_verified_date",
)
SOURCE_IDS = frozenset(
    f"T2424-{n:04d}" for n in
    (16, 19, 23, 24, 25, 26, 27, 28, 29, 30, 34, 35, 36, 37, 38,
     40, 46, 49, 50, 53, 54, 1767, 1768, 1863)
)
# Locks are copied from the retained builder, not inferred from PR summaries.
LOCKS = {
    "T2424-0025": {
        "scientific_verdict": "REPRODUCED_MECHANISM_NON_UNIQUE",
        "source_status": "CANONICAL_SOURCE_AND_RAW_METRICS_RETAINED",
        "reproduction_status": "INDEPENDENT_BYTE_EXACT_REPRODUCED",
        "disposition": "BOUNDED_PREPRINT_RELEASE_GATES",
        "readiness_score": "89", "readiness_band": "PREPRINT_CANDIDATE",
    },
    "T2424-0027": {
        "scientific_verdict": "PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS_V3_FAIL_PREDECLARED_REAL_ENCODER_GATE",
        "source_status": "CANONICAL_SOURCE_RECOVERED",
        "reproduction_status": "SYNTHETIC_INDEPENDENT_REPRODUCED_V3_RESULT_INTEGRITY_VERIFIED",
        "disposition": "NEGATIVE_V3_MANUSCRIPT_INTEGRATION",
        "readiness_score": "79", "readiness_band": "PAPER_CANDIDATE",
    },
    "T2424-0037": {
        "scientific_verdict": "VALIDATION_DOMINANT_TYPED_MECHANISM_FALSIFIED",
        "source_status": "EVIDENCE_BEARING_LINE_RETAINED",
        "reproduction_status": "RETAINED_WORKFLOW_ARTIFACT",
        "disposition": "IDENTITY_RESOLUTION_BLOCKED",
        "readiness_score": "29", "readiness_band": "CONCEPT",
    },
    "T2424-0050": {
        "scientific_verdict": "HOLD_MIXED_ROBUSTNESS",
        "source_status": "CANONICAL_SOURCE_RESULTS_RETAINED",
        "reproduction_status": "CLEAN_UNCHANGED_PROTOCOL_REPRODUCED",
        "disposition": "HOLD_NO_AUTO_MERGE_OR_DEPLOY",
        "readiness_score": "88", "readiness_band": "PREPRINT_CANDIDATE",
    },
    "T2424-1863": {
        "scientific_verdict": "FROZEN_NEGATIVE_FAILED_GT75_GATE",
        "source_status": "CANONICAL_FROZEN_SOURCE_RETAINED",
        "reproduction_status": "HOSTED_AND_EXACT_HEAD_REPRODUCED",
        "disposition": "NEGATIVE_RESULT_RELEASE_GATES",
        "readiness_score": "86", "readiness_band": "PREPRINT_CANDIDATE",
    },
}
EXPECTED_COUNTS = {
    "total_t_identities": 2424, "evidence_audited": 5, "source_backed_total": 24,
    "source_directory_present_audit_pending": 19, "source_not_recovered": 2400,
    "ready_to_submit_today": 0, "p_namespace_rows": 0, "validation_errors": 0,
}
INTEGRITY_LOCKS = [
    "P2424 and T2424 are separate namespaces; no suffix-based mapping is inferred",
    "unknown stays unknown and not-run stays not-run",
    "negative, mixed, inconclusive, and falsified results are preserved",
    "T2424-0050 remains HOLD / no auto-merge or deploy",
    "IRIS seeds 1000-1029 remain prohibited outside this registry pass",
]
SUMMARY_KEYS = frozenset((
    "baseline_definition", "counts", "csv_sha256", "dispositions", "errors",
    "integrity_locks", "readiness_bands", "scientific_verdicts", "source_inventory",
    "source_inventory_rows_all_namespaces", "validation",
))
BASELINE_DEFINITION = (
    "Every canonical T identity has a registry-backed identity row, explicit "
    "unknown/not-run states, one disposition, one blocker, and one next decisive "
    "action. This is not an implementation or experiment claim."
)


def _bounded_read(path: Path, limit: int) -> bytes:
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"Expected a regular, non-symlink file: {path.name}")
    with path.open("rb") as stream:
        result = stream.read(limit + 1)
    if len(result) > limit:
        raise ValueError(f"Input exceeds {limit} bytes: {path.name}")
    return result


def _unique_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def _reject_constant(value: str) -> None:
    raise ValueError(f"Non-finite JSON constant: {value}")


def _integer_map(value: object) -> bool:
    return isinstance(value, dict) and all(type(v) is int and v >= 0 for v in value.values())


def validate_bundle(root: Path) -> dict[str, object]:
    """Return bounded machine-readable diagnostics; never execute project code."""
    errors: list[dict[str, str]] = []
    error_count = 0
    actual_sha: str | None = None
    rows: list[dict[str, str]] = []

    def fail(code: str, detail: str) -> None:
        nonlocal error_count
        error_count += 1
        if len(errors) < MAX_DIAGNOSTICS:
            errors.append({"code": code, "detail": detail[:400]})

    def report() -> dict[str, object]:
        return {
            "result": "FAIL" if error_count else "PASS",
            "scope": "IMMUTABLE_2026_08_30_REGISTRY_SNAPSHOT_ONLY",
            "source_commit": SOURCE_COMMIT,
            "rows": len(rows), "csv_sha256": actual_sha,
            "expected_csv_sha256": EXPECTED_CSV_SHA256,
            "errors": errors, "error_count": error_count,
            "diagnostics_truncated": error_count > len(errors),
            "current_source_presence_verified": False,
            "new_scientific_experiments": 0,
            "scientific_promotion_authorized": False,
            "independent_reproduction_verified_by_this_check": False,
        }

    try:
        archive = _bounded_read(root / ARCHIVE_NAME, MAX_ARCHIVE_BYTES)
        with gzip.GzipFile(fileobj=io.BytesIO(archive)) as compressed:
            raw = compressed.read(MAX_CSV_BYTES + 1)
        if len(raw) > MAX_CSV_BYTES:
            raise ValueError("Decompressed CSV exceeds size limit")
        actual_sha = hashlib.sha256(raw).hexdigest()
        if actual_sha != EXPECTED_CSV_SHA256:
            fail("TRUST_ANCHOR_MISMATCH", "CSV differs from the independently pinned snapshot")
        summary = json.loads(
            _bounded_read(root / SUMMARY_NAME, MAX_SUMMARY_BYTES).decode("utf-8"),
            object_pairs_hook=_unique_object, parse_constant=_reject_constant,
        )
        if not isinstance(summary, dict):
            raise ValueError("Summary must be a JSON object")
        text = raw.decode("utf-8")
        if "\x00" in text:
            raise ValueError("NUL byte in CSV")
        reader = csv.reader(io.StringIO(text, newline=""), strict=True)
        if tuple(next(reader, ())) != FIELDS:
            fail("CSV_SCHEMA", "Header must match the complete ordered 31-field schema")
            return report()
        for line, values in enumerate(reader, start=2):
            if len(rows) >= len(EXPECTED_IDS):
                fail("ROW_LIMIT", "CSV contains more than 2424 records")
                break
            if len(values) != len(FIELDS):
                fail("CSV_ROW_WIDTH", f"CSV record {line} has {len(values)} fields")
                continue
            row = dict(zip(FIELDS, values))
            rows.append(row)
            for field, value in row.items():
                if not value.strip():
                    fail("EMPTY_FIELD", f"Record {line}: {field}")
    except (OSError, EOFError, UnicodeError, ValueError, csv.Error, zlib.error) as exc:
        fail("INPUT_ERROR", str(exc))
        return report()

    if tuple(row["canonical_id"] for row in rows) != EXPECTED_IDS:
        fail("EXACT_IDENTITIES", "Expected unique ordered T2424-0001 through T2424-2424")
    for row in rows:
        pid = row["canonical_id"]
        fixed = {
            "namespace": "T2424", "identity_status": "CANONICAL_WITHIN_T_REGISTRY",
            "cross_namespace_status": "NO_P_MAPPING_INFERRED",
            "ready_to_submit_today": "NO", "last_verified_date": "2026-08-30",
        }
        if pid in LOCKS:
            fixed.update(LOCKS[pid])
        else:
            fixed.update({
                "scientific_verdict": "UNKNOWN_NO_CLAIM",
                "readiness_score": "10", "readiness_band": "CONCEPT",
                "source_status": "SOURCE_DIRECTORY_PRESENT_AUDIT_PENDING" if pid in SOURCE_IDS else "SOURCE_NOT_RECOVERED",
                "disposition": "SOURCE_MIGRATION_BLOCKED" if pid in ("T2424-0016", "T2424-0019") else (
                    "EVIDENCE_AUDIT_REQUIRED" if pid in SOURCE_IDS else "SOURCE_RECOVERY_REQUIRED"
                ),
            })
        for field, expected in fixed.items():
            if row[field] != expected:
                fail("ROW_CONTRACT", f"{pid}: {field} must remain {expected}")
        if not re.fullmatch(r"(?:0|[1-9][0-9]?|100)", row["readiness_score"]):
            fail("INVALID_SCORE", f"{pid}: readiness_score is not an integer in 0..100")

    if set(summary) != SUMMARY_KEYS:
        fail("SUMMARY_SCHEMA", "Unexpected or missing summary fields")
    if summary.get("csv_sha256") != actual_sha:
        fail("SUMMARY_DIGEST", "Summary checksum does not match the CSV")
    fixed_summary = {
        "baseline_definition": BASELINE_DEFINITION,
        "integrity_locks": INTEGRITY_LOCKS,
        "source_inventory": "PROJECT_2424_IDENTITY_INVENTORY_2026-08-15.jsonl",
        "validation": "PASS", "errors": [],
    }
    for field, expected in fixed_summary.items():
        if summary.get(field) != expected:
            fail("SUMMARY_CONTRACT", f"Summary field differs from retained snapshot: {field}")
    n = summary.get("source_inventory_rows_all_namespaces")
    if type(n) is not int or n != 4850:
        fail("SUMMARY_INVENTORY_COUNT", "Expected 4850 historical input rows, not a T-to-P crosswalk")
    derived = {
        "total_t_identities": len(rows),
        "evidence_audited": sum(r["scientific_verdict"] != "UNKNOWN_NO_CLAIM" for r in rows),
        "source_backed_total": sum(r["source_status"] != "SOURCE_NOT_RECOVERED" for r in rows),
        "source_directory_present_audit_pending": sum(r["source_status"] == "SOURCE_DIRECTORY_PRESENT_AUDIT_PENDING" for r in rows),
        "source_not_recovered": sum(r["source_status"] == "SOURCE_NOT_RECOVERED" for r in rows),
        "ready_to_submit_today": sum(r["ready_to_submit_today"] == "YES" for r in rows),
        "p_namespace_rows": sum(r["namespace"] == "P2424" for r in rows),
        "validation_errors": 0,  # Retained summary state; live failures are reported separately.
    }
    stored = summary.get("counts")
    if not _integer_map(stored) or stored != derived or stored != EXPECTED_COUNTS:
        fail("SUMMARY_COUNTS", "Summary counts differ from row-derived or frozen snapshot totals")
    for summary_field, row_field in (
        ("dispositions", "disposition"), ("readiness_bands", "readiness_band"),
        ("scientific_verdicts", "scientific_verdict"),
    ):
        actual = dict(Counter(row[row_field] for row in rows))
        stored = summary.get(summary_field)
        if not _integer_map(stored) or stored != actual:
            fail("SUMMARY_HISTOGRAM", f"Summary {summary_field} differs from row-derived totals")
    return report()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args(argv)
    result = validate_bundle(args.root)
    print(json.dumps(result, indent=2, sort_keys=True))
    return int(result["result"] != "PASS")


if __name__ == "__main__":
    sys.exit(main())
