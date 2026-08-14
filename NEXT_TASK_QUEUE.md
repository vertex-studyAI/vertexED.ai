# NEXT TASK QUEUE

**Rescored:** 2026-08-14 convergence re-verification  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard; do not materialize duplicate work.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state.
- Verify independently against preserved snapshots.
- Failure: remain blocked; never create a replacement DB to make counters look clean.

## 2 — P2424-CANON-001 — P0 / BLOCKED_EXTERNAL_SOURCE
- Re-establish the preserved canonical Project 2424 source/overlay and reconcile count/status contradictions.
- Deliver: verified HEAD/ancestry, dirty-overlay manifest/hashes, smallest authorized baseline rerun, canonical child map.
- Do not fabricate a 2,424-ID map from partial registries.

## 3 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Existing production evidence shows healthy public/security smoke boundaries while `/api/health` omits immutable revision identity.
- Deliver: intended/served source identity, deployment ID, revision proof, production monitor PASS, disposable-account core workflow + cleanup record.
- Do not add product features to work around deployment identity uncertainty.

## 4 — FINMETA-RECOVERY-002 — P0 PRODUCT / PARTIAL_MUTATION_BLOCKED
- Preserve and qualify the existing 41-commit security branch; do not force-move `main`.
- Historical merge commit: `f18d0f008351a86accbc5ca2fa6ebbec05e57906`; current main: `fbdd503223edc5b1780509720391083f485a4a85`.
- First fix/triage the exact-head lint failures (conditional hooks, empty interfaces, explicit `any`/dependency warning) on an isolated reviewable branch.
- Connected mutation attempts currently return 403, so owner/integration permission is a hard recovery boundary.
- Production Supabase/golden journey remain separate and blocked.

## 5 — BUILD-DEPLOY-001 — P0 PRODUCT / BLOCKED_DEPLOYMENT_VERIFICATION
- Current Bu1LD `main` `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` has exact-main CI PASS.
- Cloudflare workflow failed in verification because `release:check` exited 1; deploy was skipped.
- Deliver: exact failing release-check diagnosis/fix, successful exact-SHA deployment verification, immutable served revision, then required role journeys.
- Do not call repository readiness production deployment.

## 6 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 7 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Obtain genuinely independent reproduction + skeptical review, not endorsement.
- External validation stays **RED/PENDING** until returned outside evidence exists.

## 8 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- Recover/hash the exact development trajectories, retained implementations/parameters and metric code required by the frozen protocol.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 9 — DARCY-EXEC-002 — P1 / FROZEN_WAITING_SOURCE_AUTHORIZATION
- **Freeze is complete** at control commit `6fbd9c4b...`; do not create another protocol.
- Recover/confirm canonical Darcy source and explicit execution authorization.
- If authorized, run only the exact frozen matched learned-operator/OOD protocol and preserve all outcomes including failure.
- No parameter or acceptance-gate changes are permitted in place.

## 10 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Deliver canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict.

## 11 — VERTEX-SECURITY-HUMAN-001 — P1 PRODUCT / OWNER_ADMIN_ACTION
- Connected Supabase read-only audit found RLS enabled on all inspected `public` tables and no anon/authenticated EXECUTE grant on the two public `SECURITY DEFINER` functions.
- Owner/admin must review and, if approved, enable leaked-password protection and apply available Postgres security maintenance through the production administration surface.
- Re-run Security Advisor after changes. Do not silently mutate production configuration from this portfolio branch.

## 12 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- Freeze one machine-readable cheap synthetic causal-future-latent experiment only when capacity is intentionally allocated.
- No run currently authorized; no real-data expansion before synthetic gate.

## 13 — PORTFOLIO-RESCORE-004 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.

## Closed / corrected this run

- `DARCY-FREEZE-001` — **CLOSED:** protocol already frozen at `6fbd9c4b...`; queue corrected to exact frozen execution gate.
- Historical FinanceMeta “target repo unavailable” blocker — **NARROWED:** source is readable and preserved branch exists; mutation permission + failing exact-head CI + production runtime are the remaining blockers.
- Historical Bu1LD “target repo unavailable” blocker — **NARROWED:** source/current-main CI verified; deployment verification remains blocked.
- LAM paper/source/internal verification/external packet, IRIS protocol freeze, JEPA-TS programme definition and NeuroCAD component falsifier remain closed as previously recorded.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are source or live-state recovery first; Darcy is frozen but awaiting exact source + authorization; JEPA×time-series is dormant; NeuroCAD research remains deprioritized; LAM is owner metadata + external review only. Product work is deployment/security/recovery qualification, not feature expansion.
