# Site finish — 15 October 2026

## Local completion pass

Finished the remaining navigation, sign-in continuation and lesson-delivery
defects found in this pass while retaining the existing product work:

- The mobile menu closes after logo, search and history navigation. Its scroll
  region fits short screens, including a 390 × 480 viewport, with the final
  action reachable by keyboard.
- Protected study links retain their query and fragment through email and
  Google sign-in. Google return destinations are local, consumed once and expire
  after ten minutes. Account linking, password recovery, invitations and
  onboarding retain their existing priority. Optional return-path storage failure
  does not block sign-in.
- MYP downloads are checked against generated SHA-256 hashes for all 17 subjects.
  Damaged or stale assets show a retryable error instead of reaching lesson
  rendering. The authoring content and existing public totals are preserved.
- Exact AP course names and slugs select the intended course before topic
  matching. Searching “Calculus AB” no longer also returns BC and Physics.
- New navigation and Google return browser regressions are part of the existing
  golden CI configuration. The golden journey now explicitly checks that retained
  query parameters still cannot manufacture measured learning evidence.

## Local verification

- Application suite: **1,408 passed**, zero failures or skips in the final run.
- **53 distinct browser cases passed after corrections**: the initial run had
  49 passes and four failures; the nine-case affected rerun passed. Three failures
  exposed the AP search defect. The fourth was the old golden test expecting
  sign-in to discard the query; its assertion now checks the complete destination
  and retains the negative measured-evidence assertion. Overlapping reruns are
  not counted as additional cases.
- All 42 AP first-module routes open. AP and MYP assets load offline; formula
  practice, working downloads, library search, account recovery and the complete
  learner save/resume journey passed against synthetic local services.
- Captured and inspected 1440px, 1024px and 390px in light and dark themes,
  including keyboard, reduced motion and the short-screen menu. The final AP
  capture pass positions fixed navigation at the top of full-page evidence.
- Semantic TypeScript, optimized fixture build, frozen gzip bundle budgets,
  copy lint and copy-rule tests passed. ESLint has zero errors and retains two
  existing hook warnings in `ExamBaselinePractice.tsx:77` and `AuthContext.tsx:180`.
- Evaluation tests: 25 passed. Ask fixture evaluation: 13/13. Grading contract
  checks passed. These do not establish live model quality.
- A fresh network-enabled production dependency audit passed with no high or
  critical vulnerabilities. Initial sandbox advisory failures remain recorded.

One intermediate application run overlapped the build's temporary revision stamp
and failed the neutral-source assertion. Running the complete suite after the
build restored its neutral stamp passed. Run builds and revision-packaging tests
serially. The initial browser attempt built successfully but could not bind the
sandbox preview port; the permitted local-server run supplied browser evidence.

The [portable verification receipt](./evidence/site-finish-20261015.json) records
source/build hashes and logs. Raw local logs are in `.tmp/site-finish-20261015/`.
Browser fixtures establish local behavior, not real Google authentication,
cloud persistence, deployed configuration or external curriculum approval.

## Release status

**Production remains NO-GO.** The read-only checks below establish current
external blockers. Local implementation and verification are separate from a
production release. No deployment, DNS change or database mutation was made in
this audit, and no existing evidence was replaced.

## Fresh production and access checks

The network-enabled production gate probe completed at
`2026-10-15T16:56:05.969Z` (22:26 IST). The earlier sandbox-only attempt could not
resolve any hosts and is not evidence of public DNS failure.

- `www.vertexed.app` and `vertexed.app` fail TLS before HTTP. Both resolve to
  `2.59.170.20` and `104.219.250.37`; the probe returned no CNAME.
- `vertex-ed-ai.vercel.app` and `vertex-ai-rho.vercel.app` both return liveness
  HTTP 200 and readiness HTTP 503 (`degraded`). Both identify deployed revision
  `2b0b51c5a0df8fd42af74252fabc5d8aec6d29e6`. Public readiness details are
  unavailable, so the failing dependency is not identified by this probe.
- The unauthenticated `/api/agents` probe returns HTTP 401 as expected.
- The configured Vercel account can access only
  `build-the-future-11s-projects`. Its project list contains no VertexED project,
  and domain inspection explicitly denies access to `vertexed.app` in that team.
- This checkout has no `.vercel/project.json`, `.env`, `.env.local` or
  `.env.production`, and no relevant provider, Supabase, Vercel or readiness
  environment variables were present in the execution environment. No secret
  values were printed or recovered.
- GitHub read access works. The [Production Health Monitor run created at
  15:04 UTC](https://github.com/vertex-studyAI/vertexED.ai/actions/runs/38757019163)
  failed its `Enforce production health gate` step on the deployed revision above.
  The following [Production Transport Diagnostics
  run](https://github.com/vertex-studyAI/vertexED.ai/actions/runs/38757162051)
  completed successfully; that diagnostic workflow is not a production-health
  pass or verification of this working tree.
- The local base is `main` at
  `e28f24ff1c051eaa91b5443a79fe392987d0c688`, with extensive pre-existing
  uncommitted product changes. The live revision does not establish the local
  candidate. No hosted CI run for the uncommitted candidate is claimed.
- The configured Colima Docker socket is absent. The alternative Docker Desktop
  socket exists but a network-enabled read-only version check cannot connect to
  its daemon. No local database stack was started or reset.

## Remaining external work

1. Make the VertexED hosting team and domain/DNS account available to the
   operator. Inspect protected readiness details, correct the verified hosting
   configuration and domain assignment, then recheck HTTPS and readiness.
2. Integrate the working tree into a committed candidate and obtain CI evidence
   tied to that exact revision, including browser and isolated database checks.
3. Reconcile the shared database schema and migration history on a disposable
   clone with backup/restore evidence. The [14 October database
   findings](./RELEASE_EXECUTION_2026-10-14.md#fresh-hosted-database-findings)
   remain the latest database receipt reviewed here; no fresh database or
   security-advisor probe was performed in this pass.
4. Complete real disposable-account isolation and recovery, live-provider
   evaluation, save/return/export/delete journeys, monitoring, restore and
   rollback acceptance on the target deployment.
5. Obtain subject, provenance/rights and privacy review. Imported-guide approval
   and external curriculum approval cannot be inferred from local tests.

The September missing-schema description in `PRODUCTION_LAUNCH.md` now points
to the later database evidence without dropping the shared-schema reconciliation
requirement.
