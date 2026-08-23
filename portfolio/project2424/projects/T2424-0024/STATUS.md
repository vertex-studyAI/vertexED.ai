# T2424-0024 Status

**Project:** Trust Under Uncertainty  
**Project 2424 ID:** T2424-0024  
**Queue rank:** 17  
**State:** `MERGED / EXACT_HEAD_REPRODUCED / BOUNDED_SYNTHETIC_EVALUATOR_MECHANICS / EXTERNAL_VALIDATION_PENDING`  
**Claim level:** calibration/selective-prediction evaluator mechanics on frozen synthetic paired controls

## Current integration and reproduction truth

The package was subsequently integrated into current `main`; later portfolio reconciliation explicitly records T2424-0024 among the completed Project2424 integrations.

The fail-closed Project2424 reproducibility runner then executed T2424-0024 on exact head `faad54b05de4dbfd7f9f6720342b22e50a283ef3` in GitHub Actions run `31660595576`, conclusion **success**, artifact `9166031673`, digest `sha256:e142f0f03b206891fc2266e7762c3c04f3a1a4163302e6a2aa6254c9516e03ad`.

The earlier `MANUAL_MERGE_PENDING` / refresh-pending labels are therefore stale.

## Evidence present

- [x] canonical frozen-queue path
- [x] evaluator implementation
- [x] Brier score, calibration bins / ECE, risk-coverage and abstention reporting
- [x] frozen claim and protocol
- [x] matched overconfidence negative/mechanism control
- [x] retained machine-readable result
- [x] explicit GO verdict and limitations
- [x] author regression suite
- [x] separate claim-to-evidence QA path
- [x] immutable provenance manifest
- [x] clean-checkout reproduction instructions
- [x] baseline analysis
- [x] metric/mechanism ablation analysis
- [x] merged source identity
- [x] exact-head fail-closed reproduction runner success

## Current interpretation

The bounded synthetic evaluator-mechanics package is GREEN at its stated scope.

It does **not** establish real-model trustworthiness, external validity, deployment safety, publication novelty, educational or production effectiveness, or Project2424 research completion.

## Next scientific gate

Any stronger claim requires a new frozen study on real held-out model predictions with immutable dataset/model identities, calibration-split discipline, stronger baselines, bootstrap uncertainty, subgroup/error slices, and independently generated or reproduced prediction evidence.
