# PRODUCT_STATUS

**As of:** 2026-08-14 22:02 IST

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | canonical control head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d`; source/release CI evidence is strong, while GitHub/Vercel deployment status remains separate from served production identity | preserve source gates; do not infer served revision |
| VertexED production | **BLOCKED — EXACT REVISION UNVERIFIED** | scheduled production-health run `31817794439` failed three bounded attempts because `/api/health` was healthy but its revision was missing instead of matching deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; homepage, unknown API routing, malformed waitlist, logged-out AI/user/admin and untrusted-origin boundaries passed; evidence artifact `9225715176`, digest `sha256:e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a` | identify canonical Vercel project/config, expose immutable revision without hardcoding, make scheduled monitor pass against exact served revision, then complete authenticated disposable-account golden journey |
| VertexED Notes-to-Video V6 child subsystem | **GREEN — LOCAL ENGINEERING / NOT PRODUCTION** | `vertex-studyAI/Text-To-Video` proves a local lesson/render pipeline with real H.264/AAC MP4 encoding, ffprobe verification, validated external render jobs, durable single-host queue semantics, atomic fail-closed output promotion and SHA-256 content-addressed local media storage; the repository explicitly does **not** prove hosted storage, distributed workers, synthesized narration, authenticated deployed callbacks, public URLs or real-user validation | keep as a VertexED child subsystem; no standalone product expansion; productionize only if the parent VertexED user-validation lane demonstrates a real need for notes-to-video |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC for live/production qualification** | repository/control artifacts exist, but existing host SQLite/WAL/process state is not visible through the connected control surface | non-destructive snapshot/integrity/recount, then crash/restart/provider/lease/resource/soak qualification |
| FinanceMeta | **BLOCKED_EXTERNAL** | prepared hardening/recovery artifacts exist; connected GitHub App still does not expose the target-owner write surface and FinanceMeta production Supabase is not connected | authorize target; apply on isolated exact-base branch; verify authorization denial paths + real saved-progress journey |
| The Bu1LD | **BLOCKED_EXTERNAL** | prior source/production-hydration evidence retained; canonical writable target/Supabase/Cloudflare surface unavailable | authorize target; establish immutable deploy identity; fix/certify hydration and seven role journeys |

## VertexED production incident boundary

The production monitor is authoritative for the tested public surface. Run `31817794439` started at `2026-08-14T16:07:00Z` and completed `failure`. Its artifact shows three consistent outcomes: the service is live; the logged-out security/routing checks pass; immutable revision identity is absent. A successful GitHub/Vercel status therefore still does not prove `www.vertexed.app` serves the intended immutable revision. Until the health response exposes the expected revision and authenticated journeys pass, the state remains `SOURCE_GREEN / PRODUCTION_BLOCKED`.

Do **not** weaken the revision assertion or hardcode a SHA to make the monitor green. The next valid repair is canonical Vercel-project/deployment configuration followed by exact live proof.

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