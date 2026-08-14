# JEPA × TIME-SERIES RESEARCH PROGRAM

**Created:** 2026-08-14  
**Portfolio state:** **C — CONTINUE EXPERIMENTATION (design only)**  
**Execution authorization:** **NONE.** This file does not authorize a development or confirmatory run.  
**Rule:** “JEPA for time series” is not a novelty claim. Existing temporal JEPAs already occupy generic forecasting/representation territory. The program must isolate a narrower mechanism against strong matched objectives and simple statistical baselines.

## Literature boundary checked before hypothesis selection

- Ennadir, Golkar & Sarra, **Joint Embedding go Temporal (TS-JEPA)**, NeurIPS 2024 TSALM Workshop: JEPA-style time-series representation learning with classification/forecasting evaluation.
- Lu et al., **TimeCapsule: Solving the Jigsaw Puzzle of Long-Term Time Series Forecasting with Compressed Predictive Representations**, ICLR 2025 submission lineage: compressed predictive representations with a JEPA component for long-horizon forecasting.
- Dutta et al., **Giving Sensors a Voice: Multimodal JEPA for Semantic Time-Series Embeddings / CHARM**, arXiv:2605.31580 / ICLR 2026 TSALM: JEPA-trained multivariate sensor embeddings across downstream time-series tasks.
- Li et al., **EEG-JEPA: Structured Latent Prediction for EEG Foundation Models**, arXiv:2608.00114: controlled latent-prediction versus masked-waveform reconstruction in noisy physiological time series.

**Consequence:** generic JEPA time-series forecasting, classification, multivariate embeddings, sensor robustness and latent-vs-reconstruction comparisons are already active directions. A new portfolio project must identify a condition in which the objective itself has a falsifiable advantage.

---

# Hypothesis triage

| Candidate | Why it matters | Main risk | Decision |
|---|---|---|---|
| H1 — long-horizon representation | latent prediction may retain slow state and ignore unpredictable detail | generic long-horizon predictive-representation work already exists | **Do not lead with this alone** |
| H2 — partial observability | hidden-state inference is precisely where reconstructing every observation may be wasteful | directly diagnosable with known latent state | **KEEP — primary** |
| H3 — regime shift | a useful state should update when dynamics genuinely change | can accidentally duplicate IRIS | **KEEP only as a stress axis** |
| H4 — non-Gaussian noise | latent targets may ignore unpredictable tails | overlaps robust-memory and noisy-sensor claims | **secondary stress only** |
| H5 — irregular sampling | useful and realistic | adds interpolation/time-encoding confounds | **defer** |
| H6 — multivariate causal structure | potentially important | causal language is not identifiable from ordinary forecasting | **drop causal wording** |
| H7 — broad OOD transfer | attractive | too broad for a first falsifiable study | **defer** |

## Selected primary question

> **Under matched encoder, data and compute budgets, does latent future prediction recover a task-useful dynamical state more robustly than masked reconstruction, autoregressive prediction and contrastive representation learning when observations are partially missing/corrupted, with a preregistered regime change used only as a stress test?**

The scientific object is **hidden-state recoverability under partial observability**, not generic forecasting accuracy.

---

# Pre-freeze scientific specification

Nothing below becomes immutable until `TSJEPA-FREEZE-001` selects exact generators, architectures, metric, thresholds, seeds and hashes and passes skeptical review.

## QUESTION

Does a JEPA-style latent future objective preserve predictable hidden dynamical state while suppressing unreliable observation detail better than matched alternative objectives?

## HYPOTHESIS

When observations are incomplete or corrupted but latent dynamics remain predictable, a JEPA-style encoder trained to predict future target embeddings will retain more recoverable latent-state information and degrade more slowly as observation reliability worsens than matched masked-reconstruction, autoregressive and contrastive objectives. Any advantage must survive a preregistered regime-switch stress rather than existing only in one stationary clean regime.

## PROPOSED MECHANISM

**Objective-level selective predictability:** preserve context features that predict a future latent target instead of reconstructing all observation detail. If the mechanism is real, representation quality should separate most clearly when unpredictable/missing observation components increase while latent state remains predictable.

This does **not** imply automatic denoising, causal discovery, universal robustness or generic forecasting superiority.

## NOVELTY BOUNDARY

### Established
- JEPA latent prediction;
- JEPA for time series;
- predictive/compressed forecasting representations;
- masked reconstruction, autoregressive and contrastive time-series SSL;
- missing/noisy sensor robustness evaluation.

### Potentially meaningful residual contribution
A **matched objective-level diagnostic with known ground-truth hidden state** that measures how latent-state recoverability changes across controlled missingness/corruption and a fixed regime-switch stress.

### Explicit non-claims
- first JEPA for time series;
- universal forecasting superiority;
- causal discovery;
- robustness to arbitrary distribution shift;
- superiority over foundation models without direct evaluation.

## ALLOWED PRIMARY CLAIM IF SUCCESSFUL

> Under the frozen tested systems and perturbation conditions, latent future prediction preserves more recoverable hidden-state information and/or has a better degradation frontier than the strongest matched alternative objective.

Nothing broader.

## FALSIFIER

The first version is defeated if either:

1. JEPA fails to beat the strongest matched representation objective on the frozen primary hidden-state-recovery statistic across preregistered partial-observation conditions; or
2. an apparent clean advantage disappears/reverses under missingness/corruption or the fixed regime-switch stress, leaving no better degradation frontier.

If a simple statistical/forecasting baseline wins a downstream task, report it prominently. It falsifies any forecasting-superiority claim but not necessarily representation recovery unless forecasting was frozen as the primary claim.

