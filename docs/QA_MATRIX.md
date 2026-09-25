# VertexED QA matrix

> Current completion scope: [complete-product publication checklist](PUBLISHABLE_COMPLETION_CHECKLIST.md) and [gate register](COMPLETION_GATE_REGISTER.json). Results and statuses below are historical; they do not certify the current release.

**Evidence date:** 2026-09-20  
**Source under test:** checkout `b009c9ab` plus the preserved working tree  
**Canonical local runtime:** Node 22.22.0; locally available npm 10.9.4  
**Release interpretation:** local PASS is engineering evidence for this tree, not production certification

## Verification results

| Check | Command | Result | Important failure | Probable root cause | Release meaning |
|---|---|---|---|---|---|
| Git baseline | `git status --short --branch`; SHA/upstream queries | FAIL for release | Dirty tree, non-canonical marker, 12 commits behind `origin/main` | Work continued in a WIP/shadow checkout | Cannot bind this evidence to a deployable candidate. |
| Runtime | Node/npm version queries | PARTIAL | npm 10.9.4 does not equal `packageManager` 10.9.8 | Node distribution's bundled npm; CI does not pin npm separately | Tests are valid locally, but install reproducibility needs resolution. |
| Lint/copy | `npm run lint:ci` | PASS | 0 copy findings; 2 copy tests pass | N/A | Source and copy gate pass. |
| TypeScript | `npm run typecheck` | PASS | None | N/A | Compile-time app surface passes. |
| App tests | `npm run test:app` | PASS | 1,072 passed, 0 failed, 0 skipped | N/A | Broad client/API/unit contracts pass. |
| Eval tests | `npm run test:eval` | PASS | 25 passed | N/A | Evaluation harness behaviour passes. |
| Ask fixtures | `npm run eval:ask` | PASS | 13/13, average 4.38/5 | N/A | Offline fixtures pass; no live quality claim. |
| Grading fixture gate | `npm run eval:grading:check` | PASS/PARTIAL | 6 synthetic fixtures pass, false-verified rate 0; live model `NOT_RUN` | No authorised live provider evaluation in this run | Structural safety passes; educational/provider quality remains unverified. |
| Dependency audit | `npm run audit:prod` | PASS on network-enabled retry | First sandbox attempt had no vulnerability metadata | Registry/network restriction | No high/critical production dependency vulnerability was reported. |
| Content provenance | Build pre-step and `content:audit` | PARTIAL | 245 inventoried, 0 approved, 53 flagged | Editorial review is deliberately human-gated | Unapproved guides must remain out of the public sitemap. |
| Vercel function cap/routes | Build pre-step | PASS | 1 deployed function, 22 routed endpoints | N/A | Hobby function limit and registry validation pass. |
| Production build | `npm run build:ci` | PASS | 2,617 modules transformed | N/A | Current local source builds with a stamped revision. |
| Bundle budget | `npm run performance:bundle` | PASS after fix | Initial audit exceeded CSS cap by 767 B | Eager `Home` import before auth redirect | Final build passes all four frozen budgets. |
| Lazy-route regression | `node --test tests/build-performance.test.mjs` | PASS | 3 targeted tests pass | N/A | Home and other expensive surfaces retain lazy boundaries. |
| Landing claim boundary | `node --test tests/landing-claim-boundary.test.mjs` | PASS | 1 targeted test passes | N/A | Unsupported institutional-support language is excluded. |
| Selected local browser suite | Playwright: `local-accessibility`, `guided-reasoning`, `login-lens-stack`, desktop project with internal viewports | PARTIAL/PASS | Initial run: 23 passed, 1 skipped, 1 timed out during a full-page 390px screenshot after assertions | Software-rendering an 18,308px page exceeded a generic 45s test budget | Product assertions passed; timeout configuration required correction. |
| Corrected 390px auth surfaces | Playwright grep for `public auth surfaces keep visible keyboard focus and fit at 390px` | PASS | 1 passed in 11.9s | N/A | Landing, login and signup fit at 390px and retain visible keyboard focus. |
| Local database contracts | Supabase start followed by planned `npm run db:test` | BLOCKED | Database container exited 255; Colima stopped; SQL suite did not run | Local VM/container failure; host system volume was 98% used | Migrations and RLS are not certified by this audit. |
| Production Gate 1a | `npm run probe:gates` | FAIL | `BLOCKED_TLS_FAIL_BEFORE_HTTP` on `www.vertexed.app` | External DNS/certificate/domain attachment | Custom-domain launch is blocked. |
| Production Gate 1b | `npm run probe:gates` | FAIL | Fallback readiness HTTP 503 degraded | Production dependency/readiness configuration | Core authenticated production behaviour is not certifiable. |
| Production unauthorized API | `npm run probe:gates` | PASS, bounded | `/api/agents` returned 401 without auth | Expected protection | Proves unauthenticated rejection only, not full authorization. |

