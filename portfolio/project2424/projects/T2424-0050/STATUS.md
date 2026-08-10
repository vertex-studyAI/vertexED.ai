# T2424-0050 Status

**Project:** Benchmark Augmentation Theory  
**Queue rank:** 43  
**Track:** B — Existing theory → minimum experiment  
**State:** VERIFYING  
**Claim level:** synthetic benchmark-ranking audit mechanism

## Implemented

- [x] deterministic shortcut benchmark
- [x] causal-signal model
- [x] shortcut model
- [x] label-preserving augmentation engine
- [x] label-change fail-closed check
- [x] shortcut-breaking perturbation
- [x] neutral augmentation control
- [x] base/augmented ranking comparison
- [x] runnable screen
- [x] focused regression suite

## Predeclared gate

- base accuracy gap <= 1 percentage point
- shortcut-breaking gap >= 90 percentage points
- neutral-control gap <= 1 percentage point

The deterministic construction clears those mechanics. Promote to `TESTED_TOOL` only after canonical GitHub Actions passes on the exact branch head.

## Not claimed

- semantic validity of arbitrary augmentations
- real-model robustness
- benchmark-validity theorem
- publication novelty
- research completion

## Next artifact

A human-reviewed real benchmark perturbation set with frozen invariance assumptions, several trained models, ranking-stability/error-slice analysis and independent semantic review.
