# NEXT TASK QUEUE

**As of:** 2026-08-14  
**Queue law:** dependency-aware, deduplicated, evidence-producing tasks only. Do not dispatch this queue at high concurrency. External blockers remain blockers.

## 1 — P0 — Recover real Percy host state

- **Project:** Percy
- **Objective:** establish trustworthy live task/worker/DB state before any new queue creation.
- **Dependency:** access to `/Volumes/PRO-BLADE/Atlas/Percy`.
- **Exact deliverable:** `artifacts/recovery/PERCY_HOST_RECOVERY_20260814.md` plus machine-readable snapshot containing DB path/schema/version, SQLite integrity result, WAL state, backup hash, queued/running/failed/blocked/stale/completed counts, leases/heartbeats, process PIDs/commands, and provider/resource status.
- **Evidence requirement:** read existing DB/WAL/process state; preserve failures; no destructive reset.
- **Verification:** independent recount from SQLite + process inspection; compare snapshot totals to raw queries.
- **Success:** integrity passes or documented recoverable fault; real counters measured; shell-only workers distinguished from active workers.
- **Failure:** host unavailable/corrupt without recoverable backup → remain `BLOCKED_EXTERNAL`; create no large queue.
- **Estimated compute:** LOW.
- **Canonical destination:** real Percy host + control-repo summarized evidence only after reconciliation.

## 2 — P0 — Certify VertexED exact production revision

- **Project:** VertexED
- **Objective:** make the live site prove the immutable source revision it serves.
- **Dependency:** canonical Vercel/deployment access.
- **Exact deliverable:** production-health artifact where `/api/health` body/header report the intended immutable revision and the canonical public smoke monitor passes.
- **Evidence requirement:** deployment ID/project identity, intended commit SHA, health response, retained workflow artifact.
- **Verification:** scheduled/public monitor against `https://www.vertexed.app`; do not substitute Vercel commit status.
- **Success:** exact revision identity passes plus current public smoke boundaries.
- **Failure:** revision missing/mismatched → production remains blocked; do not weaken assertion.
- **Estimated compute:** LOW.
- **Canonical destination:** VertexED production evidence / issue #44/#137 lineage.

## 3 — P0 — Close LAM-JEPA provenance chain

- **Project:** LAM-JEPA
- **Objective:** prove every manuscript quantitative claim traces to immutable evidence.
- **Dependency:** current frozen LAM result package.
- **Exact deliverable:** one provenance matrix: `claim → table/figure → processed artifact → raw artifact → protocol/config → source commit`, with missing links explicitly RED.
- **Evidence requirement:** artifact IDs/hashes, exact commands, dataset identity, seeds, table/figure generation commands.
- **Verification:** independent recomputation of manuscript numbers from retained raw metrics; no new training.
- **Success:** all result claims traced or removed/flagged.
- **Failure:** any number cannot be reproduced → manuscript claim blocked until resolved.
- **Estimated compute:** LOW.
- **Canonical destination:** `vertex-studyAI/LAM-JEPA` paper/reproducibility package.

## 4 — P0 — LAM-JEPA originality + three-reviewer attack

- **Project:** LAM-JEPA
- **Objective:** determine whether the bounded negative result is scientifically worth releasing and what criticism still threatens it.
- **Dependency:** task 3 provenance closure.
- **Exact deliverable:** `ORIGINALITY_AUDIT.md` plus three reviewer reports: novelty skeptic, experimental skeptic, mechanism skeptic.
- **Evidence requirement:** closest literature/mechanisms with verifiable citations; criticisms tied to current frozen protocol.
- **Verification:** each criticism names the cheapest decisive evidence; no vague “more experiments”.
- **Success:** contribution boundary and remaining gates become explicit.
- **Failure:** if result is too narrow/incremental for a research submission, downgrade to technical report rather than adding rescue experiments.
- **Estimated compute:** LOW.
- **Canonical destination:** LAM-JEPA manuscript/review directory.

## 5 — P0 — Freeze IRIS v0.2 negative closure

- **Project:** IRIS v0.2
- **Objective:** finalize the mixed/negative result without touching reserved confirmatory seeds.
- **Dependency:** existing reproduced v0.2 evidence.
- **Exact deliverable:** claim ledger with question, frozen hypothesis, mechanism, novelty boundary, supported claim, non-claims, falsifier, robust/changepoint baselines, failure taxonomy and successor-separation rule.
- **Evidence requirement:** retained ~5.33–5.36% development result, frozen >=10% gate, Huber comparison, burst failure evidence.
- **Verification:** confirm reserved seeds remain untouched and no post-result threshold changes occurred.
- **Success:** v0.2 can be archived/published as a negative/mixed package without ambiguity.
- **Failure:** provenance gap → package remains incomplete; do not run new seeds to compensate.
- **Estimated compute:** LOW.
- **Canonical destination:** existing IRIS evidence/manuscript path in control repo.

