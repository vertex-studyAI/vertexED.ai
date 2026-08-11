# Benchmark Augmentation Theory — auxiliary Project 2424 tool

A deterministic benchmark-audit prototype for testing whether an apparent model ranking survives a controlled, label-preserving perturbation.

## Identity

This is an **auxiliary portfolio tool**, not the First-100 registry project `T2424-0050`. It was previously merged under `T2424-0050`, but the frozen queue assigns that ID to **Darcy Latent Operator**. The useful benchmark-audit artifact is preserved here instead of being deleted.

Auxiliary identity: `AUX-P2424-BENCHMARK-AUGMENTATION-THEORY`.

## Synthetic benchmark

Each binary case contains a causal `signal`, a perfectly correlated `shortcut`, and label `-1` or `1`. On the base benchmark, both the signal model and shortcut model score 100%, so base accuracy cannot distinguish them.

The shortcut-breaking augmentation flips only the shortcut sign while preserving signal and label. The neutral control scales the causal signal magnitude without changing its sign or shortcut. The augmentation engine rejects any transform that changes the supplied label.

## Predeclared screen

For a deterministic 100-case benchmark:

1. original base-accuracy gap <= 1 percentage point;
2. shortcut-breaking augmented accuracy gap >= 90 percentage points in favor of the signal model;
3. neutral-control gap <= 1 percentage point.

## Run

```bash
node portfolio/project2424/tools/benchmark-augmentation-theory/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424BenchmarkAugmentation.test.mjs
```

## Claim boundary

Synthetic shortcut-exposure mechanics only. No theorem of benchmark validity, guarantee that arbitrary augmentations are semantically label-preserving, real-model robustness, distribution-shift generalization, publication novelty, or research completion is claimed.
