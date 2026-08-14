# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence run

| System | Source/build evidence | Deployment evidence | State | Next gate |
|---|---|---|---|---|
| VertexED | source/control evidence available | monitor `31817794439` reached live surface but immutable expected revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a` is absent; Vercel capacity is rate-limited | **BLOCKED — SERVED REVISION UNVERIFIED** | exact intended/served SHA + deployment ID, monitor PASS, authenticated disposable-account journey |
| FinanceMeta | hardening candidate `6dcc03710bb6adf9b4b722b308c40a0720bea61f`, 41 ahead / 0 behind main; exact-head Actions run `29641469740` fails with zero jobs because CI YAML has duplicate E2E env keys | exact SHA has successful Vercel deployment `5501026657`, but environment is explicitly `Preview` / `production_environment: false`; live production Supabase/deploy target unavailable | **SOURCE/PREVIEW PARTIAL; PRODUCTION BLOCKED** | owner-writable CI-definition repair + exact-head CI; then live production migration/RLS/revision/two-account qualification |
| The Bu1LD | `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; exact-main CI `29679123068` success | Cloudflare run `29679123047` fails at `release:check` because Supabase URL/anon-key secrets are empty; deploy skipped | **BLOCKED — RELEASE ENVIRONMENT / DEPLOYMENT UNVERIFIED** | configure intended Actions secrets without source exposure; rerun exact SHA; prove served revision; seven-role journey |
| Percy Prime | control/historical evidence only | live Mac SQLite/WAL/process state unavailable | **BLOCKED_EXTERNAL_MAC** | non-destructive snapshot/integrity/recount |

Source code, CI, Preview deployment and public availability are not exact production certification. No paid resource or invented credential is authorized.
