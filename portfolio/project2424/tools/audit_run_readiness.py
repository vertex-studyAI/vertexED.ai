#!/usr/bin/env python3
"""Structural run-readiness audit for repository-backed Project 2424 children.

This tool intentionally does NOT decide scientific quality, novelty, correctness,
or authorization to run outcomes. It answers a narrower question: what execution
scaffolding is visibly present in each repository-backed child directory?

Truth rules:
- directory presence is not scientific completion;
- a high structural score is not a positive scientific result;
- frozen negative/mixed/falsified results must remain frozen;
- explicit outcome/training locks override every structural signal;
- unknown/unrecovered identities remain unknown.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


ROOT_DEFAULT = Path(__file__).resolve().parents[1]
MANIFEST_DEFAULT = ROOT_DEFAULT / "SOURCE_IDENTITY_MANIFEST.json"
PROJECTS_DEFAULT = ROOT_DEFAULT / "projects"


@dataclass
class ProjectAudit:
    project_id: str
    registry_name: str
    project_path: str
    path_exists: bool
    readme: bool
    status: bool
    source_tree: bool
    executable_code: bool
    experiment_surface: bool
    protocol_or_freeze: bool
    data_surface: bool
    baseline_signal: bool
    metrics_signal: bool
    tests_signal: bool
    results_surface: bool
    reporting_signal: bool
    explicit_outcome_lock: bool
    frozen_negative_signal: bool
    file_count: int
    source_file_count: int
    structural_checks_passed: int
    structural_checks_total: int
    structural_fraction: float
    classification: str
    warnings: list[str]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def files_under(path: Path) -> list[Path]:
    if not path.exists():
        return []
    return [p for p in path.rglob("*") if p.is_file()]


def any_name(files: Iterable[Path], needles: Iterable[str]) -> bool:
    needles_l = tuple(n.lower() for n in needles)
    return any(any(n in p.name.lower() for n in needles_l) for p in files)


def any_path(files: Iterable[Path], needles: Iterable[str]) -> bool:
    needles_l = tuple(n.lower() for n in needles)
    return any(any(n in str(p).lower() for n in needles_l) for p in files)


def text_bundle(files: Iterable[Path], max_bytes_each: int = 256_000) -> str:
    parts: list[str] = []
    for path in files:
        if path.suffix.lower() not in {".md", ".txt", ".json", ".yaml", ".yml", ".toml"}:
            continue
        try:
            if path.stat().st_size > max_bytes_each:
                continue
            parts.append(path.read_text(encoding="utf-8", errors="replace"))
        except OSError:
            continue
    return "\n".join(parts).lower()


def audit_project(project_id: str, registry_name: str, path: Path) -> ProjectAudit:
    files = files_under(path)
    rel_files = [p.relative_to(path) for p in files] if path.exists() else []
    text = text_bundle(files)

    readme = (path / "README.md").is_file()
    status = (path / "STATUS.md").is_file()
    source_tree = any((path / d).is_dir() for d in ("src", "source", "code", "model"))

    source_exts = {".py", ".mjs", ".js", ".ts", ".tsx", ".cpp", ".c", ".rs", ".jl", ".ipynb"}
    source_files = [p for p in files if p.suffix.lower() in source_exts]
    executable_code = bool(source_files)

    experiment_surface = any((path / d).is_dir() for d in ("experiment", "experiments", "scripts")) or any_path(
        rel_files, ("experiment", "train", "evaluate", "benchmark", "run_")
    )
    protocol_or_freeze = any_name(
        rel_files,
        ("protocol", "freeze", "preregister", "pre-register", "hypothesis", "claim", "falsif"),
    )
    data_surface = any((path / d).is_dir() for d in ("data", "dataset", "datasets")) or any_name(
        rel_files, ("dataset", "data_manifest", "download", "loader", "split")
    )
    baseline_signal = any_path(rel_files, ("baseline", "reference", "control")) or "baseline" in text
    metrics_signal = any_path(rel_files, ("metric", "evaluate", "evaluation", "score")) or "metric" in text
    tests_signal = any((path / d).is_dir() for d in ("test", "tests")) or any_name(rel_files, ("test_", ".test.", "smoke"))
    results_surface = any((path / d).is_dir() for d in ("result", "results", "outputs", "artifacts")) or any_path(
        rel_files, ("result", "output", "artifact")
    )
    reporting_signal = any_path(rel_files, ("table", "figure", "plot", "report", "paper", "manuscript")) or any(
        word in text for word in ("table", "figure", "plot")
    )

    explicit_outcome_lock = any(
        marker in text
        for marker in (
            '"training_authorized": false',
            "training_authorized=false",
            "training authorized: false",
            "no training",
            "no outcome run",
            "outcome run is not authorized",
            "do not train",
        )
    )

    frozen_negative_signal = any(
        marker in text
        for marker in (
            "frozen negative",
            "reproduced negative",
            "negative result",
            "falsified",
            "validation_dominant",
            "do not rescue",
            "no rescue",
        )
    )

    checks = [
        readme,
        status,
        source_tree,
        executable_code,
        experiment_surface,
        protocol_or_freeze,
        data_surface,
        baseline_signal,
        metrics_signal,
        tests_signal,
        results_surface,
        reporting_signal,
    ]
    passed = sum(bool(x) for x in checks)
    total = len(checks)
    fraction = passed / total if total else 0.0

    warnings: list[str] = []
    if explicit_outcome_lock:
        warnings.append("explicit outcome/training lock detected; structural readiness does not authorize execution")
    if frozen_negative_signal:
        warnings.append("frozen/negative/falsified signal detected; preserve result and do not retune in place")
    if not executable_code:
        warnings.append("no executable source file detected")
    if not protocol_or_freeze:
        warnings.append("no obvious protocol/freeze artifact detected")
    if not baseline_signal:
        warnings.append("no obvious baseline/control signal detected")
    if not data_surface:
        warnings.append("no obvious dataset/loader/split surface detected")
    if not tests_signal:
        warnings.append("no obvious test/smoke surface detected")
    if not reporting_signal:
        warnings.append("no obvious table/figure/report generation signal detected")

    if not path.exists():
        classification = "SOURCE_RECOVERY"
    elif explicit_outcome_lock:
        classification = "PREOUTCOME_BLOCKED"
    elif frozen_negative_signal:
        classification = "FROZEN_RESULT"
    elif fraction >= 0.83:
        classification = "STRUCTURALLY_NEAR_RUN_READY"
    elif fraction >= 0.58:
        classification = "PARTIAL"
    else:
        classification = "SCAFFOLD_GAPS"

    return ProjectAudit(
        project_id=project_id,
        registry_name=registry_name,
        project_path=str(path),
        path_exists=path.exists(),
        readme=readme,
        status=status,
        source_tree=source_tree,
        executable_code=executable_code,
        experiment_surface=experiment_surface,
        protocol_or_freeze=protocol_or_freeze,
        data_surface=data_surface,
        baseline_signal=baseline_signal,
        metrics_signal=metrics_signal,
        tests_signal=tests_signal,
        results_surface=results_surface,
        reporting_signal=reporting_signal,
        explicit_outcome_lock=explicit_outcome_lock,
        frozen_negative_signal=frozen_negative_signal,
        file_count=len(files),
        source_file_count=len(source_files),
        structural_checks_passed=passed,
        structural_checks_total=total,
        structural_fraction=round(fraction, 4),
        classification=classification,
        warnings=warnings,
    )


def load_manifest(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data.get("entries"), list):
        raise ValueError("manifest entries must be a list")
    return data


def render_markdown(audits: list[ProjectAudit], manifest: dict) -> str:
    out = [
        "# Project 2424 Structural Run-Readiness Audit",
        "",
        "> Structural evidence only. This report is not a scientific-success, novelty, reproduction, external-validation, or outcome-authorization certificate.",
        "",
        f"Manifest scope: {manifest.get('scope', 'unknown')}",
        f"Repository-backed identities audited: {len(audits)}",
        "",
        "| ID | Name | Structural | Class | Lock | Frozen | Missing / warnings |",
        "|---|---|---:|---|---|---|---|",
    ]
    for a in audits:
        warnings = "; ".join(a.warnings) if a.warnings else "—"
        out.append(
            f"| {a.project_id} | {a.registry_name} | "
            f"{a.structural_checks_passed}/{a.structural_checks_total} | {a.classification} | "
            f"{'YES' if a.explicit_outcome_lock else 'no'} | "
            f"{'YES' if a.frozen_negative_signal else 'no'} | {warnings} |"
        )
    out.extend(
        [
            "",
            "## Interpretation",
            "",
            "`STRUCTURALLY_NEAR_RUN_READY` means only that common repository surfaces were detected. A project can score highly and still be scientifically blocked, invalid, negative, improperly benchmarked, missing external validation, or explicitly forbidden from running outcomes.",
            "",
            "Explicit locks and frozen-result signals always take precedence over the structural score.",
        ]
    )
    return "\n".join(out) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=MANIFEST_DEFAULT)
    parser.add_argument("--projects-dir", type=Path, default=PROJECTS_DEFAULT)
    parser.add_argument("--json-out", type=Path)
    parser.add_argument("--md-out", type=Path)
    args = parser.parse_args()

    manifest = load_manifest(args.manifest)
    audits: list[ProjectAudit] = []

    for entry in manifest["entries"]:
        project_id = entry["id"]
        name = entry.get("registry_name", project_id)
        audits.append(audit_project(project_id, name, args.projects_dir / project_id))

    payload = {
        "schema_version": 1,
        "scientific_claim_boundary": "STRUCTURAL_ONLY",
        "manifest_sha256": sha256(args.manifest),
        "project_count": len(audits),
        "projects": [asdict(a) for a in audits],
    }

    rendered_json = json.dumps(payload, indent=2, sort_keys=True) + "\n"
    rendered_md = render_markdown(audits, manifest)

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(rendered_json, encoding="utf-8")
    else:
        print(rendered_json, end="")

    if args.md_out:
        args.md_out.parent.mkdir(parents=True, exist_ok=True)
        args.md_out.write_text(rendered_md, encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
