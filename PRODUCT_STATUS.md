# PRODUCT_STATUS

**As of:** 2026-08-14 22:01 IST

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | current control head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d`; source/release CI evidence is strong, while GitHub/Vercel deployment status remains separate from served production identity | preserve source gates; do not infer served revision |
| VertexED production | **BLOCKED — EXACT REVISION UNVERIFIED / DEPLOY CAPACITY DEGRADED** | latest verified scheduled run `31817794439` at 2026-08-14 21:37 IST passed homepage, router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin boundaries on all bounded attempts, but live `/api/health` omitted immutable revision; deploy-path contract expected `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`. Both Vercel status contexts on current control head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` report `build-rate-limit` failures. Evidence artifact `production-health-31817794439` is ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a` | identify canonical Vercel project/config and deployment identity; restore intentional deploy capacity; expose immutable revision and make scheduled monitor pass; then complete authenticated disposable-account golden journey |
| VertexED Notes-to-Video V6 child subsystem | **GREEN — LOCAL ENGINEERING / NOT PRODUCTION** | `vertex-studyAI/Text-To-Video` proves a local lesson/render pipeline with real H.264/AAC MP4 encoding, ffprobe verification, validated external render jobs, durable single-host queue semantics, atomic fail-closed output promotion and SHA-256 content-addressed local media storage; the repository explicitly does **not** prove hosted storage, distributed workers, synthesized narration, authenticated deployed callbacks, public URLs or real-user validation | keep as a VertexED child subsystem; no standalone product expansion; productionize only if the parent VertexED user-validation lane demonstrates a real need for notes-to-video |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC for live/production qualification** | repository/control artifacts exist, but existing host SQLite/WAL/process state is not visible through the connected surface | non-destructive snapshot/integrity/recount, then crash/restart/provider/lease/resource/soak qualification |
| FinanceMeta | **SOURCE READABLE / GITHUB WRITE + PRODUCTION BLOCKED_EXTERNAL** | canonical target `build-the-future-11/finance4all-global-reach` is readable at `fbdd503223edc5b1780509720391083f485a4a85`, but a fresh isolated branch-creation attempt returned `403 Resource not accessible by integration`. Connected Supabase lists only VertexED (`xwlrzgfuhfbckgvcmyoq`), not FinanceMeta. Source review confirms the known privilege-escalation boundary around user-editable `profiles.role`, public `SECURITY DEFINER` authorization helpers and incomplete update/insert policy checks | grant GitHub contents/branch/PR write access and connect FinanceMeta production Supabase; then prepare/apply exact-base migration using the repo's Supabase workflow, verify normal-member role-escalation denial paths, and run the real saved-progress golden journey |
| The Bu1LD | **BLOCKED_EXTERNAL** | prior source/production-hydration evidence retained; current connected Supabase lists only VertexED, not The Bu1LD, and the canonical writable target/Cloudflare production surface is not exposed here | authorize target + Supabase/Cloudflare surfaces; establish immutable deploy identity; fix/certify hydration and seven role journeys |

## VertexED production incident boundary

Scheduled run `31817794439` is the latest production-health evidence explicitly verified during this reconciliation. It is evidence of a live public/security surface with a missing immutable revision marker, not evidence of a total outage. A successful or failed Vercel commit status remains distinct from proof of what `www.vertexed.app` actually serves. Until the health response exposes the intended revision and authenticated journeys pass, the state remains `SOURCE_GREEN / PRODUCTION_BLOCKED`.

## FinanceMeta source-security boundary

Current target source contains `profiles.role` as an authorization field while authenticated users may update their own profile row without a `WITH CHECK` boundary that preserves authorization state; self-insert likewise does not force `member`. The public `SECURITY DEFINER` helpers used by RLS do not pin `search_path` or establish an explicit callable-role boundary. This is a source-level confirmed defect, but **not** evidence that a production migration has been applied or tested. A fresh connected GitHub branch-write attempt still returns 403, and FinanceMeta's Supabase project is not exposed to the connector, so production remains blocked.

## Notes-to-Video boundary

The connected `Text-To-Video` repository is not an empty or untriaged experiment. Its current README documents a bounded local VertexED Notes-to-Video V6 subsystem with a real MP4 encoder, verification, lifecycle, durable local queue and content-addressed local artifact store. That is sufficient to retain it as a **child engineering subsystem**, but not as an independent product or production service. Standalone expansion remains archived unless parent-product validation creates a concrete user need.

## Two-week product-validation rule

Once production identity is fixed, product work shifts from feature creation to real validation:

- **User:** actual approved learner, not an invented persona.
- **Job:** reach one trustworthy study outcome and retrieve it later.
- **Activation:** learner creates one useful artifact (for example planner/note/quiz/paper output appropriate to the real workflow) and saves it successfully.
- **Retention signal:** the learner returns in a fresh session and retrieves/continues the artifact.
- **Reliability:** auth, ownership/isolation, save/retrieve, logout denial and recovery must not silently fail.
- **Success metric:** observed activation and return/retrieval rates from real consented usage, with privacy-safe telemetry; do not invent a target population or traction number.

FinanceMeta and The Bu1LD should use the same principle after target access is restored: validate one core user job first, not speculative feature breadth.
