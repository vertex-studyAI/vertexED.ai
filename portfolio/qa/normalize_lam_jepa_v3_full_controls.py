from __future__ import annotations

import argparse
import json
from pathlib import Path


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Normalize the retained LAM-JEPA protocol-v3 controls artifact into per-seed records for independent QA."
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    source = args.artifact_dir / "arc-protocol-v3-full-controls-validation.json"
    require(source.is_file(), f"missing retained controls payload: {source}")
    payload = json.loads(source.read_text(encoding="utf-8"))
    require(isinstance(payload, dict), "retained controls payload must be an object")

    protocol = payload.get("protocol")
    variants = payload.get("variants")
    negative = payload.get("negative_control")
    require(isinstance(protocol, dict), "protocol block missing")
    require(isinstance(variants, dict), "variants block missing")
    require(isinstance(negative, dict), "negative-control block missing")

    expected_seeds = [1, 2, 3, 4, 5]
    normalized_by_variant: dict[str, list[dict]] = {}
    for variant in ("full", "no_planner", "no_target"):
        block = variants.get(variant)
        require(isinstance(block, dict), f"{variant}: variant block missing")
        records = block.get("records")
        require(isinstance(records, list) and len(records) == 5, f"{variant}: expected five seed records")
        require(all(isinstance(record, dict) for record in records), f"{variant}: invalid seed record")
        require([record.get("seed") for record in records] == expected_seeds, f"{variant}: seed order mismatch")
        normalized_by_variant[variant] = records

    negative_records = negative.get("records")
    require(isinstance(negative_records, list) and len(negative_records) == 5, "negative_control: expected five seed records")
    require(all(isinstance(record, dict) for record in negative_records), "negative_control: invalid seed record")
    require([record.get("seed") for record in negative_records] == expected_seeds, "negative_control: seed order mismatch")

    records = []
    for index, seed in enumerate(expected_seeds):
        records.append(
            {
                "seed": seed,
                "full": normalized_by_variant["full"][index],
                "no_planner": normalized_by_variant["no_planner"][index],
                "no_target": normalized_by_variant["no_target"][index],
                "negative_control": negative_records[index],
            }
        )

    normalized = {
        "source_file": source.name,
        "normalization": "layout-only; no metrics or predictions modified",
        "protocol": protocol,
        "records": records,
        "source_aggregates": {
            "variants": {
                key: {"accuracy": variants[key].get("accuracy")}
                for key in ("full", "no_planner", "no_target")
            },
            "negative_control": {
                "accuracy": negative.get("accuracy"),
                "pass": negative.get("pass"),
            },
            "paired_effects": payload.get("paired_effects"),
        },
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(normalized, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"status": "normalized", "source": str(source), "out": str(args.out), "seeds": expected_seeds}))


if __name__ == "__main__":
    main()
