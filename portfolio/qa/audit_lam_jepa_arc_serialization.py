from __future__ import annotations

import argparse
import hashlib
import json
import statistics
from collections import Counter
from pathlib import Path

import torch

from lam_jepa.benchmarking.arc_challenge import ARCExample, encode_example, load_arc_split
from lam_jepa.benchmarking.arc_protocol import select_protocol_eligible_examples
from lam_jepa.data import text_to_tokens

TARGET_COMMIT = "3636acb91b80f905cb86f04bed691f51316758e4"
MAX_LEN = 96
VOCAB_SIZE = 256


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def serialize(example: ARCExample) -> str:
    return "Question: " + example.question + "\nChoices:\n" + "\n".join(
        f"{index}: {choice}" for index, choice in enumerate(example.choices)
    )


def audit_row(example: ARCExample) -> dict[str, object]:
    text = serialize(example)
    payload = text.encode("utf-8", errors="ignore")
    canonical = encode_example(example, vocab_size=VOCAB_SIZE, max_len=MAX_LEN)
    reconstructed = text_to_tokens(text, vocab_size=VOCAB_SIZE, max_len=MAX_LEN)
    require(torch.equal(canonical, reconstructed), f"{example.item_id}: serialization mismatch")

    choices_marker = b"\nChoices:\n"
    marker_start = payload.find(choices_marker)
    require(marker_start >= 0, f"{example.item_id}: choices marker missing")
    cursor = marker_start + len(choices_marker)
    choice_rows: list[dict[str, object]] = []
    for index, choice in enumerate(example.choices):
        prefix = f"{index}: ".encode("utf-8")
        prefix_start = payload.find(prefix, cursor)
        require(prefix_start >= 0, f"{example.item_id}: choice prefix {index} missing")
        text_start = prefix_start + len(prefix)
        text_bytes = choice.encode("utf-8", errors="ignore")
        text_end = text_start + len(text_bytes)
        choice_rows.append(
            {
                "index": index,
                "text_start": text_start,
                "text_end": text_end,
                "starts_before_cutoff": text_start < MAX_LEN,
                "fully_visible_before_cutoff": text_end <= MAX_LEN,
                "visible_text_bytes": max(0, min(text_end, MAX_LEN) - min(text_start, MAX_LEN)),
                "text_bytes": len(text_bytes),
            }
        )
        cursor = text_end

    correct = choice_rows[example.label]
    token_bytes = bytes(int(value) for value in canonical.tolist())
    return {
        "id": example.item_id,
        "label": example.label,
        "serialized_bytes": len(payload),
        "retained_bytes": min(len(payload), MAX_LEN),
        "retained_fraction": min(len(payload), MAX_LEN) / max(1, len(payload)),
        "question_bytes": len(example.question.encode("utf-8", errors="ignore")),
        "choices_marker_start": marker_start,
        "choices_marker_visible": marker_start < MAX_LEN,
        "any_choice_starts": any(row["starts_before_cutoff"] for row in choice_rows),
        "all_choice_starts": all(row["starts_before_cutoff"] for row in choice_rows),
        "all_choices_fully_visible": all(row["fully_visible_before_cutoff"] for row in choice_rows),
        "correct_choice_starts": bool(correct["starts_before_cutoff"]),
        "correct_choice_fully_visible": bool(correct["fully_visible_before_cutoff"]),
        "visible_choice_text_bytes": sum(int(row["visible_text_bytes"]) for row in choice_rows),
        "choice_text_bytes": sum(int(row["text_bytes"]) for row in choice_rows),
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
        "any_choice_starts",
        "all_choice_starts",
        "all_choices_fully_visible",
        "correct_choice_starts",
        "correct_choice_fully_visible",
    )
    fractions = {
        key: sum(bool(row[key]) for row in rows) / len(rows)
        for key in bool_keys
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
        "label_distribution": {str(k): v for k, v in sorted(Counter(example.label for example in partition.eligible).items())},
        "serialized_bytes": numeric([float(row["serialized_bytes"]) for row in rows]),
        "retained_fraction": numeric([float(row["retained_fraction"]) for row in rows]),
        "question_bytes": numeric([float(row["question_bytes"]) for row in rows]),
        "visible_choice_text_bytes": numeric([float(row["visible_choice_text_bytes"]) for row in rows]),
        "fractions": fractions,
        "no_choice_text_visible_count": sum(not bool(row["any_choice_starts"]) for row in rows),
        "correct_choice_never_starts_count": sum(not bool(row["correct_choice_starts"]) for row in rows),
        "all_choices_fully_visible_count": sum(bool(row["all_choices_fully_visible"]) for row in rows),
        "rows": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Independent audit of LAM-JEPA ARC 96-byte serialization.")
    parser.add_argument("--train", type=Path, required=True)
    parser.add_argument("--validation", type=Path, required=True)
    parser.add_argument("--target-commit-file", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    require(args.target_commit_file.read_text(encoding="utf-8").strip() == TARGET_COMMIT, "target commit mismatch")
    payload = {
        "verdict": "ARC_INPUT_SERIALIZATION_AUDIT",
        "target_commit": TARGET_COMMIT,
        "test_split_accessed": False,
        "max_len_bytes": MAX_LEN,
        "train": summarize("train", load_arc_split(args.train)),
        "validation": summarize("validation", load_arc_split(args.validation)),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "train": payload["train"]["fractions"],
        "validation": payload["validation"]["fractions"],
        "train_correct_choice_never_starts_count": payload["train"]["correct_choice_never_starts_count"],
        "validation_correct_choice_never_starts_count": payload["validation"]["correct_choice_never_starts_count"],
    }, indent=2))


if __name__ == "__main__":
    main()
