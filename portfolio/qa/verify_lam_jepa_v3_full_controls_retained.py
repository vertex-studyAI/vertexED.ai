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
EXPECTED_TRAIN_ELIGIBLE = 1117
EXPECTED_VALIDATION_ELIGIBLE = 295
EXPECTED_EPOCHS = 20
EXPECTED_NEGATIVE_THRESHOLD = 0.35
BOOTSTRAP_SEED = 20260807
BOOTSTRAP_DRAWS = 20000

VARIANT_ALIASES = {
    "full": ("full", "full_model", "lam_jepa", "full_lam_jepa"),
    "no_planner": ("no_planner", "planner_ablation"),
    "no_target": ("no_target", "target_ablation"),
    "negative_control": ("negative_control", "shuffled_label", "shuffled_labels", "label_permutation"),
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def load_json_files(root: Path) -> list[tuple[Path, Any]]:
    loaded: list[tuple[Path, Any]] = []
    for path in sorted(root.rglob("*.json")):
        try:
            loaded.append((path, json.loads(path.read_text(encoding="utf-8"))))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    require(bool(loaded), f"no readable JSON files under {root}")
    return loaded


def score_rows(rows: object, expected_ids: list[str] | None, name: str):
    require(isinstance(rows, list) and rows, f"{name}: raw predictions missing")
    ids: list[str] = []
    labels: list[int] = []
    predictions: list[int] = []
    probabilities: list[list[float]] = []

    for row in rows:
        require(isinstance(row, dict), f"{name}: prediction row must be an object")
        item_id = str(row.get("id", ""))
        label = row.get("label")
        prediction = row.get("prediction")
        values = row.get("probabilities")
        require(item_id, f"{name}: item id missing")
        require(isinstance(label, int) and 0 <= label < 4, f"{name}/{item_id}: invalid label")
        require(isinstance(prediction, int) and 0 <= prediction < 4, f"{name}/{item_id}: invalid prediction")
        require(isinstance(values, list) and len(values) == 4, f"{name}/{item_id}: expected four probabilities")
        values = [float(value) for value in values]
        require(all(math.isfinite(value) and 0.0 <= value <= 1.0 for value in values), f"{name}/{item_id}: invalid probability")
        require(math.isclose(sum(values), 1.0, rel_tol=1e-5, abs_tol=1e-5), f"{name}/{item_id}: probabilities do not sum to one")
        require(prediction == max(range(4), key=values.__getitem__), f"{name}/{item_id}: prediction is not probability argmax")
        ids.append(item_id)
        labels.append(label)
        predictions.append(prediction)
        probabilities.append(values)

    require(len(ids) == len(set(ids)), f"{name}: duplicate ids")
    if expected_ids is not None:
        require(ids == expected_ids, f"{name}: row identity/order mismatch")

    n = len(ids)
    correct = [float(prediction == label) for prediction, label in zip(predictions, labels, strict=True)]
    accuracy = statistics.fmean(correct)
    brier = statistics.fmean(
        sum((value - (1.0 if index == label else 0.0)) ** 2 for index, value in enumerate(values))
        for values, label in zip(probabilities, labels, strict=True)
    )
    true_probability = statistics.fmean(values[label] for values, label in zip(probabilities, labels, strict=True))
    confidences = [max(values) for values in probabilities]
    ece = 0.0
    for bin_index in range(10):
        lower = bin_index / 10
        upper = (bin_index + 1) / 10
        members = [
            index
            for index, confidence in enumerate(confidences)
            if (confidence >= lower if bin_index == 0 else confidence > lower) and confidence <= upper
        ]
        if members:
            ece += (len(members) / n) * abs(
                statistics.fmean(correct[index] for index in members)
                - statistics.fmean(confidences[index] for index in members)
            )

    per_class_ranges = [
        max(row[index] for row in probabilities) - min(row[index] for row in probabilities)
        for index in range(4)
    ]
    diagnostics = {
        "prediction_class_count": len(set(predictions)),
        "prediction_histogram": {str(index): predictions.count(index) for index in range(4)},
        "unique_probability_rows_6dp": len({tuple(round(value, 6) for value in row) for row in probabilities}),
        "per_class_probability_ranges": per_class_ranges,
        "maximum_probability_range": max(per_class_ranges),
    }
    metrics = {
        "accuracy": float(accuracy),
        "brier": float(brier),
        "ece": float(ece),
        "mean_true_class_probability": float(true_probability),
    }
    return metrics, diagnostics, ids, labels


def recursive_prediction_blocks(value: Any) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(value, dict):
        predictions = value.get("predictions")
        if isinstance(predictions, list) and predictions and isinstance(predictions[0], dict):
            if {"id", "label", "prediction", "probabilities"}.issubset(predictions[0]):
                found.append(value)
        for child in value.values():
            found.extend(recursive_prediction_blocks(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(recursive_prediction_blocks(child))
    return found


def find_key_case_insensitive(mapping: dict[str, Any], aliases: tuple[str, ...]) -> Any | None:
    lowered = {str(key).lower(): key for key in mapping}
    for alias in aliases:
        if alias.lower() in lowered:
            return mapping[lowered[alias.lower()]]
    return None


def extract_seed_records(payload: dict[str, Any]) -> list[dict[str, Any]] | None:
    for key in ("records", "seed_records", "runs"):
        records = payload.get(key)
        if isinstance(records, list) and len(records) == 5 and all(isinstance(record, dict) for record in records):
            seeds = [record.get("seed", record.get("training_seed")) for record in records]
            if seeds == EXPECTED_SEEDS:
                return records
    for value in payload.values():
        if isinstance(value, dict):
            result = extract_seed_records(value)
            if result is not None:
                return result
    return None


def find_main_payload(files: list[tuple[Path, Any]]) -> tuple[Path, dict[str, Any], list[dict[str, Any]]]:
    candidates: list[tuple[Path, dict[str, Any], list[dict[str, Any]]]] = []
    for path, value in files:
        if not isinstance(value, dict):
            continue
        records = extract_seed_records(value)
        if records is None:
            continue
        variant_hits = 0
        for record in records:
            for aliases in VARIANT_ALIASES.values():
                if find_key_case_insensitive(record, aliases) is not None:
                    variant_hits += 1
        if variant_hits >= 10:
            candidates.append((path, value, records))
    require(bool(candidates), "could not locate five-seed protocol-v3 controls payload")
    candidates.sort(key=lambda item: len(json.dumps(item[1])), reverse=True)
    return candidates[0]


def find_variant_block(record: dict[str, Any], variant: str, seed: int) -> dict[str, Any]:
    value = find_key_case_insensitive(record, VARIANT_ALIASES[variant])
    require(value is not None, f"seed {seed}: {variant} record missing")
    blocks = recursive_prediction_blocks(value)
    if isinstance(value, dict) and isinstance(value.get("predictions"), list):
        blocks.insert(0, value)
    # Prefer a block with the complete validation set, then the largest available block.
    full = [block for block in blocks if isinstance(block.get("predictions"), list) and len(block["predictions"]) == EXPECTED_VALIDATION_ELIGIBLE]
    if full:
        return full[0]
    require(bool(blocks), f"seed {seed}: {variant} raw prediction block missing")
    blocks.sort(key=lambda block: len(block.get("predictions", [])), reverse=True)
    return blocks[0]


def bootstrap_ci(values: list[float]) -> list[float]:
    require(bool(values), "cannot bootstrap empty values")
    if len(values) == 1:
        return [values[0], values[0]]
    rng = random.Random(BOOTSTRAP_SEED)
    means: list[float] = []
    for _ in range(BOOTSTRAP_DRAWS):
        sample = [values[rng.randrange(len(values))] for _ in range(len(values))]
        means.append(statistics.fmean(sample))
    means.sort()
    lower = max(0, int(math.floor(0.025 * (BOOTSTRAP_DRAWS - 1))))
    upper = min(BOOTSTRAP_DRAWS - 1, int(math.ceil(0.975 * (BOOTSTRAP_DRAWS - 1))))
    return [float(means[lower]), float(means[upper])]


def summary(values: list[float]) -> dict[str, Any]:
    return {
        "n": len(values),
        "mean": float(statistics.fmean(values)),
        "std": float(statistics.stdev(values)) if len(values) > 1 else 0.0,
        "ci95": bootstrap_ci(values),
    }


def walk_scalars(value: Any, key_hint: str = ""):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk_scalars(child, str(key))
    elif isinstance(value, list):
        for child in value:
            yield from walk_scalars(child, key_hint)
    else:
        yield key_hint.lower(), value


def assert_protocol_boundary(payload: dict[str, Any]) -> None:
    scalars = list(walk_scalars(payload))
    protocol_ids = {str(value) for key, value in scalars if "protocol_id" in key}
    require(not protocol_ids or "lam-jepa-arc-challenge-v3" in protocol_ids, f"unexpected protocol ids: {protocol_ids}")
    seed_lists = []
    def collect_lists(value: Any, parent: str = ""):
        if isinstance(value, dict):
            for key, child in value.items():
                if "seed" in str(key).lower() and isinstance(child, list):
                    seed_lists.append(child)
                collect_lists(child, str(key))
        elif isinstance(value, list):
            for child in value:
                collect_lists(child, parent)
    collect_lists(payload)
    require(any(seed_list == EXPECTED_SEEDS for seed_list in seed_lists), "five frozen seeds not recorded")

    numeric = [(key, value) for key, value in scalars if isinstance(value, (int, float)) and not isinstance(value, bool)]
    require(any("epoch" in key and int(value) == EXPECTED_EPOCHS for key, value in numeric), "20-epoch budget not recorded")
    require(any("train" in key and "eligible" in key and int(value) == EXPECTED_TRAIN_ELIGIBLE for key, value in numeric) or any("train_examples" in key and int(value) == EXPECTED_TRAIN_ELIGIBLE for key, value in numeric), "1117 eligible train rows not recorded")
    require(any("validation" in key and "eligible" in key and int(value) == EXPECTED_VALIDATION_ELIGIBLE for key, value in numeric) or any("validation_examples" in key and int(value) == EXPECTED_VALIDATION_ELIGIBLE for key, value in numeric), "295 eligible validation rows not recorded")

    for key, value in scalars:
        if "test" in key and ("access" in key or "download" in key or "evaluat" in key):
            if isinstance(value, bool):
                require(value is False, f"artifact reports confirmatory test access: {key}={value}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Independently verify retained LAM-JEPA v3 full controls artifact.")
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    files = load_json_files(args.artifact_dir)
    source_path, payload, records = find_main_payload(files)
    assert_protocol_boundary(payload)

    canonical_ids: list[str] | None = None
    canonical_labels: list[int] | None = None
    accuracies = {variant: [] for variant in VARIANT_ALIASES}
    diagnostics_by_seed: dict[str, dict[str, Any]] = {}

    for expected_seed, record in zip(EXPECTED_SEEDS, records, strict=True):
        actual_seed = record.get("seed", record.get("training_seed"))
        require(actual_seed == expected_seed, f"seed order mismatch: expected {expected_seed}, got {actual_seed}")
        diagnostics_by_seed[str(expected_seed)] = {}
        for variant in VARIANT_ALIASES:
            block = find_variant_block(record, variant, expected_seed)
            metrics, diagnostics, ids, labels = score_rows(block.get("predictions"), canonical_ids, f"seed {expected_seed}/{variant}")
            require(len(ids) == EXPECTED_VALIDATION_ELIGIBLE, f"seed {expected_seed}/{variant}: expected 295 rows, got {len(ids)}")
            if canonical_ids is None:
                canonical_ids = ids
                canonical_labels = labels
            else:
                require(ids == canonical_ids, f"seed {expected_seed}/{variant}: validation IDs differ")
                require(labels == canonical_labels, f"seed {expected_seed}/{variant}: validation labels differ")
            stored_metrics = block.get("metrics")
            if isinstance(stored_metrics, dict):
                for key, expected_value in metrics.items():
                    if key in stored_metrics:
                        require(math.isclose(float(stored_metrics[key]), expected_value, rel_tol=1e-6, abs_tol=1e-6), f"seed {expected_seed}/{variant}: stored {key} mismatch")
            accuracies[variant].append(metrics["accuracy"])
            diagnostics_by_seed[str(expected_seed)][variant] = diagnostics

    require(canonical_ids is not None and len(canonical_ids) == EXPECTED_VALIDATION_ELIGIBLE, "canonical validation rows incomplete")

    full_minus_no_planner = [
        full - ablation
        for full, ablation in zip(accuracies["full"], accuracies["no_planner"], strict=True)
    ]
    full_minus_no_target = [
        full - ablation
        for full, ablation in zip(accuracies["full"], accuracies["no_target"], strict=True)
    ]
    full_summary = summary(accuracies["full"])
    planner_summary = summary(accuracies["no_planner"])
    target_summary = summary(accuracies["no_target"])
    negative_summary = summary(accuracies["negative_control"])
    planner_effect = summary(full_minus_no_planner)
    target_effect = summary(full_minus_no_target)

    negative_pass = max(accuracies["negative_control"]) <= EXPECTED_NEGATIVE_THRESHOLD
    planner_mechanism_supported = float(planner_effect["mean"]) >= 0.01 and float(planner_effect["ci95"][0]) > 0.0
    target_mechanism_supported = float(target_effect["mean"]) >= 0.01 and float(target_effect["ci95"][0]) > 0.0

    full_collapse = all(
        diagnostics_by_seed[str(seed)]["full"]["prediction_class_count"] == 1
        and diagnostics_by_seed[str(seed)]["full"]["maximum_probability_range"] <= 1e-6
        for seed in EXPECTED_SEEDS
    )

    # Guard the key evidence values already independently observed from the retained artifact.
    require(math.isclose(float(full_summary["mean"]), 0.2359322034, rel_tol=1e-8, abs_tol=1e-8), f"full mean changed: {full_summary['mean']}")
    require(math.isclose(float(planner_summary["mean"]), 0.2515254237, rel_tol=1e-8, abs_tol=1e-8), f"no_planner mean changed: {planner_summary['mean']}")
    require(math.isclose(float(target_summary["mean"]), 0.2359322034, rel_tol=1e-8, abs_tol=1e-8), f"no_target mean changed: {target_summary['mean']}")
    require(math.isclose(float(negative_summary["mean"]), 0.2325423729, rel_tol=1e-8, abs_tol=1e-8), f"negative-control mean changed: {negative_summary['mean']}")
    require(math.isclose(float(planner_effect["mean"]), -0.0155932203, rel_tol=1e-8, abs_tol=1e-8), f"planner effect changed: {planner_effect['mean']}")
    require(float(planner_effect["ci95"][1]) < 0.0, f"planner CI no longer strictly adverse: {planner_effect['ci95']}")
    require(math.isclose(float(target_effect["mean"]), 0.0, abs_tol=1e-12), f"target effect changed: {target_effect['mean']}")
    require(target_effect["ci95"] == [0.0, 0.0], f"target CI changed: {target_effect['ci95']}")
    require(negative_pass, f"negative-control stop condition triggered: {accuracies['negative_control']}")
    require(full_collapse, f"full-model collapse did not reproduce: {diagnostics_by_seed}")
    require(not planner_mechanism_supported, "planner mechanism unexpectedly passes")
    require(not target_mechanism_supported, "target mechanism unexpectedly passes")

    report = {
        "verdict": "RESEARCH_REPRODUCED_WITH_LIMITATIONS",
        "source_workflow_run_id": EXPECTED_RUN_ID,
        "source_payload": str(source_path.relative_to(args.artifact_dir)),
        "protocol_id": "lam-jepa-arc-challenge-v3",
        "confirmatory_test_accessed": False,
        "seeds": EXPECTED_SEEDS,
        "epochs": EXPECTED_EPOCHS,
        "eligible_train_rows": EXPECTED_TRAIN_ELIGIBLE,
        "eligible_validation_rows": EXPECTED_VALIDATION_ELIGIBLE,
        "full_accuracy": full_summary,
        "no_planner_accuracy": planner_summary,
        "no_target_accuracy": target_summary,
        "negative_control_accuracy": negative_summary,
        "full_minus_no_planner": planner_effect,
        "full_minus_no_target": target_effect,
        "negative_control_pass": negative_pass,
        "planner_mechanism_supported": planner_mechanism_supported,
        "target_mechanism_supported": target_mechanism_supported,
        "full_model_input_insensitive_collapse_reproduced": full_collapse,
        "diagnostics_by_seed": diagnostics_by_seed,
        "research_complete": False,
        "claim_boundary": "Independent retained-artifact verification only. The result is adverse: planner contribution is contradicted, target contribution is unsupported, and the full model collapses to one answer class per seed. ARC confirmatory test must remain untouched until the root cause is resolved or the hypothesis is rejected."
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
