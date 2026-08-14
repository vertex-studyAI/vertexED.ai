# BLOCKERS

**As of:** 2026-08-14 convergence re-verification. Only blockers preventing a stronger evidence claim are listed. Historical access blockers are narrowed when current evidence disproves them.

## P0 — Percy authoritative live state — `BLOCKED_EXTERNAL_MAC`
Existing Mac SQLite/WAL/process state is not visible from this execution surface. Checked-in `.percy/*` is historical provenance only. Run `PERCY-STATE-001` non-destructively: snapshot/hash, integrity/schema, leases/heartbeats/stale reconciliation, independent recount. Do not reset or replace the DB.

## P0 — VertexED exact production revision — `BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY`
The public surface has returned healthy while omitting immutable revision identity. Exact served revision/deployment ID and an authenticated disposable-account golden journey are still required. Connected Supabase inspection does **not** close this blocker.

### VertexED platform-security human actions
- Security Advisor warns leaked-password protection is disabled.
- Security Advisor warns Postgres security patches are available.
- Current bounded database inspection found RLS enabled on all inspected `public` tables and no anon/authenticated EXECUTE privilege on the two public `SECURITY DEFINER` functions.
- Treat platform configuration/maintenance changes as owner/admin actions; do not silently change production settings in this convergence branch.

## P0 — Project 2424 canonical source recovery — `BLOCKED_EXTERNAL_SOURCE`
Selected child evidence is retained, but umbrella canonical source/dirty overlay recovery depends on preserved local/Inkling state. Full 2,424-ID canonical disposition cannot be fabricated from partial registries. Recover ancestry/overlay before source-dependent new experiments or full-map claims.

## P0 — FinanceMeta source/security recovery — `PARTIAL / MUTATION_BLOCKED`
PR #1 genuinely merged as `f18d0f008351a86accbc5ca2fa6ebbec05e57906`, but current `main` is again at pre-merge parent `fbdd503223edc5b1780509720391083f485a4a85`. The preserved security branch remains 41 commits ahead, so the work is not lost. However its latest CI fails lint, and attempts to create a recovery branch or draft PR through the connected GitHub integration return `403 Resource not accessible by integration`. Do **not** force-move `main`; recover only through a reviewable exact-head path after lint/security qualification.

## P0 — FinanceMeta production — `BLOCKED_EXTERNAL_RUNTIME`
The production Supabase/runtime surface and authenticated golden journey are not accessible here. Source recovery must not be represented as production security certification.

## P0 — The Bu1LD production — `BLOCKED_DEPLOYMENT_VERIFICATION`
Repository access is no longer the blocker: current `main` is readable and exact-main CI passed. The Cloudflare deployment workflow failed in its verification job because `release:check` exited 1; the deploy job was skipped. Production remains unverified until the release check is fixed/re-run on the exact intended SHA and required role journeys are demonstrated.

## P1 — LAM-JEPA external/owner closure
Internal reproducibility and the immutable external packet are complete. Remaining gates are owner-approved license/authorship/citation/redistribution metadata and genuinely independent outside reproduction/review. Packet readiness is not external validation.

## P1 — IRIS baseline frontier
The protocol is frozen; the blocker is exact retained raw/source recovery. Confirmatory seeds `1000–1029` remain quarantined. Approximate reconstruction is prohibited.

## P1 — Darcy exact frozen execution
The learned-operator/OOD protocol is already frozen at control commit `6fbd9c4b...`; **freeze is no longer the blocker**. Remaining gates are canonical source confirmation and explicit authorization to execute that exact frozen protocol. No retuning or substitute protocol.

## P1 — NPMS / APEN / Eigen-JEPA
NPMS remains source-identity blocked for new natural/OOD science. APEN and Eigen-JEPA remain secondary behind dangerous learned/statistical controls; frozen negative/mixed evidence must not be retuned in place.

## P1 — Hercules / Olympus
No significant compute until decisive matched protocols are frozen. Architecture names or target parameter counts are not capability evidence.
