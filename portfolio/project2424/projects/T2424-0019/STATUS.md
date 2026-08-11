# T2424-0019 Status

**Project:** NPMS — Neural Predictive Memory Spectroscopy  
**Recovered/source alias:** Neural Predictive Memory Spectroscopy (NPMS) / `MODEL-NPMS`

State: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`

Certified complete: **NO**

## Canonical identity

The frozen First-100 queue is authoritative for Project 2424 identity. `T2424-0019` therefore uses the canonical title **NPMS — Neural Predictive Memory Spectroscopy**. The retained isolated package uses `MODEL-NPMS`; that provisional/source label remains provenance only.

- Project 2424 ID: `T2424-0019`
- Recovered provisional ID: `MODEL-NPMS`
- Canonical queue name: NPMS — Neural Predictive Memory Spectroscopy
- Protected role: diagnostic interpretation of predictive memory through spectral, temporal and intervention-based analysis

## Recovered isolated execution

- 17 tests passed;
- smoke: 2 runs;
- compact: 15 runs, 36 ablation records, five controlled systems, seeds 7/19/41;
- robustness: 45 records;
- evidence class: `SYNTHETIC_CONTROLLED`;
- isolated verdict: `COMPACT_EVIDENCE_COMPLETE`.

This canonical branch validates the recovered report and its claim boundaries. It has not yet migrated or rerun the original NPMS implementation.

## Required negative boundaries

The following remain first-class evidence, not cleanup targets:

1. delay-PCA linear spectral recovery is substantially worse than identity smoke recovery;
2. multiscale-AR recovery is weak;
3. one switching-process regime is poorly recovered;
4. matched eigenvalue error ignores missing/spurious modes;
5. truncation ranks individual eigenvalues instead of conjugate groups;
6. frequency response is an autonomous resolvent proxy rather than a complete input-output transfer function.

## Hard blockers

- original source/config/result/evidence/manuscript tree is not migrated into canonical Git identity;
- retained hashes have not been independently revalidated here;
- clean canonical rerun is pending;
- residual spectral verification and uncertainty quantification are missing;
- contiguous switching fits and conjugate-group truncation need repair;
- no actual trained-model checkpoint or external dataset has been evaluated;
- no independent literature/manuscript audit has completed.

## Promotion rule

Do not mark `TESTED` for the original scientific implementation, `EXTERNAL_VALIDATED`, `NOVEL`, `RESEARCH_COMPLETE` or `CERTIFIED_COMPLETE` merely because this recovery validator passes. Canonical CI on this branch only verifies the evidence-recovery package and its fail-closed boundaries.
