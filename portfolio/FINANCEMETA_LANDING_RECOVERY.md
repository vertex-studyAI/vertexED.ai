# FinanceMeta Landing Recovery

Target repository: `build-the-future-11/FinanceMeta-Landing`

## Verified failure boundary

The current public entry shell points to `/src/main.tsx`, but that module defines and exports `App` without mounting it into the existing `#root` element. The shell also links `/index.css` even though the stylesheet lives at `src/index.css`. The committed Tailwind file is named `tailwind_config.js` instead of `tailwind.config.js` and contains invalid standalone `/` tokens.

The first user journey therefore fails before a visitor can reach the landing content or contact action.

## Recovery scope

The recovery patch:

- mounts React through `createRoot` and imports the real stylesheet;
- replaces stale Finance 4All copy with a responsive FinanceMeta landing experience;
- removes the particle stack to reduce runtime and dependency surface;
- adds Learn, Research, Build, Publish, Compete, Contribute, and Lead pathways;
- preserves the existing FinanceMeta contact address;
- adds persisted light/dark themes, skip navigation, focus states, and reduced-motion support;
- adds valid Tailwind, PostCSS, and strict TypeScript configuration;
- adds source-contract and production-output tests;
- adds desktop/mobile Playwright journey checks;
- adds a canonical GitHub Actions release gate.

## Publication boundary

Direct branch creation in the target repository returned `403 Resource not accessible by integration`. The connected GitHub App can write to `vertex-studyAI` but is not installed for the personal `build-the-future-11` owner account.

This branch uses GitHub Actions as an isolated execution harness: it checks out the public target, applies the exact patch, regenerates the dependency lock, runs the release gate and browser certification, and records durable evidence. Passing validation does not mean the target repository has changed or the site has deployed.

## Apply after access is restored

```bash
git clone https://github.com/build-the-future-11/FinanceMeta-Landing.git
cd FinanceMeta-Landing
git checkout -b fix/restore-financemeta-landing

git apply /path/to/finance-meta-landing-recovery.patch
git apply /path/to/finance-meta-landing-package-lock.patch
npm ci
npm run ci
npx playwright install chromium
npm run test:e2e
```

Commit, open a pull request, require the release gate, then deploy only after the production URL passes the same browser journey.
