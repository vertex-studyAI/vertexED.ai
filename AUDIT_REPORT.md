# PROJECT EXECUTION REPORT

**Evidence date:** 2026-09-06
**Repository:** VertexED
**Branch:** `codex/vertexed-publication-readiness`
**Candidate:** base revision `19baf858dca033226c7f8aa8942fbdd70d1feffe` plus the current uncommitted audit worktree
**Decision:** **SALVAGEABLE / FIX**

This report distinguishes verified source behavior from unexecuted database, provider and production behavior. A green local build is not treated as proof that the deployed service works.

## 1. Executive Summary

### Starting condition

VertexED was a real React/Vite/Supabase application, not an empty prototype, but it mixed working product code with copied UI scaffolding, optimistic lifecycle behavior, partially enforced account boundaries, unsupported marketing/content claims and a repository-wide test count that overstated application coverage. Its core student tools existed, but the release evidence did not prove the exact database schema, deployed revision, real email/auth lifecycle or live AI behavior.

The highest-risk source problems were not cosmetic. Access status could be inferred from the presence of an authenticated identity rather than a durable authorization row; team invitation could create an Auth identity without finalizing the matching waitlist membership; onboarding wrote curriculum choices to Auth metadata without first persisting the profile record used elsewhere; logout could imply success after revocation failed; and server-side Supabase calls had no common timeout/non-persistence policy. A large study-guide corpus was discoverable despite missing page-level provenance and editorial evidence.

### Problems found

- Identity and authorization were insufficiently separated in the waitlist/account flow.
- Cross-system operations could leave split-brain Auth/database state.
- Learner data and browser recovery paths were incomplete or inconsistently account-scoped.
- AI/provider calls lacked one uniform deadline, telemetry and safe-degradation boundary.
- Generated or reconstructed educational content was too easy to interpret as authoritative.
- Forty-eight unused copied UI primitives, duplicate review paths and abandoned feature surfaces increased maintenance cost.
- CI did not clearly separate VertexED application evidence from quarantined research/portfolio contracts.
- Database, email/OAuth, deployed revision and live-provider behavior were claimed more broadly than the available evidence allowed.

### Improvements made

The current worktree hardens account access, team invitation, onboarding, logout, account export/deletion, learner-state synchronization, provider deadlines, telemetry, input validation, rate limiting and evidence-gated grading. It adds a personalized Exam Prep product surface and daily study habits, rewrites central product/legal copy, improves responsive readability, removes dead components and direct dependencies, and makes detailed unreviewed study-guide pages non-indexable.

### Current condition

The exact source candidate installs cleanly and passes lint, TypeScript, 844 repository tests, 25 frozen evaluation tests, a 13-case ask fixture, a six-case synthetic grading gate, production build and bundle budgets. Desktop and 390px mobile browser spot checks found no horizontal overflow or console errors on the checked public/auth/guide routes. The project is credible as a local private-beta candidate.

It is **not production-certified**. All 20 migrations and pgTAP checks still need execution against a clean database; the exact candidate has not been deployed and smoke-tested; real account/email/OAuth/export/deletion flows have not run against disposable users in the canonical environment; and live AI quality, latency and fallback rates have not been measured. The guide corpus still requires editorial, licensing and provenance review.

## 2. Baseline Problems

| Area | Evidence | Root cause | Risk |
|---|---|---|---|
| Account access | `ProtectedRoute`, `waitlist-status` and access helpers could treat an existing authenticated account as approved without requiring explicit membership. | Identity existence and beta authorization were conflated. | Unauthorized or legacy access; status that could not be audited from one durable record. |
| Team invites | The invite path could create a Supabase Auth user before the authorization row was durably finalized. | No transaction-like compensation across Auth and Postgres. | Orphan identities and inconsistent login/access behavior after partial failure. |
| Onboarding | Curriculum fields were written to Auth metadata but not reliably mirrored to `profiles`. | Two representations existed without a canonical write sequence. | Recommendations could use stale or absent board, grade, subject and exam-date data. |
| Logout | UI navigation could communicate success even if global session revocation failed. | Failure handling assumed the remote sign-out path always completed. | Stale sessions and false user assurance. |
| Account lifecycle | Export pagination, device-state inclusion, refresh-session revocation and destructive cleanup were incomplete. | Lifecycle behavior had grown across UI, Auth and several tables without one contract. | Incomplete privacy export and unreliable deletion. |
| Learner persistence | Some activity, mock and retry state relied on browser storage or shared handoff keys. | Features were added independently before an account-scoped persistence model existed. | Cross-account leakage on shared browsers and lost work. |
| AI reliability | Provider handlers implemented timeouts, parsing, errors and logging inconsistently. | Direct provider integrations lacked a common request boundary. | Hanging functions, raw provider leakage, schema drift and silent degradation. |
| Grading truth | Generated review could be mistaken for verified mastery. | Product language and state did not consistently separate model output from human-confirmed evidence. | Unsupported educational conclusions. |
| Transcription | Upload parsing and base64 handling were not uniformly bounded and binary-safe. | Input processing had accumulated ad hoc parsing branches. | Memory pressure, malformed input handling and unsafe failure behavior. |
| Calculator/planner | Calculator behavior depended on runtime expression evaluation, while planner code was coupled to a large provider SDK. | Convenience implementations bypassed narrow validated interfaces. | Code-execution risk and unnecessary bundle/dependency weight. |
| Content integrity | Detailed guide pages were included in discovery surfaces without a complete provenance/licensing/factual-review ledger. | Corpus volume was treated as publication readiness. | Copyright, factual and trust risk. |
| Slop | 48 unused UI primitives, duplicate review code, test-agent routes, obsolete world-model/learning-hub surfaces and unused dependencies remained. | Scaffolded code was retained after the actual product architecture changed. | More type surface, dependency churn and misleading apparent progress. |
| Release evidence | Local source tests were mixed with unrelated retained contracts; DB and production checks were absent. | Repository history combines app, portfolio and research artifacts. | Green counts could be misread as end-to-end production proof. |

