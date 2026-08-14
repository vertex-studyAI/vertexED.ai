# JEPA × TIME-SERIES RESEARCH PROGRAM

**Created:** 2026-08-14  
**State:** research design only; **no confirmatory experiment is authorized by this file**.  
**Rule:** “JEPA for time series” is not itself a novelty claim. TS-JEPA, TimeCapsule, CHARM and other 2026 temporal/physiological JEPAs already occupy that space. The program must answer a narrower causal question against strong matched objectives and simple forecasting baselines.

## Literature boundary checked before hypothesis selection

- Ennadir, Golkar & Sarra, **Joint Embedding go Temporal (TS-JEPA)**, NeurIPS 2024 TSALM Workshop: adapts JEPA to time-series representation learning and evaluates classification/forecasting.
- Lu et al., **TimeCapsule: Solving the Jigsaw Puzzle of Long-Term Time Series Forecasting with Compressed Predictive Representations**, ICLR 2025 submission lineage: uses predictive compressed representations with a JEPA component for long-term forecasting.
- Dutta et al., **Giving Sensors a Voice: Multimodal JEPA for Semantic Time-Series Embeddings / CHARM**, arXiv:2605.31580 and ICLR 2026 TSALM: JEPA-trained multivariate time-series embeddings across anomaly detection, classification and forecasting.
- Li et al., **EEG-JEPA: Structured Latent Prediction for EEG Foundation Models**, arXiv:2608.00114: controlled latent-prediction vs masked-waveform reconstruction in noisy physiological time series.

**Consequence:** generic forecasting, classification, multivariate representation learning, sensor-noise robustness, and latent-vs-reconstruction comparisons are all already active prior-work directions. A new project must isolate a condition/mechanism, not a modality.

---

# Hypothesis triage

| Candidate | Why it matters | Novelty/evidence risk | Decision |
|---|---|---|---|
| H1 long-horizon representation | JEPA may retain slow state while ignoring unpredictable observation detail | Generic long-horizon forecasting with JEPA/compressed representations is already studied | **Do not lead with this alone** |
| H2 partial observability | Latent prediction should infer hidden state rather than reconstruct missing/noisy observations | Mechanistically aligned with JEPA and directly falsifiable with known synthetic latent state | **KEEP** |
| H3 regime shift | A useful latent state should update when dynamics genuinely change | Important, but overlaps IRIS if framed as robust adaptation | **KEEP only as a stress axis, not a new IRIS clone** |
| H4 non-Gaussian noise | Latent objectives may avoid unpredictable heavy-tail detail | High overlap with existing robust-memory work and 2026 noisy-sensor JEPA claims | **SECONDARY STRESS ONLY** |
| H5 irregular sampling | Latent state inference may help asynchronously observed systems | Scientifically interesting but adds substantial modeling/engineering confounds | **DEFER** |
| H6 multivariate causal structure | Latent targets may capture cross-variable dynamics | “Causal” interpretation is hard to identify from observational forecasting | **DROP causal wording** |
| H7 broad OOD generalization | Representation may transfer better across domains | Too broad to falsify cleanly in first study | **DEFER** |

## Selected primary question

> **Under matched encoder, data and compute budgets, does latent future prediction recover a task-useful dynamical state more robustly than masked reconstruction, autoregressive prediction and contrastive representation learning when observations are partially missing/corrupted and the underlying dynamics undergo a genuine regime change?**

This combines H2 with a bounded H3 stress test. The scientific object is **hidden-state recovery under partial observability**, not generic forecasting accuracy.

---

# Frozen research specification — development stage

## QUESTION

Does a JEPA-style latent future objective learn representations that preserve predictable hidden dynamical state while suppressing unpredictable/missing observation detail better than matched alternative objectives?

## HYPOTHESIS

When the observation process is incomplete or corrupted but the underlying latent dynamics remain predictable, a JEPA-style encoder trained to predict future target embeddings will retain more recoverable latent-state information and degrade more slowly with increasing missingness/corruption than matched masked-reconstruction, autoregressive and contrastive objectives. The advantage should persist through a predeclared regime-switch stress rather than disappear when the system dynamics change.

## MECHANISM

