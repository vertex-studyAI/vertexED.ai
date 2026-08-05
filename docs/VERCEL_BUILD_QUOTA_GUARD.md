# Vercel build quota guard

## Problem

Both connected VertexED Vercel projects began returning `upgradeToPro=build-rate-limit` while the repository was receiving many parallel documentation, research, migration-evidence, and operations commits.

Vercel publishes three relevant Hobby constraints:

- one concurrent build;
- 32 builds per rolling 3,600-second window;
- 100 deployments per rolling 86,400-second window.

The observed `api-deployments-free-per-day` failure is the daily deployment limit, so recovery can require waiting for the 24-hour window rather than only the hourly build window. A Git-triggered deployment is therefore a scarce release resource and should not be spent on commits that cannot change the deployed application.

Official references:

- https://vercel.com/docs/limits
- https://vercel.com/docs/builds/build-queues
- https://vercel.com/docs/project-configuration/vercel-json#ignorecommand

## Repository-controlled behavior

`vercel.json` runs:

```text
node scripts/vercel-ignore-build.mjs
```

Vercel's ignored-build contract is intentionally inverted:

- exit code `0` skips the build;
- exit code `1` continues the build.

The script builds conservatively whenever Git history cannot be inspected or the changed-file list is empty.

## Changes that continue a build

A deployment continues when a commit changes:

- application code under `src/`;
- serverless API code under `api/`;
- public runtime assets under `public/`;
- build and release scripts under `scripts/`;
- Supabase migrations, functions, or project configuration under `supabase/`;
- `package.json`, `package-lock.json`, `.npmrc`, `index.html`, `components.json`, or `vercel.json`;
- root Vite, TypeScript, Tailwind, PostCSS, or ESLint configuration.

Supabase changes continue builds even when they do not alter the frontend bundle. They can change the production data contract, authorization behavior, or release-verification requirements and therefore must receive a deployment preview rather than being treated as documentation.

A mixed commit also builds whenever at least one runtime-relevant file changed.

## Changes that skip a build

A deployment is skipped when every changed file is non-runtime, including:

- `docs/` and Markdown-only documentation;
- `portfolio/` research, teaching, and recovery artifacts;
- `.percy/` execution state;
- GitHub Actions-only changes;
- test-only, E2E-only, and evaluation-only changes.

GitHub CI still validates these commits. Only the redundant Vercel deployment is skipped.

## Validation

`tests/vercel-ignore-build.test.mjs` certifies runtime, API, Supabase, root build-configuration, documentation-only, mixed-commit, and path-normalization behavior. The test is part of the canonical `npm test` and `npm run ci` gates.

## Recovery procedure

When Vercel reports a rate limit:

1. Record whether the error names the hourly build limit or `api-deployments-free-per-day`.
2. Stop creating no-op deployment commits.
3. Allow the applicable rolling window to reset: up to one hour for the build limit or up to 24 hours for the daily deployment limit.
4. Confirm no unrelated build is occupying the single Hobby concurrency slot.
5. Trigger one production deployment from the latest verified `main` commit.
6. Record both project deployment identifiers and the production commit.
7. Run the `Production Health Monitor` and require the dependency-readiness contract to pass before merging the permanent readiness assertion in PR #58.

Do not weaken the health contract to match a stale deployment. Do not claim a deployment succeeded from a green repository test alone.
