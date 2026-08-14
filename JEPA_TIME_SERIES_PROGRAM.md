# JEPA × TIME-SERIES RESEARCH PROGRAM

**As of:** 2026-08-14 IST  
**Policy:** one programme, not seven renamed projects. It is not in the active top-10 queue. A new project identity is created only after one hypothesis survives cheap falsification and displaces lower-value work.

## Originality boundary

“Apply JEPA to time series” is **not novel**. Existing research already studies JEPA-style temporal representation learning/forecasting, while strong non-JEPA baselines include classical/state-space methods, DLinear-style simple linear models, recurrent/TCN systems, PatchTST and iTransformer families.

A defensible contribution must isolate a condition or mechanism where **latent future prediction** behaves differently from reconstruction, autoregression, contrastive learning, existing time-series JEPA objectives and competent statistical forecasting.

## Recommended flagship question

> **When observations contain information that is unpredictable but irrelevant to the underlying dynamical state, does latent future prediction learn a more recoverable and transferable state representation than reconstruction, autoregression, contrastive learning and existing time-series JEPA baselines at matched encoder/data/compute budget?**

Only this hypothesis is eligible for initial cheap work. H1–H7 below are subquestions under one programme, not seven papers.

## `TSJ-H-STATE-NOISE`

Let latent state evolve as `s_{t+1}=f(s_t,u_t,ε_t)` and observation be `x_t=g(s_t)+n_t`. The nuisance `n_t` is independently controllable in variance, tail behavior, temporal predictability, missingness and causal relevance.

### Hypothesis

At matched representation dimension and compute, a future-latent predictive objective improves linear recoverability of `s_t` and cross-noise transfer **specifically when nuisance is high-entropy/unpredictable and state-irrelevant**, while providing no systematic advantage when nuisance is predictable or state-relevant.

### Falsifier

Kill the hypothesis if:

1. strong reconstruction, masked, contrastive, autoregressive, state-space or existing TS-JEPA controls match/exceed state recoverability and transfer within the predeclared tolerance;
2. the apparent advantage is equally present when nuisance is temporally predictable;
3. the advantage disappears under capacity/compute matching;
4. the conclusion depends on post-hoc noise level, horizon, metric, seed or latent dimension;
5. representation rank/collapse instability makes the result irreproducible.

A clean failure is retained as a negative result.

## Mechanism predictions

If predictive abstraction is real:

- state-probe quality degrades less as unpredictable nuisance increases;
- paired same-state/different-nuisance representation sensitivity falls;
- the advantage shrinks when nuisance becomes predictable or state-relevant;
- target-horizon effects track predictable latent dynamics, not generic regularization;
- reconstruction or shuffled temporal targets remove the selective effect;
- a linear-predictor ablation reveals whether nonlinear predictor capacity is actually necessary.

## Mandatory dangerous baselines

**Statistical/state estimation:** persistence/seasonal persistence where relevant; linear/ridge; AR/ARIMA-classical when appropriate; Kalman/state-space estimator on synthetic systems where assumptions permit; DLinear/LTSF-Linear family.

**Representation learning:** raw-window + linear probe; reconstruction AE; masked reconstruction; contrastive time-series representation learning; autoregressive next-value/patch prediction; simple latent predictor without target asymmetry; reproducible TS-JEPA-style baseline; reproducible forward-prediction JEPA baseline when fairly matchable.

**Learned forecasting:** GRU/LSTM or TCN; matched small Transformer; PatchTST; iTransformer; task-specific strong simple model.

No result is scientifically interesting merely because it beats a weak Transformer.

## Primary synthetic diagnostic

Use known-state systems:

1. stable linear dynamical system;
2. switching linear dynamical system;
3. nonlinear oscillator / Lorenz-63-like system;
4. partially observed system with nonlinear/incomplete observation map.

Independently vary SNR; Gaussian vs Student-t/heavy-tailed contamination; white unpredictable vs AR/predictable nuisance at matched marginal variance; random/block missingness; observation projection with fixed latent dynamics; state-independent vs state-relevant nuisance.

**Mandatory anti-confound:** predictable-vs-unpredictable nuisance at matched marginal variance.

Latent state `s_t` may be used only for probes/evaluation, never representation training or model selection except through frozen development criteria.

### Metrics — hierarchy frozen before final/test

1. latent-state linear-probe normalized MSE or `R²`;
2. cross-noise/cross-missingness transfer degradation;
3. paired same-state nuisance sensitivity;
4. downstream forecast/state-transition error as secondary evidence;
5. representation rank/collapse diagnostics;
6. wall time, memory, parameters and model-call budget.

Choose before running whether transfer uses a frozen or retrained probe.

## Cheapest useful experiment

