# EXPERIMENT_REGISTRY

**As of:** 2026-08-14 IST  
**Role:** machine/human-readable protocol lineage companion to `EXPERIMENT_LEDGER.md`. Frozen outcomes and failed attempts remain immutable. Any material change to a method, baseline family, data/split, metric hierarchy, threshold, seed policy, or falsifier creates a new experiment version.

| Experiment ID | Project | Protocol state | Outcome | Scientific state | Next allowed action |
|---|---|---|---|---|---|
| `LAM-ARC-V3` | LAM-JEPA | **FROZEN + REPRODUCED** | Full `0.254915±0.012997`; supervised `0.266441±0.015460`; no-planner `0.250169±0.012997`; no-target `0.261695±0.020395` | **NEGATIVE / INCONCLUSIVE** | Paper/reproducibility closure only; locked ARC test stays closed |
| `IRIS-V02-STRESS` | IRIS v0.2 | **FROZEN DEVELOPMENT + REPRODUCED** | abrupt-regime gain about `5.33–5.36%` vs frozen `>=10%`; Huber/static controls not cleanly beaten; coherent bursts adverse | **PROMOTION GATE FAILED** | Preserve package; no in-place rescue |
| `IRIS-BASELINE-AUDIT-20260814` | IRIS | **DEVELOPMENT AUDIT COMPLETE** | robust CUSUM-style switch can recover abrupt changes quickly but false-opens aggressively; confirmed-change Huber improves abrupt behavior without universal heavy-tail dominance | **MIXED / BASELINE FRONTIER NOT YET FROZEN** | Only a separately frozen false-open-constrained baseline-frontier protocol may run later; no successor architecture authorized |
| `T2424-0025-ROBUST-READOUT` | T2424-0025 | **FROZEN + REPRODUCED** | robust aggregation effect reproduces; material clean-control benefit means unique mechanism is not isolated | **POSITIVE PRECURSOR / NON-UNIQUE** | Do not relabel as NGMT; learned sequence question must be separate |
| `NGMT-V01-B0-B3` | NGMT v0.1 | **FROZEN + REPRODUCED** | B3-B2 `+0.4946%±1.5472%` vs `>=5%` FAIL; B3-B1 `+0.4393%±1.1529%` vs `>=3%` FAIL; clean gate PASS | **NEGATIVE** | No v0.1 retuning; any successor is a new version |
| `NEUROCAD-V1` | NeuroCAD | **FROZEN + REPRODUCED** | typed/validated `19/20` vs direct `12/20`; `12/12` valid cases generate non-empty STL; one frozen negative-width failure retained | **CONTROLLED GATE PASS** | Freeze same-provider/direct/validator/OOD V2 before any model outputs |
| `DARCY-T2424-0050-V1` | Darcy | **FROZEN + REPRODUCED** | pressure MAE `0.0658913916 → 0.0011366559` across 20 seeds; flux error `1.369e-16` | **BOUNDED SYNTHETIC PASS** | Learned matched-budget + misaligned/OOD physical protocol only |
| `APEN-SALIENCE-STRESS` | APEN | **REPRODUCED CONTROLLED** | benefit weakens/reverses under severe salience failure | **MIXED** | Matched learned/naturalistic salience study must be separately frozen |
| `EIGEN-JEPA-REAL-MARKET` | Eigen-JEPA | **REPRODUCED PRIMARY TARGET** | raw/log ridge remains stronger on retained primary covariance-matrix target | **MIXED / NEGATIVE** | Stronger spectral controls and multi-dataset metric hierarchy must be frozen before new evaluation |
| `NPMS-CONTROLLED` | NPMS | **REPRODUCED CONTROLLED** | controlled diagnostic and learned companion evidence reproduce; causal/natural/OOD transfer unestablished | **CONTROLLED EVIDENCE ONLY** | Strong learned controls + natural/OOD task under new protocol |
| `T2424-0027-AUDIT` | T2424-0027 | **FROZEN + VERIFIED** | 72-record synthetic audit; focused checks `8/8` + independent verifier | **SYNTHETIC AUDIT PASS** | Real multilingual encoder protocol only |
| `T2424-1863-DIFFUSION` | T2424-1863 | **FROZEN + EXACT-HEAD REPRODUCED** | predeclared `>75%` improvement gate fails | **NEGATIVE** | Current version closed; real PDE/learned operator is a new experiment |
| `HERCULES-MATCHED-BUDGET` | Hercules | **NOT FROZEN / NOT RUN** | none | **UNTESTED** | No active compute until one bounded matched-budget protocol is frozen |
| `OLYMPUS-O1` | Olympus | **NOT RUN** | none | **UNTESTED** | No active compute until matched-provider monolithic/decomposition/ablation protocol is frozen |

## IRIS successor boundary

The 2026-08-14 successor decision closes unfrozen architecture search. The next eligible development unit, only if higher-priority closure work leaves capacity, is a **baseline-frontier protocol** that predeclares a false-open budget or frozen false-open/recovery Pareto analysis before outputs are viewed. Reserved confirmatory seeds `1000–1029` remain quarantined.

## Failed-run preservation

A software/reporting failure does not authorize deleting the attempt. Preserve its logs/artifacts, record whether the scientific outputs were valid or invalid, and distinguish a minimal plumbing repair from a scientific protocol change. If a scientific gate fails, the failed protocol remains addressable forever; a successor receives a new experiment ID.

## Freeze contract

Before confirmatory or final evaluation, register: `experiment_id`, version, question, hypothesis, mechanism, baseline family, data/split/version, seeds, primary metric, aggregation/effect statistic, threshold, falsifier, analysis code/hash, compute budget, stop rule, and any reserved-data policy.

No final/test data or reserved seeds may be used to choose the method that will later be evaluated on them.