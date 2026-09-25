# HUMAN UNBLOCK CHECKLIST — Gate 1a / 1b / Vercel
Generated: 2026-09-19 (agent-prepared; no secrets)

Do these in order. Code/CI already fall back to `https://vertex-ed-ai.vercel.app` while Gate 1a is down.

## 1) Vercel deploy quota (blocks tip → live)

**Symptom:** Commit statuses `Deployment rate limited — retry in 24 hours.` Live often lags tip (observed catching up to `922a5782` while tip advanced further).

**Action (pick one):**
- Wait until the rate-limit window clears, then push an empty commit or Redeploy Production for `vertex-ed-ai`, **or**
- Upgrade the Vercel plan / raise build quota for the project team that owns `vertex-ed-ai` / `vertex-ai`.

**Done when:** `GET https://vertex-ed-ai.vercel.app/api/health` → `revision` equals current `origin/main` tip SHA.

## 2) Gate 1a — www DNS/TLS

**Symptom:** `https://www.vertexed.app` TLS/fetch fails; resolver reports `gate1a=BLOCKED_TLS_OR_HTTP`.

**Action:**
1. In the **same** Vercel project as `vertex-ed-ai`, attach custom domain `www.vertexed.app` (+ apex if used).
2. Fix DNS at the registrar to the records Vercel shows (A/CNAME/ALIAS). Remove parking/proxy that breaks TLS.
3. Wait for certificate Issued.

**Done when:** `curl -I https://www.vertexed.app/api/health` → 200 and same revision family as `vertex-ed-ai`.

## 3) Gate 1b — Supabase readiness + salt

**Symptom:** `/api/health?readiness=1` → `status=degraded`, `databaseError=readiness_rpc_missing` (and related checks false).

**Do NOT** blind `db push` against a shared Supabase project. Follow `docs/PRODUCTION_LAUNCH.md` ledger checks first.

**Minimum apply set (VertexED migrations, ordered):**
- `20260906101155_learner_state_and_telemetry.sql`
- `20260906103806_atomic_rate_limits_and_singletons.sql`
- `20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql`
- `20260908165433_exam_session_readiness.sql`
- plus any later readiness-hardening migrations already in `supabase/migrations/` that the remote ledger is missing

**Also set on Vercel Production (and Preview if used):**
- `WAITLIST_RATE_LIMIT_SALT` = new random secret (never commit the value)

**Done when:** `GET https://vertex-ed-ai.vercel.app/api/health?readiness=1` reports readiness fields true (and salt-backed waitlist limits work). Then re-point smoke at www once Gate 1a is green.

## 3b) Feedback RLS / FORCE RLS migrations (ops confirm)

Migrations are on `main` but **prod apply is unconfirmed** while readiness RPC is missing:

- `supabase/migrations/20260919055925_feedback_service_grants_and_force_rls.sql`

After Gate 1b ledger apply, confirm remotely:

```sql
select relrowsecurity, relforcerowsecurity
from pg_class where oid = 'public.product_feedback'::regclass;
```

Expect both true; `service_role` has select/insert/delete; `authenticated` insert-only.

## After human steps — agent can finish

1. Confirm live revision == tip  
2. `npm run test:smoke` / CI production browser+smoke  
3. Agents authenticated E2E  
4. Learner-state save/reload E2E  
5. Durable rate-limit RPC confirmation  
