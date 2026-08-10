# T2424-0024 Status

**Project:** Trust Under Uncertainty  
**Project 2424 ID:** T2424-0024  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** uncertainty/calibration evaluator + synthetic paired control

## Implemented

- [x] prediction validation
- [x] Brier score
- [x] calibration bins
- [x] expected calibration error
- [x] confidence-ranked risk–coverage curve
- [x] selective risk at target coverage
- [x] abstention report
- [x] paired moderate/overconfident synthetic controls
- [x] runnable deterministic experiment
- [x] regression suite
- [x] metric documentation and limitations

## Evidence gate

Promote to `TESTED_MINIMUM_EXPERIMENT` only after canonical GitHub Actions succeeds on the exact branch head.

## Not claimed

- model trustworthiness
- calibrated real-world deployment
- uncertainty quality on external data
- optimal abstention threshold
- publication novelty

## Next artifact

Freeze real held-out prediction records, add uncertainty intervals and subgroup slices, and compare against a separately fit calibration baseline without tuning on final test labels.