The proposed mechanism is **objective-level selective predictability**: the learner is rewarded for preserving features of context that predict a future latent target, rather than reconstructing all observed detail. If this mechanism is real, the representation should improve recovery of the known hidden state specifically when observation-level information is unreliable but future state remains predictable.

This is not a claim that JEPA automatically denoises, understands causality, or solves non-stationarity.

## NOVELTY BOUNDARY

### Established
- JEPA latent prediction;
- JEPA for time series;
- time-series forecasting with latent/compressed predictive representations;
- masked reconstruction, autoregression and contrastive time-series SSL;
- robustness evaluation under missing/noisy sensor observations.

### Potentially meaningful difference
A **controlled objective-level causal diagnostic with known hidden state**, explicitly measuring how latent-state recoverability changes as observation missingness/corruption and regime changes are varied under matched architecture/compute.

### Not claimed
- first JEPA for time series;
- universal forecasting superiority;
- causal discovery;
- robustness to arbitrary distribution shift;
- superiority over time-series foundation models without direct evaluation.

## PRIMARY CLAIM ALLOWED IF THE STUDY SUCCEEDS

Only:

> Under the frozen tested systems and corruption/regime conditions, latent future prediction preserves more recoverable hidden-state information and/or degrades more slowly than the strongest matched alternative objective.

Forecasting gains are secondary unless independently preregistered.

## NON-CLAIMS

- representation is universally better;
- hidden-state recovery proves causal structure;
- JEPA beats all forecasting models;
- synthetic success implies real-world benefit;
- one real dataset proves OOD generalization.

## FALSIFIER

The primary hypothesis is defeated for this version if either of the following occurs under the frozen matched-budget protocol:

1. JEPA does not outperform the best matched representation-learning objective on the primary hidden-state recovery statistic across the preregistered partial-observation conditions; **or**
2. any apparent clean-condition advantage disappears/reverses under missingness/corruption or the frozen regime-switch stress, such that the degradation frontier is not better than the strongest matched objective.

A simple statistical/forecasting baseline winning the downstream task is also reported prominently; it does not by itself falsify representation recovery unless the paper claims forecasting superiority.

---

# Synthetic diagnostic first

## Dataset A — switching linear dynamical system (primary)

Generate a state-space system with known hidden state `z_t`, multivariate observations `x_t = C z_t + noise`, and a frozen switch between two stable transition matrices. Control independently:

- observation missingness;
- additive Gaussian noise;
- sparse impulse corruption;
- optional heavy-tail observation noise as a secondary stress;
- regime-switch time and magnitude.

**Why first:** the latent state is known, so the hypothesis can be tested directly rather than inferred from forecasting alone.

### Primary metric
A frozen linear probe from representation to true latent state, evaluated on held-out trajectories. Report a scale-insensitive state-recovery metric such as standardized MSE and/or `R²`; select exactly one as primary before the experiment ID is activated.

### Secondary metrics
- one-step and long-horizon state prediction;
- downstream observation forecasting;
- regime identification after the switch;
- representation degradation as missingness/corruption increases;
- compute/runtime and parameter counts.

## Dataset B — nonlinear sanity check

A small nonlinear dynamical system with known state (for example a controlled low-dimensional chaotic/state-space process) may be used only after Dataset A. The exact generator, integrator, sampling interval and noise model must be frozen before execution.

Do not add nonlinear systems post-hoc because Dataset A was unfavorable.

---

# Real-world benchmark gate

Only proceed if the synthetic diagnostic shows a preregistered, reproducible residual effect that survives dangerous matched objectives.

Use **two public time-series datasets** with different structures, selected and version-pinned before real-data execution. Candidate families include standard electricity/transformer/weather benchmarks, but the exact files, splits, licenses, chronology, missingness injection and regime-stress construction must be frozen in the experiment registry first.

Because real datasets do not expose true dynamical state, the real-world primary endpoint must be chosen separately and cannot retroactively replace the synthetic hidden-state endpoint.

---

# Dangerous baselines

## Representation-objective baselines — same encoder/backbone budget wherever possible

