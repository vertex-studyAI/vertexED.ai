# VertexED work-session changelog

**Session date:** 2026-09-20  
**Starting checkout:** `b009c9ab`, branch `main`, 12 commits behind `origin/main`  
**Release outcome:** NO-GO

## Completed

### VX-000 - current-tree baseline

- Captured branch, revision, dirty state and upstream divergence without removing unrelated work.
- Used the repository's canonical Node 22.22.0 runtime for validation.
- Ran lint/copy, typecheck, 1,072 application tests, eval tests, fixture evaluations, production dependency audit, build, bundle and selected browser journeys.
- Ran production probes outside the restricted network so DNS/TLS/readiness results represent the external services rather than sandbox DNS.

### VX-401 - authenticated startup bundle

- **Files:** `src/components/AuthLandingRedirect.tsx`, `tests/build-performance.test.mjs`
- **Change:** moved the landing `Home` route behind a React lazy boundary while retaining `PageLoader` during session resolution.
- **Why:** signed-in users were downloading the marketing route only to redirect to `/main`, and its CSS pushed the initial budget 767 B over the cap.
- **Targeted test:** 3/3 build-performance tests passed.
- **Broader result:** build passed; all bundle budgets passed at 234,273 B initial JS and 34,506 B initial CSS gzip.

### VX-301 - public claim boundary

- **Files:** `src/pages/Home.tsx`, `tests/landing-claim-boundary.test.mjs`
- **Change:** replaced unsupported named-institution support language with a description of the implemented connected revision trace: curriculum context, visible working, provisional feedback and scheduled retries.
- **Why:** the repository contained no evidence for the implied support/endorsement claim, and the brand copy contract requires factual support.
- **Test:** claim-boundary regression test passed.

### VX-602 - mobile visual evidence timeout

- **File:** `e2e/local-accessibility.spec.ts`
- **Change:** applied a 90s timeout only to the test that captures three full public pages at 390px. Interaction and assertion timeouts remain unchanged.
- **Why:** the landing screenshot is 18,308px tall and exceeded the generic 45s budget in software-rendered Chromium after its layout/focus assertions passed.
- **Test:** isolated landing/login/signup 390px case passed in 11.9s.

### Engineering control documents

- Added `docs/MASTER_AUDIT.md`.
- Added `docs/ARCHITECTURE.md`.
- Added `docs/EXECUTION_PLAN.md`.
- Added `docs/QA_MATRIX.md`.
- Added `docs/LAUNCH_READINESS.md`.
- Added `docs/FINAL_READINESS_CHECKLIST.md`, the checkbox-level release procedure covering 23 control areas.
- Added this work-session changelog.

## Partially completed

1. **Responsive/accessibility review:** selected landing, guided-reasoning, feature and auth journeys were exercised at 1440px, 1024px and 390px with keyboard/reduced-motion assertions. A complete authenticated/browser matrix was not run.
2. **Security review:** auth, authorization, owner filters, body limits, rate limits, headers, telemetry privacy and dependencies were inspected/tested in source. Live RLS and remote settings were unavailable.
3. **Performance review:** bundle sizes and selected responsive rendering were measured. No current DevTools/Lighthouse trace or field CWV evidence was available.
4. **AI evaluation:** offline fixtures passed. An authorised live-provider run was not available.
5. **Content review:** the pipeline inventory ran, but human curriculum approval was outside this session's authority.

## Blocked

1. **Custom domain:** TLS fails before HTTP on `www.vertexed.app`.
2. **Production readiness:** fallback readiness is HTTP 503 degraded.
3. **Database execution:** Supabase initialisation exited 255 after Colima stopped; `npm run db:test` was not run. The host system volume was 98% used at the time.
4. **Canonical candidate:** this tree is dirty, marked non-canonical and behind upstream.
5. **Production auth/email:** no scoped disposable credentials or provider-side recovery/invite delivery were available.
6. **Live model evidence:** provider evaluation requires authorised configuration and budget.
7. **Editorial approval:** 245 guide files remain unapproved; 53 are flagged for review.

## Discovered during execution

