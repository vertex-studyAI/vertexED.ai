# NEXT TASK QUEUE

**Rescored:** 2026-08-14 22:03 IST after live production-monitor recheck, Darcy v2 protocol reconciliation, and FinanceMeta/Bu1LD source recovery  
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
- Latest checked scheduled production-health run `31817794439` (2026-08-14 21:37 IST) failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries passed.
- The monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a` using the same runtime-revision contract as the Vercel ignored-build guard.
- Source-side revision stamping is already present. Current head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` reports Vercel build-rate-limit failures on both linked Vercel status contexts. Do not churn source or purchase capacity to bypass this.
- Deliver: canonical Vercel project/deployment identity, successful deploy of intended runtime revision, `/api/health` revision proof, monitor PASS, disposable-account core workflow + cleanup record.

## 4 — FINMETA-HARDEN-001 — P0 PRODUCT / PARTIAL_SOURCE_RECOVERED
- Canonical repo is accessible: `build-the-future-11/finance4all-global-reach`.
- `main`=`fbdd503223edc5b1780509720391083f485a4a85`; security branch `cursor/membership-security-supabase-fix`=`6dcc03710bb6adf9b4b722b308c40a0720bea61f`, **41 commits ahead / 0 behind** main; head Vercel status succeeds.
- Retained security review records RLS ownership force-assignment, pinned `SECURITY DEFINER` search paths, notification-write restriction, hardened authenticated analytics RPC, env validation and no client service-role key.
- Residual source gate: add/runtime-verify cross-user denial tests for `lab_applications` and `opportunity_interests`; independently review the 41-commit diff/CI rather than trusting commit prose.
- External gate: migration 021 and production env values require owner Supabase/deploy access.
- This run attempted to open a draft PR but GitHub integration returned HTTP 403. Preserve branch; do not copy/force-push around the permission boundary.
- Deliver: owner/integration-authorized review lane, green CI, denial-path evidence, then live migration/deployment/golden-journey verification.

## 5 — BU1LD-PROD-001 — P0 PRODUCT / PARTIAL_SOURCE_RECOVERED
- Canonical repo is accessible: `ryangomez010/bu1ld-landing`, `main`=`daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.
- Source security review records guarded role mutation, RLS/RPC policies, phase32 self-review prevention, published/verified public-read boundaries, same-origin/rate-limited server APIs, upload validation and security headers.
- Its own review explicitly says live RLS/storage/OAuth/service-role/object-level authorization are not yet proven.
- External blocker record requires phase32 schema credentials, Supabase auth-provider/domain configuration, role-separated visitor/member/lead/reviewer/admin accounts and Cloudflare deployment access.
- Do not merge unrelated major Dependabot upgrades while release qualification is open unless separately verified.
- Deliver: exact deployed revision + schema verification + auth smoke + seven/role-equivalent acceptance matrix + account isolation/recovery/logout/admin-denial evidence.

## 6 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 7 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send that exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- External validation stays **RED/PENDING** until returned outside evidence exists.

## 8 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is frozen and canonical.
- Recover/hash exact development trajectories, retained implementations/parameters and metric code required by the protocol.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain quarantined.

## 9 — DARCY-V2-PREP-002 — P1 / WAITING_IMPLEMENTATION_FREEZE
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is already **CLOSED AS A PROTOCOL FREEZE** in commit `6fbd9c4ba73a460f5abbe6a6f4c478b6bc50e389`; no v2 outcome has been run.
- Before any execution, freeze/hash exact generator/reference solver, split manifest, M1/A1/A2/B1/B2 implementations, FNO/DeepONet implementations, parameter budgets, optimizer/LR grid, normalization, seeds, eligibility tests, hardware identity and compute/time cap.
- No ID-test or OOD result may be inspected before these artifacts are immutable.
- If competent learned baselines cannot be made eligible inside frozen resource budget, report protocol blocked; do not weaken eligibility.

## 10 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive as bounded recovered evidence rather than inventing replacement implementation.

## 11 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, strong baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless synthetic gate survives. No run is currently authorized.

## 12 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY**.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY:** raw artifact digests/numbers/assets independently verified; record `725ae2fb17de9c988938d4b03bd8a6be456b8e8b`.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY:** packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no outside result yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** protocol frozen; execution source-blocked.
- `DARCY-FREEZE-001` — **CLOSED PROTOCOL FREEZE ONLY:** `6fbd9c4ba73a460f5abbe6a6f4c478b6bc50e389`; experiment not run.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** `VALIDATION_DOMINANT`.
- FinanceMeta repository/source recovery — **CLOSED AS RECOVERY ONLY:** exact main/hardening branch recovered; production and merge qualification remain open.
- Bu1LD repository/source recovery — **CLOSED AS RECOVERY ONLY:** exact main/local-release evidence recovered; production remains external-runtime blocked.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are source or live-state recovery first; Darcy v2 is protocol-frozen but implementation/data/training artifacts are not yet frozen; JEPA×time-series is dormant design; NeuroCAD research is deprioritized after its mechanism falsifier; LAM is owner metadata + external review only. Product effort is concentrated on VertexED deployment identity, FinanceMeta hardening/live Supabase verification and Bu1LD live auth/role/deployment qualification. Unused compute capacity should remain unused rather than generate low-information experiments.