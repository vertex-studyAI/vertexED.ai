# Research paper factory — evidence audit

**Audit date:** 12 August 2026  
**Rule:** manuscript work follows evidence; manuscript prose does not upgrade project maturity.

## Portfolio-level verdict

The connected Project 2424 evidence does **not** support calling any audited candidate submission-ready today. The strongest current artifacts are bounded synthetic mechanism studies with real code/tests/results; other potentially rich projects remain source-recovery exercises. This document selects only three candidates and preserves those distinctions.

## Ranked candidates

### 1. T2424-0025 — robust attention-memory aggregation under heavy-tailed contamination

**Why #1:** canonical merged implementation, deterministic experiment, 30-seed original screen, explicit clean control, focused regression tests, and a falsifiable mechanism claim. A 12 August follow-up branch adds mean/median/trimmed/Huber ablations across six contamination rates and 50 seeds per condition.

**Current defensible claim:** under the current attention-addressed synthetic memory construction, robust value aggregation substantially reduces retrieval MAE relative to the arithmetic mean under Cauchy contamination.

**Critical limitation:** this is not a Transformer and the clean control also benefits from robust aggregation. The current task therefore does not isolate a uniquely non-Gaussian architectural advantage.

**Submission verdict:** **not ready**. Best current use is a reproducible mechanism-study seed.

### 2. T2424-0030 — Adaptive Theory Geometry in World Models

**Why #2:** merged bounded implementation with a 20-seed curved-trajectory screen, explicit constant-velocity baseline and straight-motion negative control. The retained result is large and interpretable on the synthetic generator.

**Current defensible claim:** a transparent constant-curvature extrapolator can outperform constant velocity on the synthetic curved trajectories it is designed for while matching the straight negative control.

**Critical limitation:** the comparison lacks stronger kinematic baselines, noisy/regime-switching data, multi-step rollout evidence and external trajectories. It is not a learned neural world model.

**Submission verdict:** **not ready**. Potentially useful after stronger baselines and external replication.

### 3. T2424-0019 — Neural Predictive Memory Spectroscopy (NPMS)

**Why #3:** the recovered evidence report is unusually rich: retained tests, compact runs, ablations, robustness records and a manuscript exist.

**Critical limitation:** the original isolated source/results tree is not currently reproduced from canonical Git source. Existing metrics are recovery evidence, not a fresh canonical rerun. Important negative findings also remain unresolved, including weak spectral recovery in several conditions and metric-design issues.

**Submission verdict:** **blocked on source migration and reproduction**. Do not polish the historical manuscript into a submission before the executable evidence is restored.

## Candidate audit matrix

| Candidate | Implementation | Baseline | Experiment | Multi-seed | Negative/control evidence | Reproducibility state | Manuscript readiness |
|---|---|---|---|---|---|---|---|
| T2424-0025 NGM readout | yes, merged bounded mechanism | weighted mean | synthetic Gaussian/Cauchy memory | yes | clean control; full contamination sweep in follow-up | strong for bounded screen; follow-up CI pending | skeleton now; submission no |
| T2424-0030 ATG | yes, merged bounded mechanism | constant velocity | synthetic curved/straight trajectories | yes | straight-motion control | runnable connected package | skeleton possible; submission no |
| T2424-0019 NPMS | canonical recovery wrapper; original source missing | recorded historical comparisons | retained historical controlled experiments | recorded | several negative findings preserved | incomplete until source/hash rerun | blocked |

## Strongest manuscript skeleton — T2424-0025

### Working title

**Robust Attention-Memory Aggregation under Heavy-Tailed Value Corruption: A Controlled Mechanism Study**

Avoid “Non-Gaussian Memory Transformer” in the paper title until an actual learned Transformer or sequence model is evaluated.

### Abstract — evidence-constrained draft

Attention-addressed memory commonly summarizes retrieved values with a weighted mean, making the readout sensitive to extreme values. We study a bounded synthetic memory-retrieval setting in which the attention distribution is held fixed and only the aggregation statistic changes. The existing canonical experiment compares an attention-weighted mean against a weighted median under Gaussian noise and Cauchy-contaminated values across deterministic seeds. A follow-up ablation additionally compares weighted median, weighted trimmed mean and a weighted Huber location across a fixed contamination-rate sweep. The current evidence shows large reductions in retrieval mean absolute error for robust readouts under the authored heavy-tail conditions. However, robust readouts also improve the clean control, so the present experiment does not establish a uniquely non-Gaussian architectural benefit. These results motivate a learned sequence-retrieval study with stronger baselines and multiple corruption families. **No claim of Transformer superiority, real-world robustness or publication novelty is made at this stage.**

### 1. Introduction

- Problem: attention-weighted means can be sensitive to extreme retrieved values.
- Narrow question: does changing only the aggregation rule improve robustness in a controlled memory retrieval screen?
- Contribution currently supported:
  1. deterministic synthetic memory mechanism;
  2. fixed-attention robust aggregation comparison;
  3. clean-control and contamination sweep;
  4. explicit negative/limiting result that robust benefit is not unique to contaminated conditions.
- Do not claim a new Transformer architecture.

### 2. Related Work

**CITATIONS REQUIRED BEFORE DRAFT COMPLETION. Do not invent them.** Verify primary literature in these categories:

- robust location estimation: median, trimmed means, Huber estimators;
- robust statistics under heavy-tailed contamination;
- attention and external-memory readout mechanisms;
- robust neural sequence/memory architectures;
- heavy-tailed noise in learned systems where directly relevant.

