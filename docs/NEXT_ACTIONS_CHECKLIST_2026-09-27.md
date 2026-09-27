# VertexED remaining-work checklist

27 September 2026. **Production status: NO-GO.**

This is the prioritised execution view of the [complete-product checklist](PUBLISHABLE_COMPLETION_CHECKLIST.md), not a replacement for its acceptance criteria or [gate register](COMPLETION_GATE_REGISTER.json). Every existing gate is mapped below. An unchecked item can mean missing implementation, missing live verification or missing human approval; it does not mean nothing has been built.

## Starting evidence

- Local candidate: `490ea8d873e38b6710555ee03e1efe28d5d9b547`, with remaining uncommitted work and the noncanonical WIP warning still in force.
- The [27 September report](../ASTRA_FINAL_REPORT.md) records passing CI, 1,152 application tests, 25 evaluation tests and 54 browser cases. The status review inspected receipts and verified all seven hashes in its source manifest; it did not rerun the full suite.
- Fresh 27 September public checks: `www.vertexed.app` fails TLS before HTTP. The fallback `vertex-ed-ai.vercel.app` returns readiness HTTP 503 on revision `55ff93defb09b119832c38942b2eea20ab0335bf`, different from this candidate. Basic liveness HTTP 200 does not close readiness.
- Content audit: 25 original-bank questions; 245 guides, zero approved, 53 flagged. Learning effectiveness and complete curriculum coverage are not established.

## 1. Establish the release source — first

Owner role: engineering/release. Master gates: SRC-01–SRC-05.

- [ ] Reconcile the canonical checkout, upstream, candidate branch and remaining WIP; preserve unrelated changes and previous evidence.
- [ ] Review and integrate the intended product changes into one clean, committed candidate.
- [ ] Map every original-brief requirement to its screen, storage, failure behaviour and acceptance test. Identify implementation gaps explicitly.
- [ ] Perform a clean install with Node 22.22.0/npm 10.9.4; retain the reproducible lockfile and record CI versions.
- [ ] Create the release manifest linking source revision, build, migrations, content and evidence. Assign named owners for external gates.

## 2. Recover domain and service readiness — investigate alongside source work

Owner role: domain/deployment operator. Master gates: OPS-01–OPS-04.

- [ ] Establish registrar/DNS and Vercel ownership; identify the intended project and production host.
- [ ] Repair HTTPS for both apex and canonical host, redirects and certificate configuration; verify from independent networks.
- [ ] Inspect protected readiness details and resolve the actual failing dependencies.
- [ ] Verify separate staging/production configuration, server-only secrets, provider availability and OAuth redirect allowlists.
- [ ] After the candidate passes the required gates, deploy that exact revision and require matching assets, migration/content versions and healthy readiness. A preview or liveness response is insufficient.

## 3. Prove database safety and persistence

Owner roles: database, storage and security. Master gates: DB-01–DB-05; DAT-01–DAT-05.

- [x] Establish an isolated disposable database runner. Verified empty-state replay, SQL lint and 59 database assertions; see [database verification](DATABASE_REPLAY.md).
- [ ] Reconcile shared-project ownership and the complete production migration ledger.
- [ ] Replay migrations from empty state and a production-shaped disposable snapshot; pass database contracts and SQL lint. Never reset the shared or production database for this check.
- [ ] Verify grants, row-level security, owner filters, readiness functions, durable rate limits, concurrent writes and deletion cascades.
- [ ] Rehearse restoration and compatible migration/application rollback; apply the reviewed migration sequence with separate staging and production receipts.
- [ ] Complete promised offline material access and offline application loading, including versioned updates and private-cache isolation.
- [ ] Verify cloud acknowledgements, retries, duplicate prevention, two-device conflicts and current-session resume; accurately distinguish device-only saves from account saves.
- [ ] Test connectivity loss, quota exhaustion, corruption, stale tabs, account switching and expired sessions without losing work. Verify export/deletion covers files, conversations, attempts, planner history and queued/offline data without resurrection.

## 4. Verify real accounts, security and privacy

Owner role: security/account. Master gates: SEC-01–SEC-09; PUB-04.

