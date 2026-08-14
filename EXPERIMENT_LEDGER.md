# EXPERIMENT_LEDGER

**As of:** 2026-08-14 reconciliation. Frozen outcomes are immutable; protocol changes create a new experiment version.

| Experiment | Protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | ARC validation, seeds 1–5, 20 epochs; primary artifact `9162165932`; independent attempt-4 audit artifact `9163503934` | full `0.254915±0.012997`; matched supervised `0.266441±0.015460`; planner/target effects unsupported; locked test unused | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| IRIS v0.2 stress | development stress seeds; frozen successor threshold >=10% | ~5.33–5.36% abrupt-regime improvement; PCRW not cleanly above Huber | **PROMOTION GATE FAILED** |
| IRIS common-adaptation harness v1 | development seeds `0–9`; confirmatory `1000–1029` reserved/untouched; bundle `5643b59e…` | PABIM adverse MSE `0.059706` vs best fixed `0.033502`; regime `TWMSE25 0.215731` / recovery `24` vs confirmed Huber `0.162633` / `18.5` | **NEGATIVE DEVELOPMENT GATE; SUCCESSOR ARCHITECTURE NOT AUTHORIZED** |
| T2424-0025 robust readouts | retained noisy-memory screen and contamination study; current focused checks `10/10` | robust aggregation effect reproduced, including material clean-control benefit | **POSITIVE ROBUSTNESS / UNIQUE-MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049-parameter B0/B1/B2/B3, 3 paired seeds | B3-B2 `+0.4946%±1.5472%` vs >=5% FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3% FAIL; clean gate PASS | **NEGATIVE/INCONCLUSIVE REPRODUCED** |
| NeuroCAD v1 | 20 held-out prompts, deterministic, OpenSCAD; current focused checks `6/6` | typed/validated 19/20 vs direct 12/20; 12/12 valid STL; retained negative-width failure | **CONTROLLED GATE PASS** |
| Darcy T2424-0050 | 20-seed synthetic pressure-MAE screen; current focused checks `6/6` | `0.0658913916 → 0.0011366559`, 97.8766% improvement, flux error `1.369e-16` | **BOUNDED MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions plus salience dropout | benefit weakens/reverses under severe salience failure | **MIXED** |
| APEN salience-specificity v1 | prospective 16-cell synthetic ablation; bundle `2c3003bb…` | rare-event MSE `17.131746` vs uniform `18.412450`; shuffled/randomized salience erase more than the measured gain | **BOUNDED ALIGNMENT-SPECIFICITY PASS; ARCHITECTURE SUPERIORITY NOT ESTABLISHED** |
| Eigen-JEPA classical-baseline v1 | frozen primary covariance-matrix MSE; bundle `cfe6de99…`; 111 test samples | Eigen-JEPA `5.8318e-09`; spectral eigenvalue ridge `5.4992e-09`; raw/log/raw-PCA ridge also lower mean point estimates | **BASELINE-DOMINATED / NON-SUPERIOR** |
| NPMS invariant-parameter control v1 | 112 evaluations; bundle `ad765e34…`; frozen 5-point uniqueness gate | NPMS `92.86%`; invariant-parameter summary `89.29%`; only `3.57` pp difference | **UNIQUENESS GATE FAILED / CONFOUNDED; COORDINATE INVARIANCE RETAINED** |
| T2424-0027 audit | deterministic 72-record synthetic protocol; current checks `8/8` + verifier | retained synthetic result verified | **SYNTHETIC AUDIT PASS** |
| T2424-1863 diffusion | frozen 20-seed synthetic screen; exact-head verification retained | predeclared >75% improvement gate remains failed | **NEGATIVE REPRODUCED** |
| Project 2424 canonical reproduction | source `bd2a4d3…`; workflow `31618609967`; artifact `9162627168` | scientific-value agreement retained; no claim of latest byte identity | **SELECTED REPRODUCTION ANCHOR** |
| Hercules matched-budget study | not yet frozen at scientific evidence level | no result | **YELLOW / NOT EXECUTED** |
| Olympus O1 | experiment design exists; empirical protocol not yet evidenced as executed | no result | **YELLOW / NOT EXECUTED** |

## Reproduction anchors

- LAM primary artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`.
- LAM independent audit artifact `9163503934`, SHA-256 `14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`.
- Project 2424 canonical source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`, workflow `31618609967`, job `94295733785`, artifact `9162627168`, SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`.
- NGMT v0.1 retained artifacts `9166307730` and `9166406618` from unchanged-protocol evaluations.
- IRIS common-adaptation bundle SHA-256 `5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90`.
- APEN specificity bundle SHA-256 `2c3003bb629ccb59aab572b172a2d7ffd0f6e9608630458fada9df661d6e66d7`.
- Eigen-JEPA baseline bundle SHA-256 `cfe6de9965e3f89bdc3f3451023c1e7606093c4fddc7c4e92d7e6656148e6484`.
- NPMS control bundle SHA-256 `ad765e342e524c17eb8e93ba1c4098ee07c85f009d94a23151ea263b335e29c2`.

## Provenance completion law

Before a manuscript result is reproducibility GREEN, the canonical ledger must be able to trace:

`claim -> table/figure -> processed artifact -> raw artifact -> frozen config -> code commit -> exact command`

Missing links are recorded as gaps; they are never reconstructed from memory or filled with plausible-looking placeholders.

## Freeze requirements

Before any new confirmatory experiment, record: candidate/version, question, hypothesis, baselines, data/split, seed policy, primary metric, effect statistic, advancement threshold, falsifier, analysis plan, compute budget and stop rule. Reserved data or seeds may not be used to rescue a failed development result.