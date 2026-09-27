# VertexED master audit

**Audit date:** 2026-09-20  
**Audited checkout:** `b009c9ab5b241fb05199db3f82ae3765ab802b81` plus the preserved working tree  
**Release decision:** **NO-GO**  
**Product boundary:** React/Vite client, Vercel catch-all API, Supabase Auth/Postgres, AI provider integrations, curriculum content, and release automation

## Executive summary

VertexED is a substantial private-beta learning product, not a static marketing shell. It has protected study tools, account-scoped persistence, evidence-aware answer review, retry scheduling, exports and deletion, privacy-safe telemetry, route-level input limits, durable production rate limiting, security headers, SEO surfaces, and a broad automated test suite. The canonical application test scope passed **1,072/1,072** in this audit. Lint, copy lint, typecheck, build, eval fixtures, the production dependency audit, and the frozen bundle budgets also passed.

The product is not ready for a public production release. The custom domain fails before HTTP, the fallback deployment reports degraded readiness with HTTP 503, and the production database/authenticated lifecycle has not been certified against the candidate source. The local SQL migration and pgTAP replay could not run because the Colima runtime exited while initialising Supabase; static source tests are useful but cannot replace a database execution. The current checkout is also a dirty WIP checkout 12 commits behind `origin/main`, and `DO_NOT_USE_AS_CANONICAL.md` explicitly quarantines it from production certification.

The educational claim boundary also remains material. The content pipeline found 245 study-guide files, **0 approved**, and 53 flagged for review. The grading benchmark is a six-fixture synthetic check, and the live provider run was `NOT_RUN`. Those results support engineering behaviour only; they do not establish educational efficacy, calibrated grading, or curriculum approval.

This work session fixed two confirmed product issues. The authenticated startup no longer downloads the full landing route before redirecting, reducing initial gzip by about 20 KB of JavaScript and 11 KB of CSS. An unsupported institutional-support section was replaced with truthful product-flow copy and guarded by a regression test. The 390px full-page Playwright case now has a visual-capture-specific timeout and passes without weakening its interaction assertions.

## Current status

| Area | Status | Evidence |
|---|---|---|
| Client application | IMPLEMENTED | React 19/Vite 7 route tree in `src/app/App.tsx`; protected product routes and public content routes build successfully. |
| API surface | IMPLEMENTED | One deployed function, 22 allowlisted routes, method and body-size controls in `api/_lib/routes.js`. |
| Authentication | IMPLEMENTED, PRODUCTION UNVERIFIED | Supabase sessions, bearer verification, protected routes, recovery UI and account lifecycle code exist; no fresh-account production journey was executed. |
| Authorization | IMPLEMENTED, DATABASE UNVERIFIED | Server handlers derive ownership from verified identity and use owner filters; RLS exists in migrations; live cross-account proof is absent. |
| Persistence | IMPLEMENTED, PRODUCTION UNVERIFIED | Cloud artifacts, learner state, idempotency, account-scoped device fallback and corruption recovery exist; production readiness is degraded. |
| AI tools | IMPLEMENTED, LIVE QUALITY UNVERIFIED | Quiz, note, notebook, planner, paper, review, chat and transcription handlers exist with timeouts/validation; live provider evaluation was not run. |
| Curriculum guides | PARTIALLY IMPLEMENTED | 245 files are inventoried, but 0 are approved and 53 are flagged; the sitemap correctly includes 0 guide URLs. |
| Analytics/monitoring | PARTIALLY IMPLEMENTED | Vercel Analytics and Speed Insights are deferred; fixed-schema operational telemetry excludes free text and identity. Alert delivery and production dashboards were not verified. |
| Payments | N/A | No payment or billing implementation was found; the current product is a private beta. |
| Email | SCAFFOLDED, UNVERIFIED | Waitlist/invite and auth flows exist, but provider-side SMTP and recovery delivery were not exercised. |
| Deployment | BROKEN | Custom domain TLS fails before HTTP; fallback readiness is HTTP 503 degraded. |
| Release provenance | BROKEN FOR THIS CHECKOUT | Working tree is dirty, 12 commits behind `origin/main`, and locally marked non-canonical. |

## System map

