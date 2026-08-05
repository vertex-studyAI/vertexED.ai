# React 19 and React Router 8 migration

## Why this migration exists

VertexED's previous `react-router-dom@6.30.4` production tree reports two moderate React Router advisories. A direct React Router 7 migration was tested and rejected because the available v7 targets occupied overlapping high-severity advisory ranges. The supported path is a coordinated React 19, React Router 8, and Vite 7 migration.

The production audit threshold remains unchanged. No advisory is suppressed, ignored, or overridden.

## Supported baseline

The migration pins the compatibility-sensitive packages that were validated together:

- Node `>=22.22.0 <23`
- npm `10.9.8`
- React `19.2.7`
- React DOM `19.2.7`
- React Router `8.3.0`
- Vite `7.3.6`
- `@vitejs/plugin-react` `5.2.0`
- `react-helmet-async` `3.0.0`
- `react-markdown` `10.1.0`
- `remark-gfm` `4.0.1`
- `remark-math` `6.0.0`
- `rehype-katex` `7.0.1`

React Router 8 removes the `react-router-dom` package. VertexED's declarative router imports therefore move to `react-router` without changing the route tree, redirects, protected-route rules, or navigation behavior.

## Compatibility changes

The code migration is intentionally narrow:

1. Replace `react-router-dom` imports with `react-router`.
2. Replace four legacy global `JSX.Element` annotations with `React.JSX.Element`.
3. Move React Markdown prose classes from the removed top-level `className` prop to explicit wrapper elements.
4. Replace React Markdown's removed `inline` code-renderer prop with separate `pre` and `code` renderers.
5. Align the Markdown plugins on one modern Unified/vfile type generation.

No API handler, Supabase policy, environment variable, route definition, authentication rule, or product feature is intentionally changed.

## Validation evidence

The migration was generated twice in clean GitHub-hosted Node 22.23.1 environments. The final rebuild started from main commit `ba8b6fb485182f86950438cfcc87653c7e417fc5` and passed:

- deterministic `npm ci`;
- `npm audit --omit=dev --audit-level=high` with zero production vulnerabilities;
- scoped lint;
- TypeScript;
- Vercel function validation;
- all application tests;
- deterministic evaluation tests;
- the production Vite build;
- a local migrated preview;
- the existing Playwright route and authentication regression suite across desktop, tablet, and mobile viewports.

Evidence is retained in GitHub Actions run `31018480538`, artifact `8935613779`, with SHA-256 digest `d6e4ecf61c4153178002ef8520091394d9ccb78496504712ce75c1f43d0d370a` through August 19, 2026.

The pull request's canonical CI must also pass against GitHub's current merge ref before merge. Vercel preview failures that point only to the documented account `build-rate-limit` are an external deployment-capacity blocker rather than an application build failure.

## Review checklist

- Confirm `react-router-dom` no longer appears in source imports or the lockfile.
- Confirm the package versions match the validated baseline.
- Confirm route definitions and protected-route behavior are unchanged.
- Confirm both Markdown wrappers preserve their existing prose classes.
- Confirm the Answer Reviewer still styles inline and block code.
- Confirm the production audit remains clean at high and critical severity.
- Confirm canonical CI and browser-production checks pass on the current merge ref.

## Rollback

If a post-merge regression is attributable to this migration:

1. Revert the migration merge commit as one unit.
2. Redeploy the last verified production commit.
3. Run the public smoke suite and browser-production certification.
4. Record the failed route, viewport, browser evidence, and dependency versions in issue #59.
5. Do not restore a React Router 7 candidate or lower the audit threshold as a workaround.

## Official references

- React versions: https://react.dev/versions
- React 19 upgrade guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- React Router changelog: https://reactrouter.com/start/start/changelog
- Vite releases: https://vite.dev/releases
- React Markdown changelog: https://github.com/remarkjs/react-markdown/blob/main/changelog.md
