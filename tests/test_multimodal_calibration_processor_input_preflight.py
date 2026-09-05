from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).parents[1] / "research" / "multimodal-calibration" / "processor-input-preflight.py"
SPEC = importlib.util.spec_from_file_location("processor_input_preflight", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ProcessorInputPreflightTests(unittest.TestCase):
    def test_exact_prefix_extension_is_scored_as_suffix(self) -> None:
        row = MODULE.analyze_exact_prefix(prefix_ids=[10, 20, 30], full_ids=[10, 20, 30, 40], continuation="A")
        self.assertEqual(row["context_token_count"], 3)
        self.assertEqual(row["continuation_token_count"], 1)
        self.assertEqual(row["continuation"], "A")
        self.assertEqual(row["token_boundary_policy"], "exact_processor_prefix_then_score_entire_continuation_suffix")

    def test_prefix_retokenization_fails_closed(self) -> None:
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "not an exact prefix extension"):
            MODULE.analyze_exact_prefix(prefix_ids=[10, 20, 30], full_ids=[10, 21, 30, 40], continuation="A")

    def test_missing_continuation_tokens_fails_closed(self) -> None:
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "must extend"):
            MODULE.analyze_exact_prefix(prefix_ids=[10, 20], full_ids=[10, 20], continuation="A")

    def test_non_integer_token_ids_fail_closed(self) -> None:
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "non-negative integer"):
            MODULE.analyze_exact_prefix(prefix_ids=[10, "20"], full_ids=[10, 20, 30], continuation="A")

    def test_all_labels_must_share_processor_prefix_image_and_grid(self) -> None:
        rows = []
        for label, token in zip(MODULE.LABELS, [40, 41, 42, 43]):
            row = MODULE.analyze_exact_prefix(prefix_ids=[10, 20, 30], full_ids=[10, 20, 30, token], continuation=label)
            row.update(
                {
                    "pixel_values_sha256": "a" * 64,
                    "pixel_values_shape": [1, 3, 4, 4],
                    "image_grid_thw": [[1, 2, 2]],
                }
            )
            rows.append(row)
        MODULE.validate_label_analyses(rows)

    def test_label_prefix_drift_fails_closed(self) -> None:
        rows = []
        for label, prefix in zip(MODULE.LABELS, ([10, 20], [10, 20], [10, 20], [10, 21])):
            row = MODULE.analyze_exact_prefix(prefix_ids=list(prefix), full_ids=[*prefix, 99], continuation=label)
            row.update(
                {
                    "pixel_values_sha256": "a" * 64,
                    "pixel_values_shape": [1, 3, 4, 4],
                    "image_grid_thw": [[1, 2, 2]],
                }
            )
            rows.append(row)
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "exact processor context token prefix"):
            MODULE.validate_label_analyses(rows)

    def test_processed_image_drift_fails_closed(self) -> None:
        rows = []
        for index, label in enumerate(MODULE.LABELS):
            row = MODULE.analyze_exact_prefix(prefix_ids=[10, 20], full_ids=[10, 20, 30 + index], continuation=label)
            row.update(
                {
                    "pixel_values_sha256": ("b" if index == 3 else "a") * 64,
                    "pixel_values_shape": [1, 3, 4, 4],
                    "image_grid_thw": [[1, 2, 2]],
                }
            )
            rows.append(row)
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "processed image bytes"):
            MODULE.validate_label_analyses(rows)

    def test_image_grid_drift_fails_closed(self) -> None:
        rows = []
        for index, label in enumerate(MODULE.LABELS):
            row = MODULE.analyze_exact_prefix(prefix_ids=[10, 20], full_ids=[10, 20, 30 + index], continuation=label)
            row.update(
                {
                    "pixel_values_sha256": "a" * 64,
                    "pixel_values_shape": [1, 3, 4, 4],
                    "image_grid_thw": [[1, 2, 3 if index == 3 else 2]],
                }
            )
            rows.append(row)
        with self.assertRaisesRegex(MODULE.ProcessorInputPreflightError, "exact non-null image grid"):
            MODULE.validate_label_analyses(rows)


if __name__ == "__main__":
    unittest.main()
