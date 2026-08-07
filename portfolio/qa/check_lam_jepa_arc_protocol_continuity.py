from __future__ import annotations

import argparse
import json
from pathlib import Path


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def load(path: Path) -> dict:
    require(path.is_file(), f"protocol missing: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(payload, dict), f"protocol must be an object: {path}")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent v1→v2 LAM-JEPA ARC protocol continuity check.")
    parser.add_argument("--v1", type=Path, required=True)
    parser.add_argument("--v2", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    v1 = load(args.v1)
    v2 = load(args.v2)
    require(v1.get("protocol_id") == "lam-jepa-arc-challenge-v1", "unexpected v1 protocol id")
    require(v2.get("protocol_id") == "lam-jepa-arc-challenge-v2", "unexpected v2 protocol id")
    require(v2.get("supersedes") == v1.get("protocol_id"), "v2 does not supersede v1")
    require(v1.get("status") == v2.get("status") == "FROZEN_BEFORE_CONFIRMATORY_TEST", "freeze status changed")

    for key in (
        "scientific_question",
        "claim_scope",
        "dataset",
        "training_budget",
        "metrics",
        "robustness",
        "negative_control",
        "ablations",
        "claim_gate",
    ):
        require(v1.get(key) == v2.get(key), f"scientific contract changed unexpectedly: {key}")

    require(
        v1.get("models", {}).get("strong_pretrained_baseline")
        == v2.get("models", {}).get("strong_pretrained_baseline"),
        "pretrained baseline contract changed",
    )
    require(v1.get("models", {}).get("lam_jepa") == v2.get("models", {}).get("lam_jepa"), "LAM model contract changed")
    require(
        v1.get("models", {}).get("matched_capacity_supervised_baseline")
        != v2.get("models", {}).get("matched_capacity_supervised_baseline"),
        "v2 does not contain the declared matched-capacity correction",
    )
    require(
        "gradient-active" in str(v2["models"]["matched_capacity_supervised_baseline"].get("parameter_accounting", "")),
        "v2 matched-capacity correction is not gradient-active",
    )

    pretrained = v2["models"]["strong_pretrained_baseline"]
    require(pretrained.get("model") == "microsoft/deberta-v3-xsmall", "frozen model changed")
    require(pretrained.get("revision") == "14809e4f1fe1895fcba8b258271a940c6ca45ec4", "frozen revision changed")
    require(pretrained.get("license") == "MIT", "frozen license changed")
    require(v2["training_budget"]["training_seeds"] == [1, 2, 3, 4, 5], "frozen seeds changed")
    require(v2["training_budget"]["epochs"] == 20, "frozen epochs changed")
    require(v2["training_budget"]["batch_size"] == 32, "frozen batch size changed")
    require(float(v2["training_budget"]["pretrained_baseline_learning_rate"]) == 2e-5, "frozen pretrained LR changed")

    report = {
        "status": "passed",
        "v1": v1["protocol_id"],
        "v2": v2["protocol_id"],
        "v2_supersedes_v1": True,
        "pretrained_contract_unchanged": True,
        "test_access_authorized": False,
        "verified_by": "vertex-studyAI/vertexED.ai control repository",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
