# Project Status

**Evidence date:** 2026-09-06

**Branch:** `codex/vertexed-publication-readiness`

**Candidate base revision:** `19baf858dca033226c7f8aa8942fbdd70d1feffe` plus the current uncommitted audit worktree

**Project status:** **Salvageable**

**Release truth:** the local source candidate is a credible private-beta release candidate. It is not production-certified until the exact database migration set and deployed revision pass their external gates.

## What is demonstrably working

- Private-beta waitlist, approved-link and team-invite account paths with server-side validation and direct Supabase signup disabled.
- Supabase session handling, onboarding gates, recovery routing, global logout, confirmed account deletion and complete paginated account export.
- Account-scoped browser state, durable cloud learner state, retry queues and recoverable mock-exam drafts. Timed-exam answers no longer cross a browser-global handoff.
- Dashboard study loop connecting planning, notes, flashcards, quizzes, mocks, evidence-bound review, saved work and resumption.
- Personalized Exam Prep session builder driven by the saved exam date, subjects, unfinished mocks, scheduled retries, verified weak-topic evidence and due flashcards. It explicitly avoids grade prediction.
- Study Zone daily habits with account-scoped device storage and daily reset behavior.
- AI-backed planner, tutor, notes, quizzes, paper generation, transcription, notebook and guide assistance with bounded inputs, provider deadlines, sanitized operational logs and deterministic degraded behavior where appropriate.
- AI review results are explicitly model-generated (`EVIDENCE_LINKED` or `PROVISIONAL`) until a human confirms them; synthetic model output cannot silently become measured mastery.
- One Vercel catch-all function dispatching 21 routes, with authenticated content/AI endpoints, origin checks, bounded request IDs, durable rate limits and a readiness contract.
- Responsive public pages, keyboard navigation, focus restoration, light/dark contrast and reduced-motion behavior.
- Twenty ordered Supabase migrations, RLS/ownership policies, explicit grants and pgTAP structure checks are present in source.
- Reproducible Node 22 build, immutable deployment revision contract, SHA-pinned GitHub Actions and frozen bundle budgets.

## Implemented in the audit worktree

- Added durable learner-state synchronization, idempotent artifact recovery, queued retries and account-bound storage.
- Added full account data export, explicit destructive confirmation, refresh-session revocation and cascade-backed account deletion.
- Added paginated saved-work loading so the settings UI no longer silently truncates a user's content.
- Rebuilt transcription input handling with binary-safe multipart parsing, strict size/type validation, bounded base64 decoding and explicit degraded enrichment states.
- Added a shared provider timeout/telemetry boundary and applied it across every server-side AI provider path.
- Removed raw provider bodies, email addresses, invite tokens and one-time links from operational logging and admin responses.
- Made waitlist/admin rate limiting durable, converted the rate-limit database function to security invoker and tightened database privileges.
- Replaced calculator runtime evaluation with a constrained parser and replaced planner SDK coupling with a small validated REST boundary.
- Removed unused `@google/genai` and `debug` packages, obsolete feature scaffolding, dead test-agent routes and duplicate review code.
- Removed unsupported founder/award/research claims and added prominent independent/unverified-source warnings to study-guide and mark-scheme surfaces.
- Removed build-time sitemap dates that falsely claimed every URL changed on every build.
- Added the protected Exam Prep module, made it the dashboard's primary exam-season route, and added account-scoped daily habits to Study Zone.
- Replaced synthetic readiness defaults with zero/unknown states until real activity exists, fixed past-date cram activation, and made date-only countdowns timezone-safe.
- Scoped generated board-guide caches by account, added expiry/provenance metadata, and made their unverified AI status visible in both UI and server prompts.
- Rewrote the central marketing, feature, planner, study-method, privacy and terms copy to match current behavior and remove unsupported automation, examiner and syllabus claims.
- Removed implicit approval for authenticated accounts without an explicit waitlist row. Historical and team-invited accounts now receive durable rows, email-based ownership repair is atomic, and a row linked to another identity is denied.
- Made team invitations transactional across Auth and the waitlist authorization record, including rollback of incomplete identities when persistence fails.
- Mirrored onboarding curriculum into the profile table, added local-device fallback for failed global logout, bounded all server Supabase calls, and distinguished provider outages from invalid sessions.
- Removed 48 unreachable copied UI primitives and the TypeScript exclusions that hid them; the three primitives imported by the app remain.
- Kept the study-guide library readable while excluding detailed unverified pages from the sitemap, adding `noindex` to detail routes, returning an explicit not-found state for invalid paths, and restoring 16px mobile reader text.
- Expanded CI to enforce lint, types, function topology, production dependency audit, source/evaluation suites, grading truth, build and bundle budgets; database tests run in a separate Supabase job.

## Verification completed