```text
USER
  -> React route and component
  -> client validation, authFetch, account-scoped recovery state
  -> /api/[[...path]] same-origin catch-all
  -> route allowlist, method/body/origin/auth/rate-limit checks
  -> endpoint handler and untrusted-output validation
  -> Supabase Auth/Postgres or bounded AI provider request
  -> owner-scoped response, provisional evidence, or explicit failure
  -> cloud/device state reconciliation and learner-visible status
```

The detailed route, data and workflow maps are in `docs/ARCHITECTURE.md`.

## Major user journeys

| Journey | Current behaviour | Status | Main evidence gap |
|---|---|---|---|
| Landing to private-beta request | Public page leads to signup; waitlist submission is rate limited and persisted server-side. | IMPLEMENTED | Production email/status follow-through was not exercised. |
| Approved invite to account | Invite handler creates the Auth account and finalises waitlist state through server-owned operations. | IMPLEMENTED | Real production SMTP/invite and expired-token paths remain unverified. |
| Login to first value | Session hydration, waitlist status, onboarding and protected route guards lead to the workspace. | IMPLEMENTED | No current-revision production golden journey. |
| Notes to quiz/material | Input is bounded, provider output is validated, deterministic fallback is available in defined cases, and results can be saved. | IMPLEMENTED | Live-provider quality and cost behaviour are unverified. |
| Answer to evidence-linked review | Provider output is normalised; exact answer spans are required for positive evidence; unsupported output stays provisional. | IMPLEMENTED | Six synthetic fixtures are insufficient for educational claims. |
| Planner/notebook save and return | Owner-scoped cloud snapshots, idempotency/concurrency controls and device fallback exist. | IMPLEMENTED | SQL/RLS execution did not run in this workstation audit. |
| Export and delete account | Bounded export and authenticated delete endpoints exist; client adds allowlisted device data. | IMPLEMENTED | End-to-end production execution and recovery runbook remain unverified. |
| Admin waitlist | Client route uses `AdminRoute`; API independently requires an admin identity. | IMPLEMENTED | Production role assignment and audit operation were not exercised. |

## Broken and incomplete features

### BROKEN

1. **Production custom-domain transport.** `npm run probe:gates` returned `BLOCKED_TLS_FAIL_BEFORE_HTTP` for `www.vertexed.app`. Users cannot reach a product that fails before HTTP.
2. **Production readiness.** The fallback deployment returned HTTP 503 with degraded status. Liveness and an unauthenticated 401 on `/api/agents` do not prove database readiness.
3. **Release provenance in this tree.** This checkout is behind `origin/main`, contains unrelated work, and is explicitly marked non-canonical.

### PARTIALLY IMPLEMENTED

1. **Curriculum publication:** 245 guide files exist; none are approved and 53 require review.
2. **Observability:** operational events are bounded and privacy-safe, but production alert delivery, retention and dashboard use were not verified.
3. **Email/account recovery:** UI and Auth integration exist, while provider delivery remains an external gate.
4. **First-session activation:** instrumentation and a continued-session handoff exist, but a production funnel and completion evidence were not inspected.

### SCAFFOLDED OR UNVERIFIED

1. **Database recovery and backups:** migration discipline exists; remote backup/restore proof was not available.
2. **Live model evaluation:** the harness exists, but the authorised live run is `NOT_RUN`.
3. **Authenticated production browser certification:** CI jobs exist, but no exact-revision receipt for this working tree exists.
4. **Core Web Vitals:** Vercel Speed Insights is wired, but no current trace or field metric was available during this audit.

### MISSING FOR LAUNCH

1. An exact-revision release candidate with clean provenance.
2. Passing custom-domain transport and readiness.
3. Executed database migration/RLS contract proof for the release candidate.
4. Production auth, recovery, persistence, export and deletion receipts.
5. Editorial approval for any curriculum content intended for public indexing.

## Security findings

### Controls present

- Privileged API handlers authenticate independently of client route guards.
- Service-role database work uses the verified user ID in owner predicates.
- The API router allowlists routes and methods and rejects malformed/oversized bodies.
- Production rate limiting is database-backed and fails closed when durable configuration is unavailable.
- Provider calls have deadlines; structured output is treated as untrusted and validated.
- Telemetry deliberately omits prompt, answer, identity, headers, and query strings.
- Vercel config sets HSTS, CSP, frame denial, MIME sniffing denial, referrer policy, permissions policy, no-store API caching and noindex API headers.
- `.env.local` is ignored and not tracked; only `.env.example` is tracked.
- The production dependency audit found no high or critical runtime vulnerabilities.

