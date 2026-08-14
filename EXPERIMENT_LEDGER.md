# EXPERIMENT_LEDGER

**As of:** 2026-08-14. Frozen outcomes are immutable; protocol changes create a new version.

| Experiment | Protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | seeds 1–5, 20 epochs; artifact `9162165932` | full `0.254915±0.012997`; matched `0.266441±0.015460`; planner/target unsupported | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| IRIS v0.2 stress | development/stress; successor threshold `>=10%` | ~`5.33–5.36%`; Huber not cleanly beaten | **PROMOTION GATE FAILED** |
| NeuroCAD v1 | frozen 20-case historical benchmark | `19/20` vs direct `12/20`; 12/12 valid STL; O018 failure retained | **CONTROLLED SOFTWARE GATE PASS — HISTORICAL** |
| NeuroCAD component v2 | frozen-before-run reused 20-case component diagnostic; commit `2cd90f30...`; workflow `31777954088`; artifact `9210587354`, SHA256 `b05fac...95d5c` | M2 `1.00`; B0 `0.60`; B1 direct+validation `1.00`; recovery fraction `1.00`; remaining gap `0` | **NEGATIVE MECHANISM RESULT — VALIDATION_DOMINANT** |
| T2424-0025 | robust-readout screen | effect reproduces but mechanism not unique | **POSITIVE ROBUSTNESS / MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049 params/arm, 3 paired seeds | B3-B2 `+0.4946%±1.5472%` vs >=5 FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3 FAIL; clean PASS | **NEGATIVE REPRODUCED** |
| Darcy T2424-0050 | 20-seed aligned synthetic screen | `0.0658913916→0.0011366559`; 97.8766%; flux `1.369e-16` | **BOUNDED MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions | benefit weakens/reverses under severe dropout | **MIXED** |
| Eigen-JEPA real-market | primary covariance target | raw/log ridge remains stronger | **MIXED/NEGATIVE** |
| NPMS controlled | diagnostic + learned companion | controlled evidence reproduces | **CONTROLLED** |
| T2424-0027 | deterministic 72-record synthetic audit | `8/8` + verifier | **SYNTHETIC AUDIT PASS** |
| T2424-1863 | frozen 20-seed synthetic screen | >75% gate fails | **NEGATIVE REPRODUCED** |
| Hercules matched-budget | not frozen/executed | none | **YELLOW** |
| Olympus O1 | not evidenced as executed | none | **YELLOW** |

## NeuroCAD v2 interpretation boundary

The v2 component diagnostic reuses the old 20 cases and evaluates the **current repaired implementation**, so it is not a new held-out/OOD generalization result. Its purpose is causal diagnosis. Because matched validation completely closes the direct-baseline gap, the typed-parser causal interpretation is falsified on this diagnostic. The frozen v1 history is not rewritten.

## Freeze requirements

Before any confirmatory/new scientific experiment, record candidate/version, question, hypothesis, dangerous baselines, data/split, seed/determinism policy, primary statistic, threshold, falsifier, analysis plan, compute/cost budget and stop rule. Reserved data/seeds may not rescue failed development results.
