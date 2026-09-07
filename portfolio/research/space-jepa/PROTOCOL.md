# Space-JEPA frozen pre-outcome protocol — 2026-09-03

## Claim boundary

This repository contains an implementation and a synthetic engineering smoke test. It does **not** contain a retained ESA-ADB result, and it makes no performance claim against ESA-ADB baselines.

## Research question

Does JEPA-style future latent prediction improve spacecraft telemetry anomaly detection under a leakage-controlled evaluation, relative to simple and established baselines, without requiring anomaly labels during representation training or threshold fitting?

## Primary dataset

Use the official ESA Anomaly Detection Benchmark (ESA-ADB), retaining its mission splits, labels, anomaly types, and benchmark evaluation pipeline where compatible. The official project describes telemetry from three ESA missions, with two used for benchmarking. Do not mix test telemetry into scaler fitting, representation training, threshold fitting, hyperparameter selection, or early stopping.

The first-pass paper claim is prospectively restricted to the two already-declared lightweight surfaces, `mission1-lite` and `mission2-lite`. Neither may be dropped after outcome access. Target-channel surfaces may be reported only as separately identified secondary/generalization analyses unless a new pre-outcome amendment promotes them before any relevant outcome is opened.

## Fixed first-pass experiment

1. **Input:** multivariate telemetry after the official ESA-ADB preprocessing path or an explicitly documented equivalent conversion.
2. **Normalization:** fit robust median/MAD statistics on the training partition only.
3. **Representation training:** train Space-JEPA only on the allowed training data. The online encoder receives context windows; the EMA target encoder receives future target windows; the predictor minimizes latent cosine error plus a small anti-collapse variance regularizer.
4. **Anomaly score:** future-target latent prediction error aligned back to telemetry timesteps by averaging overlapping windows.
5. **Threshold:** fit from valid training-prefix scores only, without consulting anomaly labels. Default frozen rule: 99.5th percentile of all valid training-prefix scores. If the official benchmark later requires labeled validation thresholding, that must be frozen as a separate protocol amendment before any test-outcome access.
6. **Primary matched baselines:** robust z-score and one-step persistence error, evaluated from the same frozen train/test surface and the same label-blind 0.995 training-score threshold policy. Other official ESA-ADB algorithms are contextual/secondary unless separately executed under a pre-outcome matched protocol; this first-pass claim does not say they were beaten.
7. **Primary endpoint:** official ESA-ADB `ESAScores`, `Category = Anomaly` only, beta `0.5`, exact output key `EW_F_0.50` (corrected event-wise F0.5; higher is better), under upstream commit `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33` and the frozen source identity recorded in `ESA_PRIMARY_ENDPOINT_V0.json`. `Anomaly + Rare Event`, affiliation scores, channel-aware scores, repository-native AUROC/AP/F1 diagnostics, and ablations are secondary and cannot rescue primary failure.
8. **Seeds:** 17, 29, 43, 71, 101. Report every seed, including failed or adverse runs. A failed seed cannot be silently dropped, substituted, or selectively rerun.
9. **Primary comparison and aggregation:** for each mission surface and seed, compare Space-JEPA `EW_F_0.50` with the stronger of robust z-score and persistence on that same surface/seed. Define paired delta = `Space-JEPA - strongest baseline`. A surface succeeds only if the arithmetic mean of all five paired deltas is strictly positive **and** at least 4/5 paired deltas are strictly positive; ties are not wins. The overall primary claim succeeds only if **both** `mission1-lite` and `mission2-lite` satisfy that rule. No post-outcome significance test or practical-effect threshold may be added to rescue or selectively upgrade the primary verdict.
10. **Ablations:** no EMA target encoder; no anti-collapse term; context lengths {32, 64, 128}; target lengths {8, 16, 32} if budget permits. Ablations are explanatory and never primary rescue paths.
11. **Failure rule:** if either frozen surface fails the primary rule, the primary superiority claim fails. Retain the negative/mixed result. Do not change the metric, category view, seed rule, mission set, comparator family, threshold policy, or claim after seeing held-out outcomes.

The machine-readable endpoint freeze and executable pure decision function live in `ESA_PRIMARY_ENDPOINT_V0.json` and `space_jepa/esa_primary.py`. They do not authorize outcome access or execute the benchmark.

## Leakage checks required before a retained run

- scaler parameters computed from training only
- anomaly labels are not used for scaler fitting, representation training, threshold fitting, hyperparameter selection, or early stopping
- no test windows appear in training batches
- chronological or official mission split preserved
- hyperparameters selected without test-set feedback
- anomaly labels are consumed only after thresholds are frozen, for evaluation, unless a separately declared supervised comparator explicitly requires them

## Promotion gate

A run becomes a retained research result only when it includes: exact commit SHA, config, dataset version/hash or official release identifier, preprocessing description, seed, hardware/runtime, raw score artifact, metrics artifact, and baseline comparison. Synthetic smoke results never satisfy this gate.

The primary paper verdict additionally requires the complete frozen 30-record decision surface: 2 mission surfaces × 5 seeds × 3 methods (`space_jepa`, `robust_zscore`, `persistence`), each carrying the exact official anomaly-only `EW_F_0.50` output. Missing, duplicate, non-finite, or out-of-freeze records fail closed. Before any official held-out metric is opened, exact benchmark metadata/data identities and runtime receipts still require independent review; `ESA_PRIMARY_ENDPOINT_V0.json` therefore keeps execution and held-out-label authorization false.
