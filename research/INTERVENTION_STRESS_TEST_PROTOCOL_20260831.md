# Intervention Stress-Test Protocol — Temporal Predictive Representations

**Status:** PRE-OUTCOME / FROZEN DESIGN CANDIDATE  
**Date:** 2026-08-31  
**Execution authorized:** false  

## 1. Scientific question

Does a JEPA-style temporal predictive representation retain useful dynamical structure when a physical system is subjected to a controlled forcing event that is absent from nominal training trajectories, or does performance collapse once the observed trajectory distribution changes?

This protocol is intentionally a falsification-oriented mechanics test. It does **not** establish a general world model, causal discovery, universal physical reasoning, broad out-of-distribution robustness, or superiority to mechanistic models.

## 2. Primary hypothesis

A frozen JEPA-style temporal representation will support better post-intervention state prediction than non-dynamical representation baselines after a pre-specified forcing perturbation, without being trained on post-outcome-selected intervention examples.

The primary test is **zero-shot intervention transfer**: representation learning uses nominal trajectories only; the intervention regime is held out until evaluation.

## 3. Controlled dynamical system

Use a forced Duffing oscillator as the first controlled nonlinear system:

`x'' + delta*x' + alpha*x + beta*x^3 = gamma*cos(omega*t) + u(t)`

Frozen nominal parameters:

- `delta = 0.2`
- `alpha = -1.0`
- `beta = 1.0`
- `gamma = 0.3`
- `omega = 1.2`
- state: `[x, v]`, where `v = x'`
- nominal control: `u(t) = 0`

Numerical integration and initial-condition ranges must be fixed in the execution manifest before model outcomes are inspected.

## 4. Intervention

Primary intervention: a finite-duration additive step forcing.

Frozen candidate intervention:

- onset: after a nominal context window has completed;
- amplitude: `+0.25` in the equation's forcing units;
- duration: `1.0` simulation-time unit;
- after duration: return to `u(t) = 0` and let the system evolve naturally;
- intervention timing is fixed relative to the evaluation context window;
- no amplitude, timing, or duration changes after outcome inspection.

Secondary sensitivity checks, if executed, must be labeled secondary and cannot rescue a failed primary result:

- sign-reversed step: `-0.25`;
- impulse-like short forcing with the same predeclared integrated magnitude;
- one larger forcing magnitude frozen before outcomes.

## 5. Data split

Create deterministic nominal trajectories from a frozen set of initial conditions and seeds.

- training: nominal trajectories only, `u(t)=0`;
- validation: nominal trajectories only;
- nominal test: held-out nominal trajectories;
- intervention test: held-out initial conditions with the frozen forcing event;
- no intervention trajectory may enter representation pretraining for the primary zero-shot test.

The exact initial-condition ranges, trajectory count, integrator, step size, sequence length, context length, forecast horizon, and seeds must be committed before execution.

## 6. Models

### Primary model

JEPA-style temporal predictive representation:

- context encoder maps an observed window to latent state;
- predictor maps context latent state toward future target latent states;
- target branch / stop-gradient behavior must be fixed before execution;
- no intervention-specific fine-tuning in the primary test.

### Required baselines

At minimum:

1. persistence / last-state predictor;
2. linear autoregressive state model;
3. small direct next-state MLP under a matched parameter/compute budget;
4. representation encoder trained with direct reconstruction or next-step prediction rather than a JEPA latent objective.

A mechanistic numerical integration baseline may be reported as an upper-reference model when supplied with the true equation and state, but it must not be presented as a compute-matched learned baseline.

## 7. Frozen representation evaluation

The representation itself is evaluated through a low-capacity readout so downstream flexibility does not hide representation failure.

Primary readout:

- freeze encoder weights;
- fit a linear readout on nominal-training representations only;
- predict physical state `[x, v]` at fixed future horizons;
- apply the unchanged readout to intervention-test representations.

No nonlinear probe search or post-outcome probe tuning is permitted for the primary result.

## 8. Primary metric

Primary metric: **post-intervention normalized root mean squared error (NRMSE)** for physical-state prediction over a fixed recovery horizon after the forcing ends.

For each evaluation trajectory:

1. apply the frozen forcing;
2. evaluate predictions during forcing and after forcing removal;
3. compute NRMSE over the predeclared post-forcing recovery window;
4. aggregate across the frozen evaluation seeds / initial conditions.

Report both `x` and `v` error plus the joint normalized state error.

## 9. Secondary metrics

Report separately:

- nominal-test NRMSE;
- during-intervention NRMSE;
- recovery time to return below a frozen error threshold;
- multi-horizon state-prediction error;
- representation linear-probe R^2 for `[x, v]`;
- energy-like quantity error where physically meaningful;
- intervention-vs-nominal degradation ratio;
- per-seed / per-initial-condition results.

