# Non-Gaussian Memory Transformer — baseline-first research gate

**Evidence cutoff:** 12 August 2026  
**Current verdict:** deferred; no defensible Transformer-level non-Gaussian memory mechanism is frozen.

## Evidence boundary

The existing T2424-0025 implementation is a deterministic **robust weighted-median memory aggregation screen** under synthetic contamination. It is useful mechanism-screen evidence, but it does not by itself define a Non-Gaussian Memory Transformer, a learned probabilistic memory state, or a capacity-matched Transformer comparison.

Do not reverse-engineer a full method from the project name.

## Required formal specification before B3

Freeze equations for:

1. memory state / distribution family;
2. read operation;
3. write/update operation;
4. distinction from standard learned memory;
5. Gaussian/reference probabilistic memory;
6. the operational property that makes the proposed state non-Gaussian;
7. parameter/FLOP and memory-capacity matching;
8. the falsifier that would cause the mechanism to be archived.

## Provisional research hypothesis

> Under heavy-tailed, multimodal and regime-switching sequence distributions, an explicitly non-Gaussian memory representation improves predictive likelihood, delayed-recall performance and robustness relative to capacity-matched Gaussian and standard learned-memory baselines.

This is a proposed hypothesis, not a recovered claim from existing Transformer code.

## Baseline ladder

- **B0:** no external memory;
- **B1:** standard learned/window memory;
- **B2:** Gaussian/reference probabilistic memory;
- **B3:** proposed non-Gaussian mechanism **only after the equations above are frozen**.

## Baseline conditions

Run at least multiple seeds and preserve failed runs on:

- clean Gaussian sequences;
- delayed/noisy recall;
- Student-t or other heavy-tailed corruption;
- two-mode mixtures;
- regime switching;
- non-stationary mixture weights.

Metrics should include recall/prediction MSE, predictive NLL where probabilistic outputs exist, calibration, degradation under corruption, sample efficiency, parameter count, peak memory and runtime.

## Fresh baseline-only sandbox result

A separate baseline harness was rerun on 12 August 2026 with five seeds per condition. It compared no-memory, a window/ridge reference and a Gaussian-summary reference. The run intentionally did **not** implement or test B3.

Mean MSE:

| Condition | No memory | Window/ridge | Gaussian summary |
|---|---:|---:|---:|
| Gaussian AR | 0.98496 | 0.98820 | 0.98665 |
| Student-t AR | 1.63515 | 1.64655 | 1.63793 |
| Bimodal | 0.46603 | 0.46822 | 0.46610 |
| Regime switch | 1.28020 | 0.83197 | 1.22866 |
| Non-stationary | 0.46803 | 0.44772 | 0.44232 |

Interpretation: the harness exposes useful regime-switch/non-stationary memory structure, but it does **not** establish a non-Gaussian-memory advantage. Heavy-tail difficulty alone is not evidence for B3.

## Required B3 ablations — only after formalization

1. replace the non-Gaussian state with a Gaussian approximation;
2. hold memory capacity constant;
3. remove mixture/heavy-tail component;
4. disable adaptation under regime switching;
5. compare equal parameter/FLOP budgets;
6. run a clean Gaussian condition to detect unnecessary regressions.

## Stop rule

If the frozen baseline suite does not create a meaningful problem where the proposed distributional memory can be falsifiably distinguished from B0-B2, archive NGMT rather than adding architectural complexity or paper claims.

The current weighted-median contamination sweep may remain as a bounded robustness probe, but it must not be described as a completed NGMT/Transformer result.