## 3. Work Completed

### 3.1 Explicit beta membership and transactional team invitation

**Problem:** Authenticated identities could receive implicit approval, and invite creation could leave an Auth-only account.
**Root cause:** Access control was distributed between email checks, Auth state and optional waitlist rows.
**Implementation:** Added a single membership resolver that prefers Auth user ID, atomically claims only an unowned normalized-email row, refuses rows linked to another identity and recovers concurrent same-user claims. Missing membership is now `unregistered`, not approved. Team invitation now creates/updates the approved waitlist record and compensates by deleting an incomplete Auth identity if database finalization fails. The migration ledger materializes approved records for eligible historical/invited identities without opening general signup.
**Files:** `api/_lib/waitlistAccess.js`, `api/_lib/waitlistSignup.js`, `api/_handlers/waitlist-status.js`, `api/_handlers/signup-invite.js`, `src/components/ProtectedRoute.tsx`, `supabase/migrations/20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql`.
**Verification:** New ownership, missing-membership, invite-finalization, rollback and migration-boundary tests pass in the 844-test source suite.
**Impact:** Access is now explainable from a durable authorization record and partial invite failures are recoverable.

### 3.2 Account lifecycle, privacy export and deletion

**Problem:** Users could not prove a complete export, and deletion did not cover every session/data boundary.
**Root cause:** Artifacts, learner state, device storage and Auth session cleanup were handled separately.
**Implementation:** Added paginated server export, device-state attachment in Settings, explicit destructive confirmation, refresh-session revocation and cascade-backed user deletion.
**Files:** `api/_handlers/account-export.js`, `api/_lib/accountExport.js`, `api/_handlers/account.js`, `src/lib/accountExport.ts`, `src/pages/UserSettings.tsx`, account/deletion migrations and tests.
**Verification:** Export pagination/bounds and deletion integrity tests pass; real canonical Supabase execution remains NOT_RUN.
**Impact:** The source contract now covers the whole known account-owned data surface instead of a first page or UI-only deletion.

### 3.3 Durable, account-scoped learner state and recovery

**Problem:** Study state could be lost or cross account boundaries on shared browsers.
**Root cause:** Browser-local feature keys predated a unified learner identity/storage model.
**Implementation:** Added owner-bound learner-state RPC/storage, batch synchronization, versioned retries, a durable outbox, account-derived keys, transient-state clearing on identity changes and recoverable timed-mock drafts.
**Files:** `api/_handlers/learner-state.js`, `api/_lib/learnerStateStore.js`, `src/lib/learnerStateSync.ts`, `src/lib/durableOutbox.ts`, `src/lib/retryQueue.ts`, `src/lib/userContent.ts`, account-isolation and recovery tests.
**Verification:** Owner binding, batch bounds, account switching, retry idempotency and mock-draft recovery tests pass.
**Impact:** Core learning work has a coherent recovery path and reduced shared-device leakage risk.

### 3.4 Profile-consistent onboarding

**Problem:** Saved curriculum preferences could diverge between Auth metadata and the profile table.
**Root cause:** Onboarding updated the secondary representation first.
**Implementation:** Built a normalized profile upsert for identity, board, grade, subjects and exam date; onboarding persists that record before updating Auth metadata and deduplicates subjects.
**Files:** `src/lib/profileRecovery.mjs`, `src/pages/Onboarding.tsx`, `tests/profile-recovery.test.mjs`.
**Verification:** Profile construction and recovery tests pass.
**Impact:** Personalization reads have a durable, consistent curriculum source.

### 3.5 Honest, resilient logout

**Problem:** Logout could appear complete after global revocation failed.
**Root cause:** The UI treated navigation as the success state.
**Implementation:** Global sign-out now falls back to local-session clearing; local-only success is disclosed, and total failure stays visible instead of navigating as though complete.
**Files:** `src/lib/logoutFlow.mjs`, `src/pages/UserSettings.tsx`, `src/components/layout/SiteLayout.tsx`, `tests/logout-flow.test.mjs`.
**Verification:** Global success, local fallback and total-failure tests pass.
**Impact:** Session state and user messaging no longer disagree silently.

### 3.6 Shared provider reliability and telemetry

