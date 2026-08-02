# FinanceMeta Release Gate Package

**Target repository:** `build-the-future-11/finance4all-global-reach`  
**Target base commit:** `fbdd503223edc5b1780509720391083f485a4a85`  
**Prepared:** 2 August 2026

## Objective

Replace FinanceMeta's placeholder truth assertion with a release gate tied to real application behavior.

## Prepared implementation

The patch at `portfolio/patches/finance4all-release-gate.patch` adds:

- a canonical `npm run ci` command;
- application and Node/Vite TypeScript checks;
- a high-severity production dependency audit;
- real mapper regression tests for profiles, essays, and events;
- a GitHub Actions workflow using Node 22 and Node 24-based action runtimes;
- a durable release and rollback checklist;
- removal of `src/test/example.test.ts`, whose only assertion is `expect(true).toBe(true)`.

## Verified repository facts

- The canonical repository is public and readable.
- Main is currently `fbdd503223edc5b1780509720391083f485a4a85`.
- The application is React, Vite, Supabase, Vitest, and TypeScript.
- `package.json` has build, lint, and test commands but no typecheck, security audit, or one-command release gate.
- No GitHub Actions workflow was discovered.
- The existing test suite contains a placeholder test that cannot detect product regressions.

## Current blocker

The GitHub App is installed on `vertex-studyAI`, not on the personal account `build-the-future-11` that owns FinanceMeta. Creating `percy/release-gate` returned HTTP 403: `Resource not accessible by integration`.

The current execution runtime also lacks:

- an authenticated `gh` executable;
- GitHub push credentials;
- outbound Git/npm network access.

Therefore the patch is **prepared and documented, not executed or verified**.

## Publish sequence

After installing the GitHub App on `build-the-future-11` with repository write and Actions access:

```bash
git checkout main
git pull --ff-only
git checkout -b percy/release-gate
git apply portfolio/patches/finance4all-release-gate.patch
npm ci
npm run ci
git add package.json .github/workflows/ci.yml src/test docs/RELEASE_GATE.md
git commit -m "ci: establish canonical FinanceMeta release gate"
git push -u origin percy/release-gate
```

The patch path above refers to the copy hosted temporarily in the portfolio control center; copy it into the FinanceMeta checkout before applying.

## Merge conditions

Do not merge until:

- the exact branch head passes `npm run ci`;
- all high or critical production dependency findings are resolved;
- the Vercel preview reaches Ready;
- the landing page and portal load;
- authentication and protected-route behavior are tested with disposable accounts.
