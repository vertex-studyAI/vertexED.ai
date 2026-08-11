# AUX-P2424-BENCHMARK-AUGMENTATION — Benchmark Augmentation Theory

A deterministic benchmark-audit prototype for testing whether an apparent model ranking survives a **controlled, label-preserving perturbation**.

This artifact was previously merged at `T2424-0050`, but the frozen First-100 queue assigns that canonical ID to **Darcy Latent Operator**. It is preserved here under an auxiliary identity so no tested work is destroyed and the canonical queue identity can be restored without rewriting history.

## Falsifiable question

Can a benchmark augmentation expose shortcut dependence that is invisible on the original benchmark, while a neutral augmentation leaves the ranking unchanged?

## Synthetic benchmark

Each binary case contains a causal `signal`, a perfectly correlated `shortcut`, and label `-1` or `1`. On the base benchmark both the signal model and shortcut model score 100%, so base accuracy cannot distinguish their dependencies.

## Controlled augmentations

- **Shortcut-breaking:** flip only the shortcut sign while preserving signal and label. The signal model should remain correct while the shortcut model fails.
- **Neutral control:** scale causal-signal magnitude without changing its sign or the shortcut. Both models should preserve their ranking/performance.

The augmentation engine fails closed if a transform changes the supplied label.

## Predeclared synthetic screen

For a deterministic 100-case benchmark:

1. original base-accuracy gap <= 1 percentage point;
2. shortcut-breaking accuracy gap >= 90 percentage points in favor of the signal model;
3. neutral-control gap <= 1 percentage point.

The deterministic construction yields 100%/100% base accuracy, 100%/0% after shortcut breaking, and 100%/100% under the neutral control.

## Run

```bash
node portfolio/project2424/tools/benchmark-augmentation-theory/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424BenchmarkAugmentation.test.mjs
```

## Identity and claim boundary

This is an **auxiliary tested mechanism**, not canonical First-100 project `T2424-0050`, and must not be counted under that queue ID. It demonstrates deterministic synthetic ranking-audit mechanics only. It does not establish semantic validity of arbitrary augmentations, real-model robustness, benchmark-validity theory, publication novelty, or research completion.
