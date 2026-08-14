# CHECKPOINT — AUGUST 15 02:00 IST

**Recovery wave started:** 2026-08-14 22:02 IST  
**Current checkpoint:** 2026-08-15 02:00 IST  
**Target checkpoint:** 2026-08-15 10:00 IST  
**Canonical status:** `MASTER_STATUS.md`  
**Canonical research:** `RESEARCH_STATUS.md`  
**Canonical product:** `PRODUCT_STATUS.md`  
**Canonical security:** `SECURITY_STATUS.md`  
**Canonical queue:** `NEXT_TASK_QUEUE.md`  
**Machine-readable start snapshot:** `START_SNAPSHOT.json`

This file is the current checkpoint surface. Historical dated checkpoints and prior closeouts remain provenance, not live state. This update records verified deltas only and creates no new truth source.

## Verified current state

| Area | Current state | Evidence / next gate |
|---|---|---|
| Control plane | **VERIFIED source** | `vertex-studyAI/vertexED.ai` current `main=1718963db6c67ddd3a8e31cbad23fac0d4e29747`; latest delta narrows IRIS provenance only |
| LAM-JEPA | **VERIFIED reproducible NEGATIVE internally; external PENDING** | latest recovered `LAM-JEPA/main=bf8311e1a4d240e2891e51af38eaf7754944e300`; no open PRs recovered; immutable external-review packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no new scientific result, no outside validation, locked ARC test remains untouched |
| Percy live host | **UNKNOWN / BLOCKED_EXTERNAL_MAC** | no directly accessible SQLite/WAL/checkpoint/process/worktree evidence; DB integrity, workers, leases, heartbeats and live task counts remain UNKNOWN; `PERCY-STATE-001` non-destructive recovery first |
| Project 2424 umbrella | **PARTIAL / SOURCE-GATED** | checksum-verified historical Wave-001 recovery landed; historical registry contained 2,424 rows but only 24 source-backed Wave-001 packages and zero independent reproductions; current source-identity invariant binds the 23 observed current T2424 directories without converting directory presence to research completion. Later dirty overlay/cross-generation migration provenance remains blocked; never synthesize missing source-backed identities |
| VertexED source | **VERIFIED** | current source available; current main has successful Vercel status contexts, but status success is not served-revision proof |
| VertexED production | **BLOCKED — EXACT SERVED REVISION / AUTHENTICATED JOURNEY** | latest canonical scheduled monitor `31827246777` failed all three bounded attempts because `/api/health` remained healthy but omitted immutable revision. Public/error/auth-denial smoke boundaries passed. Exact served revision + deployment ID + monitor PASS + disposable authenticated persistence/isolation/recovery/logout/admin journey remain required |
| VertexED Supabase | **PARTIAL security evidence / ACTIVE_HEALTHY** | connected project `xwlrzgfuhfbckgvcmyoq` is ACTIVE_HEALTHY on PostgreSQL `17.4.1.074`. Fresh read-only catalog query confirms all 26 observed `public` base tables are RLS-enabled. Security advisor currently reports exactly two WARN findings: leaked-password protection disabled and hosted PostgreSQL security patches available. No database mutation performed |
| FinanceMeta source | **PARTIAL / exact hardening head preserved / CI definition blocker narrowed** | `main=fbdd503223edc5b1780509720391083f485a4a85`; retained hardening `6dcc03710bb6adf9b4b722b308c40a0720bea61f` remains 41 ahead / 0 behind. Exact-head Actions run `29641469740` is failure with zero jobs; source inspection identifies duplicate `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL` entries in the Playwright env mapping as the concrete workflow-definition defect candidate. Fresh integration writes remain 403 |
| FinanceMeta production | **BLOCKED_EXTERNAL** | production Supabase not connected; exact hardening SHA has Preview-only Vercel evidence, not production. Owner-writable path must repair/validate exact-head CI before review/merge; live target then needs migration/RLS/revision/isolation/recovery/admin certification |
| The Bu1LD source | **VERIFIED / exact-head CI GREEN** | canonical source `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; CI run `29679123068` succeeded; current source/verification chain reaches phase33 |
| The Bu1LD deployment/DB | **BLOCKED_EXTERNAL** | deploy run `29679123047` failed before deployment because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were empty; connected Supabase exposes VertexED only. Owner platform-secret/config + live DB/Auth access required before immutable deploy and seven-role certification |
| IRIS | **PARTIALLY RECOVERED / PROTOCOL BLOCKED** | recovery `d92e06deaa893bfb8273f3f781105ecb155e8aca` closed substantial source/config/environment lineage. Fresh library evidence re-found authoritative-candidate bundle checksum `41a8e117b6922c3a6641bd12608d5e4246d305a9c3776a62252869045d83dacf`, but exact frozen adaptation-metric implementation and exact canonical development trajectory artifact remain unrecovered. Seeds `1000–1029` forbidden; no approximate regeneration |
| Darcy T2424-0050 | **v2 FROZEN / PRE-OUTCOME PARTIAL / NOT RUN** | B2 PCA+ridge pre-outcome baseline merged `86170b1a6bb8fbc1484f99fd680876c271fb5474`; B2 blob `6e10c6fbecf0cf5ce78ed2b5c61e3fa97da47541`; workflow `31822727505`; split-manifest SHA-256 `4211d11da7d40f0991bd963c04fb118f34d9fe923e7664da301122b29b0bef85`; safety freeze `daf548fa9b3953c3d7e188191588a84a04c98093`. B3 FNO, B4 DeepONet, two interpretation approvals, environment, hardware, budgets and final manifest hashes remain open; training/outcome access unauthorized |
| NPMS | **VERIFIED controlled source / adverse non-uniqueness result** | source recovery/replay closed. Controlled NPMS `92.86%` vs invariant-parameter `89.29%`; gap `3.57` pp is below frozen 5-pp uniqueness gate => `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`. Preserve result; next science requires a new frozen natural/causal protocol with invariant-parameter + state-space/spectral controls |
| NeuroCAD mechanism | **NEGATIVE / FALSIFIED** | validation-dominant diagnostic preserved; no typed-parser rescue |
| NGMT v0.1 | **NEGATIVE / FROZEN** | preserve; successor requires new version/protocol |
| Eigen-JEPA | **mixed/negative / FROZEN primary** | preserve primary result; no metric shopping |

## Open PR / CI truth

- Control repo open PR: **#395**, `portfolio: synchronize release-facing evidence files`, head `5920d61c16cda0ad022d6a5eb14ace6be5630d7b`.
- PR #395 GitHub Actions on exact head: `build-and-test=SUCCESS`, `browser-local-accessibility=SUCCESS`, `browser-production=SUCCESS`, `smoke-production=SKIPPED`.
- PR #395 Vercel status contexts are **FAILURE** due platform build-rate-limit/upgrade gating, not a source-test failure. No paid capacity is authorized.
- PR #395 is now **diverged** from current main: merge-base `01bd8e78d70950a8f9cf7b27aa16d2ccd24af1df`; current main is 3 commits ahead while PR head carries 2 branch commits. Do not merge stale truth blindly; rebase/recreate only the still-nonoverlapping evidence views if they remain materially needed.

## Current counters

- Percy DB integrity: **UNKNOWN**
- physical workers: **UNKNOWN**
- live Percy tasks/queue/leases/heartbeats: **UNKNOWN**
- logical agent address space: **declared only; not an execution count**
- new major scientific outcome runs authorized: **0**
- scientific outcome runs triggered by this checkpoint: **0**
- database mutations triggered by this checkpoint: **0**
- deployments triggered by this checkpoint: **0**
- paid-resource actions: **0**
- frozen negative/mixed/falsified results rescued: **0**

## Highest-value next gates

1. `PERCY-STATE-001` — recover real host DB/WAL/checkpoint/worktree truth non-destructively; otherwise remain UNKNOWN.
2. `P2424-CANON-001` — recover later dirty overlay + cross-generation identity-migration provenance; retain Wave-001 and current-directory evidence as bounded layers only.
3. `VERTEX-PROD-001` — exact served revision/deployment identity, monitor PASS, authenticated disposable-account golden journey; separately owner-remediate the two current Supabase platform warnings without weakening auth/RLS.
4. FinanceMeta — owner-writable path removes only the duplicate Playwright env-key trio, validates workflow syntax, then exact-head audit/lint/typecheck/unit/build/release/Playwright jobs must execute and pass before review/merge. Production remains a separate target-access gate.
5. The Bu1LD — owner supplies required public deployment configuration + Cloudflare credentials through platform secrets; connect live Supabase/Auth and certify phase33 before seven-role production journey.
6. `IRIS-FRONTIER-SOURCE-001` — materialize/verify the authoritative candidate bundle and recover/hash exact adaptation-metric implementation + canonical trajectories; otherwise `PROTOCOL_BLOCKED`.
7. Darcy v2 — close only B3/B4 + interpretation/environment/hardware/budget/final-manifest pre-outcome locks; **no training or ID/OOD outcome access**.
8. NPMS — if continued, freeze a genuinely new successor protocol; do not rescue the parameter-confounded predecessor.
9. LAM — owner release metadata + genuinely independent outside reproduction/review only.
10. PR #395 — preserve as provenance unless its three release-facing views are cleanly replayed from current main with exact-head checks; no stale merge.

## Checkpoint law

Later checkpoints report only direct evidence deltas. Source presence, CI, Vercel status, database metadata, internal reproduction and project counts remain separate evidence classes. Missing host/source/runtime facts stay `UNKNOWN` or `BLOCKED`; they are never inferred to green.
