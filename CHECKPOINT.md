# CHECKPOINT — AUGUST 15 04:00 IST

**Recovery wave started:** 2026-08-14 22:02 IST  
**Current checkpoint:** 2026-08-15 04:00 IST  
**Target checkpoint:** 2026-08-15 10:00 IST  
**Canonical status:** `MASTER_STATUS.md`  
**Canonical research:** `RESEARCH_STATUS.md`  
**Canonical product:** `PRODUCT_STATUS.md`  
**Canonical security:** `SECURITY_STATUS.md`  
**Canonical queue:** `NEXT_TASK_QUEUE.md` / `NEXT_TASK_QUEUE.json`  
**Machine-readable start snapshot:** `START_SNAPSHOT.json`

This is the current checkpoint surface. Historical dated checkpoints and prior closeouts remain provenance. Only directly verified material deltas are recorded.

## Verified current state

| Area | Current state | Evidence / next gate |
|---|---|---|
| Control plane | **VERIFIED source** | fresh recovery read `vertex-studyAI/vertexED.ai/main=e095cea8eac3c4cf4c4d3e81c24d8b457961d64f`; latest pre-checkpoint delta `e095cea8eac3c4cf4c4d3e81c24d8b457961d64f` closes only the standalone IRIS metric-freeze file-identity edge |
| LAM-JEPA | **VERIFIED reproducible NEGATIVE internally; external PENDING** | fresh `LAM-JEPA/main=bf8311e1a4d240e2891e51af38eaf7754944e300`; zero open PRs; immutable external-review packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no new result, no outside validation, locked ARC test untouched |
| Percy live host | **UNKNOWN / BLOCKED_EXTERNAL_MAC** | no directly accessible SQLite/WAL/checkpoint/process/worktree evidence; DB integrity, workers, leases, heartbeats and live task counts remain UNKNOWN |
| Project 2424 umbrella | **PARTIAL / SOURCE-GATED** | checksum-verified historical Wave-001 base remains 2,424 registry rows, 24 source-backed packages, 0 independent reproductions; current source-identity invariant binds 23 observed T2424 directories. Later dirty overlay/cross-generation migration provenance remains blocked; never synthesize missing identities |
| VertexED source | **VERIFIED** | current source available; source status does not prove served production revision |
| VertexED production | **BLOCKED — EXACT SERVED REVISION / AUTHENTICATED JOURNEY** | no new production-certification evidence closes the existing gate. Exact served revision + deployment ID + monitor PASS + disposable authenticated persistence/isolation/recovery/logout/admin journey remain required |
| VertexED Supabase | **PARTIAL security evidence / ACTIVE_HEALTHY** | fresh connected read: project `xwlrzgfuhfbckgvcmyoq` remains `ACTIVE_HEALTHY`, PostgreSQL `17.4.1.074`; read-only catalog query again confirms 26/26 observed `public` base tables have RLS enabled. Security advisor still reports exactly two WARNs: leaked-password protection disabled and hosted PostgreSQL security patches available. No mutation performed |
| FinanceMeta | **PARTIAL SOURCE / PRODUCTION BLOCKED_EXTERNAL** | retained hardening head `6dcc03710bb6adf9b4b722b308c40a0720bea61f` remains preserved; no new writable integration or production Supabase evidence recovered this checkpoint |
| The Bu1LD | **SOURCE/CI VERIFIED; DEPLOYMENT/DB BLOCKED_EXTERNAL** | no new owner secret/live Supabase evidence recovered this checkpoint |
| IRIS | **METRIC FREEZE RECOVERED / FRONTIER STILL PROTOCOL_BLOCKED** | canonical metric-freeze specification directly recovered at `portfolio/research/IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`, blob `6f4d6a47e3727596b21714bc269cd8ba5844d2fa`. Frozen definitions: `TWMSE25` window `W=25`; recovery = first five consecutive samples within `0.10*D`; `POST_MSE50PLUS` begins `t0+50`. This closes the standalone metric-spec identity edge only. Exact canonical development trajectory arrays and executable metric-equivalence/cross-hash provenance remain unrecovered. Seeds `1000–1029` forbidden; no approximate regeneration or frontier run |
| Darcy T2424-0050 | **v2 FROZEN / PRE-OUTCOME PARTIAL / NOT RUN** | B2 PCA+ridge + split remain frozen; B3 FNO, B4 DeepONet, interpretation approvals, environment, hardware, budgets and final manifests remain open. Training/outcome access remains unauthorized |
| NPMS | **VERIFIED controlled source / adverse non-uniqueness result** | preserved `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`; no rescue |
| NeuroCAD mechanism | **NEGATIVE / FALSIFIED** | validation-dominant diagnostic preserved |
| NGMT v0.1 | **NEGATIVE / FROZEN** | preserve; successor requires new version/protocol |
| Eigen-JEPA | **mixed/negative / FROZEN primary** | preserve primary result; no metric shopping |

