# FinanceMeta Landing Recovery

Target repository: `build-the-future-11/FinanceMeta-Landing`

## Verified failure boundary

At target commit `f9265ce6ae94bf01048271ecfcf09d5be7059604`, the public entry shell points to `/src/main.tsx`, but that module defines `App` without mounting it into the existing `#root` element. The shell also links `/index.css` even though the stylesheet lives at `src/index.css`. The committed Tailwind file is misnamed and contains invalid standalone `/` tokens.

The first user journey therefore fails before a visitor can reach the landing content or contact action.

## Recovery scope

The certified patch:

- mounts React through `createRoot` and imports the real stylesheet;
- replaces stale Finance 4All copy with a responsive FinanceMeta landing experience;
- removes Tailwind, PostCSS, Framer Motion, and the particle stack from this small static runtime;
- adds Learn, Research, Build, Publish, Compete, Contribute, and Lead pathways;
- preserves the existing FinanceMeta contact address;
- adds persisted light/dark themes, skip navigation, focus states, and reduced-motion support;
- adds strict TypeScript, source-contract tests, and production-output tests;
- adds desktop and Android-mobile Chromium journey checks;
- adds a canonical GitHub Actions release gate to the target patch.

## Certification result — 5 August 2026

Validation run `31019117025` checked out the immutable target commit above, applied the final plain-source recovery, regenerated the dependency lock, and passed:

- strict TypeScript;
- high-severity production dependency audit with zero vulnerabilities;
- eight source and release-contract tests;
- Vite production build;
- two emitted CSS/JavaScript asset tests;
- three desktop Chromium journeys;
- three Android-mobile Chromium journeys;
- persisted theme behavior;
- keyboard-focus and horizontal-overflow checks.

The temporary execution workflow, source overlay, and obsolete encoded payload have been removed. The durable bundle now contains only this guide, the source patch, the generated lockfile patch, and `VALIDATION.md` with SHA-256 digests and exact execution evidence.

## Publication boundary

Direct branch creation in the target repository returned `403 Resource not accessible by integration`. The connected GitHub App can write to `vertex-studyAI` but is not installed for the personal `build-the-future-11` owner account.

The target repository and public site were not modified by this certification. Publication still requires installing the GitHub App for the repository owner or applying the two patches with authenticated maintainer access.

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

Commit the result, open a pull request, require the release gate, then deploy only after the production URL passes the same browser journeys.