Use small `2–4` layer encoders, latent dimension roughly `16–64`, three **development** seeds, one stable linear and one nonlinear system.

Four nuisance regimes: low noise; high unpredictable Gaussian noise; high predictable AR nuisance with matched marginal variance; heavy-tailed unpredictable noise.

First-pass methods only: raw/ridge; reconstruction AE; autoregressive predictor; simple latent predictor; TS-JEPA-like objective.

### Cheap gate

Promote only if latent prediction shows a reproducible **interaction with nuisance predictability**: useful advantage under unpredictable nuisance, materially smaller/no advantage under predictable nuisance, with matched capacity/compute.

If this gate fails, stop the programme for the month. Do not jump to larger models or more datasets.

**Compute:** LOW / local-first.

## Strong paper experiment — only after cheap PASS

Use >=5 seeds; all four dynamics families; frozen nuisance/predictability/missingness grid; strong JEPA/non-JEPA baselines; one or two real datasets with preregistered corruption/partial-observation protocols plus a naturally meaningful transfer/OOD task; paired uncertainty/effect sizes where justified; full raw→processed→config→code provenance.

**Compute:** MEDIUM. No foundation-model scaling is authorized for the first serious paper.

## Required ablations

1. remove EMA/target asymmetry;
2. replace latent target with raw reconstruction;
3. linear predictor;
4. expand/remove bottleneck;
5. shuffle temporal target correspondence;
6. predictable vs unpredictable nuisance;
7. state-correlated vs independent nuisance;
8. context horizon;
9. near-future vs multi-horizon target;
10. matched corruption/augmentation without JEPA objective;
11. frozen encoder vs fine-tuning;
12. parameter- and compute-matched controls.

## Seven subhypotheses — one programme

| ID | Question | Synthetic diagnostic | Real direction | Dangerous baseline | Falsifier | Key ablation | Cheap experiment | Strong experiment | Compute | Potential |
|---|---|---|---|---|---|---|---|---|---|---|
| H1 Long-horizon state | Retain slow state while suppressing fast nuisance? | multi-timescale LDS/oscillator | long-horizon energy/sensor transfer | PatchTST, DLinear, forward JEPA | no state-probe/transfer gain | target horizon | two-timescale synthetic | multi-dataset + probes | Low→Med | High only if selective |
| H2 Partial observability | Improve hidden-state inference with missing/corrupt observations? | partial LDS + block missingness | controlled missingness on public sensor data | Kalman/state-space + masked AE | controls recover equally/better | missingness/context | 10/30/50% missingness | multiple systems + real missingness | Low→Med | High with H1/H4 |
| H3 Regime shift | Transfer across changed dynamics? | switching LDS | fixed temporal OOD | robust change/state-space + temporal JEPA | no cross-regime advantage | mild/severe shift | two-regime system | multiple shifts | Low→Med | Medium; novelty pressure |
| H4 Non-Gaussian noise | Selectively robust to unpredictable heavy tails? | Student-t/contamination | preregistered real corruption | robust filter + masked/contrastive | robust baseline matches or effect is non-selective | tail index + predictability | Gaussian/Student-t/AR | multi-system + real corruption | Low→Med | High as mechanism diagnostic |
| H5 Irregular sampling | Sampling-robust state? | irregular ODE | clean public irregular sensor/light-curve task | neural ODE/state-space + masked/JEPA | no transfer across schedules | timestamps/interpolation | irregular oscillator | natural irregular benchmark | Med | Medium; active prior art |
| H6 Multivariate structure | Capture cross-variable state coupling without full reconstruction? | coupled dynamics | multivariate energy/traffic | iTransformer + VAR/linear + PatchTST | no cross-channel/state gain | channel shuffle/drop | coupled LDS | interventions | Low→Med | Medium |
| H7 OOD transfer | More reusable state under changed observation map/noise? | observation-map shift | compatible cross-site/domain transfer | masked/contrastive/forward JEPA | no frozen-representation transfer gain | freeze vs fine-tune | projection shift | multi-domain few-shot probes | Med | High only if comparable |

## Programme selection

Run `TSJ-H-STATE-NOISE` first if and only if it later earns an active slot. H3–H7 do not run in parallel. H3/H5 face especially strong prior-art pressure.

## First three future tasks

1. `TSJ-FREEZE-001`: freeze equations, generators, splits/seeds, nuisance grid, matched architectures, metric hierarchy, compute budget and falsifier.
2. `TSJ-HARNESS-001`: implement raw/ridge, reconstruction, autoregressive, simple latent and TS-JEPA-like controls; test leakage/state-label isolation.
3. `TSJ-CHEAP-001`: run the four nuisance regimes once and kill/promote strictly by the frozen interaction criterion.

These tasks remain **outside the active canonical queue** until current closure/protocol work releases capacity.