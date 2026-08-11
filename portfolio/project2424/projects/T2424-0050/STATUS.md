# T2424-0050 Status

**Project:** Darcy Latent Operator  
**Queue rank:** 43  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING / IDENTITY_REPAIR_CI_PENDING  
**Claim level:** bounded 1D reduced-resistance scientific-computing screen

## Implemented

- [x] positive-permeability input validation
- [x] steady 1D Darcy resistance solver
- [x] explicit constant-flux pressure reconstruction
- [x] harmonic block-resistance compression
- [x] 4× reduced latent representation (24 cells → 6 blocks)
- [x] linear-pressure no-heterogeneity baseline
- [x] deterministic heterogeneous field generator
- [x] 20-seed benchmark
- [x] uniform-permeability negative control
- [x] retained machine-readable result
- [x] six focused regression tests

## Prior exact-head evidence

The canonical Darcy package already passed GitHub Actions on exact head `ce9331c8be3e66eb8249121aa2243c03550108d2`, CI run `31449982073`. That PR conflicted because `main` had already materialized Benchmark Augmentation Theory under the same ID. This branch preserves that benchmark tool under an auxiliary identity and restores Darcy to the frozen queue namespace.

Local verification recorded on the prior green package:

- focused test suite: **6 / 6 passing**;
- mean baseline pressure MAE: `0.0658913916`;
- mean latent pressure MAE: `0.0011366559`;
- mean relative improvement: `97.8766%`;
- mean flux relative error: `1.37e-16`;
- uniform negative-control latent MAE: `0`;
- predeclared screen: all three gates passed.

## Current promotion gate

Canonical GitHub Actions must pass again on this identity-repair branch. A green CI run establishes repository integration of the relocation + Darcy package; it does not establish scientific generalization or research completion.

## Not claimed

- neural operator learning
- multidimensional Darcy flow
- real porous-media validation
- superiority over scientific-ML baselines
- out-of-distribution generalization
- publication novelty
- research completion

## Next artifact

A harder frozen benchmark with misaligned/correlated permeability fields, representation ablations, stronger reduced-order comparators, 2D finite-volume data, and independent QA.
