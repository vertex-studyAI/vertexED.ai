# T2424-0035 Status

**Project:** Grokking Agent  
**Project 2424 ID:** T2424-0035  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** learning-curve detector + synthetic positive/negative controls

## Implemented

- [x] learning-curve validation
- [x] causal smoothing
- [x] persistent memorization threshold
- [x] persistent generalization threshold
- [x] delayed-generalization classification
- [x] synthetic delayed positive control
- [x] matched non-grokking control
- [x] spike/persistence regression
- [x] no-future-data smoothing regression
- [x] runnable minimum experiment
- [x] reproducibility and limitations

## Evidence gate

Promote to `TESTED_MINIMUM_EXPERIMENT` only after canonical GitHub Actions succeeds on the exact branch head.

## Not claimed

- real-model grokking evidence
- causal mechanism
- phase transition proof
- universality of detector thresholds
- production training automation

## Next artifact

Freeze the detector configuration before applying it to retained real-model training logs, then add threshold-sensitivity and matched-control analyses.
