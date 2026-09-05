from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict

from datasets import load_dataset


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def label_name(feature: Any, value: Any) -> str:
    names = getattr(feature, "names", None)
    if names is not None and isinstance(value, int):
        return str(names[value])
    return str(value)


def main() -> None:
    parser = argparse.ArgumentParser(description="Outcome-free feasibility census for frozen T2424-0027 dataset cells.")
    parser.add_argument("--manifest", default=str(Path(__file__).with_name("manifest.json")))
    parser.add_argument("--out", default="feasibility_artifacts")
    args = parser.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    dataset = manifest["dataset"]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=False)

    split_names = [dataset["splits"]["fit"], dataset["splits"]["evaluation"]]
    records: Dict[str, Any] = {
        "protocol_parent": manifest["protocol_id"],
        "purpose": "Outcome-free dataset feasibility census before any successor encoder execution.",
        "encoder_instantiated": False,
        "model_outcomes_accessed": False,
        "dataset_repo": dataset["repo"],
        "dataset_revision": dataset["revision"],
        "dataset_version": dataset["dataset_version"],
        "locales": dataset["locales"],
        "splits": split_names,
        "counts": {},
        "fingerprints": {},
    }

    common_cells = None
    all_counts = []
    for locale in dataset["locales"]:
        ds = load_dataset(dataset["repo"], locale, revision=dataset["revision"], trust_remote_code=True)
        records["counts"][locale] = {}
        records["fingerprints"][locale] = {}
        locale_cells = None
        for split_name in split_names:
            split = ds[split_name]
            intent_feature = split.features["intent"]
            counts = Counter(label_name(intent_feature, row["intent"]) for row in split)
            records["counts"][locale][split_name] = dict(sorted(counts.items()))
            records["fingerprints"][locale][split_name] = {
                "rows": len(split),
                "fingerprint": getattr(split, "_fingerprint", None),
            }
            split_cells = set(counts)
            locale_cells = split_cells if locale_cells is None else locale_cells & split_cells
            all_counts.extend(counts.values())
        common_cells = locale_cells if common_cells is None else common_cells & locale_cells

    common_cells = sorted(common_cells or [])
    records["common_intents_present_in_every_locale_and_split"] = common_cells
    records["common_intent_count"] = len(common_cells)

    per_common_cell_minima = {}
    for intent in common_cells:
        values = []
        for locale in dataset["locales"]:
            for split_name in split_names:
                values.append(records["counts"][locale][split_name][intent])
        per_common_cell_minima[intent] = min(values)
    records["per_common_intent_minimum_cell_size"] = per_common_cell_minima
    records["global_minimum_over_common_cells"] = min(per_common_cell_minima.values()) if per_common_cell_minima else 0
    records["maximum_uniform_n_using_all_common_intents"] = records["global_minimum_over_common_cells"]

    # This script deliberately proposes no v3 sampling cardinality and authorizes no encoder run.
    records["successor_authorized"] = False
    records["next_gate"] = "Freeze a separate v3 manifest from this census before any encoder instantiation or model outcome access."
    write_json(out / "feasibility_census.json", records)


if __name__ == "__main__":
    main()
