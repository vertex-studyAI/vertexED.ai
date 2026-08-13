# T2424-0029 Results

**Project:** Representation Phase Transitions for PDEs  
**Evidence date:** 2026-08-13  
**Source/evidence commit:** `1a69e1919f64295f46f231ad487beee91a54f05e`  
**Actions run:** `31653397825`  
**Artifact:** `9163421118`  
**Artifact digest:** `sha256:5864fad98c8f202e24ffa060cafe89a7b92548420373dc0b4fc6b8ffa5f26608`

## Research question

Does the frozen analytic 1D periodic heat-equation fixture exhibit the predeclared discrete 95%-energy effective-mode sequence `3 → 2 → 2 → 1 → 1` as diffusivity increases?

## Protocol

The protocol was frozen before this reproduction in `PROTOCOL.md`:

- 128 spatial points;
- time = 1;
- injected sine modes `(k, amplitude) = (1,1.0), (5,0.8), (12,0.6)`;
- effective dimension = minimum number of projected sine modes carrying 95% of measured spectral energy;
- diffusivities = `[0, 0.0002, 0.001, 0.005, 0.02]`;
- success sequence = `[3,2,2,1,1]`;
- transition detector must report only adjacent count changes.

No threshold or fixture was changed after observing the result.

## Fresh result

| Diffusivity | Effective mode count | Spectral entropy | Total spectral energy |
|---:|---:|---:|---:|
| 0 | 3 | 0.4104203585 | 2.0000000000 |
| 0.0002 | 2 | 0.2888691265 | 1.4526264624 |
| 0.001 | 2 | 0.1196772585 | 1.0129870905 |
| 0.005 | 1 | 0.0002159007 | 0.6738585541 |
| 0.02 | 1 | 3.4288e-16 | 0.2061529924 |

Observed transition intervals:

1. diffusivity `0 → 0.0002`: effective mode count `3 → 2`;
2. diffusivity `0.001 → 0.005`: effective mode count `2 → 1`.

**Verdict:** `PASS_FROZEN_ANALYTIC_PDE_TRANSITION_SCREEN`.

The verdict means only that the deterministic analytic fixture reproduced its preregistered discrete effective-rank pattern.

## Controls and tests

All focused tests passed (`5/5`):

- zero-time heat states are invariant to diffusivity;
- sine projection recovers injected periodic-mode amplitudes;
- the frozen diffusivity sweep matches `[3,2,2,1,1]`;
- transition detection reports only discrete count changes;
- invalid energy targets fail closed.

Raw result SHA-256: `c190aa3e54d6cda008e7e29a89b387e596904075b225cb7f511ac61acb80f5e4`.  
Focused-test log SHA-256: `580ecc2f9f1d1d83dfb57d2e03d15122bd104aca11331f5a16eb43e94a9db9c4`.

## Environment and runtime

- GitHub-hosted runner: Ubuntu 24.04.4, x86_64 CPU;
- kernel: `6.17.0-1020-azure`;
- Node: `v22.23.1`;
- Git: `2.54.0`;
- source/evidence commit: `1a69e1919f64295f46f231ad487beee91a54f05e`.

The combined experiment + focused-test step ran from `2026-08-13T00:08:31.577829Z` to `2026-08-13T00:08:31.727792Z`, approximately `0.150 s` wall time. The Node test runner reported `74.626758 ms` for the five focused tests. The experiment itself was not separately instrumented, so no more precise standalone runtime is claimed.

## Uncertainty

This minimum experiment is a deterministic analytic fixture, not a stochastic multi-seed benchmark. Therefore a seed mean/SD is not meaningful for the current primary result. Numerical robustness is not established beyond the frozen grid, energy threshold and analytic controls.

## Limitations

This result does **not** establish:

- a universal PDE phase transition;
- a neural representation phase transition;
- nonlinear-PDE generalization;
- learned latent superiority;
- robustness to grid resolution or energy-threshold choice;
- publication novelty.

The next scientifically useful experiment is a preregistered sensitivity/generalization extension: vary grid resolution and energy threshold, add at least one nonlinear numerical PDE, and compare Fourier and learned representations at matched reconstruction error.