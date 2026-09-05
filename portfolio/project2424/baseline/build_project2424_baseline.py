#!/usr/bin/env python3
"""Build and validate an evidence-safe minimum baseline for all T2424 identities."""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "inputs" / "PROJECT_2424_IDENTITY_INVENTORY_2026-08-15.jsonl"
OUT = ROOT / "generated"
CSV_OUT = OUT / "PROJECT2424_MINIMUM_BASELINE_20260830.csv"
SUMMARY_OUT = OUT / "PROJECT2424_MINIMUM_BASELINE_SUMMARY_20260830.json"
REPORT_OUT = OUT / "PROJECT2424_MINIMUM_BASELINE_VALIDATION_20260830.md"

SOURCE_DIRS = {
    "T2424-0016", "T2424-0019", "T2424-0023", "T2424-0024",
    "T2424-0025", "T2424-0026", "T2424-0027", "T2424-0028",
    "T2424-0029", "T2424-0030", "T2424-0034", "T2424-0035",
    "T2424-0036", "T2424-0037", "T2424-0038", "T2424-0040",
    "T2424-0046", "T2424-0049", "T2424-0050", "T2424-0053",
    "T2424-0054", "T2424-1767", "T2424-1768",
}

AUDITED = {
    "T2424-0027": {
        "source_status": "CANONICAL_SOURCE_RECOVERED",
        "implementation_status": "RUNNABLE_TESTED",
        "hypothesis_status": "FALSIFIABLE_FROZEN_V3",
        "protocol_status": "FROZEN_SYNTHETIC_AND_V3_REAL_ENCODER",
        "dataset_status": "REAL_V3_MASSIVE_PINNED",
        "baseline_status": "CONTROLLED_PRIOR_ART_OVERLAP",
        "test_status": "TESTED",
        "experiment_status": "SYNTHETIC_EXECUTED_V3_REAL_ENCODER_ONE_SHOT_EXECUTED",
        "reproduction_status": "SYNTHETIC_INDEPENDENT_REPRODUCED_V3_RESULT_INTEGRITY_VERIFIED",
        "scientific_verdict": "PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS_V3_FAIL_PREDECLARED_REAL_ENCODER_GATE",
        "evidence_strength": "STRONG_BOUNDED_NEGATIVE_V3",
        "literature_status": "CURRENT_PRIMARY_AUDIT_COMPLETE",
        "manuscript_status": "SYNTHETIC_MANUSCRIPT_ASSEMBLED_V3_RESULT_BRIDGE_ONLY",
        "release_status": "NO_GO_V3_MANUSCRIPT_AUTHOR_LICENSE_PDF_REVIEW",
        "readiness_score": "79",
        "readiness_band": "PAPER_CANDIDATE",
        "disposition": "NEGATIVE_V3_MANUSCRIPT_INTEGRATION",
        "exact_blocker": "V3 failed the raw-language floor and 0-of-5 seed gate; manuscript integration, authorship, license, and PDF review remain open",
        "exact_next_action": "Integrate the frozen negative v3 result into the bounded manuscript/claim matrix; any positive successor requires a new preregistration",
        "evidence_paths": "CONFERENCE_READINESS_SCHEMA_20260830.csv; PR #568; PR #580",
    },
    "T2424-0025": {
        "source_status": "CANONICAL_SOURCE_AND_RAW_METRICS_RETAINED",
        "implementation_status": "RUNNABLE_TESTED",
        "hypothesis_status": "FROZEN_BOUNDED",
        "protocol_status": "FROZEN",
        "dataset_status": "GENERATED_SYNTHETIC",
        "baseline_status": "MEAN_MEDIAN_TRIMMED_HUBER",
        "test_status": "TESTED",
        "experiment_status": "30_SEED_SCREEN_AND_50_SEED_SWEEP_EXECUTED",
        "reproduction_status": "INDEPENDENT_BYTE_EXACT_REPRODUCED",
        "scientific_verdict": "REPRODUCED_MECHANISM_NON_UNIQUE",
        "evidence_strength": "STRONG_BOUNDED",
        "literature_status": "CURRENT_PRIMARY_AUDIT_COMPLETE",
        "manuscript_status": "ASSEMBLED",
        "release_status": "NO_GO_AUTHOR_LICENSE_PDF",
        "readiness_score": "89",
        "readiness_band": "PREPRINT_CANDIDATE",
        "disposition": "BOUNDED_PREPRINT_RELEASE_GATES",
        "exact_blocker": "Authorship, license/source clearance, and clean PDF audit remain open; robust-readout mechanism is not unique",
        "exact_next_action": "Close release metadata and PDF audit without rescue experiments or Transformer/NGMT superiority claims",
        "evidence_paths": "CONFERENCE_READINESS_SCHEMA_20260830.csv; PR #567; raw_metrics/repro-wave-20260812.json",
    },
    "T2424-1863": {
        "source_status": "CANONICAL_FROZEN_SOURCE_RETAINED",
        "implementation_status": "RUNNABLE_TESTED",
        "hypothesis_status": "FROZEN_THRESHOLD",
        "protocol_status": "FROZEN_THRESHOLD",
        "dataset_status": "GENERATED_SYNTHETIC",
        "baseline_status": "PERSISTENCE_AND_ZERO_DIFFUSION_CONTROLS",
        "test_status": "TESTED",
        "experiment_status": "PRIMARY_10_SEED_AND_EXPANDED_20_SEED_EXECUTED",
        "reproduction_status": "HOSTED_AND_EXACT_HEAD_REPRODUCED",
        "scientific_verdict": "FROZEN_NEGATIVE_FAILED_GT75_GATE",
        "evidence_strength": "STRONG_NEGATIVE",
        "literature_status": "BOUNDED_PRIMARY_AUDIT_COMPLETE",
        "manuscript_status": "ASSEMBLED",
        "release_status": "NO_GO_AUTHOR_LICENSE_PDF_DIGEST_ARCHIVE",
        "readiness_score": "86",
        "readiness_band": "PREPRINT_CANDIDATE",
        "disposition": "NEGATIVE_RESULT_RELEASE_GATES",
        "exact_blocker": "License/source clearance, authorship, PDF/render audit, and raw expanded per-seed artifact provenance remain open",
        "exact_next_action": "Finish bounded negative-result release hygiene without rescue tuning; preserve 10-seed primary and 20-seed expanded accounting",
        "evidence_paths": "CONFERENCE_READINESS_SCHEMA_20260830.csv; PR #575; CI 33294975723; workflow 33294975754",
    },
    "T2424-0050": {
        "source_status": "CANONICAL_SOURCE_RESULTS_RETAINED",
        "implementation_status": "RUNNABLE_TESTED",
        "hypothesis_status": "FROZEN_PARENT",
        "protocol_status": "FROZEN_PARENT_SEPARATE_SUCCESSOR",
        "dataset_status": "GENERATED_1D_SYNTHETIC",
        "baseline_status": "HARMONIC_LINEAR_ARITHMETIC_PARENT_CONTROLS",
        "test_status": "TESTED",
        "experiment_status": "PARENT_20_SEED_AND_HARDER_AUDIT_EXECUTED",
        "reproduction_status": "CLEAN_UNCHANGED_PROTOCOL_REPRODUCED",
        "scientific_verdict": "HOLD_MIXED_ROBUSTNESS",
        "evidence_strength": "STRONG_MIXED",
        "literature_status": "CURRENT_CONTEXTUAL_PRIMARY_AUDIT",
        "manuscript_status": "ASSEMBLED",
        "release_status": "NO_GO_LICENSE_AUTHOR_PDF_NOVELTY_AUDIT",
        "readiness_score": "88",
        "readiness_band": "PREPRINT_CANDIDATE",
        "disposition": "HOLD_NO_AUTO_MERGE_OR_DEPLOY",
        "exact_blocker": "Mixed parent result, release metadata, novelty audit, and matched learned comparators remain unresolved",
        "exact_next_action": "Finish the bounded mixed-result paper as-is; retain the rho=0 miss and adverse seed; do not train the successor without explicit authorization",
        "evidence_paths": "CONFERENCE_READINESS_SCHEMA_20260830.csv; PR #576; PR #453",
    },
    "T2424-0037": {
        "source_status": "EVIDENCE_BEARING_LINE_RETAINED",
        "implementation_status": "RUNNABLE_HISTORICAL_AND_DIAGNOSTIC",
        "hypothesis_status": "TYPED_CAUSAL_STORY_FALSIFIED",
        "protocol_status": "S3_FROZEN_NOT_AUTHORIZED",
        "dataset_status": "HISTORICAL_AND_REUSED_DIAGNOSTIC",
        "baseline_status": "MATCHED_VALIDATION_BASELINE_PRESENT",
        "test_status": "TESTED",
        "experiment_status": "HISTORICAL_V1_AND_MATCHED_VALIDATION_DIAGNOSTIC_EXECUTED",
        "reproduction_status": "RETAINED_WORKFLOW_ARTIFACT",
        "scientific_verdict": "VALIDATION_DOMINANT_TYPED_MECHANISM_FALSIFIED",
        "evidence_strength": "STRONG_BOUNDED_IDENTITY_BLOCKED",
        "literature_status": "CURRENT_PRIMARY_AUDIT_COMPLETE",
        "manuscript_status": "ASSEMBLED",
        "release_status": "NO_GO_IDENTITY_S3_RELEASE_GATES",
        "readiness_score": "29",
        "readiness_band": "CONCEPT",
        "disposition": "IDENTITY_RESOLUTION_BLOCKED",
        "exact_blocker": "Authoritative T2424-0007/T2424-0037/P2424-1213/P067 crosswalk is unresolved; S3 remains unauthorized",
        "exact_next_action": "Resolve the authoritative identity crosswalk without suffix inference; preserve the typed-parser falsification",
        "evidence_paths": "CONFERENCE_READINESS_SCHEMA_20260830.csv; PR #571; issue #527; artifact 9210587354",
    },
}

