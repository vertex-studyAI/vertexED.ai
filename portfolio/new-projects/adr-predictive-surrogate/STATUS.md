# T2424-0051 — Status

**Project:** ADR Predictive Surrogate  
**State:** executable minimum experiment / current-main replacement CI pending

## Implemented

- analytic periodic linear ADR reference snapshots from finite Fourier modes;
- parameter validation and fail-closed diffusion/time constraints;
- structured four-axis surrogate over advection, diffusion, reaction and time;
- 4D multilinear interpolation from 16 neighboring snapshots;
- explicit no-extrapolation boundary;
- RMSE, relative-L2 and maximum-absolute-error evaluation;
- deterministic coarse-versus-refined held-out experiment;
- six repository regression tests;
- runnable experiment and documentation.

## Executed evidence

The implementation/test fixture was executed locally before GitHub packaging:

```text
node --test adrPredictiveSurrogate.test.mjs
6 tests passed / 0 failed
```

Frozen experiment fixture:

```text
coarse snapshots: 81
fine snapshots: 625
held-out probes: 4
coarse mean relative L2: 0.028370386448530974
coarse worst relative L2: 0.043698960869421107
fine mean relative L2: 0.009381068245904815
fine worst relative L2: 0.014478581370660255
```

Predeclared gate on that fixture:

```text
fine mean error < 0.5 × coarse mean error: PASS
fine worst relative L2 < 0.02: PASS
```

The original GitHub branch head `e91f55fa98121b374b4a78162cf55003032295b3` passed canonical CI run `31449668954`. That branch later became non-mergeable because `main` advanced six commits, so this branch recovers the same implementation onto current `main` without force-pushing. Canonical CI on this replacement head remains the current merge gate.

## Claim boundary

This is a small interpolation baseline against an analytic 1D linear periodic ADR reference. It is **not** evidence of a novel PDE solver, a neural operator, nonlinear ADR generalization, extrapolation safety, state-of-the-art performance, publication readiness or production deployment readiness.

## Remaining gates

1. Canonical GitHub Actions must pass on the current-main replacement head.
2. For research advancement, freeze a harder numerical ADR benchmark with separated train/validation/test parameter regions.
3. Compare against at least one learned reduced-order/neural surrogate and one classical interpolation baseline under equal evidence budgets.
4. Report scaling of error, memory and runtime with snapshot budget.

## Production boundary

This package changes only `portfolio/new-projects/...` and one repository test file. It does not modify the VertexED application runtime, deployment configuration, Supabase state, credentials or production data. Do not infer a production deployment from this project branch.
