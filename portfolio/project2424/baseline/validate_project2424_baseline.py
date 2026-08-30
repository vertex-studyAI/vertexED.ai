#!/usr/bin/env python3
"""Validate the committed Project2424 minimum-baseline bundle."""

from __future__ import annotations

import csv
import gzip
import hashlib
import io
import json
import sys
from collections import Counter
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parent
    archive = root / "PROJECT2424_MINIMUM_BASELINE_20260830.csv.gz"
    summary_path = root / "PROJECT2424_MINIMUM_BASELINE_SUMMARY_20260830.json"
    raw = gzip.decompress(archive.read_bytes())
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))
    ids = [row["canonical_id"] for row in rows]
    expected_ids = [f"T2424-{number:04d}" for number in range(1, 2425)]
    checks = {
        "exact_ids": ids == expected_ids,
        "unique_ids": len(set(ids)) == 2424,
        "all_t_namespace": all(row["namespace"] == "T2424" for row in rows),
        "no_submit_claims": all(row["ready_to_submit_today"] == "NO" for row in rows),
        "sha256": hashlib.sha256(raw).hexdigest() == summary["csv_sha256"],
        "source_backed_24": sum(row["source_status"] != "SOURCE_NOT_RECOVERED" for row in rows) == 24,
        "source_unrecovered_2400": sum(row["source_status"] == "SOURCE_NOT_RECOVERED" for row in rows) == 2400,
        "audited_5": sum(row["scientific_verdict"] != "UNKNOWN_NO_CLAIM" for row in rows) == 5,
        "darcy_hold": next(row for row in rows if row["canonical_id"] == "T2424-0050")["disposition"] == "HOLD_NO_AUTO_MERGE_OR_DEPLOY",
        "neurocad_falsification": next(row for row in rows if row["canonical_id"] == "T2424-0037")["scientific_verdict"] == "VALIDATION_DOMINANT_TYPED_MECHANISM_FALSIFIED",
        "negative_preserved": next(row for row in rows if row["canonical_id"] == "T2424-1863")["scientific_verdict"] == "FROZEN_NEGATIVE_FAILED_GT75_GATE",
        "t2424_0027_v3_negative": next(row for row in rows if row["canonical_id"] == "T2424-0027")["scientific_verdict"] == "PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS_V3_FAIL_PREDECLARED_REAL_ENCODER_GATE",
        "t2424_0027_v3_integrity_verified": next(row for row in rows if row["canonical_id"] == "T2424-0027")["reproduction_status"] == "SYNTHETIC_INDEPENDENT_REPRODUCED_V3_RESULT_INTEGRITY_VERIFIED",
        "t2424_0027_no_pending_state": all(
            marker not in next(row for row in rows if row["canonical_id"] == "T2424-0027").values()
            for marker in ("PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS_V3_PENDING", "HOLD_FOR_FROZEN_V3_GATE")
        ),
    }
    failed = [name for name, passed in checks.items() if not passed]
    print(json.dumps({
        "result": "PASS" if not failed else "FAIL",
        "rows": len(rows),
        "checks": checks,
        "dispositions": dict(sorted(Counter(row["disposition"] for row in rows).items())),
        "failed": failed,
    }, indent=2, sort_keys=True))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())