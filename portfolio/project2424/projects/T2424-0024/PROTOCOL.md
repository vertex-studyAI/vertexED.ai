# Frozen protocol

- PROJECT: `T2424-0024` — Trust Under Uncertainty
- CLAIM: overconfident synthetic policy is penalized versus the moderate policy on identical outcomes
- PRIMARY METRIC: Brier score
- SECONDARY METRIC: 5-bin expected calibration error
- BASELINE: moderate policy (`0.8` confidence when correct, `0.2` when incorrect)
- NEGATIVE CONTROL: overconfident policy (`0.98` confidence when correct, `0.92` when incorrect)
- SEEDS: none; deterministic fixed data
- DATA: 20 predeclared boolean correctness outcomes in `experiment/run.mjs`
- SUCCESS THRESHOLD: overconfident Brier > moderate Brier AND overconfident ECE > moderate ECE
- FAILURE THRESHOLD: either inequality fails
- ABLATION: selective-risk/abstention summaries expose that ranking-only behavior can look identical even when calibration quality differs
- EXPECTED COST: negligible local CPU

The threshold is frozen before interpreting the retained result.
