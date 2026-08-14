# EXPERIMENT_LEDGER

**As of:** 2026-08-14 12:01 IST plus NeuroCAD pre-output freeze update. Frozen outcomes are immutable; protocol changes create a new experiment version.

| Experiment | Protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | ARC validation, seeds 1–5, 20 epochs; artifact `9162165932` | full `0.254915±0.012997`; matched supervised `0.266441±0.015460`; planner/target effects unsupported | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| IRIS v0.2 stress | development stress seeds; frozen successor threshold >=10% | ~5.33–5.36% abrupt-regime improvement; PCRW not cleanly above Huber | **PROMOTION GATE FAILED** |
| T2424-0025 robust readouts | retained noisy-memory screen and contamination study; current focused checks `10/10` | robust aggregation effect reproduced, including material clean-control benefit | **POSITIVE ROBUSTNESS / UNIQUE-MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049-parameter B0/B1/B2/B3, 3 paired seeds | B3-B2 `+0.4946%±1.5472%` vs >=5% FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3% FAIL; clean gate PASS | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| NeuroCAD v1 | 20 held-out prompts, deterministic, OpenSCAD; current focused checks `6/6` | typed/validated 19/20 vs direct 12/20; 12/12 valid STL | **CONTROLLED GATE PASS** |
| **NeuroCAD v2 learned/OOD** | `LEARNED_OOD_PROTOCOL_V2.md`; arms, primary metric, falsifier, budget/coverage rules and statistics specified | no outputs; provider/model/settings and ≥80-case hashed prompt manifest intentionally unset | **PREOUTPUT FREEZE INCOMPLETE — RUN PROHIBITED** |
| Darcy T2424-0050 | 20-seed synthetic pressure-MAE screen; current focused checks `6/6` | `0.0658913916 → 0.0011366559`, 97.8766% improvement, flux error `1.369e-16` | **BOUNDED MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions plus salience dropout | benefit weakens/reverses under severe salience failure | **MIXED** |
| Eigen-JEPA real-market | retained Atlas primary covariance-matrix target | raw/log ridge remains stronger on primary metric | **MIXED/NEGATIVE** |
| NPMS controlled study | retained Atlas diagnostic plus learned companion evidence | controlled evidence reproduced; natural-task transfer unestablished | **CONTROLLED EVIDENCE** |
| T2424-0027 audit | deterministic 72-record synthetic protocol; current checks `8/8` + verifier | retained synthetic result verified | **SYNTHETIC AUDIT PASS** |
| T2424-1863 diffusion | frozen 20-seed synthetic screen; exact-head verification retained | predeclared >75% improvement gate remains failed | **NEGATIVE REPRODUCED** |
| Hercules matched-budget study | not yet frozen at scientific evidence level | no result | **YELLOW / NOT EXECUTED** |
| Olympus O1 | experiment design exists; empirical protocol not yet evidenced as executed | no result | **YELLOW / NOT EXECUTED** |

## NeuroCAD v2 authorization boundary

`NEUROCAD-EXP-001-v2` is **not** an executed or fully frozen experiment yet. Before any learned model output is viewed, all of the following must be committed and independently reviewed:

1. concrete provider/model/revision and decoding/settings block;
2. ≥80-case machine-readable benchmark spanning valid, invalid, linguistic OOD, compositional OOD and new part-family OOD;
3. prompt/schema/backend/retrieval manifests with SHA-256 hashes;
4. reviewer approval that the direct, constrained, retrieval and typed-IR arms are budget-matched and the falsifier is not goalpost-shifted.

Only after those conditions pass may `NEUROCAD-EXP-001-v2` move to `FROZEN_AUTHORIZED`. The current deterministic v1 result remains unchanged.

## Reproduction anchors

LAM artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`. Project 2424 canonical source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`, workflow `31618609967`, job `94295733785`, artifact `9162627168`, SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`. NGMT v0.1 retained artifacts `9166307730` and `9166406618` from unchanged-protocol evaluations.

## Freeze requirements

Before any new confirmatory experiment, record: candidate/version, question, hypothesis, baselines, data/split, seed policy, primary metric, effect statistic, advancement threshold, falsifier, analysis plan, compute budget and stop rule. Reserved data or seeds may not be used to rescue a failed development result.
