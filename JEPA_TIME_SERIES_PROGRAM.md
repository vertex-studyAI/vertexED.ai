# JEPA × TIME-SERIES RESEARCH PROGRAM

**As of:** 2026-08-14 IST  
**Policy:** one programme, not seven renamed projects. A new project identity is created only after one hypothesis survives cheap falsification.

## Originality boundary

“Apply JEPA to time series” is **not novel**. Existing work already studies JEPA-style temporal representation learning and forecasting, including LaT-PFN, TS-JEPA / *Joint Embeddings Go Temporal*, CF-JEPA, and recent JEPA/Koopman-invariant analysis. Strong non-JEPA forecasting baselines also include simple linear models such as DLinear and modern patch/Transformer families such as PatchTST and iTransformer.

The research contribution must therefore isolate a condition or mechanism where **latent future prediction** behaves differently from reconstruction, autoregression, contrastive learning, existing time-series JEPA objectives, and competent statistical/state-space forecasting.

## Recommended flagship question

> **When observations contain information that is unpredictable but irrelevant to the underlying dynamical state, does latent future prediction learn a more recoverable and transferable state representation than reconstruction, autoregression, contrastive learning and existing time-series JEPA baselines at matched encoder/data/compute budget?**

This is the only hypothesis authorized for initial cheap work. H1–H7 below are subquestions under this programme, not seven papers.

## `TSJ-H-STATE-NOISE`

Let latent state evolve as

` s_{t+1} = f(s_t, u_t, ε_t) `

and observation be

` x_t = g(s_t) + n_t `.

The nuisance `n_t` is controllable independently in variance, tail behavior, temporal predictability, missingness and whether it is causally relevant to future state.

### Hypothesis

At matched representation dimension and compute, a future-latent predictive objective improves linear recoverability of `s_t` and cross-noise transfer **specifically when nuisance information is high-entropy/unpredictable and state-irrelevant**, while offering no systematic advantage when nuisance information is predictable or state-relevant.

### Falsifier

Kill the hypothesis if any of these occurs under the frozen diagnostic:

1. a strong reconstruction, masked, contrastive, autoregressive, state-space or existing TS-JEPA baseline matches/exceeds state recoverability and transfer within the predeclared tolerance;
2. the apparent JEPA advantage is equally present when nuisance is temporally predictable, undermining the predictive-abstraction mechanism;
3. the advantage disappears under capacity/compute matching;
4. the conclusion depends on post-hoc noise levels, horizons, metrics, seeds or representation sizes;
5. representation collapse/rank instability makes the effect irreproducible.

A clean failure becomes a preserved negative result.

## Mechanism predictions

If the mechanism is real:

- state-probe quality should degrade less as unpredictable nuisance increases;
- nuisance sensitivity should decrease for paired observations sharing the same latent state;
- the advantage should shrink when nuisance becomes predictable or causally relevant;
- longer target horizons should help only when they correspond to predictable latent dynamics rather than simply adding regularization;
- replacing latent prediction with reconstruction or temporal shuffling should remove the selective effect;
- a simple linear latent predictor should reveal whether nonlinear predictor capacity is actually necessary.

## Mandatory dangerous baselines

### Statistical / state estimation

- persistence and seasonal persistence where forecasting is evaluated;
- linear/ridge forecasting;
- AR/ARIMA-classical family where assumptions fit;
- Kalman/state-space estimator on synthetic systems where the ground-truth structure permits it;
- DLinear/LTSF-Linear family.

### Representation learning

- raw-window features + linear probe;
- reconstruction autoencoder;
- masked reconstruction / masked time-series pretraining;
- contrastive time-series representation learning, e.g. a TS2Vec-class baseline;
- autoregressive next-value/next-patch prediction;
- simple latent predictor without JEPA target asymmetry;
- a reproducible TS-JEPA-style baseline;
- a reproducible CF-JEPA-style forward-prediction baseline when budget matching is feasible.