FIELDS = [
    "canonical_id", "title", "namespace", "registry_locator", "identity_status",
    "cross_namespace_status", "source_status", "implementation_status",
    "hypothesis_status", "protocol_status", "dataset_status", "baseline_status",
    "test_status", "experiment_status", "reproduction_status",
    "scientific_verdict", "evidence_strength", "literature_status",
    "manuscript_status", "release_status", "readiness_score", "readiness_band",
    "ready_to_submit_today", "disposition", "exact_blocker", "exact_next_action",
    "evidence_source", "evidence_paths", "registry_revision", "identity_note",
    "last_verified_date",
]


def baseline(row: dict[str, str]) -> dict[str, str]:
    project_id = row["ID"]
    result = {
        "canonical_id": project_id,
        "title": row.get("Project") or "UNKNOWN",
        "namespace": "T2424",
        "registry_locator": row.get("Repo/Path") or "UNKNOWN",
        "identity_status": "CANONICAL_WITHIN_T_REGISTRY",
        "cross_namespace_status": "NO_P_MAPPING_INFERRED",
        "source_status": "SOURCE_NOT_RECOVERED",
        "implementation_status": "UNKNOWN_NOT_AUDITED",
        "hypothesis_status": "UNKNOWN_NOT_AUDITED",
        "protocol_status": "NOT_FROZEN",
        "dataset_status": "UNKNOWN_NOT_AUDITED",
        "baseline_status": "UNKNOWN_NOT_AUDITED",
        "test_status": "NOT_RUN_AT_THIS_IDENTITY_BASELINE",
        "experiment_status": "NOT_RUN_AT_THIS_IDENTITY_BASELINE",
        "reproduction_status": "NOT_REPRODUCED",
        "scientific_verdict": "UNKNOWN_NO_CLAIM",
        "evidence_strength": "IDENTITY_ONLY",
        "literature_status": "NOT_AUDITED",
        "manuscript_status": "NOT_STARTED",
        "release_status": "NO_GO",
        "readiness_score": "10",
        "readiness_band": "CONCEPT",
        "ready_to_submit_today": "NO",
        "disposition": "SOURCE_RECOVERY_REQUIRED",
        "exact_blocker": "No canonical source package has been recovered and audited for this T identity",
        "exact_next_action": "Recover an immutable source/revision/evidence pointer or classify terminal SOURCE_BLOCKED; do not infer from the P namespace",
        "evidence_source": row.get("Evidence Source") or "UNKNOWN",
        "evidence_paths": "PROJECT_2424_IDENTITY_INVENTORY_2026-08-15.jsonl",
        "registry_revision": row.get("Revision") or "UNKNOWN",
        "identity_note": row.get("Identity Note") or "UNKNOWN",
        "last_verified_date": "2026-08-30",
    }
    if project_id in SOURCE_DIRS:
        result.update({
            "source_status": "SOURCE_DIRECTORY_PRESENT_AUDIT_PENDING",
            "disposition": "EVIDENCE_AUDIT_REQUIRED",
            "exact_blocker": "A repository package is present, but canonical source identity, retained evidence, and scientific state have not all been audited",
            "exact_next_action": "Audit exact source revision, tests, raw artifacts, protocol, and claim boundary; then promote only evidence-supported fields",
            "evidence_paths": f"portfolio/project2424/projects/{project_id}",
        })
    if project_id == "T2424-0016":
        result.update({
            "disposition": "SOURCE_MIGRATION_BLOCKED",
            "exact_blocker": "Exact MODEL-PST source/checkpoints/raw-evidence migration and external biology provenance remain unresolved",
            "exact_next_action": "Recover and hash the exact MODEL-PST source or close terminal SOURCE_BLOCKED; retain negative control findings",
        })
    if project_id == "T2424-0019":
        result.update({
            "disposition": "SOURCE_MIGRATION_BLOCKED",
            "exact_blocker": "Exact canonical MODEL-NPMS source identity is unresolved; later Atlas-derived bundles cannot substitute",
            "exact_next_action": "Recover the exact source/config/result tree or close terminal SOURCE_BLOCKED while preserving the confounded/non-unique mechanism boundary",
        })
    if project_id in AUDITED:
        result.update(AUDITED[project_id])
    return result


