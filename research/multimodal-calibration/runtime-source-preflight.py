from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import platform
import sys
from pathlib import Path
from typing import Any

MODEL_ID = "Qwen/Qwen2.5-VL-3B-Instruct"
MODEL_REVISION = "243fd99abe513d2a02a98274ea34c07e8f961b0f"
EXPECTED_MODEL_TYPE = "qwen2_5_vl"
EXPECTED_ARCHITECTURE = "Qwen2_5_VLForConditionalGeneration"
LABELS = ("A", "B", "C", "D")
SOURCE_FILES = ("config.json", "preprocessor_config.json", "tokenizer_config.json", "tokenizer.json")
SCHEMA_VERSION = "multimodal-calibration.runtime-source-preflight.v1"


class PreflightError(RuntimeError):
    pass


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_json(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(payload)


def _require_int_list(values: Any, field: str) -> list[int]:
    if not isinstance(values, list) or not values:
        raise PreflightError(f"{field} must be a non-empty list")
    if not all(isinstance(value, int) and value >= 0 for value in values):
        raise PreflightError(f"{field} must contain non-negative integer token ids")
    return values


def _require_offsets(values: Any, token_count: int) -> list[tuple[int, int]]:
    if not isinstance(values, list) or len(values) != token_count:
        raise PreflightError("offset_mapping must align one-to-one with input_ids")
    normalized: list[tuple[int, int]] = []
    for index, value in enumerate(values):
        if not isinstance(value, (list, tuple)) or len(value) != 2:
            raise PreflightError(f"offset_mapping[{index}] must be a [start, end] pair")
        start, end = value
        if not isinstance(start, int) or not isinstance(end, int) or start < 0 or end < start:
            raise PreflightError(f"offset_mapping[{index}] is invalid")
        normalized.append((start, end))
    return normalized


def analyze_tokenization_boundary(
    *,
    prompt: str,
    continuation: str,
    input_ids: list[int],
    offset_mapping: list[tuple[int, int]],
) -> dict[str, Any]:
    if not prompt or not continuation:
        raise PreflightError("prompt and continuation must be non-empty")
    ids = _require_int_list(input_ids, "input_ids")
    offsets = _require_offsets(offset_mapping, len(ids))
    full_text = prompt + continuation
    boundary = len(prompt)

    scored_start_index: int | None = None
    for index, (start, end) in enumerate(offsets):
        if end > boundary:
            scored_start_index = index
            break
    if scored_start_index is None:
        raise PreflightError("tokenization produced no token covering the continuation")

    start, end = offsets[scored_start_index]
    if start > boundary:
        raise PreflightError("tokenization skipped characters at the prompt/continuation boundary")
    if start < boundary and full_text[start:boundary].strip():
        raise PreflightError("a scored token straddles non-whitespace prompt content")
    if end <= boundary:
        raise PreflightError("first scored token does not include continuation content")

    for index, (token_start, token_end) in enumerate(offsets[:scored_start_index]):
        if token_end > boundary:
            raise PreflightError(f"context token {index} leaks into continuation characters")
        if token_start > token_end:
            raise PreflightError(f"context token {index} has invalid offsets")

    scored_offsets = offsets[scored_start_index:]
    if not scored_offsets or scored_offsets[-1][1] != len(full_text):
        raise PreflightError("scored token span does not cover the complete continuation suffix")

    context_ids = ids[:scored_start_index]
    continuation_ids = ids[scored_start_index:]
    if not continuation_ids:
        raise PreflightError("continuation must map to at least one scored token")

    scored_character_start = scored_offsets[0][0]
    scored_text = full_text[scored_character_start:]
    if not scored_text.endswith(continuation):
        raise PreflightError("scored token suffix does not end in the requested continuation")
    prefix_whitespace = full_text[scored_character_start:boundary]
    if prefix_whitespace.strip():
        raise PreflightError("only whitespace may be absorbed into the scored continuation token span")

    return {
        "continuation": continuation,
        "full_text_sha256": sha256_bytes(full_text.encode("utf-8")),
        "context_token_ids_sha256": sha256_json(context_ids),
        "continuation_token_ids_sha256": sha256_json(continuation_ids),
        "context_token_count": len(context_ids),
        "continuation_token_count": len(continuation_ids),
        "boundary_character_index": boundary,
        "scored_character_start": scored_character_start,
        "absorbed_prompt_whitespace_characters": boundary - scored_character_start,
        "token_boundary_policy": "score_full_suffix_from_first_token_touching_continuation_allowing_only_prompt_whitespace_absorption",
    }


def validate_label_analyses(analyses: list[dict[str, Any]]) -> None:
    if len(analyses) != len(LABELS):
        raise PreflightError(f"expected exactly {len(LABELS)} label analyses")
    if [item.get("continuation") for item in analyses] != list(LABELS):
        raise PreflightError("label analyses must remain in canonical A-D order")

    context_hashes = {item.get("context_token_ids_sha256") for item in analyses}
    context_counts = {item.get("context_token_count") for item in analyses}
    scored_starts = {item.get("scored_character_start") for item in analyses}
    absorbed_whitespace = {item.get("absorbed_prompt_whitespace_characters") for item in analyses}
    if len(context_hashes) != 1 or None in context_hashes:
        raise PreflightError("all answer labels must share an identical tokenizer context prefix")
    if len(context_counts) != 1:
        raise PreflightError("all answer labels must share the same context token count")
    if len(scored_starts) != 1:
        raise PreflightError("all answer labels must start scoring at the same character boundary")
    if len(absorbed_whitespace) != 1:
        raise PreflightError("all answer labels must absorb the same prompt-side whitespace")


def _package_version(name: str) -> str:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError as exc:
        raise PreflightError(f"required package {name} is not installed") from exc


def run_live_preflight(prompt: str) -> dict[str, Any]:
    if not prompt.endswith("Answer: "):
        raise PreflightError("synthetic preflight prompt must preserve the frozen 'Answer: ' terminal boundary")

    try:
        from huggingface_hub import hf_hub_download
        from transformers import AutoConfig, AutoTokenizer
    except ImportError as exc:
        raise PreflightError("transformers and huggingface_hub are required for live preflight") from exc

    config = AutoConfig.from_pretrained(MODEL_ID, revision=MODEL_REVISION, trust_remote_code=False)
    if getattr(config, "model_type", None) != EXPECTED_MODEL_TYPE:
        raise PreflightError(
            f"model_type drift: expected {EXPECTED_MODEL_TYPE}, got {getattr(config, 'model_type', None)!r}"
        )
    architectures = list(getattr(config, "architectures", None) or [])
    if EXPECTED_ARCHITECTURE not in architectures:
        raise PreflightError(
            f"architecture drift: expected {EXPECTED_ARCHITECTURE} in {architectures!r}"
        )

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        revision=MODEL_REVISION,
        use_fast=True,
        trust_remote_code=False,
    )
    if not getattr(tokenizer, "is_fast", False):
        raise PreflightError("exact offset mapping requires a fast tokenizer")

    source_receipts: dict[str, dict[str, Any]] = {}
    for filename in SOURCE_FILES:
        resolved = Path(
            hf_hub_download(
                repo_id=MODEL_ID,
                filename=filename,
                revision=MODEL_REVISION,
                repo_type="model",
            )
        )
        payload = resolved.read_bytes()
        source_receipts[filename] = {
            "sha256": sha256_bytes(payload),
            "bytes": len(payload),
        }

    analyses: list[dict[str, Any]] = []
    for label in LABELS:
        full_text = prompt + label
        encoded = tokenizer(
            full_text,
            add_special_tokens=False,
            return_offsets_mapping=True,
        )
        analysis = analyze_tokenization_boundary(
            prompt=prompt,
            continuation=label,
            input_ids=list(encoded["input_ids"]),
            offset_mapping=[tuple(pair) for pair in encoded["offset_mapping"]],
        )
        analyses.append(analysis)
    validate_label_analyses(analyses)

    return {
        "schema_version": SCHEMA_VERSION,
        "status": "PROCESSOR_TOKENIZER_SOURCE_PREFLIGHT_PASS_MODEL_FORWARD_NOT_VALIDATED",
        "model": {
            "id": MODEL_ID,
            "revision": MODEL_REVISION,
            "model_type": EXPECTED_MODEL_TYPE,
            "architecture": EXPECTED_ARCHITECTURE,
        },
        "source_files": source_receipts,
        "runtime": {
            "python": platform.python_version(),
            "implementation": platform.python_implementation(),
            "platform": platform.platform(),
            "transformers": _package_version("transformers"),
            "tokenizers": _package_version("tokenizers"),
            "huggingface_hub": _package_version("huggingface-hub"),
        },
        "synthetic_prompt": {
            "sha256": sha256_bytes(prompt.encode("utf-8")),
            "characters": len(prompt),
            "evaluation_record": False,
        },
        "option_label_tokenization": analyses,
        "evaluation_data_accessed": False,
        "model_weights_downloaded_by_preflight": False,
        "model_forward_executed": False,
        "option_scorer_validated_against_model": False,
        "execution_authorized": False,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Pre-outcome source/tokenizer preflight for the frozen multimodal calibration model identity."
    )
    parser.add_argument("--prompt-file", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    prompt = args.prompt_file.read_text(encoding="utf-8")
    receipt = run_live_preflight(prompt)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    try:
        with args.output.open("x", encoding="utf-8", newline="\n") as handle:
            json.dump(receipt, handle, indent=2, sort_keys=True)
            handle.write("\n")
    except FileExistsError as exc:
        raise PreflightError(f"refusing to overwrite existing receipt: {args.output}") from exc
    print(json.dumps({"status": receipt["status"], "output": os.fspath(args.output)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PreflightError as exc:
        print(f"RUNTIME_SOURCE_PREFLIGHT=FAIL: {exc}", file=sys.stderr)
        raise SystemExit(2)