### Learned forecasting

- GRU/LSTM or TCN;
- matched small Transformer;
- PatchTST;
- iTransformer;
- task-specific strong simple model.

No claim is interesting because it beats a weak Transformer.

## Primary synthetic diagnostic

### Dynamics families

Use systems with known latent state so the representation can be evaluated against ground truth:

1. stable linear dynamical system;
2. switching linear dynamical system;
3. nonlinear oscillator / Lorenz-63-like system;
4. partially observed system using a nonlinear or incomplete observation map.

### Nuisance interventions

Independently vary:

- signal-to-noise ratio;
- Gaussian vs Student-t/heavy-tailed contamination;
- white unpredictable nuisance vs AR/predictable nuisance with matched marginal variance;
- random and block missingness;
- observation map/projection while latent dynamics remain fixed;
- state-independent vs state-relevant nuisance.

The **predictable-vs-unpredictable nuisance comparison is mandatory**. It is the key anti-confound distinguishing predictive abstraction from generic denoising or regularization.

### Data leakage boundary

Latent state `s_t` may be used only for probes/evaluation. It must never enter representation training, target construction or model selection except through the observable `x_t` and a frozen development protocol.

### Primary metrics

Freeze the hierarchy before final/test runs:

1. latent-state linear-probe normalized MSE or `R²`;
2. cross-noise / cross-missingness transfer degradation;
3. representation nuisance sensitivity on paired same-state observations;
4. downstream forecast/state-transition error as secondary evidence;
5. representation rank/collapse diagnostics;
6. wall time, memory and model/parameter budget.

Choose in advance whether the transfer probe is frozen or retrained; do not choose after seeing results.

## Cheapest useful experiment

Use small `2–4` layer encoders, latent dimension roughly `16–64`, and three **development** seeds on one stable linear and one nonlinear system.

Four nuisance regimes:

1. low noise;
2. high unpredictable Gaussian noise;
3. high predictable AR nuisance with matched marginal variance;
4. heavy-tailed unpredictable noise.

First-pass methods only:

- raw/ridge;
- reconstruction AE;
- autoregressive predictor;
- simple latent predictor;
- TS-JEPA-like objective.

### Cheap gate

Promote only if the latent-prediction method shows a reproducible **interaction with nuisance predictability**: useful advantage under unpredictable nuisance, materially smaller/no advantage under predictable nuisance, while remaining capacity/compute matched.

If this gate fails, stop the programme for the month. Do not jump immediately to larger models or more datasets.

**Compute:** LOW / local-first.

## Strong paper experiment — only after cheap gate PASS

- at least five seeds;
- all four synthetic dynamics families;
- nuisance/predictability/missingness grid fixed before final run;
- TS-JEPA, CF-JEPA, contrastive, masked reconstruction, autoregressive, DLinear, PatchTST, iTransformer and recurrent/state-space controls where appropriate;
- one or two real datasets with preregistered corruption/partial-observation protocols plus one naturally meaningful transfer/OOD task;
- state-probe, forecasting, transfer, collapse and compute metrics;
- paired confidence intervals/effect sizes where justified;
- complete raw/processed/config/code provenance.

**Compute:** MEDIUM. No foundation-model scaling is required or authorized for the first serious paper.

## Required ablations

1. remove EMA/target encoder asymmetry;
2. replace latent target with raw-value reconstruction;
3. replace nonlinear predictor with linear predictor;
4. expand/remove the representation bottleneck;
5. shuffle future-target temporal correspondence;
6. predictable vs unpredictable nuisance at matched marginal variance;
7. nuisance correlated with state vs independent nuisance;
8. vary context horizon;
9. near-future vs multi-horizon target;
10. matched corruption/augmentation without JEPA objective;
11. freeze encoder vs end-to-end fine-tune on downstream task;
12. parameter-match and compute-match controls.

