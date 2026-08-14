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

# Lead question — H2: partially observed dynamical state

> **When observations are incomplete and contain unpredictable nuisance noise, does latent future prediction learn a representation of the underlying dynamical state that is more recoverable and more useful for forecasting than reconstruction, autoregression, contrastive learning, or simple statistical state estimation?**

This is the only hypothesis initially authorized for execution because synthetic systems provide a known latent state, so “better representation” can be tested directly rather than inferred from one downstream metric.

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

1. on known-state synthetic systems, JEPA does **not** improve hidden-state recovery over the best matched SSL baseline by a predeclared practically meaningful margin; or
2. any state-recovery advantage does not translate into a separately frozen forecasting/missingness benefit, or is matched by a simple linear/statistical filter.

No architecture rescue is allowed after viewing confirmatory seeds.

## Synthetic diagnostics

### S1 — linear dynamical system, partial observation

Stable linear state transition; observation matrix hides part of state; Gaussian observation noise; oracle Kalman filter as strong reference where assumptions are correct.

### S2 — nonlinear smooth dynamics

Nonlinear latent transition and observation map with controlled predictability and partial channel visibility.

### S3 — switching/regime dynamics

Small number of latent transition regimes; regime changes independent of observation noise; evaluate hidden-state recovery/adaptation around transitions.

### S4 — structured nuisance/noise stress

Hold latent dynamics fixed while varying Gaussian noise, Student-t/heavy tails, sparse spikes, channel dropout, contiguous missing windows, and high-variance nuisance channels with zero influence on latent transition.

## Real-data phase

Only after the synthetic mechanism survives. Candidate public families: ETT-style multivariate forecasting, Electricity, Weather, plus one genuinely irregular/missing domain if data licensing/preprocessing can be frozen cleanly. Artificial masks on complete datasets must be described as controlled robustness interventions, not natural missingness.

## Dangerous baselines

### Statistical/trivial

- persistence and seasonal persistence;
- AR/VAR or ridge autoregression;
- exponential smoothing/ARIMA where appropriate;
- Kalman filter on S1;
- interpolation + linear forecasting for missingness.

### Learned forecasting

- DLinear/NLinear-style simple linear forecasting;
- GRU/LSTM;
- TCN;
- PatchTST-style patch Transformer;
- one competent contemporary forecasting/foundation-model characterization if reproducible.

### Representation learning

- masked reconstruction / Ti-MAE-style objective;
- contrastive / TS2Vec-style objective;
- autoregressive next-window prediction;
- TS-JEPA reference configuration where reproducible;
- **simple latent-prediction control** with the same encoders but removing any JEPA-specific target/EMA/stop-gradient choice being tested;
- frozen pretrained time-series encoder + linear head where a well-defined open checkpoint exists.

The strongest baseline is the one that performs best under the frozen protocol, not the one most convenient to beat.

## Required ablations

1. raw future prediction instead of target-latent prediction;
2. masked reconstruction with same encoder capacity;
3. contrastive loss with matched encoder/data/steps;
4. no target EMA / alternate target update where applicable;
5. frozen random target encoder diagnostic;
6. predictor replaced by linear map;
7. parameter-matched shallow/deep predictor;
8. target-horizon sweep frozen before confirmatory evaluation;
9. reduced/expanded context length;
10. temporal-order shuffle negative control;
11. shuffled future targets negative control;
12. remove/add nuisance channel;
13. missingness-only vs observation-noise-only cells.

## Metrics

### Primary synthetic mechanism metric

**Hidden-state linear-probe `R²`** on an untouched synthetic test split, averaged across latent dimensions by a predeclared rule.

Also retain forecast MSE/MAE from a frozen lightweight head, corruption/missingness curves, representation sensitivity under paired nuisance perturbation at fixed latent state, and collapse/failure frequency across seeds.

### Real-data primary

Use one frozen normalized forecasting-error aggregation across datasets/horizons; report MSE/MAE per dataset/horizon as secondary outcomes. Do not choose the aggregate after seeing results.

### Compute accounting

Record trainable parameters, optimizer steps/examples, wall time, peak memory, and inference latency where relevant.

## Seed/statistics policy

Cheap development: 3 seeds/cell, no formal significance claim, only to kill obviously weak/debugging configurations.