**Problem:** AI calls could hang, log unsafe payloads or return inconsistent degraded states.
**Root cause:** Provider calls were implemented handler by handler.
**Implementation:** Added bounded fetch, common provider request handling, fixed-field telemetry, schema checks and deterministic fallbacks. Server Supabase clients now disable browser session persistence/refresh behavior and use a 12-second request deadline. Transient auth-service failures return 503; invalid sessions remain 401.
**Files:** `api/_lib/fetchWithTimeout.js`, `api/_lib/providerRequest.js`, `api/_lib/providerTelemetry.js`, `api/_lib/serverSupabase.js`, `api/_lib/auth.js`, `api/_lib/supabaseAdmin.js`, affected AI handlers and tests.
**Verification:** Timeout, telemetry, provider failure and auth classification tests pass.
**Impact:** Failures are bounded, observable and less likely to expose learner/provider content.

### 3.7 Secure inputs, rate limits and logs

**Problem:** Multipart/base64 input paths, in-memory-only throttling and verbose error logging weakened abuse resistance.
**Root cause:** Boundary code lacked common size/type/storage rules.
**Implementation:** Added binary-safe transcription parsing, strict MIME/size/base64 validation, request-ID normalization, durable database rate limiting, invoker-mode RPC privileges, production fail-closed behavior and sanitized logs/admin responses.
**Files:** `api/_handlers/transcribe.js`, `api/_lib/transcriptionInput.js`, `api/_lib/dbRateLimit.js`, `api/_lib/security.js`, `api/_lib/notify.js`, telemetry/waitlist handlers, migrations and tests.
**Verification:** Malformed/oversized input, rate-limit, request-ID and logging contracts pass. No live credential-shaped string was found outside one deliberate redaction fixture.
**Impact:** Public and authenticated endpoints fail more safely under invalid input and infrastructure trouble.

### 3.8 Evidence-gated answer review

**Problem:** Model grading could be promoted into learner mastery without sufficient evidence.
**Root cause:** Review status, spans and learning-state writes were not one enforced contract.
**Implementation:** Consolidated review handling, required bounded evidence, introduced `EVIDENCE_LINKED` and `PROVISIONAL` states, blocked unsupported mastery writes and connected remediation to recorded evidence.
**Files:** `api/_handlers/review-safe.ts`, `api/_lib/answerReview.js`, `api/_lib/verifiedGrading.js`, `api/_lib/reviewVision.js`, `src/pages/AnswerReviewer.tsx`, `src/lib/weaknessEvidenceCore.mjs`, review/grading tests and evals.
**Verification:** Synthetic grading fixtures report zero false-verified cases; live-model evaluation is explicitly NOT_RUN.
**Impact:** The application makes a defensible distinction between generated feedback and measured knowledge.

### 3.9 Personalized Exam Prep and study habits

**Problem:** The product had study tools but no cohesive exam-season workflow.
**Root cause:** Exam date, subjects, weak-topic evidence, mocks, retries and flashcards were isolated signals.
**Implementation:** Added a protected Exam Prep route and deterministic session builder using saved exam date, curriculum, unfinished mocks, scheduled retries, verified weaknesses and due flashcards. Added account-scoped daily habits and past-date/timezone-safe exam logic. The module avoids grade prediction.
**Files:** `src/pages/ExamPrep.tsx`, `src/lib/examPrepCore.mjs`, `src/lib/examFlow.ts`, `src/lib/examReadiness.ts`, `src/pages/Main.tsx`, `src/pages/study-zone/components/HabitTracker.tsx`, `src/app/App.tsx` and product tests.
**Verification:** Exam-prep core/product/date tests pass; protected-route redirect passed browser spot checking. A real authenticated session against canonical data remains NOT_RUN.
**Impact:** The app now has a coherent personalized study sequence rather than a directory of disconnected tools.

### 3.10 UI, readability and copy

**Problem:** Dense layouts, small guide copy and inflated/generic language reduced trust and readability.
**Root cause:** Styling and copy accumulated across multiple generations of the product.
**Implementation:** Reworked token-driven surfaces, hierarchy, responsive navigation, dashboard composition, focus behavior and central landing/features/planner/method/legal copy. Restored guide body copy to 16px on mobile and replaced unsupported examiner, syllabus, award, founder and automation claims with behavior-specific language.
**Files:** `src/index.css`, `src/content/landing.ts`, `src/content/features.ts`, public pages, `src/components/layout/SiteLayout.tsx`, portal/dashboard components and accessibility helpers.
**Verification:** Desktop and 390px public/auth/guide browser checks passed without overflow or captured console errors; shared modal focus tests pass.
**Impact:** The visible product is clearer, more credible and easier to scan without changing its core navigation model.

### 3.11 Study-guide publication boundary

**Problem:** Unverified detailed guides were discoverable as though publication-ready.
**Root cause:** Sitemap generation equated file presence with editorial approval.
**Implementation:** Kept the library readable, added independent/unverified notices, set detail pages to `noindex, follow`, excluded them from the sitemap and added an explicit noindex not-found view instead of falling back to unrelated Biology content.
**Files:** `src/pages/StudyGuides.tsx`, `scripts/generate-study-guide-sitemap.mjs`, `public/sitemap.xml`, guide truth tests.
**Verification:** Generated sitemap has 84 URLs including 48 curriculum-tool URLs and no detailed guide routes. Valid and invalid routes were checked in the browser.
**Impact:** Search visibility now reflects the actual editorial evidence boundary.

