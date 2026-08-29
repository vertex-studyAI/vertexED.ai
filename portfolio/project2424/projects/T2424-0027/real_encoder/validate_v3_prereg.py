from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
V2 = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
V3 = json.loads((ROOT / "manifest_v3_preregistered.json").read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


require(V3["protocol_id"] == "T2424-0027-REAL-ENCODER-GATE-v3", "wrong v3 protocol id")
require(V3["supersedes_protocol_id"] == V2["protocol_id"], "v3 must supersede frozen v2")
require(V3["execution_authorized"] is False, "v3 must remain unauthorized during preregistration closure")
require(V3["feasibility_evidence"]["encoder_instantiated"] is False, "census must remain encoder-free")
require(V3["feasibility_evidence"]["model_outcomes_accessed"] is False, "census must remain outcome-free")
require(V3["feasibility_evidence"]["census_artifact_id"] == 9718525342, "wrong census artifact")
require(V3["feasibility_evidence"]["census_artifact_zip_sha256"] == "fac53763ae4367765afb215a1c02a6c4826433d9c761d9b634465356b3ea773e", "wrong census zip digest")
require(V3["feasibility_evidence"]["census_json_sha256"] == "cffb5fd5e6147c925958a5cafbaeebb278cd9a3104b1ef3e68239f3f225690db", "wrong census json digest")

# Scientific fields inherited from v2 are immutable in this feasibility-only successor.
for key in ("encoder", "seeds", "primary_probe", "transforms", "metrics", "predeclared_success_gate"):
    require(V3[key] == V2[key], f"scientifically frozen field drifted from v2: {key}")

for key in ("repo", "revision", "dataset_version", "license", "locales", "splits", "examples_per_locale_intent_per_split", "label_for_concept", "label_for_language"):
    require(V3["dataset"][key] == V2["dataset"][key], f"frozen dataset field drifted from v2: {key}")

intents = V3["dataset"]["frozen_intents"]
require(len(intents) == 50, "v3 must freeze exactly 50 census-admissible intents")
require(len(set(intents)) == 50, "v3 frozen intents must be unique")
require(intents == sorted(intents), "v3 frozen intents must be sorted for stable review/digests")
require("cooking_query" not in intents, "known infeasible v2 cell leaked into v3")
require("audio_volume_other" not in intents, "known infeasible v1 cell leaked into v3")
require(V3["dataset"]["expected_intent_count"] == len(intents), "expected intent count mismatch")

# The integrity rules must remain fail-closed before any outcome access.
require(V3["compute_budget"]["hyperparameter_search"] == "forbidden", "hyperparameter search must remain forbidden")
require(V3["compute_budget"]["threshold_changes_after_outcome_access"] == "forbidden", "threshold movement must remain forbidden")
require(any("before encoder construction" in rule for rule in V3["stop_rules"]), "missing pre-encoder stop rule")
require(any("retain the complete result" in rule for rule in V3["stop_rules"]), "missing terminal-result retention rule")

print("T2424-0027 v3 preregistration lock: OK")