The final manuscript must cite only references that have been individually verified.

### 3. Method

#### 3.1 Synthetic memory construction

Document exactly:

- 24 latent anchors on `[0,1]`;
- 7 replicas per anchor;
- deterministic smooth latent signal;
- noisy keys;
- Gaussian value noise for clean control;
- Cauchy contamination for heavy-tail conditions;
- deterministic RBF attention kernel.

#### 3.2 Readouts

- weighted arithmetic mean;
- weighted median;
- follow-up: 10% weighted trimmed mean;
- follow-up: weighted Huber location with fixed delta.

Hold attention weights constant across readouts.

#### 3.3 Claim boundary

The method is a readout mechanism screen; it is not a trained Transformer, learned memory, or language model.

### 4. Experimental Setup

Current experiment:

- original screen: 30 deterministic seeds;
- follow-up sweep: 50 deterministic seeds per contamination condition;
- contamination rates: 0, 5%, 10%, 18%, 25%, 35%;
- primary metric: retrieval MAE;
- report sample standard deviations and complete condition table.

Required before submission:

- freeze train/validation/test learned retrieval task;
- add no-memory and standard learned-memory baselines;
- add Gaussian/reference memory baseline;
- add multiple corruption families;
- add accuracy/calibration or task metric beyond scalar latent reconstruction;
- record parameter count, memory, throughput and wall-clock compute;
- define primary hypothesis and threshold before final runs.

### 5. Results

Current existing result table belongs here with explicit labels separating:

- merged original 30-seed screen;
- exploratory 12 August 50-seed follow-up;
- future learned-task results.

Never combine these as though they were one preregistered experiment.

### 6. Ablations

Current:

- mean vs median;
- median vs trimmed vs Huber;
- contamination-rate sweep;
- clean control.

Required:

- robust-readout hyperparameter sensitivity;
- contamination type;
- contamination magnitude;
- memory size/replicas;
- attention temperature;
- learned vs fixed attention;
- compute overhead.

### 7. Limitations

Must include at least:

- fully synthetic current data;
- deterministic engineered memory construction;
- no learned sequence model;
- clean-control robust improvement confounds a uniquely non-Gaussian interpretation;
- Cauchy outliers create high mean variance;
- no verified novelty claim yet;
- benchmark/task co-design risk;
- no independent reproduction yet.

### 8. Discussion

Frame the current result as evidence for exploring robust memory readouts, not as evidence for a new model family. Discuss why median dominates under current construction and why a learned task may reverse or reduce that advantage.

### 9. Conclusion

A conclusion is justified only at the mechanism level: robust aggregation is promising in the bounded synthetic screen, but architectural/general claims require learned-task evidence.

### References

`TODO — VERIFIED REFERENCES ONLY.`

No placeholder citation should be converted into a real-looking bibliographic entry without source verification.

### Appendix

Include:

- exact environment/runtime versions;
- all seeds;
- fixed configs;
- complete contamination table;
- commands;
- raw JSON outputs;
- implementation hashes;
- test/CI identities;
- failed/negative conditions.

## Reproducibility package checklist

### T2424-0025

Already present or implemented:

- [x] deterministic core experiment;
- [x] seeds recorded in code;
- [x] runnable original command;
- [x] focused regression tests;
- [x] follow-up ablation command/implementation;
- [x] full follow-up result table retained locally/in branch;
- [ ] exact-head CI for follow-up branch;
- [ ] environment lock/version report;
- [ ] raw follow-up JSON committed or archived with hash;
- [ ] learned sequence benchmark;
- [ ] independent reproduction;

### T2424-0030

- [x] canonical runnable synthetic implementation;
- [x] baseline and negative control;
- [x] multi-seed reference result;
- [ ] stronger kinematic baselines;
- [ ] noisy/regime-switching tasks;
- [ ] rollout stability;
- [ ] external trajectory dataset;
- [ ] independent reproduction.

### T2424-0019

- [x] canonical recovery/evidence contract;
- [x] retained historical report and negative findings;
- [ ] original source tree migrated;
- [ ] retained hashes validated from source artifacts;
- [ ] clean canonical rerun;
- [ ] metric defects repaired;
- [ ] external/frozen-model evaluation;
- [ ] independent QA.

## Experiments required before submission

### NGM readout candidate

1. learned delayed-recall/retrieval task;
2. no-memory / standard-memory / Gaussian-reference / proposed robust baselines;
3. clean, Gaussian, Cauchy, multimodal and regime-shift conditions;
4. multiple seeds and uncertainty reporting;
5. compute/parameter comparison;
6. independent held-out reproduction;
7. verified related-work search and novelty audit.

### ATG candidate

1. constant acceleration and fitted local-linear baselines;
2. observation noise and regime switching;
3. multi-step rollouts;
4. learned/frozen threshold discipline;
5. external trajectory/dynamical-system data;
6. independent reproduction.

### NPMS candidate

1. recover canonical executable source;
2. rerun every claimed compact/robustness artifact;
3. validate hashes;
4. repair matched-mode and conjugate-group metrics;
5. real frozen model or external dataset;
6. independent QA.

## Venue class by current scope

- **Today:** internal technical report / open reproducibility note / workshop-style mechanism study after citation audit; no submission-readiness claim.
- **After learned-task and independent evidence:** empirical ML workshop or focused short-paper class may become appropriate.
- **Archival/main-track class:** only after stronger baselines, external/held-out evidence, novelty verification, complete reproducibility and a contribution larger than the current synthetic screen.

No acceptance likelihood is claimed.
