# PRODUCT_STATUS

**As of:** 2026-08-14 evidence-reconciliation wave

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | source repository/control head available and both current Vercel commit-status contexts report success | preserve source gates; do not infer served revision |
| VertexED production | **BLOCKED — EXACT REVISION UNVERIFIED** | scheduled Production Health Monitor run `31771831538` failed after 3 bounded attempts because `/api/health` returned no revision matching expected `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`; homepage, API 404, malformed waitlist rejection, logged-out AI/user/admin protection and untrusted-origin rejection all passed; artifact `9208406163`, SHA-256 `f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b` | identify canonical Vercel project/config, expose immutable revision, make scheduled monitor pass, then complete authenticated disposable-account golden journey |
| **VertexED Notes-to-Video V6** (`vertex-studyAI/Text-To-Video`) | **GREEN — LOCAL ENGINEERING / NOT PRODUCTION; MERGE AS VERTEXED CHILD** | main `5b9835a06f41f07f52029ee830b82565969c0965`; CI run `31609979616` SUCCESS. Repository locally generates/validates real H.264/AAC MP4 media with ffprobe, accepts validated external render jobs, has explicit render lifecycle, durable single-host queue/leases/retries, atomic/fail-closed promotion and SHA-256 content-addressed local artifact storage. Audio is deterministic mock/silent; storage/queue are local; no deployed authenticated end-to-end worker/storage callback is proven | do **not** create a new standalone product. Fold into VertexED after exact production identity is certified; then choose one narrow user workflow and add authenticated hosted storage/worker callback, real narration only if needed, retention/cleanup/observability, and a disposable-account end-to-end validation |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC for live/production qualification** | repository/control artifacts exist, but existing host SQLite/WAL/process state is not visible here | non-destructive snapshot/integrity/recount, then crash/restart/provider/lease/resource/soak qualification |
| FinanceMeta | **BLOCKED_EXTERNAL** | prepared hardening/recovery artifacts exist; canonical writable repo and production Supabase are not exposed | authorize target; apply on isolated exact-base branch; verify authorization denial paths + real saved-progress journey |
| The Bu1LD | **BLOCKED_EXTERNAL** | prior source/production-hydration evidence retained; canonical writable target/Supabase/Cloudflare surface unavailable | authorize target; establish immutable deploy identity; fix/certify hydration and seven role journeys |

## VertexED production incident boundary

The latest production monitor is authoritative for the tested public surface. A successful Vercel commit status means the GitHub integration accepted/reported a deployment context; it does not prove `www.vertexed.app` serves the intended immutable revision. Until the health response exposes the expected revision and authenticated journeys pass, the state remains `SOURCE_GREEN / PRODUCTION_BLOCKED`.

## Notes-to-Video V6 boundary

The `Text-To-Video` repository is not an untriaged idea. It is a verified **local media/learning subsystem** of the VertexED product family. Its current evidence supports local deterministic media generation, lifecycle/queue/storage reliability and provenance. It does **not** support production video-service claims, hosted durability, distributed exactly-once workers, synthesized narration, autoscaling, public hosted URLs, deployed authenticated ownership, or real-user usefulness.

Keeping it as a child of VertexED reduces portfolio duplication: product validation should test one VertexED user job end-to-end rather than launch a second standalone Notes-to-Video product programme.

## Two-week product-validation rule

Once production identity is fixed, product work shifts from feature creation to real validation:

- **User:** actual approved learner, not an invented persona.
- **Job:** reach one trustworthy study outcome and retrieve it later.
- **Activation:** learner creates one useful artifact and saves it successfully.
- **Retention signal:** the learner returns in a fresh session and retrieves/continues the artifact.
- **Reliability:** auth, ownership/isolation, save/retrieve, logout denial and recovery must not silently fail.
- **Success metric:** observed activation and return/retrieval rates from real consented usage, with privacy-safe telemetry; do not invent a target population or traction number.

Notes-to-Video is eligible to participate in this validation only as a chosen VertexED workflow after the core production identity/authentication gates close. FinanceMeta and The Bu1LD should use the same principle after target access is restored: validate one core user job first, not speculative feature breadth.
