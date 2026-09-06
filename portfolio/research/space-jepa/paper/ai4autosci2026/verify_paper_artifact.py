#!/usr/bin/env python3
"""Fail-closed verifier for the Space-JEPA AI4AutoSci pre-outcome PDF artifact.

This verifier checks publication packaging only. It must never authorize scientific
execution, held-out outcome access, or a stronger scientific claim.
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


PREOUTCOME_STATUS = "PRE_OUTCOME_PAPER_ARTIFACT_VERIFIED_NOT_SCIENTIFIC_RESULT"


def sha256_file(path: pathlib.Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: pathlib.Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def parse_page_count(pdfinfo_text: str) -> int:
    match = re.search(r"^Pages:\s+(\d+)\s*$", pdfinfo_text, flags=re.MULTILINE)
    if not match:
        raise ValueError("pdfinfo output does not contain a parseable Pages field")
    pages = int(match.group(1))
    require(pages > 0, "paper PDF must contain at least one page")
    return pages


def verify_submission_state(state: dict[str, Any]) -> int:
    require(state.get("schema_version") == 2, "submission state schema must remain v2")

    venue = state.get("venue")
    manuscript = state.get("manuscript")
    esa = state.get("esa_primary")
    gate = state.get("submission_gate")
    require(isinstance(venue, dict), "venue state missing")
    require(isinstance(manuscript, dict), "manuscript state missing")
    require(isinstance(esa, dict), "ESA primary state missing")
    require(isinstance(gate, dict), "submission gate state missing")

    require(venue.get("double_blind") is True, "double-blind venue boundary must remain true")
    max_pages = venue.get("max_pages")
    require(isinstance(max_pages, int) and not isinstance(max_pages, bool) and max_pages > 0,
            "venue max_pages must be a positive integer")

    require(manuscript.get("status") == "DRAFT_PRE_OUTCOME",
            "manuscript must remain DRAFT_PRE_OUTCOME")
    require(manuscript.get("quantitative_results_inserted") is False,
            "quantitative results must remain absent in this pre-outcome gate")
    require(manuscript.get("superiority_claim_allowed") is False,
            "superiority claims must remain disabled pre-outcome")
    require(manuscript.get("localization_claim_allowed") is False,
            "localization claims must remain disabled pre-outcome")

    for key in (
        "outcome_access_authorized",
        "execution_authorized",
        "model_outcomes_generated",
        "retained_result_package_complete",
    ):
        require(esa.get(key) is False, f"esa_primary.{key} must remain false")

    require(gate.get("scientifically_ready") is False,
            "paper artifact verification cannot mark the study scientifically ready")
    require(gate.get("results_section_ready") is False,
            "results section must remain blocked before retained outcomes exist")
    require(gate.get("primary_endpoint_reconciled_to_freeze") is True,
            "paper must remain reconciled to the frozen ESA endpoint")

    return max_pages


def verify_source_text(tex: str) -> None:
    required = (
        r"\author{\IEEEauthorblockN{Anonymous Authors}}",
        r"\textbf{RESULTS\_BLOCKED\_PRE\_OUTCOME.}",
        r"\textbf{CHANNEL\_RESULTS\_BLOCKED\_PRE\_OUTCOME.}",
        "No post-outcome significance test or practical-effect threshold is part of this primary decision rule.",
        "null and adverse results are first-class outcomes",
    )
    for marker in required:
        require(marker in tex, f"required manuscript boundary missing: {marker}")

    forbidden = (
        r"\thanks{",
        "RESULTS_UNBLOCKED",
        "CHANNEL_RESULTS_UNBLOCKED",
    )
    for marker in forbidden:
        require(marker not in tex, f"forbidden pre-outcome manuscript marker present: {marker}")


def verify_rendered_text(text: str) -> None:
    normalized = re.sub(r"\s+", " ", text)
    required = (
        "Anonymous Authors",
        "RESULTS_BLOCKED_PRE_OUTCOME",
        "CHANNEL_RESULTS_BLOCKED_PRE_OUTCOME",
        "mission1-lite",
        "mission2-lite",
        "EW_F_0.50",
    )
    for marker in required:
        require(marker in normalized, f"rendered PDF is missing required marker: {marker}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--paper-dir", required=True)
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--receipt", required=True)
    args = parser.parse_args()

    paper_dir = pathlib.Path(args.paper_dir).resolve()
    pdf_path = pathlib.Path(args.pdf).resolve()
    receipt_path = pathlib.Path(args.receipt).resolve()
    tex_path = paper_dir / "main.tex"
    state_path = paper_dir / "SUBMISSION_STATE_V0.json"

    require(re.fullmatch(r"[0-9a-f]{40}", args.source_sha) is not None,
            "source SHA must be an exact 40-character lowercase Git SHA")
    require(tex_path.is_file(), "main.tex missing")
    require(state_path.is_file(), "SUBMISSION_STATE_V0.json missing")
    require(pdf_path.is_file() and pdf_path.stat().st_size > 0, "paper PDF missing or empty")

    state = load_json(state_path)
    max_pages = verify_submission_state(state)
    tex = tex_path.read_text(encoding="utf-8")
    verify_source_text(tex)

    pdfinfo = subprocess.run(
        ["pdfinfo", str(pdf_path)],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    pages = parse_page_count(pdfinfo)
    require(pages <= max_pages,
            f"paper exceeds frozen venue limit: {pages} pages > {max_pages}")

    rendered = subprocess.run(
        ["pdftotext", str(pdf_path), "-"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    verify_rendered_text(rendered)

    receipt = {
        "schema_version": 1,
        "status": PREOUTCOME_STATUS,
        "source_sha": args.source_sha,
        "manuscript": {
            "path": str(tex_path.relative_to(pathlib.Path.cwd())),
            "sha256": sha256_file(tex_path),
        },
        "submission_state": {
            "path": str(state_path.relative_to(pathlib.Path.cwd())),
            "sha256": sha256_file(state_path),
        },
        "pdf": {
            "path": pdf_path.name,
            "sha256": sha256_file(pdf_path),
            "bytes": pdf_path.stat().st_size,
            "pages": pages,
            "max_pages": max_pages,
        },
        "scientific_boundary": {
            "execution_authorized": False,
            "outcome_access_authorized": False,
            "model_outcomes_generated": False,
            "retained_result_package_complete": False,
            "scientifically_ready": False,
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
