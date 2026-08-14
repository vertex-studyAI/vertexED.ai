# EXPERIMENT_LEDGER

**As of:** 2026-08-14 IST. Frozen outcomes are immutable; protocol changes create a new experiment/version. A serialization or infrastructure repair is recorded separately and cannot silently change scientific thresholds, raw results or claims.

| Experiment | Frozen protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | ARC validation, seeds 1–5, 20 epochs; artifact `9162165932` | full `0.254915±0.012997`; matched supervised `0.266441±0.015460`; planner/target effects unsupported | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| IRIS v0.2 stress | development stress; original successor threshold >=10% | ~5.33–5.36% abrupt-regime improvement; PCRW not cleanly above Huber; coherent bursts adverse | **PROMOTION GATE FAILED** |
| IRIS common adaptation v1 (`EXP-DEV-20260813`) | frozen-before-execution dev seeds `0–9`; five criteria; reserved confirmatory `1000–1029` untouched; bundle SHA `5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90` | passes clean non-inferiority, heavy-tail information gain, false-open guardrail; fails strong fixed-robust-control + persistent-shift; adverse mean MSE `0.059706` vs fixed-control mean `0.033502`; regime `TWMSE25 0.215731`, recovery `24` vs Huber `0.162633`, `18.5` | **NEGATIVE/INCONCLUSIVE DEVELOPMENT GATE REPRODUCED** |
| T2424-0025 robust readouts | retained noisy-memory screen + contamination study; focused checks `10/10` | robust aggregation effect reproduced, including material clean-control benefit | **POSITIVE ROBUSTNESS / UNIQUE MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049-param B0/B1/B2/B3; 3 paired seeds | B3-B2 `+0.4946%±1.5472%` vs >=5% FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3% FAIL; clean gate PASS | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| NeuroCAD v1 | 20 held-out prompts, deterministic OpenSCAD; focused checks `6/6` | typed/validated `19/20` vs direct `12/20`; `12/12` valid STL; negative-width failure retained | **CONTROLLED GATE PASS** |
| Darcy T2424-0050 | 20-seed synthetic pressure-MAE screen; focused checks `6/6` | `0.0658913916 → 0.0011366559`, 97.8766% reduction, flux error `1.369e-16` | **BOUNDED SYNTHETIC MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions + salience dropout | benefit weakens/reverses under severe salience failure | **MIXED / FAILURE BOUNDARY RETAINED** |
| APEN salience specificity v1 (`APEN-SALIENCE-SPECIFICITY-V1-20260813`) | prospective 16 paired delay/seed cells; protocol SHA `e9f523be2f54d40d34d03dafeb36d810500e40179aa907689353229ad72ef7ef`; bundle SHA `2c3003bb629ccb59aab572b172a2d7ffd0f6e9608630458fada9df661d6e66d7` | true salience rare MSE `17.1317456359` vs uniform `18.4124503259` (+6.9556%); shuffled salience erases `100.8%` of gain; distribution-matched random erases `121.0%`; raw/summary/verifier byte-identical replay | **BOUNDED MECHANISM ALIGNMENT SUPPORTED** |
| Eigen-JEPA real-market | retained frozen primary covariance-matrix MSE | earlier raw/log ridge competitive/stronger | **MIXED/NEGATIVE** |
| Eigen-JEPA classical baselines v1 (`EIGEN-JEPA-CLASSICAL-BASELINES-V1-20260813`) | frozen primary matrix MSE; protocol SHA `317fcedafa090ae3d8b8f33acb515ea58a1a75dfd287b0815e387e163d682c20`; bundle SHA `cfe6de9965e3f89bdc3f3451023c1e7606093c4fddc7c4e92d7e6656148e6484` | Eigen `5.8318225647e-09`; spectral eigval ridge `5.4992288087e-09`; raw/log/raw-PCA ridge also lower; exact replay; row provenance `14,895` parsed vs `14,899` old spec | **STRONGER-BASELINE NEGATIVE / NON-SUPERIOR REPRODUCED** |
| NPMS controlled study | retained Atlas diagnostic + learned companion | controlled evidence reproduced; natural-task transfer unestablished | **CONTROLLED EVIDENCE** |
| NPMS invariant-parameter control v1 (`NPMS-INVARIANT-PARAMETER-CONTROL-V1-20260813`) | same leave-one-base-reservoir-out split; protocol SHA `c983e33eb29c5bf0ae7c0fd6e482d5b24bc1e88dd68b3afc417cf2bc42bd1954`; bundle SHA `ad765e342e524c17eb8e93ba1c4098ee07c85f009d94a23151ea263b335e29c2` | NPMS `0.928571`; invariant parameter summary `0.892857`; 3.571-point gap misses frozen 5-point uniqueness rule; exact replay | **PARAMETER-CONFOUNDED / NON-UNIQUE HEADLINE** |
| T2424-0027 audit | deterministic 72-record synthetic protocol; checks `8/8` + verifier | synthetic injected-coordinate audit verified | **SYNTHETIC AUDIT PASS** |
| T2424-1863 diffusion | frozen 20-seed synthetic screen; exact-head verification | predeclared >75% improvement gate remains failed; zero-diffusion control no rescue | **NEGATIVE REPRODUCED** |
| Hercules matched-budget study | not frozen at scientific evidence level | no result | **YELLOW / NOT EXECUTED** |
| Olympus O1 | design concept exists; empirical protocol not evidenced as executed | no result | **YELLOW / NOT EXECUTED** |

## Reproduction anchors

- LAM artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`.
- Project 2424 canonical source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`, workflow `31618609967`, job `94295733785`, artifact `9162627168`, SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`.
- NGMT v0.1 retained artifacts `9166307730` and `9166406618` from unchanged-protocol evaluations.
- IRIS/APEN/Eigen-JEPA/NPMS post-closeout bundle hashes are recorded in their rows and retained in the Library checkpoint.

## Repair boundary

IRIS common-adaptation attempt 1 wrote raw/summary output before failing JSON serialization on `numpy.bool_`. The minimal native-bool repair left raw/summary artifacts byte-identical. This is an implementation serialization repair, not evidence for a changed scientific result.

## Freeze requirements

Before any new confirmatory experiment, record: candidate/version, precise question, falsifiable hypothesis, mechanism, novelty boundary, dangerous baselines, data/split, seed policy, primary metric, effect statistic, advancement threshold, falsifier, analysis plan, compute budget and stop rule. Reserved data/seeds may not be opened to rescue a failed development result.