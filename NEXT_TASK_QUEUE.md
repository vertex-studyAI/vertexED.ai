# NEXT_TASK_QUEUE

**Canonical queue updated:** 2026-08-14 12:40 IST  
**Ordering rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard; do not skip them. Closed tasks are removed rather than left as fake work.

## 1 — PERCY-STATE-001
- **Project:** Percy
- **Objective:** recover authoritative live state without reset.
- **Dependency:** real Mac/PRO-BLADE host access.
- **Exact deliverable:** checksummed snapshot of existing SQLite + WAL + checkpoint, integrity result, schema version, queue counters, leases/heartbeats/stale workers and dirty worktree state.
- **Evidence requirement:** raw commands/logs + hashes + timestamp; failures preserved.
- **Verification:** independent read-only doctor/recount against the snapshot.
- **Success:** counters become measured rather than `UNKNOWN`; no history loss.
- **Failure:** remain `F — EXTERNALLY BLOCKED`; do not create a replacement DB.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** Percy host canonical checkpoint/evidence directory + summarized control ledger.

## 2 — P2424-CANON-001
- **Project:** Project 2424
- **Objective:** re-establish the canonical source and reconcile project-count/status contradictions without losing dirty overlay.
- **Dependency:** preserved local source/Inkling access.
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
- **Dependency:** none for internal evidence work; owner/legal decisions remain separate.
- **Exact deliverable:** manuscript aligned to frozen result, exact source-level method map, final claim→table/figure→processed→raw→config→commit provenance, reproduction commands, figure/table regeneration, unresolved legal/bibliographic checklist.
- **Evidence requirement:** every quantitative claim maps to retained artifact/config/code revision; novelty text acknowledges JEPA-for-language prior work.
- **Verification:** independent metric/table/figure recomputation from retained artifact plus skeptic review.
- **Success:** `GREEN — PAPER PACKAGE` internally, while license/authorship/external review remain separately blocked if unresolved.
- **Failure:** flag every untraceable claim and keep package not ready.
- **Estimated compute:** low.
- **Priority:** P0.
- **Destination:** `vertex-studyAI/LAM-JEPA` canonical paper/repro files.

## 4 — NEUROCAD-FREEZE-001
- **Project:** NeuroCAD
- **Objective:** freeze the **residual reliability/coverage** test; do not rescue the falsified typed-IR/parser mechanism.
- **Dependency:** v1 evidence + frozen validation-dominant v2 experiment `EXP-NEUROCAD-COMPONENT-V2-20260814`.
- **Exact deliverable:** protocol covering same-provider learned direct/program generation, constrained generation, current compiler/validator, genuinely broader part-family OOD/compositional prompts, syntax/geometry/execution/semantic metrics, coverage/rejection tradeoff, error taxonomy and one primary falsifier.
- **Evidence requirement:** prompt/dataset manifest, provider/model/settings, compute/cost budget, determinism/seed policy, metric hierarchy, protocol hash; direct+matched validation is retained as a control.
- **Verification:** skeptical protocol review before any output.
- **Success:** immutable experiment ID tests a distinct reliability/coverage question.
- **Failure:** no experiment runs; NeuroCAD stays Tier A software/diagnostic work.
- **Estimated compute:** low.
- **Priority:** P0 research.
- **Destination:** canonical NeuroCAD protocol + experiment ledger.

## 5 — VERTEX-PROD-001
- **Project:** VertexED
- **Objective:** establish exact production revision and authenticated real-workflow truth.
- **Dependency:** canonical Vercel/project control + disposable production identities.
- **Exact deliverable:** `/api/health` exact revision proof, deployment ID, production monitor PASS, authenticated golden-journey evidence and cleanup record.
- **Evidence requirement:** non-secret timestamps/run IDs/request evidence tied to immutable SHA.
- **Verification:** scheduled monitor plus independent journey replay.
- **Success:** claim-specific production GREEN for tested revision/workflows.
- **Failure:** production remains `F — EXTERNALLY BLOCKED` even if commit statuses are green.
- **Estimated compute:** low; external access high.
- **Priority:** P0 product.
- **Destination:** production issue/evidence artifact + `PRODUCT_STATUS.md`.

