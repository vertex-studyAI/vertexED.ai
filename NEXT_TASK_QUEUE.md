# NEXT_TASK_QUEUE

**Canonical queue established:** 2026-08-14 12:01 IST  
**Ordering rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard; do not skip them.

## 1 — PERCY-STATE-001
- **Project:** Percy
- **Objective:** recover authoritative live state without reset.
- **Dependency:** real Mac/PRO-BLADE host access.
- **Exact deliverable:** checksummed snapshot of existing SQLite + WAL + checkpoint, integrity result, schema version, queue counters, leases/heartbeats/stale workers and dirty worktree state.
- **Evidence requirement:** raw commands/logs + hashes + timestamp; failures preserved.
- **Verification:** independent read-only doctor/recount against the snapshot.
- **Success:** counters become measured rather than `UNKNOWN`; no history loss.
- **Failure:** remain `BLOCKED_EXTERNAL_MAC`; do not create a replacement DB.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** Percy host canonical checkpoint/evidence directory + summarized control ledger.

## 2 — P2424-CANON-001
- **Project:** Project 2424
- **Objective:** re-establish the canonical source and reconcile project-count/status contradictions without losing dirty overlay.
- **Dependency:** preserved local source/Inkling access from issue #20.
- **Exact deliverable:** verified Git HEAD/ancestry, preserved overlay manifest, baseline rerun log and canonical child-project map.
- **Evidence requirement:** `git fsck`, status/diff/untracked manifest, bundle/overlay hashes, smallest gate output.
- **Verification:** independent clone/recount from preserved bundle.
- **Success:** one canonical source and no ambiguous completion count.
- **Failure:** block source-dependent 2424 experiments; retain existing bounded reproductions.
- **Estimated compute:** low–medium.
- **Priority:** P0.
- **Destination:** canonical Project 2424 repo + control provenance summary.

## 3 — LAM-PAPER-001
- **Project:** LAM-JEPA
- **Objective:** close the negative-result paper package without scientific rescue.
- **Dependency:** none for internal evidence work; owner decisions remain separate.
- **Exact deliverable:** manuscript text aligned to frozen result, final claim-to-table/figure provenance, reproduce commands and unresolved legal/bibliographic checklist.
- **Evidence requirement:** every quantitative claim maps to retained artifact/config/code revision.
- **Verification:** independent metric/table/figure recomputation from retained artifact.
- **Success:** `GREEN — PAPER PACKAGE` internally, while license/authorship/external review remain separately blocked if unresolved.
- **Failure:** flag every untraceable claim and keep package not ready.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** `vertex-studyAI/LAM-JEPA` canonical paper/repro files.

## 4 — NEUROCAD-FREEZE-001
- **Project:** NeuroCAD
- **Objective:** freeze the dangerous-baseline/OOD experiment before any new evaluation.
- **Dependency:** canonical current benchmark/evidence.
- **Exact deliverable:** protocol covering same-provider direct generation, typed-IR system, constrained/validator ablations, OOD/compositional prompts, syntax/geometry/execution/semantic metrics and error taxonomy.
- **Evidence requirement:** dataset/prompt manifest, provider/model/settings, compute/cost budget, seed/determinism policy, primary metric and falsifier.
- **Verification:** skeptical protocol review before outputs are seen.
- **Success:** immutable experiment ID ready to run.
- **Failure:** no experiment runs.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** canonical NeuroCAD protocol/experiment ledger.

## 5 — NEUROCAD-EXP-001
- **Project:** NeuroCAD
- **Objective:** attack the current positive claim with the frozen dangerous baseline and OOD set.
- **Dependency:** `NEUROCAD-FREEZE-001` PASS.
- **Exact deliverable:** raw outputs, executable artifacts, metric table, uncertainty/error taxonomy and ablation results.
- **Evidence requirement:** exact protocol hash and immutable result bundle.
- **Verification:** independent metric recomputation and random sample execution.
- **Success:** claim survives predefined gate; promote paper evidence.
- **Failure:** downgrade to bounded software/negative scientific result; do not retune.
- **Estimated compute:** medium.
- **Priority:** P0.
- **Destination:** NeuroCAD results + control experiment ledger.

