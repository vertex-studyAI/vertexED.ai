# Space-JEPA — ESA spacecraft telemetry baseline

Space-JEPA is a **pre-outcome** research implementation for self-supervised spacecraft telemetry anomaly detection. Its first falsifiable target is the ESA Anomaly Detection Benchmark (ESA-ADB), not CAD generation and not astronomical-image classification.

The core idea is straightforward: an online transformer encoder reads a context window; an EMA target encoder embeds a future telemetry window; a predictor tries to forecast those future latents. At inference time, unusually large future-latent prediction error is treated as an anomaly score.

## What is implemented

- multivariate telemetry windowing with explicit context/target separation
- robust train-only median/MAD normalization
- transformer context encoder
- frozen-gradient EMA target encoder
- JEPA-style future latent predictor
- cosine latent prediction objective plus a small variance anti-collapse term
- timestep-aligned anomaly scores from overlapping windows
- train-derived anomaly thresholds (no test-label tuning)
- memory-safe exact AUROC, average precision, point F1, and one-to-one event F1 diagnostics
- robust z-score and persistence baselines
- deterministic synthetic telemetry smoke fixture
- tests for leakage-sensitive preprocessing, alignment, EMA behavior, and model shapes
- a frozen pre-outcome protocol in `PROTOCOL.md`

## Status

**Implementation stage only. No retained ESA-ADB outcome exists in this repository yet.** Synthetic smoke output is explicitly marked `SYNTHETIC_SMOKE_ONLY_NOT_RESEARCH_EVIDENCE`.

## Quick smoke run

```bash
python -m pip install torch numpy pytest
python smoke.py --epochs 2
pytest -q
```

The smoke run writes `artifacts/smoke.json`. Its only purpose is to prove the code path executes; it is not evidence for the research claim.

## ESA-ADB integration path

The official ESA-ADB repository provides raw Mission 1 / Mission 2 data and preprocessing scripts for its modified TimeEval benchmark. `space_jepa.esa_adb` now reads the **official preprocessed multivariate format** without leaking `is_anomaly_*` annotation columns into model inputs. It includes the exact lightweight and target-channel presets declared by the upstream Mission 1 / Mission 2 experiment scripts.

`run_esa_adb.py` trains on official preprocessed train files, warm-starts test scoring from the training tail, freezes thresholds from training scores only, and exports timestamped binary predictions. `evaluate_esa_adb.py` can then be run inside the official ESA-ADB environment to invoke upstream `ESAScores` at beta 0.5 for both Anomaly-only and Anomaly+Rare-Event views. ChannelAwareFScore/ADTQC remain intentionally unclaimed until Space-JEPA has a meaningful per-channel score head. See `ESA_ADB_INTEGRATION.md` for the complete source/evaluation contract.

For a generic flat preprocessed telemetry CSV, the reproducible runner remains:

```bash
python run_csv.py path/to/telemetry.csv --train-end <EXCLUSIVE_TRAIN_ROW> --seed 17 --out-dir artifacts/real_runs/seed-17
```

It records the dataset SHA-256, exact resolved model config, seed, train boundary, thresholds, raw score arrays, checkpoint, and local diagnostic metrics. The frozen first-pass settings live in `configs/esa_first_pass.json`; the seed set is fixed to 17, 29, 43, 71, and 101.

## Astronomy collaboration track

The astronomy collaboration is kept as a **separate claim/evaluation track** rather than being silently mixed into ESA telemetry. `ASTRONOMY_TRACK.md` freezes a first question around irregular-time-aware future-latent prediction for public multi-epoch photometry. `space_jepa.astro` adds a train-fit light-curve featurizer that preserves observation time gaps, photometric uncertainty, and passband identity without interpolating to an artificial regular cadence. The same JEPA backbone can therefore support a capacity-matched time-aware vs time-agnostic ablation.

## Research integrity

- do not train the scaler on test data
- do not select thresholds from test labels
- do not report the synthetic smoke run as an ESA result
- do not cherry-pick seeds
- retain negative or null results
- record commit/config/dataset/seed/runtime for every promoted experiment

See `PROTOCOL.md` for the frozen first-pass evaluation.

## Next engineering slice

1. Execute `mission1-lite` and `mission2-lite` engineering pilots against official preprocessed files.
2. Run official ESAScores for baselines first, then all five frozen Space-JEPA seeds under `configs/esa_first_pass.json`.
3. Add a separately frozen per-channel score head before attempting ChannelAwareFScore or ADTQC.
4. Run only the declared ablations after the frozen first pass.
5. Promote a result only after official benchmark evaluation and provenance review.
