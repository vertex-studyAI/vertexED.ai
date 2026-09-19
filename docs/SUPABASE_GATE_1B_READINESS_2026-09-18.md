# Supabase Gate 1b — deep readiness recovery — 2026-09-18

## Live evidence (do not conflate with shallow health)

| Surface | Shallow `/api/health` | Deep `/api/health?readiness=1` |
|---|---|---|
| `vertex-ed-ai.vercel.app` | **200** alive, revision on tip | **503** degraded |
| Observed checks (ed-ai) | auth/waitlist/coreAi/plannerAi true | `durableRateLimiting=false`; all DB checks false |
| `databaseError` | — | `readiness_rpc_missing` |
| `vertex-ai-rho.vercel.app` | **200** alive | **503**; waitlist/coreAi also false (env incomplete on that project) |

Shallow health proves the Node/Vercel deploy. Deep readiness proves **production Supabase schema + server secrets**.

## Root cause (source-backed)

Application code calls `supabase.rpc('vertexed_readiness')` (`api/_handlers/health.js`).

The RPC is defined in repository migrations, including:

- `supabase/migrations/20260906101155_learner_state_and_telemetry.sql`
- `supabase/migrations/20260906112000_batch_state_and_privileges.sql`
- `supabase/migrations/20260908165433_exam_session_readiness.sql`
- `supabase/migrations/20260909103238_harden_waitlist_tokens_and_timestamps.sql` (latest replace)

pgTAP expects it: `supabase/tests/database/structure.test.sql`.

Production returning `readiness_rpc_missing` (`PGRST202` / `42883`) means the **linked Supabase project has not applied these migrations** (or PostgREST schema cache is stale after apply).

`durableRateLimiting=false` separately means `WAITLIST_RATE_LIMIT_SALT` is unset in that Vercel project's server env.

## Do not

- Roll back application source to “fix” deep readiness
- Weaken readiness assertions or invent a fake ready=true
- Push migrations to an unknown/shared database without owner confirmation
- Print service-role keys or paste them into tickets

## Owner actions (authorized Supabase + Vercel access required)

1. Identify the **single** Supabase project used by the canonical Vercel production project (prefer the project behind `vertex-ed-ai` while www DNS is unresolved).
2. Confirm server env on that Vercel project includes:
   - `SUPABASE_URL` (or documented alias)
   - `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`
   - `WAITLIST_RATE_LIMIT_SALT` (dedicated random secret)
   - AI keys required for core/planner checks
3. From a clean checkout of the intended deploy SHA, run the read-only preflight:
   - `scripts/supabase-security-audit.sql`
4. Apply migrations only after history reconciliation:
   - `npx supabase db push` (or the team's approved migration path) against **that** project
5. If RPC exists in SQL but PostgREST still 404s the RPC, reload the API schema cache in Supabase, then retry.
6. Re-probe unchanged:
   - `curl -sS 'https://<canonical-host>/api/health?readiness=1'`
7. Accept only when `ok=true`, every `checks.*` is true, and `databaseError` is absent.

## Repository verification (no production credentials)

```bash
# confirms migrations + tests still require the RPC
rg -n "vertexed_readiness" supabase api tests
npm run test:app   # includes health contract tests
```

## Relationship to VX-203

Gate 1a = custom-domain DNS/TLS (`docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`).  
Gate 1b = this document (Supabase migrations + rate-limit salt + deep readiness).  
Both must be green before VX-204 production auth isolation.
