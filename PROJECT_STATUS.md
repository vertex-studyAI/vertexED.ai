# VertexED — verified status (2026-09-19 marathon)

## Live surfaces (re-probed this session)

| Surface | Status | Evidence |
|---|---|---|
| `origin/main` | Moving tip; includes agents (#917+), VERTEX_AGENTS wave, authz (#982), live-app resolver (#984) | `git fetch` + tip SHA at probe time |
| `https://vertex-ed-ai.vercel.app/api/health` | **alive** | HTTP 200; revision observed at `60cd8c44…` during deploy catch-up |
| `https://vertex-ed-ai.vercel.app/api/health?readiness=1` | **degraded** | `databaseError=readiness_rpc_missing`; durable rate-limit salt still missing |
| `https://vertex-ed-ai.vercel.app/api/agents` | **LIVE_AUTH_REQUIRED** | HTTP **401** `Authentication required` (was 404 before deploy) |
| `https://www.vertexed.app` | **FAILED** | TLS before HTTP; non-Vercel A records `2.59.170.20`, `104.219.250.37` |
| `www.vertexed.ai` | **FAILED** | DNS empty / NXDOMAIN |

Probe command (read-only):

```bash
npm run probe:gates
# or: node scripts/probe-production-gates.mjs
```

Live app base resolver (CI helper):

```bash
npm run resolve:live-app-base
# prefers www when healthy; falls back to vertex-ed-ai while Gate 1a is blocked
```

## Verified this session (local)

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run test:app` | **991/991** PASS (earlier tip; re-run after large merges if needed) |
| `npm run build` | PASS |
| `tests/agents-handler.test.mjs` | PASS (401 unauth, 405 non-GET, no instructions leak, rate-limit contract) |
| `tests/resolve-live-app-base.test.mjs` | PASS |
| Reduced-motion a11y (tablet-768) | PASS on current tip |

## Open engineering PRs (agent-doable)

| PR | Role |
|---|---|
| **#986** | Wire live-app resolver into browser-production + smoke-production + contract tests |
| **#985** | review VERTEX_AGENTS answerReviewer instructions |

## Human gates (still required)

1. **Gate 1a:** Point `www.vertexed.app` DNS at owning Vercel project (`docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`)
2. **Gate 1b:** Apply readiness migrations + set `WAITLIST_RATE_LIMIT_SALT` (`docs/SUPABASE_GATE_1B_READINESS_2026-09-18.md`)
3. **Vercel build rate limit:** preview deploys may fail with `upgradeToPro=build-rate-limit` until quota resets — production catch-up already observed on `vertex-ed-ai`

## Do not

- Roll back product source for www TLS (Gate 1a)
- Weaken readiness to invent `ok:true` (Gate 1b)
- Treat local green as production custom-domain green
- Re-apply parked study-UI salvage wholesale — it would remove Agent network UI / a11y dialog copy that main already fixed

## Next agent actions

1. Land / verify **#986** CI green on main
2. Keep production monitors honest on www while CI certifies canonical fallback
3. Authz/ownership regression tests on mutating APIs beyond agents listing
4. Portfolio P1 repos only after VertexED Gate 1a/1b human unblock or parallel non-blocking work
