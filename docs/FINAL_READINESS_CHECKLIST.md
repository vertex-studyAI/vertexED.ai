# VertexED final readiness checklist

> 25 September export pass: this document retains its earlier checkpoint evidence.
> Use the [final release report](../FINAL_RELEASE_REPORT.md) for fresh candidate checks and export status.

> Superseded for completion scope on 24 September 2026 by [the complete-product publication checklist](PUBLISHABLE_COMPLETION_CHECKLIST.md). The counts, remote observations and checked items below are historical. The new master requires evidence for every mandatory gate and does not allow deferred required work to count as complete.

**Created:** 2026-09-20  
**Current decision:** **NO-GO**  
**Current local checkout:** `b009c9ab`, dirty and 12 commits behind `origin/main`  
**Current upstream:** `e3f6d11f`  
**Current live fallback:** `a1e4311c`, readiness HTTP 503 degraded  

This is the operational checklist for making VertexED launch-ready. Check an item only when its acceptance evidence exists for the same release candidate. A source test, local preview, deployment, production health check, editorial review and learner outcome are different kinds of evidence.

## Completion rule

- [ ] One release-candidate SHA is named below and used by every required receipt.
- [ ] Every item marked **LAUNCH BLOCKER** is checked.
- [ ] Every required P1 item is checked or has a named owner, dated risk acceptance and rollback condition.
- [ ] No `BLOCKED`, `FAILED` or `UNVERIFIED` item is silently converted to `PASS`.
- [ ] The final production probe, browser journey and rollback receipt all identify the same deployed SHA.

```text
Release candidate SHA:
Staging deployment URL:
Production deployment URL:
Previous healthy SHA:
Release owner:
Database owner:
Incident owner:
Editorial approver:
Final go/no-go date:
```

## 1. Source and release provenance

- [x] Audit the current dirty worktree without deleting unrelated work.
- [x] Record the current branch, HEAD, upstream divergence and modified/untracked paths.
- [x] Create the audit, architecture, execution, QA, launch and work-session documents.
- [ ] **LAUNCH BLOCKER:** Select the canonical source checkout and release base.
- [ ] **LAUNCH BLOCKER:** Create a clean candidate branch/worktree from the selected current upstream revision.
- [ ] Review every change being ported from the dirty WIP tree; preserve its original author and purpose.
- [ ] Exclude `DO_NOT_USE_AS_CANONICAL.md`, caches, screenshots and unrelated evidence from the release candidate unless explicitly required.
- [ ] Confirm the candidate has no unexpected modified or untracked paths.
- [ ] Record `git rev-parse HEAD`, branch, remote and upstream in an immutable evidence manifest.
- [ ] Confirm the candidate is not behind its selected release base.
- [ ] Bind CI checkout to the exact candidate SHA.
- [ ] Bind deployment build identity to the exact candidate SHA.
- [ ] Confirm `/api/health` returns the exact candidate SHA in body and header.

**Acceptance evidence:** clean `git status`, reviewed candidate diff, source manifest, CI SHA, deployment SHA and health SHA all agree.

## 2. Toolchain and installation

- [x] Use Node 22.22.0 for the audited local source gate.
- [ ] Resolve the declared npm mismatch: repository requires 10.9.8 while the local Node distribution supplied 10.9.4.
- [ ] Pin the accepted npm version explicitly in every CI job, or update `packageManager` after proving equivalent install output.
- [ ] Run `npm ci` from an empty `node_modules` directory on the clean candidate.
- [ ] Confirm `package-lock.json` does not change during the clean install.
- [ ] Record Node and npm versions in CI output.
- [ ] Confirm Linux CI and the supported macOS development environment use compatible lockfile resolution.

**Acceptance evidence:** clean install receipt, unchanged lockfile, recorded versions and passing candidate CI.

## 3. Canonical source-quality gate

The current WIP evidence is checked below. Every command must still be rerun on the clean candidate.

