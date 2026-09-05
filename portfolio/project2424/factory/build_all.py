#!/usr/bin/env python3
"""Materialize repo-ready Project 2424 child packages.

This generator intentionally creates *research repositories*, not fake research.
Unresolved IDs remain RESERVED and their experiment entry point fails closed.
First-100 identities are read from the canonical queue. Evidence-backed states
may be overlaid from a reviewed evidence manifest.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIRST100 = ROOT / "FIRST_100_QUEUE.ndjson"
EVIDENCE_OVERLAY = Path(__file__).with_name("evidence_overlay.json")

REQUIRED = [
    "PROJECT.yaml", "RESEARCH_SPEC.md", "PROTOCOL.yaml", "EVIDENCE.json",
    "CLAIMS.md", "REPRODUCE.md", "STATE.md", "pyproject.toml",
    "src/experiment.py", "tests/test_contract.py", "manuscript/paper.tex",
    "manuscript/references.bib", ".github/workflows/ci.yml",
]


def read_first100() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for raw in FIRST100.read_text(encoding="utf-8").splitlines():
        raw = raw.strip()
        if not raw:
            continue
        row = json.loads(raw)
        out[row["id"]] = row
    return out


def read_overlay() -> dict[str, dict]:
    if not EVIDENCE_OVERLAY.exists():
        return {}
    return json.loads(EVIDENCE_OVERLAY.read_text(encoding="utf-8"))


def yaml_quote(v: str) -> str:
    return json.dumps(v, ensure_ascii=False)


def safe_pkg(project_id: str) -> str:
    return project_id.lower().replace("-", "_")


def project_yaml(pid: str, row: dict | None, overlay: dict | None) -> str:
    state = overlay.get("state") if overlay else ("IDENTIFIED" if row else "RESERVED")
    name = row.get("name") if row else "UNRESOLVED RESERVED PROJECT"
    track = row.get("track") if row else "UNRESOLVED"
    rank = row.get("rank") if row else None
    return "\n".join([
        f"project_id: {yaml_quote(pid)}",
        f"canonical_name: {yaml_quote(name)}",
        f"state: {yaml_quote(state)}",
        f"first100_rank: {json.dumps(rank)}",
        f"track: {yaml_quote(track)}",
        "lineage_parent: null",
        "duplicate_of: null",
        "identity_locked: false" if not row else "identity_locked: true",
        "preprint_ready: false",
        "evidence_policy: fail_closed",
        "",
    ])


def research_spec(pid: str, row: dict | None, overlay: dict | None) -> str:
    name = row.get("name") if row else "UNRESOLVED RESERVED PROJECT"
    if overlay and overlay.get("research_question"):
        q = overlay["research_question"]
        h = overlay.get("hypothesis", "TBD — freeze before confirmatory work.")
        f = overlay.get("falsifier", "TBD — freeze before confirmatory work.")
    else:
        q = "TBD — resolve from canonical source/evidence before experimentation."
        h = "TBD — must be falsifiable and frozen before confirmatory work."
        f = "TBD — define the result that would disconfirm the hypothesis."
    return f"""# {pid} — {name}\n\n## Research question\n{q}\n\n## Novelty / closest work\nTBD. Search current literature and record the closest competing methods before promoting this project beyond SPECIFIED.\n\n## Falsifiable hypothesis\n{h}\n\n## Falsifier\n{f}\n\n## Evidence boundary\nDo not claim generality, superiority, mechanism, causality, or real-world validity beyond the frozen protocol and preserved artifacts.\n\n## Duplication check\nTBD. If the scientific contribution is not independent, set `duplicate_of` and merge the child into the appropriate research family rather than manufacturing a separate paper.\n"""


def protocol_yaml(row: dict | None, overlay: dict | None) -> str:
    primary = overlay.get("primary_metric") if overlay else None
    return "\n".join([
        "protocol_version: 0",
        "frozen: false",
        "dataset_or_environment: TBD",
        "split_policy: TBD",
        "baselines: []",
        f"primary_metric: {yaml_quote(primary or 'TBD')}",
        "secondary_metrics: []",
        "seeds: []",
        "determinism_policy: TBD",
        "success_threshold: TBD",
        "falsification_threshold: TBD",
        "statistical_analysis: TBD",
        "compute_budget: TBD",
        "stop_rule: TBD",
        "confirmatory_data_locked: true",
        "",
    ])