## 6 — IRIS-DECIDE-001
- **Project:** IRIS
- **Objective:** decide whether a scientifically justified successor exists or close the active line.
- **Dependency:** current v0.2 failure atlas and strong-baseline audit.
- **Exact deliverable:** either (A) versioned successor spec with changed hypothesis, mechanism, motivation, dangerous baselines, primary metric, `>=10%` or explicitly justified new gate, falsifier and analysis plan, or (B) closure memo preserving negative result and next scientific question only.
- **Evidence requirement:** every change from v0.2 linked to observed failure evidence; reserved seeds remain untouched.
- **Verification:** reviewer attack for goalpost movement and baseline weakness.
- **Success:** successor is frozen before compute or line is cleanly archived.
- **Failure:** no confirmatory seeds run.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** IRIS canonical protocol/failure package.

## 7 — DARCY-FREEZE-001
- **Project:** Darcy T2424-0050
- **Objective:** freeze learned matched-budget operator + OOD physical comparison.
- **Dependency:** canonical Project 2424 source if required for execution.
- **Exact deliverable:** protocol with numerical/reduced baseline, matched learned operator family, parameter/compute budget, held-out/misaligned regimes, uncertainty and falsifier.
- **Evidence requirement:** data-generation/version manifest and exact comparison budget.
- **Verification:** pre-run protocol audit.
- **Success:** experiment becomes runnable and falsifiable.
- **Failure:** retain synthetic mechanism only.
- **Estimated compute:** low to freeze; medium to run later.
- **Priority:** P1.
- **Destination:** Darcy protocol + experiment ledger.

## 8 — VERTEX-PROD-001
- **Project:** VertexED
- **Objective:** establish exact production revision and authenticated real workflow truth.
- **Dependency:** canonical Vercel/project control + disposable production identities.
- **Exact deliverable:** `/api/health` body/header exact revision proof, deployment ID, production monitor PASS, authenticated golden-journey evidence and cleanup record.
- **Evidence requirement:** non-secret timestamps/run IDs/screenshots or request IDs tied to immutable SHA.
- **Verification:** scheduled monitor plus independent journey replay.
- **Success:** claim-specific production GREEN for tested revision/workflows.
- **Failure:** production remains blocked even if commit statuses are green.
- **Estimated compute:** low; external access high.
- **Priority:** P0 product.
- **Destination:** production issue/evidence artifact + `PRODUCT_STATUS.md`.

## 9 — EXTVAL-LAM-001
- **Project:** LAM-JEPA
- **Objective:** obtain independent reproduction/critical review rather than endorsement.
- **Dependency:** `LAM-PAPER-001` immutable package.
- **Exact deliverable:** external validator record containing artifact revision, reproduction outcome, discrepancies and strongest claim/novelty criticism.
- **Evidence requirement:** validator identity/date + reproducible report or review.
- **Verification:** compare external metrics/claims with frozen ledger.
- **Success:** external-validation gate becomes claim-specifically supported.
- **Failure:** correct package and preserve discrepancy.
- **Estimated compute:** external.
- **Priority:** P1.
- **Destination:** `EXTERNAL_VALIDATION_QUEUE.md` evidence link / project review record.

## 10 — PORTFOLIO-RESCORE-001
- **Project:** Portfolio
- **Objective:** kill/promote based on new evidence after the preceding decisive gates.
- **Dependency:** results from tasks 1–9 that actually became available.
- **Exact deliverable:** updated snapshot/tiering/kill list and next queue with no more than five Tier S projects.
- **Evidence requirement:** score changes cite the exact new artifact/gate.
- **Verification:** ensure no project was promoted by naming, CI, manuscript existence or project count.
- **Success:** smaller or equally bounded active portfolio with clearer claims.
- **Failure:** preserve current tiers; do not invent movement.
- **Estimated compute:** low.
- **Priority:** P1.
- **Destination:** canonical control documents.

## Scheduling guard

Only `NEUROCAD-EXP-001` is authorized as a new major scientific run by this queue. IRIS and Darcy require freeze tasks first. This intentionally keeps the campaign below the three-experiment concurrency ceiling.
