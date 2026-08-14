# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after latest bounded VertexED production-health verification, Darcy v2 protocol-freeze reconciliation, and FinanceMeta/Bu1LD source recovery  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state.
- Verify independently against the preserved snapshot.
- Failure: remain blocked; never create a replacement DB to make counters look clean.

## 2 — P2424-CANON-001 — P0 / BLOCKED_EXTERNAL_SOURCE
- Re-establish the preserved canonical Project 2424 source/overlay and reconcile count/status contradictions.
- Deliver: verified HEAD/ancestry, dirty-overlay manifest/hashes, smallest baseline rerun, canonical child map.
- Failure: block source-dependent new experiments; preserve bounded existing reproductions.

## 3 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest checked scheduled run `31817794439` failed all three bounded attempts because `/api/health` omitted revision identity while public/unauthenticated security smokes passed.
- Expected deploy-relevant revision: `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; both connected Vercel project statuses report deployment rate limiting.
- Do not purchase a paid upgrade or churn source to force deployment.
- Deliver when externally unblocked: exact intended/served source identity, deployment ID, health revision proof, monitor PASS, disposable-account core workflow + cleanup.

## 4 — FINMETA-HARDEN-001 — P0 PRODUCT / PARTIAL_SOURCE_RECOVERED
- Canonical repo is accessible: `build-the-future-11/finance4all-global-reach`.
- `main`=`fbdd503223edc5b1780509720391083f485a4a85`; `cursor/membership-security-supabase-fix`=`6dcc03710bb6adf9b4b722b308c40a0720bea61f`, **41 commits ahead / 0 behind** main; head Vercel status succeeds.
- Retained security review records RLS ownership force-assignment, pinned `SECURITY DEFINER` search paths, notification-write restriction, hardened authenticated analytics RPC, env validation and no client service-role key.
- Residual source gate: add/runtime-verify cross-user denial tests for `lab_applications` and `opportunity_interests`; independently review the 41-commit diff/CI rather than trusting commit prose.
- External gate: migration 021 and production env values require owner Supabase/deploy access.
- Draft PR creation from this run returned HTTP 403. Preserve branch; do not force-push/copy around the permission boundary.
- Deliver: authorized review lane, green CI/security review, denial-path evidence, then live migration/deployment/golden-journey verification.

## 5 — BU1LD-PROD-001 — P0 PRODUCT / PARTIAL_SOURCE_RECOVERED
- Canonical repo is accessible: `ryangomez010/bu1ld-landing`, `main`=`daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.
- Source security review records guarded role mutation, RLS/RPC policies, phase32 self-review prevention, public evidence boundaries, same-origin/rate-limited APIs, upload validation and security headers.
- Its own review explicitly says live RLS/storage/OAuth/service-role/object-level authorization are not yet proven.
- External blocker record requires phase32 schema credentials, Supabase auth-provider/domain configuration, role-separated visitor/member/lead/reviewer/admin accounts and Cloudflare deployment access.
- Do not merge unrelated major dependency bumps while release qualification is open unless separately verified.
- Deliver: exact deployed revision + schema verification + auth smoke + role-separated acceptance matrix + account isolation/recovery/logout/admin-denial evidence.

## 6 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 7 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable reproduction/review packet is on `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- External validation remains **RED/PENDING** until returned outside evidence exists.

## 8 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- Frozen baseline-frontier protocol exists.
- Recover/hash exact development trajectories, retained implementations/parameters and metric code.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 9 — DARCY-V2-MATERIALIZE-002 — P1 / READY_IMPLEMENTATION_NO_RUN
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is frozen and explicitly `EXPERIMENT NOT YET RUN`.
- Materialize/hash deterministic generator/reference solver, M1/A1/A2/B1/B2 systems, eligible FNO/DeepONet config grid, environment lock, split manifest, hardware/compute declaration and unit/eligibility tests.
- **Do not execute training, ID-test or OOD evaluation until every frozen prerequisite is committed.** Material protocol change requires a new version.

## 10 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover original NPMS source/config/checkpoint before new natural/OOD science.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive as bounded recovered evidence rather than invent replacement implementation.

## 11 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- Freeze one cheap machine-readable known-state synthetic experiment before any run.
- No real-data expansion unless synthetic gate survives. No run currently authorized.

## 12 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.

## Closed this wave

- `LAM-PAPER-001` — **CLOSED INTERNALLY**.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY**, verification record `725ae2fb17de9c988938d4b03bd8a6be456b8e8b`.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY**, no outside result yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED DESIGN**, execution source-blocked.
- `DARCY-FREEZE-001` — **CLOSED DESIGN ONLY**, no outcome run.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN**, no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED**, no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM**, `VALIDATION_DOMINANT`.
- FinanceMeta repository/source recovery — **CLOSED AS RECOVERY ONLY**; merge and production qualification remain open.
- Bu1LD repository/source recovery — **CLOSED AS RECOVERY ONLY**; production runtime qualification remains external-blocked.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are recovery first; Darcy v2 may advance through implementation/config/hash closure only, not outcome execution; JEPA×time-series is dormant; frozen negative lines stay frozen; LAM is owner metadata + external review only. Product effort is concentrated on VertexED deployment identity, FinanceMeta hardening/live Supabase verification and Bu1LD live auth/role/deployment qualification.