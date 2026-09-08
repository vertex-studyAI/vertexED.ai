#!/usr/bin/env python3
"""Verify the Eigen-JEPA deterministic conference-format release artifact.

This gate binds presentation to the already-retained mixed/negative evidence. It does
not rerun the experiment, upgrade the scientific result, establish venue compliance,
or authorize a stronger claim.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from typing import Any

STATUS = "DETERMINISTIC_CONFERENCE_FORMAT_ARTIFACT_VERIFIED_MIXED_NEGATIVE"
SOURCE_SHA256 = "076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c"
RESULT_MARKERS = (
    SOURCE_SHA256,
    "14,895",
    "1963-07-01",
    "2022-08-31",
    "111",
    "5.7734384e-09",
    "5.7896089e-09",
    "5.8318226e-09",
    "5.8762487e-09",
    "7.7708315e-09",
    "+5.8384e-11",
    "-2.3565e-10",
    "4.1744e-10",
)
TEX_MARKERS = (
    SOURCE_SHA256,
    "14,895",
    "1963-07-01",
    "2022-08-31",
    "n=111",
    r"5.7734384\times10^{-9}",
    r"5.7896089\times10^{-9}",
    r"5.8318226\times10^{-9}",
    r"5.8762487\!\times\!10^{-9}",
    r"7.7708315\times10^{-9}",
    r"+5.8384\times10^{-11}",
    r"-2.3565\times10^{-10}",
    r"4.1744\times10^{-10}",
    "does not establish superiority",
    "secondary log-distance ordering cannot rescue the primary result",
    "Any successor must be a new preregistration",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def sha256_file(path: pathlib.Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: pathlib.Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"{path} must contain a JSON object")
    return value


def parse_page_count(pdfinfo_text: str) -> int:
    match = re.search(r"^Pages:\s+(\d+)\s*$", pdfinfo_text, flags=re.MULTILINE)
    require(match is not None, "pdfinfo output is missing a parseable Pages field")
    pages = int(match.group(1))
    require(pages > 0, "paper PDF must contain at least one page")
    return pages


def verify_release_state(state: dict[str, Any]) -> int:
    require(state.get("schema_version") == 1, "release state schema must remain v1")
    require(
        state.get("artifact_status") == "MIXED_NEGATIVE_CONFERENCE_FORMAT_RELEASE_CANDIDATE",
        "release state must remain a mixed/negative release candidate",
    )

    fmt = state.get("format")
    evidence = state.get("canonical_evidence")
    science = state.get("science")
    require(isinstance(fmt, dict), "format state missing")
    require(isinstance(evidence, dict), "canonical evidence state missing")
    require(isinstance(science, dict), "science state missing")

    require(fmt.get("class") == "IEEEtran conference", "conference-format class drifted")
    require(fmt.get("double_blind") is True, "artifact must remain anonymous/double-blind")
    require(fmt.get("venue_compliance_claimed") is False, "artifact cannot claim venue compliance")
    page_ceiling = fmt.get("internal_page_ceiling")
    require(
        isinstance(page_ceiling, int) and not isinstance(page_ceiling, bool) and page_ceiling > 0,
        "internal page ceiling must be a positive integer",
    )

    require(evidence.get("results_path") == "portfolio/research/eigen-jepa/RESULTS.md", "results path drifted")
    require(
        evidence.get("manuscript_path")
        == "portfolio/research/papers/EIGEN_JEPA_MIXED_NEGATIVE_MANUSCRIPT.md",
        "manuscript path drifted",
    )
    require(evidence.get("source_sha256") == SOURCE_SHA256, "source evidence identity drifted")

    require(
        science.get("retained_result_status") == "FRESHLY REPRODUCED BOUNDARY/NEGATIVE COMPARISON",
        "retained result status drifted",
    )
    require(science.get("primary_metric") == "covariance matrix MSE", "primary metric drifted")
    require(science.get("superiority_over_raw_ridge_established") is False, "raw-ridge superiority cannot be enabled")
    require(science.get("superiority_over_log_ridge_established") is False, "log-ridge superiority cannot be enabled")
    require(science.get("external_validation") is False, "external validation cannot be enabled by a paper gate")
    require(science.get("publication_novelty_claimed") is False, "publication novelty cannot be enabled by a paper gate")
    require(science.get("financial_alpha_or_trading_claimed") is False, "alpha/trading claims cannot be enabled")
    require(science.get("successor_requires_new_preregistration") is True, "successor preregistration boundary drifted")
    return page_ceiling


def verify_canonical_text(results_text: str, manuscript_text: str) -> None:
    for marker in RESULT_MARKERS:
        require(marker in results_text, f"canonical RESULTS.md is missing retained marker: {marker}")
        require(marker in manuscript_text, f"manuscript is missing retained marker: {marker}")

    required_claims = (
        "does not establish superiority over raw ridge",
        "does not establish superiority over the stronger ridge controls",
        "secondary log-distance metric also does not rescue the primary claim",
        "Any successor must be a new preregistration",
    )
    for marker in required_claims:
        require(marker in manuscript_text, f"manuscript claim boundary missing: {marker}")


def verify_tex_source(tex: str) -> None:
    require(r"\documentclass[10pt,conference]{IEEEtran}" in tex, "conference-format document class missing")
    require(r"\author{\IEEEauthorblockN{Anonymous Authors}}" in tex, "anonymous author marker missing")
    require(r"\thanks{" not in tex, "author-identifying \\thanks metadata is forbidden")
    for marker in TEX_MARKERS:
        require(marker in tex, f"TeX artifact is missing retained marker: {marker}")

    forbidden_patterns = (
        r"Eigen-JEPA\s+(?:significantly\s+)?(?:outperforms|beats)\s+raw\s+ridge",
        r"Eigen-JEPA\s+(?:significantly\s+)?(?:outperforms|beats)\s+log\s+ridge",
        r"SUPERIORITY_ESTABLISHED",
        r"PUBLICATION_NOVELTY_ESTABLISHED",
        r"EXTERNAL_VALIDATION_ESTABLISHED",
    )
    for pattern in forbidden_patterns:
        require(re.search(pattern, tex, flags=re.IGNORECASE) is None, f"forbidden affirmative claim matched: {pattern}")


def verify_rendered_text(text: str) -> None:
    normalized = re.sub(r"\s+", " ", text)
    require("Anonymous Authors" in normalized, "rendered PDF is missing anonymous author marker")
    require("does not establish superiority" in normalized.lower(), "rendered PDF lost the negative primary verdict")
    require("new preregistration" in normalized.lower(), "rendered PDF lost the successor preregistration boundary")

    compact_digits = re.sub(r"\D", "", text)
    for digits in (
        "14895",
        "19630701",
        "20220831",
        "57734384",
        "57896089",
        "58318226",
        "58762487",
        "77708315",
        "58384",
        "23565",
        "41744",
    ):
        require(digits in compact_digits, f"rendered PDF is missing retained numeric token: {digits}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--paper-dir", required=True)
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--receipt", required=True)
    args = parser.parse_args()

    require(re.fullmatch(r"[0-9a-f]{40}", args.source_sha) is not None, "source SHA must be an exact lowercase 40-character Git SHA")

    repo_root = pathlib.Path(args.repo_root).resolve()
    paper_dir = pathlib.Path(args.paper_dir).resolve()
    pdf_path = pathlib.Path(args.pdf).resolve()
    receipt_path = pathlib.Path(args.receipt).resolve()
    tex_path = paper_dir / "main.tex"
    state_path = paper_dir / "RELEASE_STATE_V0.json"
    results_path = repo_root / "portfolio/research/eigen-jepa/RESULTS.md"
    manuscript_path = repo_root / "portfolio/research/papers/EIGEN_JEPA_MIXED_NEGATIVE_MANUSCRIPT.md"

    for path in (tex_path, state_path, results_path, manuscript_path):
        require(path.is_file(), f"required source file missing: {path}")
    require(pdf_path.is_file() and pdf_path.stat().st_size > 0, "paper PDF missing or empty")

    state = load_json(state_path)
    page_ceiling = verify_release_state(state)
    results_text = results_path.read_text(encoding="utf-8")
    manuscript_text = manuscript_path.read_text(encoding="utf-8")
    tex = tex_path.read_text(encoding="utf-8")
    verify_canonical_text(results_text, manuscript_text)
    verify_tex_source(tex)

    pdfinfo = subprocess.run(["pdfinfo", str(pdf_path)], check=True, capture_output=True, text=True).stdout
    pages = parse_page_count(pdfinfo)
    require(pages <= page_ceiling, f"paper exceeds internal release ceiling: {pages} > {page_ceiling}")

    rendered = subprocess.run(["pdftotext", str(pdf_path), "-"], check=True, capture_output=True, text=True).stdout
    verify_rendered_text(rendered)

    receipt = {
        "schema_version": 1,
        "status": STATUS,
        "source_sha": args.source_sha,
        "canonical_evidence": {
            "results_sha256": sha256_file(results_path),
            "manuscript_sha256": sha256_file(manuscript_path),
            "retained_source_sha256": SOURCE_SHA256,
        },
        "release_state": {
            "sha256": sha256_file(state_path),
            "artifact_status": state["artifact_status"],
        },
        "paper": {
            "tex_sha256": sha256_file(tex_path),
            "pdf_sha256": sha256_file(pdf_path),
            "pdf_bytes": pdf_path.stat().st_size,
            "pages": pages,
            "internal_page_ceiling": page_ceiling,
        },
        "scientific_boundary": {
            "retained_verdict": "MIXED_NEGATIVE",
            "primary_superiority_established": False,
            "external_validation": False,
            "publication_novelty_claimed": False,
            "financial_alpha_or_trading_claimed": False,
            "successor_requires_new_preregistration": True,
        },
    }
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(2)
