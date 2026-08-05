# FinanceMeta Landing Recovery

Target repository: `build-the-future-11/FinanceMeta-Landing`

## Verified failure boundary

At target commit `f9265ce6ae94bf01048271ecfcf09d5be7059604`, the public shell points to `/src/main.tsx`, but that module does not mount React into the existing `#root` element. The shell also links `/index.css` even though the stylesheet lives at `src/index.css`. The committed Tailwind file is named `tailwind_config.js` instead of `tailwind.config.js` and contains invalid standalone `/` tokens.

The first user journey therefore fails before a visitor can reach the landing content or contact action.

## Recovery scope

The recovery patch:

- mounts React through `createRoot` and imports the real stylesheet;
- replaces stale Finance 4All copy with a responsive FinanceMeta landing experience;
- removes the particle stack to reduce runtime and dependency surface;
- adds Learn, Research, Build, Publish, Compete, Contribute, and Lead pathways;
- preserves the existing FinanceMeta contact route;
- adds persisted light/dark themes, skip navigation, focus states, and reduced-motion support;
- adds valid configuration and strict TypeScript;
- adds source-contract and production-output tests;
- adds desktop and mobile Chromium journey checks;
- adds a canonical GitHub Actions release gate.

## Certification result — 5 August 2026

Validation run `31019453260` checked out immutable execution commit `dfc1f69bdd2ee718c09e119757c0351b32278619` and immutable target commit `f9265ce6ae94bf01048271ecfcf09d5be7059604`. It passed:

- fresh lockfile generation and clean install;
- strict TypeScript;
- zero high-severity production dependency advisories;
- source release-contract tests;
- Vite production build;
- emitted CSS/JavaScript asset validation;
- desktop Chromium primary journey;
- Pixel 7 mobile emulation in Chromium;
- persisted theme behavior;
- keyboard focus and horizontal-overflow checks;
- generated dependency, build, and browser-report exclusion from the patches.

The final recovery and lockfile patches are stored beside `VALIDATION.md`, which records their SHA-256 digests and the tested production bundle size.

## Publication boundary

Direct branch creation in the target repository returned `403 Resource not accessible by integration`. The target repository has not changed and the site has not deployed.

The stored patches are therefore a certified publication artifact, not a deployment claim. Apply them only with authenticated maintainer access, run the same release gate, and certify the deployed production URL before announcing launch.

## Apply after access is restored

```bash
git clone https://github.com/build-the-future-11/FinanceMeta-Landing.git
cd FinanceMeta-Landing
git checkout f9265ce6ae94bf01048271ecfcf09d5be7059604
git switch -c fix/restore-financemeta-landing

git apply /path/to/finance-meta-landing-recovery.patch
git apply /path/to/finance-meta-landing-package-lock.patch
npm ci
npm run ci
npx playwright install --with-deps chromium
npm run test:e2e
```

Commit, open a pull request, require the release gate, and deploy only after the production URL passes the same browser journey.
