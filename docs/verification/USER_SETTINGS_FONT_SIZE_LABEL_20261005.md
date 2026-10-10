# User Settings font-size label verification — 2026-10-05

## Scope

The Appearance & Accessibility font-size control on `UserSettings` had visible text but no programmatic label association. This patch pairs the visible `label` with the `select` through `htmlFor="settings-font-size"` and `id="settings-font-size"`.

## Source boundary

- Repository: `vertex-studyAI/vertexED.ai`
- Exact base: `b96286ae19f665f9e5eef8a671258c98b7b73a16`
- Base blob for `src/pages/UserSettings.tsx`: `67fd268c7ad575e31406919a46a028fa673972ad`

## Local regression

Before the patch, `node --test tests/user-settings-font-size-label.test.mjs` failed 1/1 because no explicit label association existed. After the patch, the same command passed 1/1.

This is a local source-contract regression only. It does not certify browser accessibility-tree output, screen-reader behavior, preview deployment, authenticated flows, or production health.

## Protected boundaries

No deployment, merge, DNS, authentication, database, migration, secret, production-provider, or release-gate change is included.
