# VertexED implementation checklist, 9 September 2026

Scope: canonical product in `VERTEXED_REPO_ISOLATION.md`. Existing staged and unstaged work is preserved. This is a follow-up to the 8 September audit, not evidence that production has changed.

## What is real, and what is not finished

| Component | Evidence and classification | Decision |
| --- | --- | --- |
| Auth and protected routes | Implemented, with actual React and SDK-fixture regression coverage. Real Google, recovery email and production configuration are still external gates. | Keep; do not call fixture success a live login certification. |
| Paper Maker, notes, quiz, notebook | Real provider integrations and validated outputs. Deterministic offline output is a scaffold, not an equivalent generated paper or verified answer key. Degraded status is surfaced. | Keep both paths with explicit provenance; live provider quality remains unverified. |
| Answer Reviewer and retry loop | Implemented, with learner-confirmed marks and measured attempts separated from suggested marks. Prior golden test covers the learner loop. | Keep; independent educational evaluation remains necessary. |
| Exam Prep | Real session planning, optional diagnostic, exam dates, mock recovery, due retries and history. Completion checkboxes are self-reports, not proof of mastery. | Tighten history validation and chronological ordering. |
| Planner | Real account-bound persistence and calendar UI, but all task creation currently requires AI. Second-task placement dereferences an unbound `this`; midnight editing uses a truthiness default; idle scrolling interrupts reading. | Fix the scheduling implementation and add manual creation. |
| Notebook and planner recovery | Invalid JSON is protected. Arrays containing invalid records currently pass unchecked casts. Notebook domain writes can replace unreadable data. | Validate records at local, cloud and write boundaries without silently dropping work. |
| Guide dataset | Prior content audit: 245 files, zero editorially approved, 53 flags. Imported text exists; an approved evidence base does not. | Keep quarantine. Human source/licensing review is required. |
| Landing and study identity | Implemented blue/white workbook, theme support, bounded cursor effects and revision trace. Prior responsive and keyboard checks exist. | Preserve; fix task usability before adding decorative effects. |
| Cloud operations | Prior read-only inspection found a shared FinanceMeta/Supabase project with missing VertexED capabilities. | Block remote mutation until ownership and an isolated migration plan are approved. |

No inert pseudocode implementation was identified in this pass. Ordinary form placeholders, loading fallbacks and explicitly labelled demonstrations are not fake functionality. The removable dead weight identified here is the unused demo-task helper, duplicated scheduling conversions and the intrusive idle-scroll mechanism.

## Execution queue

- [x] Add manual task creation using the existing modal, with date, start time and duration; keep AI as an explicit optional action.
- [x] Use one tested scheduling module for manual creation, AI placement and edits. Preserve midnight, reject impossible dates/durations and cross-midnight blocks, prevent overlaps and search occupied next days safely.
- [x] Prevent late AI results from writing into a different account or a newer task list. Surface failures inline instead of browser alerts.
- [x] Remove unused demo creation and idle auto-scroll. Do not equate pressing Delete with study completion. Keyboard activation of the actual completion button no longer bubbles into editing.
- [x] Reject malformed/duplicate planner and notebook records at device, cloud and mutation boundaries. Preserve corrupt bytes for recovery/export.
- [x] Validate exam-history timestamps and order by actual instants; preserve unreadable history rather than overwrite it on the next save or restore.
- [x] Add behavioral regression coverage for the bugs above and run the full app suite.
- [x] Render manual planner flows at 1440, 1024 and 390px in both themes; test keyboard, reduced motion, persistence, error handling and make a correction pass. The second correction fixes the old edit-close button overlapping the heading.
- [x] Run lint/copy checks, typecheck, production build, bundle budgets, evaluation fixtures and content audit. Inspect and stage scoped changes.

## Still external

- [ ] Decide shared versus dedicated Supabase ownership; test migrations on an isolated clone, then approve a remote migration plan.
- [ ] Verify real identity/provider/email flows, two-device recovery, deletion and exact deployed revision after clean CI.
- [ ] Obtain licensed editorial approvals and independent grading/pilot results. Never substitute fixture output for research evidence.

## Verification

Baseline this turn: 583 application tests passed, zero failures or skips.

Final local results:

