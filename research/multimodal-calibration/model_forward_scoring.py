from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

LABELS = ("A", "B", "C", "D")
SCHEMA_VERSION = "multimodal-calibration.model-forward-scoring-kernel.v1"


class ModelForwardScoringError(RuntimeError):
    pass


def _package_version(name: str) -> str:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError as exc:
        raise ModelForwardScoringError(f"required package {name} is not installed") from exc


def _as_single_sequence_ids(value: Any, field: str) -> list[int]:
    if hasattr(value, "detach"):
        value = value.detach().cpu()
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list) and len(value) == 1 and isinstance(value[0], list):
        value = value[0]
    if not isinstance(value, list) or not value:
        raise ModelForwardScoringError(f"{field} must be one non-empty token-id sequence")
    if not all(isinstance(item, int) and item >= 0 for item in value):
        raise ModelForwardScoringError(f"{field} must contain non-negative integer token ids")
    return value


def _tensor_digest(value: Any, field: str) -> str:
    try:
        import torch
    except ImportError as exc:
        raise ModelForwardScoringError("torch is required for tensor identity checks") from exc
    if not torch.is_tensor(value):
        raise ModelForwardScoringError(f"{field} must be a torch tensor")
    if value.numel() == 0:
        raise ModelForwardScoringError(f"{field} must be non-empty")
    if value.is_floating_point() and not torch.isfinite(value).all().item():
        raise ModelForwardScoringError(f"{field} contains non-finite values")
    canonical = value.detach().cpu().contiguous()
    header = json.dumps(
        {"dtype": str(canonical.dtype), "shape": list(canonical.shape)},
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    payload = canonical.numpy().tobytes(order="C")
    return hashlib.sha256(header + b"\0" + payload).hexdigest()


def _normalize_grid(value: Any, field: str) -> list[list[int]]:
    if hasattr(value, "detach"):
        value = value.detach().cpu()
    if hasattr(value, "tolist"):
        value = value.tolist()
    if not isinstance(value, list) or not value:
        raise ModelForwardScoringError(f"{field} must be a non-empty grid")
    if value and all(isinstance(item, int) for item in value):
        value = [value]
    if not all(
        isinstance(row, list)
        and len(row) == 3
        and all(isinstance(item, int) and item > 0 for item in row)
        for row in value
    ):
        raise ModelForwardScoringError(f"{field} must contain positive integer [t,h,w] rows")
    return value


def _softmax(values: Sequence[float]) -> list[float]:
    if len(values) < 2 or not all(math.isfinite(value) for value in values):
        raise ModelForwardScoringError("option log-likelihoods must be finite")
    maximum = max(values)
    weights = [math.exp(value - maximum) for value in values]
    denominator = sum(weights)
    if not math.isfinite(denominator) or denominator <= 0:
        raise ModelForwardScoringError("softmax denominator is invalid")
    return [value / denominator for value in weights]


def causal_continuation_log_likelihood(*, logits: Any, input_ids: Any, context_token_count: int) -> float:
    """Score only continuation tokens under causal teacher forcing.

    Token at absolute position p is scored from logits at p-1. The context itself is
    never included in the score.
    """
    try:
        import torch
    except ImportError as exc:
        raise ModelForwardScoringError("torch is required for model-forward scoring") from exc

    if not isinstance(context_token_count, int) or context_token_count < 1:
        raise ModelForwardScoringError("context_token_count must be an integer >= 1")
    if not torch.is_tensor(logits) or logits.ndim != 3 or logits.shape[0] != 1:
        raise ModelForwardScoringError("logits must have shape [1, sequence, vocab]")
    if not torch.is_tensor(input_ids) or input_ids.ndim != 2 or input_ids.shape[0] != 1:
        raise ModelForwardScoringError("input_ids must have shape [1, sequence]")
    if logits.shape[1] != input_ids.shape[1]:
        raise ModelForwardScoringError("logits and input_ids sequence lengths differ")
    if context_token_count >= input_ids.shape[1]:
        raise ModelForwardScoringError("candidate must contain at least one continuation token")
    if not torch.isfinite(logits).all().item():
        raise ModelForwardScoringError("model logits contain non-finite values")

    continuation_ids = input_ids[:, context_token_count:]
    scoring_logits = logits[:, context_token_count - 1 : input_ids.shape[1] - 1, :]
    if scoring_logits.shape[1] != continuation_ids.shape[1]:
        raise ModelForwardScoringError("causal continuation alignment is inconsistent")
    if continuation_ids.min().item() < 0 or continuation_ids.max().item() >= logits.shape[-1]:
        raise ModelForwardScoringError("continuation token id is outside model vocabulary")

    log_probs = torch.log_softmax(scoring_logits.float(), dim=-1)
    token_log_probs = log_probs.gather(-1, continuation_ids.unsqueeze(-1)).squeeze(-1)
    if not torch.isfinite(token_log_probs).all().item():
        raise ModelForwardScoringError("continuation log probabilities contain non-finite values")
    return float(token_log_probs.sum(dtype=torch.float32).item())


def validate_processed_candidates(candidates: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    if len(candidates) != len(LABELS):
        raise ModelForwardScoringError(f"expected exactly {len(LABELS)} processed candidates")
    if [candidate.get("label") for candidate in candidates] != list(LABELS):
        raise ModelForwardScoringError("processed candidates must remain in canonical A-D order")

    context_counts = {candidate.get("context_token_count") for candidate in candidates}
    if len(context_counts) != 1:
        raise ModelForwardScoringError("all candidates must share one context_token_count")
    context_token_count = next(iter(context_counts))
    if not isinstance(context_token_count, int) or context_token_count < 1:
        raise ModelForwardScoringError("context_token_count must be an integer >= 1")

    prefixes: list[list[int]] = []
    pixel_digests: set[str] = set()
    grids: set[str] = set()
    for candidate in candidates:
        ids = _as_single_sequence_ids(candidate.get("input_ids"), f"{candidate['label']}.input_ids")
        if context_token_count >= len(ids):
            raise ModelForwardScoringError(f"{candidate['label']} has no continuation tokens")
        prefixes.append(ids[:context_token_count])
        pixel_digests.add(_tensor_digest(candidate.get("pixel_values"), f"{candidate['label']}.pixel_values"))
        grids.add(json.dumps(_normalize_grid(candidate.get("image_grid_thw"), f"{candidate['label']}.image_grid_thw")))

    reference_prefix = prefixes[0]
    if any(prefix != reference_prefix for prefix in prefixes[1:]):
        raise ModelForwardScoringError("all candidates must share the exact processor context-token prefix")
    if len(pixel_digests) != 1:
        raise ModelForwardScoringError("all candidates must share identical processed image tensor bytes")
    if len(grids) != 1:
        raise ModelForwardScoringError("all candidates must share the exact image_grid_thw")

    return {
        "context_token_count": context_token_count,
        "context_token_ids_sha256": hashlib.sha256(
            json.dumps(reference_prefix, separators=(",", ":")).encode("utf-8")
        ).hexdigest(),
        "pixel_values_sha256": next(iter(pixel_digests)),
        "image_grid_thw": json.loads(next(iter(grids))),
    }


def score_processed_candidates(*, model: Any, candidates: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    try:
        import torch
    except ImportError as exc:
        raise ModelForwardScoringError("torch is required for model-forward scoring") from exc

    common = validate_processed_candidates(candidates)
    if model is None or not callable(model):
        raise ModelForwardScoringError("model must be callable")
    if hasattr(model, "eval"):
        model.eval()

    log_likelihoods: list[float] = []
    continuation_token_counts: list[int] = []
    for candidate in candidates:
        model_inputs = candidate.get("model_inputs")
        if not isinstance(model_inputs, Mapping):
            raise ModelForwardScoringError(f"{candidate['label']}.model_inputs must be a mapping")
        if "input_ids" not in model_inputs:
            raise ModelForwardScoringError(f"{candidate['label']}.model_inputs is missing input_ids")
        if model_inputs["input_ids"] is not candidate.get("input_ids"):
            raise ModelForwardScoringError(f"{candidate['label']} input_ids identity drift between validation and model inputs")
        if model_inputs.get("pixel_values") is not candidate.get("pixel_values"):
            raise ModelForwardScoringError(f"{candidate['label']} pixel_values identity drift between validation and model inputs")
        if model_inputs.get("image_grid_thw") is not candidate.get("image_grid_thw"):
            raise ModelForwardScoringError(f"{candidate['label']} image_grid_thw identity drift between validation and model inputs")

        with torch.inference_mode():
            outputs = model(**dict(model_inputs), use_cache=False, return_dict=True)
        logits = getattr(outputs, "logits", None)
        if logits is None:
            raise ModelForwardScoringError(f"{candidate['label']} model output is missing logits")
        score = causal_continuation_log_likelihood(
            logits=logits,
            input_ids=model_inputs["input_ids"],
            context_token_count=common["context_token_count"],
        )
        log_likelihoods.append(score)
        continuation_token_counts.append(int(model_inputs["input_ids"].shape[1] - common["context_token_count"]))

    probabilities = _softmax(log_likelihoods)
    best_index = max(range(len(probabilities)), key=probabilities.__getitem__)
    return {
        "labels": list(LABELS),
        "log_likelihoods": log_likelihoods,
        "probabilities": probabilities,
        "predicted_label": LABELS[best_index],
        "continuation_token_counts": continuation_token_counts,
        "context_token_count": common["context_token_count"],
        "context_token_ids_sha256": common["context_token_ids_sha256"],
        "pixel_values_sha256": common["pixel_values_sha256"],
        "image_grid_thw": common["image_grid_thw"],
        "scoring_policy": "sum_float32_log_softmax_over_all_continuation_tokens_using_causal_position_p_minus_1",
    }


def run_synthetic_kernel_preflight() -> dict[str, Any]:
    try:
        import torch
    except ImportError as exc:
        raise ModelForwardScoringError("torch is required for synthetic scoring-kernel preflight") from exc

    class Output:
        def __init__(self, logits: Any) -> None:
            self.logits = logits

    class TinyDeterministicModel:
        def eval(self) -> "TinyDeterministicModel":
            return self

        def __call__(self, *, input_ids: Any, pixel_values: Any, image_grid_thw: Any, use_cache: bool, return_dict: bool) -> Output:
            del pixel_values, image_grid_thw
            if use_cache is not False or return_dict is not True:
                raise ModelForwardScoringError("synthetic model received unexpected forward flags")
            vocab = 32
            logits = torch.zeros((1, input_ids.shape[1], vocab), dtype=torch.float32)
            continuation_id = int(input_ids[0, -1].item())
            rank_score = {10: 1.0, 11: 4.0, 12: 2.0, 13: -1.0}[continuation_id]
            logits[0, input_ids.shape[1] - 2, continuation_id] = rank_score
            return Output(logits)

    context = [1, 2, 3]
    pixels = torch.arange(12, dtype=torch.float32).reshape(1, 3, 2, 2)
    grid = torch.tensor([[1, 2, 2]], dtype=torch.long)
    candidates = []
    for label, token_id in zip(LABELS, (10, 11, 12, 13)):
        input_ids = torch.tensor([[*context, token_id]], dtype=torch.long)
        model_inputs = {"input_ids": input_ids, "pixel_values": pixels, "image_grid_thw": grid}
        candidates.append(
            {
                "label": label,
                "context_token_count": len(context),
                "input_ids": input_ids,
                "pixel_values": pixels,
                "image_grid_thw": grid,
                "model_inputs": model_inputs,
            }
        )

    result = score_processed_candidates(model=TinyDeterministicModel(), candidates=candidates)
    if result["predicted_label"] != "B":
        raise ModelForwardScoringError("synthetic scoring kernel failed deterministic winner check")
    return {
        "schema_version": SCHEMA_VERSION,
        "status": "SYNTHETIC_SCORING_KERNEL_FORWARD_PASS_FROZEN_MODEL_NOT_VALIDATED",
        "runtime": {
            "python": platform.python_version(),
            "implementation": platform.python_implementation(),
            "platform": platform.platform(),
            "torch": _package_version("torch"),
        },
        "result": result,
        "evaluation_data_accessed": False,
        "frozen_model_weights_loaded": False,
        "frozen_model_forward_executed": False,
        "scoring_kernel_forward_executed": True,
        "option_scorer_validated_against_frozen_model": False,
        "execution_authorized": False,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the teacher-forced model-forward scoring kernel without evaluation data.")
    parser.add_argument("--synthetic-preflight-output", type=Path)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    if args.synthetic_preflight_output is None:
        raise ModelForwardScoringError("--synthetic-preflight-output is required")
    receipt = run_synthetic_kernel_preflight()
    args.synthetic_preflight_output.parent.mkdir(parents=True, exist_ok=True)
    try:
        with args.synthetic_preflight_output.open("x", encoding="utf-8", newline="\n") as handle:
            json.dump(receipt, handle, indent=2, sort_keys=True)
            handle.write("\n")
    except FileExistsError as exc:
        raise ModelForwardScoringError(f"refusing to overwrite existing receipt: {args.synthetic_preflight_output}") from exc
    print(json.dumps({"status": receipt["status"], "output": os.fspath(args.synthetic_preflight_output)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ModelForwardScoringError as exc:
        print(f"MODEL_FORWARD_SCORING=FAIL: {exc}", file=sys.stderr)
        raise SystemExit(2)
