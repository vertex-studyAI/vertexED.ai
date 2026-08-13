# T2424-0050 Darcy Latent Operator — reproducibility results

## Hypothesis

On a controlled steady 1D heterogeneous Darcy-flow fixture, an explicit six-block harmonic-resistance representation should preserve pressure/flux substantially better than a linear-pressure baseline that ignores heterogeneous resistance structure.

This is a reduced-order mechanics screen, **not** a learned neural operator.

## Frozen design

- 20 deterministic heterogeneous fields;
- 24 permeability cells compressed to 6 harmonic-resistance blocks (4×);
- baseline: linear pressure profile;
- method: block harmonic permeability preserving integrated resistance;
- metrics: pressure-profile MAE, relative MAE improvement, flux relative error;
- uniform-permeability negative control.

## Fresh exact-head reproduction

Workflow run: `31659677450`  
Execution commit: `f439498fa6aaf86bb9c0cb37002fcfaa2156c925`  
Environment: Node `v22.22.0`, Ubuntu/Linux x86_64, 4 CPUs.  
Experiment runtime: `0.03 s` real.  
Focused tests: `6/6` passed.

| Metric | Fresh result |
|---|---:|
| seeds | 20 |
| baseline mean pressure MAE | 0.0658913916 |
| latent mean pressure MAE | 0.0011366559 |
| mean relative improvement | 97.8766% |
| mean flux relative error | 1.37e-16 |
| max latent pressure MAE | 0.0014613492 |
| uniform baseline MAE | 9.33e-17 |
| uniform latent MAE | 0 |

Raw result SHA-256: `67ad7bd98000c58533753b2dd8e70ddebce411780e66f11284c9cfb59206e586`.

## Uncertainty

The retained output includes all 20 per-seed evaluations. The large improvement is not treated as a generalization estimate because the synthetic generator is block-structured at the same scale as the surrogate. Future harder/OOD fields need aggregate SD/CI reporting.

## Claim boundary

The near-exact flux result is largely by construction: harmonic block compression preserves total resistance. This does not establish a neural operator, superiority over FNO/DeepONet/PINNs/numerical solvers, 2D/3D performance, real porous-media validity, novelty, or research completeness.
