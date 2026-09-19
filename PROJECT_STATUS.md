# VertexED — verified status (2026-09-19, 6h execution pass)

## Live surfaces (re-probed)

| Surface | Status | Evidence |
|---|---|---|
| `origin/main` | Tip includes #908/#909/#910/#912 | `049dcfe` (fetch this session) |
| `https://vertex-ed-ai.vercel.app/api/health` | **alive** | HTTP 200; revision matches main tip when probed |
| `https://vertex-ed-ai.vercel.app/api/health?readiness=1` | **degraded** | `databaseError=readiness_rpc_missing`; `durableRateLimiting=false` |
| `https://vertex-ai-rho.vercel.app` shallow health | **alive** | HTTP 200 same revision class |
| rho readiness | **degraded** + weaker env | waitlist/coreAi/plannerAi false |
| `https://www.vertexed.app` | **FAILED** | TLS before HTTP (`SSL_ERROR_SYSCALL`); non-Vercel A records |
| `www.vertexed.ai` / `vertexed.ai` | **FAILED** | No A records from probe host |
| `/api/agents` on production | **404** | PR #917 not merged |

Probe command (read-only):

```bash
node scripts/probe-production-gates.mjs
```

## Active engineering branch

| Branch | Role | Status |
|---|---|---|
| `work/heavy-exec` → PR **#917** (draft) | Authenticated agent network directory | Local `test:app` **922/922**; CI green; **not in production** |
| `codex/vertexed-publication-readiness` | Dirty local study-UI WIP | **Do not deploy**; divergent older agents copies quarantined under `.codex-tmp` |

## Do not

- Roll back product source for www TLS (VX-203 / Gate 1a)
- Weaken readiness to invent `ok:true` (Gate 1b)
- Ship dirty publication-branch agents over #917

## Human gates (still required)

1. **Gate 1a:** Point `www.vertexed.app` DNS at owning Vercel project (`docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`)
2. **Gate 1b:** Apply readiness migrations + set `WAITLIST_RATE_LIMIT_SALT` (`docs/SUPABASE_GATE_1B_READINESS_2026-09-18.md`, `docs/READINESS_RPC_OPERATOR_NOTE_2026-09-18.md`)
3. **Review/merge #917** after undraft, or reject and remove agents UI from deployable branches

## Agent work this pass

- Production gate probe script
- Status/queue refresh to current main + live faults
- Quarantine divergent dirty agents WIP
- Continue P1/P2 backlog in `WORKSPACE_EXECUTION/VERTEXED_6H_BACKLOG_2026-09-19.md`
