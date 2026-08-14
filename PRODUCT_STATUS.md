# PRODUCT_STATUS

**As of:** 2026-08-14 convergence re-verification

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | source repository/control head available; source/release evidence is separate from served production identity | preserve source gates; do not infer served revision |
| VertexED database security | **PARTIAL / BOUNDED CONTROLS VERIFIED** | connected Supabase project is active/healthy; every inspected `public` table has RLS enabled; visible policies are ownership-scoped/fail-closed/public-read-only; two public `SECURITY DEFINER` functions are executable only by `postgres`/`service_role`. Security Advisor still reports leaked-password protection disabled and available Postgres security patches | owner/admin reviews platform configuration, applies approved maintenance, reruns advisor; keep deployment/golden journey separate |
| VertexED production | **BLOCKED — EXACT REVISION UNVERIFIED** | public/security smoke can pass while `/api/health` omits immutable deploy revision | expose exact intended/served revision + deployment ID, make monitor pass, then complete authenticated disposable-account golden journey |
| VertexED Notes-to-Video V6 child subsystem | **GREEN — LOCAL ENGINEERING / NOT PRODUCTION** | retained bounded local MP4/render/queue/storage evidence; no hosted/distributed/public-user claim | keep child-scoped; productionize only if parent validation creates a real need |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC** | checked-in snapshots are historical; live SQLite/WAL/process state not visible | non-destructive snapshot/integrity/recount, then qualification |
| FinanceMeta source/security recovery | **PARTIAL — PRESERVED, NOT MERGE-READY** | historical security merge `f18d0f0...` is genuine but current main is pre-merge `fbdd503...`; preserved branch is 41 commits ahead. Exact-head CI fails lint; GitHub connector mutation attempts return 403 | repair/qualify exact preserved head through an owner-authorized reviewable branch; never force-move main |
| FinanceMeta production | **BLOCKED_EXTERNAL_RUNTIME** | production Supabase/runtime and authenticated saved-progress journey unavailable | regain approved production access, audit exact schema/RLS, verify denial paths and golden journey |
| The Bu1LD source | **GREEN — EXACT CURRENT-MAIN CI PASSED** | current main `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` is readable and source CI passed | preserve exact SHA and diagnose release check |
| The Bu1LD production | **BLOCKED — DEPLOYMENT NOT VERIFIED** | Cloudflare workflow verification failed because `release:check` exited 1; deploy job skipped | fix exact release-check failure, rerun on intended SHA, prove served revision, then verify required role journeys |

## Product completion boundary

Repository access, CI, database-policy inspection, and deployment are separate claims. A product becomes production-certified only after exact served revision, authenticated core workflow, persistence, authorization/account isolation, logout/recovery/admin boundaries, error behavior, rollback/monitoring, and relevant accessibility/mobile checks are evidenced.

## Current product priority

1. VertexED: served revision + authenticated golden journey; no feature expansion.
2. FinanceMeta: preserve/recover security branch, fix exact-head CI, restore reviewable mutation path; production remains separate.
3. Bu1LD: diagnose/fix deployment release check and verify exact served revision; then role journeys.

## Two-week validation rule after certification

Once production identity is fixed, shift from feature creation to real validation with actual approved users, a concrete core job, privacy-safe telemetry, and observed activation/return evidence. Do not invent users, traction, or target rates.
