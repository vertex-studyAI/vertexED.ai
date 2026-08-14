# JEPA × TIME-SERIES RESEARCH PROGRAM

**Date:** 2026-08-14  
**Status:** research-program design only; no positive result is implied.  
**Portfolio rule:** one lead hypothesis is authorized for cheap falsification. The other hypotheses remain a ranked bank, not seven simultaneous projects.

## Originality boundary first

“Apply JEPA to time series” is **not** a novel research claim.

Primary literature already includes:

- LaT-PFN — *A Joint Embedding Predictive Architecture for In-context Time-series Forecasting* (`arXiv:2405.10093`);
- TS-JEPA — *Joint Embeddings Go Temporal* (`arXiv:2509.25449`), explicitly introducing a time-series JEPA for representation learning/forecasting/classification;
- MTS-JEPA — *Multi-Resolution Joint-Embedding Predictive Architecture for Time-Series Anomaly Prediction* (`arXiv:2602.04643`);
- established non-JEPA time-series SSL families including TS2Vec (`arXiv:2106.10466`), Ti-MAE (`arXiv:2301.08871`), PatchTST self-supervised pretraining (`arXiv:2211.14730`) and MOMENT (`arXiv:2402.03885`).

Therefore any defensible contribution must answer **when latent future prediction changes what is learned**, under a controlled condition where reconstruction/autoregression/contrastive learning and simple forecasting baselines could reasonably win.

---

# Lead question — H2: partially observed dynamical state

> **When observations are incomplete and contain unpredictable nuisance noise, does latent future prediction learn a representation of the underlying dynamical state that is more recoverable and more useful for forecasting than reconstruction, autoregression, contrastive learning, or simple statistical state estimation?**

This is the only hypothesis initially authorized for execution because it gives a direct mechanism test: synthetic systems provide a known latent state, so “better representation” can be evaluated rather than inferred from one downstream metric.

## Precise hypothesis

Under matched encoder capacity, data and optimization budget, a JEPA-style context-to-future-latent objective will:

1. improve linear recoverability of the true hidden state from the learned context representation under partial observation/noise;
2. improve downstream forecasting under held-out missingness/corruption;
3. reduce sensitivity of the representation to injected observation-only nuisance noise;

relative to the strongest matched SSL baseline.

The hypothesis is **not** “JEPA always forecasts better.”

## Proposed mechanism

The target encoder compresses a future window into a representation. The context encoder/predictor is trained to predict that target representation rather than every future observation. If the future contains high-entropy observation noise that is difficult or impossible to predict but the latent state evolves predictably, the latent target may permit the model to preserve predictable state information while discarding nuisance detail.

This mechanism is defeated if reconstruction/masked modeling, autoregression, contrastive learning, a simple latent-prediction control, or a classical filter learns an equally good state representation at matched budget.

## Primary falsifier

Kill the lead hypothesis for this cycle if either condition holds:

1. on known-state synthetic systems, JEPA does **not** improve hidden-state recovery over the best matched SSL baseline by a predeclared practically meaningful margin; **or**
2. any state-recovery advantage does not translate into a separately frozen forecasting/missingness benefit, or is matched by a simple linear/statistical filter.

No architecture rescue is allowed after viewing confirmatory seeds.

## Synthetic diagnostics

Use synthetic systems because the latent state is known.

### S1 — linear dynamical system, partial observation

- stable linear state transition;
- observation matrix hides part of the state;
- additive Gaussian observation noise;
- oracle Kalman filter gives a strong reference bound where assumptions are correct.

Purpose: determine whether a neural SSL objective can recover anything not already captured by an optimal classical model.

### S2 — nonlinear smooth dynamics

- nonlinear latent transition with controlled predictability;
- nonlinear observation map;
- partial channel visibility.

Purpose: move beyond the Kalman-friendly case without introducing arbitrary real-data confounds.

### S3 — switching/regime dynamics

- a small number of latent transition regimes;
- regime changes generated independently of observation noise;
- evaluate state recovery and adaptation around transition windows.

Purpose: test whether the representation preserves persistent state changes rather than smoothing them away.

### S4 — structured nuisance/noise stress

Use the same latent dynamics while varying observation-only nuisance:

- Gaussian noise;
- Student-t/heavy-tailed noise;
- sparse spikes/outliers;
- channel dropout;
- contiguous missing windows;
- nuisance channel with high variance but zero causal influence on the latent transition.

Purpose: directly test the proposed nuisance-suppression mechanism.

## Real-data phase

Only run after the synthetic mechanism survives.

Candidate public forecasting families:

- ETT-style multivariate forecasting;
- Electricity;
- Weather;
- one domain with naturally missing or irregular measurements if licensing/preprocessing can be frozen cleanly.