### Residual risk

| Severity | Finding | Evidence | User consequence | Required validation/fix |
|---|---|---|---|---|
| P0 | RLS and migrations were not executed in this audit. | Supabase startup exited 255 after the Colima VM stopped; source migrations alone are not runtime proof. | Cross-account isolation or schema drift could fail despite passing mocks. | Replay all migrations and pgTAP contracts in isolated CI, then exercise two-account IDOR probes. |
| P0 | Production readiness is degraded. | Fallback `/api/health?readiness=1` returned 503. | Authenticated operations may be unavailable or unsafe to release. | Repair the provider-side readiness dependencies and capture an exact-revision receipt. |
| P1 | Recovery email, OAuth and session-expiry behaviour are unverified in production. | No provider-side journey was run. | A user may be unable to sign in or recover an account. | Execute fresh, expired and revoked-session journeys with a test account. |
| P1 | Runtime secrets and database grants were not inspected remotely. | This audit avoided exposing local secrets and did not mutate the shared Supabase project. | Misconfigured remote settings could bypass source-level assumptions. | Use a scoped production-read audit and retain a redacted evidence artifact. |
| P1 | Network restrictions are not certified. | Local `supabase/config.toml` permits broad development access; cloud settings are separate. | Unnecessary database exposure may remain. | Verify the remote project network and key policies before launch. |

No confirmed client-only authorization bypass, exposed tracked secret, IDOR, injection path, unsafe HTML sink, open redirect, unrestricted upload, or unprotected admin API was found in the inspected code. That statement is bounded by the missing live database and production tests.

## UX and product findings

1. **The landing page now keeps claims within evidence.** The former institution-support language had no repository evidence and conflicted with the copy contract. It now explains the product's connected revision trace.
2. **The 390px landing is usable but too long.** The verified full-page capture is 18,308px tall. Key actions remain visible and there is no horizontal overflow, but returning to a specific product promise requires extensive scrolling.
3. **The strongest product idea is the revision trace.** Curriculum context, visible working, provisional feedback and scheduled retries are implemented across multiple surfaces. The product should make that continuous loop more prominent than a broad catalogue of tools.
4. **Trust language is mostly strong.** Provisional versus evidence-linked versus measured states are explicit. This is more defensible than a generic AI score, but the public site must keep avoiding implied efficacy or endorsement.
5. **Failure and recovery states are materially implemented.** The source includes timeout messages, local-only/cloud states, corrupt-device-data recovery, auth retry, rate-limit feedback, empty states and provider fallbacks. Production behaviour remains to be certified.
6. **Mobile and reduced-motion coverage exists.** The selected browser suite exercised 1440px, 1024px and 390px layouts, keyboard focus and reduced motion. The corrected 390px auth-surface case passed.

## Performance findings

The original audited build exceeded the initial CSS budget by 767 gzip bytes because `AuthLandingRedirect` imported the marketing home route eagerly. Lazy loading that route produced the following final measurements:

| Metric | Final | Budget | Result |
|---|---:|---:|---|
| Initial JavaScript gzip | 234,273 bytes | 275,000 | PASS |
| Initial CSS gzip | 34,506 bytes | 45,000 | PASS |
| Largest JavaScript gzip | 130,258 bytes | 240,000 | PASS |
| Total JavaScript gzip | 880,798 bytes | 1,000,000 | PASS |

The main CSS asset remains 201.6 KB raw and 34.5 KB gzip. Large markdown/PDF chunks are route-split and remain under the frozen maximum. No current Lighthouse or DevTools trace was available, so FCP, LCP, INP, CLS and network-waterfall claims remain unverified.

## Technical debt

1. `packageManager` requires npm 10.9.8, while Node 22.22.0 supplied npm 10.9.4 locally and the CI workflow does not explicitly install 10.9.8.
2. The current checkout is 12 commits behind upstream, which makes local release evidence unsuitable for deployment.
3. App, server and content checks are broad, but database execution depends on a heavy local container runtime that failed on this workstation.
4. The public landing page carries a large amount of product explanation in one route. It should be shortened only after measuring which sections support signup and first-value comprehension.
5. Observability persistence is designed to fail explicitly, but operational ownership, alert thresholds and incident-response receipts remain external.

## Verification table

