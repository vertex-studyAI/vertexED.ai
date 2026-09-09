# VertexED finish checklist

## Follow-up, 9 September 2026

The current feature classification, exact fixes, tests and remaining gates are in [the executed feature checklist](docs/FEATURE_CHECKLIST_2026-09-09.md). This supersedes the validation counts below, which describe the 8 September run.

- [x] Add manual planner entry alongside optional AI suggestions; validate dates, midnight, durations, clashes and occupied rollover days.
- [x] Reject stale AI results after account/task changes, persist actions without a debounce-loss window and replace idle scrolling with an explicit control.
- [x] Repair task keyboard completion and form contrast/layout in both themes.
- [x] Validate nested saved planner/notebook records and block corrupt-data overwrites.
- [x] Preserve unreadable exam history and compare actual timestamp instants.
- [x] Verify 599 app tests, 25 evaluation tests, 10 golden browser tests, full lint/typecheck, copy lint, production build and unchanged bundle budgets.
- [ ] Complete the shared-database, live integration and editorial release gates below. No production update occurred.

Updated 8 September 2026 after audit and execution. Sources: the current working tree, actual tests/browser runs, and read-only remote database inspection. Existing user changes were preserved. Checked items below mean local implementation/verification, not production or educational certification. Full evidence, scores and commands: [execution report](docs/ASTRA_EXECUTION_2026-09-08.md).

## P0/P1 — safe operation and release blockers

- [x] Preserve flashcard collections and schedules; repair duplicate identities (`learning-integrity` tests).
- [x] Derive weekly counts and longitudinal subject trends from actual measured events (`learning-integrity` tests).
- [x] Prevent concurrent planner/notebook overwrites with account-bound requests and conditional writes (`snapshot-concurrency` tests; live two-device gate remains).
- [x] Recover paginated learner-state reads, including old active retries/drafts (`learner-state-store` tests and golden retry restoration).
- [x] Collect/clear account-owned recovery data and include durable pending work in exports (account-scope tests; live deletion gate remains).
- [x] Enforce editorial eligibility and honest unavailable retrieval; content audit still reports zero approved guides.
- [x] Permit the existing Desmos frame in the restrictive deployment CSP. Live iframe/deployment behavior remains a post-deploy check.
- [x] Preserve corrupt notebook/planner bytes, block autosave and expose explicit backed-up recovery (actual sync-module and browser tests).
- [x] Fix callback initialization/deadline/recovery-event races and stale auth bootstrap (actual React and SDK fixture tests).
- [x] Align server secret-key aliases across readiness, signup, rate limiting and the admin client.
- [x] Route the local API through production parsing/CORS/limits; enforce the artifact limit on chunked requests.
- [x] Add fail-closed exam-session readiness and local migration/pgTAP assertions. Do not claim the SQL was executed.

## P1/P2 — complete the main product experience

- [x] Validate generated quizzes/notebook outputs and retain fallback status (`generated-output-integrity`, artifact fallback tests).
- [x] Allow learner-attested marks to differ from AI suggestions, including zero (`generated-output-integrity` and golden review).
- [x] Render bounded concept maps as text relationships, without executing generated directives.
- [x] Preserve guide provenance and grade-aware cache identity in the existing resource implementation.
- [x] Surface storage-write failures and pause unsafe snapshot saves; original bytes survive failed recovery.

## P2 — reliability, testing, accessibility, performance

- [x] Full application/backend lint passes, including JS/MJS; no disabled checks added.
- [x] Account-bound requests and auth bootstrap have tested deadline/failure handling.
- [x] Local-day and stale-streak regressions pass.
- [x] Degraded output remains distinct from transport success in contracts/telemetry.
- [x] App/eval tests, lint, typecheck, normal production build and frozen bundle budgets pass.
- [x] Authenticated core journey and desktop/mobile keyboard/accessibility suites pass with synthetic integrations.
- [x] Capture/inspect 1440, 1024 and 390px recovery screens in both themes, perform corrections, test reduced motion and actual element bounds.
- [x] Isolate browser fixture build output from the normal preview.
- [x] Verify database/release tooling read-only: connected project reachable, missing schema capabilities confirmed, Docker unresponsive, production HTTP unverified.

## P3 — polish and developer experience

- [x] Update architecture, auth setup, environment and release docs to match actual boundaries.
- [x] Preserve quarantined portfolio material without counting it as application evidence.
- [x] Re-audit changed flows; fix mobile clipping, server alias mismatch and fixture-preview contamination discovered during verification.
- [x] Inspect scoped diffs and record commands, evidence limits and a FIX verdict in the execution report.

## External evidence and optional work

- [ ] Reconcile the shared Supabase migration history on a backed-up disposable clone with both applications' owners. Learner-state, observability, batch sync, rate-limit RPC, readiness and singleton index are absent on the configured project.
- [ ] Execute the local migration ledger, pgTAP and SQL lint with working Docker/isolated CI, then apply only an approved remote migration plan.
- [ ] Verify actual Google login/linking/recovery, provider calls, email delivery, two-device state, account export/deletion and production revision.
- [ ] Resolve the owning Vercel project and run clean CI plus live smoke on the exact release candidate.
- [ ] Address remote security advisor warnings with the shared-project owner: leaked-password protection and Postgres security patches.
- [ ] Obtain licensed editorial approvals and independent grading/pilot evidence. Current guide inventory is 245 files, zero approved, 53 flags.

No speculative extension substitutes for these gates. No remote database changes, publication or fabricated learning results occurred.

## Validation log

583 application tests and 25 evaluation tests pass. Golden browser suite: seven pass. Public landing/workbook/accessibility: 32 pass, one desktop-inapplicable mobile case skipped; mobile accessibility: nine pass. Five real local HTTP checks pass after correcting Vite's preflight interception. Full lint/typecheck, copy (248 files, zero findings), build, dependency audit (zero reported production vulnerabilities) and frozen bundle checks pass. See the execution report for exact commands, build metrics, failed earlier attempts and external evidence limits.