### 3.12 Architecture and dependency cleanup

**Problem:** Dead code and direct dependencies inflated the maintenance surface and hid type failures behind exclusions.
**Root cause:** Generated component libraries and abandoned experiments were never pruned after route/product changes.
**Implementation:** Removed 48 unreachable UI primitives, duplicate review code, obsolete test-agent routes, unused world-model/learning-hub surfaces and unused packages. Removed the TypeScript exclusions that had hidden dead source. Preserved three UI primitives still imported by the app.
**Files:** `src/components/ui/*`, `src/pages/WorldModel.tsx`, `src/pages/LearningHub.tsx`, removed review/test-agent modules, `tsconfig.app.json`, `package.json`, `package-lock.json`.
**Verification:** Clean install, full lint, typecheck, tests and production build pass after removal.
**Impact:** 11,904 deleted lines versus 3,716 added lines across the tracked diff; less code now carries more verified behavior.

### 3.13 CI and release truth

**Problem:** Passing source checks could be presented as deployment readiness.
**Root cause:** Local, database, browser and production gates were not clearly separated.
**Implementation:** The candidate gate now includes full lint/types, topology validation, production audit, source/evaluation tests, grading truth, build and frozen bundle budgets; database verification is a separate Supabase job; documentation labels NOT_RUN evidence explicitly.
**Files:** `.github/workflows/ci.yml`, `package.json`, build/test scripts, `docs/PRODUCTION_LAUNCH.md`, `PROJECT_STATUS.md`, `EVALUATION_REPORT.md`.
**Verification:** `npm run ci` passed after a clean lockfile install.
**Impact:** A green source candidate is meaningful without being confused with an unperformed deployment certification.

## 4. Bugs Fixed

1. Missing waitlist membership no longer becomes implicit approval.
2. An email row owned by a different Auth identity is denied rather than reassigned.
3. Concurrent same-user membership linking recovers deterministically.
4. Failed team-invite persistence rolls back the newly created Auth identity.
5. Team invite approval now creates a durable authorization row.
6. Onboarding profile fields are persisted before secondary Auth metadata.
7. Logout falls back locally and no longer navigates after total failure.
8. Export no longer silently stops at the first database page.
9. Account deletion revokes sessions and covers linked learner data in the source contract.
10. Timed mock answers/drafts are account-scoped and resumable.
11. Learner-state retries are bounded and idempotent.
12. Past exam dates no longer activate a false cram state.
13. Date-only exam countdowns no longer shift across timezones.
14. Initial readiness no longer fabricates a non-zero baseline.
15. Board-guide caches are account-scoped and carry expiry/provenance state.
16. Provider timeouts and transient Auth infrastructure failures are classified explicitly.
17. Transcription rejects malformed, oversized or unsupported binary/base64 input.
18. Calculator expressions are parsed by a constrained grammar instead of runtime evaluation.
19. Invalid guide paths no longer render an unrelated default guide with a mismatched canonical URL.
20. Detailed unreviewed guides no longer enter the public sitemap.

## 5. Features Implemented

- Personalized protected Exam Prep session builder.
- Account-scoped daily habit tracker in Study Zone.
- Durable cloud learner-state sync with retry/outbox recovery.
- Recoverable timed mock-exam drafts and resume route.
- Paginated full account export including known device-scoped learner data.
- Explicit account deletion flow with destructive confirmation.
- Team-invite account creation with durable membership finalization.
- Evidence-linked versus provisional answer-review states.
- Provider health/quality telemetry without prompt or learner-content retention.
- Board-resource cache provenance and visible unverified-generation state.
- Responsive study-guide reader with explicit invalid-route handling.
- Quality-report and pilot evidence scaffolding that keeps synthetic and live results separate.

## 6. Security Improvements

- Enforced explicit authorization records instead of Auth-presence approval.
- Bound email membership repair to unowned rows and verified user identity.
- Added compensation for partial Auth/database team-invite failure.
- Standardized server Supabase clients with no session persistence, no auto-refresh and bounded fetch.
- Added durable, salted, production fail-closed rate limits and tightened RPC grants.
- Required valid Supabase sessions on AI/content routes; retained a narrow public route set.
- Sanitized provider responses, tokens, invite links and user email from operational output.
- Bounded multipart, base64, JSON, identifiers and request IDs.
- Removed runtime expression evaluation from the calculator.
- Pinned workflow actions and preserved the immutable build-revision check.
- Clean production dependency audit reports zero known advisories.
- Secret-pattern scan found only a deliberate fake token in a redaction test fixture; no private-key, GitHub, Google or AWS credential pattern was found.

Unclosed security/reliability gates: database policies have not executed in this environment; production headers/routing are not verified for this exact revision; real two-user isolation is untested against the canonical backend; rate-limit row retention for many unique keys needs an operational cleanup policy.

## 7. Architecture Improvements

The deploy shape remains intentionally simple: one React 19/Vite client, one Vercel catch-all serverless function with an explicit 21-route registry, and Supabase for Auth/data. The work preserves that architecture instead of introducing a framework migration.

Improvements include shared auth/provider/storage boundaries, removal of duplicate handlers and dead UI, account-scoped state contracts, an ordered migration source of truth, explicit feature routing and release-gate separation. The server/client boundary is clearer, and degraded AI behavior is defined rather than accidental.

