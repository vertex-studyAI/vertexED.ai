# Canonical host decision note — 2026-09-19

## Live probe comparison

| Host | Shallow health | Deep readiness | Notes |
|---|---|---|---|
| `vertex-ed-ai.vercel.app` | alive / auth+waitlist+AI true | degraded `readiness_rpc_missing`; salt false | **Best current API candidate** |
| `vertex-ai-rho.vercel.app` | alive | degraded; waitlist/coreAi/plannerAi **false** | Incomplete server env — demote until parity |
| `www.vertexed.app` | unreachable (TLS) | n/a | Gate 1a |
| `www.vertexed.ai` | DNS empty | n/a | Decide keep/drop |

## Recommendation (engineering)

Treat **`vertex-ed-ai`** as the sole production API/truth surface until:

1. Gate 1a attaches `www.vertexed.app` to that same Vercel project, and
2. Gate 1b readiness is green on that project, and
3. rho either receives identical server env **or** is explicitly marked non-production (no host redirects that imply it is canonical).

Do not flip marketing DNS to rho while its readiness AI/waitlist checks are false.
