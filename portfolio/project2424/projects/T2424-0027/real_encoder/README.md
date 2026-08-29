# T2424-0027 Real-Encoder Transfer Gate

Status: **FROZEN / IMPLEMENTED / NOT YET EXECUTED**

This directory contains the versioned real-encoder successor to the deterministic synthetic T2424-0027 diagnostic. It does not modify the frozen synthetic experiment or its retained result.

## Scientific question

Does language-centroid removal suppress locale information in a fixed real multilingual encoder while preserving intent information, and is that effect more specific than generic centering or random-subspace controls?

The supported scope is a frozen-encoder representation diagnostic. It is not a test of linguistic relativity, human cognition, translation quality, or a fine-tuned multilingual model.

## Frozen identities

- Dataset: `AmazonScience/massive` at `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`
- Dataset release: MASSIVE 1.1
- Locales: `en-US`, `es-ES`, `fr-FR`
- Encoder: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` at `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`
- Encoder fine-tuning: forbidden
- Seeds: `2401 2402 2403 2404 2405`
- Primary probe: fit-split nearest-centroid Euclidean classifier

`manifest.json` is the authoritative preregistration. `validate_manifest.py` deliberately fails if scientifically material frozen fields drift.

## Validate the preregistration

```bash
cd portfolio/project2424/projects/T2424-0027/real_encoder
python validate_manifest.py
python -m pytest -q test_manifest.py
```

## Execute exactly once into a fresh artifact directory

```bash
cd portfolio/project2424/projects/T2424-0027/real_encoder
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python validate_manifest.py
python run.py --out artifacts
```

The runner refuses to overwrite an existing artifact directory. Preserve the full directory after execution.

Required outputs:

- `resolved_manifest.json`
- `environment.json`
- `dataset_fingerprint.json`
- `model_revision.json`
- `per_seed_metrics.jsonl`
- `summary.json`
- `verdict.json`

## Predeclared gate

The gate passes only if all aggregate requirements in `manifest.json` hold, including at least 4/5 seed passes, mean parent-effect retention at least 70%, mean intent drop at most 2 percentage points, and a positive specificity margin of at least 0.15 over the strongest generic control.

The manifest also records stronger falsifiers. In particular, if the effect retains less than 30% of the synthetic magnitude, damages intent by more than 5 percentage points, or a generic control matches/beats language centering, the real-encoder mechanism story should be demoted rather than retuned.

## Current execution state

No real-encoder result is checked in here yet. Presence of code, a manifest, or a green static test does not count as scientific completion. The next valid state transition requires an actual retained run under this exact frozen protocol, followed by independent verification of the artifacts.
