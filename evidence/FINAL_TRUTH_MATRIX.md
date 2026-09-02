# VertexED final truth matrix — 2026-09-02

| Surface | Source-complete | Local exact-candidate evidence | Production verified | Outcome verified |
| --- | --- | --- | --- | --- |
| Canonical architecture and typed artifact contracts | yes | structural and contract tests within 745-test suite | no | n/a |
| Auth, onboarding, recovery, logout and deletion | yes | production-preview golden journey + auth/isolation tests | no | n/a |
| Account-scoped persistence, idempotency and RLS contract | yes | owner-scoped API/storage/schema tests | migration and live two-account denial not run | n/a |
| Notes, quiz, paper generation and deterministic fallback | yes | source/eval tests + mocked golden journey | no | no |
| Evidence-bound grading, remediation and coverage | yes | 25 frozen eval tests + grading contracts | no | no |
| Supabase hardening and recovery runbook | yes | five schema checks + documented restore procedure | advisor/migration/restore not run on intended target | n/a |
| Responsive and accessible public experience | yes | 34 checks pass; two inapplicable cases skipped | no exact-revision production browser run | n/a |
| Bundle and build performance | yes | all four frozen gzip budgets pass | no deployed Web Vitals evidence | n/a |
| Revision/readiness and privacy-safe telemetry | yes | build, health, smoke and telemetry contracts pass | live endpoint lacks revision/readiness identity | n/a |
| Release | yes | clean install; zero audit findings; 745 tests; 25 evals; build; 35 browser checks | **no** | n/a |
| Learning value | pilot protocol and privacy-safe export implemented | 12 export tests; zero participant rows | pilot not run | **no** |

`source-complete` means the branch implements and tests the stated source contract. It
does not mean deployed. `production verified` requires the live body and headers to attest
the exact candidate SHA plus successful disposable-account and intended-target security
checks. `outcome verified` requires the bounded pilot in `docs/PILOT_PROTOCOL.md`.

The authoritative requirement-by-requirement ledger is
`evidence/EXECUTION_BUNDLE_COMPLETION_AUDIT.md` / `.json`. Local deterministic mocks are
identified there and never substituted for production or learning-outcome evidence.
