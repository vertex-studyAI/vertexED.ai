# CHECKPOINT — AUGUST 15 06:00 IST

**Recovery wave started:** 2026-08-14 22:02 IST  
**Current checkpoint:** 2026-08-15 06:00 IST  
**Target checkpoint:** 2026-08-15 10:00 IST  
**Canonical status:** `MASTER_STATUS.md`  
**Canonical research:** `RESEARCH_STATUS.md`  
**Canonical product:** `PRODUCT_STATUS.md`  
**Canonical security:** `SECURITY_STATUS.md`  
**Canonical reproducibility:** `REPRODUCIBILITY_LEDGER.md`  
**Canonical release readiness:** `PUBLIC_RELEASE_READINESS.md`  
**Canonical queue:** `NEXT_TASK_QUEUE.md` / `NEXT_TASK_QUEUE.json`  
**Machine-readable start snapshot:** `START_SNAPSHOT.json`

This is the current checkpoint surface. Historical dated checkpoints and prior closeouts remain provenance. Only directly verified material deltas are recorded.

## Verified current state

| Area | Current state | Evidence / next gate |
|---|---|---|
| Control plane | **VERIFIED source** | fresh run began from `vertex-studyAI/vertexED.ai/main=43cd5c06947cccd7fc1f901989e981d934b97a20`; this checkpoint then replayed stale release-facing evidence onto current main and synchronized queue surfaces. Latest queue-machine commit before this checkpoint write is `262a03b3e1b728ce4c3ec6d6d5c53c2741598107` |
| LAM-JEPA | **VERIFIED reproducible NEGATIVE internally; external PENDING** | fresh `LAM-JEPA/main=bf8311e1a4d240e2891e51af38eaf7754944e300`; zero open PRs; immutable external-review packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no new result, no outside validation, locked ARC test untouched |
| Percy live host | **UNKNOWN / BLOCKED_EXTERNAL_MAC** | no directly accessible SQLite/WAL/checkpoint/process/worktree evidence; DB integrity, workers, leases, heartbeats and live task counts remain UNKNOWN |
| Project 2424 umbrella | **PARTIAL / SOURCE-GATED** | checksum-verified historical Wave-001 base remains 2,424 registry rows, 24 source-backed packages, 0 independent reproductions; current source-identity invariant binds 23 observed T2424 directories. Later dirty overlay/cross-generation migration provenance remains blocked; never synthesize missing identities |
| VertexED source | **VERIFIED** | current source available; source status does not prove served production revision |
| VertexED production | **BLOCKED — EXACT SERVED REVISION / AUTHENTICATED JOURNEY** | fresh scheduled monitor `31847625553` on control `cf8540437640702c1204bb747814755a952b8591` again failed all three bounded attempts. Canonical smoke step passed and evidence upload succeeded; final health gate failed because `/api/health` was healthy but omitted immutable revision and therefore could not match expected `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`. Artifact `9236446930`, SHA-256 `3b08ea6ec1c850b49fa6ac2e5b3af2208c639f4b56fb9269decf61197f4eac6b`. Exact served revision/deployment ID + monitor PASS + authenticated disposable-account journey remain required |
| VertexED Supabase | **PARTIAL security evidence / ACTIVE_HEALTHY** | fresh connected read: project `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY`, PostgreSQL `17.4.1.074`; read-only catalog query again confirms 26 public base tables, 26 RLS-enabled, 0 RLS-disabled. Security advisor still reports exactly two WARNs: leaked-password protection disabled and hosted PostgreSQL security patches available. No mutation performed |
| FinanceMeta | **PARTIAL SOURCE / PRODUCTION BLOCKED_EXTERNAL** | retained hardening head `6dcc03710bb6adf9b4b722b308c40a0720bea61f` remains 41 ahead / 0 behind `main@fbdd503223edc5b1780509720391083f485a4a85`; exact-head Actions red; integration write remains blocked; production Supabase unavailable |
| The Bu1LD | **SOURCE/CI VERIFIED; DEPLOYMENT/DB BLOCKED_EXTERNAL** | canonical source/CI evidence retained; owner deployment variables/Cloudflare credentials and live Supabase/Auth qualification remain external |
| IRIS | **METRIC FREEZE RECOVERED / FRONTIER STILL PROTOCOL_BLOCKED** | frozen adaptation-metric specification remains recovered at `portfolio/research/IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`, blob `6f4d6a47e3727596b21714bc269cd8ba5844d2fa`; exact canonical development trajectories and executable metric-equivalence/cross-hash provenance remain unrecovered. Seeds `1000–1029` forbidden; no approximate regeneration or frontier run |
| Darcy T2424-0050 | **v2 FROZEN / PRE-OUTCOME PARTIAL / NOT RUN** | B2 PCA+ridge + split remain frozen; B3 FNO, B4 DeepONet, interpretation approvals, environment, hardware, budgets and final manifests remain open. Training/outcome access remains unauthorized |
| NPMS | **VERIFIED controlled source / adverse non-uniqueness result** | preserved `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`; regime accuracy `0.9285714285714286` vs invariant-parameter `0.8928571428571429`, only `3.57pp` advantage inside frozen `5pp` band; no rescue |
| NeuroCAD mechanism | **NEGATIVE / FALSIFIED** | validation-dominant diagnostic preserved |
| NGMT v0.1 | **NEGATIVE / FROZEN** | preserve; successor requires new version/protocol |
| Eigen-JEPA | **mixed/negative / FROZEN primary** | preserve primary result; no metric shopping |