## 6 — P0 — Freeze NeuroCAD decisive protocols

- **Project:** NeuroCAD / T2424-0037
- **Objective:** preregister the two experiments that can actually promote or falsify the controlled positive result.
- **Dependency:** existing held-out-template v1 evidence.
- **Exact deliverable:** (a) same-provider learned direct-vs-IR protocol; (b) new-part-family OOD protocol; both with datasets/tasks, baselines, metrics, seeds/repeats if stochastic, compute match, falsifier and analysis plan.
- **Evidence requirement:** preserve 19/20 vs 12/20 result and O018 negative-width failure unchanged.
- **Verification:** protocol hashes/commits recorded before any results.
- **Success:** protocols are executable and cannot be changed after result inspection without new version.
- **Failure:** no fair provider/model comparator or meaningful OOD set → keep NeuroCAD narrow and do not manufacture a broader claim.
- **Estimated compute:** LOW.
- **Canonical destination:** `portfolio/project2424/projects/T2424-0037/`.

## 7 — P1 — Run NeuroCAD learned direct-vs-IR comparison

- **Project:** NeuroCAD / T2424-0037
- **Objective:** attack the current result with the most dangerous learned direct-generation baseline.
- **Dependency:** task 6 frozen protocol + provider/model availability.
- **Exact deliverable:** raw outputs, configs, cost/runtime, syntax/geometry/execution/semantic metrics, invalid-rejection results, failure taxonomy and verifier report.
- **Evidence requirement:** same provider/model/task budget where feasible; no hand-cleaning failed outputs.
- **Verification:** independent parser/execution metric recomputation.
- **Success:** report result exactly; promotion only if preregistered gate passes.
- **Failure:** baseline matches/beats IR → narrow/falsify the contribution and preserve result.
- **Estimated compute:** MEDIUM.
- **Canonical destination:** T2424-0037 experiment artifact directory.

## 8 — P1 — Run NeuroCAD new-part-family OOD

- **Project:** NeuroCAD / T2424-0037
- **Objective:** test geometry-family generalization rather than linguistic-template variation.
- **Dependency:** task 6 frozen OOD protocol.
- **Exact deliverable:** complete frozen OOD input set, generated programs/geometries, executable results, error taxonomy, aggregate metrics and raw artifact hashes.
- **Evidence requirement:** zero post-hoc prompt substitution; failed geometry preserved.
- **Verification:** independent OpenSCAD/backend execution and metric recomputation.
- **Success:** preregistered OOD gate passes with interpretable failure rate.
- **Failure:** OOD collapse → keep paper explicitly controlled/narrow or archive broader research claim.
- **Estimated compute:** LOW–MEDIUM.
- **Canonical destination:** T2424-0037 OOD artifact directory.

## 9 — P1 — Select exactly one Tier A science experiment

- **Project:** portfolio research
- **Objective:** choose the single highest-information experiment after current Tier S gates, not all available ideas.
- **Dependency:** tasks 3–6 complete enough to know free capacity.
- **Exact deliverable:** one-page decision comparing `T2424-0027 real encoder`, `Darcy learned/OOD`, and `NPMS learned/OOD` on information gain, dangerous baseline, cost, closure probability and negative-result value.
- **Evidence requirement:** project-specific existing evidence and explicit kill criteria.
- **Verification:** selected project has a frozen protocol before compute; rejected two remain queued/archived without duplicate tasks.
- **Success:** one winner, two explicit non-selected states.
- **Failure:** none has sufficient information gain → leave experiment slot empty.
- **Estimated compute:** NONE for selection.
- **Canonical destination:** `NEXT_TASK_QUEUE`/portfolio decision ledger.

## 10 — P1 — Package external validation for completed internal gates

- **Project:** LAM-JEPA, NeuroCAD, Research Atlas, VertexED as eligible
- **Objective:** convert internally complete claims into bounded outside tests.
- **Dependency:** relevant internal provenance/protocol tasks complete.
- **Exact deliverable:** immutable artifact bundle + one precise validator request per eligible claim from `EXTERNAL_VALIDATION_QUEUE.md`.
- **Evidence requirement:** version/hash of sent bundle, requested action, returned evidence when available.
- **Verification:** pending outreach remains `BLOCKED_EXTERNAL`; no GREEN on send.
- **Success:** independent result received and recorded with success/failure interpretation.
- **Failure:** disagreement or non-reproduction narrows/blocks claim; it is not hidden.
- **Estimated compute:** LOW internal; external work variable.
- **Canonical destination:** `EXTERNAL_VALIDATION_QUEUE.md` plus project evidence package.

## Dispatch stop rule

Do not create task 11 until at least one of tasks 1–10 has materially closed, falsified, or unblocked a project. Queue growth itself is not progress.
