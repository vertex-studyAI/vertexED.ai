from __future__ import annotations

import hashlib
import json
import math
import statistics
from pathlib import Path
from typing import Any, Callable

HERE = Path(__file__).resolve().parent
T_CRIT_DF4_975 = 2.7764451051977987


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def stat(values: list[float]) -> dict[str, float | int]:
    if len(values) != 5:
        raise RuntimeError(f"Frozen v3 uncertainty requires exactly 5 seeds; got {len(values)}")
    vals = [float(v) for v in values]
    if not all(math.isfinite(v) for v in vals):
        raise RuntimeError("Non-finite value encountered in frozen descriptive statistics")
    mean = statistics.fmean(vals)
    sd = statistics.stdev(vals)
    half = T_CRIT_DF4_975 * sd / math.sqrt(len(vals))
    return {
        "n": len(vals),
        "mean": mean,
        "sample_sd": sd,
        "student_t_95_ci_lower": mean - half,
        "student_t_95_ci_upper": mean + half,
        "student_t_critical_df4": T_CRIT_DF4_975,
    }


def get(row: dict[str, Any], path: tuple[str, ...]) -> float:
    cur: Any = row
    for key in path:
        cur = cur[key]
    return float(cur)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    out = Path(args.out).resolve()

    rows = [json.loads(line) for line in (out / "per_seed_metrics.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    seeds = [int(r["seed"]) for r in rows]
    if seeds != [2401, 2402, 2403, 2404, 2405]:
        raise RuntimeError(f"Unexpected seed order/content: {seeds}")

    metrics: dict[str, tuple[str, ...]] = {
        "raw_intent_accuracy": ("raw", "intent_accuracy"),
        "raw_language_accuracy": ("raw", "language_accuracy"),
        "language_centered_intent_accuracy": ("language_centered", "intent_accuracy"),
        "language_centered_language_accuracy": ("language_centered", "language_accuracy"),
        "global_centered_intent_accuracy": ("global_centered", "intent_accuracy"),
        "global_centered_language_accuracy": ("global_centered", "language_accuracy"),
        "random_group_centered_intent_accuracy": ("random_group_centered", "intent_accuracy"),
        "random_group_centered_language_accuracy": ("random_group_centered", "language_accuracy"),
        "random_subspace_intent_accuracy": ("random_subspace", "intent_accuracy"),
        "random_subspace_language_accuracy": ("random_subspace", "language_accuracy"),
        "language_centering_normalized_reduction": ("normalized_reductions", "language_centering"),
        "global_centering_normalized_reduction": ("normalized_reductions", "global_centering"),
        "random_group_centering_normalized_reduction": ("normalized_reductions", "random_group_centering"),
        "random_subspace_normalized_reduction": ("normalized_reductions", "random_subspace"),
        "effect_retention": ("effect_retention",),
        "intent_drop": ("intent_drop",),
        "specificity_margin": ("specificity_margin",),
    }
    uncertainty = {name: stat([get(row, path) for row in rows]) for name, path in metrics.items()}

    summary_path = out / "summary.json"
    summary = read_json(summary_path)
    crosschecks = {
        "mean_raw_intent_accuracy": "raw_intent_accuracy",
        "mean_raw_language_accuracy": "raw_language_accuracy",
        "mean_language_centered_intent_accuracy": "language_centered_intent_accuracy",
        "mean_language_centered_language_accuracy": "language_centered_language_accuracy",
        "mean_normalized_language_leakage_reduction": "language_centering_normalized_reduction",
        "mean_effect_retention": "effect_retention",
        "mean_intent_drop": "intent_drop",
        "mean_specificity_margin": "specificity_margin",
    }
    for summary_key, metric_name in crosschecks.items():
        if not math.isclose(float(summary[summary_key]), float(uncertainty[metric_name]["mean"]), rel_tol=0.0, abs_tol=1e-12):
            raise RuntimeError(f"Mean cross-check failed for {summary_key}")

    summary["descriptive_uncertainty"] = uncertainty
    summary["uncertainty_policy"] = "Sample SD and two-sided 95% Student-t CI across the five frozen seeds; descriptive only; frozen decision gate unchanged."
    write_json(summary_path, summary)

    required = [
        "resolved_manifest.json",
        "environment.json",
        "dataset_fingerprint.json",
        "model_revision.json",
        "per_seed_metrics.jsonl",
        "summary.json",
        "verdict.json",
    ]
    missing = [name for name in required if not (out / name).is_file()]
    if missing:
        raise RuntimeError(f"Missing required outcome artifacts before hashing: {missing}")

    lines = []
    for name in sorted(required):
        digest = hashlib.sha256((out / name).read_bytes()).hexdigest()
        lines.append(f"{digest}  {name}")
    (out / "SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("PASS: added preregistered uncertainty reporting and SHA256SUMS without changing decision gates")


if __name__ == "__main__":
    main()
