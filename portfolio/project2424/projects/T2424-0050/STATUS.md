# T2424-0050 Status

**Project:** Darcy Latent Operator  
**Queue rank:** 43  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / LATEST_MAIN_REVALIDATION_PENDING / MANUAL_MERGE_REQUIRED  
**Claim level:** bounded 1D reduced-resistance scientific-computing screen

## Identity repair

The frozen First-100 queue assigns `T2424-0050` to **Darcy Latent Operator**. The repository previously placed Benchmark Augmentation Theory under that canonical ID. This repair preserves that useful benchmark audit under `portfolio/project2424/tools/benchmark-augmentation-theory/` with auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`, then restores the canonical project path to Darcy.

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
- [x] Benchmark Augmentation Theory preserved losslessly as auxiliary tooling
- [x] zero-exception queue↔canonical-package identity regression in the repair lineage

## Prior exact-head evidence

The same bounded Darcy/auxiliary repair lineage previously passed canonical GitHub Actions on exact repair heads, including CI run `31456883470` for PR #230. That evidence establishes the repair mechanics on the earlier base only.

## Latest-main revalidation

This branch is rebuilt from current `main` `37391b14fbd3aa2ab550aa0048ab944ea2556483`, which includes newer portfolio truth and certification-readiness infrastructure. Those changes must remain intact.

The refreshed branch must pass canonical GitHub Actions on its own exact head before it is eligible for manual integration. Prior green runs are not substituted for latest-main evidence.

Retained bounded result:

- mean baseline pressure MAE: `0.0658913916`;
- mean latent pressure MAE: `0.0011366559`;
- mean relative improvement: `97.8766%`;
- mean flux relative error: `1.37e-16`;
- uniform negative-control latent MAE: `0`;
- predeclared screen: all three bounded mechanics gates passed.

## Current promotion gate

Even if exact-head CI is green, that proves repository integration only. It does not establish scientific generalization, learned-operator quality or research completion.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- neural operator learning
- multidimensional Darcy flow
- real porous-media validation
- superiority over scientific-ML baselines
- out-of-distribution generalization
- publication novelty
- research completion
- `CERTIFIED_COMPLETE`

## Next artifact

A harder frozen benchmark with misaligned/correlated permeability fields, representation ablations, stronger reduced-order comparators, 2D finite-volume data and independent scientific QA.
