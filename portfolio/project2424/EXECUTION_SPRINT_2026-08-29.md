# Project 2424 Execution Sprint — 2026-08-29

This file is an execution checkpoint, not a second canonical registry. The canonical project/claim/status sources remain the existing Project 2424 manifests, issue #496, and issue #523.

## Active closure lanes

1. **Identity / provenance**
   - Recover evidence-backed `P2424-*` → `T2424-*` lineage.
   - Never infer identity from numeric suffix alone.
   - First-100 rows may move only to `BUILD`, `MERGE`, `ONE_FINAL_TEST`, `FREEZE_NEGATIVE`, `ARCHIVE`, or `BLOCKED` when supported by exact evidence.
   - Unresolved mappings remain explicitly unresolved and do not increase completion counts.

2. **Reproducibility / experiments**
   - Reproduce frozen studies unchanged where possible.
   - Capture exact source revision, environment, seeds, commands, raw metrics, artifact digests, uncertainty, baselines, ablations, and limitations.
   - Any successor experiment must freeze hypothesis, falsifier, data provenance/splits, comparator family, seeds, metrics/statistics, budget, stop rules, environment, artifact paths, and execution authorization before outcome access.

3. **Preprint conversion**
   - Build claim-to-evidence matrices from retained evidence only.
   - Generate tables/figures only from retained artifacts.
   - Require identity, protocol, artifacts, reproduction, claim audit, and manuscript/PDF gates before `PREPRINT_READY`.

4. **Independent QA**
   - QA must not certify work authored in the same pass.
   - Reject source-only, template-only, proposal-only, or CI-only completion.

## Current high-priority scientific boundaries

- `T2424-1863`: frozen negative. No post-hoc rescue tuning.
- `T2424-0050` Darcy Latent Operator: parent remains `HOLD / MIXED_ROBUSTNESS`; no successor training until a fully frozen protocol and explicit authorization exist.
- NeuroCAD: preserve the typed-parser causal falsification / validation-dominant interpretation. Resolve the `T2424-0007` vs `T2424-0037` lineage before counting a publication twice.
- `T2424-0016` PST: exact source/checkpoint/raw-evidence lineage must be recovered and reproduced or closed with an explicit source blocker.
- `T2424-0019` NPMS: exact canonical source lineage must be recovered or the canonical package must close `SOURCE_BLOCKED`; later derived bundles cannot silently substitute for the missing source.
- `T2424-0025`: bounded synthetic robust-readout precursor. The 0% contamination control preserves a large median advantage, so the current evidence does not isolate a uniquely heavy-tail/non-Gaussian mechanism and does not establish a Transformer or learned-memory result.
- `T2424-0027`: merged and independently reproduced deterministic synthetic language-leakage diagnostic. The 95.83% normalized excess leakage reduction supports only the controlled synthetic mechanics claim; any real multilingual-encoder study is a separate preregistered line.
- `T2424-0032`: current canonical source/result evidence remains unrecovered. Queue/reference presence alone is not result evidence; issue #573 now tracks fail-closed source recovery.

## Immediate execution order

1. Close evidence-backed identity/provenance rows in the First-100.
2. Advance the strongest dependency-ready frozen reproduction.
3. Freeze any successor protocol that is genuinely ready, without accessing outcomes first.
4. Convert evidence-backed candidates into claim-audited manuscript sections/tables/figures.
5. Independently QA the strongest claimed closure from another lane.
6. Merge duplicates and archive weak/unsupported candidates instead of increasing nominal project count.

## Completed / active in the 2026-08-29 execution pass

### T2424-0025 paper conversion

Draft PR #567 contains an evidence-bounded manuscript, primary-source literature audit, deterministic figure generator, figures derived directly from retained raw metrics, figure provenance ledger, sentence-level claim audit, and release gate.

The project README has now been aligned with the retained 0% contamination negative control rather than implying unique non-Gaussian attribution. `RELEASE_METADATA.md` separates evidence-supported code/data statements from human-only release decisions. Code identity, synthetic-data scope, and external-validation non-claim are resolved; authorship, license choice, and clean PDF remain open.

