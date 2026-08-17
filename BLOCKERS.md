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

## P0 PRODUCT — FinanceMeta source review / branch state / CI admission
Repository `build-the-future-11/finance4all-global-reach` has a nontrivial history divergence that must not be papered over. PR #1 was recorded as merged on 2026-07-10 with merge commit `f18d0f008351a86accbc5ca2fa6ebbec05e57906`, yet current `main` still resolves to the PR's pre-merge base `fbdd503223edc5b1780509720391083f485a4a85`. The surviving hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 commits ahead / 0 behind current main. Its latest GitHub Actions run `29641469740` failed before creating any jobs. Inspection of `.github/workflows/ci.yml` found duplicate `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` keys inside the same `test:e2e` `env:` mapping, which is a workflow-admission defect; the minimal repair is to remove the second duplicate trio. This integration receives `403 Resource not accessible by integration` for both new-ref creation and file-content writes in this repository, so the repair is identified but **not landed**. Owner-authorized write access must first fix the workflow on the preserved branch, obtain an exact-head CI run with real jobs, review the 41-commit diff, and only then decide how to restore the intended branch into main. Do not blindly recreate or re-merge commits until the post-merge main regression is understood.

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
