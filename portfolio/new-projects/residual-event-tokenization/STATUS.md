# T2424-0028 Status

**Project:** Residual Event Tokenization  
**Project 2424 ID:** T2424-0028  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** deterministic algorithm + synthetic mechanics experiment

## Implemented

- [x] causal residual-event encoder
- [x] deterministic decoder
- [x] zero-order-hold predictor
- [x] linear event-to-event extrapolator
- [x] reconstruction metrics
- [x] rate/error threshold sweep
- [x] deterministic defect-series generator
- [x] runnable experiment command
- [x] exact-trend compression regression
- [x] reconstruction-bound regression
- [x] malformed-stream validation
- [x] reproducibility documentation

## Evidence gate

Promote to `TESTED_MINIMUM_EXPERIMENT` only after the canonical GitHub Actions release gate succeeds on the exact branch head.

Until that runner evidence exists, no passing-test claim is made for this branch.

## Not claimed

- state-of-the-art compression
- validated rate–distortion advantage
- external-dataset generalization
- production codec readiness
- novelty suitable for publication

## Next artifact

Freeze an external rate–distortion benchmark with actual encoded byte counts, uniform/downsampling and change-point baselines, irregular-timestamp handling, and predeclared metrics.
