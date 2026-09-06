#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Mapping

MD5 = re.compile(r"^md5:[0-9a-f]{32}$")
EXPECTED_TRAIN = {
    "plasticc_train_lightcurves.csv.gz": "md5:1aa1605908b5a6398bd46bf9120b6400",
    "plasticc_train_metadata.csv.gz": "md5:8c6b00fd503d6cf3d9a42bfb53046e0f",
}
EXPECTED_TEST = {
    "plasticc_test_lightcurves_01.csv.gz": "md5:8f05f93db926e53bd846ec3a5a2352f2",
    "plasticc_test_lightcurves_02.csv.gz": "md5:58f0c553847975c828705e63775ea066",
    "plasticc_test_lightcurves_03.csv.gz": "md5:199b777a3ed921e3cdbf29e692881e03",
    "plasticc_test_lightcurves_04.csv.gz": "md5:794318beea64467992d4125837e7486f",
    "plasticc_test_lightcurves_05.csv.gz": "md5:d3898309a5953aa86bc3f7c2bce7bbad",
    "plasticc_test_lightcurves_06.csv.gz": "md5:a894cfb1af13945dc39498f65ffc9336",
    "plasticc_test_lightcurves_07.csv.gz": "md5:054724d4099d5f1fac1b07d7040cac5a",
    "plasticc_test_lightcurves_08.csv.gz": "md5:88a43509da99b9bab6e4bc5733617024",
    "plasticc_test_lightcurves_09.csv.gz": "md5:b92feaa474cd73a24770543c0b6a8bce",
    "plasticc_test_lightcurves_10.csv.gz": "md5:f8c743ccbfa47f350069dddf3de5b295",
    "plasticc_test_lightcurves_11.csv.gz": "md5:6e19c19702f64567a83b98faeb008b7a",
    "plasticc_test_metadata.csv.gz": "md5:a1fea25a371f04416f9560f9088b745c",
}
EXPECTED_COMPARATORS = [
    "time_aware_jepa",
    "time_agnostic_jepa_same_capacity",
    "persistence_baseline",
    "train_fit_robust_deviation_baseline",
]
EXPECTED_SEEDS = [11, 23, 37, 53, 71]
EXPECTED_SECONDARY = [
    "macro_one_vs_rest_average_precision",
    "macro_one_vs_rest_auroc",
]
EXPECTED_BLOCKER_TERMS = (
    "freshness",
    "licensing",
    "sha-256",
    "object-level",
    "readout",
    "outcome-blind",
    "runtime",
    "approval receipt",
)


class CandidateError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CandidateError(message)


def mapping(value: Any, name: str) -> Mapping[str, Any]:
    require(isinstance(value, Mapping), f"{name} must be an object")
    return value


