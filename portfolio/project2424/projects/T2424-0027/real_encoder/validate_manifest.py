from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict


FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
EXPECTED_SEEDS = [2401, 2402, 2403, 2404, 2405]
EXPECTED_LOCALES = ["en-US", "es-ES", "fr-FR"]
EXPECTED_ARTIFACTS = {
    "resolved_manifest.json",
    "environment.json",
    "dataset_fingerprint.json",
    "model_revision.json",
    "per_seed_metrics.jsonl",
    "summary.json",
    "verdict.json",
}
EXPECTED_GATE = {
    "mean_raw_language_accuracy_min": 0.75,
    "mean_effect_retention_min": 0.70,
    "mean_intent_drop_max": 0.02,
    "mean_specificity_margin_min": 0.15,
    "required_seed_passes": 4,
    "required_seed_count": 5,
}


def validate_manifest(data: Dict[str, Any]) -> None:
    assert data["protocol_id"] == "T2424-0027-REAL-ENCODER-GATE-v1"
    assert data["status"] == "FROZEN_BEFORE_OUTCOME_ACCESS"
    assert data["execution_authorized"] is True
    assert data["parent_frozen_implementation_commit"] == "d3250fe5fc399905c93a517bbbd61d0c5ad8d5d6"
    assert data["parent_reproduced_output_sha256"] == "0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605"
    assert abs(float(data["parent_normalized_language_leakage_reduction"]) - 0.9583333333333334) < 1e-15

    dataset = data["dataset"]
    assert dataset["repo"] == "AmazonScience/massive"
    assert FULL_SHA.fullmatch(dataset["revision"]), "dataset revision must be a full 40-char SHA"
    assert dataset["revision"] == "ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740"
    assert dataset["dataset_version"] == "1.1"
    assert dataset["license"] == "CC-BY-4.0"
    assert dataset["locales"] == EXPECTED_LOCALES
    assert dataset["splits"] == {"fit": "train", "evaluation": "test"}
    assert dataset["label_for_concept"] == "intent"
    assert dataset["label_for_language"] == "locale"

    encoder = data["encoder"]
    assert encoder["repo"] == "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    assert FULL_SHA.fullmatch(encoder["revision"]), "encoder revision must be a full 40-char SHA"
    assert encoder["revision"] == "e8f8c211226b894fcb81acc59f3b34ba3efd5f42"
    assert encoder["license"] == "Apache-2.0"
    assert encoder["embedding_dimension"] == 384
    assert encoder["fine_tuning"] is False
    assert encoder["normalize_embeddings"] is False

    assert data["seeds"] == EXPECTED_SEEDS
    assert data["predeclared_success_gate"] == EXPECTED_GATE
    assert set(data["transforms"]) == {
        "raw",
        "language_centering",
        "global_centering",
        "random_group_centering",
        "random_subspace",
    }
    assert set(data["artifacts"]["required"]) == EXPECTED_ARTIFACTS

    budget = data["budget"]
    assert budget["encoder_fine_tuning"] == "forbidden"
    assert budget["gpu_hours"] == 0
    assert budget["maximum_encoder_forward_passes_per_unique_utterance"] == 1
    assert budget["hyperparameter_search"] == "forbidden"
    assert budget["threshold_changes_after_outcome_access"] == "forbidden"


def main() -> None:
    parser = argparse.ArgumentParser(description="Fail-closed validation for the frozen T2424-0027 real-encoder manifest.")
    parser.add_argument("manifest", nargs="?", default=str(Path(__file__).resolve().parent / "manifest.json"))
    args = parser.parse_args()
    path = Path(args.manifest)
    validate_manifest(json.loads(path.read_text(encoding="utf-8")))
    print(f"PASS: frozen manifest validated: {path}")


if __name__ == "__main__":
    main()