## Release/reproducibility cleanup

- Stale PR **#395** had only two remaining changed files: `PUBLIC_RELEASE_READINESS.md` and `REPRODUCIBILITY_LEDGER.md`.
- Rather than merge its diverged branch, both views were replayed from fresh canonical main with later evidence included:
  - `REPRODUCIBILITY_LEDGER.md` → `461b0ef9458c7e8bc1cf5292e4e91177c1b8bf3f`;
  - `PUBLIC_RELEASE_READINESS.md` → `e0932de4f9ba3d4a200052312683b7289e1040d5`.
- PR #395 is now **CLOSED UNMERGED / SUPERSEDED PROVENANCE**. No branch/run/evidence was deleted.
- Its exact-head historical GitHub checks remain evidence only: `build-and-test=SUCCESS`, `browser-local-accessibility=SUCCESS`, `browser-production=SUCCESS`, `smoke-production=SKIPPED`; Vercel contexts were failures on build-rate-limit/upgrade gating. No paid capacity action was taken.

## Current counters

- Percy DB integrity: **UNKNOWN**
- physical workers: **UNKNOWN**
- live Percy tasks/queue/leases/heartbeats: **UNKNOWN**
- Project 2424 registry rows recovered historically: **2,424**
- Project 2424 historical source-backed Wave-001 packages: **24**
- Project 2424 historical independent reproductions: **0**
- current represented T2424 source directories under identity guard: **23**
- VertexED public base tables measured: **26**
- VertexED public base tables with RLS: **26**
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
6. `IRIS-FRONTIER-SOURCE-001` — recover exact canonical trajectory artifact or pre-existing authoritative deterministic-equivalence record, and cross-hash executable metric implementation against the recovered metric freeze. Until then remain `PROTOCOL_BLOCKED`.
7. Darcy v2 — close B3/B4 + interpretation/environment/hardware/budget/final-manifest locks only; **no training or ID/OOD outcome access**.
8. LAM — owner release metadata + genuinely independent outside reproduction/review only.

## Checkpoint law

Later checkpoints report only direct evidence deltas. Source presence, CI, deployment status, database metadata, internal reproduction and project counts remain separate evidence classes. Missing host/source/runtime facts stay `UNKNOWN` or `BLOCKED`; they are never inferred green.
