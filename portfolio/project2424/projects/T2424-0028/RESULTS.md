# T2424-0028 — Reproducibility results

**Experiment:** Residual Event Tokenization  
**Evidence date:** 2026-08-13  
**Scientific execution commit:** `4eb3fed7f582428c389a66dd388c241d8a152e8e`  
**GitHub Actions run:** `31656575356`  
**Artifact:** `9164597422` (`sha256:252392c0447a443b9c75b5926c80403ddded48ef7465a829fe4001ba27cae15e`)  
**Environment:** Ubuntu 24.04 Azure runner, x86_64, Node `v22.23.1`, Linux `6.17.0-1020-azure`

## Hypothesis and frozen gate

Residual-triggered event tokenization should enforce the configured reconstruction-error bound. On a clean linear control, the linear predictor should require exactly two events and use more than 10x fewer events than zero-order hold.

The frozen protocol requires, for both `linear` and `hold` modes at thresholds `0.1, 0.25, 0.5, 1, 2`, maximum absolute reconstruction error `< threshold + 1e-12`. The experiment is deterministic and has no RNG seed.

## Fresh result

The frozen experiment and all focused regression tests passed without changing the algorithm, thresholds, fixture, or interpretation rule.

Primary defect-series result (`linear`, threshold `0.5`, 120 observations):

| Metric | Result |
|---|---:|
| Events | 8 |
| Event ratio | 0.0666667 |
| Event-count compression factor | 15.0x |
| MAE | 0.1728129 |
| RMSE | 0.2232590 |
| Max absolute error | 0.4885705 |
| Frozen bound | < 0.5 |

### Threshold sweep

| Threshold | Linear events | Linear max error | Hold events | Hold max error |
|---:|---:|---:|---:|---:|
| 0.10 | 18 | 0.0994782 | 120 | 0.0000000 |
| 0.25 | 10 | 0.2418861 | 60 | 0.2039295 |
| 0.50 | 8 | 0.4885705 | 38 | 0.4964059 |
| 1.00 | 6 | 0.9929505 | 21 | 0.9915682 |
| 2.00 | 6 | 1.9894415 | 12 | 1.9788334 |

All ten mode/threshold rows satisfy the frozen reconstruction bound.

### Negative control and regressions

The focused regression suite passed `5/5` tests. It verifies that an exact 30-point linear trend is losslessly reconstructed from exactly two linear-predictor events, and that on a clean 100-point linear trend at threshold `0.2`, zero-order hold requires more than 10 times as many events as the two-event linear representation. Invalid thresholds, non-finite inputs, and malformed event streams fail closed.

## Raw evidence

- `raw_metrics/repro-wave-20260813.json` — SHA-256 `039f9264f833dbae10932a01865ac78a85104a5e6b9b1e67dc6e9b375356c046`
- workflow focused-test log — SHA-256 `d96be30d4f62a6a6403a4116bd143e392123e1de6e33e9b31e9ae301ed261231`
- retained workflow artifact — `9164597422`

## Uncertainty

There is no stochastic sampling uncertainty in this deterministic fixture, so mean/SD across seeds would be artificial. The material uncertainties are external validity and sensitivity: alternative data-generating processes, predictor misspecification, non-linear/noisy signals, byte-level coding overhead, and whether event-count compression translates into actual rate-distortion benefits.

## Limitations / claim boundary

This result validates deterministic codec mechanics on synthetic fixtures only. It does **not** establish learned-model quality, external-dataset generalization, byte-level compression superiority, state-of-the-art rate-distortion performance, production readiness, or publication novelty.

**Verdict:** `FRESHLY_REPRODUCED_BOUNDED_CODEC_MECHANICS`.
