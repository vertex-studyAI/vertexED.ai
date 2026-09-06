from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "verify_astronomy_plasticc_candidate.py"
CANDIDATE_PATH = ROOT / "ASTRONOMY_PLASTICC_CANDIDATE_V0.json"

spec = importlib.util.spec_from_file_location("verify_astronomy_plasticc_candidate", MODULE_PATH)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
CandidateError = module.CandidateError
verify = module.verify


def load_candidate() -> dict:
    return json.loads(CANDIDATE_PATH.read_text(encoding="utf-8"))


class PlasticcCandidateTests(unittest.TestCase):
    def assert_rejected(self, candidate: dict, needle: str) -> None:
        with self.assertRaises(CandidateError) as caught:
            verify(candidate)
        self.assertIn(needle, str(caught.exception))

    def test_repository_candidate_verifies_without_authorizing_execution(self) -> None:
        result = verify(load_candidate())
        self.assertEqual(result["status"], "PLASTICC_ASTRONOMY_CANDIDATE_VERIFIED_NOT_APPROVED")
        self.assertEqual(result["development_files"], 2)
        self.assertEqual(result["heldout_files"], 12)
        self.assertFalse(result["execution_authorized"])
        self.assertFalse(result["heldout_label_access_authorized"])
        self.assertEqual(result["primary_metric"], "class_balanced_multiclass_log_loss")
        self.assertEqual(result["primary_class_labels"], [6, 15, 16, 42, 52, 53, 62, 64, 65, 67, 88, 90, 92, 95])
        self.assertEqual(result["test_only_open_set_class_label"], 99)
        self.assertEqual(result["practical_effect_threshold_absolute"], 0.02)
        self.assertEqual(result["model_seeds"], [11, 23, 37, 53, 71])
        self.assertEqual(result["bootstrap_replicates"], 10000)
        self.assertEqual(result["implementation_blob"], "6d07ab34d3fde108ea299309c299dc9ff389ab06")

    def test_candidate_cannot_self_authorize(self) -> None:
        for field in ("execution_authorized", "heldout_label_access_authorized", "model_outcomes_generated"):
            candidate = load_candidate()
            candidate[field] = True
            self.assert_rejected(candidate, "must")

    def test_official_file_identity_drift_is_rejected(self) -> None:
        candidate = load_candidate()
        candidate["official_record_file_identities"]["heldout_candidate"]["plasticc_test_lightcurves_11.csv.gz"] = "md5:" + "0" * 32
        self.assert_rejected(candidate, "heldout file identity drift")

    def test_real_sky_upgrade_is_rejected(self) -> None:
        candidate = load_candidate()
        candidate["candidate_dataset"]["dataset_character"] = "real sky validation benchmark"
        self.assert_rejected(candidate, "simulation boundary")

    def test_object_or_train_only_leakage_controls_cannot_be_relaxed(self) -> None:
        candidate = load_candidate()
        candidate["preoutcome_split_intent"]["object_identity_disjoint"] = False
        self.assert_rejected(candidate, "object-disjoint")
        candidate = load_candidate()
        candidate["preoutcome_split_intent"]["train_only_feature_fit"] = False
        self.assert_rejected(candidate, "train-only")
        candidate = load_candidate()
        candidate["preoutcome_split_intent"]["windows_may_cross_objects"] = True
        self.assert_rejected(candidate, "must not cross")

    def test_public_class_99_boundary_cannot_be_rewritten_or_promoted_to_primary(self) -> None:
        candidate = load_candidate()
        candidate["public_challenge_class_schema"]["training_surface_class_labels"] = [6, 15]
        self.assert_rejected(candidate, "training class universe drift")

        candidate = load_candidate()
        candidate["public_challenge_class_schema"]["test_only_open_set_class_label"] = 98
        self.assert_rejected(candidate, "open-set class drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["primary_class_labels"].append(99)
        self.assert_rejected(candidate, "primary class universe drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["class_99_primary_policy"] = "include_in_primary"
        self.assert_rejected(candidate, "class-99 primary policy drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["class_99_analysis_policy"] = "may_rescue_primary"
        self.assert_rejected(candidate, "class-99 no-rescue policy drift")

    def test_candidate_must_retain_public_unblinding_and_class99_review(self) -> None:
        candidate = load_candidate()
        review = candidate["required_independent_review_before_any_heldout_execution"]
        candidate["required_independent_review_before_any_heldout_execution"] = [
            "confirm an additional generic benchmark property" if "unblind" in item.lower() else item
            for item in review
        ]
        self.assert_rejected(candidate, "unblind")

        candidate = load_candidate()
        review = candidate["required_independent_review_before_any_heldout_execution"]
        candidate["required_independent_review_before_any_heldout_execution"] = [
            "confirm an additional generic benchmark property" if "class_99" in item.lower() else item
            for item in review
        ]
        self.assert_rejected(candidate, "class_99")

    def test_candidate_must_retain_simulated_only_claim_boundary(self) -> None:
        candidate = load_candidate()
        candidate["claim_boundary"] = "This candidate is a confirmed real-sky astronomy result."
        self.assert_rejected(candidate, "result claim boundary")

    def test_primary_metric_and_effect_direction_are_frozen(self) -> None:
        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["primary_metric"] = "accuracy"
        self.assert_rejected(candidate, "primary metric drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["metric_direction"] = "higher_is_better"
        self.assert_rejected(candidate, "metric direction drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["effect_definition"] = "positive favors time-agnostic JEPA"
        self.assert_rejected(candidate, "effect definition drift")

    def test_practical_effect_threshold_cannot_be_loosened_post_freeze(self) -> None:
        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["practical_effect_threshold_absolute"] = 0.0
        self.assert_rejected(candidate, "practical effect threshold drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["primary_success_rule"] = (
            "mean_seed_delta > 0 AND paired_hierarchical_bootstrap_95pct_lower_bound > 0"
        )
        self.assert_rejected(candidate, "primary success rule drift")

    def test_seed_consistency_and_seed_set_cannot_be_relaxed(self) -> None:
        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["model_seeds"] = [11, 23, 37]
        self.assert_rejected(candidate, "model seed set drift")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["seed_consistency_rule"] = (
            "at_least_3_of_5_seed_specific_deltas_strictly_positive"
        )
        self.assert_rejected(candidate, "seed consistency rule drift")

    def test_uncertainty_procedure_is_paired_hierarchical_and_fixed(self) -> None:
        candidate = load_candidate()
        uncertainty = candidate["frozen_decision_policy_if_candidate_is_approved"]["uncertainty"]
        uncertainty["method"] = "unpaired_bootstrap"
        self.assert_rejected(candidate, "uncertainty method drift")

        candidate = load_candidate()
        uncertainty = candidate["frozen_decision_policy_if_candidate_is_approved"]["uncertainty"]
        uncertainty["replicates"] = 1000
        self.assert_rejected(candidate, "bootstrap replicate drift")

        candidate = load_candidate()
        uncertainty = candidate["frozen_decision_policy_if_candidate_is_approved"]["uncertainty"]
        uncertainty["bootstrap_seed"] = 7
        self.assert_rejected(candidate, "bootstrap seed drift")

    def test_secondary_metrics_or_class99_cannot_rescue_primary_failure(self) -> None:
        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["secondary_rescue_authorized"] = True
        self.assert_rejected(candidate, "must not rescue")

        candidate = load_candidate()
        candidate["frozen_decision_policy_if_candidate_is_approved"]["primary_failure_rule"] = (
            "A strong class_99 result may rescue a failed log-loss result."
        )
        self.assert_rejected(candidate, "no-rescue")

    def test_frozen_implementation_identity_cannot_drift_or_self_authorize(self) -> None:
        candidate = load_candidate()
        candidate["implementation_freeze"]["implementation_git_blob_sha1"] = "0" * 40
        self.assert_rejected(candidate, "implementation blob drift")

        candidate = load_candidate()
        candidate["implementation_freeze"]["synthetic_verification_only"] = False
        self.assert_rejected(candidate, "synthetic-only")

        candidate = load_candidate()
        candidate["implementation_freeze"]["status"] = "AUTHORIZED"
        self.assert_rejected(candidate, "implementation freeze status drift")

    def test_execution_blockers_cannot_be_erased_after_implementation_freeze(self) -> None:
        candidate = load_candidate()
        candidate["remaining_preoutcome_blockers"] = ["freshness only"]
        self.assert_rejected(candidate, "remaining preoutcome blockers missing")

        candidate = load_candidate()
        candidate["remaining_preoutcome_blockers"] = [
            item
            for item in candidate["remaining_preoutcome_blockers"]
            if not item.lower().startswith("exact code commit")
        ]
        candidate["remaining_preoutcome_blockers"].append(
            "additional unrelated preoutcome gate retained only to keep blocker-count validation independent"
        )
        self.assert_rejected(candidate, "runtime")

        candidate = load_candidate()
        candidate["remaining_preoutcome_blockers"].append(
            "exact representation-to-class-probability readout architecture and fitting rule frozen before heldout access"
        )
        self.assert_rejected(candidate, "already frozen")


if __name__ == "__main__":
    unittest.main()
