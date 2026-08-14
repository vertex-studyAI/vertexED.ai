# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence re-verification

| System | Source/build | Deployment evidence | Deployment state | Next gate |
|---|---|---|---|---|
| VertexED | source GREEN | bounded monitor sees healthy public surface but no immutable revision; connected Vercel contexts rate-limited | **BLOCKED — SERVED REVISION UNVERIFIED** | after external unblock, prove intended/served SHA + deployment ID, monitor PASS, authenticated disposable-account journey |
| FinanceMeta | preserved security branch; exact head lint-failing | production Supabase/runtime unavailable | **BLOCKED_EXTERNAL_RUNTIME** | owner-authorized recovery, exact-head CI/security pass, then real production qualification |
| The Bu1LD | exact current-main CI PASS at `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` | Cloudflare verification failed at `release:check`; deploy skipped | **BLOCKED — DEPLOYMENT NOT VERIFIED** | fix release check, rerun exact SHA, prove served revision, then role journeys |
| Percy Prime | historical repo/control evidence only | live Mac process/DB surface unavailable | **BLOCKED_EXTERNAL_MAC** | non-destructive live snapshot/integrity/recount before qualification |

A source build, CI pass or provider status is not itself served-revision proof. No deployment is upgraded beyond the evidence above.
