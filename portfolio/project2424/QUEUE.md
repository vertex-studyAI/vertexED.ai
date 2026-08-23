# Project2424 — QUEUE

**Updated:** 2026-08-23

Only tasks that can change evidence state belong here.

## P0 — Registry integrity

1. **RECOVER_IDENTITY_LINEAGE**
   - Recover the exact migration/canonicalization path from historical `P2424-*` maps into current `T2424-*` identities.
   - Never infer identity from numeric suffix alone.
   - Output: canonical alias/lineage table with source SHA and confidence/evidence status.
   - Green when: every mapped identity has an evidence-backed lineage; unresolved rows are explicitly `UNRESOLVED`, not guessed.

2. **RECONCILE_FIRST100_SOURCES**
   - For each First-100 identity, locate canonical source package(s), evidence, PR/commit lineage, and current status.
   - Output classification: `BUILD / MERGE / ONE_FINAL_TEST / FREEZE_NEGATIVE / ARCHIVE / BLOCKED`.
   - Green when: all 100 rows have an explicit classification and evidence pointer.

3. **AUDIT_23_CURRENT_DIRECTORIES**
   - Apply scientific gate checks to every directory represented in the current source-identity manifest.
   - Directory/test presence alone cannot pass.
   - Green when: every represented directory has explicit status, evidence, interpretation, and reproducibility state.

## P1 — Highest-value active science

4. **DARCY_2D_SUCCESSOR_FREEZE**
   - Freeze a new 2D finite-volume Darcy study before any new outcome.
   - Must include reduced-order/PCA, FNO, DeepONet and relevant mechanistic controls; immutable split/config/environment/hardware/seeds; ID/OOD/resolution-transfer metrics; compute and uncertainty accounting.
   - Green means `READY_TO_RUN`, not positive result.
   - Do not auto-run or auto-deploy before authorization.

5. **NEUROCAD_SUCCESSOR_RECOVERY**
   - Preserve the typed-parser falsification.
   - Materialize exact external dataset hashes, model/provider identities, matched baselines, >=2 benchmark adapters, H1/H2/H3, mechanism ablations and execution authorization.
   - Green means successor protocol is completely frozen and authorized; no result is implied.

6. **IRIS_PROVENANCE_EDGE**
   - Recover exact canonical development trajectories or authoritative pre-existing deterministic-equivalence evidence.
   - Seeds 1000–1029 remain inaccessible.
   - If exact recovery is impossible, close as `PROTOCOL_BLOCKED` rather than approximate-regenerating data.

## P2 — Publication packaging

7. **MEMORY_FAMILY_PACKAGE**
   - Consolidate NGMT v0.1 negative + NPMS non-unique result + related memory-transfer evidence into one research-family claim ledger.
   - Do not turn closed negative results into positive architecture claims.

8. **FAILURE_STUDIES_PACKAGE**
   - Consolidate Eigen-JEPA/APEN adverse controls and classical/information-matched baselines into a failure-oriented representation study.

9. **NEGATIVE_RESULT_ARCHIVES**
   - For every terminal result, preserve protocol, raw output, environment, code identity, adverse controls, reproduction evidence, and exact claim boundary in one immutable bundle.

## STOP RULE

Do not expand experimental work into unreconciled identities merely to increase project count. Registry provenance and scientific closure outrank count.