## 6 — NEUROCAD-EXP-001
- **Project:** NeuroCAD
- **Objective:** test whether any residual reliability/coverage advantage survives contemporary learned/constrained baselines and broader OOD geometry.
- **Dependency:** `NEUROCAD-FREEZE-001` PASS.
- **Exact deliverable:** raw model/compiler outputs, executable artifacts, semantic/execution metrics, coverage/rejection curve, uncertainty/error taxonomy and preregistered ablations.
- **Evidence requirement:** exact protocol hash and immutable result bundle.
- **Verification:** independent metric recomputation and random sample execution.
- **Success:** residual claim clears its predefined gate; only then reconsider paper priority.
- **Failure:** end the NeuroCAD research line for this cycle; retain engineering/product utility and v1/v2 evidence; **do not invent a new mechanism**.
- **Estimated compute:** medium.
- **Priority:** P1 research after freeze.
- **Destination:** NeuroCAD results + experiment ledger.

## 7 — IRIS-FRONTIER-FREEZE-001
- **Project:** IRIS
- **Objective:** freeze the cheapest baseline-frontier study needed to decide whether the negative tradeoff is scientifically general enough to package.
- **Dependency:** v0.2 failure atlas + 2026 originality audit + successor-closure decision.
- **Exact deliverable:** development-only protocol comparing Huber/static, confirmed-change Huber, robust CUSUM, dual-timescale Huber, oracle-reset diagnostic and frozen IRIS reference at matched false-open budget or preregistered false-open/recovery Pareto.
- **Evidence requirement:** fixed thresholds/tuning budget, development seeds only, primary frontier metric, falsifier, stop rule; confirmatory seeds `1000–1029` remain untouched.
- **Verification:** reviewer attack for goalpost movement and permissive-gate confounding.
- **Success:** one frozen low-cost frontier study is runnable if an experiment slot is allocated.
- **Failure:** no new IRIS compute; preserve `D — NEGATIVE RESULT` package.
- **Estimated compute:** low to freeze.
- **Priority:** P1.
- **Destination:** IRIS protocol/failure package + experiment ledger.

## 8 — DARCY-FREEZE-001
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
- **Destination:** external validation record linked from `EXTERNAL_VALIDATION_QUEUE.md`.

## 10 — PORTFOLIO-RESCORE-001
- **Project:** Portfolio
- **Objective:** kill/promote based only on new decisive evidence.
- **Dependency:** material outputs from tasks 1–9 that actually became available.
- **Exact deliverable:** updated snapshot/tiering/kill list and next queue with <=5 Tier S projects and preferably fewer.
- **Evidence requirement:** every score/tier change cites exact new artifact/gate.
- **Verification:** ensure no project was promoted by naming, CI, manuscript existence or project count.
- **Success:** smaller or equally bounded active portfolio with clearer claims.
- **Failure:** preserve current tiers; invent no movement.
- **Estimated compute:** low.
- **Priority:** P1.
- **Destination:** canonical control documents.

## Closed this wave — not queue items

- `IRIS-DECIDE-001`: **CLOSED** — no new successor architecture authorized; reserved confirmatory seeds remain quarantined.
- NeuroCAD validation-confound diagnostic: **CLOSED / FALSIFIER FIRED** — matched validation recovers 100% of the bounded gap; typed-IR/parser-specific mechanism claim removed.
- Portfolio exact-state cleanup: **CLOSED on review branch** — one A–F state per canonical project; claim-specific GREEN tracked separately.

## Scheduling guard

No more than three major scientific experiments may run concurrently. At this point `NEUROCAD-EXP-001` is the only near-term major scientific run contemplated, and it is **not authorized until its new freeze passes**. IRIS and Darcy are protocol-freeze tasks only. `TSJEPA-FREEZE-001` remains design-only and is **not** in the top 10; it may enter only after a later portfolio rescore creates room.
