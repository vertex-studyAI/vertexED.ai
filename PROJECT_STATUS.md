# Project Status

**Evidence date:** 2026-09-02

**Branch:** `codex/vertexed-publication-readiness`

**Release truth:** the local source candidate is verified; the canonical production deployment is not.

## Current objective

Finish VertexED as a dependable private-beta learning product: a student should be able to gain approved access, establish an account, create a curriculum-aware plan, produce and save study material, practise, receive evidence-bound feedback, and resume work later without crossing account boundaries.

## Working

- Private-beta waitlist, approved-link and team-invite account paths with server-side validation.
- Supabase session handling, onboarding gates, logout, recovery routing and account-scoped browser storage.
- Dashboard study loop connecting planning, notes, quizzes, review and saved work.
- Study Planner with local persistence, cloud-artifact synchronization and accessible task editing.
- Notetaker, flashcards, quiz generation and graded review with deterministic degraded behavior when an AI provider is unavailable.
- Paper Maker, timed mock handoff, Answer Reviewer, Study Notebook, Apex tutor and Study Zone tools.
- One Vercel catch-all function dispatching 19 API routes, with authenticated AI/content endpoints, origin checks and bounded request validation.
- Responsive public pages, keyboard navigation, visible focus, light/dark contrast and reduced-motion support.
- Reproducible production build, immutable deployment revision contract and frozen bundle budgets.

## Implemented this run

- Removed unused WebGL cursor and particle renderers while retaining Three.js for the live NeuroCAD module.
- Fixed every repository lint error and every React effect-dependency warning found by the initial audit. Remaining lint output is 14 Fast Refresh file-organization warnings only.
- Repaired media-query listeners, timer callbacks, planner time parsing, auth subscription cleanup, artifact loading, guide caching and context-value behavior.
- Consolidated account password validation into one 10–128 character policy requiring uppercase, lowercase and a number; recovery can no longer accept weaker credentials than signup or invitations.
- Added persistent labels, constraints and help text to invitation and password-recovery forms.
- Reworked Paper Maker configuration into a stable, explicitly labeled form; removed hover-scaling inputs, decorative status copy and placeholder-only field identity.
- Updated the vulnerable `fast-uri` transitive override from 3.1.5 to 3.1.6, clearing the production dependency audit.
- Fixed local/CI build revision contamination: Vercel retains the deployment stamp for packaging, while local and CI builds restore the neutral checked-in module after producing the artifact.
- Made public Playwright runs truthfully withhold production-API assertions unless `PLAYWRIGHT_API_URL` names an executable deployed API host.
- Extended the authenticated golden journey to verify Paper Maker curriculum defaults, labeled controls and enabled generation action.

## Tested

- `npm run ci`: **PASS**.
- Source tests: **747 passed, 0 failed**.
- Frozen evaluation tests: **25 passed, 0 failed**.
- TypeScript application check: **PASS**.
- Full ESLint: **0 errors, 14 Fast Refresh warnings**.
- Production dependency audit: **0 vulnerabilities**.
- Vercel topology: **1 function, 19 routed endpoints**.
- Production build: **PASS, 2,756 modules transformed**.
- Authenticated production-preview golden journey: **1 passed**.
- Local accessibility matrix: **34 passed, 2 inapplicable skips**.
- Public responsive/browser matrix: **32 passed** across 375, 390, 768 and 1,440 pixel projects; **20 deployed-API checks skipped by design** without `PLAYWRIGHT_API_URL`.
- Browser console inspection: no runtime errors; only the expected warning when local Supabase variables are absent.
- Git whitespace validation: **PASS**.

## Partially working

- AI capabilities are executable and tested with provider contracts and deterministic degraded modes, but live provider behavior still depends on correctly configured server credentials and quotas.
- Database migrations, RLS and ownership contracts exist and have local/source evidence. The exact current canonical production database state has not been recertified for this candidate.
- Public pages and the deterministic authenticated preview journey are verified. Real email delivery, OAuth, recovery email and production account lifecycle still require authorized disposable-account testing.
- Full ESLint exits successfully, but 14 component-module Fast Refresh warnings remain as non-release-blocking developer-experience debt.

## Broken

- No known P0 source, build, unit, evaluation or deterministic browser failure remains in this candidate.
- The served canonical production revision does not have current proof matching this source candidate, so production must not be represented as verified.

## Blockers

- Authorized access to the Vercel project serving `www.vertexed.app` is required to deploy and prove the exact immutable revision. Do not create a duplicate project as a substitute.
- Authorized access to the canonical Supabase project and disposable test identities is required for current migration/RLS inspection and destructive-cleanup-safe account lifecycle certification.
- Live AI and email-provider certification requires the real production configuration without exposing credentials.
- No controlled learner study has established learning-outcome or efficacy claims; no such claim should be published.

## Metrics / experimental evidence

- Initial JavaScript: **176,901 bytes gzip** / 275,000 budget.
- Initial CSS: **33,751 bytes gzip** / 45,000 budget.
- Largest JavaScript asset: **232,813 bytes gzip** / 240,000 budget.
- Total JavaScript: **909,469 bytes gzip** / 1,000,000 budget.
- Bundle-budget violations: **0**.
- The repository contains deterministic research/evaluation artifacts, but these are not evidence that VertexED improves real learner outcomes.

## Highest-value next actions

1. Deploy this exact candidate through the canonical Vercel project and prove `/api/health` returns the intended immutable revision.
2. Verify the production environment matrix without revealing values, then run `npm run test:smoke` and the Playwright API contract against the canonical host.
3. Using approved disposable accounts, certify invite/signup, email/OAuth, onboarding, save/resume, account isolation, recovery, logout, admin denial and cleanup.
4. Verify canonical Supabase migrations, RLS, foreign keys, indexes and advisor findings against the exact production project.
5. Split remaining mixed component/helper modules to remove the 14 Fast Refresh warnings without weakening ESLint.
6. Run a consented, preregistered pilot before making any quantitative efficacy claim.

## Reproduction commands

Use Node 22 and a clean dependency install:

```bash
npm ci
npm run lint
npm run ci
npm run test:e2e:local-accessibility
npm run test:e2e
npm run test:e2e:authenticated-golden
```

Only against an authorized deployed target:

```bash
PLAYWRIGHT_BASE_URL=https://www.vertexed.app \
PLAYWRIGHT_API_URL=https://www.vertexed.app \
npm run test:e2e

SMOKE_BASE_URL=https://www.vertexed.app \
EXPECTED_GIT_SHA=<exact-40-character-deployed-revision> \
npm run test:smoke
```
