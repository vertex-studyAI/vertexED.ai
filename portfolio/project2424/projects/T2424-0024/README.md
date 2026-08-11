# T2424-0024 — Trust Under Uncertainty

A canonical Project 2424 evaluator for calibration and selective-prediction mechanics.

## What is implemented

- Brier score for confidence-as-probability-of-correctness;
- explicit calibration bins and expected calibration error (ECE);
- confidence-ranked risk–coverage curves;
- selective risk at requested coverage;
- threshold-based abstention reports;
- a frozen paired synthetic control with identical correctness outcomes but different confidence policies;
- retained machine-readable evidence;
- an explicit claim/protocol/verdict boundary;
- independent evidence-consistency QA that recomputes the key metrics without importing the evaluator implementation.

## Frozen minimum experiment

The moderate policy uses confidence `0.8` on correct records and `0.2` on errors. The matched overconfident control uses `0.98` on correct records and `0.92` on errors.

Observed retained result:

```text
accuracy (both):                  0.70
moderate Brier:                   0.0400
overconfident Brier:              0.2542
moderate ECE (5 bins):            0.2000
overconfident ECE (5 bins):       0.2620
selective-risk ordering:          identical
verdict:                          GO_EVALUATOR_MECHANICS_ONLY
```

The identical selective-risk curve is important: ranking-only metrics cannot distinguish policies that preserve ordering even when calibration quality differs.

## Reproduce

```bash
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
node --test tests/project2424TrustUnderUncertainty.test.mjs
node --test tests/project2424TrustUnderUncertaintyQa.test.mjs
```

The runner writes `evidence/results.json`.

## Evidence files

- `CLAIM.md` — frozen falsifiable claim;
- `PROTOCOL.md` — predeclared fixed records, metrics and thresholds;
- `evidence/results.json` — retained raw outcomes, policies and result metrics;
- `analysis/verdict.md` — interpretation, negative/mechanism observation and GO boundary.

## Claim boundary

This package tests deterministic evaluator mechanics. It does **not** prove that any real model is calibrated or trustworthy; it does not establish an optimal abstention threshold, external validity, publication novelty, production readiness, research completion, or nine-gate certification.

## Next evidence gate

Freeze real held-out prediction records from at least one model, fit calibration only on a separate calibration split, compare raw and calibrated probabilities, bootstrap uncertainty, slice by difficulty/domain, and preserve final test labels from tuning.
