# T2424-0050 Status

**Project:** Darcy Latent Operator  
**Queue rank:** 43  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING / MANUAL_MERGE_REQUIRED  
**Claim level:** bounded 1D reduced-resistance scientific-computing screen

## Identity repair

The frozen First-100 queue assigns `T2424-0050` to **Darcy Latent Operator**. The base `main` used for this repair (`0a9751d6e8b995747c855c64d60bdda9b1891eaf`) still materializes Benchmark Augmentation Theory under that ID. This branch preserves that useful benchmark audit under `portfolio/project2424/tools/benchmark-augmentation-theory/` with auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`, then restores this canonical path to Darcy.

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
- [x] six focused Darcy regression tests
- [x] auxiliary Benchmark Augmentation artifact preserved losslessly
- [ ] canonical CI on this exact refreshed head

## Prior repository evidence

Earlier equivalent Darcy/identity-repair heads passed canonical CI, including `ce9331c8be3e66eb8249121aa2243c03550108d2` (run `31449982073`), `9c9aacac73d1c59327cf6a882aa83566f658cf53` (run `31451716616`), and a later current-main rebuild lineage. Those runs prove those exact historical heads only.

This branch was rebuilt directly from `main` after the PST/NPMS canonical-identity correction landed. It must therefore pass CI again before it is considered merge-ready.

Retained bounded result:

- mean baseline pressure MAE: `0.0658913916`;
- mean latent pressure MAE: `0.0011366559`;
- mean relative improvement: `97.8766%`;
- mean flux relative error: `1.37e-16`;
- uniform negative-control latent MAE: `0`;
- predeclared bounded screen: all three gates passed.

## Current promotion gate

Even after exact-head green CI, this repair remains under an explicit **manual merge / no deploy** boundary. CI can establish repository integration of the relocation + Darcy package; it cannot establish scientific generalization or research completion.

## Not claimed

- neural operator learning
- multidimensional Darcy flow
- real porous-media validation
- superiority over scientific-ML baselines
- out-of-distribution generalization
- publication novelty
- research completion
- Certified complete

## Next artifact

A harder frozen benchmark with misaligned/correlated permeability fields, representation ablations, stronger reduced-order comparators, 2D finite-volume data, and independent QA.
