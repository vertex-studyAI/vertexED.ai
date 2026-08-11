# T2424-0024 Status

**Project:** Trust Under Uncertainty  
**Project 2424 ID:** T2424-0024  
**Queue rank:** 17  
**State:** VALIDATING / CERTIFICATION_PENDING / MANUAL_MERGE_PENDING  
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
- [x] separate claim↔evidence QA path that does not import the evaluator implementation
- [x] immutable Git blob provenance manifest for claim/protocol/core/runner/results/QA
- [x] clean-checkout reproduction instructions
- [x] explicit baseline analysis
- [x] explicit metric-mechanism ablation analysis
- [x] canonical CI passed on preceding evidence head `7feed42003ee06500b594151dc16f229bfeffc85`, run `31456648276`

## Current repository gate

The preceding evidence head passed canonical GitHub Actions. The provenance/reproduction/baseline/ablation additions create a newer branch head, so canonical CI must pass again before this strengthened package is repository-verified and before any separate manual merge decision.

The parent repository is deployment-connected. **Do not auto-merge or deploy.**

## Nine-gate boundary

For the deliberately narrow synthetic evaluator-mechanics claim, this branch now contains source identity, falsifiable claim, frozen protocol, runnable command, baseline/control evidence, retained output, explicit ablation/negative-mechanism analysis, explicit verdict, and implementation-independent QA plus reproduction instructions.

It remains **CERTIFICATION_PENDING**, not Certified complete, because a clean current-head integration/reproduction run is still required and the scientific boundary must remain synthetic evaluator mechanics only. Even if the artifact contract becomes complete, that must not be upgraded into a real-model trustworthiness, external-validity, publication, or research-complete claim.

## Next scientific gate

Real held-out model predictions with immutable dataset/model identity, calibration split discipline, stronger baselines, bootstrap uncertainty, subgroup/error slices, and independently generated or reproduced prediction evidence.
