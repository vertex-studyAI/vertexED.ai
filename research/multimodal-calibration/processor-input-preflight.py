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
LABELS = ("A", "B", "C", "D")
SCHEMA_VERSION = "multimodal-calibration.processor-input-preflight.v1"
IMAGE_SIZE = (32, 32)
IMAGE_RGB = (127, 127, 127)


class ProcessorInputPreflightError(RuntimeError):
    pass


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_json(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(payload)


def _package_version(name: str) -> str:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError as exc:
        raise ProcessorInputPreflightError(f"required package {name} is not installed") from exc


def normalize_token_ids(value: Any, field: str) -> list[int]:
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list) and len(value) == 1 and isinstance(value[0], list):
        value = value[0]
    if not isinstance(value, list) or not value:
        raise ProcessorInputPreflightError(f"{field} must be a non-empty token-id sequence")
    if not all(isinstance(item, int) and item >= 0 for item in value):
        raise ProcessorInputPreflightError(f"{field} must contain non-negative integer token ids")
    return value


def analyze_exact_prefix(*, prefix_ids: list[int], full_ids: list[int], continuation: str) -> dict[str, Any]:
    prefix = normalize_token_ids(prefix_ids, "prefix_ids")
    full = normalize_token_ids(full_ids, "full_ids")
    if not continuation:
        raise ProcessorInputPreflightError("continuation must be non-empty")
    if len(full) <= len(prefix):
        raise ProcessorInputPreflightError("full processor sequence must extend the prefix sequence")
    if full[: len(prefix)] != prefix:
        mismatch = next((index for index, pair in enumerate(zip(prefix, full)) if pair[0] != pair[1]), None)
        raise ProcessorInputPreflightError(
            f"processor sequence is not an exact prefix extension; first mismatch={mismatch}"
        )
    continuation_ids = full[len(prefix) :]
    if not continuation_ids:
        raise ProcessorInputPreflightError("continuation produced no scored token ids")
    return {
        "continuation": continuation,
        "context_token_count": len(prefix),
        "continuation_token_count": len(continuation_ids),
        "context_token_ids_sha256": sha256_json(prefix),
        "continuation_token_ids_sha256": sha256_json(continuation_ids),
        "full_token_ids_sha256": sha256_json(full),
        "token_boundary_policy": "exact_processor_prefix_then_score_entire_continuation_suffix",
    }


def validate_label_analyses(analyses: list[dict[str, Any]]) -> None:
    if len(analyses) != len(LABELS):
        raise ProcessorInputPreflightError(f"expected exactly {len(LABELS)} label analyses")
    if [row.get("continuation") for row in analyses] != list(LABELS):
        raise ProcessorInputPreflightError("label analyses must remain in canonical A-D order")
    prefix_hashes = {row.get("context_token_ids_sha256") for row in analyses}
    prefix_counts = {row.get("context_token_count") for row in analyses}
    pixel_hashes = {row.get("pixel_values_sha256") for row in analyses}
    grids = {json.dumps(row.get("image_grid_thw"), sort_keys=True) for row in analyses}
    if len(prefix_hashes) != 1 or None in prefix_hashes:
        raise ProcessorInputPreflightError("all labels must share the exact processor context token prefix")
    if len(prefix_counts) != 1:
        raise ProcessorInputPreflightError("all labels must share the exact processor context token count")
    if len(pixel_hashes) != 1 or None in pixel_hashes:
        raise ProcessorInputPreflightError("all labels must share identical processed image bytes")
    if len(grids) != 1 or "null" in grids:
        raise ProcessorInputPreflightError("all labels must share the exact non-null image grid")


def _array_receipt(value: Any, field: str) -> tuple[str, list[int]]:
    try:
        import numpy as np
    except ImportError as exc:
        raise ProcessorInputPreflightError("numpy is required for processor array receipts") from exc
    array = np.asarray(value)
    if array.size == 0:
        raise ProcessorInputPreflightError(f"{field} must be non-empty")
    if not np.isfinite(array).all():
        raise ProcessorInputPreflightError(f"{field} contains non-finite values")
    canonical = np.ascontiguousarray(array)
    return sha256_bytes(canonical.tobytes(order="C")), [int(size) for size in canonical.shape]


def _encode(processor: Any, *, rendered_text: str, image: Any) -> dict[str, Any]:
    encoded = processor(
        text=[rendered_text],
        images=[image],
        padding=False,
        return_tensors=None,
    )
    if "input_ids" not in encoded:
        raise ProcessorInputPreflightError("processor output is missing input_ids")
    if "pixel_values" not in encoded:
        raise ProcessorInputPreflightError("processor output is missing pixel_values")
    if "image_grid_thw" not in encoded:
        raise ProcessorInputPreflightError("processor output is missing image_grid_thw")
    ids = normalize_token_ids(encoded["input_ids"], "processor.input_ids")
    pixel_sha256, pixel_shape = _array_receipt(encoded["pixel_values"], "processor.pixel_values")
    grid = encoded["image_grid_thw"]
    if hasattr(grid, "tolist"):
        grid = grid.tolist()
    if not isinstance(grid, list) or not grid:
        raise ProcessorInputPreflightError("processor.image_grid_thw must be non-empty")
    return {
        "input_ids": ids,
        "pixel_values_sha256": pixel_sha256,
        "pixel_values_shape": pixel_shape,
        "image_grid_thw": grid,
    }


