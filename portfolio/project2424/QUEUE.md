# Project2424 — QUEUE

**Updated:** 2026-08-23

Only tasks that can change evidence state belong here. Completed controls are recorded separately so they do not remain fake backlog.

## COMPLETED CONTROL-PLANE GATES

### FIRST100_DISPOSITION_CONTROL — DONE + TESTED
- Frozen First-100 queue resolves to exactly 100 unique ranked rows.
- Allowed terminal/action classes: `BUILD / MERGE / ONE_FINAL_TEST / FREEZE_NEGATIVE / ARCHIVE / BLOCKED`.
- Unrecovered rows fail closed; suffix/name adjacency cannot inherit evidence.
- Incremental evidence recoveries are layered through `FIRST_100_RECOVERY_OVERRIDES_20260823.json` and regression-tested.

### AUDIT_23_CURRENT_DIRECTORIES — DONE + TESTED
- Every directory represented in the current source-identity manifest is covered exactly once.
- Software integration, reproducibility and scientific interpretation remain separate fields.
- Bounded mechanics cannot be promoted to external scientific validation by the audit test.

### TERMINAL_RESULT_FREEZE — DONE + TESTED
- NGMT, T2424-1863, NeuroCAD typed-parser mechanism, Eigen-JEPA, APEN and other terminal adverse results are protected against silent positive relabeling.
- Darcy parent HOLD and IRIS seed/protocol boundaries are protected.

## P0 — Registry integrity

1. **RECOVER_IDENTITY_LINEAGE**
   - Continue recovering exact migration/canonicalization paths among historical provisional names, `P2424-*`, and current `T2424-*` identities.
   - Never infer identity from numeric suffix alone.
   - Already narrowed: PST/NPMS corroborated aliases; FinanceJEPA/ESNF/PRC/PEN candidate crosswalks; LGWM P→T conflict; NeuroCAD conflict group; Typhon release artifacts.
   - Green when: each claimed crosswalk has a source-controlled identity edge; unresolved rows remain explicitly unresolved.

2. **RECOVER_MISSING_FIRST100_SOURCE_BYTES**
   - Prioritize identities with concrete recovery leads rather than generic registry-only rows.
   - PST/NPMS: locate original archive bytes, not prose reconstruction.
   - FinanceJEPA/ESNF/PRC/PEN: migrate recovered package bytes only after canonical crosswalk.
   - ATG: recover exact Atlas source/revision crosswalk to T2424-0020.
   - FI-JEPA: obtain target-repository ref/branch creation access or authorized maintainer integration.
   - Typhon: identify which recovered archive/release artifact is canonical T2424-0055.

## P1 — Highest-value active science

3. **DARCY_LEARNED_OOD_FREEZE_COMPLETION**
   - Parent bounded 1D result and harder mixed audit remain immutable/HOLD.
   - v2 generator semantics are now frozen pre-outcome and B2 PCA+ridge exists.
   - Implement/freeze B3 FNO-1D and B4 DeepONet, exact learned environment, hardware identity, parameter/runtime accounting and eligibility tests.
   - Training remains forbidden until the authorization gate is complete.
   - A true 2D finite-volume successor remains a later separately versioned study; do not silently turn the current 1D v2 protocol into 2D.

4. **NEUROCAD_SUCCESSOR_RECOVERY**
   - Preserve `VALIDATION_DOMINANT`; never revive typed-parser causal superiority.
   - Materialize exact external dataset hashes, model/provider identities, matched baselines, >=2 benchmark adapters, H1/H2/H3, mechanism ablations and execution authorization.
   - Green means successor protocol is completely frozen and authorized; no result is implied.

5. **IRIS_PROVENANCE_EDGE**
   - Recover exact canonical development trajectories or authoritative pre-existing deterministic-equivalence evidence.
   - Seeds 1000–1029 remain inaccessible.
   - If exact recovery is impossible, retain `PROTOCOL_BLOCKED` rather than approximate-regenerating data.

## P2 — Evidence/release packaging

6. **MEMORY_FAMILY_PACKAGE**
   - Consolidate NGMT v0.1 negative + NPMS non-unique result + related memory-transfer evidence into one research-family claim ledger.
   - Do not turn closed negative results into positive architecture claims.

7. **FAILURE_STUDIES_PACKAGE**
   - Consolidate Eigen-JEPA/APEN/PEN/PRC/ESNF adverse controls and matched/simple baselines where identities and protocols permit.
   - Keep provisional/candidate identity evidence visibly separate from canonical experiments.

8. **NEGATIVE_RESULT_ARCHIVES**
   - For every terminal result, preserve protocol, raw output, environment, code identity, adverse controls, reproduction evidence, and exact claim boundary in one immutable bundle.

## STOP RULE

Do not expand experimental work into unreconciled identities merely to increase project count. Registry provenance and scientific closure outrank count. Planning rows are never execution evidence.