def evidence_json(pid: str, overlay: dict | None) -> str:
    base = {
        "project_id": pid,
        "state": overlay.get("state", "UNKNOWN") if overlay else "UNKNOWN",
        "commit_sha": None,
        "protocol_hash": None,
        "environment_hash": None,
        "raw_artifacts": [],
        "runs": [],
        "headline_result": overlay.get("headline_result") if overlay else None,
        "verdict": overlay.get("verdict") if overlay else None,
        "independent_reproduction": False,
        "preprint_gate": False,
        "notes": overlay.get("notes", "No reviewed evidence overlay.") if overlay else "No reviewed evidence overlay.",
    }
    return json.dumps(base, indent=2, ensure_ascii=False) + "\n"


def state_md(pid: str, row: dict | None, overlay: dict | None) -> str:
    state = overlay.get("state") if overlay else ("IDENTIFIED" if row else "RESERVED")
    next_gate = overlay.get("next_gate") if overlay else (
        "Freeze research question, novelty review, falsifier, baselines and protocol."
        if row else "Resolve canonical identity from source/registry/evidence."
    )
    return f"# State\n\n- Project: `{pid}`\n- Current state: **{state}**\n- Preprint-ready: **NO**\n- Next gate: {next_gate}\n"


def experiment_py(pid: str, row: dict | None) -> str:
    identified = row is not None
    return f'''"""Canonical experiment entry point for {pid}."""\nfrom pathlib import Path\nimport json\n\nPROJECT_ID = "{pid}"\nIDENTIFIED = {identified!r}\n\ndef main() -> int:\n    evidence = json.loads((Path(__file__).resolve().parents[1] / "EVIDENCE.json").read_text())\n    if not IDENTIFIED:\n        raise SystemExit("FAIL-CLOSED: project identity is unresolved; experimentation is forbidden.")\n    if evidence.get("protocol_hash") is None:\n        raise SystemExit("FAIL-CLOSED: no frozen protocol hash recorded. Freeze PROTOCOL.yaml before execution.")\n    raise SystemExit("FAIL-CLOSED: project-specific scientific implementation has not yet been installed.")\n\nif __name__ == "__main__":\n    raise SystemExit(main())\n'''


def test_contract(pid: str) -> str:
    return f'''from pathlib import Path\nimport json\n\nROOT = Path(__file__).resolve().parents[1]\n\ndef test_required_contract_files_exist():\n    required = {REQUIRED!r}\n    missing = [p for p in required if not (ROOT / p).exists()]\n    assert not missing, f"missing contract files: {{missing}}"\n\ndef test_evidence_fails_closed():\n    e = json.loads((ROOT / "EVIDENCE.json").read_text())\n    if e.get("preprint_gate"):\n        assert e.get("independent_reproduction") is True\n        assert e.get("commit_sha")\n        assert e.get("protocol_hash")\n        assert e.get("raw_artifacts")\n'''


def paper_tex(pid: str, row: dict | None, overlay: dict | None) -> str:
    name = row.get("name") if row else "Unresolved Project 2424 Study"
    result = overlay.get("headline_result") if overlay else None
    results_text = result if result else "No evidence-backed result is available yet. This manuscript must not be released as a preprint until the frozen experiment is executed and independently reproduced."
    return r'''\documentclass[10pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{booktabs}
\usepackage{amsmath}
\usepackage{hyperref}
\title{%s}
\author{Project 2424 Research Team}
\date{}
\begin{document}
\maketitle
\begin{abstract}
This is an evidence-gated manuscript. The abstract remains provisional until the main result is independently reproduced and the claim ledger passes.
\end{abstract}
\section{Introduction}
The final introduction must define one narrow research question, establish the closest prior work, and state a falsifiable contribution without overstating the evidence.
\section{Related Work}
Literature review pending project-specific novelty verification.
\section{Methods}
The final paper must mirror the frozen protocol and canonical implementation exactly.
\section{Experimental Setup}
Report data provenance, splits, baselines, metrics, seeds, compute budget, statistical procedure, and pre-specified success/falsification gates.
\section{Results}
%s
\section{Discussion}
Finalize only after independent reproduction. Preserve negative, mixed, and inconclusive outcomes.
\section{Limitations}
State all known scope, data, external-validity, and mechanism limitations.
\section{Conclusion}
Finalize only after the claim audit and reproduction gate pass.
\bibliographystyle{plain}
\bibliography{references}
\end{document}
''' % (name.replace('&', r'\&'), results_text.replace('%', r'\%').replace('&', r'\&'))