---

# Synthetic diagnostic first

## Dataset A — switching linear dynamical system

Use a state-space system with known hidden state `z_t`, multivariate observations `x_t = C z_t + noise`, and one frozen switch between stable transition matrices. Freeze independently:

- state and observation dimensions;
- transition matrices and stability checks;
- observation matrix;
- trajectory lengths;
- missingness levels;
- Gaussian observation noise;
- sparse impulse corruption;
- optional heavy-tail stress;
- regime-switch time and magnitude.

**Reason:** the hidden state is known, so the hypothesis can be tested directly instead of inferred from forecasting performance.

### Primary metric

Select **exactly one** before execution: standardized hidden-state MSE, `R²`, or another scale-insensitive state-recovery statistic. A frozen linear probe from representation to true latent state is the default diagnostic.

### Secondary metrics

- one-step and long-horizon latent-state prediction;
- downstream observation forecasting;
- post-switch state recovery;
- degradation slope/frontier versus missingness/corruption;
- parameter count, training examples/steps, wall time and peak memory.

## Dataset B — nonlinear sanity check

Only if Dataset A leaves a reproducible residual effect, freeze one low-dimensional nonlinear state-space generator with exact integrator/sampling/noise specification. Do **not** add nonlinear systems post-hoc to rescue an unfavorable Dataset A.

---

# Real-world gate

Proceed to real data only if the synthetic diagnostic survives the strongest matched objectives and its effect is stable enough to justify further cost.

Before real execution, freeze **two public datasets with different temporal structure**, exact versions/licenses/splits/chronology, missingness injection, regime-stress construction, and a real-data primary endpoint. The real-data endpoint cannot retroactively replace the synthetic hidden-state endpoint.

---

# Dangerous baselines

## Matched representation-objective baselines

Use the same encoder/backbone budget wherever possible:

1. **masked reconstruction**;
2. **autoregressive future-observation prediction**;
3. **competent contrastive predictive representation learning**;
4. **simple latent prediction without the proposed teacher/target design**;
5. **random/frozen encoder** diagnostic.

## Downstream forecasting/task baselines

Where applicable:

1. persistence;
2. seasonal persistence;
3. linear autoregression / appropriate statistical model;
4. strong simple linear forecasting such as DLinear/NLinear-class modeling;
5. competent patch/Transformer baseline such as PatchTST-class modeling;
6. any task-specific statistical method that is an obviously dangerous control.

A complex neural comparison is irrelevant if persistence or a simple linear baseline is stronger.

---

# Required ablations

- latent target vs raw reconstruction, same backbone;
- target/teacher design vs a standard alternative if used;
- nonlinear vs linear predictor;
- shuffled temporal targets;
- matched parameter count;
- matched optimizer/training-step and example budget;
- matched missingness/mask exposure;
- matched context length;
- corruption-only vs regime-switch-only;
- fixed alternate target horizon chosen before results.

If an ablation does not affect the result, remove the associated mechanism claim.

---

# Statistics and seed policy

## Cheap development stage — only after freeze

Target design:
- tiny matched models;
- switching LDS only;
- 3 **development** seeds;
- small frozen grid of missingness/corruption levels;
- same training examples/steps across objectives;
- no confirmatory scientific conclusion.

Purpose: verify implementation, baseline competence, variance scale and whether any residual effect exists.

## Confirmatory stage

Before any confirmatory seed is run, freeze:

- architecture and parameter-matching tolerance;
- generator/data hashes;
- development/validation/confirmatory seed sets;
- primary metric;
- aggregation statistic and uncertainty interval;
- perturbation levels;
- regime-switch design;
- optimization budget;
- practically meaningful promotion threshold;
- analysis script hash;
- stop rule.

Use at least five confirmatory seeds unless a documented development variance/power analysis requires more. Do not rerun until significance appears. Prefer paired comparisons using matched trajectories/seeds and report effect size with uncertainty.

---

# Compute boundary

- **Development:** low; tiny synthetic models first. Measure wall time/memory before any expansion.
- **Confirmatory:** medium at most for the first study; cost scales with objective × seeds × perturbation settings. Freeze a hard CPU/GPU-hour budget after profiling and before confirmatory execution.
- **No large foundation-model training** is justified at the first gate.

If matched synthetic objectives show no stable effect, scale is not a rescue strategy.

---

# Paper potential and kill rule

### If positive and independently reproduced
Potential mechanism-focused time-series representation paper: **where latent future prediction helps hidden-state recovery under partial observability and where it breaks**, not “JEPA works on time series.”

### If negative
Still scientifically useful if controls are competent: it would bound claims that selective latent prediction inherently improves state recovery relative to matched reconstruction/autoregression/contrastive learning.

### Kill criterion
Archive active work for this cycle if the cheap matched synthetic diagnostic shows no stable hidden-state-recovery advantage and no informative mechanism/failure after implementation and baseline verification. Do not move to larger datasets merely to search for a favorable benchmark.

---

# Next eligible task — not yet queued

**TSJEPA-FREEZE-001 — protocol freeze only.**

Required deliverable:
- exact switching-LDS generator;
- encoder/backbone/objective definitions;
- baseline implementations;
- one primary metric;
- development seed list;
- perturbation grid;
- parameter/compute-matching tolerance;
- hard compute cap;
- falsifier and promotion threshold;
- artifact destinations;
- independent pre-run protocol review.

This task does **not** enter the current top-10 automatically and does **not** authorize a run. It may enter only after `PORTFOLIO-RESCORE-001` explicitly allocates room without expanding the flagship set.
