# ASTRA final report: VertexED

## Current closeout: 28 September 2026

The original report below is retained as historical evidence. It is superseded for current feature counts, local database availability and GitHub publication by [integrated feature delivery](docs/FEATURE_COMPLETION_2026-09-28.md), [calendar and site closeout](docs/SITE_CLOSEOUT_2026-09-28.md), [STATUS.md](STATUS.md) and [LIMITATIONS.md](LIMITATIONS.md). The integrated candidate includes 35 questions, private tutor persistence and reviewed PDF/text imports; 30 migrations and 69 SQL assertions passed locally. The code is on draft PR #1098. Production remains NO-GO because hosting, service configuration and live acceptance are still unresolved. No positive production result has been fabricated.

## Historical hardening report: 27 September 2026

27 September 2026. **Production NO-GO.** This pass applies megaprompt 13 to VertexED. Local hardening is implemented; the complete product and production launch still have open gates. This is not a paper project, and no research results were created.

## Starting state and preservation

The existing review branch was `codex/final-release-export-20260925` at `6a20571a`. Six tracked files and three untracked paths were already modified. The 25 September report still described fresh checks as pending. The substantial study-desk/Learning OS implementation was already present. Its authorship is not attributed to this pass.

The original status and diff were retained in `ci-evidence/astra-20260927/initial-status.txt` and `initial.patch`. No user work, secrets, historical receipts, thresholds, question-bank answers or brand assets were replaced. The noncanonical WIP warning remains in force.

## Implemented changes

- Practice sessions now reject duplicate/unknown question IDs, foreign response entries, incorrect submitted-attempt identities, invalid timing and malformed saved records. Recovery preserves the original bytes.
- Revisiting diagnostic questions no longer reshuffles the visited portion of the session or changes its attempt identities. Even a newly visited blank question is fixed immediately.
- Practice writes compare the previous saved snapshot and use an explicit account key. Observed stale-tab changes pause editing instead of overwriting the newer copy. Storage failures no longer claim a successful save; answers remain copyable before reload.
- Stale or mismatched question/concept links provide a recovery action. A requested question no longer silently overrides a different scope selected by the learner. Unknown view parameters fall back to the practice view.
- Active practice has a compact setup disclosure and a visible subject, save state and recorded-answer count. Starting a session moves keyboard focus to the question heading. The recovery panel provides a correctly associated answer label and the real account-settings route. Blue/white, logo, study terminology and reduced-motion rules are retained.
- Added six unit regressions, four browser regression cases and a reusable three-browser configuration. Updated obsolete golden-journey selectors to the current Today and Notes & flashcards labels; replaced the removed empty-card copy check with direct assertions that provisional feedback creates neither measured scores nor retries. No new package dependency was added.
- Added a prompt-to-evidence map, inventory of all ten AI capabilities, status/claim/limitation/reproduction documents and a cleanup manifest.

## Verification record

A logical checkpoint contains only this pass's source, tests, documentation and evidence-ignore addition. Earlier user changes remain unstaged. No push or deployment was performed.

Raw logs, browser captures and source hashes stay local under `ci-evidence/astra-20260927/` and are ignored by Git. The source manifest identifies changed runtime/test/configuration bytes; a Git revision alone cannot identify this initially dirty candidate.

| Check | Observed result | Receipt |
| --- | --- | --- |
| Initial full CI | Stopped at advisory transport/schema failure; not a pass | `ci-initial.log` |
| Full CI with network access | 1,152 application tests, 25 evaluation tests, 13 offline tutor fixtures; lint/typecheck/build/bundle pass | `ci-verified.log` |
| Corrected final candidate CI | PASS: 1,152 application tests, 25 evaluation tests, 13 tutor fixtures, lint/typecheck/build and frozen budgets | `ci-corrected.log` |
| Copy lint | 355 files, zero findings; not content approval | CI logs |
| Content audit | 245 guides, zero approved, 53 flags retained | CI logs |
| First full learner-browser suite | 34 passed, one failed recovery-label lookup; defect corrected, failure retained | `browser-learning.log` |
| Final browser matrix | PASS: 54 cases, 18 each in Chromium, Firefox and WebKit | `browser-matrix.log` |
| Authenticated golden browser suite | PASS: one complete signup/onboarding/notes/review/timed-practice/save-return journey (fixture integrations) | `browser-golden.log` |
| Changed-source secret scan | No leaks in the scoped files; not full-history certification | `secret-scan.json` |
| Live provider preflight | Exit 2: no OpenAI key; local/inherited provider keys absent | `live-eval-preflight.log` |
| Database availability | Docker cannot connect to missing local Colima socket; no reset/migration executed | `environment-summary.json` |
| Production probe | Exit 2: canonical TLS failure, fallback readiness 503 | `production-probe.json` |

