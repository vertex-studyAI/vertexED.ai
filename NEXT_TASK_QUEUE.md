# NEXT_TASK_QUEUE

**Reconciled:** 2026-08-14 IST after `IRIS_SUCCESSOR_DECISION_20260814.md`.  
**Ordering:** information gain × closure probability × evidence value ÷ cost. No queue reset; historical tasks/failed runs remain preserved. Dependencies are hard.

## 1 — PERCY-STATE-001
- **Project:** Percy
- **Objective:** recover authoritative live state without reset.
- **Dependency:** real Mac/PRO-BLADE host access.
- **Exact deliverable:** checksummed existing SQLite + WAL + checkpoint snapshot, integrity/schema report, queue counters, leases/heartbeats/stale workers and dirty worktree state.
- **Evidence:** raw commands/logs/hashes/timestamp; preserve failures.
- **Verification:** independent read-only doctor/recount against snapshot.
- **Success:** live counters become measured; no history loss.
- **Failure:** remain `BLOCKED_EXTERNAL_MAC`; never create a replacement DB.
- **Compute:** low. **Priority:** P0.
- **Destination:** Percy canonical checkpoint/evidence directory + control summary.

## 2 — P2424-CANON-001
- **Project:** Project 2424
- **Objective:** re-establish canonical preserved source and reconcile count/status contradictions without losing dirty overlay.
- **Dependency:** preserved local source/Inkling access.
- **Deliverable:** verified HEAD/ancestry, overlay manifest, baseline rerun log, canonical child map.
- **Evidence:** `git fsck`, status/diff/untracked manifest, bundle/overlay hashes, smallest gate output.
- **Verification:** independent clone/recount from preserved bundle.
- **Success:** one canonical source; no ambiguous completion count.
- **Failure:** source-dependent 2424 experiments remain blocked; existing bounded reproductions stand.
- **Compute:** low–medium. **Priority:** P0.
- **Destination:** canonical Project 2424 source + control provenance.

## 3 — LAM-PAPER-001
- **Project:** LAM-JEPA
- **Objective:** close the negative-result paper package without scientific rescue.
- **Dependency:** none for internal evidence work; owner/legal/external decisions separate.
- **Deliverable:** evidence-aligned manuscript, final claim→table/figure→processed→raw→config→commit provenance, reproduce commands, legal/bibliographic checklist.
- **Evidence:** every quantitative claim maps to retained artifact/config/code revision; locked-test non-access remains explicit.
- **Verification:** independent metric/table/figure recomputation from retained artifact.
- **Success:** `GREEN — PAPER PACKAGE` internally, without claiming publication/external validation.
- **Failure:** any untraceable/stale positive claim keeps package not ready.
- **Compute:** low. **Priority:** P0.
- **Destination:** `vertex-studyAI/LAM-JEPA` canonical paper/repro files.

## 4 — NEUROCAD-FREEZE-001
- **Project:** NeuroCAD
- **Objective:** freeze the most dangerous same-provider/direct/validator/OOD experiment before new model outputs.
- **Dependency:** canonical current v1 benchmark/evidence.
- **Deliverable:** immutable protocol covering direct generation, direct+validator, typed IR without validator, full typed IR+validator, retrieval/template control where feasible, OOD/compositional/new-family/invalid prompts, syntax/geometry/execution/semantic metrics and error taxonomy.
- **Evidence:** prompt/data manifest, provider/model/settings, token/tool/compute budget, seed/determinism policy, primary metric, threshold and falsifier.
- **Verification:** skeptical protocol review proves outcome files do not predate freeze.
- **Success:** immutable V2 experiment ID ready to run.
- **Failure:** no V2 evaluation runs; research remains bounded software evidence.
- **Compute:** low. **Priority:** P0.
- **Destination:** canonical NeuroCAD protocol/experiment registry.

## 5 — NEUROCAD-EXP-001
- **Project:** NeuroCAD
- **Objective:** attack the current positive claim once under the frozen dangerous baseline/OOD protocol.
- **Dependency:** `NEUROCAD-FREEZE-001` PASS.
- **Deliverable:** raw generations, executable artifacts, metric table, uncertainty, error taxonomy and ablations.
- **Evidence:** exact protocol hash + immutable result bundle; all failures retained.
- **Verification:** independent metric recomputation and sampled executable-geometry checks.
- **Success:** predeclared reliability/generalization gate survives; promote paper evidence.
- **Failure:** downgrade research mechanism to bounded/negative or product-only utility; no confirmatory prompt/protocol retuning.
- **Compute:** medium. **Priority:** P0.
- **Destination:** NeuroCAD V2 results + experiment registry.

