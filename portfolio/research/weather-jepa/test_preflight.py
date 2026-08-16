import json
import unittest
from pathlib import Path

from preflight import assess_preoutcome_readiness, assert_scientific_training_authorized


FREEZE_PATH = Path(__file__).with_name("PREOUTCOME_FREEZE.json")


def current_freeze():
    return json.loads(FREEZE_PATH.read_text(encoding="utf-8"))


class WeatherJEPAPreoutcomeTests(unittest.TestCase):
    def test_current_freeze_fails_closed_on_unresolved_scientific_gates(self):
        assessment = assess_preoutcome_readiness(current_freeze())
        self.assertFalse(assessment["ready_for_scientific_training"])
        self.assertFalse(assessment["prerequisites_closed"])
        self.assertFalse(assessment["scientific_outcome_training_authorized"])

        blocker_ids = {blocker["id"] for blocker in assessment["blockers"]}
        for expected in {
            "data_license",
            "data_manifest",
            "split_manifest",
            "data_snapshot",
            "spatial_resolution",
            "split_hashes",
            "normalized_l2_definition",
            "variance_regularizer_definition",
            "spatial_mask_definition",
            "temporal_mask_definition",
            "mask_ratio_selection",
            "model_budget_manifest",
            "parameter_budget",
            "b3_matching_rule",
            "b1_climatology_implementation",
            "b2_ridge_ar_implementation",
            "b3_direct_neural_implementation",
            "environment_lock",
            "run_plan",
            "hardware_identity",
            "uncertainty_estimator",
            "raw_output_retention",
            "scientific_training_authorization",
        }:
            self.assertIn(expected, blocker_ids)

        self.assertNotIn("protocol_identity", blocker_ids)
        self.assertNotIn("b0_persistence_implementation", blocker_ids)

    def test_assertion_refuses_current_scientific_training(self):
        with self.assertRaisesRegex(RuntimeError, "WEATHER_JEPA_SCIENTIFIC_TRAINING_BLOCKED"):
            assert_scientific_training_authorized(current_freeze())

    def test_malformed_freeze_fails_closed(self):
        with self.assertRaises(TypeError):
            assess_preoutcome_readiness(None)
        assessment = assess_preoutcome_readiness({})
        self.assertFalse(assessment["ready_for_scientific_training"])
        self.assertGreater(assessment["blocker_count"], 0)

    def test_zero_variance_weight_does_not_satisfy_collapse_guard(self):
        config = current_freeze()
        config["method_definition"]["variance_regularizer_form"] = "synthetic-test-form"
        config["method_definition"]["variance_regularizer_weight"] = 0.0
        assessment = assess_preoutcome_readiness(config)
        blocker_ids = {blocker["id"] for blocker in assessment["blockers"]}
        self.assertIn("variance_regularizer_definition", blocker_ids)

    def test_synthetic_fully_frozen_control_can_close_all_gates(self):
        config = current_freeze()
        data = config["data"]
        data.update(
            {
                "license_verified": True,
                "data_manifest_sha256": "1" * 64,
                "split_manifest_sha256": "2" * 64,
                "exact_snapshot_id": "synthetic-test-snapshot",
                "spatial_resolution": "synthetic-test-grid",
                "split_hashes_frozen": True,
            }
        )
        config["method_definition"].update(
            {
                "normalized_l2_normalization_axis": "synthetic-test-axis",
                "normalized_l2_epsilon": 1e-6,
                "variance_regularizer_form": "synthetic-test-form",
                "variance_regularizer_weight": 0.1,
                "spatial_block_shape_rule": "synthetic-test-shape",
                "spatial_block_sampling_rule": "synthetic-test-sampling",
                "temporal_future_block_rule": "synthetic-test-temporal",
                "mask_ratio_selection_rule": "synthetic-test-selection",
            }
        )
        config["model_budget"].update(
            {
                "model_budget_sha256": "3" * 64,
                "exact_parameter_budget": 1000,
                "b3_matching_rule_frozen": True,
            }
        )
        for baseline in config["baselines"]:
            config["baselines"][baseline] = "IMPLEMENTED_PREOUTCOME_SYNTHETIC_TEST"
        config["execution"].update(
            {
                "environment_lock_sha256": "4" * 64,
                "run_plan_sha256": "5" * 64,
                "hardware_identity": "synthetic-test-hardware",
                "uncertainty_estimator_frozen": True,
                "raw_output_retention_path": "synthetic-test-output-path",
            }
        )
        config["scientific_outcome_training_authorized"] = True

        assessment = assess_preoutcome_readiness(config)
        self.assertTrue(assessment["prerequisites_closed"])
        self.assertTrue(assessment["ready_for_scientific_training"])
        self.assertEqual(assessment["blocker_count"], 0)
        self.assertEqual(assert_scientific_training_authorized(config), assessment)


if __name__ == "__main__":
    unittest.main()