Confirmatory synthetic, only after candidate/baselines freeze: at least 10 paired seeds per primary synthetic family/corruption cell; paired effect estimates; mean/median effect, justified 95% interval, seed-level failure frequency; no seed deletion except preregistered invalid-execution criteria.

Real data: at least 5 frozen seeds for stochastic trained baselines where material; deterministic/statistical methods are not padded with fake seeds; report per-dataset outcomes.

## Proposed advancement gate — design values only

Freeze before confirmatory results:

- `>=0.03` absolute hidden-state probe `R²` improvement over the best matched learned SSL baseline on the primary synthetic aggregate;
- positive effect on at least 3 of 4 synthetic diagnostic families without catastrophic regression in the fourth;
- `>=3%` relative improvement on the frozen missing/corrupted forecasting aggregate versus the best matched learned representation baseline;
- no advantage attributable solely to capacity, optimization steps, or baseline weakness.

These are proposed thresholds, **not achieved results**. Any change must occur before confirmatory evidence is viewed and retain a reason.

## Cheapest decisive experiment

Run only S1 + one nonlinear system with JEPA latent target, masked reconstruction, autoregressive raw-future prediction, TS2Vec-style contrastive objective, simple latent-prediction control, and Kalman/linear reference on S1. Use two missingness levels and two nuisance-noise levels. If JEPA does not show coherent hidden-state-recovery benefit, stop before real-data scaling.

## Strong paper experiment

Only if cheap falsification survives: S1–S4 + real multivariate data; matched capacity/steps/data; full ablations; 10 paired synthetic seeds / >=5 learned real-data seeds; OOD severity/regime-shift tests; compute accounting; independent metric recomputation; fresh-worktree reproduction; reviewer attack against “this is just masking/denoising/target smoothing.”

## Kill criteria

Archive the lead hypothesis if TS-JEPA/reference or simple latent prediction already gives the same effect; masked reconstruction or contrastive learning matches hidden-state recovery; Kalman/simple filters dominate all interpretable diagnostics; effect exists only at hand-picked corruption; representation collapse explains the probe; downstream gains disappear after matched preprocessing/capacity; or real-data phase requires inaccessible data/impractical compute.

A clean null result remains useful: it would define conditions where latent future prediction adds no extra state information over reconstruction/contrastive/statistical estimation.

# Ranked hypothesis bank — not separate active projects

| Rank | Hypothesis | Synthetic first | Strongest baseline / falsifier | Compute | Paper potential |
|---:|---|---|---|---|---|
| **1** | **H2 partial observability:** latent prediction preserves hidden state under missing/corrupted observations | partially observed LDS + nonlinear known-state system | Kalman/VAR + masked reconstruction + TS2Vec + TS-JEPA/simple latent prediction | LOW→MEDIUM | **HIGH if mechanism survives** |
| 2 | H4 non-Gaussian nuisance | same dynamics with Gaussian vs Student-t/spikes | robust filters/Huberized forecasting + masked reconstruction | LOW→MEDIUM | medium/high if distinct from robust filtering |
| 3 | H3 regime shift | switching LDS with parameter shift | autoregressive adaptation + robust detector/estimator + TS2Vec | MEDIUM | medium |
| 4 | H1 long horizon | slow latent + fast nuisance | DLinear/PatchTST/AR + low-pass controls | LOW→MEDIUM | medium, confound risk high |
| 5 | H5 irregular sampling | continuous latent system sampled irregularly | interpolation + strong forecaster / time-aware state-space controls | MEDIUM | medium |
| 6 | H6 multivariate structure | coupled latent system + nuisance channels | VAR/channel-mixing Transformer/masked reconstruction | MEDIUM | medium; avoid causal language without intervention |
| 7 | H7 OOD transfer | parameter-shifted dynamical families | TS2Vec/MOMENT/frozen foundation encoder + adaptation | MEDIUM→HIGH | medium; crowded area |

## Final program decision

**Promote only H2 partial observability to a cheap falsification protocol.** H4 is a stress axis inside H2, not a separate paper. H3 becomes independently eligible only if H2 shows latent future prediction recovers state information worth transferring. H1/H5/H6/H7 remain dormant until evidence earns a slot.

This program succeeds by finding a narrow reproducible condition where latent prediction adds information—or a strong negative boundary showing it does not. It does not succeed by producing a family of renamed JEPA architectures.