The corrected build uses 237,885 bytes gzip for initial JavaScript (budget 275,000) and 941,314 bytes gzip for total JavaScript (budget 1,000,000). The dependency audit passed its unchanged high/critical gate. The later golden-test-only selector edits passed scoped lint and the full golden journey.

Screenshots of active practice were captured and inspected at 1440, 1024 and 390 pixels in light and dark modes. The first pass showed readable, unclipped question controls. The correction pass reduced closed-setup padding, fixed the recovery textarea label and moved focus after setup collapses. Keyboard activation and reduced motion are exercised by the browser scenarios. Real mobile hardware and a two-hour learner session were not tested.

## Unresolved release blockers, in order

1. Select and review the canonical release source. This WIP tree is not authorised for unattended promotion. Existing unrelated work remains separate.
2. Start an isolated disposable database and execute migration replay, pgTAP and SQL lint. Reconcile the shared-project migration ledger with its owner before remote changes. Complete real two-account/two-device, stale-session, export/deletion and recovery checks.
3. Supply server provider configuration and controlled staging accounts; run actual invite/login/OAuth/recovery/email/save-return and AI evaluation on that exact candidate. Browser fixtures and offline outputs do not satisfy this gate.
4. Complete the mandatory curriculum/product gaps in `docs/PUBLISHABLE_COMPLETION_CHECKLIST.md`, including broader reviewed question coverage and calendar/background scheduling. Obtain content rights, subject/editorial and appropriate privacy/safeguarding review. The current bank remains 25 questions; no guide approval or learning-gains result was invented.
5. Restore canonical-domain TLS and deployment readiness. The current public probe found both `.app` hosts failing before HTTP and the known fallback deployments returning readiness 503 on another revision. No DNS or deployment was changed; protected operator details were unavailable.
6. Verify production monitoring, backup restoration, rollback, real-device usability and the complete final learner acceptance journey. An accountable release decision and exact deployment/migration/content record are still required.

## Reproduction

Use Node 22.22.0/npm 10.9.4. In this run the supported runtime was selected with `/Users/ryan/.nvm/versions/node/v22.22.0/bin` at the front of `PATH`; writable `TMPDIR` was `ci-evidence/astra-20260927/tmp`. The existing installed dependencies and lockfile were used; no fresh install is claimed for this pass.

```sh
rtk npm run ci
rtk proxy npx playwright test --config=playwright.learning.config.ts --workers=1
rtk proxy npx playwright test --config=playwright.astra.config.ts --workers=1
rtk proxy npx playwright test --config=playwright.golden.config.ts e2e/authenticated-student-golden.spec.ts
rtk npm run eval:ask:live
rtk proxy node scripts/probe-production-gates.mjs --json
rtk git diff --check
```

The final two service checks intentionally remain blocked without configuration and restored infrastructure. See `REPRODUCE.md` for local/database boundaries and the existing operator runbook for deployment acceptance.

## Produced artifacts and cleanup

`src/lib/practiceSession.mjs`, its unit tests, the updated learning page/styles and browser cases, `playwright.astra.config.ts`, the updated authenticated golden journey, this report, `docs/ASTRA_VERTEXED_2026-09-27.md`, `STATUS.md`, `REPRODUCE.md`, `CLAIMS.md`, `LIMITATIONS.md`, and `CLEANUP_MANIFEST.md`.

No unique files were deleted, merged away or moved to another repository. The only cleanup is a pass-specific local-evidence ignore rule and extraction of the actual session logic into a tested module. No public publication, production deployment, database mutation or fake transaction occurred.

**Release verdict:** locally improved and verified as recorded above; full product completion and production certification remain blocked. Paper/submission readiness is not applicable.
