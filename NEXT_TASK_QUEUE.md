# NEXT TASK QUEUE

**As of:** 2026-08-14 after convergence wave 1  
**Queue law:** dependency-aware, deduplicated, evidence-producing tasks only. Do not dispatch at high concurrency. A blocked task does not justify spawning substitutes.

## Closed since previous queue

- `CONV-004` LAM-JEPA originality + three-reviewer attack — **CLOSED** on `paper/convergence-review-20260814`.
- `CONV-005` IRIS v0.2 scientific claim freeze — **CLOSED** in `portfolio/research/IRIS_CLAIM_FREEZE_20260814.md`; successor confirmatory seeds remain locked.
- `CONV-009` select one Tier A experiment — **CLOSED**: T2424-0027 real encoder selected; Darcy held; NPMS returned to source recovery.
- NeuroCAD gate design was **REFINED, not fully closed**: current v1 cannot fairly test structural part-family OOD, and the learned comparator cannot run until an exact model/provider/budget and new benchmark are frozen.

## 1 — P0 — Recover real Percy host state

- **Project:** Percy
- **Objective:** establish trustworthy live task/worker/DB state before any new queue creation.
- **Dependency:** access to `/Volumes/PRO-BLADE/Atlas/Percy`.
- **Exact deliverable:** `artifacts/recovery/PERCY_HOST_RECOVERY_20260814.md` plus machine-readable DB/WAL/process/task snapshot.
- **Evidence requirement:** existing SQLite/WAL/process state, integrity result, backup hash, queued/running/failed/blocked/stale/completed counts, leases/heartbeats, PIDs/commands, provider/resource state; preserve failures.
- **Verification:** independent SQLite recount + process inspection; distinguish logical identities, shell-only processes and active workers.
- **Success:** real counters and integrity truth measured.
- **Failure:** unavailable/unrecoverable host remains `BLOCKED_EXTERNAL`; no large queue is created.
- **Estimated compute:** LOW.
- **Canonical destination:** real Percy host recovery artifacts + reconciled control-repo summary.

## 2 — P0 — Certify VertexED exact production revision

- **Project:** VertexED
- **Objective:** make the live site prove the immutable revision it serves, then run the authenticated golden journey on that exact revision.
- **Dependency:** canonical deployment access.
- **Exact deliverable:** health artifact with exact served SHA + authenticated journey evidence.
- **Evidence requirement:** deployment identity, intended commit SHA, health response, account journey step results and denial checks.
- **Verification:** canonical public monitor + disposable authenticated account; Vercel/GitHub commit status alone is insufficient.
- **Success:** exact revision + public boundaries + authenticated journey pass.
- **Failure:** missing/mismatched revision or journey failure keeps production non-GREEN.
- **Estimated compute:** LOW.
- **Canonical destination:** VertexED production evidence lineage.

## 3 — P0 — Close remaining LAM-JEPA provenance gaps

- **Project:** LAM-JEPA
- **Objective:** turn `PROVENANCE_MATRIX.md` from mostly GREEN into a fail-closed paper manifest.
- **Dependency:** frozen retained ARC artifacts.
- **Exact deliverable:** exact artifact ID/path/hash for matched-supervised evidence; exact artifact for bounded DeBERTa characterization if retained; deterministic figure-source manifest; environment manifest.
- **Evidence requirement:** no new scientific training; every number traced to retained raw data/protocol/source.
- **Verification:** independent recomputation and hash checks; unresolved evidence causes claim/display removal or RED marker.
- **Success:** every quantitative table/figure intended for release has complete provenance.
- **Failure:** missing retained artifact blocks the affected display; do not rerun merely to recreate a preferred number.
- **Estimated compute:** LOW.
- **Canonical destination:** `vertex-studyAI/LAM-JEPA` paper/reproducibility package.

## 4 — P0 — Make LAM-JEPA paper package mechanically reproducible

- **Project:** LAM-JEPA
- **Objective:** generate paper tables/figures from evidence rather than hand-entered prose.
- **Dependency:** task 3 source-data manifest.
- **Exact deliverable:** deterministic scripts for (a) primary full/baseline/ablation + chance figure, (b) paired mechanism-effect figure, (c) reproducibility-lineage figure/table, plus one command that regenerates them.
- **Evidence requirement:** source data checksum-addressed to frozen artifacts; no decorative or inferred results.
- **Verification:** fresh execution reproduces generated files/hashes within declared deterministic boundaries.
- **Success:** manuscript displays regenerate from retained evidence with documented command.
- **Failure:** any figure requires manual result editing → paper package remains YELLOW.
- **Estimated compute:** LOW.
- **Canonical destination:** LAM paper figure/table generation directory.

## 5 — P0 — Implement and run T2424-0027 real-encoder development diagnostic

- **Project:** T2424-0027
- **Objective:** execute the selected Tier A real-representation falsification study exactly once under the frozen v1 protocol.
- **Dependency:** execution environment capable of loading the pinned XLM-R revision and frozen XNLI revision; implementation must match `REAL_ENCODER_PROTOCOL_V1.md` before inference.
- **Exact deliverable:** source implementation, resolved model/data hashes, frozen selected indices, raw embeddings/checksums, centroids/subspaces, probe coefficients, raw predictions, bootstrap summaries, gate verdict and verifier.
- **Evidence requirement:** one encoder only; six fixed languages; development validation subset only until G0/G1 pass; all controls retained.
- **Verification:** independent metric recomputation and protocol verifier; official XNLI test remains unopened unless the development promotion rule passes.
- **Success:** record `PASS` or `FAIL` exactly against frozen G0/G1/G2/G3; a negative result closes the synthetic-to-real question honestly.
- **Failure:** pinned resources unavailable → `BLOCKED_EXTERNAL_RESOURCE`; do not substitute a friendlier model/dataset.
- **Estimated compute:** LOW–MEDIUM, bounded single encoder.
- **Canonical destination:** `portfolio/project2424/projects/T2424-0027/evidence/real_encoder_v1/`.

