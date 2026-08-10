# T2424-0030 — Adaptive Theory Geometry in World Models

A bounded world-model prototype that tests whether **local trajectory geometry** can improve one-step forecasting over a single Euclidean constant-velocity assumption.

## Falsifiable question

When a trajectory has persistent local curvature, does a predictor that detects the observed turn and extrapolates in constant-curvature geometry reduce one-step error relative to Cartesian constant velocity—without manufacturing a gain on straight motion?

## Models

### Baseline — Euclidean tangent

Use the latest displacement unchanged:

```text
x[t+1] = x[t] + (x[t] - x[t-1])
```

### Adaptive geometry predictor

Use the last three states to estimate the signed turn between the previous two displacement vectors.

- if `|turn| < 0.02 rad`, remain in Euclidean tangent mode;
- otherwise rotate the latest displacement by the observed local turn before extrapolating;
- clamp inferred turns to `±0.5 rad` to keep the prototype bounded;
- zero-speed states fail safely to a stationary prediction.

This is an interpretable local geometry switch, not a learned neural world model.

## Predeclared cheap screen

Across 20 deterministic seeds and curved trajectories with base turn angles `0.08`, `0.12`, `0.16`, and `0.20` radians:

- adaptive mean one-step error must improve by **>85%** over constant velocity;
- curved geometry must be selected on **>95%** of curved samples.

Negative control:

- on straight trajectories with zero turn jitter, adaptive relative improvement must remain within **±1%** of the baseline.

## Deterministic reference result

The 20-seed reference run produces approximately:

```text
curved samples:              6240
constant-velocity error:     0.138935
adaptive-geometry error:     0.006845
relative improvement:        95.07%
curved selection rate:       100%

straight-control samples:    1560
constant-velocity error:     0.000990
adaptive-geometry error:     0.000990
relative improvement:        0.00%
curved selection rate:       0%
```

The repository regression suite is the promotion gate for these deterministic mechanics.

## Run

```bash
node portfolio/project2424/projects/T2424-0030/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424AdaptiveTheoryGeometry.test.mjs
```

The root canonical CI also discovers this test.

## What this demonstrates

- a compact world-model state transition rule can adapt between tangent and curved local geometry;
- the mechanism has a falsifiable synthetic benchmark and a negative control;
- the geometry choice is transparent and bounded.

## What this does **not** demonstrate

- learned representation geometry;
- neural world-model superiority;
- long-horizon stability;
- robustness to observation noise or regime discontinuities;
- real physical-system forecasting;
- publication novelty;
- general intelligence.

## Next evidence gate

1. freeze noisy and regime-switching trajectory datasets;
2. compare against constant-acceleration and fitted local-linear baselines;
3. measure multi-step rollout stability and calibration;
4. learn the geometry-selection threshold only on train data;
5. test on an external trajectory or dynamical-system dataset;
6. independently reproduce the results before any research-complete claim.
