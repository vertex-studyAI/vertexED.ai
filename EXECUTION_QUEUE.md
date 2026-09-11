# VertexED Immediate Execution Queue

Updated: 2026-09-11. This is the current product execution control point; older cross-portfolio and pre-September status files are historical unless reconfirmed against current `main`.

Current exact source at reconciliation: `main@97484ee9e68c1779f25f2276c307b30e7bb60168`.

Current-main evidence:
- canonical CI run `34604041673`: `build-and-test` **SUCCESS**, `browser-local-accessibility` **SUCCESS**, `database-contract` **SUCCESS**, and `browser-authenticated-golden` **SUCCESS**;
- the same exact-source run: `browser-production` **FAILURE** at `Run production browser certification`, followed by `smoke-production` **FAILURE** at `Wait for production deployment and run smoke tests`;
- source/build, local browser accessibility, database-contract, and authenticated deterministic journey checks therefore pass on this SHA;
- production deployment/canonical-host recovery remains the active release blocker, consistent with VX-203 / issue #44. Do not weaken revision/readiness assertions or create sentinel commits to bypass it.

| ID | Priority | Exact outcome | Files/systems | Prerequisites | Verification/evidence | Risk | Resource | Acceptance | State |
|---|---:|---|---|---|---|---|---|---|---|
| VX-201 | P0 | Remove manufactured mastery and route measured quiz weakness into adaptive notes | Mock/reviewer/weakness/notetaker | Existing measured-v1 boundary | `node --test tests/adaptive-notes-workflow.test.mjs`; CI | Progress semantics | LIGHT | Completion/free-form text cannot affect weakness; measured target resolves and is explained | DONE |
| VX-202 | P0 | Certify branch in canonical GitHub CI | Branch/PR and CI workflow | GitHub API/Git transport reachable | Current-main run `34604041673`: source/build, local browser, database-contract, and authenticated-golden pass; production browser/smoke fail and are routed to VX-203 | Low | MEDIUM | Build/test and browser jobs pass; smoke truth reported | BLOCKED |
| VX-203 | P0 | Restore canonical production health on exact deployed revision | Owning Vercel project and `vertexed.app` | Owning-project/domain access | `EXPECTED_VERTEXED_REVISION=<sha> npm run test:smoke`; production browser; two monitors | Live release | MEDIUM | One intentional Vercel project owns the canonical hostname; DNS/TLS works; revision/readiness/HEAD plus all smoke checks pass on the same immutable deploy | BLOCKED |
| VX-204 | P0 | Prove production auth and isolation | Canonical Supabase/Vercel; two identities | VX-203 green; approved disposable identities/access | Authenticated Playwright, denial evidence, cleanup log | User data/auth | MEDIUM | Signup/login/OAuth/recovery/logout/resume/deletion and cross-account denial pass against the same certified production revision | BLOCKED |
| VX-205 | P0 | Certify production DB contract | Migrations/RLS/indexes/functions | Authorized Supabase production access | Run `docs/PRODUCTION_SQL_CHECKS.sql`; retain non-secret output | Tenancy | LIGHT | Migrations, RLS, FK, indexes and execute privileges match | BLOCKED |
| VX-206 | P1 | Add browser coverage for adaptive notes and mock review | Playwright golden journey | Deterministic auth preview | PR #778 added deterministic browser coverage; PR #779 added post-merge verification; `e2e/adaptive-integrity.spec.ts` and `vx-206-browser-integrity.yml` are on main | UX/regression | MEDIUM | Forged adaptive target rejected; verified-evidence label shown only for measured target; timed mock completion creates no score and leaves weakness evidence unchanged | DONE |
| VX-207 | P1 | Run live provider quality gate with frozen identities | OpenAI/Gemini eval harness | Authorized keys/quota/cases | Raw outputs, hashes, latency, slices, model IDs | Cost/claims | MEDIUM | Thresholds frozen first; negative results retained | BLOCKED |
| VX-208 | P1 | Certify school pilot package and run consented pilot | Pilot/export/privacy/support | School/privacy owner and cohort; production release gates green | Checklist, pre/post export, incident drill, analysis | Minors/privacy | HEAVY | Privacy/safety/support/failure criteria pass; uncertainty reported | BLOCKED |

State vocabulary: `TODO`, `RUNNING`, `BLOCKED`, `FAILED`, `VERIFYING`, `DONE`.

## Execution rule

Do not create sentinel/no-op commits, weaken revision/readiness assertions, or add unrelated feature families to work around VX-203. Until VX-203 and VX-204 are green, prioritize release-path recovery, production certification, accessibility/reliability closure, and evidence-backed product work over expansion or outreach.
