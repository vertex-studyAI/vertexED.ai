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
| Liveness `/api/health` | HTTP 200 `alive` |
| Readiness `?readiness=1` | HTTP 503 `degraded` |
| `databaseError` | `PGRST202` (PostgREST: function not in schema cache) |
| `durableRateLimiting` | `false` → `WAITLIST_RATE_LIMIT_SALT` missing in that project env |
| DB capability flags | all `false` (RPC never succeeded) |

Source migrations define `public.vertexed_readiness()` (see `supabase/migrations/*`). Applying those migrations / setting the rate-limit salt requires authorized Supabase + Vercel env access. Do not weaken smoke readiness assertions to greenwash this.

## Repository-side note (this pass)

`vercel.json` host redirects must **not** catch-all `/api/*` from preview/apex hosts onto `www.vertexed.app`. Otherwise a healthy Vercel deployment becomes undiagnosable whenever custom-domain TLS is down. HTML canonicalization to `www` may remain.