- [ ] Complete real permitted signup/invite, verification, onboarding, login, Google linking/sign-in, refresh, expiry, recovery, logout and session-revocation journeys.
- [ ] Verify anonymous, pending, approved, partially onboarded, non-admin and admin permissions.
- [ ] Use two disposable accounts to prove one cannot read, search, change, export or delete the other's records/files, including guessed IDs and asynchronous account switches.
- [ ] Test transactional email delivery, sender configuration, valid/expired links, duplicates and visible delivery failures.
- [ ] Audit deployed key scopes, repository history and built assets; remediate confirmed exposure. Verify input/upload limits, rate limits, injection boundaries, security headers and private caching.
- [ ] Verify live account export/deletion and privacy-safe telemetry/provider logging, retention and access controls; provide working support and unsafe-output reporting paths.
- [ ] Obtain appropriate privacy, terms, age/consent and safeguarding review. Pass final dependency/security scans and resolve exploitable release findings.

## 5. Complete reviewed curriculum and assessment

Owner roles: curriculum/editorial and learning systems. Master gates: CUR-01–CUR-08; LRN-01–LRN-09.

- [ ] Complete the versioned curriculum/concept/prerequisite structure and required IB DP/MYP, GCSE/IGCSE and AP mappings, levels, components and syllabus years; explicitly decide optional A-Level scope.
- [ ] Produce a coverage matrix and complete the promised subject-specific workflows. Expand the 25-question bank to cover required topics, difficulties, distinct retries and transfer questions.
- [ ] Independently review answer keys, marks, explanations, misconceptions and provenance. Resolve all 53 flags and give each of the 245 guides an approved, corrected or excluded disposition without leaving promised coverage empty.
- [ ] Confirm content rights and attribution. Complete IA milestones and evidence-qualified grade estimates with correct sources, weights and limitations.
- [ ] Verify diagnostics, all practice modes, alternate correct answers, insufficient/exhausted banks, hints and timing; unsupported cases must remain explicit.
- [ ] Validate evidence provenance and learning-state transitions; separate AI feedback, learner reports and human-confirmed marks. Repeating one question must not establish transferable mastery.
- [ ] Verify mistakes, corrected reasoning, retries, review scheduling and analytics against underlying attempts, including denominators, empty states and timezone boundaries.
- [ ] Have subject reviewers and learners assess diagnostic/feedback usefulness; fix misleading classifications and teaching failures without claiming unmeasured learning gains.

## 6. Finish remaining learning-workspace capabilities

Owner roles: product/frontend and AI systems. Master gates: DAY-01–DAY-09; AI-01–AI-06; EXM-01–EXM-04; NTS-01–NTS-06.

- [ ] Verify Today/dashboard recommendations use real deadlines, availability, reviews, weaknesses and evidence; preserve manual choices and explain infeasible plans.
- [ ] Connect assessment/IA dates, tasks and revision plans; verify recurring commitments, rebalancing, history, collisions, full calendars, midnight and daylight-saving changes.
- [ ] Complete calendar integration and scheduling while the app is closed, including permissions, duplicates, conflicts, revocation and safe repeated execution.
- [ ] Finish Focus task/timer/break/note/resume linkage; verify study-time reporting, gamification opt-outs and all five games without disrupting study state.
- [ ] Complete durable, private AI conversation history with cross-device resume, search, export and deletion. Keep context, drafts and errors consistent across AI entry points.
- [ ] Freeze evaluation cases and thresholds, then test all tutor modes and source-grounded actions through real providers. Cover correctness, citations, answer leakage, ambiguity and document prompt injection.
- [ ] Verify provider cancellation, timeout, retry, fallback, quota, latency and cost limits; unavailable generation must not appear successful.
- [ ] Complete exam components, question navigation, marks, constraints, timers, answer persistence and interrupted submission; verify refresh, conflicts and clock manipulation. Separate provisional feedback from confirmed results and support human marking where required.
- [ ] Finish usable formatted notes, maths/images/tags/concept links, autosave, recovery and export; implement bounded private PDF/worksheet import with honest malformed/scanned/encrypted-file handling.
- [ ] Verify note-to-summary/quiz/card actions and source references. Complete search across all promised saved material, including durable conversations, pagination, edits/deletions, account switching and actual supporting source locations.

