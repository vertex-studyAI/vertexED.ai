# VertexED content ecosystem progress

Updated: 19 October 2026. Scope: repository implementation and local verification. Production deployment is not authorised.

## Audit baseline

- React/Vite client, authenticated catch-all API, Supabase Auth, owner-filtered `user_study_artifacts` and `learner_state_items`, existing account-scoped device fallback and conflict-aware notebook sync.
- Study Notebook already generates guides, quizzes, flashcards, concept maps, outlines and other source-based outputs. AI Notes, Paper Maker, Apex, timed/adaptive practice, planner and export flows already exist.
- Existing generated quiz keys remain provisional. Deterministic approved question keys are the only current source of measured mastery. Learner self-checks are not independent verification.
- Publication register has no approvals. AP/MYP authored content is held by the build. A directory entry, a generated resource and verified syllabus coverage are different states.
- Large unrelated and ongoing working-tree changes existed before this work. They are preserved. Existing release evidence is historical and is not a test receipt for these changes.

## Work in progress

1. Add a curriculum hierarchy and syllabus version to private notebooks and generated resources, including SAT and university course labels.
2. Add a resumable study-set workflow using existing authenticated generation, usage limits and persistence: notes, cards, quiz and revision guide.
3. Strengthen structured output validation, source provenance, duplicate rejection and version retention.
4. Produce a reproducible coverage inventory that explicitly records missing boards, topics, denominators and review approvals.
5. Verify unit/API/persistence flows and responsive browser journeys, including failure and resume.

## Verification receipts

Pending for this change. No new capability is certified yet.

## Remaining coverage and external gates

- Every subject/topic across every board is not authored or verified. Full coverage requires authoritative versioned specifications, topic-level mapping, original resources, independent factual/answer review and rights records for each published revision.
- SAT and university subjects do not currently have an approved static corpus. Existing general curriculum tool routes do not establish topic coverage.
- Live provider quality, actual hosted persistence/RLS and two-device operation need isolated environment receipts. Existing repository reports describe a shared hosted database and unavailable local replay; no remote schema changes are part of this pass.
- A browser-run resumable generation sequence is not a durable server worker. Unattended jobs need a worker/queue deployment, credentials, admission accounting and operational testing.
- Independent curriculum review and production deployment remain separate from local engineering checks.
