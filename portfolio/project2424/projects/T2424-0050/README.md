# T2424-0050 — Benchmark Augmentation Theory

A deterministic benchmark-audit prototype for testing whether an apparent model ranking survives a **controlled, label-preserving perturbation**.

## Falsifiable question

Can a benchmark augmentation expose shortcut dependence that is invisible on the original benchmark, while a neutral augmentation leaves the ranking unchanged?

## Synthetic benchmark

Each binary case contains:

- a causal `signal` whose sign defines the label;
- a perfectly correlated `shortcut` feature;
- label `-1` or `1`.

On the base benchmark, both models score 100%:

- `signal-model` predicts from the causal signal;
- `shortcut-model` predicts from the shortcut.

Base accuracy therefore cannot distinguish them.

## Controlled augmentations

### Shortcut-breaking augmentation

Flip only the shortcut sign while preserving signal and label.

Expected result:

- signal model remains correct;
- shortcut model fails;
- the hidden dependency becomes visible.

### Neutral control

Scale the causal signal magnitude by 2 without changing its sign or the shortcut.

Expected result:

- both models retain the same ranking/performance;
- the audit does not manufacture a separation from every perturbation.

The augmentation engine rejects any transform that changes the supplied label.

## Predeclared cheap screen

For a deterministic 100-case benchmark:

1. original base-accuracy gap <= **1 percentage point**;
2. shortcut-breaking augmented accuracy gap >= **90 percentage points** in favor of the signal model;
3. neutral-control gap <= **1 percentage point**.

The deterministic construction yields:

```text
base signal accuracy:           100%
base shortcut accuracy:         100%
shortcut-break signal accuracy: 100%
shortcut-break shortcut:          0%
neutral signal accuracy:        100%
neutral shortcut accuracy:      100%
```

## Run

```bash
node portfolio/project2424/projects/T2424-0050/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424BenchmarkAugmentation.test.mjs
```

The root canonical CI also discovers the regression file.

## What this demonstrates

- base benchmark accuracy can hide shortcut dependence;
- a carefully chosen label-preserving augmentation can reveal that dependence;
- neutral controls are necessary to show that ranking changes are perturbation-specific rather than automatic;
- mutation contracts should fail closed when labels change.

## What this does **not** demonstrate

- a theorem of benchmark validity;
- that arbitrary augmentations are semantically label-preserving;
- real-model robustness;
- distribution-shift generalization;
- automatic benchmark improvement;
- publication novelty or research completion.

## Next evidence gate

Freeze a real benchmark with human-reviewed semantic invariances, define perturbations before model evaluation, compare several trained models, measure ranking stability and error slices, and independently audit whether each augmentation truly preserves the task label.