## 6 — IRIS-FRONTIER-FREEZE-001
- **Project:** IRIS
- **Objective:** freeze only the baseline frontier needed to determine whether any residual problem remains for a future learned successor.
- **Dependency:** current v0.2 failure package + 2026-08-14 strong-baseline audit + successor-closure decision.
- **State:** **DEFERRED until LAM/NeuroCAD closure capacity permits; no successor architecture authorized.**
- **Deliverable:** versioned development protocol comparing Huber/static robust update, confirmed-change Huber, robust CUSUM/switching, dual-timescale Huber, oracle-reset diagnostic, current frozen IRIS reference and a matched learned recurrent/state-space baseline only if budget can be frozen fairly.
- **Evidence:** predeclared false-open budget or frozen false-open/recovery Pareto rule; `TWMSE25`, right-censored recovery + recovery fraction, `POST_MSE50PLUS`, false-open rate, clean/heavy-tail MSE, and learned resource accounting.
- **Verification:** protocol/reviewer audit for threshold-sweep leakage, goalpost movement and false-open confounding before outputs.
- **Success:** a fair immutable frontier experiment exists; confirmatory seeds `1000–1029` remain quarantined.
- **Failure:** no experiment runs and learned-successor direction remains closed for this cycle.
- **Compute:** low to freeze. **Priority:** P1 after Tier-S closure work.
- **Destination:** IRIS canonical protocol/failure package.

## 7 — DARCY-FREEZE-001
- **Project:** Darcy T2424-0050
- **Objective:** freeze learned matched-budget operator + OOD physical comparison.
- **Dependency:** canonical Project 2424 source if required for execution.
- **Deliverable:** numerical/reduced baseline, matched FNO/DeepONet/U-Net/ROM-style controls where feasible, equal budget, held-out/misaligned physical regimes, uncertainty and falsifier.
- **Evidence:** data-generation/version manifest + exact comparison budget.
- **Verification:** pre-run protocol audit.
- **Success:** runnable falsifiable experiment.
- **Failure:** retain synthetic mechanism only.
- **Compute:** low to freeze; medium to run later. **Priority:** P1.
- **Destination:** Darcy protocol + experiment registry.

## 8 — VERTEX-PROD-001
- **Project:** VertexED
- **Objective:** establish exact production revision and authenticated real-workflow truth.
- **Dependency:** canonical Vercel/project control + disposable production identity.
- **Deliverable:** `/api/health` or equivalent exact revision proof, deployment ID, production monitor PASS, authenticated golden-journey evidence and cleanup record.
- **Evidence:** non-secret timestamps/run/request IDs tied to immutable SHA; signup/login/onboarding/plan/practice/review/notes/account-isolation/recovery/logout results.
- **Verification:** scheduled monitor + independent journey replay.
- **Success:** claim-specific production GREEN for tested revision/workflows.
- **Failure:** production remains blocked even if commit statuses are green.
- **Compute:** low; external access high. **Priority:** P0 product.
- **Destination:** production evidence + `PRODUCT_STATUS.md`.

## 9 — EXTVAL-LAM-001
- **Project:** LAM-JEPA
- **Objective:** obtain independent reproduction/critical review, not endorsement.
- **Dependency:** immutable `LAM-PAPER-001` package.
- **Deliverable:** validator identity/relationship/date, exact artifact revision, environment/commands, reproduction outcome, discrepancies and strongest scientific/novelty criticism.
- **Evidence:** raw/reproducible report or review.
- **Verification:** compare external metrics/claims against frozen ledger.
- **Success:** external gate gains precisely scoped support or a precise mismatch is surfaced.
- **Failure:** mismatch becomes first-class blocker/evidence; never rewrite the science to hide it.
- **Compute:** external. **Priority:** P1.
- **Destination:** external-validation evidence record.

## 10 — PORTFOLIO-RESCORE-001
- **Project:** Portfolio
- **Objective:** kill/promote only from new decisive evidence after tasks above.
- **Dependency:** material outputs that actually became available.
- **Deliverable:** updated snapshot/tiering/kill list and next queue, max five Tier-S efforts.
- **Evidence:** every score/tier change cites the exact new artifact/gate.
- **Verification:** no promotion from naming, CI, manuscript existence, project count or agent count.
- **Success:** portfolio stays bounded or gets smaller with clearer claims.
- **Failure:** preserve current tiers; invent no movement.
- **Compute:** low. **Priority:** P1.
- **Destination:** canonical control documents.

## Closed/superseded task lineage

- `IRIS-DECIDE-001` — **COMPLETED/SUPERSEDED** by `portfolio/research/IRIS_SUCCESSOR_DECISION_20260814.md`: no unfrozen successor architecture is authorized; reserved seeds remain quarantined.
- Historical NGMT freeze work is **SUPERSEDED_BY_EVIDENCE** because v0.1 was subsequently frozen/executed and is negative.
- Historical T2424-1863 exact-head verification is **SUPERSEDED_COMPLETE**.
- Historical checkpoint tasks superseded by later checkpoints remain preserved in historical SQLite/CSV rather than deleted.

## Scheduling guard

Only `NEUROCAD-EXP-001` is currently authorized as a new major scientific run, and only after its freeze passes. IRIS and Darcy are freeze-only tasks; JEPA×time-series is defined but **not active-queued**. This intentionally remains below the three-major-experiment ceiling.