def main() -> None:
    records = []
    for line in INPUT.read_text(encoding="utf-8").splitlines():
        if line.strip():
            item = json.loads(line)
            if item.get("Namespace") == "T2424":
                records.append(baseline(item))
    records.sort(key=lambda row: row["canonical_id"])

    expected_ids = [f"T2424-{number:04d}" for number in range(1, 2425)]
    actual_ids = [row["canonical_id"] for row in records]
    errors = []
    if actual_ids != expected_ids:
        errors.append("Canonical IDs are not exactly T2424-0001..T2424-2424")
    if len(set(actual_ids)) != 2424:
        errors.append("Canonical IDs are not unique")
    for index, row in enumerate(records, start=1):
        missing = [field for field in FIELDS if not str(row.get(field, "")).strip()]
        if missing:
            errors.append(f"row {index} missing fields: {','.join(missing)}")
        if row["ready_to_submit_today"] != "NO":
            errors.append(f"{row['canonical_id']} improperly marked submission-ready")

    counts = {
        "total_t_identities": len(records),
        "evidence_audited": sum(row["canonical_id"] in AUDITED for row in records),
        "source_backed_total": sum(
            row["canonical_id"] in SOURCE_DIRS or row["canonical_id"] == "T2424-1863"
            for row in records
        ),
        "source_directory_present_audit_pending": sum(
            row["canonical_id"] in SOURCE_DIRS and row["canonical_id"] not in AUDITED
            for row in records
        ),
        "source_not_recovered": sum(row["source_status"] == "SOURCE_NOT_RECOVERED" for row in records),
        "ready_to_submit_today": sum(row["ready_to_submit_today"] == "YES" for row in records),
        "p_namespace_rows": sum(row["namespace"] == "P2424" for row in records),
        "validation_errors": len(errors),
    }
    expected_counts = {
        "total_t_identities": 2424,
        "evidence_audited": 5,
        "source_backed_total": 24,
        "source_directory_present_audit_pending": 19,
        "source_not_recovered": 2400,
        "ready_to_submit_today": 0,
        "p_namespace_rows": 0,
        "validation_errors": 0,
    }
    if counts != expected_counts:
        errors.append(f"aggregate mismatch: expected {expected_counts}, got {counts}")
        counts["validation_errors"] = len(errors)

    OUT.mkdir(parents=True, exist_ok=True)
    with CSV_OUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(records)

    digest = hashlib.sha256(CSV_OUT.read_bytes()).hexdigest()
    summary = {
        "baseline_definition": "Every canonical T identity has a registry-backed identity row, explicit unknown/not-run states, one disposition, one blocker, and one next decisive action. This is not an implementation or experiment claim.",
        "source_inventory": INPUT.name,
        "source_inventory_rows_all_namespaces": sum(1 for line in INPUT.read_text(encoding="utf-8").splitlines() if line.strip()),
        "counts": counts,
        "dispositions": dict(sorted(Counter(row["disposition"] for row in records).items())),
        "readiness_bands": dict(sorted(Counter(row["readiness_band"] for row in records).items())),
        "scientific_verdicts": dict(sorted(Counter(row["scientific_verdict"] for row in records).items())),
        "csv_sha256": digest,
        "integrity_locks": [
            "P2424 and T2424 are separate namespaces; no suffix-based mapping is inferred",
            "unknown stays unknown and not-run stays not-run",
            "negative, mixed, inconclusive, and falsified results are preserved",
            "T2424-0050 remains HOLD / no auto-merge or deploy",
            "IRIS seeds 1000-1029 remain prohibited outside this registry pass",
        ],
        "validation": "PASS" if not errors else "FAIL",
        "errors": errors,
    }
    SUMMARY_OUT.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    REPORT_OUT.write_text(
        "# Project2424 minimum-baseline validation\n\n"
        f"- Result: **{summary['validation']}**\n"
        f"- Canonical T identities: **{counts['total_t_identities']} / 2424**\n"
        f"- Evidence-audited priority rows: **{counts['evidence_audited']}**\n"
        f"- Source-backed identities: **{counts['source_backed_total']}**\n"
        f"- Source-present but audit-pending identities: **{counts['source_directory_present_audit_pending']}**\n"
        f"- Source not recovered: **{counts['source_not_recovered']}**\n"
        f"- Submission-ready today: **{counts['ready_to_submit_today']}**\n"
        f"- P-namespace rows included: **{counts['p_namespace_rows']}**\n"
        f"- CSV SHA-256: `{digest}`\n\n"
        "The baseline is an auditable floor, not a claim that 2,424 implementations, experiments, manuscripts, or reproductions exist.\n",
        encoding="utf-8",
    )
    if errors:
        raise SystemExit("\n".join(errors))


if __name__ == "__main__":
    main()