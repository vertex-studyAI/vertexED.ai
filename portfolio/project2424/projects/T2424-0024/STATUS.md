# T2424-0024 Status

**Project:** Trust Under Uncertainty  
**Project 2424 ID:** T2424-0024  
**Queue rank:** 17  
**State:** VALIDATING / CERTIFICATION_PENDING  
**Claim level:** calibration/selective-prediction evaluator mechanics on frozen synthetic paired controls

## Recovered and strengthened on current main

- [x] canonical frozen-queue path
- [x] evaluator implementation
- [x] Brier score
- [x] calibration bins / ECE
- [x] confidence-ranked risk–coverage
- [x] abstention reporting
- [x] frozen claim
- [x] frozen protocol
- [x] matched overconfidence negative/mechanism control
- [x] retained machine-readable result
- [x] explicit GO verdict and limitations
- [x] author regression suite
- [x] separate claim↔evidence QA path

## Current repository gate

Canonical GitHub Actions must pass on this branch's exact head before the package can be called repository-verified on current `main`. The parent repository is connected to deployment systems, so this recovery must remain unmerged unless the separate integration decision is allowed.

## Nine-gate boundary

This package has a source-controlled implementation, falsifiable claim, frozen protocol, runnable command, baseline/control evidence, retained output, a negative/mechanism analysis, and explicit verdict. The QA test independently recomputes key evidence metrics. However it remains **CERTIFICATION_PENDING**, not Certified complete, because the scientific evidence is synthetic and does not establish an externally grounded real-model uncertainty claim.

## Next gate

Real held-out model predictions with immutable dataset/model identity, calibration split discipline, stronger baselines, bootstrap uncertainty, subgroup/error slices, and independent reproduction.
