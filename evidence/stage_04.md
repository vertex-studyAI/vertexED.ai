# VertexED Stage 04 — core learning engine

**Gate: PARTIAL only at the external live boundary.** Mock, notes, reviewer, paper,
notebook and persistence paths pass the 736-test source suite. Notes, flashcards, quizzes
and papers now carry source digests, curriculum/model/prompt metadata, explicit degraded
state, deterministic fallback, malformed-output handling, and persisted generation
identity. Fallback papers preserve requested count/marks but contain no asserted factual
answer key. Shared artifact validation prevents invalid or ambiguous payloads from
reaching storage. Artifact saves now retry one lost response with an owner-scoped
idempotency key; identical retries return the original row and mismatched key reuse
fails with `409`.

Material changes: `api/_handlers/note.js`, `api/_handlers/quiz.js`,
`api/_handlers/paper-generator.js`, `api/_lib/learningArtifactFallbacks.js`,
`api/_lib/verifiedGrading.js`, `api/_lib/userContentStore.js`, both learning clients,
`contracts/studyArtifact.js`, `supabase/migrations/20260902_artifact_idempotency.sql`,
and the shared typed domain contracts. Verification: `npm test` PASS 736/736;
deterministic artifact fallback tests PASS 11/11; artifact idempotency tests PASS 8/8;
singleton planner/notebook replacement tests PASS 5/5;
production build PASS.

Truth boundary: successful live OpenAI/Gemini generation and persistence were not run
because this checkout has no authorized isolated provider/Supabase environment. The
fallback and persistence contracts are source-tested but are not claimed outcome-verified.
Smallest unblock: provide an isolated staging environment and disposable account, then
run one artifact of every kind through create, retry, reload, update, and delete.
