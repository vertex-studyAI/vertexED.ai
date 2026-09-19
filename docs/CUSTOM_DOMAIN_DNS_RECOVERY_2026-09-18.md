# Custom-domain DNS recovery — 2026-09-18

## Verified failure boundary

| Check | Result |
|---|---|
| `www.vertexed.app` HTTPS | TLS resets before application HTTP (`SSL_ERROR_SYSCALL` / `ECONNRESET`) |
| DNS A for `www.vertexed.app` | `104.219.250.37` (Namecheap), `2.59.170.20` (Worldstream) — **not** Vercel |
| TCP/443 to both A records | Succeeds |
| TLS handshake | EOF / no peer certificate |
| `https://vertex-ed-ai.vercel.app/api/health` | HTTP 200, alive contract |
| `https://vertex-ai-rho.vercel.app/` | HTTP 200 HTML (app shell) |
| Owning Vercel CLI account `build-the-future-11` | **No** VertexED projects listed under that team |

This is a **deployment/DNS/TLS ownership** failure, not an application-source rollback case.
Canonical tracker: GitHub issue **#44** (and monitor **#652**).

## Do not

- Roll back application source to “fix” the domain
- Remove the Vercel ignored-build guard
- Create sentinel/no-op commits to force deploys
- Weaken TLS / smoke / revision contracts
- Guess which of the two Vercel projects owns `www.vertexed.app` without dashboard proof

## Owner actions (human + registrar/Vercel access required)

1. **Prove ownership** in the Vercel dashboard for exactly one project:
   - `pratyush-vel-shankars-projects/vertex-ai`, or
   - `ryan-gomezs-projects-5a5ab995/vertex-ed-ai`
2. In that project, open **Domains** for `www.vertexed.app` and `vertexed.app`.
3. Copy the **exact** DNS records Vercel shows (usually a CNAME to `cname.vercel-dns.com` or the current Vercel-documented targets).
4. In **Namecheap** (current A targets are Namecheap/Worldstream parking-class addresses), remove conflicting A/AAAA/parking records for `www` and apex.
5. Publish only the Vercel-required records. Wait for propagation.
6. Confirm Vercel shows a valid certificate for `www.vertexed.app`.
7. Re-run unchanged gates:
   - Production Health Monitor
   - Production Transport Diagnostics
   - `EXPECTED_VERTEXED_REVISION=<deploy-relevant-sha> npm run test:smoke`
8. Close #44 only when application HTTP works on `www.vertexed.app` **and** the served immutable revision matches the intended deploy-relevant SHA.

## Separate gate — dependency readiness (VX-205 adjacent)

Even when a Vercel default host serves `/api/health` alive, deep readiness can still be **degraded**. Verified 2026-09-18 against `https://vertex-ed-ai.vercel.app/api/health?readiness=1`:

| Check | Result |
|---|---|
| Liveness `/api/health` | HTTP 200 `alive` on tip `049dcfe…` |
| Readiness `?readiness=1` | HTTP 503 `degraded` |
| `databaseError` | `readiness_rpc_missing` (stable operator token; underlying PostgREST schema-cache miss for `public.vertexed_readiness()`) |
| `durableRateLimiting` | `false` → `WAITLIST_RATE_LIMIT_SALT` missing in that project env |
| DB capability flags | all `false` (RPC never succeeded) |

### Supabase migration gate (authorized access required)

Apply the repository migrations that define/replace `public.vertexed_readiness()` on the linked production project (see, in order of evolution):

- `supabase/migrations/20260906101155_learner_state_and_telemetry.sql`
- `supabase/migrations/20260906112000_batch_state_and_privileges.sql`
- `supabase/migrations/20260908165433_exam_session_readiness.sql`
- `supabase/migrations/20260909103238_harden_waitlist_tokens_and_timestamps.sql`

Then set `WAITLIST_RATE_LIMIT_SALT` in the owning Vercel project env, redeploy if needed, and re-probe:

```bash
curl -sS 'https://vertex-ed-ai.vercel.app/api/health?readiness=1'
```

Expect `status` not `degraded` and `databaseError` absent once the RPC and salt are present. Do not weaken smoke readiness assertions to greenwash this.

## Repository-side note (this pass)

`vercel.json` host redirects must **not** catch-all `/api/*` from preview/apex hosts onto `www.vertexed.app`. Otherwise a healthy Vercel deployment becomes undiagnosable whenever custom-domain TLS is down. HTML canonicalization to `www` may remain.

## Re-probe note — 2026-09-19 (marathon)

| Check | Result |
|---|---|
| `www.vertexed.app` | Still TLS fail before HTTP; A=`2.59.170.20`,`104.219.250.37` |
| `vertex-ed-ai` shallow health | alive; observed revision `60cd8c44…` while `origin/main` tip advanced (deploy lag / Vercel rate-limit) |
| `/api/agents` on ed-ai | **401** `LIVE_AUTH_REQUIRED` (route deployed) |
| Gate 1b readiness | still `readiness_rpc_missing`; `durableRateLimiting=false` |

CI browser/smoke now resolve a live app base (`scripts/resolve-live-app-base.mjs`) so www TLS does not drown app certification. Production Health Monitor still targets www for Gate 1a truth.