1. **Masked reconstruction** of observations.
2. **Autoregressive future observation prediction**.
3. **Contrastive predictive representation learning** with a competent time-series objective.
4. **Simple latent prediction without the proposed target/teacher design**, to test whether “latent” alone is enough.
5. **Frozen/random encoder** diagnostic.

## Forecasting/task baselines

1. persistence;
2. seasonal persistence when seasonality is present;
3. linear autoregression / appropriate statistical model;
4. a strong simple linear forecasting family such as DLinear/NLinear where applicable;
5. a competent patch/Transformer time-series baseline such as PatchTST-class modeling under matched data;
6. task-specific statistical baseline if the dataset makes one obviously dangerous.

Do not claim scientific advance because a complex neural baseline is beaten while persistence or a simple linear model is stronger.

---

# Required ablations

- latent target vs raw reconstruction using the same backbone;
- teacher/target encoder frozen or EMA vs standard alternative, if that component is part of the implementation;
- linear predictor instead of nonlinear predictor;
- shuffled temporal targets;
- matched parameter count;
- matched optimizer/training-step budget;
- matched mask/missingness exposure;
- context-length matched controls;
- remove regime switch while keeping corruption;
- remove corruption while keeping regime switch;
- alternate target horizon fixed before results.

Ablations that fail to affect the result remove the associated mechanism claim.

---

# Statistics and seed policy

## Cheap development experiment

- tiny matched models;
- synthetic switching LDS only;
- 3 development seeds;
- small fixed grid of missingness/corruption levels;
- all objectives trained for the same examples/steps;
- no confirmatory conclusion.

Purpose: determine whether the hypothesis has enough signal to justify a frozen confirmatory protocol and identify implementation bugs/baseline failures.

## Strong experiment

Before it starts, freeze:

- architecture and parameter-matching tolerance;
- datasets/generators and hashes;
- train/validation/confirmatory seeds;
- primary metric;
- aggregation rule;
- uncertainty interval;
- exact corruption levels;
- regime-switch design;
- optimization budget;
- minimum practically meaningful effect or other promotion gate;
- analysis script hash.

Use at least five confirmatory seeds unless variance from development justifies more. The final seed count must be chosen from a documented power/variance rationale, not rerun until significance appears.

Paired comparisons should use matched data/seed draws where possible. Report effect size and uncertainty even if no significance test is used.

---

# Compute boundary

- **Cheap stage:** low; synthetic tiny-model experiment intended to fit comfortably within existing local/small-GPU resources. Measure actual wall-time/memory before expanding.
- **Strong stage:** medium; multiplicative cost comes from objectives × seeds × corruption/regime settings. Set a hard GPU/CPU-hour budget after profiling the cheap stage and before confirmatory execution.
- No large foundation-model training is justified for the first scientific gate.

If the matched synthetic experiment cannot expose a real objective-level effect, scale is not a rescue strategy.

---

# Paper potential

### If positive and replicated
Potentially a **mechanism-focused time-series representation-learning paper**: not “JEPA works on time series,” but “latent future prediction has a measurable advantage for hidden-state recovery under partial observability, and here is where the advantage breaks.”

### If negative
Still useful if the study is well controlled: a result showing that JEPA's proposed selective-predictability advantage disappears against matched reconstruction/autoregressive/contrastive objectives would constrain an increasingly active time-series JEPA direction.

### Kill criterion
Archive the active program for this cycle if the cheap matched synthetic diagnostic shows no stable hidden-state-recovery advantage and no interpretable failure mechanism after implementation/baseline verification. Do not move to larger datasets merely to search for a favorable benchmark.

---

# Next eligible task

**TSJEPA-FREEZE-001 — protocol freeze, not experiment execution.**

Deliverable:
- exact switching-LDS generator;
- encoder/backbone and objective definitions;
- baseline implementations;
- primary metric selection;
- development seed list;
- corruption/missingness grid;
- compute cap;
- falsifier;
- artifact destinations;
- independent pre-run protocol review.

This task is **not inserted ahead of the current canonical P0 queue**. NeuroCAD's already-authorized dangerous-baseline experiment and LAM paper closure retain priority. The JEPA×time-series program becomes runnable only when the portfolio rescore explicitly allocates a scientific experiment slot.