- [x] Current WIP: `npm run lint:ci` passed with 0 copy findings.
- [x] Current WIP: `npm run typecheck` passed.
- [x] Current WIP: `npm run test:app` passed 1,072/1,072.
- [x] Current WIP: `npm run test:eval` passed 25/25.
- [x] Current WIP: `npm run eval:ask` passed 13/13 with average 4.38/5.
- [x] Current WIP: the six-fixture grading gate passed with false-verified rate 0.
- [x] Current WIP: `npm run audit:prod` found no high or critical production vulnerabilities.
- [x] Current WIP: `npm run build:ci` passed with 2,617 modules.
- [x] Current WIP: Vercel validation reported one deployed function and 22 routed endpoints.
- [x] Current WIP: bundle budgets passed.
- [ ] **LAUNCH BLOCKER:** Run `npm run ci` on the clean candidate with network access for the dependency audit.
- [ ] Require zero lint, typecheck, unit, eval, build or budget failures on the candidate.
- [ ] Archive the complete command output and machine/toolchain identity.
- [ ] Run `git diff --check` and confirm no generated unexpected change remains.

**Acceptance evidence:** candidate `npm run ci` exits 0 and its archived receipt names the candidate SHA.

## 4. Database schema, migrations and RLS

- [x] Source migrations and owner-scoped handler contracts were inspected.
- [x] New tables are configured not to auto-expose through the Data API.
- [ ] Restore a healthy Docker/Colima or equivalent isolated database runner.
- [ ] Start Supabase from an empty local project state.
- [ ] **LAUNCH BLOCKER:** Replay every migration in order on an empty database.
- [ ] **LAUNCH BLOCKER:** Run `npm run db:test` successfully.
- [ ] Run pgTAP database contracts successfully.
- [ ] Run local database lint with warnings reviewed and errors prohibited.
- [ ] Confirm every account-owned table has RLS enabled.
- [ ] Confirm owner policies use `auth.uid()` or an equally strict identity boundary.
- [ ] Confirm service-role grants are limited to required tables/functions.
- [ ] Confirm service-role handlers filter by the verified user ID on every read, update and delete.
- [ ] Test migration replay against a production-shaped schema snapshot without destructive reset.
- [ ] Confirm applied production migrations will remain forward compatible with application rollback.
- [ ] Record production migration ledger and compare it with repository migrations.
- [ ] Confirm readiness RPCs, rate-limit tables/functions and learner-state functions exist in the target project.

**Acceptance evidence:** empty-database replay, pgTAP, database lint, migration-ledger comparison and schema readiness all pass for the candidate.

## 5. Authorization and cross-account isolation

- [x] Privileged APIs verify bearer tokens independently of client route guards in source tests.
- [x] Admin API performs a server-side admin check in source tests.
- [x] User-content and learner-state handlers derive ownership from the verified user.
- [ ] Create two disposable non-admin users and one disposable admin user.
- [ ] **LAUNCH BLOCKER:** Prove User A cannot read User B artefacts by guessed ID.
- [ ] **LAUNCH BLOCKER:** Prove User A cannot update or delete User B artefacts.
- [ ] **LAUNCH BLOCKER:** Prove User A cannot export or enumerate User B state.
- [ ] Prove direct authenticated Supabase queries obey RLS for both users.
- [ ] Prove anonymous access cannot read private profiles, artefacts, learner state or waitlist data.
- [ ] Prove a non-admin cannot use `waitlist-admin` or obtain admin-only fields.
- [ ] Prove client-supplied `user_id`, role, score and ownership values are ignored or rejected.
- [ ] Verify authorization errors do not reveal whether another user's row exists.
- [ ] Retain request IDs and redacted results for every isolation probe.

**Acceptance evidence:** two-account IDOR matrix passes through both API and direct Supabase clients.

## 6. Authentication and account lifecycle

- [x] Local source tests cover session recovery, stale identity protection and account transitions.
- [ ] Verify private-beta signup and waitlist submission in the target environment.
- [ ] Verify an approved invite creates exactly one linked Auth identity.
- [ ] Verify invalid, expired, reused and concurrently claimed invite tokens fail closed.
- [ ] Verify email/password login.
- [ ] Verify Google OAuth callback and account linking if Google remains enabled for launch.
- [ ] Verify initial onboarding persists and survives refresh.
- [ ] Verify returning-user session hydration.
- [ ] Verify expired access-token refresh.
- [ ] Verify revoked refresh sessions return the user to a safe login state.
- [ ] Verify password-reset email delivery and completion.
- [ ] Verify logout clears the current account without exposing another account's device state.
- [ ] Verify direct navigation to every protected route when signed out.
- [ ] Verify partially onboarded and waitlist-pending accounts cannot bypass their required state.
- [ ] Verify account export contains all owned records, excludes secrets and fails explicitly at its safety cap.
- [ ] Verify account deletion revokes sessions, deletes the Auth identity and cascades linked learner data.
- [ ] Verify repeated export and delete actions are safe and deterministic.