For complete datasets, create **prospectively frozen** observation masks/corruption schedules and keep an untouched clean evaluation track. Artificial masking must be described as a controlled robustness intervention, not “natural missingness.”

## Dangerous baselines

### Statistical / trivial

- last-value persistence;
- seasonal persistence where meaningful;
- AR/VAR or ridge autoregression;
- exponential smoothing/ARIMA-classical family where appropriate;
- Kalman filter on S1 when the true model class is known;
- simple interpolation plus linear forecasting for missingness.

### Learned forecasting

- DLinear/NLinear-style simple linear forecasting;
- GRU/LSTM;
- TCN;
- PatchTST-style patch Transformer;
- one competent contemporary forecasting/foundation-model characterization if frozen and locally/externally reproducible.

### Representation learning

- masked reconstruction / Ti-MAE-style objective;
- contrastive / TS2Vec-style objective;
- autoregressive next-window prediction;
- TS-JEPA implementation/reference configuration where reproducible;
- **simple latent prediction control** using the same encoders but removing any JEPA-specific target/EMA/stop-gradient choices under test;
- frozen pretrained time-series encoder + linear head where a well-defined open checkpoint exists.

The strongest baseline is the one that performs best under the frozen protocol, not the one most convenient to beat.

## Required ablations

1. raw future prediction instead of target-latent prediction;
2. masked reconstruction with the same encoder capacity;
3. contrastive loss with matched encoder/data/steps;
4. no target EMA / alternate target update where applicable;
5. frozen random target encoder diagnostic;
6. predictor replaced by a linear map;
7. parameter-matched shallow/deep predictor;
8. target horizon sweep frozen before confirmatory evaluation;
9. reduced/expanded context length;
10. temporal order shuffle negative control;
11. shuffled future targets negative control;
12. remove nuisance channel / add nuisance channel;
13. missingness-only versus observation-noise-only cells.

## Metrics

### Primary mechanism metric — synthetic

**Hidden-state linear-probe `R²`** on an untouched synthetic test split, averaged across latent dimensions with a predeclared aggregation rule.

Also retain:

- subspace/coordinate-sensitive probe diagnostics where appropriate;
- forecast MSE/MAE from a frozen lightweight head;
- performance versus missingness/corruption severity;
- representation sensitivity to nuisance perturbations measured by paired representation distance under fixed latent state;
- failure/collapse frequency across seeds.

### Primary downstream metric — real data

Use one frozen normalized forecasting error aggregation across datasets/horizons; report MSE/MAE individually as secondary outcomes. Do not select the aggregate after seeing results.

### Compute/accounting

Record:

- trainable parameters;
- optimizer steps / examples seen;
- wall time;
- peak memory;
- inference latency where relevant.

## Seed and statistics policy

### Cheap development screen

- 3 development seeds per synthetic cell;
- no formal significance claim;
- used only to kill obviously weak configurations and debugging failures.

### Confirmatory synthetic protocol

If the candidate and all baselines are frozen:

- 10 paired seeds minimum per primary synthetic family/corruption cell;
- paired effect estimates because seeds/data realizations can be shared;
- report mean/median effect, bootstrap or analytically justified 95% interval, and seed-level failure frequency;
- no seed deletion except preregistered execution-invalid criteria.

### Real-data protocol

- at least 5 frozen seeds for trained neural baselines where stochasticity is material;
- deterministic/statistical methods are not padded with fake seeds;
- use dataset/horizon paired comparisons and report per-dataset outcomes rather than only a global average.

## Advancement gate

Freeze the numeric gate before the confirmatory run. A reasonable starting gate for review is:

- `>= 0.03` absolute hidden-state probe `R²` improvement over the best matched learned SSL baseline on the predeclared primary synthetic aggregate;
- positive effect on at least 3 of 4 synthetic diagnostic families without a catastrophic regression in the fourth;
- `>= 3%` relative improvement on the frozen missing/corrupted forecasting aggregate versus the best matched learned representation baseline;
- no advantage attributable solely to larger capacity, more optimization steps or a weaker baseline.

These thresholds are proposed design values, **not achieved results**. They may be changed only before confirmatory results are viewed and with the reason recorded.

## Cheapest decisive experiment

Run only S1 + one nonlinear system with:

- JEPA latent target;
- masked reconstruction;
- autoregressive raw-future prediction;
- contrastive TS2Vec-style objective;
- simple latent-prediction control;
- Kalman/linear statistical reference on S1.

Use two missingness levels and two nuisance-noise levels. If JEPA does not show a coherent hidden-state-recovery effect, stop the program before real-data scaling.

## Strong paper experiment

Only if the cheap screen survives:

- S1–S4 synthetic families;
- real multivariate datasets with frozen controlled missingness/corruption;
- matched capacity/steps/data across SSL objectives;
- full ablation suite;
- 10 paired synthetic seeds / >=5 learned real-data seeds;
- OOD corruption severity and regime-shift tests;
- compute/parameter accounting;
- independent metric recomputation and fresh-worktree reproduction;
- reviewer attack against the claim that the effect is merely masking, denoising or target smoothing.

