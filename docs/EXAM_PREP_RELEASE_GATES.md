# Exam preparation release gates

8 September 2026. Working-copy implementation evidence, not a production certificate.

## Implemented

- Subject-scoped recommendations and mock metadata. Unknown-subject work is not attributed to the selected subject. Flashcards explicitly remain a mixed-subject queue.
- Optional baseline practice, ordinary practice and revision choices. Baseline practice is not represented as a validated diagnostic.
- Local-day rollover and task-bound completion. Legacy completion is not accepted as a valid session snapshot.
- Subject and paper dates stored in existing account preferences, validated before save, selected in exam prep, displayed in the planner and passed to weekly planning.
- Session IDs, timestamps and task snapshots, with account-scoped local history and the existing durable learner-state outbox. History is self-reported activity, not measured learning.
- Topic evidence exposes recorded marks and verification references. Existing topic retries are reused. Missing original-answer links remain explicitly missing; syllabus coverage cannot be inferred from these records.
- Recovery reports local write failures instead of silently presenting a partial restore as complete.

## Validation observed

### Current audit update, 8 September 2026

The browser blockage recorded below has been overcome locally. The fresh isolated golden build passes all seven auth/recovery/core-journey tests, including exam preparation and session history. The current application suite passes 583 tests. Desktop/tablet/mobile captures exist for the exam workspace and recovery states; local keyboard and reduced-motion regressions pass. This uses synthetic network responses, not a real provider/database certificate.

The configured remote Supabase project was inspected read-only. It lacks `learner_state_items`, the batch-sync and readiness RPCs, and other September database capabilities. Its history includes another application's migrations and shared Auth triggers. Both the existing exam-session migration and `20260908165433_exam_session_readiness.sql` require validation and a reviewed shared-project migration plan. Docker remains unresponsive; no local reset, SQL execution test or remote DDL was performed. See `docs/ASTRA_EXECUTION_2026-09-08.md` for the current evidence and blockers.

### Earlier run, retained for history

- Application suite: 557 passed, zero failures and zero skips, after the build had restored the neutral revision module.
- Focused exam, health and revision tests: 26 passed.
- Production build passed. Frozen bundle budgets passed: initial JS 222,408 gzip bytes, total JS 980,528 gzip bytes.
- Full ESLint and copy checks passed; 240 source files scanned with zero copy findings. Copy-rule tests: two passed.
- The authenticated browser suite did not complete: first a sandbox port denial, then a 300-second production-server startup timeout. Standalone build later completed in 4m28s.
- In-app browser inspection was denied because its admin policy could not be verified. No bypass or substitute visual certification was attempted.

## Required before release

1. Validate the ordered ledger through `supabase/migrations/20260908165433_exam_session_readiness.sql` against a disposable local database, including service-only RPC permissions and two-account isolation. Docker info was unresponsive on this host. No database schema was changed remotely.
2. Apply the validated migration before releasing clients that queue `exam_session`. Existing databases reject this new type. Never discard the pending outbox to conceal that error.
3. Repeat the locally passing authenticated journey against an authorized isolated real backend: session reload, duration reset, optional baseline and evidence disclosure. Fixture browser success does not certify production persistence.
4. Exercise two devices, offline retries, browser-storage exhaustion and account export/deletion with actual session records. The reused outbox is not a substitute for this evidence.
5. Integrate reviewed work with current main in an isolated worktree, then run CI on the exact proposed release revision. The successful working-copy build is not this certificate.
6. Resolve the owning Vercel team/project and custom-domain configuration. The preview deployments of revision 7cc7688 do not prove that the production domain serves these changes.

## Evidence limits

The imported guide corpus still has 245 files, zero editorially approved guides and 53 review flags. No editorial approvals or learning-outcome results were manufactured. Live provider, real-account and production checks remain separate from mocked application tests.
