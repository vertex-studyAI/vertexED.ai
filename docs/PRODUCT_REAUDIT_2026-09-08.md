# VertexED re-audit — 8 September 2026

## Verdict: FIX / Salvageable

The product has working study flows and a cleaner interface, but passing local tests is not certification of production readiness. This pass inspected exam preparation and shared presentation; it is not a fresh exhaustive audit of every service. Substantial pre-existing uncommitted work remains in the checkout.

## Changed and verified this pass

- Restored blue primary, focus and accent colors in both themes in `src/styles/workbook.css`, retaining readable neutral surfaces. Semantic success colors are not brand accents.
- Production build passed. Public layout/accessibility tests: 15 passed, one desktop-inapplicable mobile-navigation case skipped. Seven viewport checks cover 360–1440px; core light/dark text-pair contrast passed.
- The earlier execution pass recorded 546 passing application tests and a passing mocked authenticated journey. These were not rerun for this palette-only change; see WORKBOOK_EXECUTION_2026-09-08.md for scope and limitations.

## Highest-impact findings (not fixed in this audit)

1. **Selected subject is not a reliable recommendation boundary.** `src/pages/ExamPrep.tsx:99–109` falls back from subject-filtered weaknesses/retries to global entries. A different subject's weak topic can then be paired with the selected subject in `missionRoute`. Due flashcards are global (`src/lib/srDeck.ts`), and pending mock review metadata lacks a subject (`src/lib/examFlow.ts`). Fix the recommendation inputs, not just the displayed label. Verify with Maths-only evidence while Biology is selected: no Maths task should appear unless explicitly labelled as cross-subject work.
2. **Completion belongs to reusable block names, not actual tasks.** `src/pages/ExamPrep.tsx:117–147` stores keys such as subject:practice. Changing the recommended mission or duration can leave a new task checked. Persist a stable session ID and mission snapshot, with per-session block completion. Verify completion of task A never completes a newly created task B.
3. **Daily state uses UTC.** `src/pages/ExamPrep.tsx:47` derives a day from an ISO timestamp. Local midnight does not define rollover, and an idle open tab has no dedicated midnight refresh. Use a shared local-date helper and refresh on visibility/day rollover. Test both sides of local midnight in positive and negative UTC offsets.
4. **Exam planning is coarse.** `src/lib/curriculum.ts` has one exam date for all selected subjects. `src/lib/examPrepCore.mjs` defaults to a diagnostic when other evidence is absent. A diagnostic should remain optional, with an explicit practice/revision choice.
5. **Styling has accumulated layers.** `src/styles/index.css` and `src/styles/workbook.css` contain inherited styling plus overrides. Consolidate tokens and remove demonstrably unused rules incrementally; do not replace working components merely to reduce file count.

## Highest-value extensions, in order

1. **Subject/paper exam calendar.** Extend curriculum/profile types, profile editing, planner integration and ExamPrep to store separate subject/paper dates. Derive urgency from the selected exam. Verify two subjects with different dates receive independent countdowns and schedules, including migration of the existing single date.
2. **Persistent preparation sessions.** Add a session model with ID, subject, mission snapshot, local date, timestamps and completion provenance; integrate with the existing learner-state sync/outbox rather than building a second synchronization framework. Verify reload, offline edits, account switching and two-device conflict recovery. This should resolve completion finding 2 before adding streaks or readiness scores.
3. **Coverage view backed by attempts.** Map syllabus topics to actual attempts, reviewed answers and retry outcomes. Link each indicator to its evidence and next practice action. Unknown coverage must stay unknown, not become a synthetic percentage. Verify empty history, mixed subjects and deleted evidence.
4. **Mistake notebook built on the existing retry queue.** Group reviewed mistakes by topic and show the original response, feedback, retry and change over time. Reuse retry IDs and existing records, avoiding a duplicate queue. Verify retries preserve the original attempt and cannot silently count as improvement without a new result.
5. **Student-controlled session choice.** Offer practice, revision, mock review and optional diagnostic in ExamPrep while keeping evidence-based suggestions. Verify a new learner can begin useful practice without completing a diagnostic.

## Release gates outside this palette pass

- Recheck and restore the custom domain with the owning registrar/Vercel account. Earlier parking-DNS/TLS findings have not been resolved or freshly certified here.
- Verify real authentication, provider responses, per-user database isolation and export/deletion against an authorized test environment. Mocked browser journeys do not prove these.
- The build regenerated a ledger of 245 study-guide files: zero editorially approved, 53 flagged. A content review process is needed before presenting this corpus as verified teaching material.

No new feature extension, production change, commit or push was performed in this re-audit. Blue styling is the implementation change; the findings above are recommendations with explicit completion checks.