Remaining architecture debt:

- `NotetakerQuiz`, `AnswerReviewer`, `StudyNotebook`, `UserSettings` and planner/sidebar code are still oversized orchestration modules.
- `npm test` still glob-runs app, portfolio, NeuroCAD and research contracts together, obscuring application coverage.
- The repository contains intentionally quarantined historical products/research; ownership is documented but physical boundaries remain weak.
- Twenty migrations are the declared schema truth, but without a clean execution there is no demonstrated database state.
- The guide retrieval path reads a large on-disk corpus on first use; a reviewed compact index should replace broad runtime discovery after editorial approval.

## 8. Testing Improvements

New or expanded tests cover explicit waitlist membership, team-invite rollback, logout fallback, server Supabase settings/timeouts, account export, learner-state ownership, retries/outbox recovery, mock drafts, exam prep, date boundaries, provider telemetry, request IDs, transcription input, calculator parsing, planner contracts, sitemap truth and study-guide access behavior.

The final clean-install candidate produced:

- 844 repository/source tests passed, 0 failed.
- 25 frozen evaluation tests passed, 0 failed.
- Ask fixture: 13/13 passed, 4.38/5 average.
- Grading fixture: six cases passed, false-verified rate 0; live model NOT_RUN.
- ESLint passed with 0 errors and 0 warnings.
- TypeScript application check passed.
- Production dependency audit found 0 known vulnerabilities.
- Production build and all bundle budgets passed.

These counts are not equivalent to 844 independent VertexED user journeys. Many tests enforce retained portfolio/research/product contracts. The authenticated golden journey and accessibility matrix have prior-candidate evidence; the final identity changes still require a real backend lifecycle run.

## 9. Performance Improvements

- Removed unused UI code and direct dependencies, reducing parse/type/maintenance work.
- Preserved route-level lazy loading and the one-function Vercel topology.
- Added provider and Supabase deadlines to cap stalled requests.
- Current frozen bundle results: initial JavaScript 182,584 bytes gzip, initial CSS 29,301, largest JavaScript asset 232,810 and total JavaScript 929,173; all pass.
- Compared with the observed pre-final-pass baseline, initial CSS dropped from 34,455 to 29,301 bytes gzip. Initial and total JavaScript increased slightly to support the completed flows.
- A single local guide-retrieval observation measured about 392 ms cold and 61 ms cached for four matches. This is diagnostic evidence, not a production benchmark.

The largest JavaScript asset has only 7,190 bytes of gzip headroom and total JavaScript has 70,827 bytes. New heavy packages should not be accepted without offsetting removal or route isolation.

## 10. UX Improvements

- Rewrote central body text to describe what the product actually does, using shorter sentences and fewer generic promotional claims.
- Improved body contrast, card hierarchy, spacing, responsive stacking and mobile navigation.
- Restored readable 16px guide prose with approximately 27px line height on the checked mobile viewport.
- Added clear loading, empty, degraded, provisional, retry and failure states where silence previously looked like success.
- Connected the dashboard to a primary exam-prep workflow and made recommendations depend on saved learner evidence.
- Added keyboard-safe shared modals, focus restoration and reduced-motion behavior.
- Made waitlist/account state and failed logout actions explicit.
- Added visible independent/unverified content warnings and a real guide not-found page.

Browser spot checks passed on the desktop landing page and 390 × 844 landing, navigation, signup, login and guide layouts. The checked pages had no horizontal overflow and no captured console errors. A protected `/exam-prep` request redirected to login. This is useful UI evidence, not a replacement for full authenticated device/browser coverage.

## 11. Research Integrity Report

### Completed evidence

- Deterministic source contracts and synthetic evaluation fixtures pass.
- Grading state explicitly separates evidence-linked/provisional model output from human-confirmed measurement.
- Frozen historical research artifacts and negative findings were preserved rather than rewritten to manufacture success.
- The sitemap and UI now communicate that detailed study guides are independently produced and not fully editorially verified.

### Negative results

- Historical production checks recorded an older health/revision contract; they do not certify this candidate.
- The canonical database and current production deployment were not available for verification.
- No authorized isolated live-provider evaluation was run.

### Hypotheses, not results

- Personalized sequencing may improve study adherence or learning efficiency.
- Evidence-linked review may reduce incorrect mastery updates.
- Exam Prep may improve prioritization near an exam date.

None of these hypotheses has a controlled learner-outcome result in this repository.

### Frozen/preregistered decisions

Existing frozen protocols, hashes, thresholds and negative research artifacts remain quarantined under the repository isolation policy. They should be cited only within their recorded scope. Several Python workflows still install unpinned dependencies, so future bit-for-bit reproducibility is not established.

### Unsupported conclusions

- No evidence supports guaranteed grade improvement, examiner-equivalent marking, complete syllabus coverage or comprehensive curriculum accuracy.
- Synthetic fixtures do not establish live-model quality, subgroup fairness or production latency.
- Engagement telemetry would not, by itself, establish educational efficacy.
- The 245-file guide corpus lacks a complete page-level source/license/curriculum-version/factual-review ledger. A reproducible phrase scan flags 45 files for terms such as `reconstruct`, `verbatim`, `exact mark scheme`, `placeholder` or `no paper`; this is a triage signal, not a copyright or factual verdict.

