# T2424-0025 — Non-Gaussian Memory Transformer

This package is a **bounded memory-aggregation mechanism screen**. It does not claim to implement or validate a full Transformer architecture.

## Falsifiable question

When attention-addressed memory values contain heavy-tailed outliers, does a robust weighted-median readout outperform the ordinary attention-weighted mean—and is that advantage specifically larger under non-Gaussian contamination than under a clean Gaussian control?

## Memory setup

- 24 latent anchor locations on `[0, 1]`;
- 7 memory replicas per anchor;
- smooth deterministic latent signal;
- small key noise;
- Gaussian value noise in the clean control;
- in the heavy-tail condition, 18% of memory values receive Cauchy contamination;
- query-to-memory weights use a deterministic Gaussian/RBF attention kernel.

## Compared readouts

### Baseline

Attention-weighted arithmetic mean.

### Robust memory readout

Weighted median using the **same attention distribution**. Only the aggregation rule changes.

## Predeclared cheap screen

Across 30 deterministic seeds:

1. heavy-tail MAE improvement must exceed **80%**;
2. robust clean-control MAE must be no worse than **1.10×** the baseline;
3. the heavy-tail relative-improvement advantage over the clean control must exceed **30 percentage points**.

## Deterministic reference result

The reference run is approximately:

```text
heavy-tail baseline MAE:      0.361527
heavy-tail robust MAE:        0.016561
heavy-tail improvement:       95.42%

clean baseline MAE:           0.024355
clean robust MAE:             0.012594
clean improvement:            48.29%

non-Gaussian advantage gap:   47.13 percentage points
```

The clean control is allowed to improve; the falsifiable non-Gaussian claim is that the **relative benefit is substantially larger under heavy-tailed contamination**.

## Run

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424NonGaussianMemory.test.mjs
```

The root canonical CI also discovers the regression file.

## What this demonstrates

- an attention-addressed memory can be made materially more robust to synthetic heavy-tailed value corruption by changing only its aggregation statistic;
- the mechanism is deterministic, inspectable and falsifiable;
- a clean-noise control separates generic smoothing benefit from the stronger heavy-tail effect.

## What this does **not** demonstrate

- a complete Transformer;
- learned non-Gaussian attention;
- long-context language modeling;
- superiority over robust neural memory architectures;
- real-world dataset robustness;
- publication novelty;
- research completeness.

## Next evidence gate

Freeze a learned sequence-retrieval task with train/validation/test splits, compare mean/median/Huber/trimmed readouts under several contamination families, measure accuracy and calibration rather than only scalar MAE, and independently reproduce before any architecture-level claim.
