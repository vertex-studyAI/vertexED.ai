# T2424-0029 — Frozen Protocol

## Project

`T2424-0029` — Representation Phase Transitions for PDEs

## Claim

The controlled analytic heat-equation fixture will exhibit the predeclared 95%-energy effective-mode sequence `3 → 2 → 2 → 1 → 1` across the frozen diffusivity sweep, with transitions reported only where the count changes.

## Primary metric

Minimum number of projected sine modes required to explain **95%** of measured spectral energy.

## Baseline / controls

- Analytic zero-time invariance: changing diffusivity at `t = 0` must not change the initial state.
- Exact-mode recovery control: projected amplitudes must recover known injected sine modes within `1e-12` on the deterministic test fixture.

## Frozen minimum experiment

```text
points: 128
time: 1
domain: periodic unit interval
modes:
  k=1, amplitude=1.0
  k=5, amplitude=0.8
  k=12, amplitude=0.6
energy_fraction: 0.95
diffusivities:
  0
  0.0002
  0.001
  0.005
  0.02
```

## Success threshold

```text
effective_mode_count == [3, 2, 2, 1, 1]
```

and the transition detector returns exactly the intervals where adjacent counts differ.

## Failure threshold

Any mismatch in the frozen count sequence, incorrect transition interval, failed analytic recovery invariant, or acceptance of invalid inputs fails the package-level screen.

## Negative / sensitivity work required for certification

This minimum experiment does not satisfy the full nine-gate certification contract. Before stronger claims, add energy-threshold sensitivity, grid-resolution sensitivity, nonlinear-PDE data, raw retained outputs, at least one representation ablation, explicit go/pivot/stop verdict, and independent reproduction.

## Run

```bash
node portfolio/project2424/projects/T2424-0029/experiment/run.mjs
node --test tests/pdeRepresentationTransitions.test.mjs
```

Do not alter the success condition after observing results.
