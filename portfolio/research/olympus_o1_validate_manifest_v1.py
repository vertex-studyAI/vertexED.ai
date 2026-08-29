#!/usr/bin/env python3
"""Validate the frozen Olympus O1 task manifest before any scored run.

This validator does not create tasks, execute any arm, or authorize an outcome run.
It only verifies that a candidate manifest satisfies the preregistered structural
constraints and emits a deterministic SHA-256 for the exact bytes validated.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

REQUIRED_FIELDS = (
    "task_id",
    "family",
    "input",
    "success_rubric",
    "allowed_tools",
    "evidence_requirements",
)
EXPECTED_TASKS = 100
MIN_FAMILIES = 2
MIN_TASKS_PER_FAMILY = 50


def _load(path: Path) -> tuple[bytes, list[dict[str, Any]]]:
    raw = path.read_bytes()
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid JSON: {exc}") from exc
    if not isinstance(obj, list):
        raise ValueError("manifest root must be a JSON array")
    return raw, obj


def validate(rows: list[dict[str, Any]]) -> dict[str, Any]:
    errors: list[str] = []
    if len(rows) != EXPECTED_TASKS:
        errors.append(f"expected exactly {EXPECTED_TASKS} tasks, got {len(rows)}")

    seen: set[str] = set()
    families: Counter[str] = Counter()
    for i, row in enumerate(rows):
        prefix = f"row[{i}]"
        if not isinstance(row, dict):
            errors.append(f"{prefix}: must be an object")
            continue
        missing = [k for k in REQUIRED_FIELDS if k not in row]
        if missing:
            errors.append(f"{prefix}: missing fields {missing}")
            continue
        extra = sorted(set(row) - set(REQUIRED_FIELDS))
        if extra:
            errors.append(f"{prefix}: unexpected fields {extra}")

        task_id = row["task_id"]
        family = row["family"]
        if not isinstance(task_id, str) or not task_id.strip():
            errors.append(f"{prefix}: task_id must be a non-empty string")
        elif task_id in seen:
            errors.append(f"{prefix}: duplicate task_id {task_id!r}")
        else:
            seen.add(task_id)

        if not isinstance(family, str) or not family.strip():
            errors.append(f"{prefix}: family must be a non-empty string")
        else:
            families[family] += 1

        for key in ("input", "success_rubric"):
            if not isinstance(row[key], str) or not row[key].strip():
                errors.append(f"{prefix}: {key} must be a non-empty string")

        for key in ("allowed_tools", "evidence_requirements"):
            value = row[key]
            if not isinstance(value, list):
                errors.append(f"{prefix}: {key} must be a list")
            elif not all(isinstance(x, str) and x.strip() for x in value):
                errors.append(f"{prefix}: {key} entries must be non-empty strings")

    if len(families) < MIN_FAMILIES:
        errors.append(f"requires at least {MIN_FAMILIES} task families, got {len(families)}")
    if len(families) == MIN_FAMILIES:
        for family, count in sorted(families.items()):
            if count < MIN_TASKS_PER_FAMILY:
                errors.append(
                    f"family {family!r} has {count} tasks; with exactly two families each must have at least {MIN_TASKS_PER_FAMILY}"
                )

    return {
        "status": "VALID" if not errors else "INVALID",
        "task_count": len(rows),
        "family_counts": dict(sorted(families.items())),
        "errors": errors,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest", type=Path)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()

    raw, rows = _load(args.manifest)
    result = validate(rows)
    result["manifest_sha256"] = hashlib.sha256(raw).hexdigest()
    result["integrity_note"] = (
        "Validation is structural only. A VALID manifest is not execution authorization and does not establish task quality."
    )
    text = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.out:
        args.out.write_text(text)
    else:
        print(text, end="")
    return 0 if result["status"] == "VALID" else 2


if __name__ == "__main__":
    raise SystemExit(main())