- `npm run test:app`: 599 passed, zero failures or skips (16 added tests).
- `npm run lint:ci`: full lint passes; 250 copy-scanned files, zero findings; both linter tests pass. This does not approve factual educational claims.
- `npm run typecheck`: passes under the existing compiler configuration, which is not strict mode.
- Golden Playwright suite: 10 passed, zero retries or skips. Includes the existing approved-learner journey and three new planner/data-integrity cases. Identity, API and AI behavior use synthetic SDK/network fixtures, not real accounts or providers.
- Captured and inspected manual entry, editing and history-recovery states at 1440, 1024 and 390px in light/dark themes. Corrected dark native-picker contrast, primary-action styling and edit-close overlap; reran browser checks. Screenshots: `test-results/planner-manual-*`, `planner-edit-*`, `exam-history-*` (local ignored evidence, regenerated by the suite).
- `npm run test:eval`: 25 passed. `npm run eval:ask`: 13/13 fixture prompts passed. `npm run eval:grading:check`: six frozen synthetic cases passed; live model evaluation remains `NOT_RUN`.
- `npm run content:audit`: 245 files, zero approved, 53 flags. No guide was promoted to approved status.
- `npm run build:ci`: normal production artifact built after the isolated browser build, 29.14 seconds. `npm run performance:bundle`: no violations. Gzip bytes: initial JS 230,778; initial CSS 38,462; largest JS 232,814; total JS 991,372 against the unchanged 1,000,000-byte total limit. Only 8,628 bytes of total headroom remain; this is a bundle gate, not a measured Core Web Vitals result.
- Read-only Supabase project/migration checks repeated. No SQL, accounts or external data changed. Clean CI, production HTTP and live provider tests were not rerun or certified.
- Final app rerun after the UI correction: 599/599 passed in 8.13 seconds. Both staged and unstaged whitespace checks pass. Reviewed product-file added-line scans found no matches for the checked secret/private-key patterns. Scoped changes are staged, not committed or pushed; unrelated work remains intact. Normal `dist` is restored and isolated browser preview processes have exited. No production deployment was attempted.

## Implemented changes and evidence

| Exact files | Change and expected outcome | Verification |
| --- | --- | --- |
| `src/lib/plannerTasks.mjs`, `src/features/study-calendar/PlannerView.tsx` | Replace the duplicated scheduling conversions and broken `this.s` interval calculation with tested date/time parsing and collision placement. Manual entry works with no AI request; invalid dates, midnight edits, overlaps, rollover and stale responses are handled explicitly. Device persistence starts on the action rather than after an 800ms debounce. | `tests/planner-tasks.test.mjs`; manual/reload/edit, provider-failure and delayed-week-plan cases in `e2e/auth-return.spec.ts`. |
| `src/features/study-calendar/components/Schedule.tsx` | Remove idle and periodic auto-scrolling; expose explicit current-time navigation. Delete no longer records completion. Child completion buttons retain native keyboard activation. | Keyboard completion and Delete behavior in the browser test; hydration/accessibility assertions. |
| `src/lib/snapshotValidation.mjs`, `src/lib/plannerSync.ts`, `src/lib/notebookSync.ts`, `src/lib/notebook.ts` | Validate local records, fetched cloud snapshots and outgoing device writes. Accept supported legacy planner aliases and notebooks without suggested questions. Reject invalid nested data and duplicate identities without dropping records. | `tests/snapshot-validation.test.mjs`, `tests/snapshot-recovery-runtime.test.mjs`, actual notebook mutation tests and malformed-record browser case. |
| `src/lib/examSessionHistory.mjs`, `src/lib/examSessionStore.ts`, `src/lib/learnerStateSync.ts`, `src/pages/ExamPrep.tsx` | Normalize valid timestamps to UTC, compare actual instants, reject impossible timestamps and reversed session chronology. Preserve broken history through saves/restores and report it instead of showing an empty state. A new session remains queued for cloud sync when the original device history cannot be replaced safely. | Offset/chronology unit tests, actual store runtime test, rendered history error at three widths in both themes. |
| Planner styles and `brand/*` | Keep the opaque workbook surface, blue controls, readable form text, native keyboard inputs and light/dark pickers. Reuse existing primitives with no added package. | Screenshots, focus-return checks, input bounds, reduced motion and two visual correction passes. |

## Important limits

- This is not a clean checkout or a separately certified staged-only tree. There are substantial earlier user-owned changes; whole-worktree validation includes them. In particular, notebook source-limit tests and implementations existed before this follow-up and were preserved, not invented as new work.
- Generated output validation is not educational validation. The deterministic scaffold deliberately has no factual answer key; source-extraction questions are not an approved exam question set. No live model quality or learning gains were measured.
- The configured Supabase project was rechecked read-only on 9 September: active/healthy, with the same 30 migration entries through 4 September, including FinanceMeta. Missing-capability catalog evidence is from 8 September; no new catalog inspection or remote migration was performed in this follow-up. The unchanged ledger is not a substitute for isolated migration testing.
- Strict TypeScript mode, broad component decomposition, real multi-device conflict certification, independent content approval and provider/deployment certification remain unfinished. They are not fixed by adding more visual effects. Do not apply database changes without an ownership decision.
- No new dependency, placeholder result, weakened check, remote data mutation or production deployment was introduced.

Verdict: **FIX**. The learner workflow is real and worth keeping. The repaired planner now works without AI, but release readiness is still gated by cloud ownership/migrations, live integration evidence and educational content approval.
