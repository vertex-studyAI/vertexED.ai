from __future__ import annotations

import argparse
import json
from pathlib import Path

EXPECTED_SEEDS = [1, 2, 3, 4, 5]
SOURCE_NAME = "arc-protocol-v3-full-controls-validation.json"
VARIANTS = ("full", "no_planner", "no_target")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Normalize the retained LAM-JEPA v3 controls artifact for independent QA."
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    source_path = args.artifact_dir / SOURCE_NAME
    require(source_path.is_file(), f"missing immutable source payload: {SOURCE_NAME}")
    source = json.loads(source_path.read_text(encoding="utf-8"))
    require(isinstance(source, dict), "source payload must be an object")

    protocol = source.get("protocol")
    variants = source.get("variants")
    negative = source.get("negative_control")
    require(isinstance(protocol, dict), "protocol block missing")
    require(isinstance(variants, dict), "variants block missing")
    require(isinstance(negative, dict), "negative_control block missing")

    per_variant: dict[str, list[dict]] = {}
    for name in VARIANTS:
        block = variants.get(name)
        require(isinstance(block, dict), f"variant {name} missing")
        records = block.get("records")
        require(
            isinstance(records, list) and len(records) == len(EXPECTED_SEEDS),
            f"variant {name}: expected five seed records",
        )
        require(all(isinstance(record, dict) for record in records), f"variant {name}: invalid record")
        require([record.get("seed") for record in records] == EXPECTED_SEEDS, f"variant {name}: seed order mismatch")
        per_variant[name] = records

    negative_records = negative.get("records")
    require(
        isinstance(negative_records, list) and len(negative_records) == len(EXPECTED_SEEDS),
        "negative_control: expected five seed records",
    )
    require(all(isinstance(record, dict) for record in negative_records), "negative_control: invalid record")
    require([record.get("seed") for record in negative_records] == EXPECTED_SEEDS, "negative_control: seed order mismatch")

    records = []
    for index, seed in enumerate(EXPECTED_SEEDS):
        records.append(
            {
                "seed": seed,
                "full": per_variant["full"][index],
                "no_planner": per_variant["no_planner"][index],
                "no_target": per_variant["no_target"][index],
                "negative_control": negative_records[index],
            }
        )

    normalized = {
        "normalization": {
            "source": SOURCE_NAME,
            "operation": "structural regrouping only; raw seed records and prediction rows are unchanged",
        },
        "protocol": protocol,
        "records": records,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(normalized, indent=2) + "\n", encoding="utf-8")
    print(f"normalized {len(records)} seed records from {SOURCE_NAME}")


if __name__ == "__main__":
    main()
