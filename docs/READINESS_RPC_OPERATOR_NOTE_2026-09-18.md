# Operator note — readiness degraded on vertex-ed-ai (2026-09-18)

Verified live:

```bash
curl -sS 'https://vertex-ed-ai.vercel.app/api/health?readiness=1'
```

Observed (redacted to tokens only):

- `status`: `degraded`
- `databaseError`: `readiness_rpc_missing` (PostgREST `PGRST202` class)
- `durableRateLimiting`: `false` → set `WAITLIST_RATE_LIMIT_SALT` in the Vercel project env
- Auth/waitlist/coreAi checks: `true`

## Repository migrations that define `public.vertexed_readiness()`

Apply through authorized Supabase migration workflow (do not invent SQL here):

- `supabase/migrations/20260906101155_learner_state_and_telemetry.sql`
- `supabase/migrations/20260906112000_batch_state_and_privileges.sql`
- `supabase/migrations/20260908165433_exam_session_readiness.sql`
- `supabase/migrations/20260909103238_harden_waitlist_tokens_and_timestamps.sql`

Grant remains `service_role` only (intentional).

## After apply

1. Set `WAITLIST_RATE_LIMIT_SALT` on the owning Vercel project.
2. Redeploy or wait for env propagation.
3. Re-run `?readiness=1` until `ok:true` / `status:"ready"` without weakening health gates.
4. Keep www TLS recovery on the separate DNS/domain track (`docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`).
