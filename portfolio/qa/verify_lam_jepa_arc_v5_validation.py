from __future__ import annotations

import argparse
import json
import math
import random
import statistics
from collections import Counter
from pathlib import Path
from typing import Sequence

from lam_jepa.benchmarking.arc_challenge import load_arc_split
from lam_jepa.benchmarking.arc_protocol import select_protocol_eligible_examples

EXPECTED_TARGET = "18bd608a05bc308056e6279b347ff3ddb2b751be"
EXPECTED_FROZEN_MODEL = "df249086e9171febaa77333a4c62888f35265c40"
EXPECTED_REPAIR = "arc-v5-stable-ema-residual-0.03125"
EXPECTED_TRAIN_SHA256 = "e488c1587ffdcfc8443f916c53488a95cd471c5790e0746c6bfe4cecf20962cb"
EXPECTED_VALIDATION_SHA256 = "395a5c88d1580d69855fbaee9450270578df1ad5af6259771cd0a42c20e99f05"
CONDITIONS = (
    "legacy_ce",
    "repaired_v5_ce",
    "no_quantizer_ce",
    "repaired_v5_shuffled_labels",
)
SEEDS = [1, 2, 3, 4, 5]
BOOTSTRAP_SAMPLES = 10_000
BOOTSTRAP_SEED_BASE = 20_260_808


def fail(message: str) -> None:
    raise SystemExit(message)


def sha256_file(path: Path) -> str:
    import hashlib

    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def bootstrap_ci(values: Sequence[float], *, seed: int) -> tuple[float, float]:
    if not values:
        fail("bootstrap received no values")
    rng = random.Random(seed)
    n = len(values)
    samples: list[float] = []
    for _ in range(BOOTSTRAP_SAMPLES):
        samples.append(float(statistics.fmean(values[rng.randrange(n)] for _ in range(n))))
    samples.sort()
    lo = samples[int(0.025 * (BOOTSTRAP_SAMPLES - 1))]
    hi = samples[int(0.975 * (BOOTSTRAP_SAMPLES - 1))]
    return lo, hi


def summary(values: Sequence[float], *, seed: int) -> dict[str, object]:
    lo, hi = bootstrap_ci(values, seed=seed)
    return {
        "n": len(values),
        "mean": float(statistics.fmean(values)),
        "std": float(statistics.stdev(values)) if len(values) > 1 else 0.0,
        "bootstrap_ci95_low": lo,
        "bootstrap_ci95_high": hi,
        "by_seed": [float(x) for x in values],
    }


def close(a: float, b: float, *, tol: float = 2e-7) -> bool:
    return math.isclose(float(a), float(b), rel_tol=0.0, abs_tol=tol)


def assert_summary_matches(name: str, actual: dict[str, object], expected: dict[str, object]) -> None:
    if int(actual.get("n", -1)) != int(expected["n"]):
        fail(f"{name}: n mismatch")
    for field in ("mean", "std", "bootstrap_ci95_low", "bootstrap_ci95_high"):
        if not close(float(actual[field]), float(expected[field])):
            fail(f"{name}: {field} mismatch: {actual[field]} != {expected[field]}")
    actual_by_seed = [float(x) for x in actual.get("by_seed", [])]
    expected_by_seed = [float(x) for x in expected["by_seed"]]
    if len(actual_by_seed) != len(expected_by_seed) or any(
        not close(a, b) for a, b in zip(actual_by_seed, expected_by_seed, strict=True)
    ):
        fail(f"{name}: by_seed mismatch")


