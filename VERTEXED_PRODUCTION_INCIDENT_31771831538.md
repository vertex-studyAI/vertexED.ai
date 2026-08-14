# VERTEXED PRODUCTION INCIDENT — RUN 31771831538

**Recovered:** 2026-08-14  
**Target:** `https://www.vertexed.app`  
**Monitor head:** `f177d87c4ee3f8daeb04cbded6c5be299cde4bae`  
**Expected deploy-relevant revision:** `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`  
**Monitor artifact:** `9208406163`  
**Artifact digest:** `sha256:f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b`

## Verified public behavior

The monitor attempted the same bounded smoke gate three times. Each attempt reached the public site and passed:
- `/api/health` returns `200` with `ok`;
- unknown API route returns `404`;
- homepage returns `200`;
- malformed waitlist email returns `400`;
- unauthenticated `/api/ask`, `/api/user-content`, and `/api/admin-status` return `401`;
- untrusted cross-origin API request returns `403`.

Each attempt failed the same identity check:

`/api/health revision missing does not match expected 8272b8cba0dab6e9a07ee6aa4f927ad9374de534`

The incident is therefore **not a broad public-site outage**. It is an **immutable deployment identity / health-contract failure**.

## Source contract

Current `api/_handlers/health.js` resolves the served revision from `VERCEL_GIT_COMMIT_SHA`, then `GITHUB_SHA`, then generated `BUILD_REVISION`. When present it emits the revision in JSON and `X-VertexED-Revision`.

Current `vercel.json` requires `VERTEXED_REQUIRE_BUILD_REVISION=1 ROLLUP_SKIP_NODEJS_NATIVE=true npm run build`, and `prebuild` runs `scripts/generate-build-revision.mjs`. The immutable revision-stamp health contract was merged before the expected deploy revision, in commit `cd50ee11c51a2f5ee337063a895d96053c2877ab`.

## Deployment evidence

GitHub records two Vercel production deployments for expected revision `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`; both are failures:

| GitHub deployment | Vercel environment | Vercel deployment | State |
|---|---|---|---|
| `5871407943` | `Production – vertex-ai` | `dpl_9tXgRq6WJJMosYRibYpqtmFatRZd` | **FAILURE** |
| `5871407566` | `Production – vertex-ed-ai` | `dpl_AaphmNGe2fEEmUNtTwWK4cbdwckv` | **FAILURE** |

The combined GitHub status for `8272b8c…` is failure from both Vercel contexts.

## Best-supported root-cause class

**The intended deploy-relevant revision failed in both configured Vercel production projects, while the public alias continues serving a deployment whose health function does not expose the immutable revision contract.**

That narrows the blocker but does not identify the precise Vercel build error. Authenticated Vercel build logs are outside the current connected surface. Do not guess whether the cause is dependency installation, project settings, environment variables, build-revision generation, quota, or another Vercel error.

## Exact next external action

With an authorized Vercel session inspect both failed deployments:

```bash
npx vercel inspect dpl_AaphmNGe2fEEmUNtTwWK4cbdwckv --logs
npx vercel inspect dpl_9tXgRq6WJJMosYRibYpqtmFatRZd --logs
```

Then:
1. retain the first causal build/runtime error from each deployment;
2. establish which Vercel project owns the canonical `www.vertexed.app` alias;
3. apply the minimum fix without weakening `VERTEXED_REQUIRE_BUILD_REVISION=1` or the smoke identity gate;
4. deploy one immutable revision;
5. require `/api/health` JSON and `X-VertexED-Revision` to equal that revision;
6. rerun the bounded production monitor;
7. only after deployment identity is GREEN, execute the authenticated golden journey/account-isolation/security gate.

## Claim-specific state

- **Source:** separately evaluated; this incident does not turn source RED.
- **Basic public smoke:** bounded checks above pass.
- **Immutable deployment identity:** **RED / FAILED**.
- **Production qualification:** **F — EXTERNALLY BLOCKED** on Vercel log/access + successful immutable redeploy.
- **Authenticated production journey:** not promoted and remains a separate gate.

Source or public-smoke success must not be collapsed into production GREEN.