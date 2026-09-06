from __future__ import annotations

import copy
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

    def test_candidate_must_retain_public_unblinding_review(self) -> None:
        candidate = load_candidate()
        candidate["required_independent_review_before_any_heldout_execution"] = [
            item for item in candidate["required_independent_review_before_any_heldout_execution"] if "unblind" not in item.lower()
        ]
        self.assert_rejected(candidate, "unblind")

    def test_candidate_must_retain_simulated_only_claim_boundary(self) -> None:
        candidate = load_candidate()
        candidate["claim_boundary"] = "This candidate is a confirmed real-sky astronomy result."
        self.assert_rejected(candidate, "result claim boundary")


if __name__ == "__main__":
    unittest.main()