**Acceptance evidence:** disposable-account journey receipts cover fresh, pending, approved, expired, revoked, recovery, export and delete states.

## 7. Production domain and deployment

- [ ] **LAUNCH BLOCKER:** Restore DNS ownership for the intended canonical domain.
- [ ] **LAUNCH BLOCKER:** Attach `www.vertexed.app` to the correct Vercel project.
- [ ] **LAUNCH BLOCKER:** Issue and validate a trusted TLS certificate.
- [ ] Confirm the apex domain redirects to the canonical `www` host over HTTPS.
- [ ] Resolve or intentionally retire `www.vertexed.ai`; do not leave an undocumented launch dependency.
- [ ] Confirm legacy Vercel hosts redirect without redirect loops.
- [ ] **LAUNCH BLOCKER:** Make protected `/api/health?readiness=1` return HTTP 200.
- [ ] Confirm readiness reports every required database, rate-limit, provider and release-identity capability as healthy.
- [ ] Confirm the readiness token is present only in protected CI/operator contexts.
- [ ] Confirm the deployed revision equals the candidate SHA.
- [ ] Confirm static routes, API routes, redirects and immutable asset caching work over the canonical domain.
- [ ] Confirm API routes return `no-store` and `noindex` headers.
- [ ] Confirm the configured CSP, HSTS, frame, MIME, referrer and permissions headers are present in live responses.

**Acceptance evidence:** `npm run probe:gates` passes from two independent networks and identifies the candidate SHA.

## 8. Environment, secrets and provider configuration

- [x] `.env.local` is ignored and no local secret file is tracked.
- [x] Browser code uses public Supabase configuration rather than the service-role key.
- [ ] Audit Vercel environment variables using a redacted name/scope matrix.
- [ ] Audit Supabase keys, grants and rotation dates.
- [ ] Confirm service-role, provider, invite and readiness secrets are server-only.
- [ ] Remove stale or duplicate environment variables after identifying their consumers.
- [ ] Confirm preview, staging and production values cannot be confused.
- [ ] Confirm production database network restrictions are least privilege.
- [ ] Confirm OAuth redirect allowlists contain only intended origins.
- [ ] Confirm email sender/domain authentication and recovery redirect configuration.
- [ ] Rotate any secret whose exposure history cannot be established.
- [ ] Re-run a repository and built-asset secret scan after configuration cleanup.

**Acceptance evidence:** redacted environment matrix, no client-secret finding, scoped remote settings and completed rotation record where required.

## 9. Rate limits, abuse controls and unsafe input

- [x] Central API registry restricts methods and JSON body sizes.
- [x] Malformed and oversized JSON paths are source-tested.
- [x] Production rate limiting is designed to fail closed when durable storage is unavailable.
- [x] AI requests have bounded deadlines and validated outputs.
- [ ] Verify durable rate-limit RPCs against the target database.
- [ ] Verify waitlist, invite, telemetry, admin and every paid AI endpoint enforce their intended limit.
- [ ] Verify `Retry-After` and accessible recovery messages for 429 responses.
- [ ] Verify degraded rate-limit storage returns 503 instead of allowing unlimited traffic.
- [ ] Exercise long text, malformed JSON, oversized images and oversized audio against staging.
- [ ] Exercise repeated clicks, parallel tabs and replayed idempotency keys.
- [ ] Verify uploads/transcription reject unsupported type, size and malformed content.
- [ ] Run SSRF, redirect, XSS, markdown/HTML, header and log-leak regression tests against staging.
- [ ] Confirm raw provider errors, learner content, tokens and email addresses never reach logs or telemetry.

**Acceptance evidence:** adversarial request matrix passes with bounded responses, no private leakage and no duplicate paid/data operation.

## 10. Core product journeys

- [ ] **LAUNCH BLOCKER:** Anonymous landing to waitlist completes successfully.
- [ ] **LAUNCH BLOCKER:** Approved account login to onboarding completes successfully.
- [ ] **LAUNCH BLOCKER:** Onboarding to first useful study action completes successfully.
- [ ] Note input produces a validated result or clearly labelled deterministic fallback.
- [ ] Quiz generation produces bounded usable questions and preserves provenance.
- [ ] Notebook generation produces validated materials and a clear degraded state when required.
- [ ] Planner creation saves and reloads without duplicate tasks.
- [ ] Answer review preserves exact evidence spans and never promotes unsupported output to measured mastery.
- [ ] Paper generation preserves question count/marks and labels degraded output.
- [ ] Chat handles empty, malformed, timed-out and rate-limited provider responses.
- [ ] Transcription handles supported input and returns a safe error for unsupported/oversized input.
- [ ] Saved artefacts persist to the verified owner and reappear after refresh/re-login.
- [ ] Device fallback never crosses account boundaries.
- [ ] Corrupt device storage pauses editing and preserves recoverable bytes.
- [ ] Multiple tabs surface revision conflicts rather than silently overwriting newer work.
- [ ] A confirmed weakness creates one due retry linked to its originating evidence.
- [ ] Returning users can find unfinished work and the next due retry.
- [ ] Empty, loading, offline, local-only, conflict, degraded and failed states are understandable in every core tool.

