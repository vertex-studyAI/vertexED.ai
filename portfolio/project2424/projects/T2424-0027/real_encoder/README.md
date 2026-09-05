# T2424-0027 Real-Encoder Transfer Gate

Status: **v2 FROZEN / IMPLEMENTED / EXECUTION ACTIVE**

This directory contains the versioned real-encoder successor to the deterministic synthetic T2424-0027 diagnostic. It does not modify the frozen synthetic experiment or its retained result.

## Protocol lineage

- `v1` was frozen before outcome access with 20 examples per locale-intent cell per split.
- GitHub Actions run `33258014658` passed manifest validation and all preregistration-lock tests, then failed during dataset feasibility because MASSIVE `en-US/audio_volume_other` contains only 18 train examples at the pinned revision.
- The v1 failure occurred before the sentence-transformer was loaded, before embeddings were generated, and before any probe/mechanism metric existed.
- v1 is retained in `manifest_v1_failed_feasibility.json`; the exact boundary is documented in `FEASIBILITY_FAILURE_20260829.md`.
- Active `v2` changes only the infeasible sampling cardinality from 20 to 15 examples per locale-intent cell per split. Dataset/model revisions, locales, split roles, seeds, probes, controls, metrics, thresholds, falsifiers, and no-tuning rules remain unchanged.

## Scientific question

Does language-centroid removal suppress locale information in a fixed real multilingual encoder while preserving intent information, and is that effect more specific than generic centering or random-subspace controls?

The supported scope is a frozen-encoder representation diagnostic. It is not a test of linguistic relativity, human cognition, translation quality, or a fine-tuned multilingual model.

## Frozen identities

- Active protocol: `T2424-0027-REAL-ENCODER-GATE-v2`
- Dataset: `AmazonScience/massive` at `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`
- Dataset release: MASSIVE 1.1
- Locales: `en-US`, `es-ES`, `fr-FR`
- Split roles: train = fit, test = evaluation
- Sampling: 15 deterministic examples per locale-intent cell per split
- Encoder: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` at `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`
- Encoder fine-tuning: forbidden
- Seeds: `2401 2402 2403 2404 2405`
- Primary probe: fit-split nearest-centroid Euclidean classifier

`manifest.json` is the authoritative active preregistration. `validate_manifest.py` deliberately fails if scientifically material frozen fields drift.

## Validate the preregistration

```bash
cd portfolio/project2424/projects/T2424-0027/real_encoder
python validate_manifest.py
python -m pytest -q test_manifest.py
```

## Execute into a fresh artifact directory

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

The gate passes only if all aggregate requirements in `manifest.json` hold, including at least 4/5 seed passes, mean raw language accuracy at least 0.75, mean parent-effect retention at least 70%, mean intent drop at most 2 percentage points, and mean specificity margin at least 0.15 over the strongest generic control.

The manifest also records stronger falsifiers. In particular, if the effect retains less than 30% of the synthetic magnitude, damages intent by more than 5 percentage points, or a generic control matches/beats language centering, the real-encoder mechanism story should be demoted rather than retuned.

## Current execution rule

A successful workflow run is not automatically a positive scientific result. The retained `summary.json` and `verdict.json` determine whether the fixed gate passed or failed. A negative result is terminal evidence for this protocol and must not trigger threshold movement, encoder swapping, control deletion, or post-hoc hyperparameter search under the same protocol ID.
