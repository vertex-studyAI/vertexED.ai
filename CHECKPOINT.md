# CHECKPOINT — AUGUST 15 08:00 IST

**Recovery wave started:** 2026-08-14 22:02 IST  
**Current checkpoint:** 2026-08-15 08:00 IST  
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
| Control plane | **VERIFIED source** | fresh recovery observed `vertex-studyAI/vertexED.ai/main=f56e3ac765cc7f144643a203ec921de5a3caf6af`; this checkpoint then recorded fresh Bu1LD public-surface evidence on canonical main. Zero open PRs were observed before the checkpoint write |
| LAM-JEPA | **VERIFIED reproducible NEGATIVE internally; external PENDING** | fresh `LAM-JEPA/main=bf8311e1a4d240e2891e51af38eaf7754944e300`; immutable external-review packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no new scientific result or outside validation; locked ARC test untouched |
| Percy live host | **UNKNOWN / BLOCKED_EXTERNAL_MAC** | no directly accessible SQLite/WAL/checkpoint/process/worktree evidence; DB integrity, workers, leases, heartbeats and live task counts remain UNKNOWN |
| Project 2424 umbrella | **PARTIAL / SOURCE-GATED** | checksum-verified historical Wave-001 base remains 2,424 registry rows, 24 source-backed packages, 0 independent reproductions; current source-identity invariant binds 23 observed T2424 directories. Later dirty overlay/cross-generation migration provenance remains blocked; never synthesize missing identities |
| VertexED production | **BLOCKED — EXACT SERVED REVISION / AUTHENTICATED JOURNEY** | latest recovered scheduled monitor `31857629185` on `main@425375f10e0880a8882d3298edab4c90734af8a5` failed after public smoke passed because `/api/health` omitted immutable revision. Artifact `9239532686`, SHA-256 `de8798d79307a61630f8f099ff8d96414dd8a214a1827ea6a463de600679a215`. Exact served revision/deployment ID + monitor PASS + authenticated disposable-account journey remain required |
| VertexED Supabase | **PARTIAL security evidence / ACTIVE_HEALTHY** | retained fresh read-only evidence: 26 observed public base tables, 26 RLS-enabled, 0 RLS-disabled; two platform WARNs remain—leaked-password protection disabled and hosted PostgreSQL security patches available. No mutation performed |
| FinanceMeta | **PARTIAL SOURCE / PRODUCTION BLOCKED_EXTERNAL** | retained hardening head `6dcc03710bb6adf9b4b722b308c40a0720bea61f` remains 41 ahead / 0 behind `main@fbdd503223edc5b1780509720391083f485a4a85`; exact-head Actions red; integration write blocked; production Supabase unavailable |
| The Bu1LD source | **VERIFIED source/CI** | canonical `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; exact-head CI `29679123068` remains successful; phase33 source chain retained |
| The Bu1LD public production surface | **PARTIAL — PUBLIC ROUTES VERIFIED / IDENTITY+AUTH BLOCKED** | scheduled run `31857746101` succeeded; job `94945553076` passed smoke syntax + route availability. Artifact `9239560598`, SHA-256 `6e1d265586f64f044b85150d7f1d6418557c422a56c231d0e5d09c1a951e4036`, records 8/8 HTTP 200 checks at `https://thebu1ld.com` for `/`, `/signup`, `/login`, `/projects`, `/programs-public`, `/evidence`, `/privacy`, `/terms`. This proves availability only; exact served revision, live Supabase phase33, Auth, role isolation and seven-role behavior remain unverified |
| IRIS | **METRIC FREEZE RECOVERED / FRONTIER STILL PROTOCOL_BLOCKED** | frozen adaptation-metric specification remains recovered; exact canonical development trajectories and executable metric-equivalence/cross-hash provenance remain unrecovered. Seeds `1000–1029` forbidden; no frontier run |
| Darcy T2424-0050 | **v2 FROZEN / PRE-OUTCOME PARTIAL / NOT RUN** | B2 PCA+ridge + split remain frozen; B3 FNO, B4 DeepONet, interpretation approvals, environment, hardware, budgets and final manifests remain open. Training/outcome access remains unauthorized |
| NPMS | **VERIFIED controlled source / adverse non-uniqueness result** | `PARAMETER_CONFOUNDED_OR_NON_UNIQUE` preserved; no rescue |
| NeuroCAD / NGMT v0.1 / Eigen-JEPA | **negative/mixed/falsified boundaries preserved** | no in-place rescue or metric shopping |

## Current counters

- Percy DB integrity: **UNKNOWN**
- physical workers: **UNKNOWN**
- live Percy tasks/queue/leases/heartbeats: **UNKNOWN**
- Project 2424 registry rows recovered historically: **2,424**
- historical source-backed Wave-001 packages: **24**
- historical independent reproductions: **0**
- current represented T2424 source directories: **23**
- VertexED public base tables measured: **26**
- VertexED public base tables with RLS: **26**
- Bu1LD public routes in latest retained smoke: **8/8 PASS**
- new major scientific outcome runs authorized: **0**
- scientific outcome runs triggered by this checkpoint: **0**
- database mutations triggered by this checkpoint: **0**
- deployments triggered by this checkpoint: **0**
- paid-resource actions: **0**
- frozen negative/mixed/falsified results rescued: **0**

## Highest-value next gates

1. `PERCY-STATE-001` — direct preserved-host recovery only; otherwise live state remains UNKNOWN.
2. `P2424-CANON-002` — later dirty overlay + cross-generation migration provenance.
3. `VERTEX-PROD-001` — exact served revision/deployment identity + monitor PASS + authenticated disposable-account golden journey.
4. FinanceMeta — owner-writable CI correction/review and real production Supabase/deploy target access.
5. The Bu1LD — recover exact Cloudflare served revision/deployment identity; connect real Supabase/Auth; verify live phase33/RLS/functions/grants and seven-role journey. Public HTTP 200 is not certification.
6. `IRIS-FRONTIER-SOURCE-001` — exact canonical trajectories + executable metric cross-hash; remain `PROTOCOL_BLOCKED` until closed.
7. Darcy v2 — close B3/B4 + interpretation/environment/hardware/budget/final-manifest locks only; **no training or ID/OOD outcome access**.
8. LAM — owner release metadata + genuinely independent outside reproduction/review only.

## Checkpoint law

Later checkpoints report only direct evidence deltas. Source presence, CI, public HTTP availability, deployment identity, database metadata, authentication, internal reproduction and project counts remain separate evidence classes. Missing host/source/runtime facts stay `UNKNOWN` or `BLOCKED`; they are never inferred green.
