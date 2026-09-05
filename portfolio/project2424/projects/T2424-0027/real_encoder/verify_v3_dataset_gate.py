from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

from datasets import load_dataset

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "manifest_v3_preregistered.json"
OUT = HERE / "v3_dataset_gate_evidence.json"


def stable_json_sha256(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("execution_authorized") is not False:
        raise RuntimeError("Dataset-only verification requires execution_authorized=false.")

    cfg = manifest["dataset"]
    locales = list(cfg["locales"])
    fit_split = cfg["splits"]["fit"]
    eval_split = cfg["splits"]["evaluation"]
    n = int(cfg["examples_per_locale_intent_per_split"])
    frozen = list(cfg["frozen_intents"])
    frozen_set = set(frozen)

    per_cell: dict[str, dict[str, int]] = {}
    fingerprints: dict[str, dict[str, str | None]] = {}
    intent_min: dict[str, int] = {}

    for locale in locales:
        ds = load_dataset(
            cfg["repo"],
            locale,
            revision=cfg["revision"],
            trust_remote_code=True,
        )
        fingerprints[locale] = {
            fit_split: getattr(ds[fit_split], "_fingerprint", None),
            eval_split: getattr(ds[eval_split], "_fingerprint", None),
        }
        for split_name in (fit_split, eval_split):
            split = ds[split_name]
            feature = split.features["intent"]
            names = getattr(feature, "names", None)
            counts: Counter[str] = Counter()
            for row in split:
                raw = row["intent"]
                intent = str(names[int(raw)]) if names is not None and isinstance(raw, int) else str(raw)
                counts[intent] += 1
            per_cell[f"{locale}:{split_name}"] = dict(sorted(counts.items()))
            for intent, count in counts.items():
                if intent not in intent_min:
                    intent_min[intent] = count
                else:
                    intent_min[intent] = min(intent_min[intent], count)

    # An intent is admissible only if it exists with >=n examples in every locale and both splits.
    admissible = sorted(
        intent
        for intent in intent_min
        if all(per_cell[f"{locale}:{split_name}"].get(intent, 0) >= n for locale in locales for split_name in (fit_split, eval_split))
    )

    if admissible != frozen:
        missing = sorted(frozen_set - set(admissible))
        unexpected = sorted(set(admissible) - frozen_set)
        raise RuntimeError(
            f"Frozen intent universe mismatch before encoder construction: missing={missing}, unexpected={unexpected}"
        )
    if len(admissible) != int(cfg["expected_intent_count"]):
        raise RuntimeError("Admissible intent count differs from preregistration.")

    minimum_frozen_cell = min(
        per_cell[f"{locale}:{split_name}"][intent]
        for locale in locales
        for split_name in (fit_split, eval_split)
        for intent in frozen
    )
    if minimum_frozen_cell < n:
        raise RuntimeError(f"Frozen cell minimum {minimum_frozen_cell} is below required n={n}.")

    evidence = {
        "protocol_id": manifest["protocol_id"],
        "dataset_repo": cfg["repo"],
        "dataset_revision": cfg["revision"],
        "locales": locales,
        "splits": [fit_split, eval_split],
        "required_per_cell": n,
        "admissible_intent_count": len(admissible),
        "admissible_intents": admissible,
        "minimum_frozen_cell_count": minimum_frozen_cell,
        "dataset_fingerprints": fingerprints,
        "cell_counts_sha256": stable_json_sha256(per_cell),
        "execution_authorized": False,
        "encoder_instantiated": False,
        "model_outcomes_accessed": False,
        "verdict": "PASS_DATASET_ONLY_V3_FEASIBILITY_GATE",
    }
    OUT.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