## 12. Verification Matrix

| Check | Before | After | Evidence |
|---|---|---|---|
| Clean install | Not recently demonstrated | **PASS** | Exact `package-lock.json` installed with npm 10.9.7/Node 22.22; 547 packages; npm audit reported 0 vulnerabilities. |
| Lint | Partial/previous evidence | **PASS** | Full CI ESLint, 0 errors and 0 warnings. |
| Typecheck | Exclusions hid dead source | **PASS** | TypeScript application check passes after removing the exclusions and unused components. |
| Source tests | 827 passing in the pre-final candidate | **PASS: 844/844** | Final clean-install `npm run ci`; count includes quarantined non-app contracts. |
| Frozen eval tests | Passing fixture evidence | **PASS: 25/25** | Deterministic local evaluation suite. |
| Ask evaluation | Fixture-only | **PASS: 13/13** | Average 4.38/5; not live-provider evidence. |
| Grading integrity | Fixture-only | **PASS: 6 cases** | 0 false verified; live model explicitly NOT_RUN. |
| Production dependency audit | Prior local evidence | **PASS** | 0 known production advisories at audit time. |
| Function topology | One-function intent | **PASS** | Validator reports 1 Vercel function and 21 routed endpoints. |
| Production build | 2,768 modules | **PASS: 2,769 modules** | Vite 7.3.6 build from clean install. |
| Bundle budgets | Passing baseline | **PASS** | 182,584 initial JS; 29,301 initial CSS; 232,810 largest JS; 929,173 total JS, all gzip. |
| Public/mobile runtime | Prior candidate coverage | **PASS, scoped** | Current in-app browser spot checks on desktop and 390px public/auth/guide routes; no checked-page overflow or console errors. |
| Authenticated app workflow | Prior mocked golden journey | **NOT RUN for final real backend** | Protected-route redirect checked; real disposable account/session/data run still required. |
| Database migrations | Static/source checks only | **NOT RUN** | Container runtime was stopped and Docker socket unavailable; 20 SQL migrations and pgTAP sources were inspected only. |
| Canonical deployment | Older negative evidence | **NOT RUN** | This exact worktree has not been deployed to the owning Vercel/Supabase projects. |
| Live provider quality | Synthetic fixtures | **NOT RUN** | No authorized production-like credentials/environment. |
| Git whitespace | Passing | **PASS** | `git diff --check` returned no errors. |

## 13. Files Changed

The tracked diff currently covers 210 files, with 3,716 insertions and 11,904 deletions; additional new migration, test and feature files are untracked because the user did not authorize staging or committing. Meaningful change groups are:

- **Identity/access:** `api/_lib/waitlistAccess.js`, `api/_lib/waitlistSignup.js`, waitlist/invite handlers, `src/components/ProtectedRoute.tsx`.
- **Auth/server reliability:** `api/_lib/auth.js`, `api/_lib/serverSupabase.js`, `api/_lib/supabaseAdmin.js`, logout flow and UI consumers.
- **Data lifecycle:** account export/delete handlers and helpers, learner-state store/sync, durable outbox/retry queue, `src/pages/UserSettings.tsx`.
- **AI boundaries:** provider request/telemetry/timeout helpers, note/quiz/paper/planner/transcription/review/guide handlers.
- **Learning product:** `src/pages/ExamPrep.tsx`, exam-prep/exam-flow/readiness libraries, dashboard, habits, mocks, notes, reviewer and planner surfaces.
- **Content/UI:** landing/features/legal copy, `src/index.css`, layout/portal components, `src/pages/StudyGuides.tsx`, generated sitemap.
- **Database:** ordered files under `supabase/migrations/` and pgTAP sources under `supabase/tests/`.
- **Build/release:** `package.json`, `package-lock.json`, `vite.config.ts`, `vercel.json`, CI workflows and verification scripts.
- **Documentation:** `README.md`, `PROJECT_STATUS.md`, `EVALUATION_REPORT.md`, architecture/environment/pilot/launch documents and this report.
- **Removed dead weight:** unused `src/components/ui/*` primitives, duplicate review code, obsolete world-model/learning-hub/test-agent surfaces and stale schema snapshot.

The full `git status`/diff is the authoritative file inventory. No change has been staged, committed, pushed or deployed by this audit.

## 14. Remaining Issues

### P0 — blocks production certification

1. **Database execution absent.** All 20 migrations, ownership policies, RPC grants, deletion cascades, rate limits and pgTAP assertions need a clean runtime execution.
2. **Exact deployment absent.** The current worktree has no canonical Vercel revision/readiness/header/API proof.
3. **Real lifecycle absent.** Team invite, waitlist membership repair, onboarding, OAuth/recovery, two-account isolation, full export and deletion need disposable-account verification against the canonical backend.

### P1 — blocks a responsible broad beta

1. **Guide provenance/editorial debt.** 244 navigable pages remain unreviewed at page level; detail pages are contained by noindex, not validated.
2. **Live AI certification absent.** Provider quotas, latency, schema drift, fallback frequency and output quality are unknown in production-like conditions.
3. **Legal/operational details unresolved.** Contracting entity, governing law, processor agreements, retention schedule and public support/privacy mailboxes need owner/legal confirmation.
4. **App coverage reporting is muddy.** The 844 count includes unrelated retained projects and research.