| Check | Command | Result | Important failure | Probable root cause |
|---|---|---|---|---|
| Lint, copy lint, copy tests | `npm run lint:ci` | PASS | None | N/A |
| Typecheck | `npm run typecheck` | PASS | None | N/A |
| Application tests | `npm run test:app` | PASS, 1,072/1,072 | None | N/A |
| Eval unit tests | `npm run test:eval` | PASS, 25/25 | None | N/A |
| Ask fixture eval | `npm run eval:ask` | PASS, 13/13, average 4.38/5 | Synthetic fixtures only | No authorised live provider run in this check |
| Grading fixture gate | `npm run eval:grading:check` | PASS, 6 fixtures, false-verified rate 0 | `currentLiveModel: NOT_RUN` | Live evaluation requires explicit provider configuration |
| Production dependency audit | `npm run audit:prod` | PASS | Sandbox attempt lacked registry metadata; network-enabled retry passed | Restricted network on first attempt |
| Build | `npm run build:ci` | PASS, 2,617 modules | 0/245 guides approved; 53 flagged | Editorial work remains |
| Bundle budget | `npm run performance:bundle` | PASS after fix | Initial run exceeded CSS budget by 767 bytes | Landing route was imported eagerly before auth redirect |
| Selected browser/a11y journeys | Playwright on local build | 23 passed, 1 skipped, initial 1 visual timeout; isolated corrected case passed | Full mobile screenshot exceeded a 45s test budget | 18,308px software-rendered capture, not an assertion failure |
| Database contracts | `npx supabase start ...`, then planned `npm run db:test` | BLOCKED | Container exited 255 and Colima stopped | Local VM/runtime failure with host disk at 98% use |
| Production gates | `npm run probe:gates` | FAIL | Custom domain TLS failure; fallback readiness 503 degraded | External DNS/TLS and backend readiness configuration |

## Prioritised decision

### P0 launch blockers

1. Restore the custom-domain certificate/DNS path and require successful HTTP/TLS probes.
2. Restore `/api/health?readiness=1` to 200 with database and rate-limit prerequisites present.
3. Create a clean exact-revision candidate from current upstream and rerun every gate.
4. Execute the migration/RLS contract suite and production two-account authorization probes.
5. Approve or withhold all study-guide content explicitly; do not index unapproved material.

### P1 correctness, security and reliability

1. Certify production login, invite, recovery, session expiry, export and delete.
2. Run a bounded live-provider evaluation and preserve cost, timeout, invalid-output and fallback receipts.
3. Verify remote database grants, network restrictions, backups and recovery.
4. Pin npm 10.9.8 explicitly in CI or align `packageManager` with the toolchain actually used.
5. Prove production observability storage, alert delivery and rollback ownership.

### P2 user experience

1. Measure and shorten the mobile landing path to subject exploration and private-beta signup.
2. Make first-value completion and continuation state visible across dashboard and tool entry points.
3. Expose provider degradation and local-only save state consistently before a user leaves a page.
4. Improve cross-tool search and retrieval for saved notes, papers, reviews and plans.
5. Give every measured weakness a visible retry date, evidence source and route back to practice.

### P3 high-leverage product opportunities

1. A unified revision timeline across notes, attempts, feedback, confirmations and retries.
2. Saved-work search with curriculum, subject, evidence status and date filters.
3. Resume cards for unfinished work after refresh, sign-in and device changes.
4. Teacher or tutor confirmation of provisional assessment evidence.
5. Privacy-controlled share/export links for selected study artefacts.
6. A provider-status banner that explains degraded or deterministic fallback output.
7. Curriculum search that jumps from programme to objective, resource and practice.
8. A learner-owned mastery evidence timeline that separates measured and inferred progress.
9. Editorially approved public study artefacts with source provenance and useful social previews.
10. A retry calendar that merges due weaknesses with the study planner.
11. Collaboration comments on learner-owned artefacts with explicit roles and audit history.
12. A first-session coach that ends with one saved artefact and one scheduled retry.
13. Clear usage/quota feedback before expensive AI actions, once quotas exist.
14. Longitudinal progress summaries based only on measured evidence.
15. A privacy-preserving feedback loop from incorrect AI output to evaluation fixtures.

These ideas build on current product objects and trust boundaries. They should follow the P0 and P1 gates rather than expand an uncertified release surface.
