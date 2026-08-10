# T2424-0030 Status

**Project:** Adaptive Theory Geometry in World Models  
**Queue rank:** 23  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** synthetic geometry-aware forecasting prototype

## Implemented

- [x] Euclidean constant-velocity baseline
- [x] signed local-turn geometry estimator
- [x] bounded tangent/curvature mode selection
- [x] deterministic synthetic curved trajectories
- [x] straight-motion negative control
- [x] 20-seed experiment runner
- [x] focused regression suite
- [x] explicit claim boundary and next evidence gate

## Predeclared gate

- curved-suite relative improvement > 85%
- curved geometry selection rate > 95%
- straight-control absolute relative improvement < 1%

Reference deterministic output clears those mechanics, but promote to `TESTED_TOOL` only after canonical GitHub Actions passes on the exact branch head.

## Not claimed

- neural or learned world-model geometry
- long-horizon/general dynamical-system performance
- real scientific forecasting
- research completeness
- publication readiness

## Next artifact

A frozen noisy/regime-switching trajectory benchmark with stronger baselines, train-only threshold selection, multi-step rollouts and independent reproduction.
