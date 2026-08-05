# Bu1LD Production Deployment Repair Runbook

## Incident this runbook addresses

Read-only browser certification against `https://thebu1ld.com` reproduced two production defects on 5 August 2026:

- React production hydration error #418 on every landing-page load in desktop and mobile Chromium;
- live copy and programme links that do not match immutable source commit `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.

HTTP availability remains healthy. Treat this as a deployment identity, SSR/client asset consistency, or cache problem until a clean immutable deployment proves otherwise. Issue #84 owns the incident. Draft PR #79 is the red browser gate and must not be weakened.

## Safety rules

- Never deploy from a dirty worktree, floating branch, or unrecorded commit.
- Never bypass `bun run release:prod`.
- Never put service-role, Resend, digest, database, or Cloudflare credentials in GitHub comments, logs, command history, `VITE_*` variables, or tracked files.
- Do not delete or mutate user data to make a release check pass.
- Record the active deployment before changing traffic.
- Roll back if the browser contract reports hydration, route, copy, auth-control, or overflow regressions.

## Required access

Use an authenticated checkout of `ryangomez010/bu1ld-landing` and a Cloudflare token that can deploy the `bu1ld-landing` Worker. The strict gate also requires the production values enforced by `scripts/release-readiness.mjs`:

Public build/runtime values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_EMAIL_ENDPOINT`

Server-only values:

- `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `DIGEST_API_SECRET`
- `CLOUDFLARE_API_TOKEN`

Optional targeted cache purge:

- `CLOUDFLARE_ZONE_ID`
- `BU1LD_PURGE_CACHE=1`

The strict gate rejects service-role, Resend, and digest secrets with a `VITE_` prefix.

## Phase 1 — select and record one immutable release

```bash
cd /path/to/bu1ld-landing
git fetch --all --tags --prune
git checkout daa80c1124b2a6d7d09b7669e04d29e50cffcbbe
git status --short --branch
git rev-parse HEAD
```

The known source commit above independently passed 152 tests, lint, client and SSR builds, copy/security scans, migrations through phase 33, and release-artifact checks in workflow run `31021241912`. It is not automatically production-ready: live secrets, schema, RLS, email, and deployed journeys still require certification.

When a newer commit is chosen, update `BU1LD_EXPECTED_SHA` and independently rerun the source gate before deployment.

## Phase 2 — fail-closed dry run

From the VertexED portfolio control repository:

```bash
BU1LD_REPO_PATH=/path/to/bu1ld-landing \
BU1LD_EXPECTED_SHA=daa80c1124b2a6d7d09b7669e04d29e50cffcbbe \
bash portfolio/scripts/bu1ld-deployment-repair.sh
```

The dry run verifies the exact commit and clean worktree, installs the frozen lockfile, executes `bun run release:check`, runs the eight-route public HTTP smoke contract, and writes timestamped evidence. It performs no deployment or cache purge.

Stop if any check fails.

## Phase 3 — identify the current stable rollback point

Before deployment, capture:

```bash
cd /path/to/bu1ld-landing
npx wrangler --version
npx wrangler deployments list
```

Store the currently active stable Worker version ID with the release evidence. Cloudflare Worker deployments point traffic to immutable versions; `wrangler rollback <VERSION_ID>` can restore a prior version. A rollback does not revert external storage or schema changes, so confirm database compatibility before using it.

## Phase 4 — add durable build identity

Before declaring the incident closed, expose the running Worker version in a health response or non-sensitive response header.

Cloudflare supports a version metadata binding. Add this to `wrangler.jsonc` in the target repository and consume it server-side:

```jsonc
"version_metadata": {
  "binding": "CF_VERSION_METADATA"
}
```

Return only non-sensitive metadata such as Worker version ID/tag/timestamp and the source commit selected for the build. Do not expose environment variables or secrets.

Completion evidence should make it possible to answer both:

- Which Git commit produced the build?
- Which Cloudflare Worker version is serving this request?

## Phase 5 — strict production gate and atomic deployment

After exporting the required production values into the deployment shell or approved secret store:

```bash
BU1LD_REPO_PATH=/path/to/bu1ld-landing \
BU1LD_EXPECTED_SHA=daa80c1124b2a6d7d09b7669e04d29e50cffcbbe \
BU1LD_EXECUTE_DEPLOY=1 \
bash portfolio/scripts/bu1ld-deployment-repair.sh
```

The runner:

1. reruns the immutable source and HTTP preflight;
2. records active deployments;
3. runs `bun run release:prod`, including live Supabase schema and RLS verification;
4. invokes the repository's `bun run deploy:cf` command;
5. records the new active deployment;
6. reruns the public HTTP contract.

The target deploy script builds once and invokes local Wrangler. Cloudflare Workers creates a new version and deploys it as one operation. Do not separately upload stale client assets or reuse a prior `dist` directory.

## Phase 6 — targeted cache purge only when needed

Cloudflare recommends purging individual URLs rather than purging everything. If the new Worker version is active but canonical HTML still serves stale markup, rerun with:

```bash
BU1LD_REPO_PATH=/path/to/bu1ld-landing \
BU1LD_EXPECTED_SHA=daa80c1124b2a6d7d09b7669e04d29e50cffcbbe \
BU1LD_EXECUTE_DEPLOY=1 \
BU1LD_PURGE_CACHE=1 \
CLOUDFLARE_ZONE_ID=<zone-id> \
bash portfolio/scripts/bu1ld-deployment-repair.sh
```

The runner purges only the eight certified public URLs. Preserve the purge API response in evidence. Do not use purge-everything as a default incident response.

## Phase 7 — mandatory browser certification

A successful deploy command or HTTP 200 is insufficient. From the control repository:

```bash
npm ci
npx playwright install --with-deps chromium
BU1LD_BASE_URL=https://thebu1ld.com \
  npx playwright test --config=portfolio/bu1ld/playwright.config.ts
