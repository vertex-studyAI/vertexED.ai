# BLOCKERS

**As of:** 2026-08-17 live evidence refresh. Only blockers that prevent a stronger evidence claim are listed.

## P0 — Percy authoritative live state
Live Mac SQLite/WAL/checkpoint/process/worktree state is unavailable. Preserve/hash DB+WAL+checkpoint, run integrity/schema checks, reconcile counters/leases/heartbeats/stale workers and dirty worktrees, then independently recount. Never reset or create a replacement DB.

## P0 — Project 2424 canonical source
Umbrella source/ancestry/dirty overlay remains external. Recover and hash preserved source before source-dependent new experiments or 2,424-ID disposition claims. Registry count is not completion.

## P0 PRODUCT — VertexED production deployment + identity/security journey
Current `main` is `e71da4a8341a2c236f6252b74d078e7464b681ab`. Production-health run `32043132504` passed the public root, unknown-route, logged-out auth/API, and untrusted-origin probes, but `/api/health` did not expose the expected immutable revision. Both Vercel deployments attached to this main SHA failed: `vertex-ed-ai` deployment `dpl_GkCr7NkrA6JW2KiN9ZJ1z6sAN3zz` and `vertex-ai` deployment `dpl_6ZDPzzrVYFB9hrRopAwaLYzLHkhJ`. Inspect the authenticated Vercel logs for both IDs, fix the deployment failure, redeploy the intended immutable SHA, and rerun the monitor. Only after exact served revision is proven should the disposable-account isolation/persistence/recovery/logout/admin-boundary journey be used for production certification. The monitor also hit a separate GitHub 503 while updating the incident; keep that as an observability/control-plane failure, not the deployment root cause. Do not weaken the revision assertion to make the monitor green.

## P0 — LAM owner release metadata + external validation
Scientific negative result and internal evidence package are closed. Remaining: owner-approved license/redistribution, author list/order, `CITATION.cff`, immutable release revision/tag, and genuinely independent reproduction/review of packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.

## P0 PRODUCT — FinanceMeta source review
Recovered `build-the-future-11/finance4all-global-reach`; `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 ahead / 0 behind recovered main. Fresh PR creation through this integration returns `403`. Owner-authorized path must review the existing branch and run exact-head CI/security gates. Do not recreate the commits.

## P0 PRODUCT — FinanceMeta production
Live Supabase migration/RLS/env/exact deployed revision and multi-account authorization journey are unavailable. Source readiness is not production certification.

## P0 PRODUCT — The Bu1LD production
Canonical source recovery is closed at `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`. Production Supabase/auth/domain/deployment and role-separated journeys remain external; certify exact revision, schema/migrations, hydration, RLS/role/object boundaries, seven-role journey and cleanup.

## P1 — IRIS exact residual provenance
Checksum-backed retained source/package lineage is recovered via `d92e06deaa893bfb8273f3f781105ecb155e8aca`. Remaining: exact canonical development trajectories and exact frozen adaptation-metric provenance, then cross-hash the six frontier systems/parameters and input manifest. Seeds `1000–1029` remain forbidden; approximate regeneration is prohibited.

## P1 — Darcy v2 pre-outcome safety/freeze
Protocol is frozen and no v2 outcome exists. Scaffold `4280156c94fdac3e92ff300e743e2f2899cd4869`; safety `daf548fa9b3953c3d7e188191588a84a04c98093` removes frozen-outcome peeking and records generator provenance. Before training, explicitly approve the periodic/circulant finite-grid covariance interpretation and current OOD-D global-offset choice, then freeze B2 PCA+ridge/B3 FNO/B4 DeepONet, exact environment, hardware, budgets and final split-manifest hash. Training/ID/OOD evaluation remain forbidden until all blockers are non-null and independently checked.

## P1 — NPMS source identity
Recover original source/config/checkpoint or record `SOURCE_UNRECOVERED`; preserve known negative cases and do not invent a replacement.

## Scheduling guard
Zero new major scientific experiment runs are authorized. Blocked work does not justify speculative substitute projects.
