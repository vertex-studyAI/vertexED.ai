# T2424-0028 Status

**Project:** Residual Event Tokenization  
**Project 2424 ID:** `T2424-0028`  
**Frozen queue rank:** 21  
**Track:** C — Existing work → minimum experiment  
**State:** `FRESHLY_REPRODUCED_BOUNDED_CODEC_MECHANICS`  
**Claim level:** deterministic algorithm + synthetic mechanics experiment

## Implemented and freshly verified

- [x] frozen queue identity resolved
- [x] tested legacy source recovered without algorithm rewrite
- [x] causal residual-event encoder and deterministic decoder
- [x] zero-order-hold and linear event-to-event predictors
- [x] reconstruction metrics and rate/error threshold sweep
- [x] deterministic defect-series generator
- [x] runnable canonical experiment
- [x] exact-trend compression and reconstruction-bound regressions
- [x] malformed-stream fail-closed validation
- [x] falsifiable claim and frozen protocol
- [x] retained raw canonical result artifact
- [x] independent clean hosted-runner execution of frozen experiment + focused tests
- [x] `RESULTS.md`, `REPRODUCE.md`, machine-readable metadata, and raw metrics retained
- [ ] external byte-level rate–distortion benchmark
- [ ] noisy/nonlinear/external signal benchmark
- [ ] learned-model comparison

## Fresh reproducibility evidence — 2026-08-13

Scientific execution commit: `4eb3fed7f582428c389a66dd388c241d8a152e8e`  
Actions run: `31656575356`  
Artifact: `9164597422`  
Artifact digest: `sha256:252392c0447a443b9c75b5926c80403ddded48ef7465a829fe4001ba27cae15e`  
Environment: Ubuntu 24.04 hosted runner, x86_64, Node `v22.23.1`, Linux `6.17.0-1020-azure`

The frozen 120-observation defect-series sweep passed all 10 reconstruction-bound conditions. At the primary `linear / threshold=0.5` setting, 8 events represented 120 observations (15x event-count compression) with MAE `0.1728129`, RMSE `0.2232590`, and maximum absolute error `0.4885705 < 0.5`.

Focused regressions passed `5/5`, including the exact-linear two-event invariant, the >10x zero-order-hold negative-control gap on a clean linear signal, monotonic hold-token behavior under increasing thresholds, reconstruction bounds, and fail-closed malformed-input checks.

Raw result SHA-256: `039f9264f833dbae10932a01865ac78a85104a5e6b9b1e67dc6e9b375356c046`.

## Provenance

Legacy PR #163 head `f35ac3a28063aee4f41fc5cc44e775655092f383` passed CI `31409107038`. The current canonical lineage remains an algorithm-preserving recovery rather than a reconstruction from prose. The fresh reproducibility run changes evidence retention only; it does not rewrite the scientific algorithm or frozen protocol.

## Uncertainty and limits

The fixture is deterministic, so stochastic seed mean/SD is not applicable. The unresolved uncertainties are external validity, noise/non-linearity sensitivity, predictor misspecification, byte-level coding overhead, and whether event-count compression translates into actual rate–distortion improvement.

This package is **not Certified complete** and is not research-complete.

## Not claimed

- state-of-the-art compression
- validated byte-level rate–distortion advantage
- external-dataset generalization
- learned representation superiority
- production codec readiness
- publication novelty
- Project 2424 certification