**Acceptance evidence:** browser journeys verify input, API, persistence, refresh, repetition and recovery for every core workflow.

## 11. AI quality, safety, cost and reliability

- [x] Offline ask fixtures pass.
- [x] Synthetic grading fixtures preserve the provisional/evidence-linked boundary.
- [x] Provider output is treated as untrusted in source contracts.
- [ ] **LAUNCH BLOCKER:** Run the authorised live-provider evaluation against the exact launch model/configuration.
- [ ] Record provider, model, prompt-contract version, latency, token use and cost without learner content.
- [ ] Measure timeout, empty-response, malformed-JSON, hallucinated-evidence and refusal behaviour.
- [ ] Verify every feature's configured fallback and no-provider behaviour.
- [ ] Confirm repeated clicks and retry logic cannot cause uncontrolled duplicate model calls.
- [ ] Confirm per-request output/token limits and total deadlines.
- [ ] Verify prompt-injection attempts cannot change authorization, evidence status or server contracts.
- [ ] Convert reviewed failures into de-identified offline fixtures.
- [ ] Define launch thresholds and keep the release blocked if they fail.
- [ ] Define provider outage and cost-runaway response procedures.

**Acceptance evidence:** live-eval report passes frozen thresholds and includes failure/cost receipts for the launch configuration.

## 12. Curriculum, claims and editorial approval

- [x] Content pipeline inventories 245 guide files.
- [x] Unapproved guides are excluded from the generated public sitemap.
- [x] Unsupported institutional-support language was removed from the landing page.
- [x] Public examples identify their evidence/measurement limits.
- [ ] **LAUNCH BLOCKER:** Decide the exact curriculum/study-guide set intended for launch. The valid launch set may be zero guides.
- [ ] Record source provenance, licensing status, curriculum version, factual review and approver for every included guide.
- [ ] Resolve all high-risk flags in the included set.
- [ ] Quarantine every unapproved or unclear guide from indexing and AI retrieval.
- [ ] Confirm public copy contains no fabricated endorsement, outcome, efficacy, user-count or research claim.
- [ ] Confirm automated review is described as provisional or evidence-linked, never an official grade.
- [ ] Confirm only authorised human/official/deterministic evidence can become measured mastery.
- [ ] Run copy lint after the final editorial pass and report legacy findings without hiding them.

**Acceptance evidence:** launch content manifest contains only explicitly approved items; all other inventory remains excluded.

## 13. Privacy, legal and safeguarding

- [x] Privacy and terms pages exist.
- [x] First-party telemetry schema excludes prompts, answers, identity and query strings by design.
- [ ] Have the final privacy policy reviewed against actual production storage, providers, retention and deletion.
- [ ] Have the final terms reviewed against beta access, educational limitations and AI-generated content.
- [ ] Document data retention for profiles, artefacts, learner state, waitlist and operational telemetry.
- [ ] Verify deletion behaviour matches the privacy policy.
- [ ] Verify export behaviour matches the privacy policy.
- [ ] Confirm age/consent rules for the intended learner population and launch jurisdictions.
- [ ] Define safeguarding escalation and support ownership for learner-reported unsafe output.
- [ ] Confirm third-party provider terms permit the intended learner data and jurisdictions.
- [ ] Confirm analytics and error monitoring configuration matches consent and retention obligations.
- [ ] Record final legal/safeguarding approval or keep launch blocked.

**Acceptance evidence:** dated human approvals plus policy-to-runtime checks for collection, retention, export and deletion.

## 14. Email and communications

