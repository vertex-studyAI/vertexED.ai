from __future__ import annotations

import argparse
import json
import math
import statistics
from pathlib import Path

TARGET_COMMIT = "e4046d1a9725fe62f32c575c128dc0503e2118a1"
MODEL_ID = "microsoft/deberta-v3-xsmall"
MODEL_REVISION = "14809e4f1fe1895fcba8b258271a940c6ca45ec4"
EXPECTED = {
    "train_digest": "8c04d2392637670062b1a29e66ccf390e51e3e2a26f7dce95a4dc8531f1a3da7",
    "validation_digest": "10edd4181703f185b03f83f1dd3932d47a318dc882d0413ef5d7ae3f2867d672",
    "train_id_digest": "313076855c9069541342f93dfb990b9f980cc886c83b0c33ec6d1a3059464d2f",
    "validation_id_digest": "e2967748171bed2a42d0526911d516ffbaa46610e6564f98f33649c8c7b16598",
    "protocol_sha256": "08c63b2eef71f2d458be97949913349a8f9680fa8c31f960e4cc6c7f2602faee",
    "parameters": 70830337,
    "lam_mean": 0.15625,
    "deberta_mean": 0.21875,
    "delta_mean": -0.0625,
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def read_json(path: Path) -> dict:
    require(path.is_file(), f"missing JSON: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(payload, dict), f"expected object: {path}")
    return payload


def row_metrics(rows: object, expected_ids: list[str] | None, name: str):
    require(isinstance(rows, list) and rows, f"{name}: missing predictions")
    ids: list[str] = []
    labels: list[int] = []
    predictions: list[int] = []
    probabilities: list[list[float]] = []
    for row in rows:
        require(isinstance(row, dict), f"{name}: invalid row")
        item_id = str(row.get("id", ""))
        label = row.get("label")
        prediction = row.get("prediction")
        values = row.get("probabilities")
        require(item_id, f"{name}: missing id")
        require(isinstance(label, int) and 0 <= label < 4, f"{name}/{item_id}: invalid label")
        require(isinstance(prediction, int) and 0 <= prediction < 4, f"{name}/{item_id}: invalid prediction")
        require(isinstance(values, list) and len(values) == 4, f"{name}/{item_id}: invalid probability row")
        values = [float(value) for value in values]
        require(all(math.isfinite(value) and 0.0 <= value <= 1.0 for value in values), f"{name}/{item_id}: bad probability")
        require(math.isclose(sum(values), 1.0, rel_tol=1e-5, abs_tol=1e-5), f"{name}/{item_id}: probabilities do not sum to one")
        require(prediction == max(range(4), key=values.__getitem__), f"{name}/{item_id}: prediction is not argmax")
        ids.append(item_id)
        labels.append(label)
        predictions.append(prediction)
        probabilities.append(values)
    require(len(ids) == len(set(ids)), f"{name}: duplicate ids")
    if expected_ids is not None:
        require(ids == expected_ids, f"{name}: row identity/order mismatch")

    n = len(ids)
    accuracy = sum(int(prediction == label) for prediction, label in zip(predictions, labels, strict=True)) / n
    brier = sum(
        sum((value - (1.0 if index == label else 0.0)) ** 2 for index, value in enumerate(values))
        for values, label in zip(probabilities, labels, strict=True)
    ) / n
    mean_true = statistics.fmean(values[label] for values, label in zip(probabilities, labels, strict=True))
    confidence = [max(values) for values in probabilities]
    correct = [float(prediction == label) for prediction, label in zip(predictions, labels, strict=True)]
    ece = 0.0
    for bin_index in range(10):
        lo = bin_index / 10
        hi = (bin_index + 1) / 10
        members = [
            index for index, conf in enumerate(confidence)
            if (conf >= lo if bin_index == 0 else conf > lo) and conf <= hi
        ]
        if members:
            ece += (len(members) / n) * abs(
                statistics.fmean(correct[index] for index in members)
                - statistics.fmean(confidence[index] for index in members)
            )
    return {
        "accuracy": float(accuracy),
        "brier": float(brier),
        "ece": float(ece),
        "mean_true_class_probability": float(mean_true),
    }, ids, labels


def verify_metrics(actual: object, expected: dict[str, float], name: str) -> None:
    require(isinstance(actual, dict), f"{name}: metrics missing")
    for key, expected_value in expected.items():
        require(math.isclose(float(actual[key]), expected_value, rel_tol=1e-6, abs_tol=1e-6), f"{name}: {key} mismatch")


def mean_std(values: list[float]) -> dict[str, float | int]:
    return {
        "n": len(values),
        "mean": float(statistics.fmean(values)),
        "std": float(statistics.stdev(values)) if len(values) > 1 else 0.0,
    }


def verify_summary(actual: object, expected: dict, name: str) -> None:
    require(isinstance(actual, dict), f"{name}: summary missing")
    require(actual.get("n") == expected["n"], f"{name}: n mismatch")
    for key in ("mean", "std"):
        require(math.isclose(float(actual[key]), float(expected[key]), rel_tol=1e-9, abs_tol=1e-9), f"{name}: {key} mismatch")


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent verifier for frozen LAM-JEPA DeBERTa smoke.")
    parser.add_argument("--results", type=Path, required=True)
    parser.add_argument("--continuity", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    require(args.target_commit_file.read_text(encoding="utf-8").strip() == TARGET_COMMIT, "target commit mismatch")
    payload = read_json(args.results)
    continuity = read_json(args.continuity)
    require(continuity.get("status") == "passed", "v1→v2 continuity did not pass")
    require(continuity.get("v2_supersedes_v1") is True, "v2 supersession missing")
    require(continuity.get("pretrained_contract_unchanged") is True, "pretrained contract changed across protocol versions")
    require(continuity.get("test_access_authorized") is False, "continuity artifact unexpectedly authorizes test access")

    protocol = payload.get("protocol")
    records = payload.get("records")
    summary = payload.get("summary")
    require(isinstance(protocol, dict) and isinstance(records, list) and isinstance(summary, dict), "artifact structure invalid")
    require(protocol.get("protocol_id") == "lam-jepa-arc-challenge-v1", "execution audit protocol id changed")
    require(protocol.get("protocol_sha256") == EXPECTED["protocol_sha256"], "execution audit protocol hash changed")
    require(protocol.get("development_smoke_only") is True, "development boundary missing")
    require(protocol.get("confirmatory_budget_executed") is False, "confirmatory budget unexpectedly executed")
    require(protocol.get("test_split_accessed") is False, "ARC test unexpectedly accessed")
    require(protocol.get("pretrained_model_id") == MODEL_ID, "model id changed")
    require(protocol.get("pretrained_model_revision") == MODEL_REVISION, "declared revision changed")
    require(protocol.get("resolved_pretrained_revision") == MODEL_REVISION, "resolved revision changed")
    require(protocol.get("pretrained_model_license") == "MIT", "license changed")
    require(protocol.get("pretrained_total_parameters") == EXPECTED["parameters"], "total parameter count changed")
    require(protocol.get("pretrained_trainable_parameters") == EXPECTED["parameters"], "trainable parameter count changed")
    require(protocol.get("pretrained_weight_file") == "pytorch_model.bin", "weight file changed")
    require(protocol.get("pretrained_weight_format") == "pytorch_pickle_bin", "weight format changed")
    require(protocol.get("trust_remote_code") is False, "remote code became enabled")
    require(protocol.get("transformers_version") == "4.57.6", "transformers version changed")
    require(protocol.get("sentencepiece_version") == "0.2.2", "sentencepiece version changed")
    require(protocol.get("seeds") == [1, 2], "development seeds changed")
    require(protocol.get("train_examples") == 8 and protocol.get("validation_examples") == 16, "development row budget changed")
    for key in ("train_digest", "validation_digest", "train_id_digest", "validation_id_digest"):
        require(protocol.get(key) == EXPECTED[key], f"{key} changed")

    canonical_ids: list[str] | None = None
    canonical_labels: list[int] | None = None
    lam_accuracy: list[float] = []
    deberta_accuracy: list[float] = []
    deltas: list[float] = []
    require(len(records) == 2, "expected two seed records")
    for expected_seed, record in zip([1, 2], records, strict=True):
        require(record.get("seed") == expected_seed, "seed record changed")
        deberta = record.get("frozen_deberta")
        lam = record.get("lam_jepa")
        require(isinstance(deberta, dict) and isinstance(lam, dict), "model record missing")
        require(int(deberta.get("training_steps_executed", 0)) == 1, "DeBERTa smoke training steps changed")
        for model_name, model_record in (("deberta", deberta), ("lam", lam)):
            for field in ("training_wall_seconds", "validation_wall_seconds", "choice_reversal_wall_seconds"):
                value = float(model_record.get(field, 0.0))
                require(math.isfinite(value) and value > 0, f"{model_name}: missing compute evidence {field}")

        deberta_metrics, ids, labels = row_metrics(deberta.get("predictions"), canonical_ids, f"seed {expected_seed}/deberta")
        if canonical_ids is None:
            canonical_ids = ids
            canonical_labels = labels
        else:
            require(labels == canonical_labels, "validation labels changed across seeds")
        lam_metrics, lam_ids, lam_labels = row_metrics(lam.get("predictions"), canonical_ids, f"seed {expected_seed}/lam")
        require(lam_ids == canonical_ids and lam_labels == labels, "cross-model validation row/label mismatch")

        deberta_rev_metrics, deberta_rev_ids, deberta_rev_labels = row_metrics(deberta.get("choice_reversal_predictions"), canonical_ids, f"seed {expected_seed}/deberta-reversed")
        lam_rev_metrics, lam_rev_ids, lam_rev_labels = row_metrics(lam.get("choice_reversal_predictions"), canonical_ids, f"seed {expected_seed}/lam-reversed")
        require(deberta_rev_ids == canonical_ids and lam_rev_ids == canonical_ids, "reversal changed item identity")
        require(deberta_rev_labels == lam_rev_labels == [3 - value for value in labels], "reversal label remapping changed")

        verify_metrics(deberta.get("metrics"), deberta_metrics, f"seed {expected_seed}/deberta")
        verify_metrics(lam.get("metrics"), lam_metrics, f"seed {expected_seed}/lam")
        verify_metrics(deberta.get("choice_reversal_metrics"), deberta_rev_metrics, f"seed {expected_seed}/deberta-reversed")
        verify_metrics(lam.get("choice_reversal_metrics"), lam_rev_metrics, f"seed {expected_seed}/lam-reversed")
        delta = lam_metrics["accuracy"] - deberta_metrics["accuracy"]
        require(math.isclose(float(record["accuracy_delta_lam_minus_deberta"]), delta, rel_tol=1e-9, abs_tol=1e-9), "paired delta changed")
        lam_accuracy.append(lam_metrics["accuracy"])
        deberta_accuracy.append(deberta_metrics["accuracy"])
        deltas.append(delta)

    verify_summary(summary.get("lam_accuracy"), mean_std(lam_accuracy), "lam_accuracy")
    verify_summary(summary.get("deberta_accuracy"), mean_std(deberta_accuracy), "deberta_accuracy")
    verify_summary(summary.get("paired_accuracy_delta_lam_minus_deberta"), mean_std(deltas), "paired_delta")
    require(math.isclose(float(summary["lam_accuracy"]["mean"]), EXPECTED["lam_mean"], abs_tol=1e-12), "LAM smoke mean changed")
    require(math.isclose(float(summary["deberta_accuracy"]["mean"]), EXPECTED["deberta_mean"], abs_tol=1e-12), "DeBERTa smoke mean changed")
    require(math.isclose(float(summary["paired_accuracy_delta_lam_minus_deberta"]["mean"]), EXPECTED["delta_mean"], abs_tol=1e-12), "adverse delta changed")

    report = {
        "verdict": "RESEARCH_REPRODUCED_WITH_LIMITATIONS",
        "target_commit": TARGET_COMMIT,
        "frozen_deberta_smoke_reproduced": True,
        "adverse_result_preserved": True,
        "lam_mean_accuracy": EXPECTED["lam_mean"],
        "deberta_mean_accuracy": EXPECTED["deberta_mean"],
        "lam_minus_deberta_mean_delta": EXPECTED["delta_mean"],
        "test_split_accessed": False,
        "confirmatory_budget_executed": False,
        "research_complete": False,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
