from __future__ import annotations

import argparse
import json
import math
import random
import statistics
from pathlib import Path
from typing import Any

EXPECTED_RUN_ID = 31195682685
EXPECTED_SEEDS = [1, 2, 3, 4, 5]
EXPECTED_EPOCHS = 20
EXPECTED_TRAIN = 1117
EXPECTED_VALIDATION = 295
EXPECTED_NEGATIVE_THRESHOLD = 0.35
BOOTSTRAP_SEED = 20260807
BOOTSTRAP_DRAWS = 20000
SOURCE_NAME = "arc-protocol-v3-full-controls-validation.json"
VARIANTS = ("full", "no_planner", "no_target", "negative_control")
EXPECTED_MEANS = {
    "full": 0.2549152542372881,
    "no_planner": 0.2501694915254237,
    "no_target": 0.26169491525423727,
    "negative_control": 0.2630508474576271,
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def bootstrap_ci(values: list[float]) -> list[float]:
    rng = random.Random(BOOTSTRAP_SEED)
    means: list[float] = []
    for _ in range(BOOTSTRAP_DRAWS):
        sample = [values[rng.randrange(len(values))] for _ in range(len(values))]
        means.append(statistics.fmean(sample))
    means.sort()
    lo = int(math.floor(0.025 * (BOOTSTRAP_DRAWS - 1)))
    hi = int(math.ceil(0.975 * (BOOTSTRAP_DRAWS - 1)))
    return [float(means[lo]), float(means[hi])]


def summarize(values: list[float]) -> dict[str, Any]:
    return {
        "n": len(values),
        "mean": float(statistics.fmean(values)),
        "std": float(statistics.stdev(values)) if len(values) > 1 else 0.0,
        "ci95": bootstrap_ci(values),
    }


def score_predictions(
    rows: Any,
    expected_ids: list[str] | None,
    expected_labels: list[int] | None,
    name: str,
):
    require(
        isinstance(rows, list) and len(rows) == EXPECTED_VALIDATION,
        f"{name}: expected 295 prediction rows",
    )
    ids: list[str] = []
    labels: list[int] = []
    predictions: list[int] = []
    probabilities: list[list[float]] = []
    for row in rows:
        require(isinstance(row, dict), f"{name}: row must be object")
        item_id = row.get("id")
        label = row.get("label")
        prediction = row.get("prediction")
        probs = row.get("probabilities")
        require(isinstance(item_id, str) and item_id, f"{name}: missing id")
        require(isinstance(label, int) and 0 <= label < 4, f"{name}/{item_id}: bad label")
        require(
            isinstance(prediction, int) and 0 <= prediction < 4,
            f"{name}/{item_id}: bad prediction",
        )
        require(
            isinstance(probs, list) and len(probs) == 4,
            f"{name}/{item_id}: bad probabilities",
        )
        probs = [float(x) for x in probs]
        require(
            all(math.isfinite(x) and 0 <= x <= 1 for x in probs),
            f"{name}/{item_id}: non-finite probability",
        )
        require(
            math.isclose(sum(probs), 1.0, rel_tol=1e-5, abs_tol=1e-5),
            f"{name}/{item_id}: probabilities do not sum to 1",
        )
        require(
            prediction == max(range(4), key=probs.__getitem__),
            f"{name}/{item_id}: prediction is not argmax",
        )
        ids.append(item_id)
        labels.append(label)
        predictions.append(prediction)
        probabilities.append(probs)
    require(len(ids) == len(set(ids)), f"{name}: duplicate ids")
    if expected_ids is not None:
        require(ids == expected_ids, f"{name}: validation id/order mismatch")
        require(labels == expected_labels, f"{name}: validation label mismatch")

    accuracy = statistics.fmean(
        float(prediction == label)
        for prediction, label in zip(predictions, labels, strict=True)
    )
    brier = statistics.fmean(
        sum(
            (probability - (1.0 if index == label else 0.0)) ** 2
            for index, probability in enumerate(probs)
        )
        for probs, label in zip(probabilities, labels, strict=True)
    )
    mean_true = statistics.fmean(
        probs[label]
        for probs, label in zip(probabilities, labels, strict=True)
    )
    confidences = [max(probs) for probs in probabilities]
    correct = [
        float(prediction == label)
        for prediction, label in zip(predictions, labels, strict=True)
    ]
    ece = 0.0
    for bin_index in range(10):
        lower, upper = bin_index / 10, (bin_index + 1) / 10
        members = [
            index
            for index, confidence in enumerate(confidences)
            if (confidence >= lower if bin_index == 0 else confidence > lower)
            and confidence <= upper
        ]
        if members:
            ece += len(members) / len(rows) * abs(
                statistics.fmean(correct[index] for index in members)
                - statistics.fmean(confidences[index] for index in members)
            )
    probability_ranges = [
        max(row[index] for row in probabilities)
        - min(row[index] for row in probabilities)
        for index in range(4)
    ]
    return (
        {
            "accuracy": float(accuracy),
            "brier": float(brier),
            "ece": float(ece),
            "mean_true_class_probability": float(mean_true),
        },
        {
            "prediction_class_count": len(set(predictions)),
            "prediction_histogram": {
                str(index): predictions.count(index) for index in range(4)
            },
            "maximum_probability_range": float(max(probability_ranges)),
        },
        ids,
        labels,
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Independently verify the exact retained LAM-JEPA v3 controls artifact."
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    source_path = args.artifact_dir / SOURCE_NAME
    require(source_path.is_file(), f"missing {SOURCE_NAME}")
    require(
        not any(
            "test" in path.name.lower() and path.suffix == ".parquet"
            for path in args.artifact_dir.rglob("*")
        ),
        "confirmatory test parquet present",
    )
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    protocol = payload.get("protocol")
    require(isinstance(protocol, dict), "protocol missing")
    require(
        protocol.get("protocol_id") == "lam-jepa-arc-challenge-v3",
        "wrong protocol id",
    )
    require(protocol.get("seeds") == EXPECTED_SEEDS, "wrong seeds")
    require(protocol.get("epochs") == EXPECTED_EPOCHS, "wrong epoch budget")
    require(
        protocol.get("train_eligibility", {}).get("eligible_rows") == EXPECTED_TRAIN,
        "wrong train eligible count",
    )
    require(
        protocol.get("validation_eligibility", {}).get("eligible_rows")
        == EXPECTED_VALIDATION,
        "wrong validation eligible count",
    )
    test_policy = str(protocol.get("test_split_policy", "")).lower()
    require(
        "not downloaded" in test_policy and "evaluat" in test_policy,
        "test split boundary not recorded",
    )

    records_by_variant: dict[str, list[dict[str, Any]]] = {}
    for variant in ("full", "no_planner", "no_target"):
        records = payload.get("variants", {}).get(variant, {}).get("records")
        require(
            isinstance(records, list) and len(records) == 5,
            f"{variant}: expected five records",
        )
        require(
            [record.get("seed") for record in records] == EXPECTED_SEEDS,
            f"{variant}: seed mismatch",
        )
        records_by_variant[variant] = records
    negative_records = payload.get("negative_control", {}).get("records")
    require(
        isinstance(negative_records, list) and len(negative_records) == 5,
        "negative_control: expected five records",
    )
    require(
        [record.get("seed") for record in negative_records] == EXPECTED_SEEDS,
        "negative_control: seed mismatch",
    )
    records_by_variant["negative_control"] = negative_records

    canonical_ids: list[str] | None = None
    canonical_labels: list[int] | None = None
    accuracies = {variant: [] for variant in VARIANTS}
    diagnostics_by_seed: dict[str, dict[str, Any]] = {
        str(seed): {} for seed in EXPECTED_SEEDS
    }

    for variant in VARIANTS:
        for seed, record in zip(
            EXPECTED_SEEDS, records_by_variant[variant], strict=True
        ):
            metrics, diagnostics, ids, labels = score_predictions(
                record.get("predictions"),
                canonical_ids,
                canonical_labels,
                f"seed {seed}/{variant}",
            )
            if canonical_ids is None:
                canonical_ids, canonical_labels = ids, labels
            stored = record.get("metrics")
            if isinstance(stored, dict):
                for key, value in metrics.items():
                    if key in stored:
                        require(
                            math.isclose(
                                float(stored[key]), value, rel_tol=1e-6, abs_tol=1e-6
                            ),
                            f"seed {seed}/{variant}: stored {key} mismatch",
                        )
            accuracies[variant].append(metrics["accuracy"])
            diagnostics_by_seed[str(seed)][variant] = diagnostics

    summaries = {
        variant: summarize(values) for variant, values in accuracies.items()
    }
    for variant, expected in EXPECTED_MEANS.items():
        require(
            math.isclose(
                summaries[variant]["mean"], expected, rel_tol=1e-12, abs_tol=1e-12
            ),
            f"{variant} immutable mean mismatch: {summaries[variant]['mean']}",
        )

    planner_effect_values = [
        full - ablation
        for full, ablation in zip(
            accuracies["full"], accuracies["no_planner"], strict=True
        )
    ]
    target_effect_values = [
        full - ablation
        for full, ablation in zip(
            accuracies["full"], accuracies["no_target"], strict=True
        )
    ]
    planner_effect = summarize(planner_effect_values)
    target_effect = summarize(target_effect_values)
    negative_pass = (
        max(accuracies["negative_control"]) <= EXPECTED_NEGATIVE_THRESHOLD
    )
    full_collapse = all(
        diagnostics_by_seed[str(seed)]["full"]["prediction_class_count"] == 1
        and diagnostics_by_seed[str(seed)]["full"]["maximum_probability_range"]
        <= 1e-6
        for seed in EXPECTED_SEEDS
    )
    planner_mechanism_supported = (
        planner_effect["mean"] >= 0.01 and planner_effect["ci95"][0] > 0
    )
    target_mechanism_supported = (
        target_effect["mean"] >= 0.01 and target_effect["ci95"][0] > 0
    )
    require(negative_pass, "negative-control threshold failed")
    require(full_collapse, "full-model one-class collapse did not reproduce")
    require(
        not planner_mechanism_supported, "planner mechanism unexpectedly supported"
    )
    require(
        not target_mechanism_supported, "target mechanism unexpectedly supported"
    )
    require(
        payload.get("negative_control", {}).get("pass") is True,
        "stored negative-control pass mismatch",
    )

    claim_boundary_text = str(protocol.get("claim_boundary", ""))
    claim_boundary_inconsistent = (
        protocol.get("seeds") == EXPECTED_SEEDS
        and protocol.get("epochs") == EXPECTED_EPOCHS
        and "not the final five-seed/20-epoch protocol"
        in claim_boundary_text.lower()
    )

    report = {
        "verdict": "RESEARCH_REPRODUCED_WITH_LIMITATIONS",
        "source_workflow_run_id": EXPECTED_RUN_ID,
        "source_payload": SOURCE_NAME,
        "confirmatory_test_accessed": False,
        "seeds": EXPECTED_SEEDS,
        "epochs": EXPECTED_EPOCHS,
        "eligible_train_rows": EXPECTED_TRAIN,
        "eligible_validation_rows": EXPECTED_VALIDATION,
        "accuracies": summaries,
        "full_minus_no_planner": planner_effect,
        "full_minus_no_target": target_effect,
        "negative_control_pass": negative_pass,
        "planner_mechanism_supported": planner_mechanism_supported,
        "target_mechanism_supported": target_mechanism_supported,
        "full_model_input_insensitive_collapse_reproduced": full_collapse,
        "protocol_claim_boundary_internally_inconsistent": claim_boundary_inconsistent,
        "diagnostics_by_seed": diagnostics_by_seed,
        "research_complete": False,
        "claim_boundary": (
            "The exact retained five-seed/20-epoch validation artifact reproduces, "
            "but it does not support the claimed mechanism: planner contribution is small "
            "with a bootstrap interval including zero, target removal is not worse, and every "
            "full-model seed collapses to one answer class. No ARC confirmatory-test or "
            "superiority claim is authorized."
        ),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
