# T2424-0024 — Frozen Minimum Protocol

PROJECT: `T2424-0024` — Trust Under Uncertainty  
CLAIM: matched-outcome moderate confidence has lower Brier score and 5-bin ECE than the overconfident control; ranking-only selective risk is unchanged.  
PRIMARY METRIC: Brier score  
SECONDARY METRIC: 5-bin expected calibration error  
BASELINE / NEGATIVE CONTROL: matched-outcome overconfident confidence policy  
SEEDS: none; deterministic fixed records  
DATA: 20 fixed correctness outcomes in `experiment/run.mjs`  
SUCCESS THRESHOLD: `moderate.brier < overconfident.brier` AND `moderate.ece < overconfident.ece`  
NEGATIVE/MECHANISM CHECK: selective-risk points at 25%, 50%, 75%, 100% coverage must match across policies because their confidence rankings are identical.  
ABLATION: compare calibration-sensitive metrics with ranking-only selective risk on exactly the same correctness outcomes.  
EXPECTED COST: milliseconds, no external APIs or datasets.

## Frozen outcomes

```text
T T F T F T T T F T T F T T T F T F T T
```

## Fixed evaluator settings

- ECE bins: `5`
- selective-risk coverages: `0.25, 0.5, 0.75, 1.0`
- moderate confidence: correct `0.8`, error `0.2`
- overconfident confidence: correct `0.98`, error `0.92`
- moderate abstention threshold: `0.7`
- overconfident abstention threshold: `0.95`

Do not change these values after inspecting the result and still call the run confirmatory.
