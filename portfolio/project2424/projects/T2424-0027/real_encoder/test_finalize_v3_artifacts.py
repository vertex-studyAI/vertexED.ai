from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main() -> None:
    with tempfile.TemporaryDirectory() as td:
        out = Path(td)
        rows = []
        for i, seed in enumerate([2401, 2402, 2403, 2404, 2405]):
            x = 0.8 + i * 0.01
            rows.append({
                "seed": seed,
                "raw": {"intent_accuracy": 0.9, "language_accuracy": x},
                "language_centered": {"intent_accuracy": 0.89, "language_accuracy": 0.4},
                "global_centered": {"intent_accuracy": 0.9, "language_accuracy": 0.78},
                "random_group_centered": {"intent_accuracy": 0.9, "language_accuracy": 0.77},
                "random_subspace": {"intent_accuracy": 0.9, "language_accuracy": 0.76},
                "normalized_reductions": {
                    "language_centering": 0.85,
                    "global_centering": 0.1,
                    "random_group_centering": 0.12,
                    "random_subspace": 0.14,
                },
                "effect_retention": 0.88,
                "intent_drop": 0.01,
                "specificity_margin": 0.71,
                "predeclared_seed_pass": True,
            })
        (out / "per_seed_metrics.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
        summary = {
            "seed_count": 5,
            "seed_passes": 5,
            "mean_raw_intent_accuracy": 0.9,
            "mean_raw_language_accuracy": 0.82,
            "mean_language_centered_intent_accuracy": 0.89,
            "mean_language_centered_language_accuracy": 0.4,
            "mean_normalized_language_leakage_reduction": 0.85,
            "mean_effect_retention": 0.88,
            "mean_intent_drop": 0.01,
            "mean_specificity_margin": 0.71,
        }
        (out / "summary.json").write_text(json.dumps(summary), encoding="utf-8")
        for name in ["resolved_manifest.json", "environment.json", "dataset_fingerprint.json", "model_revision.json", "verdict.json"]:
            (out / name).write_text("{}\n", encoding="utf-8")

        subprocess.run([sys.executable, str(HERE / "finalize_v3_artifacts.py"), "--out", str(out)], check=True)
        final = json.loads((out / "summary.json").read_text(encoding="utf-8"))
        assert final["descriptive_uncertainty"]["raw_language_accuracy"]["n"] == 5
        assert final["descriptive_uncertainty"]["raw_language_accuracy"]["sample_sd"] > 0
        assert (out / "SHA256SUMS.txt").is_file()
        assert len((out / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()) == 7
    print("PASS: v3 artifact finalizer synthetic regression")


if __name__ == "__main__":
    main()
