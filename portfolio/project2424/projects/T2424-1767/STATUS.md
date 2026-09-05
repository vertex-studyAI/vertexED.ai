# T2424-1767 Status

## Current state

`CI_VERIFIED_SOFTWARE_SMOKE / SCIENTIFIC_VALIDATION_PENDING`

## Substance present

- [x] working resource-bounded routing implementation
- [x] documented public interface
- [x] deterministic synthetic benchmark
- [x] root-level regression tests
- [x] reproducible local commands
- [x] limitations and claim boundary
- [x] exact-head Project 2424 reproducibility workflow passed
- [x] exact-head canonical repository CI passed
- [x] raw benchmark output retained in a digest-bound Actions artifact
- [ ] real Scientific-ML workload benchmark
- [ ] measured wall-clock / memory resource model
- [ ] matched strong baselines on real workloads
- [ ] independent scientific reproduction

## Exact-head verification — 2026-08-29

Execution commit: `9b1b333b567b66587e1a3778bacaf906869755a1`  
Research reproducibility Actions run: `33256768781` — **SUCCESS**  
Canonical CI Actions run: `33256778805` — **SUCCESS**  
Evidence artifact: `9716038865` (`research-repro-wave-20260813-current-main`)  
Artifact digest: `sha256:bebc6f818f904529099607b1f228228375bb455a478ba846ac163434c945cfa8`  
Raw T2424-1767 result digest: `sha256:7628d160c05e529e84b58e885087947b2912f12e964b3da3dd0bba6d370a698e`  
Environment: Ubuntu 24.04 hosted runner, x86_64, Node `v22.23.2`, npm `10.9.8`, 4 logical CPUs.

Focused root tests passed `6/6`.

### Frozen smoke frontier

| Budget | Mean absolute error | Average cost | Exhausted rate |
| ---: | ---: | ---: | ---: |
| 1 | 0.6834355590 | 1.0000000000 | 0 |
| 2 | 0.3854328416 | 1.6273291925 | 0 |
| 4 | 0.0248119159 | 3.3726708075 | 0 |
| 7 | 0.0332456763 | 4.1180124224 | 0 |
| full uniform ensemble | 0.8473486025 | 7.0000000000 | 0 |

The best frozen smoke point is budget 4, not the largest budget. That non-monotonic frontier is preserved as observed and must not be rewritten into a generic "more compute is better" claim.

## Completion boundary

This package can now count as an exact-head **CI-verified software/tool prototype with a retained deterministic smoke benchmark**. It must not count as a validated Scientific-ML research result until a real workload, measured resource costs, frozen matched baselines, retained external experiment evidence, and independent reproduction exist.

## Claim boundary

The frozen benchmark is a deterministic synthetic three-regime scalar task. It supports only the claim that the current implementation can enforce hard routing budgets and produce a finite resource/error frontier on that fixture. It does **not** establish Scientific-ML performance, novelty, learned routing superiority, real-world efficiency, or publication readiness.

## Next scientific gate

Before outcome access on a real workload, freeze:

1. workload/dataset identity and hashes;
2. train/validation/test or evaluation split;
3. full-compute, static-mixture, top-k, and resource-aware matched baselines;
4. wall-clock, memory, FLOP/token/resource accounting method;
5. seeds, metrics, uncertainty statistic and success/falsification criteria;
6. environment/model/hardware budget;
7. artifact paths and execution authorization.

Do not promote the smoke result beyond this boundary.