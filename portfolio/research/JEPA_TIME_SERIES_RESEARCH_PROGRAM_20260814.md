# JEPA × Time-Series Research Program — 2026-08-14

**State:** `PROGRAM_DEFINED / NO EXPERIMENT AUTHORIZED`  
**Portfolio rule:** one excellent question before multiple papers.  
**Originality boundary:** applying JEPA to time series is already established; this programme must test a narrower mechanism question.

## 1. Literature boundary

Primary-source checks on 2026-08-14 establish that the generic idea is not new:

- **Ennadir, Golkar, Sarra — “Joint Embeddings Go Temporal,” arXiv:2509.25449.** TS-JEPA systematically adapts JEPA to time-series representation learning and evaluates classification plus short/long forecasting. It compares against TS2Vec, masked autoencoding and autoregressive prediction with a matched encoder architecture.
- **Verdenius, Zerio, Wang — “LaT-PFN: A Joint Embedding Predictive Architecture for In-context Time-series Forecasting,” arXiv:2405.10093.** JEPA is combined with PFN-style in-context forecasting and latent stochastic-process representations.
- **Girgis, Valcarce, Bennis — “Time-Series JEPA for Predictive Remote Control under Capacity-Limited Networks,” arXiv:2406.04853.** A time-series JEPA representation is used for predictive remote control.
- **Pieper et al. — “Self-Distilled Representation Learning for Time Series,” arXiv:2311.11335.** A non-contrastive EMA teacher/student objective predicts latent time-series representations from masked views and evaluates forecasting/classification.
- **Li et al. — “Ti-MAE,” arXiv:2301.08871.** Masked input-space reconstruction is an established strong self-supervised time-series baseline.

Therefore none of the following is a sufficient novelty claim:

- “JEPA for time series”;
- EMA teacher/target encoder for time series;
- masked latent prediction in time series;
- latent time-series forecasting alone;
- combining JEPA with a Transformer encoder.

## 2. One primary scientific question

> **When observations contain substantial unpredictable noise or missingness, does strictly causal future-latent prediction learn a representation of the underlying predictive state that transfers across horizons/noise regimes better than masked JEPA, reconstruction, autoregression, self-distillation, contrastive learning, and simple forecasting controls under matched encoder/compute budgets?**

This is a mechanism question about **predictable-state compression**, not a claim that JEPA should win generic forecasting benchmarks.

## 3. Proposed mechanism

Let a latent dynamical state evolve as

`z_{t+1} = F(z_t, u_t) + eps_state`

and observations be

`x_t = G(z_t) + eps_obs`,

where parts of `eps_obs` may be unpredictable from the past, heavy-tailed, structured, missing, or sensor-specific.

A context encoder `E_theta` receives only causal observations `x_{<=t}`. A target encoder `E_bar` receives a future window `x_{t+h:t+h+w}` and is updated by EMA. A predictor `P_phi` predicts the future target representation from the context representation and horizon metadata:

`h_t = E_theta(x_{<=t})`

`y_{t,h} = stopgrad(E_bar(x_{t+h:t+h+w}))`

`y_hat_{t,h} = P_phi(h_t, h)`

`L_future_latent = mean_h d(y_hat_{t,h}, y_{t,h})`

The intended mechanism is not “latent loss is better.” The specific prediction is:

> because unpredictable observation detail cannot be causally inferred from the past, a future-latent objective may preferentially preserve state variables that are stable/predictive across time while discarding observation-specific nuisance variation.

This mechanism is **plausible, not established**. TS-JEPA already argues that latent prediction may help with noise/confounders; the novel value here would require a controlled state-recovery/failure-boundary study rather than a generic benchmark win.

## 4. Primary hypothesis H-PSTATE

### Hypothesis

Under matched encoder/predictor capacity and pretraining budget, **causal future-latent prediction** retains more information about the true predictive state and loses less downstream performance as unpredictable observation corruption increases than the strongest objective-matched baselines.

### Primary falsifier

The hypothesis is falsified for the initial programme if, across the frozen synthetic corruption sweep:

1. causal future-latent pretraining does not improve latent-state probe quality by at least **5 percentage points absolute** over the strongest self-supervised baseline in the high-corruption regime, **or**
2. any state-probe advantage fails to translate into at least one preregistered downstream benefit (forecasting, missing-observation state inference, or cross-noise transfer), **or**
3. a simple linear/state-space/statistical baseline matches the downstream performance, showing that representation learning is unnecessary for the task.

A failed gate ends the programme before broad real-data expansion. Do not tune the corruption schedule or choose a favorable horizon after seeing the result.

