# PRODUCT_STATUS

**As of:** 2026-08-14 12:01 IST

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | source repository/control head available and both current Vercel commit-status contexts report success | preserve source gates; do not infer served revision |
| VertexED production | **BLOCKED — EXACT REVISION UNVERIFIED** | scheduled Production Health Monitor run `31771831538` on current main failed after 3 bounded attempts because `/api/health` returned no revision matching expected `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`; homepage, API 404, malformed waitlist rejection, logged-out AI/user/admin protection and untrusted-origin rejection all passed; artifact `9208406163`, SHA-256 `f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b` | identify canonical Vercel project/config, expose immutable revision, make scheduled monitor pass, then complete authenticated disposable-account golden journey |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC for live/production qualification** | repository/control artifacts exist, but existing host SQLite/WAL/process state is not visible here | non-destructive snapshot/integrity/recount, then crash/restart/provider/lease/resource/soak qualification |
| FinanceMeta | **BLOCKED_EXTERNAL** | prepared hardening/recovery artifacts exist; canonical writable repo and production Supabase are not exposed | authorize target; apply on isolated exact-base branch; verify authorization denial paths + real saved-progress journey |
| The Bu1LD | **BLOCKED_EXTERNAL** | prior source/production-hydration evidence retained; canonical writable target/Supabase/Cloudflare surface unavailable | authorize target; establish immutable deploy identity; fix/certify hydration and seven role journeys |
| Text-to-Video | **ARCHIVE/UNTRIAGED** | connected repository exists, but no current user/job/success metric was freshly established in this campaign | explicit owner/question and two-week validation need before new engineering |

## VertexED production incident boundary

The latest production monitor is authoritative for the tested public surface. A successful Vercel commit status means the GitHub integration accepted/reported a deployment context; it does not prove `www.vertexed.app` serves the intended immutable revision. Until the health response exposes the expected revision and authenticated journeys pass, the state remains `SOURCE_GREEN / PRODUCTION_BLOCKED`.

## Two-week product-validation rule

Once production identity is fixed, product work shifts from feature creation to real validation:

- **User:** actual approved learner, not an invented persona.
- **Job:** reach one trustworthy study outcome and retrieve it later.
- **Activation:** learner creates one useful artifact (for example planner/note/quiz/paper output appropriate to the real workflow) and saves it successfully.
- **Retention signal:** the learner returns in a fresh session and retrieves/continues the artifact.
- **Reliability:** auth, ownership/isolation, save/retrieve, logout denial and recovery must not silently fail.
- **Success metric:** observed activation and return/retrieval rates from real consented usage, with privacy-safe telemetry; do not invent a target population or traction number.

FinanceMeta and The Bu1LD should use the same principle after target access is restored: validate one core user job first, not speculative feature breadth.
