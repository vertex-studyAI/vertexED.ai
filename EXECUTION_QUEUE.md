# VertexED Immediate Execution Queue

Updated: 2026-09-03. This supersedes the stale cross-portfolio queue previously stored here; its history remains in Git.

| ID | Priority | Exact outcome | Files/systems | Prerequisites | Verification/evidence | Risk | Resource | Acceptance | State |
|---|---:|---|---|---|---|---|---|---|---|
| VX-201 | P0 | Remove manufactured mastery and route measured quiz weakness into adaptive notes | Mock/reviewer/weakness/notetaker | Existing measured-v1 boundary | `node --test tests/adaptive-notes-workflow.test.mjs`; CI | Progress semantics | LIGHT | Completion/free-form text cannot affect weakness; measured target resolves and is explained | DONE |
| VX-202 | P0 | Certify branch in canonical GitHub CI | Branch/PR and CI workflow | GitHub API/Git transport reachable | Required checks green on exact SHA; run URL retained | Low | MEDIUM | Build/test and browser jobs pass; smoke truth reported | BLOCKED_NETWORK |
| VX-203 | P0 | Restore canonical production health on exact deployed revision | Owning Vercel project and `vertexed.app` | Owning-project access | `EXPECTED_VERTEXED_REVISION=<sha> npm run test:smoke`; two monitors | Live release | MEDIUM | Revision/readiness/HEAD plus all smoke checks pass | BLOCKED |
| VX-204 | P0 | Prove production auth and isolation | Canonical Supabase/Vercel; two identities | Approved identities/access | Authenticated Playwright, denial evidence, cleanup log | User data/auth | MEDIUM | Signup/login/OAuth/recovery/logout/resume/deletion and cross-account denial pass | BLOCKED |
| VX-205 | P0 | Certify production DB contract | Migrations/RLS/indexes/functions | Supabase access | Run `docs/PRODUCTION_SQL_CHECKS.sql`; retain non-secret output | Tenancy | LIGHT | Migrations, RLS, FK, indexes and execute privileges match | BLOCKED |
| VX-206 | P1 | Add browser coverage for adaptive notes and mock review | Playwright golden journey | Deterministic auth preview | Enter weakness, follow action, see evidence label, submit mock | UX/regression | MEDIUM | Forged target rejected; mock completion creates no score | TODO |
| VX-207 | P1 | Run live provider quality gate with frozen identities | OpenAI/Gemini eval harness | Authorized keys/quota/cases | Raw outputs, hashes, latency, slices, model IDs | Cost/claims | MEDIUM | Thresholds frozen first; negative results retained | BLOCKED |
| VX-208 | P1 | Certify school pilot package and run consented pilot | Pilot/export/privacy/support | School/privacy owner and cohort | Checklist, pre/post export, incident drill, analysis | Minors/privacy | HEAVY | Privacy/safety/support/failure criteria pass; uncertainty reported | BLOCKED |

State vocabulary: `TODO`, `RUNNING`, `BLOCKED`, `FAILED`, `VERIFYING`, `DONE`. Do not expand outreach while VX-203 or VX-204 is red/blocked.