def verify(candidate: Mapping[str, Any]) -> dict[str, Any]:
    require(candidate.get("schema_version") == 1, "schema_version drift")
    require(candidate.get("candidate_id") == "space-jepa-astronomy-plasticc-v1-candidate-20260906", "candidate_id drift")
    require(candidate.get("status") == "CANDIDATE_METADATA_ONLY_NOT_APPROVED_NOT_DOWNLOADED", "candidate must remain metadata-only")
    require(candidate.get("execution_authorized") is False, "candidate must not authorize execution")
    require(candidate.get("heldout_label_access_authorized") is False, "candidate must not authorize heldout label access")
    require(candidate.get("model_outcomes_generated") is False, "candidate must remain pre-outcome")

    dataset = mapping(candidate.get("candidate_dataset"), "candidate_dataset")
    require(dataset.get("doi") == "10.5281/zenodo.2539456", "PLAsTiCC DOI drift")
    require(dataset.get("version") == "v1", "PLAsTiCC version drift")
    require(dataset.get("publisher") == "Zenodo", "publisher drift")
    require(dataset.get("published_date") == "2019-01-21", "publication date drift")
    require("simulated" in str(dataset.get("dataset_character", "")).lower(), "simulation boundary missing")

    identities = mapping(candidate.get("official_record_file_identities"), "official_record_file_identities")
    train = dict(mapping(identities.get("development_candidate"), "development_candidate"))
    test = dict(mapping(identities.get("heldout_candidate"), "heldout_candidate"))
    require(train == EXPECTED_TRAIN, "development file identity drift")
    require(test == EXPECTED_TEST, "heldout file identity drift")
    require(all(MD5.fullmatch(value) for value in [*train.values(), *test.values()]), "invalid MD5 identity")

    source = mapping(candidate.get("source_evidence"), "source_evidence")
    require(source.get("metadata_only") is True, "source evidence must remain metadata-only")
    require(source.get("dataset_files_downloaded_for_this_candidate_freeze") is False, "candidate must not claim dataset download")
    require(source.get("task_rows_displayed_or_parsed_for_this_candidate_freeze") is False, "candidate must not claim task-row access")
    require(source.get("heldout_labels_displayed_or_parsed_for_this_candidate_freeze") is False, "candidate must not claim heldout-label access")

    split = mapping(candidate.get("preoutcome_split_intent"), "preoutcome_split_intent")
    require(split.get("object_identity_disjoint") is True, "object-disjoint boundary must remain required")
    require(split.get("train_only_feature_fit") is True, "feature fitting must remain train-only")
    require(split.get("windows_may_cross_objects") is False, "windows must not cross objects")
    require("freshness fails" in str(split.get("fallback_if_confirmatory_freshness_fails", "")).lower(), "freshness fallback missing")

    require(candidate.get("frozen_comparator_family_if_candidate_is_approved") == EXPECTED_COMPARATORS, "comparator family drift")

    decision = mapping(candidate.get("frozen_decision_policy_if_candidate_is_approved"), "frozen_decision_policy_if_candidate_is_approved")
    require(decision.get("primary_comparison") == "time_aware_jepa_vs_time_agnostic_jepa_same_capacity", "primary comparison drift")
    require(decision.get("primary_metric") == "class_balanced_multiclass_log_loss", "primary metric drift")
    metric_definition = str(decision.get("primary_metric_definition", "")).lower()
    for term in ("true class", "renormalization", "1e-15", "unweighted mean"):
        require(term in metric_definition, f"primary metric definition missing {term}")
    require(decision.get("metric_direction") == "lower_is_better", "metric direction drift")
    require(decision.get("effect_definition") == "delta = loss_time_agnostic_jepa - loss_time_aware_jepa; positive favors time-aware JEPA", "effect definition drift")
    require(decision.get("practical_effect_threshold_absolute") == 0.02, "practical effect threshold drift")
    require(decision.get("model_seeds") == EXPECTED_SEEDS, "model seed set drift")
    require(decision.get("seed_consistency_rule") == "at_least_4_of_5_seed_specific_deltas_strictly_positive", "seed consistency rule drift")

    uncertainty = mapping(decision.get("uncertainty"), "uncertainty")
    require(uncertainty.get("method") == "paired_hierarchical_bootstrap", "uncertainty method drift")
    require(uncertainty.get("replicates") == 10000, "bootstrap replicate drift")
    require(uncertainty.get("bootstrap_seed") == 20260906, "bootstrap seed drift")
    require(uncertainty.get("confidence_interval") == "two_sided_95_percentile", "confidence interval drift")
    resampling = str(uncertainty.get("resampling_unit", "")).lower()
    for term in ("model seeds", "confirmatory objects", "separately inside each true class", "paired delta"):
        require(term in resampling, f"hierarchical resampling rule missing {term}")

    require(
        decision.get("primary_success_rule")
        == "mean_seed_delta >= 0.02 AND paired_hierarchical_bootstrap_95pct_lower_bound > 0 AND at_least_4_of_5_seed_specific_deltas_strictly_positive",
        "primary success rule drift",
    )
    failure_rule = str(decision.get("primary_failure_rule", "")).lower()
    require("no secondary metric" in failure_rule and "cannot rescue" in failure_rule, "primary failure/no-rescue rule drift")
    require(decision.get("secondary_metrics_descriptive_only") == EXPECTED_SECONDARY, "secondary metric set drift")
    require(decision.get("secondary_rescue_authorized") is False, "secondary metrics must not rescue primary failure")
    require("only the time-aware versus time-agnostic" in str(decision.get("multiple_comparison_policy", "")).lower(), "confirmatory comparison boundary drift")
    require(decision.get("post_outcome_threshold_or_seed_changes_authorized") is False, "post-outcome threshold/seed changes must remain prohibited")

    blockers = candidate.get("remaining_preoutcome_blockers")
    require(isinstance(blockers, list) and len(blockers) >= 8, "remaining preoutcome blockers missing")
    blockers_joined = " ".join(str(item).lower() for item in blockers)
    for term in EXPECTED_BLOCKER_TERMS:
        require(term in blockers_joined, f"remaining blocker must retain {term} gate")

    review = candidate.get("required_independent_review_before_any_heldout_execution")
    require(isinstance(review, list) and len(review) >= 7, "independent review gates missing")
    joined = " ".join(str(item).lower() for item in review)
    for term in ("checksum", "license", "unblind", "label", "decision policy", "simulated"):
        require(term in joined, f"independent review must retain {term} gate")

    boundary = str(candidate.get("claim_boundary", "")).lower()
    require("not an astronomy result" in boundary, "result claim boundary missing")
    require("simulated transient-classification" in boundary, "simulation claim boundary missing")
    require("freezes its confirmatory decision policy" in boundary, "decision-policy claim boundary missing")

    return {
        "status": "PLASTICC_ASTRONOMY_CANDIDATE_VERIFIED_NOT_APPROVED",
        "development_files": len(train),
        "heldout_files": len(test),
        "execution_authorized": False,
        "heldout_label_access_authorized": False,
        "primary_metric": decision["primary_metric"],
        "practical_effect_threshold_absolute": decision["practical_effect_threshold_absolute"],
        "model_seeds": decision["model_seeds"],
        "bootstrap_replicates": uncertainty["replicates"],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("candidate", type=Path, nargs="?", default=Path(__file__).with_name("ASTRONOMY_PLASTICC_CANDIDATE_V0.json"))
    args = parser.parse_args()
    try:
        payload = json.loads(args.candidate.read_text(encoding="utf-8"))
        result = verify(payload)
    except (OSError, json.JSONDecodeError, CandidateError) as exc:
        print(f"FAIL: {exc}")
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
