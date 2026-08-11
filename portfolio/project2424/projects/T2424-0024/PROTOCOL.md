# Frozen protocol — T2424-0024

This protocol is the recovery-time minimum experiment contract. Thresholds must not be changed after inspecting the retained output.

```text
PROJECT: T2424-0024 — Trust Under Uncertainty
CLAIM: On identical correctness outcomes, the moderate confidence mapping has lower Brier score and lower 5-bin ECE than the overconfident mapping.
PRIMARY METRIC: Brier score; expected calibration error is a co-primary implementation sanity metric.
BASELINE: Overconfident confidence policy (0.98 when correct, 0.92 when incorrect).
SEEDS: None; deterministic experiment with no RNG.
DATA: Frozen 20-element boolean correctness sequence in experiment/run.mjs.
SUCCESS THRESHOLD: moderate Brier < overconfident Brier AND moderate 5-bin ECE < overconfident 5-bin ECE; all outputs finite and regression invariants pass.
FAILURE THRESHOLD: either primary inequality fails, a metric is non-finite/out of bounds, or the regression suite fails.
NEGATIVE CONTROL: identical correctness outcomes are held fixed so only confidence behavior changes; this prevents accuracy changes from explaining the calibration-score difference.
ABLATION: inspect ECE at 5 versus 10 bins and selective-risk behavior to expose binning/ranking sensitivity.
EXPECTED COST: negligible CPU; deterministic Node.js execution.
```

## Execution command

```bash
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

## Interpretation rule

Passing this protocol promotes only the synthetic evaluator mechanics. It cannot promote a model, benchmark, scientific mechanism, deployment, or research-complete claim.
