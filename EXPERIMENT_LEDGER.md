# EXPERIMENT_LEDGER

**As of:** 2026-08-14 12:30 IST. Frozen outcomes are immutable; protocol changes create a new experiment version.

| Experiment | Protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | ARC validation, seeds 1–5, 20 epochs; artifact `9162165932` | full `0.254915±0.012997`; matched supervised `0.266441±0.015460`; planner/target effects unsupported | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| IRIS v0.2 stress | development stress seeds; frozen successor threshold >=10% | ~5.33–5.36% abrupt-regime improvement; PCRW not cleanly above Huber | **PROMOTION GATE FAILED** |
| T2424-0025 robust readouts | retained noisy-memory screen and contamination study; current focused checks `10/10` | robust aggregation effect reproduced, including material clean-control benefit | **POSITIVE ROBUSTNESS / UNIQUE-MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049-parameter B0/B1/B2/B3, 3 paired seeds | B3-B2 `+0.4946%±1.5472%` vs >=5% FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3% FAIL; clean gate PASS | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| NeuroCAD v1 | 20 held-out prompts, deterministic, OpenSCAD; current focused checks `6/6` | typed/validated 19/20 vs original direct 12/20; 12/12 valid STL | **CONTROLLED GATE PASS — HISTORICAL RESULT PRESERVED** |
| **NeuroCAD validation-confound v2** | frozen component diagnostic on reused 20-case plate benchmark; run `31777954088`; artifact `9210587354`; SHA-256 `b05fac...985d5c` | current typed+validated `1.000`; original direct `0.600`; direct+matched-validation `1.000`; recovery fraction `1.000`; remaining gap `0.000` | **VALIDATION_DOMINANT — TYPED/PARSER MECHANISM INTERPRETATION FALSIFIED ON THIS BENCHMARK** |
| Darcy T2424-0050 | 20-seed synthetic pressure-MAE screen; current focused checks `6/6` | `0.0658913916 → 0.0011366559`, 97.8766% improvement, flux error `1.369e-16` | **BOUNDED MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions plus salience dropout | benefit weakens/reverses under severe salience failure | **MIXED** |
| Eigen-JEPA real-market | retained Atlas primary covariance-matrix target | raw/log ridge remains stronger on primary metric | **MIXED/NEGATIVE** |
| NPMS controlled study | retained Atlas diagnostic plus learned companion evidence | controlled evidence reproduced; natural-task transfer unestablished | **CONTROLLED EVIDENCE** |
| T2424-0027 audit | deterministic 72-record synthetic protocol; current checks `8/8` + verifier | retained synthetic result verified | **SYNTHETIC AUDIT PASS** |
| T2424-1863 diffusion | frozen 20-seed synthetic screen; exact-head verification retained | predeclared >75% improvement gate remains failed | **NEGATIVE REPRODUCED** |
| Hercules matched-budget study | not yet frozen at scientific evidence level | no result | **YELLOW / NOT EXECUTED** |
| Olympus O1 | experiment design exists; empirical protocol not yet evidenced as executed | no result | **YELLOW / NOT EXECUTED** |

## NeuroCAD interpretation boundary

The v2 diagnostic was frozen specifically to test whether validation alone explained the old typed-versus-direct gap. It met the `VALIDATION_DOMINANT` criterion decisively. Therefore the v1 `19/20` versus `12/20` comparison remains a valid historical controlled result but **cannot now support a typed-IR/parser mechanism claim**. NeuroCAD retains bounded software/reliability value. A broader research mechanism question requires a separately frozen same-provider learned direct/constrained/retrieval comparison on genuinely new part families/compositions; no v2 retuning is authorized.

## Reproduction anchors

LAM artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`. Project 2424 canonical source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`, workflow `31618609967`, job `94295733785`, artifact `9162627168`, SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`. NGMT v0.1 retained artifacts `9166307730` and `9166406618`. NeuroCAD validation-confound run `31777954088`, artifact `9210587354`, SHA-256 `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`.

## Freeze requirements

Before any new confirmatory experiment, record: candidate/version, question, hypothesis, baselines, data/split, seed policy, primary metric, effect statistic, advancement threshold, falsifier, analysis plan, compute budget and stop rule. Reserved data or seeds may not be used to rescue a failed development result.