## Kill criteria

Archive the lead hypothesis if:

- TS-JEPA/reference or simple latent prediction already provides the same effect, leaving no distinct mechanism question;
- masked reconstruction or contrastive learning matches state recovery at equal budget;
- Kalman/simple filters dominate on every interpretable diagnostic and neural complexity adds no information;
- the effect exists only at one hand-picked noise/missingness level;
- representation collapse/variance artifacts explain the probe result;
- downstream forecast gains disappear after matched preprocessing/capacity;
- the real-data phase requires inaccessible/private data or impractical compute.

A clean null result is still useful: it would define conditions under which latent future prediction does **not** provide extra state information over reconstruction/contrastive/statistical estimation.

---

# Ranked hypothesis bank

These are **not** separately active projects.

| Rank | Hypothesis | Synthetic diagnostic first | Real benchmark phase | Strongest baseline / falsifier | Critical ablation | Cheap experiment | Strong experiment | Compute | Paper potential |
|---:|---|---|---|---|---|---|---|---|---|
| **1** | **H2 partial observability:** latent prediction preserves hidden dynamical state under missing/corrupted observations | partially observed LDS + nonlinear latent system with known state | controlled masking on multivariate forecasting data | Kalman/VAR + masked reconstruction + TS2Vec + TS-JEPA/simple latent prediction; kill if state recovery not better | nuisance/noise channel removal; raw-vs-latent target | 2 systems × 4 SSL objectives × 2 corruption levels | S1–S4 + real data + full controls | LOW→MEDIUM | **HIGH if mechanism survives** |
| 2 | **H4 non-Gaussian nuisance:** latent target suppresses heavy-tailed observation noise without suppressing persistent state | same latent dynamics with Gaussian vs Student-t/spikes | corruption stress on real datasets | robust filters, Huberized forecasting, masked reconstruction; kill if robust statistical control matches | robust loss on all objectives | one LDS + Student-t/spikes | multi-system + OOD severity | LOW→MEDIUM | medium/high if distinct from robust filtering |
| 3 | **H3 regime shift:** latent representation transfers across changed dynamics better than forecasting-specific representations | switching LDS with train/test transition-matrix shift | chronological/domain transfer dataset | autoregressive domain adaptation, robust change detector+estimator, TS2Vec; kill if simple adaptation wins | frozen encoder vs finetuned; regime label probe | 2-regime synthetic | multi-regime + chronological external data | MEDIUM | medium; originality pressure from domain adaptation/changepoint work |
| 4 | **H1 long horizon:** latent objective retains slow state while ignoring unpredictable high-frequency detail | slow latent + fast nuisance process | long-horizon multivariate forecasting | DLinear/PatchTST/AR + masked reconstruction; kill if simple low-pass/linear model matches | explicitly low-pass inputs/targets | synthetic slow+fast mixture | multiple horizons/datasets | LOW→MEDIUM | medium; high confound risk |
| 5 | **H5 irregular sampling:** latent target is robust to irregular timing | continuous latent ODE sampled at random times | irregular clinical/sensor dataset if cleanly accessible | interpolation+strong forecaster, neural ODE/state-space controls | time-encoding and interpolation removal | randomly sampled nonlinear oscillator | real irregular data + matched time-aware models | MEDIUM | medium but implementation complexity higher |
| 6 | **H6 multivariate structure:** latent target captures cross-variable dynamics without reconstructing every channel | coupled latent system with nuisance channels | multivariate sensor/traffic/electricity | VAR, channel-mixing Transformer, masked reconstruction | channel permutation / causal-edge deletion | coupled VAR/nonlinear system | broader multivariate datasets | MEDIUM | medium; causal language must be avoided unless intervention supports it |
| 7 | **H7 OOD transfer:** frozen latent state transfers better across domains than forecasting-specific features | parameter-shifted dynamical families | cross-dataset/domain transfer | TS2Vec, MOMENT/frozen foundation encoder, autoregressive adaptation | linear probe vs finetune | train/test parameter shift | multi-domain transfer suite | MEDIUM→HIGH | medium; crowded transfer/foundation-model space |

## Final program decision

**Promote only H2 partial observability to a cheap falsification protocol.**

H4 may become a stress dimension inside H2 rather than a separate paper. H3 is the next independent scientific question only if H2 establishes that latent future prediction recovers state information worth transferring. H1/H5/H6/H7 stay dormant until evidence earns them a slot.

This program succeeds if it finds a narrow, reproducible condition where latent prediction adds information—or a strong negative boundary showing that it does not. It does not succeed by producing a family of renamed JEPA architectures.