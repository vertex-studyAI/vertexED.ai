#!/usr/bin/env python3
"""Validate the research preparation queue without executing research outcomes."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED = {
    "task_id",
    "project",
    "class",
    "executor",
    "action",
    "outcome_access",
}

FORBIDDEN_ACTION_FRAGMENTS = (
    "ignore the frozen",
    "bypass the lock",
    "unlock test",
    "use protected seeds",
    "auto-merge darcy",
    "auto deploy darcy",
    "make the result positive",
    "retune until",
)


def load_ndjson(path: Path) -> list[dict]:
    rows: list[dict] = []
    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{lineno}: invalid JSON: {exc}") from exc
        if not isinstance(row, dict):
            raise ValueError(f"{path}:{lineno}: each line must be a JSON object")
        rows.append(row)
    return rows


def validate(rows: list[dict]) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()

    if not rows:
        errors.append("queue is empty")
        return errors

    for index, row in enumerate(rows, 1):
        missing = REQUIRED - row.keys()
        if missing:
            errors.append(f"row {index}: missing keys {sorted(missing)}")
            continue

        task_id = row["task_id"]
        if not isinstance(task_id, str) or not task_id.strip():
            errors.append(f"row {index}: task_id must be a non-empty string")
        elif task_id in seen:
            errors.append(f"row {index}: duplicate task_id {task_id}")
        else:
            seen.add(task_id)

        if row["outcome_access"] is not False:
            errors.append(f"{task_id}: outcome_access must be exactly false")

        for key in ("project", "class", "executor", "action"):
            if not isinstance(row[key], str) or not row[key].strip():
                errors.append(f"{task_id}: {key} must be a non-empty string")

        action = str(row.get("action", "")).lower()
        for fragment in FORBIDDEN_ACTION_FRAGMENTS:
            if fragment in action:
                errors.append(f"{task_id}: forbidden action fragment: {fragment!r}")

        if row.get("project") == "T2424-0050":
            if "training_authorized must remain false" not in action:
                errors.append("T2424-0050: action must explicitly preserve training_authorized=false")
            if "no id/ood outcome access" not in action.lower():
                errors.append("T2424-0050: action must explicitly prohibit ID/OOD outcome access")

        if row.get("project") == "iris_v02":
            if "1000-1029" not in action:
                errors.append("iris_v02: action must explicitly preserve forbidden seed range 1000-1029")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("queue", type=Path)
    args = parser.parse_args()

    rows = load_ndjson(args.queue)
    errors = validate(rows)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(f"PREOUTCOME_QUEUE_VALID: {len(rows)} tasks")
    print("OUTCOME_ACCESS: FALSE_FOR_ALL_TASKS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