## Final bundle measurements

| Metric | Actual gzip | Frozen budget | Status |
|---|---:|---:|---|
| Initial JavaScript | 234,273 B | 275,000 B | PASS |
| Initial CSS | 34,506 B | 45,000 B | PASS |
| Largest JavaScript chunk | 130,258 B | 240,000 B | PASS |
| Total JavaScript | 880,798 B | 1,000,000 B | PASS |

The initial bundle no longer includes the Home route for an authenticated user waiting to redirect. The Home route remains a separate 17.85 KB gzip JavaScript chunk and 12.27 KB gzip CSS chunk.

## Critical journey matrix

| Journey | Input | Backend/persistence | Refresh/repeat behaviour | Failure state | Automated evidence | Current status |
|---|---|---|---|---|---|---|
| Landing to beta request | Email and beta form fields | `POST /api/waitlist`, durable rate limit, waitlist table | Duplicate request normalises to existing state | Explicit validation/rate/storage error | Unit/API tests and responsive public browser checks | PARTIAL: production delivery unverified |
| Invite to account | Invite token and account fields | Auth admin plus atomic waitlist claim/finalisation | Token/replay paths are source-tested | Bounded expired/invalid/conflict response | App tests | PARTIAL: SMTP/production path unverified |
| Login/callback/logout | Credentials/OAuth callback/session | Supabase Auth session | Hydration, refresh and logout code exists | Retry, error and recovery UI | App tests and local login browser spec | PARTIAL: production provider path unverified |
| Onboarding to dashboard | Curriculum/profile selection | Owner profile write | Protected-route state reload | Auth/waitlist retry state | App tests | PARTIAL: production fresh-user run missing |
| Note to generated material | Text/file-derived input | Authenticated provider request; validated output; optional artifact save | Account-scoped saved state and explicit local/cloud status | Timeout/provider/invalid-output states | App/provider contract tests | PARTIAL: live provider not run |
| Answer review | Text/image answer | Review handler, exact-span validation, saved review and learner state | Saved review and retry survive reload by design | Provisional result or explicit error | App/eval fixture tests | PARTIAL: live quality and DB execution unverified |
| Planner/notebook save | Learner goals/content | Owner-scoped singleton/update with concurrency checks | Multi-tab revision and corruption recovery code exists | Local-only/conflict/recovery UI | App tests | PARTIAL: SQL runtime not executed |
| Return to due retry | Measured/eligible weakness | Learner state plus retry queue | Dashboard/tool links recover state | Empty/no-measured-retry state | App tests | IMPLEMENTED locally |
| Export account | Authenticated user | Bounded pagination of owned cloud state plus allowlisted device data | Repeat should remain read-only | Explicit cap/error rather than partial success | App tests | PARTIAL: production execution missing |
| Delete account | Authenticated confirmation | Session revocation, Auth deletion and database cascades | Repeat must be safe | Explicit failure/re-auth path | App tests | PARTIAL: production execution missing |
| Admin waitlist | Authenticated admin action | Server-side `requireAdmin`, rate limit and bounded DB operation | Repeat/action semantics depend on command | 401/403/429/5xx states | Authorization/unit tests | PARTIAL: production role path missing |

## Adversarial state matrix

