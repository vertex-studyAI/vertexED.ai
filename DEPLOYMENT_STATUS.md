# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence run

| System | Source/build | Deployment evidence | Authoritative deployment state | Next gate |
|---|---|---|---|---|
| VertexED | source GREEN | bounded production monitor sees healthy public surface but no immutable revision; connected deployment contexts report rate limiting | **BLOCKED — SERVED REVISION UNVERIFIED** | use authorized existing capacity only; prove intended/served SHA + deployment ID, monitor PASS, authenticated disposable-account journey |
| FinanceMeta | retained hardening branch recovered; review write path blocked | live production Supabase/deploy target unavailable | **BLOCKED_EXTERNAL** | owner-authorized branch review/exact-head CI, then live schema/RLS/revision + multi-account journey |
| The Bu1LD | exact current-main CI PASS at `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` | exact-main Cloudflare workflow verification failed at `release:check`; deploy job skipped | **BLOCKED — DEPLOYMENT NOT VERIFIED** | fix/diagnose release check, rerun intended SHA, prove served revision, then seven-role journey |
| Percy Prime | historical repo/control evidence only | live Mac SQLite/WAL/process state unavailable | **BLOCKED_EXTERNAL_MAC** | non-destructive live snapshot/integrity/recount before qualification |

A CI pass, provider status or public 200 response is not itself exact served-revision evidence. No production deployment is upgraded beyond the evidence above.
