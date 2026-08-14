# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence run

| System | Source/build evidence | Deployment evidence | Authoritative state | Next gate |
|---|---|---|---|---|
| VertexED | source/control evidence GREEN | production monitor `31817794439` sees healthy public/security surface but immutable expected revision is missing; Vercel capacity is rate-limited | **BLOCKED — SERVED REVISION UNVERIFIED** | prove intended/served SHA + deployment ID, monitor PASS, then authenticated disposable-account journey |
| FinanceMeta | existing hardening branch `6dcc03710bb6adf9b4b722b308c40a0720bea61f` recovered, 41 ahead / 0 behind main | live Supabase/deploy target unavailable | **BLOCKED_EXTERNAL** | owner review exact branch, then live migration/RLS/revision + two-account journey |
| The Bu1LD | `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; exact-main CI run `29679123068` PASS | Cloudflare run `29679123047` failed at `release:check` because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were empty; deploy skipped. Workflow already maps repository secrets correctly | **BLOCKED — RELEASE ENVIRONMENT / DEPLOYMENT NOT VERIFIED** | configure/verify intended repository Actions secrets without putting values in source; rerun exact SHA; prove served revision; then seven-role journey |
| Percy Prime | historical/control artifacts only from this surface | live Mac SQLite/WAL/process state unavailable | **BLOCKED_EXTERNAL_MAC** | non-destructive snapshot/integrity/recount before qualification |

A CI pass, provider status, source branch, or public 200 response is not itself exact served-revision evidence. No deployment is upgraded beyond direct evidence.
