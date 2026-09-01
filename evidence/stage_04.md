# VertexED Stage 04 — core learning engine

**Gate: PARTIAL.** Existing mock, notes, reviewer, paper, notebook and persistence
paths pass the 696-test source suite. Quiz generation now has objective/provenance/model
metadata, explicit degradation state, deterministic SHA-bound fallback, malformed-output
handling, and persistence of grading audits. Shared artifact validation prevents invalid
or ambiguous payloads from reaching storage.

Material changes: `api/_handlers/quiz.js`, `api/_lib/verifiedGrading.js`,
`src/pages/NotetakerQuiz.tsx`, `contracts/studyArtifact.js`, and the shared typed domain
contracts. Verification: `npm test` PASS 696/696; production build PASS; focused
grading/contract suite PASS 39/39.

Truth boundary: successful live OpenAI/Gemini generation and persistence were not run
because this checkout has no authorized isolated provider/Supabase environment. Existing
note and paper provider fallbacks are source-tested but are not claimed outcome-verified.
Smallest unblock: provide an isolated staging environment and disposable account, then
run one artifact of every kind through create, retry, reload, update, and delete.
