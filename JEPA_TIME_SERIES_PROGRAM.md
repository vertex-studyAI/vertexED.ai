# JEPA × TIME-SERIES RESEARCH PROGRAM

**As of:** 2026-08-14 IST  
**Policy:** this is one research programme, not seven projects. No new project ID is created until one hypothesis survives cheap falsification.

## Originality boundary first

Time-series JEPA is already an active research direction. Relevant primary work includes:

- **LaT-PFN** (arXiv:2405.10093): JEPA-style latent representation integrated with prior-fitted in-context time-series forecasting.
- **Joint Embeddings Go Temporal / TS-JEPA** (arXiv:2509.25449): JEPA adapted to time-series representation learning and evaluated on classification/forecasting.
- **CF-JEPA** (arXiv:2606.07031): mask-free multi-horizon forward latent prediction and online/EMA encoder asymmetry across classification, forecasting and anomaly detection.
- **Koopman Invariants as Drivers of Emergent Time-Series Clustering in JEPAs** (AAAI 2026): theoretical/empirical connection between an idealized JEPA objective and regime/invariant representations.
- Contemporary non-JEPA forecasting baselines include **DLinear/LTSF-Linear** (arXiv:2205.13504), **PatchTST** (arXiv:2211.14730), and **iTransformer** (arXiv:2310.06625).

Therefore, **“apply JEPA to time series” is not novel**. A defensible programme must isolate a condition or mechanism where latent prediction differs from autoregression, reconstruction, masking, contrastive learning, or strong simple forecasting.

## One recommended flagship question

> **When observations contain information that is unpredictable but irrelevant to the underlying dynamical state, does latent future prediction learn a more recoverable and transferable state representation than reconstruction, autoregression, contrastive learning, and existing time-series JEPA baselines at matched encoder/data/compute budget?**

This combines the strongest parts of H1/H2/H4 without assuming JEPA helps. It has a clear causal diagnostic: vary the fraction and predictability of nuisance observation information while keeping the latent dynamics fixed.

### Main hypothesis `TSJ-H-STATE-NOISE`

Let latent state `s_t` evolve under a known dynamical system and observations be `x_t = g(s_t) + n_t`, where `n_t` can be independently controlled for variance, tail behavior, temporal predictability and missingness. At matched representation dimension and compute, a future-latent predictive objective will improve **linear recoverability of `s_t` and cross-noise transfer** specifically when `n_t` is high-entropy/unpredictable, while offering no systematic advantage when nuisance information is predictable or state-relevant.

### Primary falsifier

The hypothesis is defeated if, across the preregistered state-space diagnostics, a strong reconstruction/masked/contrastive/autoregressive or existing TS-JEPA baseline matches or exceeds state recoverability and cross-noise transfer within the predeclared tolerance, or if any apparent JEPA gain persists equally when the nuisance is predictable—indicating capacity/regularization rather than predictive abstraction.

### Mechanism prediction

If the hypothesis is right:

1. state-probe quality should improve as unpredictable nuisance increases up to a useful bottleneck regime;
2. raw observation reconstruction should worsen or retain nuisance detail while latent-state recoverability remains stable;
3. representation sensitivity to nuisance perturbations should fall;
4. the advantage should shrink when nuisance becomes temporally predictable or causally relevant;
5. a linear predictor/encoder ablation should reveal whether the effect comes from latent prediction itself or merely a bottleneck/EMA regularizer.

## Mandatory baseline attack

### Statistical / trivial

- persistence / seasonal persistence where forecasting is evaluated;
- linear state-space/Kalman-style estimator on synthetic systems where model assumptions permit;
- linear/ridge forecasting;
- DLinear/LTSF-Linear-family simple linear model.

### Representation-learning

- raw-window features + linear probe;
- reconstruction autoencoder;
- masked reconstruction / masked time-series pretraining;
- contrastive time-series representation learning such as TS2Vec-class baseline;
- autoregressive next-value or next-patch prediction;
- simple latent predictor without target EMA/JEPA asymmetry;
- existing **TS-JEPA**-style masked joint-embedding baseline;
- **CF-JEPA**-style forward-prediction baseline if reproducible code/protocol can be matched fairly.

### Forecasting backbones where relevant

