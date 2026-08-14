# EXPERIMENT_LEDGER

**As of:** 2026-08-14 reconciliation. Frozen outcomes are immutable; protocol changes create a new version. Machine-readable authority: `EXPERIMENT_LEDGER.json`. Compatibility entrypoint: `EXPERIMENT_REGISTRY.md/json`.

| Experiment | Protocol / evidence | Outcome | Scientific status |
|---|---|---|---|
| LAM-JEPA ARC v3 | seeds 1–5 × 20 epochs; artifact `9162165932`, SHA256 `caa898…c30b`; independent 2026-08-14 row-level re-audit | full `0.254915±0.012997`; no_planner `0.250169±0.012997`; no_target `0.261695±0.020395`; shuffled `0.263051±0.014501`; mechanism criteria fail | **NEGATIVE/INCONCLUSIVE REPRODUCED**; stale raw claim-boundary sentence retained as reporting-metadata defect; supervised arm is separate lineage |
| IRIS v0.2 stress | development/stress; successor threshold `>=10%` | ~`5.33–5.36%`; Huber not cleanly beaten | **PROMOTION GATE FAILED** |
| IRIS common-adaptation v1 | development seeds `0–9`; confirmatory `1000–1029` untouched; bundle `5643b59e…` | PABIM adverse MSE `0.059706` vs best fixed `0.033502`; regime `TWMSE25 0.215731` / recovery `24` vs confirmed Huber `0.162633` / `18.5` | **NEGATIVE DEVELOPMENT GATE** |
| NeuroCAD v1 | historical 20-case artifact `9165650301`, SHA256 `753a394d…`; independent audit recomputed row-level metrics and STL files | `19/20` vs direct `12/20`; `12/12` valid non-empty STL; O018 preserved | **CONTROLLED SOFTWARE GATE PASS — HISTORICAL** |
| NeuroCAD component v2 | frozen-before-run reused diagnostic; commit `2cd90f30…`; workflow `31777954088`; artifact `9210587354`, SHA256 `b05fac…95d5c` | M2 `1.00`; B0 `0.60`; B1 direct+validation `1.00`; recovery fraction `1.00`; remaining gap `0` | **NEGATIVE MECHANISM RESULT — VALIDATION_DOMINANT**; typed-parser causal advantage falsified on diagnostic |
| T2424-0025 | robust-readout screen | effect reproduces but mechanism not unique | **POSITIVE ROBUSTNESS / MECHANISM NOT ISOLATED** |
| NGMT v0.1 | equal 6,049 params/arm, 3 paired seeds; retained artifacts `9166307730`, `9166406618` | B3-B2 `+0.4946%±1.5472%` vs >=5 FAIL; B3-B1 `+0.4393%±1.1529%` vs >=3 FAIL; clean PASS | **NEGATIVE REPRODUCED** |
| Darcy T2424-0050 | 20-seed aligned synthetic screen | `0.0658913916→0.0011366559`; 97.8766%; flux `1.369e-16` | **BOUNDED MECHANISM PASS** |
| APEN salience stress | 48 paired controlled conditions | benefit weakens/reverses under severe dropout | **MIXED** |
| APEN salience specificity v1 | prospective 16-cell synthetic ablation; bundle `2c3003bb…` | rare MSE `17.131746` vs uniform `18.412450`; shuffled/random salience erase >100% of measured gain | **BOUNDED ALIGNMENT-SPECIFICITY PASS; ARCHITECTURE SUPERIORITY NOT ESTABLISHED** |
| Eigen-JEPA classical-baseline v1 | frozen primary covariance-matrix MSE; bundle `cfe6de99…`; 111 test samples | Eigen `5.8318e-09`; spectral ridge `5.4992e-09`; raw/log/raw-PCA ridge also lower mean point estimates | **BASELINE-DOMINATED / NON-SUPERIOR**; `14,895` vs old `14,899` row provenance retained |
| NPMS invariant-parameter control | 112 evaluations; bundle `ad765e34…`; frozen 5-pp uniqueness gate | NPMS `92.86%`; invariant parameters `89.29%`; difference `3.57` pp | **UNIQUENESS GATE FAILED / CONFOUNDED**; coordinate invariance retained |
| T2424-0027 | deterministic 72-record synthetic audit | `8/8` + independent verifier | **SYNTHETIC AUDIT PASS** |
| T2424-1863 | frozen 20-seed synthetic screen; workflow `31659932936`, canonical CI `31659932951` | >75% gate fails | **NEGATIVE REPRODUCED** |
| Project 2424 selected canonical reproduction | source `bd2a4d3…`; workflow `31618609967`; artifact `9162627168`, SHA256 `d9d1816d…` | scientific-value agreement for selected reproduction | **SELECTED REPRODUCTION ANCHOR; NOT PORTFOLIO COMPLETION** |
| Hercules matched-budget | not frozen/executed | none | **YELLOW / ARCHIVE ACTIVE COMPUTE** |
| Olympus O1 | not evidenced as executed | none | **YELLOW / ARCHIVE ACTIVE COMPUTE** |

## Version law

NeuroCAD v1 and v2 illustrate the rule: v1 remains an immutable historical result; v2 does not rewrite it, but the matched-validation ablation falsifies the typed-parser causal interpretation on the reused diagnostic. New scientific work requires a genuinely new benchmark rather than same-case rescue.

Likewise, the IRIS common-adaptation gate and NGMT v0.1 are negative results. A changed architecture or protocol must receive a new version and a new frozen hypothesis.

## Provenance law

Before a manuscript result is `GREEN — REPRODUCIBILITY`, resolve:

`claim -> table/figure -> processed artifact -> raw artifact -> frozen config -> code commit -> exact command`

Missing links remain explicit. Reserved data/seeds may not rescue a failed development result.