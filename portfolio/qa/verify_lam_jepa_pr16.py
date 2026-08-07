from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

TARGET_COMMIT = "4c7ee1280587da3e73b7ffd596190be657733aab"
MATCHED_EXPECTED = {
    "train_digest": "85c5fb3aa018e82fa161603dab0afe2ca96dfcc31f437251e3a1af25da4d3e35",
    "validation_digest": "f0c10d3ce48be1e267605b5889948441e3fe03db3d609351ede6616731f5c1cc",
    "train_id_digest": "d1e0820fadc62242485066ec95352fa8705a313f98b1de987d8aa87e19dfbaf6",
    "validation_id_digest": "a21f6ea9610f0e3c5cf69fe3be9d8944e93be30739cf45210ec6242dd0e64b48",
    "lam_active": 86372,
    "matched_active": 86644,
    "lam_mean": 0.25,
    "matched_mean": 0.25,
    "delta_mean": 0.0,
}
PRETRAINED_EXPECTED = {
    "train_digest": "8c04d2392637670062b1a29e66ccf390e51e3e2a26f7dce95a4dc8531f1a3da7",
    "validation_digest": "10edd4181703f185b03f83f1dd3932d47a318dc882d0413ef5d7ae3f2867d672",
    "train_id_digest": "313076855c9069541342f93dfb990b9f980cc886c83b0c33ec6d1a3059464d2f",
    "validation_id_digest": "e2967748171bed2a42d0526911d516ffbaa46610e6564f98f33649c8c7b16598",
    "model_revision": "fb53ab8802853c8e4fbdbcd0529f21fc6f459b2b",
    "parameters": 82119169,
    "lam_mean": 0.15625,
    "pretrained_mean": 0.125,
    "delta_mean": 0.03125,
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def read_json(path: Path) -> dict:
    require(path.is_file(), f"missing artifact: {path}")
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"artifact must be an object: {path}")
    return value


def exact_float(actual, expected, label: str) -> None:
    require(math.isclose(float(actual), float(expected), rel_tol=1e-12, abs_tol=1e-12), f"{label}: {actual} != {expected}")


def verify_common(protocol: dict, expected: dict) -> None:
    require(protocol.get("dataset") == "AI2 ARC-Challenge", "dataset changed")
    require(protocol.get("train_validation_overlap") == 0, "train/validation leakage detected")
    require(protocol.get("test_split_policy") == "not downloaded or evaluated by this development command", "test boundary changed")
    require(protocol.get("seeds") == [1, 2], "seed protocol changed")
    for key in ("train_digest", "validation_digest", "train_id_digest", "validation_id_digest"):
        require(protocol.get(key) == expected[key], f"{key} changed")