- Source/repository tests: **844 passed, 0 failed**. This is repository-wide coverage and includes quarantined portfolio/research/product contracts; it is not a count of 844 VertexED app tests.
- Frozen evaluation tests: **25 passed, 0 failed**.
- Ask fixture evaluation: **13/13 cases passed**, average score **4.38/5**.
- Synthetic grading gate: **6 fixtures passed**, **0 false verified**, **0 severe false verified**; live model explicitly **NOT_RUN**.
- TypeScript application check: **PASS**.
- Full ESLint: **PASS, 0 errors and 0 warnings**.
- Production dependency audit: **0 known vulnerabilities**.
- Vercel topology: **1 function, 21 routed endpoints**.
- Production build: **PASS, 2,769 modules transformed**.
- Bundle budgets: **PASS, 0 violations**.
- Authenticated production-preview journey: **1 passed in the preceding automated candidate baseline**; the final account/access patch still needs a disposable-account run against a real Supabase environment.
- Local accessibility matrix: **34 passed, 2 inapplicable skips in the preceding automated candidate baseline**.
- Current in-app browser verification: **PASS** for desktop landing semantics/layout; 390px landing, navigation, signup, login and guide layouts; protected Exam Prep redirect; valid/invalid guide routing; guide `noindex`; zero observed horizontal overflow; and zero captured console errors on checked pages.
- Git whitespace validation: **PASS**.

## What remains unverified or unfinished

- The twenty migrations and pgTAP suite have not run against a clean local or canonical Supabase instance in this audit. Colima was stopped and the Docker socket was unavailable. Source inspection and SQL contract tests are not substitutes for database execution.
- This exact worktree has not been deployed through the Vercel project that owns `vertexed.app`; revision, readiness, headers and protected API behavior remain unproved in production.
- The final Exam Prep, habit and readability pass has compile, lint, source-test and production-build evidence. Current browser spot checks also cover the public responsive shell, access redirect and guide reader, but not a real authenticated Exam Prep session.
- Real email delivery, OAuth, password recovery, two-account isolation, export and destructive deletion require authorized disposable-account tests against the canonical environment.
- Live AI quality, provider quotas, latency and fallback frequency have not been certified with production credentials. Local evaluations are synthetic fixtures.
- The study-guide corpus contains 244 navigable pages (245 Markdown files on disk) and lacks a complete per-page provenance, licensing and factual-validation ledger. A reproducible phrase scan flags 45 files containing `reconstruct`, `verbatim`, `exact mark scheme`, `placeholder`, or `no paper`. Detailed pages are now `noindex` and absent from the sitemap, but the corpus still needs an editorial audit before broad publication.
- The privacy and terms pages now describe the current beta more accurately, but the contracting entity, governing-law language, processor agreements, retention schedule and public contact mailboxes still require legal/operational verification before a public commercial launch.
- No controlled learner study establishes learning gains, marking agreement or efficacy. Engagement telemetry and synthetic tests must not be presented as outcome evidence.
- Several UI modules remain too large (`NotetakerQuiz`, `AnswerReviewer`, `StudyNotebook`, `UserSettings`, planner/sidebar components), increasing change risk even though current gates pass.
- Research workflows preserve explicit negative/frozen results, but several Python installs remain unpinned. Historic research artifacts are evidence records, not all reproducible environments.

## Bundle evidence

- Initial JavaScript: **182,584 bytes gzip** / 275,000 budget.
- Initial CSS: **29,301 bytes gzip** / 45,000 budget.
- Largest JavaScript asset: **232,810 bytes gzip** / 240,000 budget.
- Total JavaScript: **929,173 bytes gzip** / 1,000,000 budget.
- Bundle-budget violations: **0**. The largest and total JavaScript budgets have little headroom, so new heavy dependencies should be blocked or offset.

## Highest-value next actions

1. Run `supabase db reset`, pgTAP and local lint from a clean Docker/Colima environment; fix SQL based on executed results, not static assumptions.
2. Deploy this exact candidate through the canonical Vercel project and prove `/api/health`, readiness, HEAD headers and the immutable revision.
3. Run the documented disposable two-account lifecycle matrix, including team invite, waitlist ownership linking, onboarding profile persistence, export completeness and post-deletion denial/cleanup.
4. Create a per-page provenance/licensing/curriculum-version/factual-review ledger for the guide corpus; re-index only reviewed pages.
5. Exercise every provider route with production-like credentials and record latency, timeout, fallback and schema-conformance evidence without retaining learner content.
6. Split VertexED app tests from quarantined repository contracts so CI reports app coverage separately without deleting retained research evidence.
7. Split the largest feature modules along existing domain boundaries without changing behavior, preserving the golden journey after each extraction.
8. Pin Python research dependencies or capture immutable environment locks per frozen experiment before claiming reproducibility, then run a consented preregistered pilot before publishing efficacy claims.

## Reproduction commands

Use Node 22.22.x and a clean dependency install:

```bash
npm ci
npm run ci
npm run test:e2e:local-accessibility
npm run test:e2e
npm run test:e2e:authenticated-golden
```

With a working local container runtime:

```bash
npm run db:test
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
