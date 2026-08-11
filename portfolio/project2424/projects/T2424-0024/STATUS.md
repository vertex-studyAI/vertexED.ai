# T2424-0024 Status

**Project:** Trust Under Uncertainty  
**Project 2424 ID:** `T2424-0024`  
**Frozen queue rank:** 17  
**Track:** C — Protocol / evaluation package  
**State:** `VERIFYING`  
**Claim level:** uncertainty/calibration evaluator + paired synthetic control

## Implemented

- [x] queue identity resolved against `FIRST_100_QUEUE.ndjson`
- [x] canonical `projects/T2424-0024` package restored from prior tested work
- [x] prediction validation
- [x] Brier score
- [x] calibration bins
- [x] expected calibration error
- [x] confidence-ranked risk–coverage curve
- [x] selective risk at target coverage
- [x] abstention report
- [x] paired moderate/overconfident deterministic controls
- [x] runnable minimum experiment
- [x] focused regression suite
- [x] frozen claim and protocol
- [x] retained deterministic result summary
- [x] explicit baseline, ablation and verdict records
- [ ] exact-head canonical GitHub Actions verification on this recovery branch
- [ ] independent clean-checkout QA
- [ ] real-model held-out benchmark evidence

## Nine-gate certification state

1. immutable source identity: **pending exact-head PR SHA**
2. falsifiable claim: **present**
3. frozen protocol: **present**
4. clean runnable command: **present**
5. baseline evidence: **present, synthetic**
6. raw result artifacts: **retained deterministic JSON summary; not external raw predictions**
7. ablation/negative-result analysis: **present, limited**
8. explicit verdict: **present**
9. independent QA/reproduction: **pending**

Therefore this project is **not Certified complete**.

## Promotion rule

Promote to `TESTED_TOOL` only after canonical GitHub Actions passes on the exact recovery head. Do not promote to `CERTIFICATION_PENDING` until independent QA exists and the raw-artifact boundary is strengthened.

## Not claimed

- model trustworthiness;
- calibrated real-world deployment;
- uncertainty quality on external data;
- optimal abstention threshold;
- publication novelty;
- research completion.
