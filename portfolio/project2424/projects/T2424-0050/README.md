# T2424-0050 — Darcy Latent Operator

A bounded scientific-computing experiment for **steady one-dimensional Darcy flow through a heterogeneous permeability field**.

This package tests whether a reduced block-resistance representation can preserve the pressure profile and flux better than a no-heterogeneity linear-pressure baseline. The "latent" representation is explicit and physically interpretable; it is not a learned neural latent space.

## Problem

For positive cell permeability `k(x)` on `[0, 1]` with fixed pressures `p(0)=1` and `p(1)=0`, steady 1D Darcy flow has constant flux. In resistance form,

```text
q = (p_left - p_right) / integral(1 / k(x)) dx
```

and pressure falls according to cumulative resistance.

The implementation uses equal-width finite cells, so the exact discrete resistance of cell `i` is `dx / k_i`.

## Reduced representation

For 24 permeability cells, the minimum experiment compresses them to 6 latent blocks (4× compression). Each block stores the **harmonic mean permeability**, which exactly preserves that block's integrated resistance. Expanding those six values back to the cell grid gives a reduced surrogate from which the Darcy pressure profile is solved.

Comparator: a linear pressure profile that ignores heterogeneous resistance structure.

## Predeclared cheap screen

Across 20 deterministic heterogeneous fields:

1. mean latent pressure-profile MAE improvement over the linear baseline must be at least **65%**;
2. mean flux relative error must be at most **1%**;
3. a uniform-permeability negative control must be exact to `1e-12` for both methods.

## Retained deterministic result

```text
seeds:                         20
cells / latent blocks:         24 / 6
compression ratio:             4x
mean baseline pressure MAE:    0.0658913916
mean latent pressure MAE:      0.0011366559
mean relative improvement:     97.8766%
mean flux relative error:      1.37e-16
max latent pressure MAE:       0.0014613492
uniform baseline MAE:          9.33e-17
uniform latent MAE:            0
verdict:                       PASS_BOUNDED_DARCY_LATENT_SCREEN
```

The retained machine-readable output is `results/reference.json`.

## Run

```bash
node portfolio/project2424/projects/T2424-0050/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424DarcyLatentOperator.test.mjs
```

Regression coverage includes boundary conditions, Darcy resistance/flux conservation, block-resistance preservation, uniform-field negative control, heterogeneous improvement, the full frozen 20-seed screen, and fail-closed invalid permeability/compression inputs.

## Why this result is deliberately narrow

The synthetic generator is block-structured at the same coarse scale used by the surrogate. That makes this a **mechanism sanity check**, not a difficult operator-learning benchmark. The large error reduction is therefore not evidence of state-of-the-art performance.

The flux is preserved nearly exactly because harmonic block compression preserves total resistance by construction. The scientifically interesting future question is how much pressure-profile fidelity remains under harder, misaligned, multidimensional, and out-of-distribution fields.

## Claim boundary

This package does **not** establish:

- a learned neural operator;
- Darcy-flow superiority over FNO, DeepONet, PINNs, finite-volume solvers, or other scientific-ML baselines;
- 2D/3D porous-media performance;
- transient or multiphase flow performance;
- real experimental porous-media validity;
- publication novelty;
- research completion.

It demonstrates only that an explicit reduced resistance representation behaves correctly on a controlled 1D synthetic screen.

## Identity repair

A benchmark-audit artifact was previously merged under this registry ID. It is preserved at `portfolio/project2424/tools/benchmark-augmentation-theory/` with an auxiliary non-First-100 identity. `T2424-0050` is reserved here for the frozen queue identity **Darcy Latent Operator**.

## Next evidence gate

Use misaligned random fields and multiple correlation lengths, compare harmonic-block compression with arithmetic/block-average ablations and stronger reduced-order baselines, add 2D finite-volume data, freeze train/validation/test splits before any learned model tuning, and obtain independent scientific QA.
