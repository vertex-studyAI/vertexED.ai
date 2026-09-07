# T2424-0019 Status

**Project:** NPMS — Neural Predictive Memory Spectroscopy  
**Recovered/source alias:** Neural Predictive Memory Spectroscopy (NPMS) / `MODEL-NPMS`

State: `RECOVERED_COMPACT_EVIDENCE / EXACT_HEAD_RECOVERY_VALIDATED / SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`

Certified complete: **NO**

## Canonical identity

The frozen First-100 queue is authoritative for Project 2424 identity. `T2424-0019` therefore uses the canonical title **NPMS — Neural Predictive Memory Spectroscopy**. The retained isolated package uses `MODEL-NPMS`; that provisional/source label remains provenance only.

- Project 2424 ID: `T2424-0019`
- Recovered provisional ID: `MODEL-NPMS`
- Canonical queue name: NPMS — Neural Predictive Memory Spectroscopy
- Protected role: diagnostic interpretation of predictive memory through spectral, temporal and intervention-based analysis

## Recovered isolated execution

- 17 tests passed in the retained recovered bundle;
- compact evidence: 15 runs, 36 ablation records;
- robustness evidence: 45 records;
- evidence class: `SYNTHETIC_CONTROLLED`;
- isolated verdict: `COMPACT_EVIDENCE_COMPLETE`;
- six negative findings remain explicitly preserved.

This canonical branch validates the recovered report and its claim boundaries. It has **not** migrated or rerun the original NPMS implementation.

## Exact-head recovery validation — 2026-08-29

Execution commit: `9b1b333b567b66587e1a3778bacaf906869755a1`  
Research reproducibility Actions run: `33256768781` — **SUCCESS**  
Canonical CI Actions run: `33256778805` — **SUCCESS**  
Evidence artifact: `9716038865` (`research-repro-wave-20260813-current-main`)  
Artifact digest: `sha256:bebc6f818f904529099607b1f228228375bb455a478ba846ac163434c945cfa8`  
Recovered report SHA-256: `22edc364cf9bd1d86c2a423ff782aa216b4844ad7005f3a79779a899b731753c`  
Environment: Ubuntu 24.04 hosted runner, x86_64, Node `v22.23.2`, npm `10.9.8`, 4 logical CPUs.

The recovery validator reported:

- recovered project ID `MODEL-NPMS` mapped to canonical `T2424-0019` through the retained recovery package;
- compact runs: 15;
- ablation records: 36;
- robustness records: 45;
- compact mean eigenvalue MAE: `0.21398422742689097`;
- compact mean target-prediction MSE: `0.029106375131836094`;
- negative findings preserved: 6;
- `certifiedComplete: false`;
- `externalBenchmarkExecuted: false`;
- `sourceMigrationComplete: false`.

This is a provenance/evidence-package validation only. It does not constitute an original-source NPMS rerun.

## Required negative boundaries

The following remain first-class evidence, not cleanup targets:

1. delay-PCA linear spectral recovery is substantially worse than identity smoke recovery;
2. multiscale-AR recovery is weak;
3. one switching-process regime is poorly recovered;
4. matched eigenvalue error ignores missing/spurious modes;
5. truncation ranks individual eigenvalues instead of conjugate groups;
6. frequency response is an autonomous resolvent proxy rather than a complete input-output transfer function.

The broader mechanism interpretation remains **`PARAMETER_CONFOUNDED_OR_NON_UNIQUE`** unless a separately frozen successor experiment changes that conclusion with new evidence.

## Hard blockers

- original source/config/result/evidence/manuscript tree is not migrated into canonical Git identity;
- the exact original implementation has not been rerun from canonical source;
- residual spectral verification and uncertainty quantification remain incomplete;
- contiguous switching fits and conjugate-group truncation need a separately versioned repair/evaluation lineage;
- no actual trained-model checkpoint or external dataset has been evaluated;
- no independent literature/manuscript audit has completed.

## Promotion rule

Do not mark `TESTED` for the original scientific implementation, `EXTERNAL_VALIDATED`, `NOVEL`, `RESEARCH_COMPLETE` or `CERTIFIED_COMPLETE` merely because this recovery validator passes. Canonical CI verifies only the evidence-recovery package and its fail-closed boundaries.

## Next exact gate

Recover the immutable original `MODEL-NPMS` source/config/result/evidence/manuscript tree or close the original-source requirement terminally as `SOURCE_BLOCKED`. Do not substitute this compact recovery package for missing original source.