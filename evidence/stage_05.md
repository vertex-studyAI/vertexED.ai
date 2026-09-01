# VertexED Stage 05 — verified grading, remediation and coverage

**Gate: PASS (source).** `vertexed.grading.v1` implements criterion-level scoring,
byte-exact evidence spans, bounded confidence, provisional/verified state, human-review
escalation, a seven-class error taxonomy, targeted remediation, objective coverage, and
stable audit identifiers. Provisional grades never update mastery or weakness history.

Verification: `node --test tests/verified-grading.test.mjs` PASS 16/16 and the combined
contract run PASS 39/39. UI/typecheck/lint and the full 719-test suite pass. Evidence is
in `api/_lib/verifiedGrading.js`, `src/types/learning.ts`, and
`src/pages/NotetakerQuiz.tsx`.

Truth boundary: this proves deterministic grading-control behavior, not the semantic
quality of a live model or a human-equivalence claim.
