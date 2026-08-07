from __future__ import annotations

import argparse
import json
import statistics
from collections import Counter
from dataclasses import replace
from pathlib import Path

import torch
import torch.nn.functional as F

from lam_jepa.benchmarking.arc_challenge import LAMARCClassifier, batchify, load_arc_split
from lam_jepa.benchmarking.arc_protocol import select_protocol_eligible_examples
from lam_jepa.benchmarking.arc_v5_repair import (
    ARC_V5_REPAIR_ID,
    arc_v5_repair_spec,
    build_arc_v5_repaired_classifier,
)
from lam_jepa.model import LAMJEPAConfig
from lam_jepa.utils import set_seed

TARGET_COMMIT = "df249086e9171febaa77333a4c62888f35265c40"
PRIMARY_RUN_ID = 31204300683
EXPECTED_TRAIN_SHA256 = "e488c1587ffdcfc8443f916c53488a95cd471c5790e0746c6bfe4cecf20962cb"
EXPECTED_PRIMARY_ARTIFACT_SHA256 = "2bd5cadf7dad6ea24a0e01964f7268049b42271869ef4bcf1f4126e3a63a98d8"
EXPECTED_SEEDS = (1, 2)
CHECKPOINTS = (0, 1, 5, 10, 25, 50, 100, 200, 300)
OVERFIT_THRESHOLD = 0.95
VALIDATION_WORKFLOWS = (
    "arc-protocol-v3-full-controls-validation.yml",
    "arc-protocol-v3-controls.yml",
    "arc-matched-v3-validation.yml",
    "arc-pretrained-baseline.yml",
    "arc-matched-baseline.yml",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def balanced_subset(examples, per_class: int = 8) -> list:
    buckets = {label: [] for label in range(4)}
    for example in examples:
        if len(example.choices) != 4:
            continue
        if len(buckets[example.label]) < per_class:
            buckets[example.label].append(example)
        if all(len(bucket) == per_class for bucket in buckets.values()):
            break
    require(all(len(bucket) == per_class for bucket in buckets.values()), "unable to build balanced train subset")
    return [buckets[label][index] for index in range(per_class) for label in range(4)]


def build(condition: str):
    if condition == "legacy":
        return LAMARCClassifier(LAMJEPAConfig(), num_choices=4)
    if condition == "repaired_v5":
        return build_arc_v5_repaired_classifier(LAMJEPAConfig(), num_choices=4)
    if condition == "no_quantizer":
        return LAMARCClassifier(replace(LAMJEPAConfig(), use_quantizer=False), num_choices=4)
    raise ValueError(condition)


@torch.no_grad()
def evaluate(model, tokens, numeric_x, labels) -> dict[str, object]:
    model.eval()
    logits, outputs = model(tokens, numeric_x, model_steps=1, deterministic=True)
    predictions = logits.argmax(dim=-1)
    result: dict[str, object] = {
        "accuracy": float(predictions.eq(labels).float().mean().item()),
        "cross_entropy": float(F.cross_entropy(logits, labels).item()),
        "prediction_support": len(set(predictions.detach().cpu().tolist())),
        "z_feature_std": float(outputs["z"].float().std(dim=0, unbiased=False).mean().item()),
        "z_q_feature_std": float(outputs["z_q"].float().std(dim=0, unbiased=False).mean().item()),
        "latent_summary_feature_std": float(outputs["latent_summary"].float().std(dim=0, unbiased=False).mean().item()),
    }
    if model.backbone.cfg.use_quantizer:
        q = model.backbone.quantizer
        indices = outputs["indices"].detach().cpu().tolist()
        result["quantizer"] = {
            "code_support": len(set(indices)),
            "code_histogram": {str(k): int(v) for k, v in sorted(Counter(indices).items())},
            "ema_count_min": float(q.ema_count.min().item()),
            "ema_count_max": float(q.ema_count.max().item()),
            "finite": bool(
                torch.isfinite(q.codebook).all()
                and torch.isfinite(q.ema_count).all()
                and torch.isfinite(q.ema_weight).all()
            ),
        }
    return result


def train(condition: str, seed: int, tokens, numeric_x, labels) -> dict[str, object]:
    set_seed(seed)
    model = build(condition)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
    history = [{"step": 0, **evaluate(model, tokens, numeric_x, labels)}]
    for step in range(1, 301):
        model.train()
        optimizer.zero_grad(set_to_none=True)
        logits, _ = model(tokens, numeric_x, model_steps=1, deterministic=False)
        loss = F.cross_entropy(logits, labels)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        model.backbone.update_target()
        if step in CHECKPOINTS:
            history.append({"step": step, **evaluate(model, tokens, numeric_x, labels)})
    return {"condition": condition, "seed": seed, "history": history}


def summarize(records: list[dict[str, object]]) -> dict[str, object]:
    best = [max(float(point["accuracy"]) for point in record["history"]) for record in records]
    final = [float(record["history"][-1]["accuracy"]) for record in records]
    return {
        "best_accuracy_by_seed": best,
        "final_accuracy_by_seed": final,
        "mean_best_accuracy": float(statistics.fmean(best)),
        "all_seeds_reach_overfit_threshold": all(value >= OVERFIT_THRESHOLD for value in best),
    }


def verify_workflow_guards(target_dir: Path) -> dict[str, object]:
    evidence: dict[str, object] = {}
    for name in VALIDATION_WORKFLOWS:
        path = target_dir / ".github" / "workflows" / name
        require(path.is_file(), f"missing guarded workflow: {name}")
        text = path.read_text(encoding="utf-8")
        top = "\n".join(text.splitlines()[:12])
        require("workflow_dispatch:" in top, f"{name}: missing manual dispatch")
        require("pull_request:" not in top, f"{name}: validation workflow still auto-runs on pull_request")
        require("push:" not in top, f"{name}: validation workflow still auto-runs on push")
        evidence[name] = {"manual_only": True}
    return evidence


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent clean-checkout reproduction of the LAM-JEPA ARC v5 train-only repair.")
    parser.add_argument("--target-dir", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--primary-artifact", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    require(args.target_commit_file.read_text(encoding="utf-8").strip() == TARGET_COMMIT, "target commit mismatch")
    require(args.train.name == "arc-challenge-train.parquet", "unexpected train filename")
    require(not (args.train.parent / "arc-challenge-validation.parquet").exists(), "validation split present")
    require(not (args.train.parent / "arc-challenge-test.parquet").exists(), "test split present")

    primary = json.loads(args.primary_artifact.read_text(encoding="utf-8"))
    require(primary.get("verdict") == "PRIMARY_REPAIR_TRAINABILITY_GATE_PASSED", "primary artifact did not pass")
    require(primary.get("repair_id") == ARC_V5_REPAIR_ID, "primary repair id mismatch")
    require(primary.get("claim_boundary") == {
        "validation_accessed": False,
        "test_accessed": False,
        "independent_reproduction_complete": False,
        "validation_authorized": False,
        "performance_claim_authorized": False,
        "research_complete": False,
    }, "primary claim boundary weakened")

    spec = arc_v5_repair_spec()
    require(spec == {
        "repair_id": ARC_V5_REPAIR_ID,
        "ema_pseudocount": 1.0,
        "ema_weight_initialization": "copy_live_codebook",
        "hard_fraction": 0.03125,
        "continuous_fraction": 0.96875,
        "legacy_default_behavior_changed": False,
        "validation_authorized": False,
        "confirmatory_test_authorized": False,
    }, "repair spec drift")

    guards = verify_workflow_guards(args.target_dir)
    eligible = select_protocol_eligible_examples(load_arc_split(args.train)).eligible
    subset = balanced_subset(eligible)
    require(len(subset) == 32, "wrong independent subset size")
    require(Counter(example.label for example in subset) == Counter({0: 8, 1: 8, 2: 8, 3: 8}), "subset not balanced")

    cfg = LAMJEPAConfig()
    tokens, numeric_x, labels = batchify(subset, vocab_size=cfg.vocab_size, device="cpu")
    conditions = ("legacy", "repaired_v5", "no_quantizer")
    records = {condition: [] for condition in conditions}
    for seed in EXPECTED_SEEDS:
        for condition in conditions:
            records[condition].append(train(condition, seed, tokens, numeric_x, labels))
    summaries = {condition: summarize(records[condition]) for condition in conditions}

    require(summaries["legacy"]["best_accuracy_by_seed"] == [0.25, 0.25], "legacy failure did not independently reproduce")
    require(summaries["repaired_v5"]["all_seeds_reach_overfit_threshold"] is True, "repaired v5 failed independent threshold")
    require(summaries["repaired_v5"]["best_accuracy_by_seed"] == [1.0, 0.96875], "repaired v5 exact best accuracies drifted")
    require(summaries["no_quantizer"]["best_accuracy_by_seed"] == [0.96875, 0.96875], "no-quantizer reference drifted")

    report = {
        "verdict": "REPAIR_REPRODUCED_TRAIN_ONLY",
        "target_commit": TARGET_COMMIT,
        "primary_run_id": PRIMARY_RUN_ID,
        "primary_artifact_sha256": EXPECTED_PRIMARY_ARTIFACT_SHA256,
        "expected_train_sha256": EXPECTED_TRAIN_SHA256,
        "repair_spec": spec,
        "workflow_guards": guards,
        "subset": {
            "rows": 32,
            "per_class": 8,
            "ids": [example.item_id for example in subset],
        },
        "summaries": summaries,
        "records": records,
        "independent_reproduction_complete": True,
        "validation_accessed": False,
        "test_accessed": False,
        "validation_authorized": False,
        "performance_claim_authorized": False,
        "research_complete": False,
        "next_gate": "Coordinator may freeze a new validation-only protocol for the repaired v5 path; confirmatory ARC test remains forbidden.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"verdict": report["verdict"], "summaries": summaries, "workflow_guards": guards}, indent=2))


if __name__ == "__main__":
    main()
