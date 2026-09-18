# VertexED Immediate Execution Queue

Updated: 2026-09-18. This is the current product execution control point; older cross-portfolio and pre-September status files are historical unless reconfirmed against current `main`.

Current exact source at reconciliation: `main@779cb66044e655f6bfcca989fab52f05cbf6f762`.

## Verified 2026-09-18

Source (local worktree on exact post-merge `main`):
- `npm run typecheck` **SUCCESS**
- `npm run test:app` **896/896 PASS**

Merged onto `main` this session (all previously green + MERGEABLE):
- #896 notetaker stale-work invalidation
- #898 onboarding account-owned save invalidation
- #899 login/password-reset serialization
- #902 study-guide curriculum packaging on Vercel
- #903 pin engineering workflow runtimes
- #904 clear high-severity dev dependency audit findings
- #906 bind release control docs to current main

Production / hosting boundary (do **not** conflate with source CI):
- `https://www.vertexed.app` still fails **before application HTTP** (`SSL_ERROR_SYSCALL` / `ECONNRESET`). DNS A records remain `2.59.170.20` and `104.219.250.37` with **no CNAME**.
- `https://vertex-ed-ai.vercel.app` serves application HTTP: `/` **200**, `/api/health` **200** with live revision header (observed rolling onto post-merge SHAs such as `538b129…` during deploy).
- `https://vertex-ai.vercel.app` serves `/` **200** but `/api/health` **404** (not a full API surface from this probe).
- Available Vercel CLI identity (`build-the-future-11`) has **no** access to either VertexED Vercel project or the custom domain. VX-203 remains **provider/DNS ownership**, not an application-source rollback.

Issue #44 updated with this checkpoint comment.

| ID | Priority | Exact outcome | Files/systems | Prerequisites | Verification/evidence | Risk | Resource | Acceptance | State |
|---|---:|---|---|---|---|---|---|---|---|
| VX-201 | P0 | Remove manufactured mastery and route measured quiz weakness into adaptive notes | Mock/reviewer/weakness/notetaker | Existing measured-v1 boundary | adaptive-notes tests; CI | Progress semantics | LIGHT | Completion/free-form text cannot affect weakness; measured target resolves and is explained | DONE |
| VX-202 | P0 | Certify branch in canonical GitHub CI | Branch/PR and CI workflow | GitHub API/Git transport reachable | Post-merge tip must re-run main CI; prior PR heads for #896–#906 had SUCCESS build/a11y/db/golden | Low | MEDIUM | Build/test and browser jobs pass on exact main tip; smoke truth reported | VERIFYING |
| VX-203 | P0 | Restore canonical production health on exact deployed revision | Owning Vercel project and `www.vertexed.app` | Authorized access to owning project (`vertex-ed-ai` is the live API candidate; confirm sole owner) | DNS→TLS→`/api/health` on custom domain; `EXPECTED_VERTEXED_REVISION=<sha> npm run test:smoke`; monitors #44/#652 | Live release | MEDIUM | One intentional Vercel project owns the hostname; DNS/TLS works; revision/readiness/HEAD plus smoke pass on same immutable deploy | BLOCKED |
| VX-204 | P0 | Prove production auth and isolation | Canonical Supabase/Vercel; two identities | VX-203 green; approved disposable identities/access | Authenticated Playwright, denial evidence, cleanup log | User data/auth | MEDIUM | Signup/login/OAuth/recovery/logout/resume/deletion and cross-account denial pass against certified production revision | BLOCKED |
| VX-205 | P0 | Certify production DB contract | Migrations/RLS/indexes/functions | Authorized Supabase production access | Run `docs/PRODUCTION_SQL_CHECKS.sql`; retain non-secret output | Tenancy | LIGHT | Migrations, RLS, FK, indexes and execute privileges match | BLOCKED |
| VX-206 | P1 | Browser coverage for adaptive notes and mock review | Playwright golden journey | Deterministic auth preview | On main via prior PRs | UX/regression | MEDIUM | Forged adaptive target rejected; measured evidence labels truthful | DONE |
| VX-207 | P1 | Live provider quality gate with frozen identities | OpenAI/Gemini eval harness | Authorized keys/quota/cases | Raw outputs, hashes, latency, slices, model IDs | Cost/claims | MEDIUM | Thresholds frozen first; negative results retained | BLOCKED |
| VX-208 | P1 | Certify school pilot package and run consented pilot | Pilot/export/privacy/support | School/privacy owner; production gates green | Checklist, pre/post export, incident drill | Minors/privacy | HEAVY | Privacy/safety/support/failure criteria pass; uncertainty reported | BLOCKED |

State vocabulary: `TODO`, `RUNNING`, `BLOCKED`, `FAILED`, `VERIFYING`, `DONE`.

## Execution rule

Do not create sentinel/no-op commits, weaken revision/readiness assertions, or add unrelated feature families to work around VX-203. Until VX-203 and VX-204 are green, prioritize release-path recovery (authorized DNS/domain ownership), production certification, and evidence-backed product work over expansion or outreach.

## Next human/provider action (VX-203)

1. Grant CLI/dashboard access to the intentional owner of `www.vertexed.app` (candidate with live `/api/health`: `ryan-gomezs-projects-5a5ab995/vertex-ed-ai`).
2. Read that project’s exact custom-domain DNS target; replace the current Namecheap/Worldstream A records only after ownership is proven.
3. Detach or clearly demote the non-canonical duplicate project after ownership is proven.
4. Re-run production health monitor and smoke against `www.vertexed.app` on one immutable SHA.