- [ ] Configure and verify the production sender domain.
- [ ] Verify SPF, DKIM and DMARC as applicable.
- [ ] Verify waitlist acknowledgement delivery.
- [ ] Verify invite delivery without logging the recipient or one-time link.
- [ ] Verify password-recovery delivery and redirect.
- [ ] Verify expired links produce a useful recovery path.
- [ ] Verify duplicate submissions do not send duplicate email unexpectedly.
- [ ] Verify bounced/failed delivery is visible to the operator without exposing secrets.
- [ ] Verify unsubscribe/communication preferences for non-transactional messages if any are enabled.

**Acceptance evidence:** disposable inbox receipts for waitlist, invite, recovery, expiry and delivery failure.

## 15. Observability and operations

- [x] Client errors and unhandled rejections feed a bounded first-party telemetry schema.
- [x] AI run and feedback events use fixed fields.
- [x] Vercel Analytics and Speed Insights load after the interactive path.
- [ ] Verify telemetry persistence in staging/production.
- [ ] Verify one event per intended client/server failure and prevent event storms.
- [ ] Verify stored events contain no prompt, answer, email, token, raw URL query or stack content.
- [ ] Define dashboards for readiness, auth failures, provider failures, rate limits, persistence and latency.
- [ ] Define warning and critical thresholds.
- [ ] Configure alert delivery to a named incident owner.
- [ ] Exercise a provider timeout, database outage, rate-limit-store failure and client error.
- [ ] Confirm each actionable failure reaches the expected dashboard/alert.
- [ ] Define log retention and access controls.
- [ ] Write incident triage and escalation steps.
- [ ] Define an operational status message for provider degradation without exposing internals.

**Acceptance evidence:** staging fault-injection receipts, clean telemetry samples, working alerts and named ownership.

## 16. Backup, recovery and rollback

- [ ] Verify production database backups are enabled and retained for the documented period.
- [ ] Define recovery point and recovery time objectives.
- [ ] Restore a backup into an isolated target and verify row counts/contracts.
- [ ] Confirm restore testing does not mutate production.
- [ ] Record the previous healthy application SHA.
- [ ] Confirm the previous application can read the candidate database schema.
- [ ] Document application rollback commands and access requirements.
- [ ] Document forward-recovery steps for applied migrations.
- [ ] Rehearse application rollback in staging.
- [ ] Re-run readiness and a core journey after rollback.
- [ ] Verify failed readiness automatically prevents promotion.

**Acceptance evidence:** dated restore and rollback rehearsal with measured duration, source identity and post-recovery health.

## 17. Accessibility, responsive design and browser compatibility

- [x] Selected public routes were inspected at 1440px, 1024px and 390px.
- [x] The corrected 390px landing/login/signup focus-and-fit test passes.
- [x] Selected keyboard and reduced-motion checks pass.
- [ ] Complete the public route matrix at 1440px, 1024px and 390px.
- [ ] Complete authenticated core-tool coverage at 1440px, 1024px and 390px.
- [ ] Complete admin-route coverage.
- [ ] Verify keyboard-only navigation through menus, dialogs, forms, tabs and generated results.
- [ ] Verify focus moves correctly after navigation, dialog opening, errors and async completion.
- [ ] Verify semantic headings, labels, descriptions, status and alert announcements.
- [ ] Verify contrast in light and dark modes.
- [ ] Verify reduced motion removes non-essential movement without hiding content.
- [ ] Verify 200% zoom and reflow.
- [ ] Verify long text, empty data, error copy and translated-like text expansion do not clip controls.
- [ ] Run Chromium plus the supported Safari/WebKit and Firefox coverage.
- [ ] Inspect screenshots and complete a correction pass after the final UI changes.

**Acceptance evidence:** candidate-bound browser report with no critical accessibility, overflow, focus, hydration or console failures.

## 18. User experience and activation

- [x] Landing claims now describe implemented product behaviour.
- [x] Core tools expose substantial local empty/error/recovery states.
- [ ] Shorten or consolidate the 18,308px mobile landing based on measured section engagement, preserving brand and curriculum discovery.
- [ ] Define the primary target user and one primary first-value journey for launch.
- [ ] Make that journey end in one saved artefact and one scheduled retry.
- [ ] Verify a fresh account can complete the journey without choosing among unnecessary tools.
- [ ] Verify refresh/sign-out/sign-in resumes unfinished work safely.
- [ ] Make local-only, pending, conflict, degraded and failed save states consistent across tools.
- [ ] Ensure every destructive account action has clear consequence, confirmation and recoverable error handling.
- [ ] Test the journey with representative learners and record confusion/failure points.
- [ ] Fix P0/P1 usability failures and rerun the same tasks.

