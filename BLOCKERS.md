# BLOCKERS

As of: 2026-08-12 20:40 IST

Only blockers that still prevent a stronger evidence claim are listed.

## P0 — VertexED exact production revision / release proof

- **Observed:** public product and live Supabase traffic exist, but latest source lineage is not proven to be the exact production revision served.
- **Evidence gap:** the repository exposes a revision-bearing `/api/health` implementation, but the execution sandbox cannot resolve the public domain for a direct health probe. Latest-main Vercel checks currently return build-rate-limit failures on both linked projects.
- **Resolution:** restore deployment capacity, deploy one intended canonical target, query `/api/health?readiness=true`, compare returned revision to intended SHA, then run authenticated golden-journey flows.

## P0 — VertexED auth/database maintenance warnings

- **Observed:** Supabase security advisor warns that leaked-password protection is disabled and that the current Postgres build has security patches available.
- **What was verified:** all 26 public tables have RLS; 31 policies were inspected; no public policy uses user-editable metadata or deprecated `auth.role()`; owned UPDATE paths have ownership `USING` + `WITH CHECK`; sensitive waitlist tables deny direct client access.
- **Resolution:** enable leaked-password protection; perform planned Supabase database upgrade; rerun security advisor and regression/golden-journey tests.

## P0 — FinanceMeta canonical target access

- **Observed:** current GitHub installation exposes only three `vertex-studyAI` repositories and connected Supabase exposes only the VertexED project.
- **Impact:** FinanceMeta recovery overlay and truth-first content scripts cannot be applied to the real repo/live DB from this session.
- **Resolution:** authorize the canonical FinanceMeta GitHub repository and Supabase project; apply exact-SHA recovery on an isolated branch; run target-native CI and real authorization denial-path tests.

## P0 — Bu1LD canonical target access

- **Observed:** Bu1LD canonical target is not exposed by current GitHub installation.
- **Impact:** integrated proof-density/people/content recovery scripts remain control-repo artifacts only.
- **Resolution:** authorize the canonical repository; apply exact-SHA recovery on isolated branch; run build, accessibility, hydration/navigation and public-claims verification.

## P0 — Percy production qualification

- **Observed:** durable orchestration baseline and state doctor are repository-tested.
- **Missing evidence:** real Mac crash/restart while tasks are queued/in-flight; provider adapters/failure modes; lease expiry under real concurrency; resource contention; long soak; launch-service integration.
- **Resolution:** execute a retained-evidence real-host failure matrix with 1–4 workers and actual provider calls.

## P1 — Olympus/Hercules learned architecture gate

- **Observed:** naming/roadmap rationalization is evidence-backed at O0 only; no model name is treated as a trained scale claim.
- **Missing evidence:** same-budget learned baseline comparison.
- **Resolution:** freeze dataset, tokenizer, parameter budget, optimizer, training budget and evaluation suite; run Transformer vs proposed architecture vs ablation; record loss, convergence, memory, throughput, downstream score, instability and cost.

## P1 — Scientific external/generalization gates

- **T2424-0025:** 0% control also favors robust estimators; mechanism not isolated.
- **T2424-0050:** synthetic screen is not a learned neural operator.
- **NeuroCAD:** controlled language/compiler benchmark is not arbitrary NLP-to-CAD.
- **T2424-0027:** injected-coordinate synthetic audit is not a real multilingual representation result.
- **T2424-0024:** calibration fixture is not real-model trustworthiness evidence.
- **T2424-0040:** prerequisite-ordering mechanics are not learner benefit.
- **T2424-1768:** caller-supplied contracts are not formal verification or MoE safety.
- **Research Atlas:** local reruns are not independent replication or peer review.
- **Resolution:** promote only after project-specific frozen external/real-model baselines and independent reproduction where appropriate.

## P2 — Deployment capacity / preview noise

- **Observed:** latest-main status checks on both linked Vercel projects report `upgradeToPro=build-rate-limit`.
- **Impact:** preview/deployment statuses cannot currently certify the newest source lineage.
- **Resolution:** wait for/reset quota or use the intended authorized deployment capacity; avoid wasteful preview-triggering docs-only branches.