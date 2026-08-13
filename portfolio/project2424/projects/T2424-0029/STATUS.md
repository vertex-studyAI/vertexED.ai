# T2424-0029 Status

**Project:** Representation Phase Transitions for PDEs  
**Project 2424 ID:** T2424-0029  
**Track:** C — Existing work → minimum experiment  
**State:** FRESHLY_REPRODUCED_ANALYTIC_SCREEN / CERTIFICATION_INCOMPLETE  
**Claim level:** controlled analytic PDE spectral-dimension experiment

## Fresh reproduction

The frozen minimum experiment was rerun without changing its protocol in GitHub Actions run `31653397825` at source/evidence commit `1a69e1919f64295f46f231ad487beee91a54f05e`.

Environment:

- Ubuntu 24.04.4 x86_64 CPU;
- Node `v22.23.1`;
- kernel `6.17.0-1020-azure`.

Retained artifact:

- artifact `9163421118`;
- digest `sha256:5864fad98c8f202e24ffa060cafe89a7b92548420373dc0b4fc6b8ffa5f26608`.

The predeclared effective-mode sequence reproduced exactly:

```text
3 → 2 → 2 → 1 → 1
```

Transitions were detected only at `0 → 0.0002` and `0.001 → 0.005`, and all focused tests passed (`5/5`). Raw metrics, environment, result hashes, runtime boundary, `RESULTS.md`, `REPRODUCE.md`, and `experiment_metadata.json` are now retained.

## Implemented

- [x] analytic periodic heat-equation state generator
- [x] modal diffusion law and discrete sine projection
- [x] spectral energy analysis and normalized spectral entropy
- [x] effective-mode count at fixed energy target
- [x] diffusivity sweep and representation-transition detector
- [x] runnable deterministic experiment
- [x] analytic regression suite
- [x] scope and terminology limits
- [x] fresh hosted reproduction with raw artifact retention
- [x] machine-readable experiment metadata
- [x] explicit reproduction instructions

## Not claimed

- universal phase transition
- neural representation transition
- nonlinear-PDE generalization
- learned latent superiority
- robustness across grids or energy thresholds
- publication novelty
- certification complete

Green execution establishes the frozen analytic fixture only.

## Next artifact

Apply the same preregistered representation metric to at least one numerical nonlinear PDE, add energy-threshold and grid-resolution sensitivity, and compare Fourier versus learned latent dimensions at matched reconstruction error. Preserve the present analytic result as the baseline rather than changing it after seeing the extension.