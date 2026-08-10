# T2424-0025 Status

**Project:** Non-Gaussian Memory Transformer  
**Queue rank:** 18  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** synthetic robust memory-aggregation mechanism

## Implemented

- [x] deterministic attention-addressed memory
- [x] weighted-mean baseline
- [x] weighted-median robust readout
- [x] Gaussian clean control
- [x] Cauchy-contaminated heavy-tail condition
- [x] 30-seed benchmark
- [x] focused regression suite
- [x] explicit architecture/research claim boundary

## Predeclared gate

- heavy-tail relative MAE improvement > 80%
- clean-control robust MAE <= 1.10× baseline MAE
- heavy-tail improvement minus clean-control improvement > 30 percentage points

Reference deterministic output clears those mechanics. Promote to `TESTED_TOOL` only after canonical GitHub Actions passes on the exact branch head.

## Not claimed

- full Transformer architecture
- learned attention robustness
- real sequence-model performance
- publication novelty
- research completion

## Next artifact

A trained sequence-retrieval benchmark with several contamination distributions, multiple robust readout baselines, calibration/error analysis and independent reproduction.