```

Require all desktop and Pixel 7 Chromium journeys to pass with:

- no uncaught hydration/runtime errors;
- primary project and evidence CTAs working;
- programme and auth handoffs matching the selected source commit;
- all eight canonical public routes hydrated;
- visible keyboard skip navigation;
- no horizontal overflow.

Then complete the authenticated visitor, applicant, contributor, reviewer, lead, and admin checks from issue #16 using separated disposable accounts.

## Rollback

If post-deploy certification fails:

```bash
cd /path/to/bu1ld-landing
npx wrangler rollback <STABLE_VERSION_ID> \
  --message "Rollback after failed Bu1LD production certification"
```

After rollback:

1. record the new deployment list;
2. rerun the eight-route HTTP smoke;
3. rerun the browser contract;
4. confirm the deployed build/version marker;
5. attach evidence to issue #84.

Do not close the incident merely because rollback succeeded. Preserve the failed version ID, source commit, logs, traces, and exact assertion.

## Completion record

Issue #84 can close only when the repository records:

- selected source commit;
- Cloudflare version before and after deployment;
- strict `release:prod` pass;
- deployment and any targeted purge response;
- eight-route HTTP pass;
- desktop/mobile browser pass with zero hydration errors;
- visible build identity;
- rollback version and owner;
- remaining authenticated-role or infrastructure gaps.

## Primary operational references

- Cloudflare Workers versions and deployments: `https://developers.cloudflare.com/workers/versions-and-deployments/`
- Cloudflare Workers rollback: `https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/`
- Cloudflare version metadata binding: `https://developers.cloudflare.com/workers/runtime-apis/bindings/version-metadata/`
- Cloudflare cache purge guidance: `https://developers.cloudflare.com/cache/how-to/purge-cache/`
- Cloudflare Workers static asset deployment: `https://developers.cloudflare.com/workers/static-assets/`
