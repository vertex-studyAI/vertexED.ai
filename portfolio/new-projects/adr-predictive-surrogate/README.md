# T2424-0051 — ADR Predictive Surrogate

A Project 2424 minimum experiment for a bounded **advection–diffusion–reaction (ADR) surrogate** on a controlled one-dimensional periodic system.

## Controlled reference system

The reference solver evolves a finite Fourier series under the linear periodic ADR equation

```text
u_t + c u_x = D u_xx + r u
```

where:

- `c` is advection speed;
- `D >= 0` is diffusion;
- `r` is a linear reaction/growth rate;
- `t >= 0` is time.

For Fourier mode `k`, the analytic evolution combines:

- phase translation from advection;
- exponential damping proportional to `D (2πk)^2`;
- exponential growth/decay from `r`.

The package samples that analytic solution on a periodic grid and uses those exact snapshots as the reference target.

## Surrogate

The current surrogate is intentionally simple and auditable: a four-dimensional structured table over

```text
(advection, diffusion, reaction, time)
```

and multilinear interpolation across the 16 neighboring parameter-space corners.

It does **not** extrapolate outside the fitted parameter box. Out-of-domain queries fail closed.

## Minimum experiment

Two deterministic surrogates are compared on four frozen off-grid probes:

### Coarse

```text
3 × 3 × 3 × 3 = 81 snapshots
```

### Refined

```text
5 × 5 × 5 × 5 = 625 snapshots
```

The predeclared gate is:

1. refined mean relative-L2 error must be less than half of coarse mean relative-L2 error;
2. refined worst-case relative-L2 error on the four frozen probes must be below 2%.

Run:

```bash
node portfolio/new-projects/adr-predictive-surrogate/experiment/run.mjs
```

The experiment prints the exact snapshot counts, held-out RMSE/relative-L2 metrics and Boolean gate result.

## Run tests

```bash
node --test tests/adrPredictiveSurrogate.test.mjs
```

The repository's canonical `npm test` glob also includes this test.

## What the regression suite checks

- the analytic solver reproduces the initial Fourier field at `t = 0`;
- pure periodic advection preserves discrete L2 norm;
- diffusion damps higher spatial frequencies more strongly;
- interpolation is exact at stored grid nodes;
- grid refinement improves the frozen held-out surrogate error and satisfies the 2% worst-case gate;
- malformed axes, negative diffusion and extrapolation fail closed.

## Files

```text
adr-predictive-surrogate/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/adrPredictiveSurrogate.test.mjs
```

## Claim boundary

This package demonstrates surrogate/interpolation mechanics only for a small analytic linear 1D periodic ADR family with fixed initial Fourier content. It does not establish:

- state-of-the-art surrogate accuracy;
- neural-operator performance;
- nonlinear reaction dynamics;
- arbitrary geometries or boundary conditions;
- stability for extrapolation;
- superiority over classical numerical solvers;
- publication novelty;
- real scientific or engineering deployment readiness.

## Next evidence gate

Replace the analytic single-family reference with numerical trajectories from at least one harder ADR regime (for example nonlinear reaction or spatially varying coefficients), freeze train/validation/test parameter regions, compare this structured interpolant against a learned reduced-order or neural-operator baseline under equal data/compute budgets, and report error versus snapshot budget before making stronger surrogate claims.