Secondary metrics cannot override the primary gate.

## 10. Primary success gate

Freeze exact numeric thresholds only after a no-model-outcome calibration pass establishes metric scaling from the simulator and trivial baselines. That calibration may inspect simulator units and trivial deterministic baselines, but not JEPA/model outcomes.

The final gate must require all of the following:

1. JEPA post-intervention NRMSE beats persistence;
2. JEPA post-intervention NRMSE beats the matched reconstruction/direct-prediction representation baseline;
3. the improvement is present across a predeclared majority of seeds / initial-condition groups rather than one trajectory;
4. nominal performance is not catastrophically degraded relative to the best learned baseline;
5. the claim remains bounded to this system and intervention.

Until numeric thresholds are committed, `execution_authorized=false`.

## 11. Falsifiers

Treat any of the following as informative failure rather than something to tune away:

- JEPA is no better than persistence after forcing;
- JEPA is matched or beaten by the simpler matched-compute representation baseline;
- nominal performance is good but intervention performance collapses;
- gains are driven by one or two initial conditions;
- the learned readout works only after intervention examples are added;
- small changes to the frozen integration step reveal numerical rather than representational effects;
- performance depends on post-outcome threshold, horizon, probe, or seed selection.

## 12. Two-tier intervention analysis

The primary result remains zero-shot.

A separately labeled secondary analysis may test whether a **small frozen intervention-support set** helps:

- freeze the number of intervention examples before outcomes;
- do not change encoder objective or architecture;
- compare adaptation of only the low-capacity readout versus full model fine-tuning;
- report this as an adaptation question, not as evidence that the zero-shot hypothesis passed.

## 13. Leakage and shortcut controls

Required checks:

- intervention indicator is not explicitly appended to model input in the primary test;
- train/test initial conditions do not overlap;
- deterministic seed split is retained;
- normalization statistics come from training data only;
- intervention timing is not encoded through a unique padding or sequence-length artifact;
- no evaluation trajectory is used for early stopping or hyperparameter selection;
- baseline hyperparameters are frozen under the same pre-outcome process.

## 14. Integrity rules

- No post-outcome intervention-amplitude changes under this protocol ID.
- No post-outcome horizon changes under this protocol ID.
- No seed deletion because it performs poorly.
- No rescue tuning after the primary result is known.
- Any material model, data, forcing, metric, threshold, or probe change requires a new protocol ID.
- Positive, mixed, negative, and infrastructure-failure outcomes are retained.

## 15. Required execution manifest

Before authorization, commit a machine-readable manifest containing:

- simulator implementation commit;
- integrator and numerical tolerances;
- exact trajectory counts;
- initial-condition ranges;
- context length and prediction horizons;
- train/validation/test seeds;
- intervention amplitude, onset, duration and sign;
- model architecture and parameter counts;
- optimizer, learning-rate schedule, epochs/steps and early-stop rule;
- matched-compute policy;
- linear-probe fitting method;
- normalization method;
- exact primary metric;
- exact numeric success gate;
- artifact paths and checksums.

## 16. Required retained artifacts

- protocol and manifest SHA-256;
- environment capture;
- simulator configuration;
- initial-condition / seed ledger;
- training logs for every model;
- per-trajectory raw predictions;
- per-trajectory metrics;
- aggregate summary;
- baseline comparison table;
- intervention plots generated from retained raw data;
- verdict JSON;
- SHA256SUMS file.

## 17. Claim ladder

### Before execution

Authorized: `A controlled forcing-based intervention stress test has been preregistered.`

### Positive bounded result

Potentially authorized: `On the frozen forced-Duffing intervention test, the JEPA-style representation supported lower post-intervention state-prediction error than the predeclared learned baselines under the frozen evaluation.`

### Negative or mixed result

Authorized: report the exact failure mode and retain it as evidence about the boundary of the representation objective.

### Still prohibited from this experiment alone

- `the model learned the true physics`;
- `the model is causal`;
- `JEPA is a general world model`;
- `the model generalizes to real physical systems`;
- `the method is superior across dynamical systems`;
- broad claims about weather, astronomy, robotics, control, or scientific discovery.

## 18. Immediate closure checklist

- [ ] implement deterministic Duffing simulator;
- [ ] freeze numerical integrator and trajectory sampling;
- [ ] freeze JEPA architecture and matched baselines;
- [ ] run simulator/trivial-baseline-only scale calibration;
- [ ] freeze numeric primary thresholds without viewing learned-model outcomes;
- [ ] commit machine-readable execution manifest;
- [ ] add fail-closed manifest validator;
- [ ] authorize one primary execution;
- [ ] retain every outcome unchanged.