## Open PR / CI truth

- Control repo has one open PR: **#395**, head `5920d61c16cda0ad022d6a5eb14ace6be5630d7b`.
- Exact-head GitHub Actions remain: `build-and-test=SUCCESS`, `browser-local-accessibility=SUCCESS`, `browser-production=SUCCESS`, `smoke-production=SKIPPED`.
- Vercel contexts remain **FAILURE** with build-rate-limit/upgrade gating URLs; no paid capacity action is authorized.
- PR #395 is now more stale relative to canonical main: compare `5920d61...` → `e095cea...` is **diverged**, with current main 7 commits ahead and PR head 2 commits on the other side of merge-base `01bd8e78d70950a8f9cf7b27aa16d2ccd24af1df`.
- Do not merge #395 as stale truth. Preserve it as provenance or cleanly replay only still-nonoverlapping release-facing evidence from fresh main if materially needed.

## Current counters

- Percy DB integrity: **UNKNOWN**
- physical workers: **UNKNOWN**
- live Percy tasks/queue/leases/heartbeats: **UNKNOWN**
- new major scientific outcome runs authorized: **0**
- scientific outcome runs triggered by this checkpoint: **0**
- database mutations triggered by this checkpoint: **0**
- deployments triggered by this checkpoint: **0**
- paid-resource actions: **0**
- frozen negative/mixed/falsified results rescued: **0**

## Highest-value next gates

1. `PERCY-STATE-001` — direct preserved-host recovery only; otherwise live state remains UNKNOWN.
2. `P2424-CANON-002` — later dirty overlay + cross-generation migration provenance; retain historical Wave-001 and current-directory layers separately.
3. `VERTEX-PROD-001` — exact served revision/deployment identity + monitor PASS + authenticated disposable-account golden journey; separately remediate current Supabase platform warnings with owner authorization.
4. FinanceMeta — owner-writable CI correction/review and real production Supabase/deploy target access.
5. The Bu1LD — owner deployment configuration/secrets + live Supabase/Auth access; then immutable deploy and seven-role certification.
6. `IRIS-FRONTIER-SOURCE-001` — recover exact canonical trajectory artifact or pre-existing authoritative deterministic-equivalence record, and cross-hash executable metric implementation against the now-recovered metric freeze. Until then remain `PROTOCOL_BLOCKED`.
7. Darcy v2 — close B3/B4 + interpretation/environment/hardware/budget/final-manifest locks only; **no training or ID/OOD outcome access**.
8. LAM — owner release metadata + genuinely independent outside reproduction/review only.
9. PR #395 — no stale merge; clean replay from current main only if its three evidence views remain genuinely missing.

## Checkpoint law

Later checkpoints report only direct evidence deltas. Source presence, CI, deployment status, database metadata, internal reproduction and project counts remain separate evidence classes. Missing host/source/runtime facts stay `UNKNOWN` or `BLOCKED`; they are never inferred green.
