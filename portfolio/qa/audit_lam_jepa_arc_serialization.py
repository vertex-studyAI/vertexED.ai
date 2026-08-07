from __future__ import annotations

import argparse
import hashlib
import json
import statistics
from collections import Counter
from hashlib import blake2b
from pathlib import Path

import torch

from lam_jepa.benchmarking.arc_challenge import (
    ARCExample,
    batchify,
    format_prompt,
    load_arc_split,
)
from lam_jepa.benchmarking.arc_protocol import select_protocol_eligible_examples

TARGET_COMMIT = "3636acb91b80f905cb86f04bed691f51316758e4"
MAX_LEN = 96
VOCAB_SIZE = 256


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def serialize_independently(example: ARCExample) -> str:
    options = " ".join(
        f"[{index}] {choice}" for index, choice in enumerate(example.choices)
    )
    return f"Question: {example.question} Choices: {options}"


def independent_hash_token(text: str) -> int:
    digest = blake2b(text.encode("utf-8"), digest_size=8).hexdigest()
    return int(digest, 16) % VOCAB_SIZE


def tokenize_independently(text: str) -> torch.Tensor:
    words = text.lower().split()
    ids = [independent_hash_token(word) for word in words[:MAX_LEN]]
    if len(ids) < MAX_LEN:
        ids.extend([0] * (MAX_LEN - len(ids)))
    return torch.tensor(ids, dtype=torch.long)


def audit_row(example: ARCExample) -> dict[str, object]:
    independent_prompt = serialize_independently(example)
    target_prompt = format_prompt(example)
    require(
        target_prompt == independent_prompt,
        f"{example.item_id}: independent prompt does not match target format_prompt",
    )

    target_tokens, _, target_labels = batchify(
        [example], vocab_size=VOCAB_SIZE, max_len=MAX_LEN, device="cpu"
    )
    canonical = target_tokens[0].cpu()
    reconstructed = tokenize_independently(independent_prompt)
    require(
        torch.equal(canonical, reconstructed),
        f"{example.item_id}: independent tokenization does not match target batchify",
    )
    require(
        int(target_labels[0].item()) == example.label,
        f"{example.item_id}: target label mismatch",
    )

    question_tokens = example.question.split()
    choices_marker_index = 1 + len(question_tokens)
    cursor = choices_marker_index + 1
    choice_rows: list[dict[str, object]] = []
    for index, choice in enumerate(example.choices):
        marker_index = cursor
        text_start = marker_index + 1
        text_token_count = len(choice.split())
        text_end = text_start + text_token_count
        choice_rows.append(
            {
                "index": index,
                "marker_token_index": marker_index,
                "text_start_token": text_start,
                "text_end_token_exclusive": text_end,
                "marker_visible_before_cutoff": marker_index < MAX_LEN,
                "text_starts_before_cutoff": text_start < MAX_LEN,
                "fully_visible_before_cutoff": text_end <= MAX_LEN,
                "visible_text_tokens": max(
                    0, min(text_end, MAX_LEN) - min(text_start, MAX_LEN)
                ),
                "text_tokens": text_token_count,
            }
        )
        cursor = text_end

    prompt_tokens = independent_prompt.split()
    require(cursor == len(prompt_tokens), f"{example.item_id}: token accounting mismatch")
    correct = choice_rows[example.label]
    token_bytes = bytes(int(value) for value in canonical.tolist())
    return {
        "id": example.item_id,
        "label": example.label,
        "serialized_tokens": len(prompt_tokens),
        "retained_tokens": min(len(prompt_tokens), MAX_LEN),
        "retained_fraction": min(len(prompt_tokens), MAX_LEN)
        / max(1, len(prompt_tokens)),
        "question_tokens": len(question_tokens),
        "choices_marker_token_index": choices_marker_index,
        "choices_marker_visible": choices_marker_index < MAX_LEN,
        "any_choice_text_starts": any(
            bool(row["text_starts_before_cutoff"]) for row in choice_rows
        ),
        "all_choice_text_starts": all(
            bool(row["text_starts_before_cutoff"]) for row in choice_rows
        ),
        "all_choices_fully_visible": all(
            bool(row["fully_visible_before_cutoff"]) for row in choice_rows
        ),
        "correct_choice_text_starts": bool(correct["text_starts_before_cutoff"]),
        "correct_choice_fully_visible": bool(correct["fully_visible_before_cutoff"]),
        "visible_choice_text_tokens": sum(
            int(row["visible_text_tokens"]) for row in choice_rows
        ),
        "choice_text_tokens": sum(int(row["text_tokens"]) for row in choice_rows),
        "choice_visibility": choice_rows,
        "token_digest": hashlib.sha256(token_bytes).hexdigest(),
    }


