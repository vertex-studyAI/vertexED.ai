# Non-Gaussian Memory Transformer — baseline-first gate

**Evidence cutoff:** 12 August 2026  
**Current verdict:** mechanism not yet frozen; no Transformer-level NGMT claim.

## Evidence boundary

T2424-0025 is an integrated 50-seed robust-readout contamination study. Its negative control matters: robust estimators also outperform the mean at 0% contamination. The defensible current finding is generic robustness/smoothing in the controlled aggregation setup, not a uniquely non-Gaussian-memory advantage.

Do not reverse-engineer a full Transformer mechanism from the project name.

## Required formal specification before B3

Freeze equations for:

1. memory state / distribution family;
2. read operation;
3. write/update operation;
4. distinction from ordinary learned memory;
5. Gaussian/reference probabilistic memory;
6. the operational property that makes B3 non-Gaussian;
7. parameter/FLOP/memory-capacity matching;
8. a falsifier that archives the mechanism.

## Provisional hypothesis

> Under heavy-tailed, multimodal and regime-switching sequence distributions, an explicitly non-Gaussian memory representation improves predictive likelihood, delayed recall and corruption robustness relative to capacity-matched Gaussian and standard learned-memory baselines.

This is a proposed falsifiable hypothesis, not an existing result.

## Baseline ladder

- **B0:** no external memory;
- **B1:** standard learned/window memory;
- **B2:** Gaussian/reference probabilistic memory;
- **B3:** proposed non-Gaussian mechanism, only after equations are frozen.

## Minimum benchmark conditions

Run multiple seeds and retain failures on:

- clean Gaussian sequences;
- delayed/noisy recall;
- heavy-tailed corruption;
- two-mode mixtures;
- regime switching;
- non-stationary mixture weights.

Record recall/prediction error, predictive NLL where applicable, calibration, corruption degradation, sample efficiency, parameter count, peak memory, throughput and wall-clock time.

## Required B3 ablations

1. replace B3 state with a Gaussian approximation;
2. hold memory capacity constant;
3. remove mixture/heavy-tail structure;
4. disable adaptation under regime switching;
5. compare equal parameter/FLOP budgets;
6. include clean Gaussian controls to expose unnecessary regressions.

## Stop rule

If the frozen benchmark does not create a reproducible regime in which B3 is distinguishable from B0–B2, archive the Transformer mechanism. Retain T2424-0025 as a bounded robustness result rather than escalating vocabulary around a failed mechanism isolation.