## Seven hypotheses under one programme

| ID | Precise question | Synthetic diagnostic | Real benchmark direction | Most dangerous baseline | Falsifier | Key ablation | Cheap experiment | Strong experiment | Compute | Paper potential |
|---|---|---|---|---|---|---|---|---|---|---|
| H1 Long-horizon state | Does latent prediction retain slow state while suppressing fast unpredictable observation detail? | multi-timescale LDS / oscillator | ETT/Electricity long-horizon transfer | PatchTST, DLinear, CF-JEPA | no state-probe/transfer gain at long horizons | short vs long target | two-timescale synthetic | multi-dataset + probes | Low→Med | High only if selective mechanism survives |
| H2 Partial observability | Does latent prediction improve hidden-state inference with missing/corrupted observations? | partial LDS + block missingness | controlled missingness on public sensor/energy data | Kalman/state-space + masked AE | matched controls recover state equally/better | missingness pattern/context | 10/30/50% missingness | multiple systems + real missingness | Low→Med | High when combined with H1/H4 |
| H3 Regime shift | Do representations transfer across changing dynamics regimes? | switching LDS / parameter shift | fixed temporal OOD split | robust change/state-space + TS-JEPA/PatchTST | no cross-regime transfer advantage | mild vs severe shift | two-regime system | multiple shift types | Low→Med | Medium; prior work already pressures novelty |
| H4 Non-Gaussian noise | Is latent prediction selectively robust to unpredictable heavy tails? | Student-t/contamination | preregistered real-data corruption | robust filter + masked/contrastive + CF-JEPA | robust baseline matches or gain also appears for predictable nuisance | tail index + predictability | Gaussian vs Student-t vs AR | multi-system + real corruption | Low→Med | High as mechanism diagnostic |
| H5 Irregular sampling | Does latent prediction learn sampling-robust state? | irregular ODE observations | clean public irregular sensor/light-curve task if licensing/provenance permits | neural ODE/state-space + masked/JEPAs | no transfer across sampling schedules | timestamps on/off, interpolation | irregular oscillator | natural irregular benchmark | Med | Medium; active prior art |
| H6 Multivariate structure | Does latent prediction capture cross-variable state coupling without reconstructing every channel? | coupled oscillator/network | Electricity/Traffic/ETT-like multivariate data | iTransformer + VAR/linear + PatchTST | no gain on state/cross-channel probes | channel shuffle/drop | coupled LDS | channel interventions | Low→Med | Medium |
| H7 OOD transfer | Are latent states more reusable under invariant dynamics but changed observation maps/noise? | train/test observation-map change | cross-site/domain transfer with compatible variables | masked/contrastive/CF-JEPA | no frozen-representation transfer gain | freeze vs fine-tune | projection shift | multiple domains + few-shot probes | Med | High only with comparable domains |

## Programme selection

**Run `TSJ-H-STATE-NOISE` first**, combining H1/H2/H4 into one mechanistic state-recovery question. Do not start H3–H7 in parallel. H3 and H5 face particularly strong recent prior-art pressure, so they are follow-ups only if the core predictive-abstraction mechanism survives.

## First three tasks

1. **`TSJ-FREEZE-001` — Protocol freeze:** equations/data generators, train/dev/test seeds, nuisance grid, matched architectures, primary metric hierarchy, compute budget and falsifier.
2. **`TSJ-HARNESS-001` — Baseline harness:** raw/ridge, reconstruction AE, autoregressive, simple latent, TS-JEPA-like baseline; unit-test state-label isolation and leakage.
3. **`TSJ-CHEAP-001` — Cheap falsification run:** execute four nuisance regimes on one linear + one nonlinear system and stop/promote strictly by the frozen interaction criterion.

These tasks are **not inserted into the active top-10 queue yet**. NeuroCAD is the currently authorized major scientific experiment. The time-series programme enters the queue only after current Tier-S closure capacity becomes available.