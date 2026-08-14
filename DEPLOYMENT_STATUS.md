# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence run  
**Rule:** source/build evidence, database-control evidence, preview deployment, and exact production certification are separate states.

| System | Source/build evidence | Deployment/runtime evidence | Authoritative state | Next gate |
|---|---|---|---|---|
| VertexED | control/source repo is active and current; source-level gates are separate from production | production-health run `31817794439` observed healthy public surface but `/api/health` omitted immutable revision identity; expected deploy-relevant SHA `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; artifact `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`; homepage/router/logged-out/origin boundaries passed; Vercel deployment capacity has reported free-tier rate limiting | **BLOCKED — SERVED REVISION + AUTHENTICATED JOURNEY UNVERIFIED** | prove intended/served SHA and deployment ID, get monitor PASS, then disposable-account signup/auth/onboarding/core persistence/isolation/recovery/logout/admin-boundary journey; do not buy capacity or weaken revision assertion |
| FinanceMeta | `build-the-future-11/finance4all-global-reach`; recovered hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 commits ahead / 0 behind recovered main; connector branch-create probe returns `403 Resource not accessible by integration` | live production Supabase target and exact production revision are unavailable through current connector; source/preview evidence does not prove production RLS/auth isolation | **BLOCKED_EXTERNAL — OWNER WRITE PATH + PRODUCTION TARGET REQUIRED** | owner-authorized review/CI of existing branch, then live migrations/RLS/env/exact revision and two-account authorization/isolation/recovery/logout cleanup journey |
| The Bu1LD | canonical source `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; exact-main CI run `29679123068` passed | Cloudflare workflow run `29679123047` failed at `release:check` because required `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` inputs were empty; deploy was skipped; production Supabase/auth/role journey remains unverified | **BLOCKED — RELEASE ENVIRONMENT / DEPLOYMENT NOT VERIFIED** | configure/verify intended repository Actions secrets without committing values, rerun exact source SHA, prove served revision, then seven-role auth/RLS/object-boundary journey and cleanup |
| Percy Prime | historical/control artifacts exist | live Mac SQLite/WAL/checkpoint/process/worktree state is unavailable in this execution surface | **BLOCKED_EXTERNAL_MAC** | non-destructive DB/WAL/checkpoint snapshot, integrity/schema, live counters/leases/heartbeats/stale-worker/worktree reconciliation before qualification |

## Product certification law

A CI pass, source branch, database metadata query, preview deployment, provider status, or HTTP 200 is **not** exact production certification.

Production status requires direct evidence for the intended immutable revision plus the relevant authenticated end-to-end journey. External rate limits, missing secrets, or inaccessible production targets remain blockers; they are not reasons to weaken gates, fabricate deployment state, or incur unapproved spending.
