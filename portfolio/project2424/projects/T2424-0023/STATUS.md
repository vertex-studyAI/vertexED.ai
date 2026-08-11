# T2424-0023 Status

**Project:** Multilingual Epistemic Blind Spots Benchmark  
**Queue rank:** 1  
**Track:** C — Protocol / evaluation package  
**State:** `RECONCILED_IMPLEMENTATION / CI_PENDING`  
**Certified complete:** NO

## Why this branch exists

Two separate branches (#196 and #198) independently implemented the same canonical First-100 ID and both later obtained exact-head CI success. Keeping both as active canonical candidates would create identity ambiguity and possible double-counting.

This branch starts from current `main` and reconciles the strongest non-conflicting behavior into one canonical package:

- caller supplies expected/predicted answers; correctness is derived internally;
- strict aligned-record validation and concept/language uniqueness;
- at least two languages per concept;
- coverage and selective accuracy;
- mean confidence, Brier and calibration-gap summaries;
- ordinary mismatch separated from strict blind spot;
- strict blind spot requires high-confidence wrong + high-confidence correct reference on the same concept;
- directional language-pair comparison;
- canonical input ordering for deterministic aggregation;
- threshold sensitivity;
- deterministic three-language fixture;
- eight focused regression tests.

## Prior branch evidence

- PR #196 head `3b7584e7ef249ca30af19351590f7c233507cfa0`: canonical CI `31449636468` success.
- PR #198 head `7946ccdbec797b2c31d71a4099cffb44aad39f6e`: canonical CI `31449913019` success after repairing a floating-point order-invariance bug.

Prior CI proves those branch heads, not this reconciled head.

## Current promotion gate

Do not close the prior review paths or mark this package tested until canonical GitHub Actions succeeds on this exact reconciliation head. If it passes, this PR should become the sole canonical T2424-0023 review path and #196/#198 should be closed as superseded duplicates.

## Claim boundary

Synthetic fixture/evaluation mechanics only. No real-model, translation-quality, language-fairness, causal, publication, production or research-complete claim.
