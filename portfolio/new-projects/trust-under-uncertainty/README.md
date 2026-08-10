# T2424-0024 — Trust Under Uncertainty

A Project 2424 evaluation package for measuring whether predictive confidence is aligned with correctness and whether abstention can trade coverage for lower error.

## What exists

- Brier score for probabilistic confidence;
- expected calibration error (ECE) with explicit bins;
- calibration-bin summaries;
- confidence-ranked risk–coverage curves;
- selective risk at requested coverage;
- threshold-based abstention reports;
- a paired synthetic experiment that holds correctness outcomes fixed while changing confidence behavior;
- regression tests for overconfidence penalties, ranking, coverage, all-rejected behavior, and input validation.

This package evaluates confidence **given labeled outcomes**. It does not itself generate uncertainty estimates and does not prove a model is trustworthy.

## Run the minimum experiment

```bash
node portfolio/new-projects/trust-under-uncertainty/experiment/run.mjs
```

The experiment uses identical correctness outcomes for two confidence policies:

- a moderate policy that assigns lower confidence to errors;
- an overconfident policy that assigns high confidence even to errors.

A sound evaluator should penalize the overconfident policy under Brier score and ECE. The data are deterministic and synthetic so this is an implementation check, not a benchmark result.

## Run tests

```bash
node --test tests/trustUnderUncertainty.test.mjs
```

The repository's root test glob includes this file in the canonical CI release gate.

## Metric notes

### Brier score

For correctness outcome `y ∈ {0,1}` and confidence `p`:

```text
mean((p - y)^2)
```

Lower is better.

### Expected calibration error

Predictions are grouped into confidence bins. Each non-empty bin contributes:

```text
bin_fraction × |bin_accuracy - bin_mean_confidence|
```

ECE is useful but bin-sensitive, so the package exposes the bins rather than hiding them behind one scalar.

### Selective risk

Predictions are sorted by confidence from highest to lowest. For each accepted prefix:

```text
coverage = accepted / total
risk = errors / accepted
```

This shows what happens when a system is allowed to abstain on lower-confidence predictions.

## Files

```text
trust-under-uncertainty/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/trustUnderUncertainty.test.mjs
```

## Limitations

- binary correctness only;
- confidence is treated as probability of correctness, not class probability vectors;
- ECE depends on bin count and sample size;
- no adaptive or class-conditional calibration yet;
- no confidence intervals;
- no distribution-shift slices;
- no cost model for abstention;
- no real-model outputs are bundled in this minimum experiment.

## Next evidence gate

Freeze predictions from at least one real model on a held-out labeled benchmark, predeclare calibration and selective-prediction metrics, report bootstrap uncertainty, slice by difficulty/domain, and compare raw confidence against a separately fit calibration method without touching the final test labels.
