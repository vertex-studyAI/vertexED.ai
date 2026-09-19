# VX-204 — Production auth + account isolation checklist

Prepared: 2026-09-19 (agent). **Blocked on Gate 1a** (`www.vertexed.app` TLS) for canonical-domain certification. Can rehearse against `https://vertex-ed-ai.vercel.app` only as a **non-canonical** interim surface.

## Preconditions

1. Gate 1a: `https://www.vertexed.app/api/health` HTTP 200 + valid TLS.
2. Gate 1b: `?readiness=1` not `degraded` / no `readiness_rpc_missing`; `durableRateLimiting=true`.
3. Deployed revision equals intended deploy-relevant SHA (`node scripts/vercel-ignore-build.mjs --print-latest-runtime-revision`).
4. Two disposable learner accounts (A/B) on production Supabase; no shared passwords in tickets.

## Exact verification sequence

1. **Signup / login / logout / recovery** for account A on the certified host.
2. **Create** one durable artifact as A (notes or learner-state write). Confirm server 2xx.
3. **Reload** and retrieve the same artifact as A.
4. As account B (second browser profile / private window): attempt read/update/delete of A's resource IDs.
5. Expect **401/403/404** without leakage of A's content. Retain redacted HAR / Playwright traces.
6. **Delete** account A (settings confirm path). Confirm artifact gone and session invalid.
7. Run `EXPECTED_VERTEXED_REVISION=<sha> npm run test:smoke` and authenticated golden against the certified host.

## Agent-prepared surfaces

- Probe: `npm run probe:gates`
- Live base resolver (while www down): `npm run resolve:live-app-base`
- Smoke: `SMOKE_BASE_URL=… EXPECTED_VERTEXED_REVISION=… npm run test:smoke`
- Golden: `npm run test:e2e:authenticated-golden` (local mocked auth — not a substitute for VX-204)

## Do not claim VX-204 complete until

Canonical **www** host passes steps 1–7 on one immutable revision with retained evidence.