1. The initial build's CSS-budget failure came from an eager import in the auth landing redirect, not a general CSS regression.
2. The landing contained an unsupported institutional-support claim even though the repository's copy contract forbids unsubstantiated claims.
3. The mobile page remains responsive but is 18,308px tall, making content density a measurable product concern.
4. The local Node 22.22.0 installation supplies npm 10.9.4 while the repository declares npm 10.9.8.
5. The deployed fallback revision reported by the probe was `a1e4311c...`, one commit behind current `origin/main`; this checkout is 12 commits behind `origin/main`.
6. Production correctly rejects an unauthenticated agents request with 401, but this does not compensate for degraded readiness.
7. Supabase is already configured with `auto_expose_new_tables = false`, which keeps new tables from becoming an accidental Data API surface.

## Test results

| Check | Result |
|---|---|
| `npm run lint:ci` | PASS; 0 copy findings and 2 copy tests pass |
| `npm run typecheck` | PASS |
| `npm run test:app` | PASS; 1,072/1,072 |
| `npm run test:eval` | PASS; 25/25 |
| `npm run eval:ask` | PASS; 13/13, average 4.38/5 |
| `npm run eval:grading:check` | PASS fixture gate; 6 synthetic fixtures, live model NOT_RUN |
| `npm run audit:prod` | PASS on network-enabled attempt; no high/critical production vulnerabilities |
| `npm run build:ci` | PASS; 2,617 modules; 245 guides, 0 approved, 53 flagged |
| `npm run performance:bundle` | PASS after lazy-route fix |
| Targeted source regressions | PASS; 4/4 |
| Selected Playwright run | Initial 23 pass, 1 skip, 1 visual timeout; corrected isolated case 1 pass |
| Local database contracts | BLOCKED before SQL execution |
| `npm run probe:gates` | FAIL; custom-domain TLS and fallback readiness |

## Files modified by this session

### Product and test changes

- `src/components/AuthLandingRedirect.tsx`
- `src/pages/Home.tsx` - contained pre-existing user changes; this session changed only the trust section and related data/copy
- `tests/build-performance.test.mjs`
- `tests/landing-claim-boundary.test.mjs`
- `e2e/local-accessibility.spec.ts`

### Generated dependency-audit receipts

- `ci-evidence/npm-audit/attempt-1.status.txt`
- `ci-evidence/npm-audit/attempt-1.stdout.json`
- `ci-evidence/npm-audit/result.txt`

### Control documents

- `docs/MASTER_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/EXECUTION_PLAN.md`
- `docs/QA_MATRIX.md`
- `docs/LAUNCH_READINESS.md`
- `docs/FINAL_READINESS_CHECKLIST.md`
- `docs/CHANGELOG_WORKSESSION.md`

Pre-existing modifications and untracked paths outside the narrow changes above were preserved. No commit, push, deployment, remote database mutation or production account action was performed.

## Next 15 priorities

1. Create a clean exact-revision candidate from the selected upstream state.
2. Restore `www.vertexed.app` DNS/TLS and verify the canonical redirects.
3. Restore protected production readiness to HTTP 200 for the candidate revision.
4. Run isolated migration replay, pgTAP and database lint on a healthy Docker runner.
5. Execute two-user RLS and IDOR probes against the release database configuration.
6. Certify invite, login, callback, expiry, recovery and logout with disposable accounts.
7. Certify save/return, export and deletion with seeded account-owned data.
8. Run the bounded live-provider evaluation and add reviewed failures to offline fixtures.
9. Audit remote secrets, grants, network restrictions and backup/restore evidence.
10. Review and approve or quarantine every guide intended for public indexing.
11. Verify telemetry storage, alert delivery and incident ownership.
12. Pin npm 10.9.8 in CI or align the repository declaration with the verified toolchain.
13. Run the full authenticated 1440/1024/390 keyboard and reduced-motion matrix.
14. Capture current route-level performance traces and field CWV after transport is healthy.
15. Rehearse rollback, then hold a single-SHA go/no-go review using `docs/LAUNCH_READINESS.md`.