def numeric(values: list[float]) -> dict[str, float]:
    ordered = sorted(values)
    require(bool(ordered), "cannot summarize empty values")

    def q(frac: float) -> float:
        if len(ordered) == 1:
            return float(ordered[0])
        position = frac * (len(ordered) - 1)
        lo = int(position)
        hi = min(len(ordered) - 1, lo + 1)
        weight = position - lo
        return float(ordered[lo] * (1.0 - weight) + ordered[hi] * weight)

    return {
        "min": float(ordered[0]),
        "p25": q(0.25),
        "median": q(0.5),
        "p75": q(0.75),
        "max": float(ordered[-1]),
        "mean": float(statistics.fmean(ordered)),
    }


def summarize(name: str, source: list[ARCExample]) -> dict[str, object]:
    partition = select_protocol_eligible_examples(source)
    rows = [audit_row(example) for example in partition.eligible]
    token_digests = [str(row["token_digest"]) for row in rows]
    bool_keys = (
        "choices_marker_visible",
        "any_choice_text_starts",
        "all_choice_text_starts",
        "all_choices_fully_visible",
        "correct_choice_text_starts",
        "correct_choice_fully_visible",
    )
    fractions = {
        key: sum(bool(row[key]) for row in rows) / len(rows) for key in bool_keys
    }
    return {
        "split": name,
        "source_rows": partition.original_count,
        "eligible_rows": partition.eligible_count,
        "excluded_rows": partition.excluded_count,
        "eligible_id_digest": partition.eligible_id_digest,
        "excluded_id_digest": partition.excluded_id_digest,
        "unique_token_sequences": len(set(token_digests)),
        "duplicate_token_sequence_count": len(rows) - len(set(token_digests)),
        "label_distribution": {
            str(key): value
            for key, value in sorted(
                Counter(example.label for example in partition.eligible).items()
            )
        },
        "serialized_tokens": numeric(
            [float(row["serialized_tokens"]) for row in rows]
        ),
        "retained_fraction": numeric(
            [float(row["retained_fraction"]) for row in rows]
        ),
        "question_tokens": numeric([float(row["question_tokens"]) for row in rows]),
        "visible_choice_text_tokens": numeric(
            [float(row["visible_choice_text_tokens"]) for row in rows]
        ),
        "fractions": fractions,
        "no_choice_text_visible_count": sum(
            not bool(row["any_choice_text_starts"]) for row in rows
        ),
        "correct_choice_never_starts_count": sum(
            not bool(row["correct_choice_text_starts"]) for row in rows
        ),
        "all_choices_fully_visible_count": sum(
            bool(row["all_choices_fully_visible"]) for row in rows
        ),
        "rows": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Independent audit of LAM-JEPA ARC 96-token serialization."
    )
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--validation", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    require(
        args.target_commit_file.read_text(encoding="utf-8").strip() == TARGET_COMMIT,
        "target commit mismatch",
    )
    require(
        not args.train.name.endswith("test.parquet")
        and not args.validation.name.endswith("test.parquet"),
        "confirmatory test input is forbidden",
    )
    payload = {
        "verdict": "ARC_INPUT_SERIALIZATION_AUDIT",
        "target_commit": TARGET_COMMIT,
        "test_split_accessed": False,
        "max_len_tokens": MAX_LEN,
        "tokenization_contract": (
            "lowercase whitespace split; first 96 tokens; blake2b(digest_size=8) "
            "mod 256; zero padded"
        ),
        "prompt_contract": "Question: <question> Choices: [0] <choice0> [1] <choice1> ...",
        "train": summarize("train", load_arc_split(args.train)),
        "validation": summarize("validation", load_arc_split(args.validation)),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "train": payload["train"]["fractions"],
                "validation": payload["validation"]["fractions"],
                "train_correct_choice_never_starts_count": payload["train"][
                    "correct_choice_never_starts_count"
                ],
                "validation_correct_choice_never_starts_count": payload["validation"][
                    "correct_choice_never_starts_count"
                ],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