- PatchTST;
- iTransformer;
- a recurrent GRU/LSTM or TCN baseline;
- matched small Transformer;
- task-appropriate classical model.

A method is not interesting merely because it beats a weak Transformer.

## Primary synthetic diagnostic

### Data-generating families

Use multiple known-state systems so the representation can be evaluated against ground-truth latent state:

1. stable linear dynamical system;
2. switching linear dynamical system;
3. nonlinear oscillator / Lorenz-63-style system;
4. partially observed system where only a subset/nonlinear projection of state is visible.

For each, independently vary:

- observation SNR;
- Gaussian vs Student-t/heavy-tailed contamination;
- independent white nuisance vs temporally correlated/predictable nuisance;
- missingness rate/block missingness;
- observation projection while keeping latent dynamics fixed.

### Frozen train/evaluation structure

- train representations only on observation windows;
- target latent state is **never** used in representation training, only in probes/evaluation;
- use fixed train/validation/test system seeds with a held-out dynamics/noise grid;
- evaluate both in-distribution and cross-noise/cross-missingness transfer;
- capacity-match encoder width/depth/latent dimension;
- compute-match optimizer steps and report wall time/memory.

### Primary metrics

1. **latent-state linear-probe normalized MSE / `R²`** on held-out sequences;
2. **cross-noise transfer degradation** of the same frozen probe or a standardized retrained probe—protocol must choose one before running;
3. representation nuisance sensitivity under paired samples sharing state but differing nuisance;
4. downstream forecast/state-transition error as a secondary metric;
5. representation rank/collapse diagnostics.

Choose one primary metric hierarchy before the first final test.

### Cheapest useful experiment

Small 2–4 layer encoders, latent dimension `16–64`, 3 development seeds, one linear system + one nonlinear system, four nuisance regimes:

- low noise;
- high unpredictable Gaussian noise;
- high predictable AR nuisance;
- heavy-tailed unpredictable noise.

Compare only: raw/ridge, reconstruction AE, autoregressive predictor, simple latent predictor, TS-JEPA-like objective. **Kill the programme immediately** if latent prediction shows no selective advantage in the unpredictable-nuisance conditions or if the same advantage appears under predictable nuisance.

**Compute class:** LOW; designed to run on local hardware before any expensive real benchmark.

### Strong paper experiment

Only if the cheap diagnostic passes:

- 5+ seeds;
- all four synthetic dynamics families;
- nuisance/predictability/missingness sweep;
- TS-JEPA, CF-JEPA, contrastive, masked reconstruction, autoregression, DLinear/PatchTST/iTransformer/GRU controls where applicable;
- one or two real datasets with predeclared corruption/partial-observation protocols and one naturally relevant transfer task;
- state-probe, forecasting, transfer, collapse and compute metrics;
- paired confidence intervals/effect sizes;
- ablations below.

**Compute class:** MEDIUM; no foundation-model scaling required.

## Required ablations

1. remove EMA target encoder;
2. replace latent target with raw-value reconstruction;
3. replace predictor with linear predictor;
4. no bottleneck / larger latent dimension;
5. shuffle future-target temporal correspondence;
6. predictable vs unpredictable nuisance at matched marginal variance;
7. nuisance correlated with latent state vs independent nuisance;
8. vary context/target horizon;
9. target only near future vs multi-horizon future;
10. matched augmentation/corruption without JEPA objective.

The **predictable-vs-unpredictable nuisance ablation is mandatory** because it distinguishes predictive abstraction from generic denoising/regularization.

## Seven hypotheses under one programme

