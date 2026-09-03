# Space-JEPA frozen pre-outcome protocol — 2026-09-03

## Claim boundary

This repository contains an implementation and a synthetic engineering smoke test. It does **not** contain a retained ESA-ADB result, and it makes no performance claim against ESA-ADB baselines.

## Research question

Does JEPA-style future latent prediction improve spacecraft telemetry anomaly detection under a leakage-controlled evaluation, relative to simple and established baselines, without requiring anomaly labels during representation training or threshold fitting?

## Primary dataset

Use the official ESA Anomaly Detection Benchmark (ESA-ADB), retaining its mission splits, labels, anomaly types, and benchmark evaluation pipeline where compatible. The official project describes telemetry from three ESA missions, with two used for benchmarking. Do not mix test telemetry into scaler fitting, representation training, threshold fitting, hyperparameter selection, or early stopping.

## Fixed first-pass experiment

1. **Input:** multivariate telemetry after the official ESA-ADB preprocessing path or an explicitly documented equivalent conversion.
2. **Normalization:** fit robust median/MAD statistics on the training partition only.
3. **Representation training:** train Space-JEPA only on the allowed training data. The online encoder receives context windows; the EMA target encoder receives future target windows; the predictor minimizes latent cosine error plus a small anti-collapse variance regularizer.
4. **Anomaly score:** future-target latent prediction error aligned back to telemetry timesteps by averaging overlapping windows.
5. **Threshold:** fit from valid training-prefix scores only, without consulting anomaly labels. Default frozen rule: 99.5th percentile of all valid training-prefix scores. If the official benchmark later requires labeled validation thresholding, that must be frozen as a separate protocol amendment before any test-outcome access.
6. **Baselines:** at minimum robust z-score, one-step persistence error, and official ESA-ADB benchmark methods that are feasible under the same split.
7. **Primary metrics:** official ESA-ADB metrics when the benchmark pipeline is wired. Repository-native diagnostics may include AUROC, average precision, point F1, event F1, false positives, and recall, but they are secondary if they conflict with the official evaluation.
8. **Seeds:** 17, 29, 43, 71, 101 for stochastic runs. Report every seed, not only the best.
9. **Ablations:** no EMA target encoder; no anti-collapse term; context lengths {32, 64, 128}; target lengths {8, 16, 32} if budget permits.
10. **Failure rule:** if Space-JEPA does not beat the chosen baselines under the frozen evaluation, retain the negative result. Do not change the claim after seeing test outcomes.

## Leakage checks required before a retained run

- scaler parameters computed from training only
- anomaly labels are not used for scaler fitting, representation training, threshold fitting, hyperparameter selection, or early stopping
- no test windows appear in training batches
- chronological or official mission split preserved
- hyperparameters selected without test-set feedback
- anomaly labels are consumed only after thresholds are frozen, for evaluation, unless a separately declared supervised comparator explicitly requires them

## Promotion gate

A run becomes a retained research result only when it includes: exact commit SHA, config, dataset version/hash or official release identifier, preprocessing description, seed, hardware/runtime, raw score artifact, metrics artifact, and baseline comparison. Synthetic smoke results never satisfy this gate.