def run_live_preflight(prompt: str) -> dict[str, Any]:
    if not prompt.endswith("Answer: "):
        raise ProcessorInputPreflightError("synthetic prompt must preserve the frozen 'Answer: ' terminal boundary")
    try:
        from PIL import Image
        from transformers import AutoProcessor
    except ImportError as exc:
        raise ProcessorInputPreflightError("Pillow and transformers are required for live processor preflight") from exc

    processor = AutoProcessor.from_pretrained(
        MODEL_ID,
        revision=MODEL_REVISION,
        trust_remote_code=False,
        use_fast=False,
    )
    image_processor = getattr(processor, "image_processor", None)
    video_processor = getattr(processor, "video_processor", None)
    tokenizer = getattr(processor, "tokenizer", None)
    if image_processor is None:
        raise ProcessorInputPreflightError("processor is missing image_processor")
    if video_processor is None:
        raise ProcessorInputPreflightError("processor is missing video_processor")
    if tokenizer is None:
        raise ProcessorInputPreflightError("processor is missing tokenizer")

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image"},
                {"type": "text", "text": prompt},
            ],
        }
    ]
    rendered_prefix = processor.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    if not isinstance(rendered_prefix, str) or not rendered_prefix:
        raise ProcessorInputPreflightError("processor chat template produced an empty generation prefix")
    if prompt not in rendered_prefix:
        raise ProcessorInputPreflightError("processor chat template did not preserve the exact frozen prompt text")

    image = Image.new("RGB", IMAGE_SIZE, IMAGE_RGB)
    import io

    image_buffer = io.BytesIO()
    image.save(image_buffer, format="PNG", optimize=False)
    image_png = image_buffer.getvalue()

    prefix_encoded = _encode(processor, rendered_text=rendered_prefix, image=image)
    analyses: list[dict[str, Any]] = []
    decoded_labels: dict[str, str] = {}

    for label in LABELS:
        full_encoded = _encode(processor, rendered_text=rendered_prefix + label, image=image)
        analysis = analyze_exact_prefix(
            prefix_ids=prefix_encoded["input_ids"],
            full_ids=full_encoded["input_ids"],
            continuation=label,
        )
        continuation_ids = full_encoded["input_ids"][len(prefix_encoded["input_ids"]) :]
        decoded = tokenizer.decode(continuation_ids, skip_special_tokens=False)
        if decoded != label:
            raise ProcessorInputPreflightError(
                f"processor continuation decode drift for {label}: expected {label!r}, got {decoded!r}"
            )
        decoded_labels[label] = decoded
        analysis.update(
            {
                "pixel_values_sha256": full_encoded["pixel_values_sha256"],
                "pixel_values_shape": full_encoded["pixel_values_shape"],
                "image_grid_thw": full_encoded["image_grid_thw"],
            }
        )
        analyses.append(analysis)

    validate_label_analyses(analyses)
    if prefix_encoded["pixel_values_sha256"] != analyses[0]["pixel_values_sha256"]:
        raise ProcessorInputPreflightError("processed image bytes drift between prefix and continuation encodings")
    if prefix_encoded["image_grid_thw"] != analyses[0]["image_grid_thw"]:
        raise ProcessorInputPreflightError("image grid drifts between prefix and continuation encodings")

    return {
        "schema_version": SCHEMA_VERSION,
        "status": "PROCESSOR_INPUT_PREFLIGHT_PASS_MODEL_FORWARD_NOT_VALIDATED",
        "model": {"id": MODEL_ID, "revision": MODEL_REVISION},
        "runtime": {
            "python": platform.python_version(),
            "implementation": platform.python_implementation(),
            "platform": platform.platform(),
            "transformers": _package_version("transformers"),
            "tokenizers": _package_version("tokenizers"),
            "huggingface_hub": _package_version("huggingface-hub"),
            "pillow": _package_version("Pillow"),
            "numpy": _package_version("numpy"),
            "torch": _package_version("torch"),
            "torchvision": _package_version("torchvision"),
        },
        "processor": {
            "class": processor.__class__.__name__,
            "image_processor_class": image_processor.__class__.__name__,
            "video_processor_class": video_processor.__class__.__name__,
            "tokenizer_class": tokenizer.__class__.__name__,
            "image_processor_use_fast": False,
        },
        "synthetic_fixture": {
            "prompt_sha256": sha256_bytes(prompt.encode("utf-8")),
            "rendered_generation_prefix_sha256": sha256_bytes(rendered_prefix.encode("utf-8")),
            "image_png_sha256": sha256_bytes(image_png),
            "image_size": list(IMAGE_SIZE),
            "image_rgb": list(IMAGE_RGB),
            "evaluation_record": False,
        },
        "processor_prefix": {
            "input_ids_sha256": sha256_json(prefix_encoded["input_ids"]),
            "input_token_count": len(prefix_encoded["input_ids"]),
            "pixel_values_sha256": prefix_encoded["pixel_values_sha256"],
            "pixel_values_shape": prefix_encoded["pixel_values_shape"],
            "image_grid_thw": prefix_encoded["image_grid_thw"],
        },
        "option_label_processor_sequences": analyses,
        "decoded_labels": decoded_labels,
        "evaluation_data_accessed": False,
        "model_weights_downloaded_by_preflight": False,
        "model_forward_executed": False,
        "option_scorer_validated_against_model": False,
        "execution_authorized": False,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Pre-outcome processor/chat-template/image-input preflight for the frozen Qwen runtime."
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
        raise ProcessorInputPreflightError(f"refusing to overwrite existing receipt: {args.output}") from exc
    print(json.dumps({"status": receipt["status"], "output": os.fspath(args.output)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ProcessorInputPreflightError as exc:
        print(f"PROCESSOR_INPUT_PREFLIGHT=FAIL: {exc}", file=sys.stderr)
        raise SystemExit(2)
