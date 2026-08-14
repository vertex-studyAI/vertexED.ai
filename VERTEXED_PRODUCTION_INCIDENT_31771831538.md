# VERTEXED PRODUCTION INCIDENT — RUN 31771831538

**Recovered:** 2026-08-14  
**Target:** `https://www.vertexed.app`  
**Monitor head:** `f177d87c4ee3f8daeb04cbded6c5be299cde4bae`  
**Expected deploy-relevant revision:** `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`  
**Monitor artifact:** `9208406163`, digest `sha256:f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b`

## Verified symptom

All three bounded monitor attempts reached the public site. The following public boundaries passed every attempt:

- `GET /api/health` returned `200` with `ok`;
- API router returned `404` for a nonexistent route;
- `GET /` returned `200`;
- waitlist rejected invalid email with `400`;
- `/api/ask` required authentication (`401`);
- `/api/user-content` required authentication (`401`);
- `/api/admin-status` required authentication (`401`);
- untrusted cross-origin `/api/health` was blocked with `403`.

The repeated failure was exact:

`/api/health revision missing does not match expected 8272b8cba0dab6e9a07ee6aa4f927ad9374de534`

Therefore the production incident is **not** classified as a broad public-site outage. It is an **immutable deployment identity / health-contract failure**.

## Why `revision missing` is meaningful

Current source implements deployment identity in `api/_handlers/health.js` by selecting the first valid value from:

1. `VERCEL_GIT_COMMIT_SHA`
2. `GITHUB_SHA`
3. generated `BUILD_REVISION`

When a revision exists, the handler emits it in both the JSON `revision` field and `X-VertexED-Revision` header.

Current `vercel.json` runs:

`VERTEXED_REQUIRE_BUILD_REVISION=1 ROLLUP_SKIP_NODEJS_NATIVE=true npm run build`

and the `prebuild` lifecycle runs `scripts/generate-build-revision.mjs`. With `VERTEXED_REQUIRE_BUILD_REVISION=1`, a deploy-relevant build is intended to fail closed if no immutable revision can be resolved.

The revision-stamp/health fallback was merged in commit `cd50ee11c51a2f5ee337063a895d96053c2877ab` on 2026-08-12 before the expected deploy revision.

## Deployment evidence

GitHub records two Vercel production deployment objects for expected revision `8272b8cba0dab6e9a07ee6aa4f927ad9374de534` at approximately 2026-08-12 14:40 UTC:

- deployment `5871407943` — environment `Production – vertex-ai` — **FAILURE** — Vercel deployment `dpl_9tXgRq6WJJMosYRibYpqtmFatRZd`
- deployment `5871407566` — environment `Production – vertex-ed-ai` — **FAILURE** — Vercel deployment `dpl_AaphmNGe2fEEmUNtTwWK4cbdwckv`

The combined commit status for `8272b8c…` is therefore failure from both Vercel contexts.

## Current best-supported root-cause class

**The intended deploy-relevant revision failed in both configured Vercel production projects, and the public alias continues serving a deployment whose health function does not expose the immutable revision contract.**

This is stronger than the prior generic label `BLOCKED_EXTERNAL_OR_STALE_DEPLOY` but it does **not** establish the exact Vercel build-error line, because authenticated Vercel build logs are not available through the current connected surface.

Do not guess whether the failed builds were caused by dependencies, environment variables, build-revision generation, project settings, quota, or another Vercel error until the exact logs are inspected.

## Exact next action

Using an authorized Vercel session, inspect both failed deployments:

- `npx vercel inspect dpl_AaphmNGe2fEEmUNtTwWK4cbdwckv --logs`
- `npx vercel inspect dpl_9tXgRq6WJJMosYRibYpqtmFatRZd --logs`

Then:

1. record the first causal build/runtime error for each project;
2. determine which Vercel project owns the canonical `www.vertexed.app` production alias;
3. fix the minimum deployment/configuration cause without weakening `VERTEXED_REQUIRE_BUILD_REVISION=1` or the smoke check;
4. deploy one immutable revision;
5. require `/api/health` JSON and `X-VertexED-Revision` to equal that revision;
6. rerun the production monitor;
7. only after identity is GREEN, run the authenticated golden journey and security/account-isolation verification.

## State

- **Source:** remains separately evaluated.
- **Public basic smoke:** bounded checks above pass.
- **Exact deployment identity:** **RED / FAILURE**.
- **Production qualification:** **F — EXTERNALLY BLOCKED** on Vercel deployment-log/access + successful immutable redeploy.
- **Authenticated production journey:** not promoted; remains a separate gate.

No source-only or public-smoke success should be relabeled as production GREEN.