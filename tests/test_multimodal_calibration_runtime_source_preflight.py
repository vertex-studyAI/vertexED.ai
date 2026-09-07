from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest

MODULE_PATH = Path(__file__).resolve().parents[1] / "research" / "multimodal-calibration" / "runtime-source-preflight.py"
SPEC = importlib.util.spec_from_file_location("runtime_source_preflight", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
preflight = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preflight)


class RuntimeSourcePreflightTests(unittest.TestCase):
    def test_exact_boundary_is_accepted(self) -> None:
        analysis = preflight.analyze_tokenization_boundary(
            prompt="Answer:",
            continuation="A",
            input_ids=[10, 11],
            offset_mapping=[(0, 7), (7, 8)],
        )
        self.assertEqual(analysis["absorbed_prompt_whitespace_characters"], 0)
        self.assertEqual(analysis["continuation_token_count"], 1)

    def test_whitespace_only_boundary_absorption_is_accepted(self) -> None:
        analysis = preflight.analyze_tokenization_boundary(
            prompt="Answer: ",
            continuation="B",
            input_ids=[10, 12],
            offset_mapping=[(0, 7), (7, 9)],
        )
        self.assertEqual(analysis["absorbed_prompt_whitespace_characters"], 1)
        self.assertEqual(analysis["scored_character_start"], 7)

    def test_non_whitespace_prompt_straddle_fails_closed(self) -> None:
        with self.assertRaisesRegex(preflight.PreflightError, "straddles non-whitespace"):
            preflight.analyze_tokenization_boundary(
                prompt="Answer:",
                continuation="C",
                input_ids=[10],
                offset_mapping=[(5, 8)],
            )

    def test_missing_continuation_coverage_fails_closed(self) -> None:
        with self.assertRaisesRegex(preflight.PreflightError, "no token covering the continuation"):
            preflight.analyze_tokenization_boundary(
                prompt="Answer: ",
                continuation="D",
                input_ids=[10],
                offset_mapping=[(0, 7)],
            )

    def test_all_labels_must_share_identical_context_prefix(self) -> None:
        analyses = []
        for label, token in zip(preflight.LABELS, [20, 21, 22, 23], strict=True):
            analyses.append(
                preflight.analyze_tokenization_boundary(
                    prompt="Answer: ",
                    continuation=label,
                    input_ids=[5, token],
                    offset_mapping=[(0, 7), (7, 9)],
                )
            )
        preflight.validate_label_analyses(analyses)

        analyses[2]["context_token_ids_sha256"] = "0" * 64
        with self.assertRaisesRegex(preflight.PreflightError, "identical tokenizer context prefix"):
            preflight.validate_label_analyses(analyses)

    def test_label_order_is_frozen(self) -> None:
        analyses = []
        for label, token in zip(preflight.LABELS, [20, 21, 22, 23], strict=True):
            analyses.append(
                preflight.analyze_tokenization_boundary(
                    prompt="Answer: ",
                    continuation=label,
                    input_ids=[5, token],
                    offset_mapping=[(0, 7), (7, 9)],
                )
            )
        analyses[0], analyses[1] = analyses[1], analyses[0]
        with self.assertRaisesRegex(preflight.PreflightError, "canonical A-D order"):
            preflight.validate_label_analyses(analyses)


if __name__ == "__main__":
    unittest.main()
