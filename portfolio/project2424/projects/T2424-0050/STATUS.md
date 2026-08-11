# T2424-0050 Status

**Project:** Darcy Latent Operator  
**Queue rank:** 43  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / MANUAL_MERGE_PENDING  
**Claim level:** bounded 1D reduced-resistance scientific-computing screen

## Identity repair

The frozen First-100 queue assigns `T2424-0050` to **Darcy Latent Operator**. Current `main` contains Benchmark Augmentation Theory under that ID. This branch preserves that useful benchmark audit under `portfolio/project2424/tools/benchmark-augmentation-theory/` with auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`, then restores this canonical path to Darcy.

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

## Exact-head repository evidence

The canonical Darcy implementation passed GitHub Actions on exact head `ce9331c8be3e66eb8249121aa2243c03550108d2`, CI run `31449982073`.

A later lossless identity-repair head `d502de803701c0be1d7e3306b30b8036824ca251` passed canonical CI run `31450427123`, but became non-mergeable as `main` advanced.

The latest-main lossless repair head `9c9aacac73d1c59327cf6a882aa83566f658cf53` then passed canonical GitHub Actions CI run `31451716616` and was mergeable when inspected. That evidence establishes repository integration for that exact head only.

The current-main rebuild head `74469481b38e13bdcfdfcf81ad382088bb73bd57` passed canonical GitHub Actions CI run `31456011637`. During that run, `main` advanced by one non-overlapping commit (`0a9751d6e8b995747c855c64d60bdda9b1891eaf`) that only corrected PST/NPMS canonical status metadata. This status refresh intentionally creates a new PR head so the pull-request merge ref is revalidated against that newer base before any manual merge decision.

Retained bounded result:

- mean baseline pressure MAE: `0.0658913916`;
- mean latent pressure MAE: `0.0011366559`;
- mean relative improvement: `97.8766%`;
- mean flux relative error: `1.37e-16`;
- uniform negative-control latent MAE: `0`;
- predeclared screen: all three gates passed.

## Current promotion gate

The refreshed PR head must pass canonical GitHub Actions against the current pull-request merge ref. Even with green CI, the PR remains under an explicit **manual merge / no deploy** boundary. A green run establishes repository integration of the relocation + Darcy package; it does not establish scientific generalization or research completion.

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