def independently_check_rows(
    record: dict[str, object],
    *,
    expected_ids: Sequence[str],
    expected_labels: dict[str, int],
) -> dict[str, object]:
    rows = record.get("rows")
    if not isinstance(rows, list) or len(rows) != len(expected_ids):
        fail("retained row count mismatch")

    row_ids = [str(row.get("id")) for row in rows]
    if row_ids != list(expected_ids):
        fail("retained validation IDs/order differ from frozen eligible validation rows")
    if len(set(row_ids)) != len(row_ids):
        fail("duplicate retained validation IDs")

    correct = 0
    predictions: list[int] = []
    max_probabilities: list[float] = []
    for row in rows:
        item_id = str(row["id"])
        label = int(row["label"])
        if label != expected_labels[item_id]:
            fail(f"label mismatch for {item_id}")
        probabilities = [float(x) for x in row.get("probabilities", [])]
        if len(probabilities) != 4 or not all(math.isfinite(x) for x in probabilities):
            fail(f"invalid probability vector for {item_id}")
        if not close(sum(probabilities), 1.0, tol=2e-5):
            fail(f"probabilities do not sum to one for {item_id}")
        prediction = max(range(4), key=probabilities.__getitem__)
        if prediction != int(row["prediction"]):
            fail(f"prediction/argmax mismatch for {item_id}")
        predictions.append(prediction)
        max_probabilities.append(max(probabilities))
        correct += int(prediction == label)

    histogram = Counter(predictions)
    recomputed = {
        "accuracy": correct / len(rows),
        "prediction_support": len(histogram),
        "prediction_histogram": {str(k): int(v) for k, v in sorted(histogram.items())},
        "largest_predicted_class_share": max(histogram.values()) / len(rows),
        "mean_max_probability": float(statistics.fmean(max_probabilities)),
    }
    if not close(float(record["accuracy"]), float(recomputed["accuracy"])):
        fail("record accuracy does not match retained rows")
    if int(record["prediction_support"]) != int(recomputed["prediction_support"]):
        fail("record prediction support does not match retained rows")
    if record.get("prediction_histogram") != recomputed["prediction_histogram"]:
        fail("record prediction histogram does not match retained rows")
    if not close(float(record["largest_predicted_class_share"]), float(recomputed["largest_predicted_class_share"])):
        fail("record largest-class share does not match retained rows")
    if not close(float(record["mean_max_probability"]), float(recomputed["mean_max_probability"]), tol=2e-6):
        fail("record mean max probability does not match retained rows")
    return recomputed


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent retained-row QA for frozen LAM-JEPA ARC v5 validation.")
    parser.add_argument("--results", type=Path, required=True)
    parser.add_argument("--protocol", type=Path, required=True)
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--validation", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--forbidden-test", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    if args.forbidden_test.exists():
        fail(f"confirmatory ARC test unexpectedly exists: {args.forbidden_test}")
    target_commit = args.target_commit_file.read_text(encoding="utf-8").strip()
    if target_commit != EXPECTED_TARGET:
        fail(f"wrong immutable target: {target_commit}")

    protocol = json.loads(args.protocol.read_text(encoding="utf-8"))
    if protocol.get("status") != "FROZEN_BEFORE_VALIDATION_EXECUTION":
        fail("protocol was not frozen before validation execution")
    if protocol.get("frozen_target_commit") != EXPECTED_FROZEN_MODEL:
        fail("frozen model identity drift")
    if protocol.get("repair_id") != EXPECTED_REPAIR:
        fail("repair identity drift")
    if protocol["dataset"].get("train_sha256") != EXPECTED_TRAIN_SHA256:
        fail("protocol train digest drift")
    if protocol["dataset"].get("validation_sha256") != EXPECTED_VALIDATION_SHA256:
        fail("protocol validation digest drift")
    training = protocol["training"]
    frozen_training = {
        "objective": "supervised_cross_entropy_only",
        "seeds": SEEDS,
        "epochs": 20,
        "batch_size": 32,
        "learning_rate": 0.0003,
        "model_steps": 1,
        "optimizer": "AdamW",
        "gradient_clip_norm": 1.0,
    }
    for key, value in frozen_training.items():
        if training.get(key) != value:
            fail(f"frozen training field drift: {key}")
    if not all(bool(training.get(k)) for k in ("no_early_stopping", "no_validation_model_selection", "no_validation_hyperparameter_selection")):
        fail("validation selection safeguards are not frozen on")
    if protocol["dataset"].get("test_split_policy") != "must not be downloaded, opened, evaluated, or used for selection":
        fail("test split policy drift")

    if sha256_file(args.train) != EXPECTED_TRAIN_SHA256:
        fail("downloaded train SHA-256 mismatch")
    if sha256_file(args.validation) != EXPECTED_VALIDATION_SHA256:
        fail("downloaded validation SHA-256 mismatch")

    train_source = load_arc_split(args.train)
    validation_source = load_arc_split(args.validation)
    train_partition = select_protocol_eligible_examples(train_source)
    validation_partition = select_protocol_eligible_examples(validation_source)
    train = list(train_partition.eligible)
    validation = list(validation_partition.eligible)
    if len(train_source) != 1119 or len(train) != 1117:
        fail("frozen train source/eligibility counts changed")
    if len(validation_source) != 299 or len(validation) != 295:
        fail("frozen validation source/eligibility counts changed")
    train_ids = {str(x.item_id) for x in train}
    validation_ids = [str(x.item_id) for x in validation]
    if train_ids.intersection(validation_ids):
        fail("train/validation ID leakage")
    expected_labels = {str(x.item_id): int(x.label) for x in validation}

    payload = json.loads(args.results.read_text(encoding="utf-8"))
    if payload.get("artifact_type") != "LAM-JEPA ARC v5 repaired validation result package":
        fail("unexpected result artifact type")
    if payload.get("protocol") != protocol:
        fail("result package protocol differs from frozen protocol file")
    records = payload.get("records")
    if not isinstance(records, dict) or tuple(records.keys()) != CONDITIONS:
        fail("result package conditions/order mismatch")

    accuracies: dict[str, list[float]] = {}
    row_checks: dict[str, list[dict[str, object]]] = {}
    for condition in CONDITIONS:
        entries = records[condition]
        if not isinstance(entries, list) or [int(x.get("seed", -1)) for x in entries] != SEEDS:
            fail(f"{condition}: seed set/order mismatch")
        accuracies[condition] = []
        row_checks[condition] = []
        for entry in entries:
            checked = independently_check_rows(entry, expected_ids=validation_ids, expected_labels=expected_labels)
            accuracies[condition].append(float(checked["accuracy"]))
            row_checks[condition].append(checked)

    repaired_minus_legacy = [a - b for a, b in zip(accuracies["repaired_v5_ce"], accuracies["legacy_ce"], strict=True)]
    repaired_minus_noq = [a - b for a, b in zip(accuracies["repaired_v5_ce"], accuracies["no_quantizer_ce"], strict=True)]
    expected_summaries = {
        condition: summary(values, seed=BOOTSTRAP_SEED_BASE + i)
        for i, (condition, values) in enumerate(accuracies.items())
    }
    expected_summaries["repaired_minus_legacy"] = summary(repaired_minus_legacy, seed=BOOTSTRAP_SEED_BASE + 20)
    expected_summaries["repaired_minus_no_quantizer"] = summary(repaired_minus_noq, seed=BOOTSTRAP_SEED_BASE + 21)

    actual_summaries = payload.get("summaries")
    if not isinstance(actual_summaries, dict):
        fail("result summaries missing")
    for name, expected in expected_summaries.items():
        if name not in actual_summaries:
            fail(f"missing summary: {name}")
        assert_summary_matches(name, actual_summaries[name], expected)

    negative_control_valid = float(expected_summaries["repaired_v5_shuffled_labels"]["bootstrap_ci95_high"]) < 0.35
    collapse_rejected = all(
        int(row["prediction_support"]) >= 2 and float(row["largest_predicted_class_share"]) <= 0.95
        for row in row_checks["repaired_v5_ce"]
    )
    generalization_supported = bool(
        negative_control_valid
        and collapse_rejected
        and float(expected_summaries["repaired_v5_ce"]["bootstrap_ci95_low"]) > 0.25
        and float(expected_summaries["repaired_minus_legacy"]["bootstrap_ci95_low"]) > 0.0
    )
    quantization_benefit_supported = bool(float(expected_summaries["repaired_minus_no_quantizer"]["bootstrap_ci95_low"]) > 0.0)
    if not negative_control_valid:
        verdict = "INVALID_NEGATIVE_CONTROL"
    elif generalization_supported:
        verdict = "VALIDATION_GENERALIZATION_SUPPORTED_WITH_LIMITATIONS"
    else:
        verdict = "VALID_NEGATIVE_OR_INCONCLUSIVE_VALIDATION"

    expected_rules = {
        "negative_control_valid": negative_control_valid,
        "collapse_rejected": collapse_rejected,
        "generalization_supported_with_limitations": generalization_supported,
        "quantization_benefit_supported": quantization_benefit_supported,
    }
    if payload.get("decision_rules") != expected_rules:
        fail(f"decision-rule mismatch: {payload.get('decision_rules')} != {expected_rules}")
    if payload.get("verdict") != verdict:
        fail(f"verdict mismatch: {payload.get('verdict')} != {verdict}")
    claim = payload.get("claim_boundary", {})
    if claim.get("validation_accessed") is not True or claim.get("test_accessed") is not False:
        fail("claim-boundary data-access flags invalid")
    if claim.get("confirmatory_test_claim_authorized") is not False:
        fail("confirmatory-test claim must remain unauthorized")
    if claim.get("external_generalization_claim_authorized") is not False:
        fail("external-generalization claim must remain unauthorized")
    if claim.get("research_complete") is not False:
        fail("research-complete must remain false")

    report = {
        "artifact_type": "Independent control-repo QA of LAM-JEPA ARC v5 repaired validation",
        "target_commit": target_commit,
        "frozen_model_commit": EXPECTED_FROZEN_MODEL,
        "repair_id": EXPECTED_REPAIR,
        "train_sha256": EXPECTED_TRAIN_SHA256,
        "validation_sha256": EXPECTED_VALIDATION_SHA256,
        "train_rows": {"source": len(train_source), "eligible": len(train)},
        "validation_rows": {"source": len(validation_source), "eligible": len(validation)},
        "test_accessed": False,
        "independent_retained_row_verification": True,
        "summaries": expected_summaries,
        "decision_rules": expected_rules,
        "verdict": verdict,
        "claim_boundary": {
            "development_validation_only": True,
            "confirmatory_test_claim_authorized": False,
            "external_generalization_claim_authorized": False,
            "original_hard_vq_mechanism_claim_authorized": False,
            "research_complete": False,
        },
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"verdict": verdict, "summaries": expected_summaries, "decision_rules": expected_rules}, indent=2))
    if not negative_control_valid:
        fail("independent QA preserved INVALID_NEGATIVE_CONTROL; do not interpret performance")


if __name__ == "__main__":
    main()