## 5. Synthetic diagnostic first

### Data generator

Use at least two dynamical families so a result cannot depend on one toy process:

1. **linear-Gaussian latent state with nonlinear/noisy observation map** — ground-truth state and optimal linear reference are available;
2. **nonlinear switching oscillator / coupled dynamical system** with known latent regime/state.

Generate train/development/test trajectories from disjoint random parameter draws. Freeze all generator seeds and parameter ranges before pretraining.

### Corruption families

Evaluate each method across the same frozen grid:

- additive Gaussian observation noise;
- Student-t heavy-tailed noise;
- sparse large outliers;
- missing-at-random observation blocks;
- structured sensor nuisance independent of latent state;
- combined heavy-tail + missingness.

The initial paper question should **not** add regime shift, irregular sampling, causal discovery and OOD domains simultaneously. Those are follow-ups only after H-PSTATE survives.

### Ground-truth representation metrics

Because synthetic latent state `z_t` is known, evaluate frozen representations using:

- linear-probe `R²` / normalized MSE for continuous state;
- regime classification accuracy where discrete state exists;
- canonical-correlation / subspace similarity after an allowed linear transform;
- nuisance predictability from the representation;
- predictive-state-to-nuisance information tradeoff using probe metrics rather than claiming exact mutual information unless estimated rigorously.

A useful mechanism result should show **more state information and/or less nuisance information**, not merely lower training loss.

## 6. Baseline attack

All neural pretraining baselines use the same tokenizer/encoder width/depth, optimizer family, update count, data and approximately matched FLOPs/parameters unless the objective intrinsically requires an extra predictor/decoder; actual compute must be reported.

### Required objective-matched baselines

1. **TS-JEPA-style masked latent prediction** — direct modern JEPA time-series baseline.
2. **data2vec-style masked latent self-distillation** — EMA teacher, masked-view latent target.
3. **masked input reconstruction / Ti-MAE-style objective.**
4. **causal autoregressive input prediction.**
5. **contrastive representation learning / TS2Vec-family objective.**
6. **no-pretraining/random frozen encoder.**
7. **fully supervised encoder** on each downstream task as an upper/reference bound, not a fair SSL competitor.

### Required non-neural/simple baselines

- persistence / seasonal persistence where meaningful;
- linear autoregression / ridge;
- Kalman filter or state-space estimator on the linear synthetic family;
- simple linear forecasting model on real data;
- tree boosting only for downstream tasks where tabular lag features make it a legitimate competitor.

If a classical state-space model wins the synthetic task, that is scientifically useful and may kill the need for the learned programme.

## 7. Critical ablations

For causal future-latent pretraining:

1. **future → randomly selected masked target** — tests whether causality/future-only target matters;
2. **latent target → raw reconstruction** — isolates representation-space prediction;
3. **EMA target → shared/non-EMA target** where training remains stable;
4. **multi-horizon → single-horizon**;
5. **predictor removed / linear predictor**;
6. **future temporal order shuffled** while marginal distributions are preserved;
7. **nuisance-correlated corruption** versus independent corruption;
8. **target window contains same nuisance realization** versus independently corrupted target view, if the generator permits a clean controlled comparison.

The last ablation is especially important: if both context and target share nuisance information, the objective may simply learn the nuisance rather than suppress it.

## 8. Seed and statistics policy

### Development

- architecture/implementation debugging: seeds `0–2`, results labeled development only;
- protocol selection must end before confirmatory seeds are used.

### Confirmatory synthetic test

- freeze **10 paired seeds** for every neural objective;
- use identical generated trajectories per seed across methods;
- primary statistic: paired difference in high-corruption state-probe score averaged across the two frozen dynamical families;
- report mean, sample SD, paired bootstrap 95% CI and per-seed values;
- effect threshold remains the predeclared 5pp absolute improvement;
- no repeated seed generation after an unfavorable result.

The exact confirmatory seed integers must be committed in the executable experiment manifest before the first confirmatory run.

## 9. Cheap experiment

### Compute class

**S/M — single local GPU or modest cloud GPU; CPU possible for small encoders.**

### Minimum useful screen

- 2 synthetic dynamical families;
- 4 objectives: future-latent, masked latent TS-JEPA, input reconstruction, autoregression;
- encoder <= 1M parameters;
- development seeds only;
- corruption levels `{low, medium, high}` for Gaussian + Student-t + missing blocks;
- state probe + one downstream forecast metric.

### Kill rule

If future-latent representation does not show a consistent state-recovery advantage at high corruption against **both** TS-JEPA-style masked latent prediction and the best reconstruction/autoregressive baseline, stop before real datasets.

