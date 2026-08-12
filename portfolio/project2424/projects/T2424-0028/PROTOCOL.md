# Frozen protocol — T2424-0028

```text
PROJECT: T2424-0028 — Residual Event Tokenization
CLAIM: Residual-triggered tokens enforce the declared reconstruction bound; the linear predictor uses exactly two events on the clean linear control and materially fewer events than zero-order hold.
PRIMARY METRIC: maximum absolute reconstruction error relative to the configured threshold.
BASELINE: zero-order-hold event predictor.
SEEDS: none; deterministic fixtures and no RNG.
DATA: generated 120-point trend-with-defects series plus clean linear controls in the regression suite.
SUCCESS THRESHOLD: for hold and linear modes at thresholds 0.1, 0.25, 0.5, 1, 2, max absolute error < threshold + 1e-12; clean linear control emits exactly 2 linear events and hold events > 10x linear events.
FAILURE THRESHOLD: any reconstruction-bound violation, predictor/control invariant failure, non-finite metric, or regression failure.
NEGATIVE CONTROL: zero-order hold on the same clean linear trend.
ABLATION: threshold sweep across 0.1, 0.25, 0.5, 1, 2 for both predictors.
EXPECTED COST: negligible CPU; deterministic Node.js execution.
```

## Commands

```bash
node portfolio/project2424/projects/T2424-0028/experiment/run.mjs
node --test tests/residualEventTokenization.test.mjs
```

## Interpretation rule

Passing this protocol validates codec mechanics only. It cannot be promoted into an external rate–distortion, learned-model, publication, production, or Certified-complete claim.