### P2 — important maintenance/reliability work

1. Oversized feature modules make review and regression isolation harder.
2. The database rate-limit table needs global retention/cleanup for high-cardinality keys.
3. The guide retrieval path should use a reviewed, generated compact index after editorial approval.
4. Provider and account-flow operational dashboards/alerts are not proven in production.
5. Cross-browser authenticated and assistive-technology coverage is incomplete.

### P3 — cleanup and reproducibility

1. Clean macOS install leaves two Sharp/WASM optional artifacts reported as extraneous by `npm ls`; build/audit pass, so this is tooling noise rather than a runtime defect.
2. npm reports a deprecated transitive development `glob@10.5.0`; no direct vulnerable production dependency was found.
3. Several historical Python research workflows lack immutable environment locks.
4. The cumulative worktree is very large and should be split into reviewable commits before merge.

## 15. Highest-ROI Next Work

1. **Task:** Execute the database from zero.
   **Files/components:** `supabase/migrations/*.sql`, `supabase/tests/*`, `package.json` `db:test`.
   **Why:** Static SQL tests cannot prove ordering, grants, RLS or cascade behavior.
   **Impact:** Removes the largest production correctness/security unknown.
   **Dependencies:** Working Docker/Colima and Supabase CLI.
   **Verify:** `supabase db reset`, pgTAP and database lint all pass on a blank environment.

2. **Task:** Deploy and certify the exact revision.
   **Files/components:** `vercel.json`, `api/_handlers/health.js`, `scripts/smoke-production.mjs`, `docs/PRODUCTION_LAUNCH.md`.
   **Why:** The current production host does not prove this source.
   **Impact:** Establishes real routing, readiness, security headers and revision identity.
   **Dependencies:** Authorized Vercel project and applied canonical database.
   **Verify:** Health/readiness/HEAD/protected-route smoke tests return the expected 40-character revision.

3. **Task:** Run a disposable two-account lifecycle matrix.
   **Files/components:** `e2e/authenticated-student-golden.spec.ts`, waitlist/invite handlers, onboarding, export/delete endpoints, `ProtectedRoute`.
   **Why:** These flows span Auth, database, email and browser state and cannot be certified by mocks alone.
   **Impact:** Proves access isolation and privacy lifecycle.
   **Dependencies:** Test inboxes, authorized OAuth/email configuration and disposable users.
   **Verify:** Invite, sign-in, membership claim, onboarding, cross-account denial, export and deletion assertions all pass; deleted sessions/data are inaccessible.

4. **Task:** Build the guide provenance and editorial ledger.
   **Files/components:** `public/study-guides/**`, `public/study-guides/myp/manifest.json`, sitemap generator and guide UI.
   **Why:** Noindex reduces reach but does not establish factual correctness or publishing rights.
   **Impact:** Turns the largest unsupported content surface into reviewable educational material.
   **Dependencies:** Curriculum-qualified editor and licensing decisions.
   **Verify:** Every published page has sources, owner, license, curriculum/version, last factual review and pass/fail state; only passed pages are indexed.

5. **Task:** Run provider route certification.
   **Files/components:** all AI handlers, `api/_lib/providerRequest.js`, `api/_lib/providerTelemetry.js`, eval scripts.
   **Why:** Synthetic fixtures do not reveal quota, latency, outage or distribution-shift behavior.
   **Impact:** Makes AI reliability and cost measurable.
   **Dependencies:** Authorized isolated credentials and privacy-safe test dataset.
   **Verify:** Each route meets frozen latency/error/schema/fallback thresholds without storing prompts or learner content.

6. **Task:** Separate canonical app CI from retained repository contracts.
   **Files/components:** `package.json`, `.github/workflows/ci.yml`, test directory layout, `VERTEXED_REPO_ISOLATION.md`.
   **Why:** The aggregate 844 count is easy to misinterpret.
   **Impact:** Clear app coverage and faster failure ownership.
   **Dependencies:** Preserve quarantine history rather than deleting evidence.
   **Verify:** CI reports app unit/integration/e2e and quarantined contract suites as separate named totals.

7. **Task:** Split oversized UI orchestrators by existing domains.
   **Files/components:** `NotetakerQuiz.tsx`, `AnswerReviewer.tsx`, `StudyNotebook.tsx`, `UserSettings.tsx`, planner/sidebar modules.
   **Why:** Large stateful modules increase regression risk.
   **Impact:** Easier review, testing and ownership without a rewrite.
   **Dependencies:** Stable tests and golden journey.
   **Verify:** Each extraction is behavior-neutral and all gates pass after every small change.

8. **Task:** Add rate-limit retention and production observability proof.
   **Files/components:** rate-limit migration/RPC, `observabilityStore`, health/telemetry handlers and deployment dashboards.
   **Why:** High-cardinality rate keys can accumulate, and source telemetry is not an operational alerting system.
   **Impact:** Better long-running reliability and incident detection.
   **Dependencies:** Canonical database scheduler/retention policy and monitoring destination.
   **Verify:** Old rows expire globally, cardinality stays bounded and synthetic failure alerts fire without sensitive payloads.

