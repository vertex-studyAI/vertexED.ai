#!/usr/bin/env python3
"""Upgrade every materialized Project 2424 child to an honest 13/13 structural contract.

This script changes repository structure only. It never invents scientific results,
datasets, benchmark outcomes, or publication readiness. Unknown science remains
explicitly unresolved and experiment entry points remain fail-closed.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

CHECK_NAMES = [
    "readme",
    "status",
    "source_tree",
    "executable_code",
    "experiment_surface",
    "run_command",
    "protocol_or_freeze",
    "data_provenance",
    "baseline_declaration",
    "metric_declaration",
    "tests",
    "results_surface",
    "reporting_surface",
]


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def ensure_readme(root: Path) -> None:
    path = root / "README.md"
    text = path.read_text(encoding="utf-8") if path.exists() else f"# {root.name}\n"
    marker = "## Structural execution contract"
    if marker not in text:
        text = text.rstrip() + f"""

{marker}

The repository surface is structurally complete even when the scientific state is unresolved.
Scientific execution remains fail-closed until the protocol and evidence gates authorize it.

```bash
python src/experiment.py
pytest -q
```

A failing experiment command can be the expected safe behavior for RESERVED, SOURCE_RECOVERY,
PROTOCOL_BLOCKED, HOLD, negative, mixed, or otherwise unauthorized scientific states.
"""
        path.write_text(text, encoding="utf-8")


def ensure_status(root: Path) -> None:
    state_path = root / "STATE.md"
    state = state_path.read_text(encoding="utf-8") if state_path.exists() else "State unavailable."
    (root / "STATUS.md").write_text(
        f"""# Structural status — {root.name}

- Structural contract target: **13/13**
- Scientific completion: **NOT IMPLIED**
- Preprint readiness: **NOT IMPLIED**
- Outcome authorization: governed by `PROTOCOL.yaml`, `EVIDENCE.json`, and `STATE.md`

## Canonical state

{state}
""",
        encoding="utf-8",
    )


def ensure_data_provenance(root: Path) -> None:
    path = root / "data" / "DATA_PROVENANCE.json"
    if path.exists():
        return
    write_json(
        path,
        {
            "project_id": root.name,
            "mode": "UNRESOLVED_SOURCE_RECOVERY",
            "dataset": None,
            "generator": None,
            "split": None,
            "resolved": False,
            "scientific_claim_boundary": "STRUCTURAL_ONLY",
            "note": "This file makes data provenance state explicit; it does not claim that a dataset has been recovered or validated.",
        },
    )


def ensure_result_surface(root: Path) -> None:
    evidence_path = root / "EVIDENCE.json"
    evidence = json.loads(evidence_path.read_text(encoding="utf-8")) if evidence_path.exists() else {}
    has_reviewed_result = bool(evidence.get("headline_result") or evidence.get("verdict"))
    write_json(
        root / "results" / "RESULT_STATUS.json",
        {
            "project_id": root.name,
            "state": "REVIEWED_EVIDENCE_REFERENCED" if has_reviewed_result else "NO_NEW_RESULT_CLAIMED",
            "canonical_evidence": "../EVIDENCE.json",
            "scientific_claim_boundary": "STRUCTURAL_ONLY",
            "note": "A results surface is present for provenance and fail-closed reporting. Presence is not evidence that an experiment ran.",
        },
    )


def score(root: Path) -> tuple[int, dict[str, bool]]:
    readme = root / "README.md"
    protocol = root / "PROTOCOL.yaml"
    readme_text = readme.read_text(encoding="utf-8", errors="replace").lower() if readme.exists() else ""
    protocol_text = protocol.read_text(encoding="utf-8", errors="replace").lower() if protocol.exists() else ""
    src = root / "src"
    src_files = [p for p in src.rglob("*") if p.is_file()] if src.exists() else []
    tests_dir = root / "tests"
    test_files = [p for p in tests_dir.rglob("*") if p.is_file()] if tests_dir.exists() else []
    results_dir = root / "results"
    result_files = [p for p in results_dir.rglob("*") if p.is_file()] if results_dir.exists() else []
    manuscript = root / "manuscript"
    report_files = [p for p in manuscript.rglob("*") if p.is_file()] if manuscript.exists() else []

    checks = {
        "readme": readme.is_file(),
        "status": (root / "STATUS.md").is_file(),
        "source_tree": src.is_dir(),
        "executable_code": any(p.suffix.lower() in {".py", ".js", ".mjs", ".ts", ".tsx", ".cpp", ".c", ".rs", ".jl", ".ipynb"} for p in src_files),
        "experiment_surface": any("experiment" in p.name.lower() or "benchmark" in p.name.lower() or "evaluate" in p.name.lower() for p in src_files),
        "run_command": "python src/experiment.py" in readme_text,
        "protocol_or_freeze": protocol.is_file(),
        "data_provenance": (root / "data" / "DATA_PROVENANCE.json").is_file(),
        "baseline_declaration": "baselines:" in protocol_text,
        "metric_declaration": "primary_metric:" in protocol_text,
        "tests": bool(test_files),
        "results_surface": bool(result_files),
        "reporting_surface": bool(report_files),
    }
    assert list(checks) == CHECK_NAMES
    return sum(checks.values()), checks


def process(root: Path) -> dict:
    ensure_readme(root)
    ensure_status(root)
    ensure_data_provenance(root)
    ensure_result_surface(root)
    passed, checks = score(root)
    write_json(
        root / "STRUCTURAL_STATUS.json",
        {
            "project_id": root.name,
            "structural_checks_passed": passed,
            "structural_checks_total": 13,
            "structural_fraction": passed / 13,
            "checks": checks,
            "scientific_claim_boundary": "STRUCTURAL_ONLY",
            "scientific_completion_implied": False,
            "preprint_ready_implied": False,
        },
    )
    return {"project_id": root.name, "score": passed, "checks": checks}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, required=True)
    ap.add_argument("--summary", type=Path, required=True)
    args = ap.parse_args()

    projects = sorted(p for p in args.root.glob("T2424-*") if p.is_dir())
    if len(projects) != 2424:
        raise SystemExit(f"expected 2424 project packages, found {len(projects)}")

    rows = [process(project) for project in projects]
    bad = [row for row in rows if row["score"] != 13]
    summary = {
        "schema_version": 1,
        "project_count": len(rows),
        "required_score": "13/13",
        "projects_at_13_of_13": len(rows) - len(bad),
        "all_13_of_13": not bad,
        "scientific_claim_boundary": "STRUCTURAL_ONLY",
        "scientific_completion_implied": False,
        "failed_projects": bad,
    }
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.summary.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(json.dumps({k: v for k, v in summary.items() if k != "failed_projects"}, indent=2))
    if bad:
        print(json.dumps(bad[:20], indent=2))
        return 1
    print("PASS: all 2,424 generated Project 2424 packages satisfy the 13/13 structural contract.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