**Acceptance evidence:** observed fresh-user journey, privacy-safe activation events and successful resume/recovery checks.

## 19. Performance

- [x] Current WIP bundle passes frozen gzip budgets.
- [x] Authenticated startup no longer eagerly downloads the Home route.
- [ ] Re-run bundle budgets on the clean candidate.
- [ ] Capture cold and warm network/CPU traces for landing, login, dashboard and each core tool.
- [ ] Measure LCP, INP, CLS, FCP and request waterfalls at desktop and constrained mobile settings.
- [ ] Verify the authenticated redirect does not request the Home chunk.
- [ ] Verify analytics and optional integrations do not block interaction.
- [ ] Check for duplicate API/model requests and expensive rerenders.
- [ ] Check image dimensions, formats and lazy loading.
- [ ] Check database query counts/indexes after the target database is available.
- [ ] Fix measured launch-impacting regressions and rerun accessibility/browser tests.
- [ ] Publish per-route bundle deltas without loosening current caps.

**Acceptance evidence:** candidate bundle receipt plus trace/field measurements meeting agreed launch thresholds.

## 20. SEO, discoverability and public trust

- [x] Canonical, robots, sitemap, Open Graph, Twitter and structured metadata exist in source.
- [x] Generated sitemap currently excludes unapproved guides.
- [ ] Verify `robots.txt` and `sitemap.xml` over the canonical HTTPS domain.
- [ ] Verify every indexable route returns the intended canonical URL and metadata.
- [ ] Verify auth, account, admin and API surfaces are not indexed.
- [ ] Verify the social preview image loads and is readable at target crop sizes.
- [ ] Remove or update time-sensitive resource titles/content before launch.
- [ ] Submit/ping the final sitemap only after domain and content approval pass.
- [ ] Verify the canonical domain is crawlable without redirect, TLS or parked-domain failure.
- [ ] Confirm public claims, examples and metadata use the same product positioning.

**Acceptance evidence:** live header/body checks, search-console ownership where available and approved sitemap manifest.

## 21. Payments and commercial readiness

- [x] Payments are currently N/A for the private beta; no billing promise is made.
- [ ] If launch scope changes to paid access, stop release and add a separate billing checklist covering prices, entitlements, webhooks, idempotency, taxes, receipts, cancellation, refunds and account deletion.
- [ ] Confirm quota/usage copy does not imply a paid or unlimited allowance that the server does not enforce.

## 22. Final production certification

- [ ] **LAUNCH BLOCKER:** All source, database, authorization, transport, readiness, content and critical-journey blockers above are checked.
- [ ] Run the complete candidate CI gate one final time.
- [ ] Run the complete database-contract gate one final time.
- [ ] Deploy the exact candidate SHA.
- [ ] Run `npm run probe:gates` and require all production gates to pass.
- [ ] Run anonymous landing/waitlist journey on production.
- [ ] Run disposable invited-user login/onboarding/first-value/save/refresh journey on production.
- [ ] Run two-account unauthorized-ID probes without touching real learner data.
- [ ] Run export and deletion for the disposable account.
- [ ] Verify monitoring events and alerts for the certification run.
- [ ] Verify the previous healthy revision and rollback instructions are available.
- [ ] Review unresolved P1 items and record explicit owner/date/risk acceptance.
- [ ] Confirm there are no unresolved P0 items.
- [ ] Record a signed `GO` decision tied to the deployed SHA, or retain `NO-GO`.

**Final acceptance:** production transport, readiness, exact revision, database, authorization, authentication, core workflows, content, monitoring and rollback all have current proof for one SHA.

## 23. Post-launch improvements that do not replace launch gates

- [ ] Add saved-work search by kind, subject, evidence status and date.
- [ ] Add a unified learner-owned revision timeline.
- [ ] Merge measured retries into the study planner/calendar.
- [ ] Add privacy-controlled, expiring and revocable artefact sharing.
- [ ] Add an authorised teacher/tutor confirmation workflow.
- [ ] Add approved curriculum-objective search.
- [ ] Add longitudinal summaries based only on measured evidence.
- [ ] Turn reviewed incorrect-output feedback into de-identified evaluation fixtures.
- [ ] Add collaboration only after role, privacy and audit contracts are complete.
- [ ] Add quota/usage transparency if commercial limits are introduced.

These post-launch items improve activation, retention and defensibility. They must not delay repairs to release provenance, transport, readiness, database isolation, authentication, content approval or rollback.
