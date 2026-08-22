# T2424-0050 Status

**Project:** Darcy Latent Operator  
**Queue rank:** 43  
**Track:** C — Existing work → minimum experiment  
**State:** REPRODUCED_BOUNDED / HARDER_AUDIT_MIXED / HOLD / MANUAL_MERGE_REQUIRED  
**Claim level:** bounded 1D reduced-resistance scientific-computing screen

## Identity and integration truth

The frozen First-100 queue assigns `T2424-0050` to **Darcy Latent Operator**. The repository previously placed Benchmark Augmentation Theory under that canonical ID; the repair preserved that audit under `portfolio/project2424/tools/benchmark-augmentation-theory/` and restored Darcy to the canonical path.

PR #253 was manually merged on 2026-08-12 as merge commit `e9a3ba189b5f25950f7d691ac5619c9196b70f91`. This status therefore replaces the older stale `LATEST_MAIN_REVALIDATION_PENDING` state.

## Implemented

- [x] positive-permeability input validation
- [x] steady 1D Darcy resistance solver
- [x] explicit constant-flux pressure reconstruction
- [x] harmonic block-resistance compression
- [x] 4× reduced latent representation (24 cells → 6 blocks)
- [x] linear-pressure no-heterogeneity baseline
- [x] deterministic heterogeneous field generator
- [x] 20-seed benchmark
- [x] uniform-permeability negative control
- [x] retained machine-readable result
- [x] six focused Darcy regression tests
- [x] harder misaligned/correlated-field audit
- [x] arithmetic-mean block ablation

## Fresh reproduction — 2026-08-22

Recovered from current repository `main` starting at `9cb6939711b82ef63c9bdd347863d74b71579d6f` and executed in a clean Linux x64 Node `v22.16.0` environment.

Commands:

```bash
node --test tests/project2424DarcyLatentOperator.test.mjs
node portfolio/project2424/projects/T2424-0050/experiment/run.mjs
```

Result:

- focused tests: **6/6 passed**;
- seeds: `20`;
- mean baseline pressure MAE: `0.06589139155637647`;
- mean latent pressure MAE: `0.0011366559231966065`;
- mean relative improvement: `0.9787663202281432`;
- mean flux relative error: `1.3693877541812723e-16`;
- max latent pressure MAE: `0.0014613491578162696`;
- uniform baseline MAE: `9.325873406851315e-17`;
- uniform latent MAE: `0`;
- verdict: `PASS_BOUNDED_DARCY_LATENT_SCREEN`.

The reproduced metrics match the retained reference exactly.

## Harder audit — 2026-08-22

New reproducible audit:

```bash
node portfolio/project2424/projects/T2424-0050/experiment/audit-misaligned.mjs
```

It evaluates 100 deterministic synthetic fields at each AR(1) log-permeability correlation `rho ∈ {0, 0.5, 0.9}` and compares:

- linear-pressure baseline;
- harmonic-mean block representation;
- arithmetic-mean block ablation.

Key results:

| rho | harmonic mean improvement vs linear | harmonic beats linear | harmonic beats arithmetic |
| ---: | ---: | ---: | ---: |
| 0.0 | `63.8317%` | `99/100` | `100/100` |
| 0.5 | `77.1634%` | `100/100` | `99/100` |
| 0.9 | `86.1675%` | `100/100` | `96/100` |

The IID/misaligned `rho=0` condition does **not** clear the original 65% improvement threshold (`63.8317%`), and seed `6` is a concrete negative case where harmonic MAE (`0.0296197289`) is worse than the linear baseline (`0.0269153129`). This threshold was predeclared for the easier block-structured screen, not for this harder audit, so the result is recorded as **mixed evidence**, not as a falsification of the bounded original claim.

Retained output: `results/misaligned-audit.json`.

## Evidence grade

- Before this run: **B** — strong bounded result with exact-head CI provenance, but stale registry state and an unexecuted harder robustness gate.
- After this run: **B** — bounded reproduction is clean and exact, and the harder ablation adds useful evidence, but the new audit is not yet canonical-CI-verified and broader generalization remains unresolved.
- Promotion to **A** requires canonical CI on this exact audit branch plus a frozen stronger benchmark that does not reuse the easy block-structured generator as the main evidence source.

## Claim supported

An explicit harmonic-resistance block representation is reproducible and substantially more accurate than a no-heterogeneity linear-pressure baseline on the original controlled 1D block-structured screen, while preserving flux to numerical precision.

## Claims rejected / not supported

- learned neural operator quality;
- FNO/DeepONet/PINN superiority;
- robust ≥65% improvement on arbitrary misaligned IID fields;
- multidimensional Darcy-flow performance;
- real porous-media validity;
- out-of-distribution generalization;
- publication novelty;
- research completion;
- `CERTIFIED_COMPLETE`.

## Verdict

**HOLD.** Keep the bounded mechanism result, retain the mixed harder audit, and do not promote it as an operator-learning result or paper result yet.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Next artifact

Freeze a true next-stage benchmark with 2D finite-volume Darcy data, train/validation/test separation, multiple permeability correlation lengths, harmonic/arithmetic/PCA-style reduced-order baselines, and a learned FNO or DeepONet comparator. Preserve negative cases without retuning them away.
