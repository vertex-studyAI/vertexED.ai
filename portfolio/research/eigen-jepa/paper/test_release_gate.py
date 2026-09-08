#!/usr/bin/env python3
from __future__ import annotations

import copy
import importlib.util
import json
import pathlib
import unittest

HERE = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("eigen_jepa_verify_paper_artifact", HERE / "verify_paper_artifact.py")
assert SPEC is not None and SPEC.loader is not None
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


class ReleaseGateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.state = json.loads((HERE / "RELEASE_STATE_V0.json").read_text(encoding="utf-8"))
        repo_root = HERE.parents[3]
        cls.results = (repo_root / "portfolio/research/eigen-jepa/RESULTS.md").read_text(encoding="utf-8")
        cls.manuscript = (repo_root / "portfolio/research/papers/EIGEN_JEPA_MIXED_NEGATIVE_MANUSCRIPT.md").read_text(encoding="utf-8")
        cls.tex = (HERE / "main.tex").read_text(encoding="utf-8")

    def test_checked_in_sources_pass_static_release_boundary(self) -> None:
        self.assertEqual(VERIFY.verify_release_state(copy.deepcopy(self.state)), 8)
        VERIFY.verify_canonical_text(self.results, self.manuscript)
        VERIFY.verify_tex_source(self.tex)

    def test_cannot_upgrade_raw_ridge_superiority(self) -> None:
        state = copy.deepcopy(self.state)
        state["science"]["superiority_over_raw_ridge_established"] = True
        with self.assertRaises(ValueError):
            VERIFY.verify_release_state(state)

    def test_cannot_upgrade_external_validation(self) -> None:
        state = copy.deepcopy(self.state)
        state["science"]["external_validation"] = True
        with self.assertRaises(ValueError):
            VERIFY.verify_release_state(state)

    def test_cannot_claim_venue_compliance(self) -> None:
        state = copy.deepcopy(self.state)
        state["format"]["venue_compliance_claimed"] = True
        with self.assertRaises(ValueError):
            VERIFY.verify_release_state(state)

    def test_missing_retained_metric_fails_closed(self) -> None:
        damaged = self.manuscript.replace("5.8318226e-09", "REMOVED", 1)
        with self.assertRaises(ValueError):
            VERIFY.verify_canonical_text(self.results, damaged)

    def test_affirmative_raw_ridge_superiority_claim_is_rejected(self) -> None:
        damaged = self.tex + "\nEigen-JEPA outperforms raw ridge.\n"
        with self.assertRaises(ValueError):
            VERIFY.verify_tex_source(damaged)

    def test_anonymous_author_boundary_is_required(self) -> None:
        damaged = self.tex.replace(r"\author{\IEEEauthorblockN{Anonymous Authors}}", r"\author{Named Author}")
        with self.assertRaises(ValueError):
            VERIFY.verify_tex_source(damaged)

    def test_page_count_parser(self) -> None:
        self.assertEqual(VERIFY.parse_page_count("Title: test\nPages:          4\n"), 4)
        with self.assertRaises(ValueError):
            VERIFY.parse_page_count("Title: test\n")


if __name__ == "__main__":
    unittest.main(verbosity=2)
