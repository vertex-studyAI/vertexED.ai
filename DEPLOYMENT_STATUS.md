# DEPLOYMENT_STATUS

**As of:** 2026-08-14 convergence re-verification

| System | Source/build | Deployment evidence | Authoritative deployment state | Exact next gate |
|---|---|---|---|---|
| VertexED | source GREEN | public surface can be healthy, but immutable served revision is omitted | **BLOCKED — SERVED REVISION UNVERIFIED** | prove intended SHA = served SHA/deployment ID, make monitor pass, then authenticated disposable-account journey |
| FinanceMeta | preserved security branch exists; exact head currently lint-failing | production Supabase/runtime not visible | **BLOCKED_EXTERNAL_RUNTIME** | restore owner-authorized reviewable recovery path, make exact-head CI pass, then qualify real production schema/deploy |
| The Bu1LD | exact current-main CI PASS at `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` | Cloudflare verification failed at `release:check`; deploy job skipped | **BLOCKED — NOT DEPLOYED/VERIFIED BY THAT RUN** | diagnose/fix release check, rerun exact SHA, prove served revision, then role journeys |
| Percy Prime | historical repo/control evidence only | live Mac process/DB surface unavailable | **BLOCKED_EXTERNAL_MAC** | non-destructive live snapshot/integrity/recount before any qualification claim |

## Deployment law

A successful source build or CI run is not a deployment claim. A deployment-provider status is not sufficient served-revision evidence. Production certification requires exact source/deployment identity plus the relevant authenticated workflow, persistence, authorization boundaries, rollback/monitoring and failure evidence.

No deployment in this convergence run is upgraded beyond the evidence above.
