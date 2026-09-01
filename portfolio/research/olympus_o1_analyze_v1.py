#!/usr/bin/env python3
"""Deterministic, fail-closed analysis for the frozen Olympus O1 protocol.

This script analyzes retained per-task JSON artifacts only. It does not execute
an Olympus arm, alter the preregistration, or authorize an outcome run.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import statistics
from collections import defaultdict
from pathlib import Path

ARMS = (
    "monolithic",
    "olympus_full_prometheus_perseus_hermes",
    "olympus_without_perseus",
    "olympus_without_evidence_enforcement",
)
BOOTSTRAP_SEED = 20260829
BOOTSTRAP_RESAMPLES = 10_000


def _percentile(xs: list[float], p: float) -> float:
    if not xs:
        raise ValueError("empty percentile input")
    ys = sorted(xs)
    rank = (len(ys) - 1) * p
    lo, hi = math.floor(rank), math.ceil(rank)
    if lo == hi:
        return ys[lo]
    return ys[lo] * (hi - rank) + ys[hi] * (rank - lo)


def load_rows(root: Path) -> list[dict]:
    rows = []
    for path in sorted(root.rglob("*.json")):
        obj = json.loads(path.read_text())
        if obj.get("protocol") != "olympus-o1-v1":
            continue
        obj["_path"] = str(path)
        rows.append(obj)
    if not rows:
        raise ValueError("no olympus-o1-v1 artifacts found")
    return rows


def paired(rows: list[dict]) -> dict[str, dict[str, dict]]:
    by_task: dict[str, dict[str, dict]] = defaultdict(dict)
    for row in rows:
        task = row["task_id"]
        arm = row["arm"]
        if arm not in ARMS:
            raise ValueError(f"unknown arm {arm!r}")
        if arm in by_task[task]:
            raise ValueError(f"duplicate task/arm row: {task}/{arm}")
        by_task[task][arm] = row
    missing = {t: [a for a in ARMS if a not in arms] for t, arms in by_task.items()}
    missing = {t: a for t, a in missing.items() if a}
    if missing:
        raise ValueError(f"incomplete paired artifacts: {missing}")
    return by_task


def budget_parity(by_task: dict[str, dict[str, dict]]) -> list[str]:
    """Fail closed on execution-freeze drift and impossible usage observations.

    The preregistration requires equal ceilings/tool surfaces/retries/wall clock.
    Those frozen controls are represented by execution_freeze_hash. Actual token
    and latency use may differ by arm, so equality of observed consumption is not
    required; it is analyzed as an outcome instead.
    """
    errors = []
    for task, arms in sorted(by_task.items()):
        hashes = {r["execution_freeze_hash"] for r in arms.values()}
        revisions = {r["source_revision"] for r in arms.values()}
        families = {r["family"] for r in arms.values()}
        if len(hashes) != 1:
            errors.append(f"{task}: execution_freeze_hash differs across arms")
        if len(revisions) != 1:
            errors.append(f"{task}: source_revision differs across arms")
        if len(families) != 1:
            errors.append(f"{task}: family differs across arms")
    return errors


def rate(arms: list[dict], key: str) -> float:
    return sum(bool(x["metrics"][key]) for x in arms) / len(arms)


def bootstrap_completion_delta(by_task: dict[str, dict[str, dict]]) -> tuple[float, float, float]:
    pairs = [
        (
            int(arms["monolithic"]["metrics"]["reliable_completion"]),
            int(arms["olympus_full_prometheus_perseus_hermes"]["metrics"]["reliable_completion"]),
        )
        for _, arms in sorted(by_task.items())
    ]
    deltas = [b - a for a, b in pairs]
    observed = sum(deltas) / len(deltas)
    rng = random.Random(BOOTSTRAP_SEED)
    boots = []
    n = len(deltas)
    for _ in range(BOOTSTRAP_RESAMPLES):
        boots.append(sum(deltas[rng.randrange(n)] for _ in range(n)) / n)
    return observed, _percentile(boots, 0.025), _percentile(boots, 0.975)


def analyze(rows: list[dict]) -> dict:
    by_task = paired(rows)
    parity_errors = budget_parity(by_task)
    if parity_errors:
        return {"status": "INVALID_BUDGET_PARITY", "errors": parity_errors}

    grouped = {arm: [arms[arm] for _, arms in sorted(by_task.items())] for arm in ARMS}
    delta, ci_lo, ci_hi = bootstrap_completion_delta(by_task)
    mono = grouped["monolithic"]
    full = grouped["olympus_full_prometheus_perseus_hermes"]
    no_perseus = grouped["olympus_without_perseus"]
    no_evidence = grouped["olympus_without_evidence_enforcement"]

    mono_success, full_success = rate(mono, "reliable_completion"), rate(full, "reliable_completion")
    fals_full, fals_abl = rate(full, "falsification_caught"), rate(no_perseus, "falsification_caught")
    claims_full = rate(full, "unsupported_or_incorrect_claim")
    claims_abl = rate(no_evidence, "unsupported_or_incorrect_claim")
    perseus_gate = (fals_full - fals_abl >= 0.05) and (full_success >= rate(no_perseus, "reliable_completion"))
    rel_claim_reduction = 0.0 if claims_abl == 0 else (claims_abl - claims_full) / claims_abl
    evidence_gate = rel_claim_reduction >= 0.30 and (rate(no_evidence, "reliable_completion") - full_success <= 0.05)

    mono_latency = statistics.median(x["metrics"]["latency_seconds"] for x in mono)
    full_latency = statistics.median(x["metrics"]["latency_seconds"] for x in full)
    mono_tokens = statistics.median(x["metrics"]["token_use"] for x in mono)
    full_tokens = statistics.median(x["metrics"]["token_use"] for x in full)
    efficiency_exception = delta >= 0.10
    latency_gate = mono_latency == 0 or full_latency <= 1.5 * mono_latency or efficiency_exception
    token_gate = mono_tokens == 0 or full_tokens <= 1.5 * mono_tokens or efficiency_exception

    gates = {
        "full_olympus": delta >= 0.05 and ci_lo > 0,
        "perseus_distinct": perseus_gate,
        "evidence_enforcement_distinct": evidence_gate,
        "latency_budget": latency_gate,
        "token_budget": token_gate,
    }
    return {
        "status": "ANALYZED_NOT_EXECUTED_BY_THIS_SCRIPT",
        "protocol": "olympus-o1-v1",
        "task_count": len(by_task),
        "bootstrap": {"seed": BOOTSTRAP_SEED, "resamples": BOOTSTRAP_RESAMPLES, "delta": delta, "ci95": [ci_lo, ci_hi]},
        "raw_arm_counts": {arm: {"n": len(rs), "reliable_completion": sum(bool(r["metrics"]["reliable_completion"]) for r in rs)} for arm, rs in grouped.items()},
        "gates": gates,
        "promote_full_olympus": all((gates["full_olympus"], gates["latency_budget"], gates["token_budget"])),
        "integrity_note": "Negative, null, and mixed outcomes are retained; this analysis does not authorize training or execution.",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("artifacts", type=Path)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    result = analyze(load_rows(args.artifacts))
    text = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.out:
        args.out.write_text(text)
    else:
        print(text, end="")
    return 2 if result["status"] == "INVALID_BUDGET_PARITY" else 0


if __name__ == "__main__":
    raise SystemExit(main())
