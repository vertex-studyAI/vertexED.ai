# Vercel build quota guard

## Problem

Both connected VertexED Vercel projects began returning `upgradeToPro=build-rate-limit` while the repository was receiving many parallel documentation, research, migration-evidence, and operations commits.

Vercel's published Hobby limits allow one concurrent build and 32 builds per rolling 3,600-second window. Hitting that hourly limit requires waiting for the window to reset or moving the project to a plan with higher limits. A Git-triggered build is therefore a scarce release resource and should not be spent on commits that cannot change the deployed application.

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
- `package.json`, `package-lock.json`, `.npmrc`, `index.html`, `components.json`, or `vercel.json`;
- root Vite, TypeScript, Tailwind, PostCSS, or ESLint configuration.

A mixed commit also builds whenever at least one runtime-relevant file changed.

## Changes that skip a build

A deployment is skipped when every changed file is non-runtime, including:

- `docs/` and Markdown-only documentation;
- `portfolio/` research, teaching, and recovery artifacts;
- `.percy/` execution state;
- GitHub Actions-only changes;
- Supabase migration records that do not alter the Vercel application bundle;
- test-only, E2E-only, and evaluation-only changes.

GitHub CI still validates these commits. Only the redundant Vercel build is skipped.

## Validation

`tests/vercel-ignore-build.test.mjs` certifies runtime paths, root build configuration, documentation-only changes, mixed commits, and path normalization. The test is part of the canonical `npm test` and `npm run ci` gates.

## Recovery procedure

When Vercel reports the hourly build-rate limit:

1. Stop creating no-op deployment commits.
2. Allow the published 3,600-second rate-limit window to reset.
3. Confirm no unrelated build is occupying the single Hobby concurrency slot.
4. Trigger one production deployment from the latest verified `main` commit.
5. Record both project deployment identifiers and the production commit.
6. Run the `Production Health Monitor` and require the dependency-readiness contract to pass before merging the permanent readiness assertion in PR #58.

Do not weaken the health contract to match a stale deployment. Do not claim a deployment succeeded from a green repository test alone.
