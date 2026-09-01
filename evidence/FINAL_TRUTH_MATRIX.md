# VertexED final truth matrix — 2026-09-02

| Surface | Source-complete | Local verification | Production verified | Outcome verified |
| --- | --- | --- | --- | --- |
| Canonical architecture and artifact contracts | yes | 10 contract tests | no | n/a |
| Auth, onboarding, recovery, logout, deletion | yes | 98 focused tests | no | n/a |
| Account-scoped persistence, idempotent retry and RLS contract | yes | 8 retry + 5 singleton tests; structural matrix green | migration not applied; no live two-account proof | n/a |
| Notes, quiz and paper generation with deterministic fallback | yes | 27 focused grading/fallback tests | no | no |
| Evidence-bound grading/remediation/coverage | yes | 16 contract + 5 frozen-eval tests | no | no |
| Supabase hardening and recovery runbook | yes | 5 schema tests | migration not applied/verified | n/a |
| Responsive/accessibility public experience | yes | 17 applicable browser checks | current site not exact revision | n/a |
| Revision/readiness/operational telemetry | yes | unit/build/smoke contract green | live endpoint omits identity/readiness | n/a |
| Release | candidate source passes build and 719 tests | yes | **no** | n/a |
| Learning value | pilot protocol frozen | not run | not run | **no** |

`source-complete` means the checked working tree implements and tests the stated
contract. It does not mean deployed. `production verified` requires the live body and
headers to attest the exact candidate SHA plus a successful disposable-account golden
journey. `outcome verified` requires the bounded pilot in `docs/PILOT_PROTOCOL.md`.
