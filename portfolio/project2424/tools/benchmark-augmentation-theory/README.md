# AUX-P2424-BENCHMARK-AUGMENTATION — Benchmark Augmentation Theory

A deterministic auxiliary benchmark-audit tool for testing whether an apparent model ranking survives a controlled, label-preserving perturbation.

## Identity note

This useful artifact previously occupied `T2424-0050` in error. The frozen First-100 queue assigns `T2424-0050` to **Darcy Latent Operator**, so this package is preserved under an auxiliary identity and must not be counted as the rank-43 queue project.

## Synthetic mechanism

Each binary case contains a causal `signal`, a perfectly correlated `shortcut`, and label `-1` or `1`. On the base benchmark, a causal-signal predictor and shortcut predictor both score 100%, hiding the shortcut dependence.

Two label-preserving controls are provided:

- `flip-shortcut`: breaks only the shortcut and should separate the models;
- `scale-signal`: changes signal magnitude without changing sign and should preserve the tie.

The augmentation engine fails closed if a transform changes the supplied label.

## Predeclared screen

For 100 deterministic cases:

- base accuracy gap <= 1 percentage point;
- shortcut-breaking gap >= 90 percentage points in favor of the signal model;
- neutral-control gap <= 1 percentage point.

Run:

```bash
node portfolio/project2424/tools/benchmark-augmentation-theory/experiment/run.mjs
```

Test:

```bash
node --test tests/project2424BenchmarkAugmentation.test.mjs
```

## Claim boundary

This is a controlled synthetic shortcut-exposure audit. It does not establish semantic validity for arbitrary augmentations, real-model robustness, distribution-shift generalization, a benchmark-validity theorem, publication novelty, or research completion.