| ID | Question | Synthetic diagnostic | Real benchmark direction | Strongest dangerous baseline | Falsifier | Key ablation | Cheap experiment | Strong experiment | Compute | Paper potential |
|---|---|---|---|---|---|---|---|---|---|---|
| H1 Long-horizon state | Does latent prediction retain slow state while discarding fast nuisance? | multi-timescale LDS/nonlinear oscillator with fast independent noise | ETT/Electricity long-horizon transfer | PatchTST / DLinear / CF-JEPA | no state-probe/transfer gain at long horizons | short vs long target horizon | two-timescale synthetic | multi-dataset long-horizon + probes | Low→Med | **High only if mechanism selective** |
| H2 Partial observability | Does latent prediction improve hidden-state inference under missing/corrupted observations? | partially observed LDS + block missingness | controlled missingness on Electricity/ETT; a public irregular clinical/sensor dataset only if licensing/access is clean | Kalman/state-space estimator + masked AE + PatchTST | matched baseline recovers state equally/better | missingness pattern and context length | LDS with 10/30/50% missingness | multiple dynamics + real missingness | Low→Med | **Highest combined with H1/H4** |
| H3 Regime shift | Does latent prediction learn transferable regime/state representations across dynamics changes? | switching LDS / parameter-shift oscillator | fixed temporal split with known regime/calendar/domain shift | change-point/statistical model + TS-JEPA + PatchTST | no cross-regime transfer advantage | near-identity vs flexible predictor | two-regime synthetic | multiple shift types + real temporal OOD | Low→Med | Medium; crowded after AAAI-26 Koopman work |
| H4 Non-Gaussian noise | Is latent prediction selectively robust to unpredictable heavy-tailed observation noise? | Student-t/contamination at matched state dynamics | clean real data with preregistered corruptions; finance only if claim remains observation-noise specific | robust statistical filter + masked/contrastive + CF-JEPA | robust baseline matches or gain also occurs under predictable nuisance | tail index + predictable nuisance | Student-t vs Gaussian vs AR nuisance | multi-system + real corruption transfer | Low→Med | **High as mechanism diagnostic** |
| H5 Irregular sampling | Does latent prediction learn sampling-robust state representations? | random/structured irregular sampling of known ODE | public irregular sensor/light-curve benchmark with clean provenance | neural ODE/state-space + masked model + current irregular-JEPA prior work | no transfer across sampling schedules | timestamps on/off, interpolation baseline | irregular oscillator | natural irregular dataset + multiple rates | Med | Medium; active prior art already exists |
| H6 Multivariate structure | Does latent prediction capture cross-variable state coupling without reconstructing every channel? | coupled oscillator/network dynamics | Electricity/Traffic/ETT multivariate tasks | iTransformer + VAR/linear + PatchTST | no gain on state/cross-channel intervention probes | channel shuffle/drop | coupled LDS | cross-channel masking/intervention | Low→Med | Medium |
| H7 OOD transfer | Are latent states more reusable across domains than forecasting-specific features? | train/test changes in observation map/noise with invariant dynamics | cross-dataset or cross-site transfer with compatible variables | masked/contrastive/CF-JEPA pretrained encoders | no frozen-representation transfer gain | freeze encoder vs fine-tune | observation-map shift | multiple domains + few-shot probe | Med | High only if transfer protocol is truly comparable |

## Programme selection

**Promote only `TSJ-H-STATE-NOISE` first**, combining H1/H2/H4 as a mechanistic state-recovery study. H3 is less attractive as the first paper because recent JEPA/Koopman work already targets regime invariants. H5 is also crowded by recent irregular-time-series JEPA work. H6/H7 remain follow-ups only if the core predictive-abstraction mechanism survives.

## Kill criteria

Archive the programme for the month if any of these occurs in the cheap diagnostic:

- a simple linear/state-space or reconstruction/autoregressive baseline matches latent-state recoverability across the key unpredictable-noise conditions;
- JEPA-style gains do not interact with nuisance predictability;
- gains disappear under capacity/compute matching;
- representation collapse/rank issues make comparisons unstable across development seeds;
- the effect only appears after post-hoc choice of noise level, metric, horizon or seed.

A clean failure becomes a negative result about the predictive-abstraction hypothesis and is retained.

## First 3 executable tasks

1. **Protocol freeze:** specify equations/data-generators, train/validation/test seeds, nuisance grid, matched architectures, primary metric hierarchy and `TSJ-H-STATE-NOISE` falsifier.
2. **Baseline harness:** implement raw/ridge, reconstruction AE, autoregressive predictor, simple latent predictor and TS-JEPA-like objective under one matched config; unit-test data leakage and state-label isolation.
3. **Cheap falsification run:** execute the four nuisance regimes on one linear + one nonlinear system, retain all seeds, and stop or promote according to the frozen interaction criterion.

Do not execute step 3 until steps 1–2 are reviewed against the existing TS-JEPA/CF-JEPA/Koopman literature.