## 6 — P1 — Freeze NeuroCAD learned comparator amendment

- **Project:** NeuroCAD / T2424-0037
- **Objective:** make the dangerous same-model direct-generation comparison execution-ready without inventing a provider.
- **Dependency:** actual accessible model/provider identity and a newly authored frozen benchmark not used in v1 development.
- **Exact deliverable:** versioned amendment to `ADVANCEMENT_PROTOCOL_20260814.md` fixing model/revision, prompts, decoding, retries, call/token budget, benchmark hash, practical effect threshold, uncertainty rule and cost ceiling.
- **Evidence requirement:** both M1 typed-IR and B1 direct arms use the same model/provider/task budget where technically feasible.
- **Verification:** protocol committed before any benchmark outputs are observed.
- **Success:** experiment becomes execution-authorized.
- **Failure:** no fair/stable comparator → keep NeuroCAD claim bounded; do not replace it with a weak baseline.
- **Estimated compute:** LOW.
- **Canonical destination:** T2424-0037 protocol directory.

## 7 — P1 — Define NeuroCAD v2 generic representation before structural OOD

- **Project:** NeuroCAD / T2424-0037
- **Objective:** determine whether a real generic typed CAD mechanism can exist beyond the current `rectangular_plate` IR before testing part-family generalization.
- **Dependency:** none beyond current source; no OOD benchmark execution.
- **Exact deliverable:** v2 design with reusable geometry/feature primitives, units/constraints, composition/boolean operations, references/placement, validation and compiler semantics; explicit development/validation/held-out family split policy.
- **Evidence requirement:** no one-regex-branch-per-test-family design; hidden/independent held-out cases must not guide implementation patches.
- **Verification:** reviewer can distinguish generic primitives from family-specific templates; held-out evaluation remains untouched.
- **Success:** mechanism is precise enough to implement and falsify.
- **Failure:** design reduces to hard-coded family templates → broader research claim archived; v1 remains useful software only.
- **Estimated compute:** NONE–LOW.
- **Canonical destination:** T2424-0037 v2 design/protocol package.

## 8 — P1 — Convert IRIS v0.2 into a negative/mixed manuscript package

- **Project:** IRIS v0.2
- **Objective:** close the second active paper slot around the reproduced robustness–adaptation tradeoff without successor rescue.
- **Dependency:** `IRIS_CLAIM_FREEZE_20260814.md` and existing reproduced package/baseline audit.
- **Exact deliverable:** evidence-backed manuscript structure, figure/table provenance, limitations, failure taxonomy and originality audit against robust filtering/change detection prior art.
- **Evidence requirement:** preserve scalar heavy-tail gains, abrupt failure, learned-transfer failure, stronger baseline tradeoffs and seed-block lock.
- **Verification:** every result traces to recovered archive/hash; no successor result or external dataset invented.
- **Success:** defensible technical-report/workshop candidate or explicit archive decision.
- **Failure:** novelty too weak → publish/retain as technical negative report rather than adding rescue experiments.
- **Estimated compute:** LOW.
- **Canonical destination:** IRIS manuscript/evidence package in control repo until canonical IRIS source repo is available.

## 9 — P1 — Recover NPMS original scientific source before any new experiment

- **Project:** NPMS / T2424-0019
- **Objective:** resolve whether the recovered compact evidence maps to a runnable original implementation/checkpoint.
- **Dependency:** access to retained NPMS source/config/checkpoint archive if it exists.
- **Exact deliverable:** canonical source/config/checkpoint provenance map + clean rerun or precise `SOURCE_UNRECOVERED` verdict.
- **Evidence requirement:** preserve all known spectral/switching/truncation failures; recovery validator is not a substitute for original source.
- **Verification:** hashes + fresh command + result comparison if source is recovered.
- **Success:** NPMS can later enter a scientific experiment queue with a real source identity.
- **Failure:** source/checkpoint cannot be recovered → archive current line as recovered compact evidence only.
- **Estimated compute:** LOW.
- **Canonical destination:** `portfolio/project2424/projects/T2424-0019/`.

## 10 — P1 — Package bounded external validation

- **Project:** LAM-JEPA, Research Atlas V4, VertexED, and later NeuroCAD/T2424-0027 only if internal gates pass
- **Objective:** turn internally complete claims into precise non-author tests.
- **Dependency:** relevant internal evidence bundle complete.
- **Exact deliverable:** immutable artifact/version + one bounded validator request per eligible claim from `EXTERNAL_VALIDATION_QUEUE.md`.
- **Evidence requirement:** version/hash of sent package, requested action and returned evidence when available.
- **Verification:** outreach/pending review remains `BLOCKED_EXTERNAL`; no GREEN on send.
- **Success:** independent evidence received and recorded with success/failure interpretation.
- **Failure:** disagreement/non-reproduction narrows or blocks claim and is preserved.
- **Estimated compute:** LOW internal.
- **Canonical destination:** external-validation ledger + project evidence package.

## Concurrency enforcement

- Major science currently authorized: **T2424-0027 real-encoder development only**. NeuroCAD learned/OOD work is design-blocked; no second/third experiment is filled merely for capacity.
- Paper conversions: **LAM-JEPA + IRIS v0.2** only.
- Product validation: **VertexED** is active; second slot remains unused unless a product becomes externally executable with a clear closure gate.

Do not create task 11 until one of these ten materially closes, falsifies or unblocks a project.