The release verdict remains `NO-GO / NOT PREPRINT_READY`. No experimental outcome or threshold was changed.

### T2424-0027 synthetic paper conversion

Paper-conversion PR #568 corrects stale merge-pending status because canonical recovery PR #281 was already merged on 2026-08-12. The branch contains a bounded technical manuscript, primary-source literature audit, retained-evidence figure and generator, figure audit, preprint release gate, and successor-science boundary.

The frozen synthetic result remains unchanged: raw concept/language accuracy `1.0/1.0`, centered concept/language accuracy `1.0/0.361111...`, chance `0.333333...`, normalized excess leakage reduction `0.958333...`, global-centering language accuracy `1.0`.

### T2424-0027 real-encoder transfer gate

Issue #570 and draft PR #572 establish the next versioned scientific gate rather than modifying the synthetic precursor. Before outcome access the branch freezes:

- MASSIVE 1.1 at full dataset commit `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`;
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` at full model commit `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`;
- `en-US`, `es-ES`, `fr-FR` with train-fit/test-evaluation separation;
- deterministic per-cell selection and seeds `2401`–`2405`;
- no encoder fine-tuning or hyperparameter search;
- language-centering, global-centering, random-group, and random-subspace controls;
- parent-effect retention, intent preservation, specificity margin, success thresholds, and stronger falsifiers;
- artifact/provenance requirements and a fail-closed manifest validator with mutation tests.

A CPU GitHub Actions workflow was added to execute exactly this frozen protocol and retain a hashed evidence artifact. The workflow is an execution mechanism, not evidence until its run completes and its artifacts are independently inspected.

### NeuroCAD / T2424-0037

Draft PR #571 adds an evidence-bounded preprint gate and a fail-closed identity/publication-accounting record.

The scientific lineage is counted once under evidence-bearing `T2424-0037` while `T2424-0007` remains identity-conflict blocked pending an authoritative historical crosswalk. The paper gate requires both retained result generations to remain visible:

- historical v1 system result `19/20` versus original direct `12/20`;
- later reused 20-case matched-validation diagnostic where direct + validation and typed + validation both score `1.00`, yielding `validation_recovery_fraction = 1.00` and frozen `VALIDATION_DOMINANT` interpretation.

The latter falsifies a typed-parser-specific causal interpretation on the reused diagnostic. Product QA, outreach, and artifact hosting are explicitly prevented from being counted as OOD research evidence, external validation, or public deployment proof.

### T2424-0032 provenance lane

Issue #573 now records the current source blocker. No canonical `portfolio/project2424/projects/T2424-0032` package or exact indexed source match was recovered on current `main`, so no result is being reconstructed from the queue label. Closure requires authoritative identity/source/result provenance followed by reproduction; otherwise the valid terminal state is `SOURCE_BLOCKED`.

### Fabric-Induced Memory support lane

`build-the-future-11/Fabric-Induced-Memory` PR #1 is now merged to `main` at merge commit `112714198bbf71a858413a665cd8bd15185dffa6`.

The merged work replaces the dead legacy ablation path with a current-code full/no-memory/no-retrieval runner, multi-seed defaults, per-run provenance, manifest, descriptive aggregation, focused tests, evidence ledger, and CI gate. A high-severity audit finding was also repaired: the shared trainer calls `step()` directly, so ablation semantics are now enforced in `ControlledFIMSystem.step()` and cannot be bypassed by caller memory flags. Behavioral tests lock that property.

This validates research infrastructure only. A positive FIM memory/retrieval mechanism claim remains blocked until clean completed ablations, retained outputs, matched strong non-memory baselines, and appropriate statistical comparisons exist.

## Non-negotiable completion rule

Proposal count, source-directory presence, generated scaffolds, manuscript templates, green CI, or internal review do **not** constitute completed research. Negative, mixed, falsified, duplicate, archived, or blocked outcomes are valid terminal states when provenance and interpretation are complete.