def verify_prediction_identity(payload: dict, left_key: str, right_key: str) -> None:
    records = payload.get("records")
    require(isinstance(records, list) and len(records) == 2, "expected two seed records")
    canonical_ids = None
    for expected_seed, record in zip([1, 2], records, strict=True):
        require(record.get("seed") == expected_seed, "seed record mismatch")
        left = record.get(left_key)
        right = record.get(right_key)
        require(isinstance(left, dict) and isinstance(right, dict), "comparison record missing")
        left_rows = left.get("predictions")
        right_rows = right.get("predictions")
        require(isinstance(left_rows, list) and isinstance(right_rows, list), "raw predictions missing")
        left_ids = [row.get("id") for row in left_rows]
        right_ids = [row.get("id") for row in right_rows]
        require(left_ids == right_ids, "models did not evaluate identical ordered rows")
        require([row.get("label") for row in left_rows] == [row.get("label") for row in right_rows], "model labels differ")
        if canonical_ids is None:
            canonical_ids = left_ids
        else:
            require(left_ids == canonical_ids, "evaluation rows changed across seeds")
        left_reversed = left.get("choice_reversal_predictions")
        right_reversed = right.get("choice_reversal_predictions")
        require(isinstance(left_reversed, list) and isinstance(right_reversed, list), "reversal predictions missing")
        require([row.get("id") for row in left_reversed] == canonical_ids, "reversal changed left item identity")
        require([row.get("id") for row in right_reversed] == canonical_ids, "reversal changed right item identity")
        labels = [int(row["label"]) for row in left_rows]
        require([int(row["label"]) for row in left_reversed] == [3 - value for value in labels], "left reversal remapping invalid")
        require([int(row["label"]) for row in right_reversed] == [3 - value for value in labels], "right reversal remapping invalid")


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent control-repo verifier for LAM-JEPA PR #16.")
    parser.add_argument("--matched", type=Path, required=True)
    parser.add_argument("--pretrained", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    require(args.target_commit_file.read_text(encoding="utf-8").strip() == TARGET_COMMIT, "target commit mismatch")
    matched = read_json(args.matched)
    pretrained = read_json(args.pretrained)

    matched_protocol = matched.get("protocol")
    pretrained_protocol = pretrained.get("protocol")
    require(isinstance(matched_protocol, dict) and isinstance(pretrained_protocol, dict), "protocol missing")
    verify_common(matched_protocol, MATCHED_EXPECTED)
    verify_common(pretrained_protocol, PRETRAINED_EXPECTED)

    require(matched_protocol.get("lam_gradient_active_parameters") == MATCHED_EXPECTED["lam_active"], "LAM active parameter count changed")
    require(matched_protocol.get("matched_supervised_gradient_active_parameters") == MATCHED_EXPECTED["matched_active"], "matched baseline parameter count changed")
    require(matched_protocol.get("matched_supervised_trainable_parameters") == MATCHED_EXPECTED["matched_active"], "matched baseline contains inactive trainable padding")
    require(float(matched_protocol.get("parameter_relative_gap", 1.0)) < 0.01, "parameter match degraded beyond 1%")
    require(matched_protocol.get("strong_pretrained_baseline") == "NOT_INCLUDED", "matched smoke claim boundary changed")
    verify_prediction_identity(matched, "lam_jepa", "matched_supervised")
    matched_summary = matched.get("summary", {})
    exact_float(matched_summary["lam_accuracy"]["mean"], MATCHED_EXPECTED["lam_mean"], "matched smoke LAM mean")
    exact_float(matched_summary["matched_supervised_accuracy"]["mean"], MATCHED_EXPECTED["matched_mean"], "matched smoke baseline mean")
    exact_float(matched_summary["paired_accuracy_delta_lam_minus_matched"]["mean"], MATCHED_EXPECTED["delta_mean"], "matched smoke delta")

    require(pretrained_protocol.get("pretrained_model_revision") == PRETRAINED_EXPECTED["model_revision"], "pretrained revision changed")
    require(pretrained_protocol.get("resolved_pretrained_revision") == PRETRAINED_EXPECTED["model_revision"], "resolved pretrained revision changed")
    require(pretrained_protocol.get("pretrained_model_trainable_parameters") == PRETRAINED_EXPECTED["parameters"], "pretrained parameter count changed")
    require(pretrained_protocol.get("transformers_version") == "4.57.6", "transformers runtime changed")
    require("not matched" in str(pretrained_protocol.get("comparison_type", "")), "compute/capacity mismatch boundary missing")
    verify_prediction_identity(pretrained, "lam_jepa", "pretrained_baseline")
    pretrained_summary = pretrained.get("summary", {})
    exact_float(pretrained_summary["lam_accuracy"]["mean"], PRETRAINED_EXPECTED["lam_mean"], "pretrained smoke LAM mean")
    exact_float(pretrained_summary["pretrained_accuracy"]["mean"], PRETRAINED_EXPECTED["pretrained_mean"], "pretrained smoke baseline mean")
    exact_float(pretrained_summary["paired_accuracy_delta_lam_minus_pretrained"]["mean"], PRETRAINED_EXPECTED["delta_mean"], "pretrained smoke delta")

    report = {
        "verdict": "RESEARCH_REPRODUCED_WITH_LIMITATIONS",
        "target_commit": TARGET_COMMIT,
        "matched_smoke_reproduced": True,
        "pretrained_smoke_reproduced": True,
        "independent_verifier_repository": "vertex-studyAI/vertexED.ai",
        "test_split_evaluated": False,
        "final_five_seed_protocol_executed": False,
        "external_validation": False,
        "research_complete": False,
        "claim_boundary": "Independent clean-run reproduction covers the bounded PR #16 smoke artifacts only; it does not establish model superiority or final scientific validity.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