def ci_yaml() -> str:
    return """name: research-contract\non: [push, pull_request]\njobs:\n  contract:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - run: python -m pip install -U pip pytest\n      - run: pytest -q\n"""


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def materialize_one(out_root: Path, pid: str, row: dict | None, overlay: dict | None) -> None:
    root = out_root / pid
    root.mkdir(parents=True, exist_ok=True)
    write(root / "PROJECT.yaml", project_yaml(pid, row, overlay))
    write(root / "RESEARCH_SPEC.md", research_spec(pid, row, overlay))
    write(root / "PROTOCOL.yaml", protocol_yaml(row, overlay))
    write(root / "EVIDENCE.json", evidence_json(pid, overlay))
    write(root / "CLAIMS.md", "# Claim ledger\n\n| Claim | Evidence | Confidence | Allowed? |\n|---|---|---|---|\n| No approved manuscript claims yet. | — | — | NO |\n")
    write(root / "REPRODUCE.md", "# Reproduction\n\nNo reproduction command is approved until the protocol is frozen and the canonical implementation is installed.\n")
    write(root / "STATE.md", state_md(pid, row, overlay))
    write(root / "pyproject.toml", f'''[project]\nname = "{safe_pkg(pid)}"\nversion = "0.0.1"\nrequires-python = ">=3.11"\n\n[tool.pytest.ini_options]\ntestpaths = ["tests"]\n''')
    write(root / "src" / "experiment.py", experiment_py(pid, row))
    write(root / "tests" / "test_contract.py", test_contract(pid))
    write(root / "manuscript" / "paper.tex", paper_tex(pid, row, overlay))
    write(root / "manuscript" / "references.bib", "% Add only verified project-specific references.\n")
    write(root / ".github" / "workflows" / "ci.yml", ci_yaml())
    write(root / "README.md", f"# {pid} — {(row or {}).get('name','UNRESOLVED RESERVED PROJECT')}\n\nSee `STATE.md` and `RESEARCH_SPEC.md`. The repository fails closed until scientific prerequisites are satisfied.\n")


def validate_repo(root: Path) -> list[str]:
    errors = []
    for rel in REQUIRED:
        if not (root / rel).exists():
            errors.append(f"missing {rel}")
    try:
        evidence = json.loads((root / "EVIDENCE.json").read_text(encoding="utf-8"))
        if evidence.get("preprint_gate"):
            for key in ("commit_sha", "protocol_hash"):
                if not evidence.get(key):
                    errors.append(f"preprint gate set without {key}")
            if not evidence.get("raw_artifacts"):
                errors.append("preprint gate set without raw_artifacts")
            if evidence.get("independent_reproduction") is not True:
                errors.append("preprint gate set without independent reproduction")
    except Exception as exc:
        errors.append(f"invalid evidence: {exc}")
    return errors


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()
    first100 = read_first100()
    overlay = read_overlay()
    for i in range(1, 2425):
        pid = f"T2424-{i:04d}"
        materialize_one(args.out, pid, first100.get(pid), overlay.get(pid))
    if args.validate:
        bad = {}
        for i in range(1, 2425):
            pid = f"T2424-{i:04d}"
            errs = validate_repo(args.out / pid)
            if errs:
                bad[pid] = errs
        if bad:
            print(json.dumps(bad, indent=2))
            return 1
    print(f"materialized 2424 project packages under {args.out}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