| State | Expected behaviour | Evidence | Status |
|---|---|---|---|
| Anonymous user opens protected route | Redirect/wait for resolved auth without rendering private data. | Protected-route tests. | PASS locally |
| Expired access token | Refresh once where safe; do not loop or replay unsafe background persistence. | `apiAuth` tests and source contract. | PASS locally, production unverified |
| Unauthorized object ID | Owner predicate and RLS deny access without trusting request `user_id`. | Handler/source tests; SQL runtime absent. | PARTIAL |
| Malformed JSON | Router returns 400. | Route registry tests. | PASS locally |
| Oversized JSON/image/audio | Router/handler returns 413 or a bounded validation error. | Route and handler tests. | PASS locally |
| Prompt injection in learner content | Provider output remains untrusted; server contracts control returned structure/evidence status. | Output/verified-grading tests. | PASS structurally, live adversarial eval unverified |
| Empty or malformed model response | Retry only where bounded; return deterministic fallback or explicit 502/provisional output. | Provider/output tests. | PASS locally |
| Model timeout | Abort at configured deadline; record fixed-field failure; show recoverable message. | Timeout/provider tests. | PASS locally, live unverified |
| Repeated create/save | Reuse owner-scoped idempotency key or conditional singleton update. | User-content store tests. | PASS locally, DB runtime unverified |
| Multiple tabs | Compare the revision actually read and surface conflict rather than overwrite silently. | Persistence/concurrency tests. | PASS locally |
| Corrupt device JSON | Stop editing, retain original bytes in account-owned backup and require recovery. | Device-persistence tests. | PASS locally |
| Network interruption | Preserve foreground result/local copy and surface pending/local-only state where supported. | Recovery/outbox tests. | PASS locally; browser fault journey TODO |
| Missing database row | Return empty/404 semantics without fabricating data. | Handler tests. | PASS locally |
| Database/rate-limit store unavailable | Fail closed in production with 503. | Source/unit tests; fallback readiness currently 503. | PASS as safety behaviour, production unhealthy |
| Very long text | Client and API length/body limits reject or bound it. | Schema/body-limit tests. | PASS locally |
| Unsafe HTML/markdown | Sanitised renderer/DOMPurify and controlled links. | Rendering/sanitisation tests. | PASS locally |
| Slow/reduced-motion/mobile user | Reduced animation, responsive layout and visible keyboard focus. | Selected Playwright run at 1440/1024/390. | PASS for selected routes |

## Responsive and accessibility matrix

| Surface | 1440px | 1024px | 390px | Keyboard | Reduced motion | Status |
|---|---|---|---|---|---|---|
| Landing and guided reasoning | Inspected | Inspected | Inspected, no horizontal overflow | Focus assertions pass | Assertions pass | PASS for selected build |
| Login/signup | Inspected | Covered by layout rules | Corrected focused case passes | Visible focus passes | Covered by local suite | PASS locally |
| Features | Inspected | Covered by selected browser run | Covered by responsive assertions | Focus/controls covered | Covered | PASS for selected checks |
| Authenticated tools | Not fully rerun in this work session | Not fully rerun | Not fully rerun | Unit/accessibility boundaries exist | Source rules exist | UNVERIFIED as a complete matrix |

The mobile landing capture was visually inspected after the final rebuild. Its layout is legible and contained, but the 18,308px height is a product-density concern tracked as VX-302.

## Security test matrix

| Control | Source evidence | Runtime evidence | Status |
|---|---|---|---|
| Bearer verification | `api/_lib/auth.js` and handler tests | Unauthenticated agents endpoint returned 401 | PARTIAL |
| Server-side admin check | `api/_lib/admin.js`, waitlist-admin tests | Not exercised on production account | PARTIAL |
| Owner-scoped service queries | User-content, learner-state, export/delete tests | SQL/two-account run blocked | PARTIAL |
| RLS policies | Migration and architecture contract tests | Local replay blocked | UNVERIFIED at runtime |
| Input/body validation | Central router and endpoint schemas/tests | Local API tests pass | PASS locally |
| Rate limits | Durable DB limiter and unit tests | Readiness degraded; production store not certified | PARTIAL |
| Provider deadlines/output validation | Provider wrappers and handler tests | Live eval not run | PARTIAL |
| Secrets | `.env.local` ignored; only `.env.example` tracked | Remote settings not inspected | PARTIAL |
| Security headers | `vercel.json` tests/build validation | Custom domain unavailable | PARTIAL |
| Dependency risk | Production audit evidence | Network-enabled audit passed | PASS for known dependencies |

## Required release rerun

Run this sequence from a clean exact-revision candidate:

1. `npm ci` under the declared Node/npm versions.
2. `npm run ci`.
3. Start isolated Supabase, then `npm run db:test`.
4. Build and run the complete local responsive/keyboard/reduced-motion suite.
5. Run authenticated two-account authorization and lifecycle journeys against staging.
6. Deploy the exact SHA and verify transport, readiness, source identity and rollback revision.
7. Run production smoke/golden journeys without mutating real learner data.

Any failed or unverified P0 row keeps the release decision at NO-GO.
