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

The official ESA-ADB repository provides raw ESA Mission 1 / Mission 2 data and preprocessing scripts for its TimeEval-based benchmark. Use that official preprocessing first. `space_jepa.data.load_csv()` is deliberately a small adapter for flat, preprocessed telemetry CSVs; it ignores nonnumeric timestamp/id columns and can discover common anomaly-label column names.

Before any retained experiment, wire the official ESA-ADB evaluation pipeline and preserve the benchmark split. The local metrics in this repo are diagnostics, not a replacement for ESA-ADB's operational metrics.

For a flat preprocessed telemetry CSV, the reproducible runner is:

```bash
python run_csv.py path/to/telemetry.csv --train-end <EXCLUSIVE_TRAIN_ROW> --seed 17 --out-dir artifacts/real_runs/seed-17
```

It records the dataset SHA-256, exact resolved model config, seed, train boundary, thresholds, raw score arrays, checkpoint, and local diagnostic metrics. The frozen first-pass settings live in `configs/esa_first_pass.json`; the seed set is fixed to 17, 29, 43, 71, and 101.

## Research integrity

- do not train the scaler on test data
- do not select thresholds from test labels
- do not report the synthetic smoke run as an ESA result
- do not cherry-pick seeds
- retain negative or null results
- record commit/config/dataset/seed/runtime for every promoted experiment

See `PROTOCOL.md` for the frozen first-pass evaluation.

## Next engineering slice

1. Add a converter for official ESA-ADB preprocessed Mission 1 and Mission 2 outputs.
2. Wire the official ESA-ADB metric/evaluation adapter around the reproducible runner.
3. Run official baselines first, then all five frozen Space-JEPA seeds.
4. Run only the declared ablations after the frozen first pass.
5. Promote a result only after official benchmark evaluation and provenance review.
