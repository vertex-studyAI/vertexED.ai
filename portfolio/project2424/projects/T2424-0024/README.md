# T2424-0024 — Trust Under Uncertainty

A deterministic Project 2424 evaluation package for calibration and selective prediction. It measures Brier score, binned expected calibration error, confidence-ranked risk/coverage, and threshold abstention on labeled correctness records.

## Run

```bash
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs /tmp/t2424-0024-result.json
node portfolio/project2424/projects/T2424-0024/reproduction/verify.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

## Retained controlled result

Using identical 20-example correctness outcomes:

- moderate policy Brier: `0.04`
- overconfident policy Brier: `0.2542`
- moderate 5-bin ECE: `0.20`
- overconfident 5-bin ECE: `0.262`

The frozen evaluator-mechanics gate passes because the overconfident policy is worse on both calibration-sensitive metrics. The ranking is unchanged, so the recorded selective-risk curves are intentionally identical at the chosen coverage points.

## Claim boundary

This is synthetic evaluator validation. It does **not** prove any real model is trustworthy or calibrated, and it does not choose a deployment threshold. See `CLAIM.md`, `PROTOCOL.md`, `analysis/ablation.md`, and `analysis/verdict.md`.

## Evidence state

This branch recovers the older implementation into the frozen queue's canonical path and adds retained raw evidence plus a fail-closed consistency verifier. Exact-head GitHub CI is still required before this branch can be considered merge-ready.