## 10. Strong paper experiment if cheap gate survives

### Real-world benchmark selection

Use a small, preregistered set with distinct properties rather than dozens of benchmarks:

1. **ETT** — established long-horizon forecasting benchmark and used in prior TS-JEPA/self-distillation work;
2. **Electricity** — established multivariate forecasting benchmark and used in prior work;
3. one dataset with genuine missing/irregular sensor observations only after verifying its licensing/split conventions and a strong irregular-sampling baseline.

Do not use standard forecasting datasets to claim ground-truth latent-state recovery; the synthetic mechanism diagnostics carry that claim.

### Real-data interventions

From each clean training/evaluation sequence create **frozen artificial corruption views** at evaluation time:

- heavy-tailed observation contamination;
- block missingness;
- sensor-channel corruption;
- train-clean/test-corrupted and train-mixed/test-corrupted settings.

Report both clean and corrupted performance so robustness cannot be purchased by sacrificing ordinary accuracy.

### Downstream tasks

- linear-probe / small-head forecasting at multiple **predeclared** horizons;
- missing-observation forecasting/state inference;
- transfer from clean-pretrained to corrupted evaluation and vice versa.

Avoid choosing only the horizon where JEPA wins. Define a primary horizon aggregate before results.

## 11. Seven requested hypotheses — triaged rather than seven papers

| Hypothesis | Synthetic diagnostic | Real benchmark | Strongest baseline threat | Falsifier | Key ablation | Cheap compute | Paper potential |
|---|---|---|---|---|---|---|---|
| **H1 long-horizon representation** | state-space + oscillator; probe state across horizon | ETT/Electricity | autoregressive + TS-JEPA | no state/long-horizon advantage at frozen horizon aggregate | single vs multi-horizon | S | **fold into H-PSTATE** |
| **H2 partial observability** | block missingness / masked sensors with known state | verified sensor dataset later | state-space filter + masked latent/reconstruction | no state-recovery advantage under missingness | mask pattern/type | S | **PRIMARY SUPPORTING CONDITION** |
| **H3 regime shift** | switching dynamics with train/test parameter split | only after H-PSTATE survives | adaptive state-space + strong forecasting baseline | no OOD transfer advantage | regime labels removed/shuffled | M | follow-up, not initial paper |
| **H4 non-Gaussian noise** | Student-t/outliers with known state | corrupted ETT/Electricity | robust statistical filter + TS-JEPA | no advantage over robust/simple controls | target nuisance coupling | S | **PRIMARY SUPPORTING CONDITION** |
| **H5 irregular sampling** | irregular observation times | later verified irregular sensor data | continuous-time/state-space models | no advantage after time-aware controls | remove delta-time encoding | M | separate follow-up if needed |
| **H6 multivariate causal structure** | coupled latent system with intervention graph | not initial paper | VAR/state-space/graph baselines | no cross-variable state benefit | channel permutation | M | high novelty risk; defer |
| **H7 OOD generalization** | parameter/noise/domain shift | transfer between selected real datasets only if semantically valid | supervised/SSL transfer controls | no transfer improvement | representation frozen vs finetuned | M | fold into H-PSTATE if clean |

**Programme decision:** H2 + H4 are the best first stress conditions for H-PSTATE. H1 supplies the horizon dimension. H3/H5/H6/H7 stay dormant until the core predictable-state mechanism survives.

## 12. What would actually be new?

Potentially meaningful contribution, if supported:

> A controlled demonstration that **strictly causal future-target latent prediction** preferentially recovers latent predictive state and suppresses unpredictable observation nuisance under partial/heavy-tailed observations, with a mapped failure boundary against existing TS-JEPA-style masked latent learning and strong statistical controls.

This would be a **mechanism/empirical boundary contribution**, not invention of JEPA for time series.

If the result is negative, the useful output is still:

> latent future prediction does not outperform masked latent/reconstruction/autoregressive objectives once encoder/compute and robust statistical baselines are matched under known-state synthetic diagnostics.

That negative result would prevent a portfolio-wide proliferation of JEPA time-series variants.

## 13. No-run boundary

No experiment is authorized from this programme document alone. Before execution create one machine-readable experiment freeze containing:

- exact generator code/version and train/dev/test seeds;
- exact encoder/predictor architecture;
- objective definitions;
- baseline implementations;
- corruption grid;
- primary metric and horizon aggregate;
- 5pp effect threshold;
- confirmatory seed list;
- compute budget;
- stop rule;
- raw artifact destination and verifier.

Until that exists, this remains **research programme design**, not experimental evidence.