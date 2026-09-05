from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

import torch

MODULE_PATH = Path(__file__).parents[1] / "research" / "multimodal-calibration" / "model_forward_scoring.py"
SPEC = importlib.util.spec_from_file_location("model_forward_scoring", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class Output:
    def __init__(self, logits):
        self.logits = logits


class CountingModel:
    def __init__(self, scores=None, nonfinite=False):
        self.calls = 0
        self.eval_called = False
        self.scores = scores or {10: 1.0, 11: 4.0, 12: 2.0, 13: -1.0}
        self.nonfinite = nonfinite

    def eval(self):
        self.eval_called = True
        return self

    def __call__(self, *, input_ids, pixel_values, image_grid_thw, use_cache, return_dict):
        self.calls += 1
        logits = torch.zeros((1, input_ids.shape[1], 32), dtype=torch.float32)
        token_id = int(input_ids[0, -1].item())
        logits[0, input_ids.shape[1] - 2, token_id] = self.scores[token_id]
        if self.nonfinite:
            logits[0, 0, 0] = float("nan")
        return Output(logits)


def candidates(*, prefix=(1, 2, 3), pixel_offset=0.0, grid=None):
    shared_pixels = torch.arange(12, dtype=torch.float32).reshape(1, 3, 2, 2) + pixel_offset
    shared_grid = torch.tensor([[1, 2, 2]], dtype=torch.long) if grid is None else grid
    rows = []
    for label, token_id in zip(MODULE.LABELS, (10, 11, 12, 13)):
        input_ids = torch.tensor([[*prefix, token_id]], dtype=torch.long)
        model_inputs = {"input_ids": input_ids, "pixel_values": shared_pixels, "image_grid_thw": shared_grid}
        rows.append(
            {
                "label": label,
                "context_token_count": len(prefix),
                "input_ids": input_ids,
                "pixel_values": shared_pixels,
                "image_grid_thw": shared_grid,
                "model_inputs": model_inputs,
            }
        )
    return rows


class ModelForwardScoringTests(unittest.TestCase):
    def test_causal_alignment_scores_previous_position_only(self):
        input_ids = torch.tensor([[1, 2, 3, 10]], dtype=torch.long)
        logits = torch.zeros((1, 4, 16), dtype=torch.float32)
        logits[0, 2, 10] = 3.0
        logits[0, 3, 11] = 100.0
        score = MODULE.causal_continuation_log_likelihood(
            logits=logits,
            input_ids=input_ids,
            context_token_count=3,
        )
        expected = torch.log_softmax(logits[:, 2:3, :], dim=-1)[0, 0, 10].item()
        self.assertAlmostEqual(score, expected, places=6)

    def test_scores_all_candidates_and_selects_highest_likelihood(self):
        model = CountingModel()
        result = MODULE.score_processed_candidates(model=model, candidates=candidates())
        self.assertTrue(model.eval_called)
        self.assertEqual(model.calls, 4)
        self.assertEqual(result["predicted_label"], "B")
        self.assertEqual(result["continuation_token_counts"], [1, 1, 1, 1])
        self.assertAlmostEqual(sum(result["probabilities"]), 1.0, places=7)
        self.assertGreater(result["probabilities"][1], result["probabilities"][2])

    def test_prefix_drift_fails_before_model_forward(self):
        rows = candidates()
        rows[-1]["input_ids"] = torch.tensor([[1, 9, 3, 13]], dtype=torch.long)
        rows[-1]["model_inputs"]["input_ids"] = rows[-1]["input_ids"]
        model = CountingModel()
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "exact processor context-token prefix"):
            MODULE.score_processed_candidates(model=model, candidates=rows)
        self.assertEqual(model.calls, 0)

    def test_processed_image_drift_fails_before_model_forward(self):
        rows = candidates()
        drift = rows[-1]["pixel_values"].clone()
        drift[0, 0, 0, 0] += 1
        rows[-1]["pixel_values"] = drift
        rows[-1]["model_inputs"]["pixel_values"] = drift
        model = CountingModel()
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "identical processed image tensor bytes"):
            MODULE.score_processed_candidates(model=model, candidates=rows)
        self.assertEqual(model.calls, 0)

    def test_image_grid_drift_fails_before_model_forward(self):
        rows = candidates()
        drift = torch.tensor([[1, 2, 3]], dtype=torch.long)
        rows[-1]["image_grid_thw"] = drift
        rows[-1]["model_inputs"]["image_grid_thw"] = drift
        model = CountingModel()
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "exact image_grid_thw"):
            MODULE.score_processed_candidates(model=model, candidates=rows)
        self.assertEqual(model.calls, 0)

    def test_model_input_identity_drift_fails_closed(self):
        rows = candidates()
        rows[0]["model_inputs"]["input_ids"] = rows[0]["input_ids"].clone()
        model = CountingModel()
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "input_ids identity drift"):
            MODULE.score_processed_candidates(model=model, candidates=rows)
        self.assertEqual(model.calls, 0)

    def test_nonfinite_model_logits_fail_closed(self):
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "non-finite"):
            MODULE.score_processed_candidates(model=CountingModel(nonfinite=True), candidates=candidates())

    def test_empty_continuation_fails_closed(self):
        input_ids = torch.tensor([[1, 2, 3]], dtype=torch.long)
        logits = torch.zeros((1, 3, 16), dtype=torch.float32)
        with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "at least one continuation"):
            MODULE.causal_continuation_log_likelihood(
                logits=logits,
                input_ids=input_ids,
                context_token_count=3,
            )

    def test_synthetic_preflight_is_explicitly_not_frozen_model_validation(self):
        receipt = MODULE.run_synthetic_kernel_preflight()
        self.assertEqual(
            receipt["status"],
            "SYNTHETIC_SCORING_KERNEL_FORWARD_PASS_FROZEN_MODEL_NOT_VALIDATED",
        )
        self.assertTrue(receipt["scoring_kernel_forward_executed"])
        self.assertFalse(receipt["frozen_model_forward_executed"])
        self.assertFalse(receipt["option_scorer_validated_against_frozen_model"])
        self.assertFalse(receipt["evaluation_data_accessed"])
        self.assertFalse(receipt["execution_authorized"])
        self.assertEqual(receipt["result"]["predicted_label"], "B")

    def test_cli_refuses_to_overwrite_receipt(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "receipt.json"
            self.assertEqual(MODULE.main(["--synthetic-preflight-output", str(output)]), 0)
            self.assertTrue(output.is_file())
            with self.assertRaisesRegex(MODULE.ModelForwardScoringError, "refusing to overwrite"):
                MODULE.main(["--synthetic-preflight-output", str(output)])


if __name__ == "__main__":
    unittest.main()