9. **Task:** Protect bundle headroom.
   **Files/components:** `vite.config.ts`, markdown/PDF/chart imports, performance checker.
   **Why:** The largest JavaScript chunk is within about 3% of its budget.
   **Impact:** Prevents slow growth from turning into a sudden release failure.
   **Dependencies:** Route-level profiling.
   **Verify:** Lazy-load or replace the heaviest paths while preserving features; reduce the largest chunk with all browser tests passing.

10. **Task:** Close legal and efficacy evidence gaps.
    **Files/components:** privacy/terms pages, environment/retention docs, pilot protocol and frozen research manifests.
    **Why:** Product correctness is not legal readiness or proof of learning impact.
    **Impact:** Enables responsible public claims and a valid learner pilot.
    **Dependencies:** Named operating entity, counsel/owner decisions, consented participants and preregistered analysis.
    **Verify:** Operational/legal review is signed off; a consented preregistered study reports positive, null and negative results under frozen criteria.

## 16. Project Scorecard

Scores measure the candidate against a production education product, not against a demo.

| Dimension | Before | After | Rationale |
|---|---:|---:|---|
| Correctness | 6.0 | 8.0 | Core flows and failure contracts are much stronger; real DB/lifecycle remain unrun. |
| Architecture | 5.5 | 7.2 | Shared boundaries and dead-code removal help; oversized modules and mixed repository ownership remain. |
| Security | 6.0 | 8.0 | Access, input, secrets/logging, timeouts and rate limits improved; deployed RLS is unproved. |
| Testing | 6.5 | 8.2 | Broad deterministic coverage and clean CI; app coverage is mixed and real integration remains absent. |
| UX | 6.0 | 8.0 | Copy, hierarchy, responsiveness, accessibility and recovery states improved. |
| Performance | 6.5 | 7.3 | Budgets pass and CSS improved; large PDF/markdown chunks leave limited headroom. |
| Documentation | 5.5 | 8.0 | Claims and evidence boundaries are explicit; operational sign-offs are still missing. |
| Developer Experience | 5.0 | 7.0 | Clean install/gates and less dead code; huge mixed worktree and test scope remain costly. |
| Production Readiness | 4.5 | 6.8 | Credible private-beta source candidate, blocked by DB/deploy/lifecycle/provider gates. |
| **Overall** | **5.7** | **7.6** | Worth continuing, but not honestly launch-ready. |

---

**PROJECT STATUS:** Salvageable

**VERIFIED WORKING:**

The exact source candidate clean-installs; passes lint, TypeScript, 844 repository tests, 25 frozen eval tests, ask/grading fixture gates, production audit, Vercel topology validation, production build and bundle budgets; and passes scoped desktop/mobile public-route browser checks. Core source behavior includes explicit beta membership, transactional invite recovery, account-scoped learner state, personalized Exam Prep, evidence-gated review, account export/deletion contracts and bounded provider fallbacks.

**CRITICAL FAILURES:**

1. The 20 migrations and pgTAP suite have not executed on a clean database.
2. This exact candidate has not been deployed or revision/readiness-smoke-tested.
3. Real email/OAuth/two-account/export/deletion lifecycle testing is absent.
4. Live provider quality, latency, quota and fallback behavior are unmeasured.
5. Detailed study guides lack complete provenance, licensing and factual review.

**SLOP / DEAD WEIGHT:**

Forty-eight unused UI primitives and several duplicate/abandoned paths were removed. Remaining dead weight is mostly organizational: unrelated quarantined tests inflate the headline suite, large orchestration modules concentrate risk, historical research environments are not uniformly pinned, and unreviewed guide volume still exceeds verified content value.

**MISSING TO COMPLETE:**

A clean database execution, canonical deployment proof, disposable-account lifecycle matrix, live-provider certification, guide editorial ledger, legal/retention sign-off, separated app coverage and eventually a preregistered learner study.

**TOP 5 NEXT ACTIONS:**

1. Run and fix the full migration/pgTAP chain in `supabase/migrations/` and `supabase/tests/`; outcome: proven schema/RLS/RPC/deletion behavior; verify with blank `supabase db reset`, pgTAP and lint.
2. Deploy the exact candidate using `vercel.json` and certify `api/_handlers/health.js`; outcome: revision-bound production proof; verify health/readiness/HEAD/auth smoke against the 40-character SHA.
3. Extend and run `e2e/authenticated-student-golden.spec.ts` against two disposable identities; outcome: proven invite, onboarding, isolation, export and deletion lifecycle; verify every cross-account/data/session assertion.
4. Add a page-level ledger for `public/study-guides/**` and feed it into `scripts/generate-study-guide-sitemap.mjs`; outcome: only sourced/licensed/reviewed pages become indexable; verify manifest coverage and sitemap tests.
5. Run privacy-safe live certification across the AI handlers and provider boundary; outcome: measured schema, latency, error and fallback behavior; verify frozen thresholds and sanitized telemetry.

**FINAL VERDICT:** **FIX.** VertexED is real, useful and worth continuing. The current source is a strong private-beta candidate, but calling it production-ready before database execution, exact deployment proof, real account/provider testing and guide editorial verification would overstate the evidence.