## 7. Complete interface, performance and publication checks

Owner roles: frontend/QA and product/editorial. Master gates: UX-01–UX-07; PUB-01–PUB-03; PUB-05.

- [ ] Inventory every route/control/deep link and remove or implement dead interactions; make loading, empty, failure and recovery states usable.
- [ ] Preserve blue/white identity, logo, study terminology and revision trace; run copy lint and report any remaining findings.
- [ ] Capture and inspect every core route at 1440, 1024 and 390 pixels in both themes; exercise keyboard, focus, screen-reader announcements, zoom, contrast and reduced motion, then correct and recheck defects.
- [ ] Run Chromium, Firefox and WebKit plus real mobile Safari/Chrome journeys; test rotation, reload and mobile keyboards.
- [ ] Profile critical-route loading, interaction and API latency under representative conditions. Keep frozen bundle budgets and verify a continuous two-hour study session.
- [ ] Audit claims and onboarding/help copy; publish only approved content and verify live canonical URLs, robots, sitemap, redirects and social previews.
- [ ] Explicitly settle free/private-beta versus paid scope. If paid access is offered, complete billing, entitlements, webhook, cancellation/refund and deletion acceptance before release.

## 8. Resolve retained expansion scope explicitly

Owner role: product/release. Master gates: EXT-01–EXT-07.

- [ ] Decide and record release scope for teacher confirmation, private revocable sharing, invitation-based collaboration, linked revision history and quota transparency. Implement and test anything included; remove promises for anything explicitly excluded. Mandatory core requirements cannot be excluded this way.
- [ ] Establish the privacy-controlled feedback-to-evaluation workflow and per-candidate route/chunk size regression reports and alerts, or record an explicit permitted scope decision under the master checklist.

## 9. Certify operations and the complete learner journey

Owner roles: operations, QA and learner reviewer. Master gates: OPS-05–OPS-07; JNY-01–JNY-15.

- [ ] Exercise auth, save, provider, rate-limit-store and client failures; verify redacted monitoring, alert delivery, incident ownership and degraded-service messages.
- [ ] Verify spend/capacity limits, backup retention, recovery objectives, an actual restore and rollback to a healthy release. Ensure failed gates block promotion and publish the operator runbook.
- [ ] On one staging candidate, then the same production release, complete: permitted account → curriculum/subjects → diagnostic → explained strengths/gaps → feasible plan → search → approved learning/tutor → practice/timed exam → feedback → mistake/retry → notes/import/cards → Focus and safe game pause.
- [ ] Return the next day and on another device; verify due reviews, progress, saved work, conversation history, offline continuation and reconnection.
- [ ] Switch accounts, prove isolation, export/delete the disposable account and verify cleanup. Complete a realistic two-hour session and retest every defect found.

## 10. Close the release only with evidence

Owner role: accountable release owner. Master gates: REL-01–REL-05.

- [ ] Close every mandatory master gate with current evidence; record conditional scope decisions accurately. Naming an owner or accepting a risk does not establish completion.
- [ ] Pass final installation, CI, database, browser/accessibility, live AI and content checks on the candidate. Recheck affected gates after any source/model/schema/content/configuration change.
- [ ] Confirm production HTTPS, readiness, exact revision, real journeys, isolation, monitoring and recovery all agree with the release manifest.
- [ ] Reconcile older status reports and update the master checklist and gate register from receipts, preserving historical failures.
- [ ] Record GO with release owner, timestamp, deployment URL/revision, migration/content versions, rollback target and evidence index; otherwise retain NO-GO.

## Completion rule

For every checked item, retain the master gate IDs, result, candidate revision, environment/deployment, UTC timestamp, verifier and evidence path. Database receipts identify the migration ledger; content approvals identify the content version. Local fixture checks do not close real-account/provider gates, and source export does not close production release gates.

The checklist itself introduces no deployment, database change, content approval or new pass claim. Domain ownership, credentials, real test accounts and editorial/privacy decisions remain explicit external dependencies until supplied and verified.
