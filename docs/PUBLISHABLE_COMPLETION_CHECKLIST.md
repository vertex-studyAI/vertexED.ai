# VertexED: complete-product publication checklist

Updated 24 September 2026. Decision: **NO-GO until every required gate below is closed with evidence.**

This is the master checklist for completing the full Learning OS brief and publishing it. It supersedes the scope and completion rules of older finish/readiness lists, while preserving their historical receipts. It is not a certification that the work has been completed.

## What “nothing remaining” means

Every required workflow in the original brief works, published content is reviewed, private data is isolated, failures preserve work, and one identified release runs successfully on the canonical production domain. No required feature, failed check, unknown result, content approval, deployment dependency or recovery exercise remains open. A named owner, planned date, hidden button or risk-acceptance note does not close an item.

This is a finite release contract, not a promise that software will never have another bug. Later feature ideas and unclaimed scientific efficacy are not release requirements. A-Level was optional in the original brief; paid subscriptions were conditional on billing being present. These must have explicit scope decisions, not silently unfinished public interfaces. Mandatory IB DP, MYP, GCSE/IGCSE and AP capabilities cannot be deferred and still count as completing this brief.

Check a box only with a receipt containing: gate ID, result, candidate commit, environment/deployment, UTC timestamp, verifier and evidence path. Content approval must also identify the content version; database evidence must identify the migration ledger. Recheck affected gates whenever source, content, models, schema or deployment configuration changes.

## Verified baseline versus remaining certification

On 24 September, all 50 files in the 21 September implementation manifest still matched their recorded SHA-256 values. The working tree remains dirty and is marked as WIP, not the canonical release source. This check did not revalidate other files or external services.

The **21 September** receipts report 1,115 application tests, 25 evaluation tests, 13 tutor fixtures, 31 browser scenarios and three additional planner checks passing; build/lint/typecheck/copy/bundle gates passed. Initial JavaScript was 237,138 bytes gzip. The content audit reported 245 guide files, zero approved and 53 flagged. Domain TLS failures, degraded fallback readiness and failed local database initialization were recorded then. **Live status and full tests were not refreshed on 24 September.**

Implemented foundations include Today, persistent original-bank practice, concept evidence, mistakes, review intervals, exam sessions, tutor modes, personal search, planner commitments/rescheduling and five games. Do not rebuild those blindly: extend and reverify them. Current diagnostic coverage is 25 original questions, not a complete curriculum.

## 1. Establish one release candidate — engineering/release owner

- [ ] **SRC-01** Reconcile the current canonical checkout, upstream and outstanding WIP; preserve unrelated changes and recoverable copies before selecting what to port.
- [ ] **SRC-02** Review and integrate the entire intended product change set into a clean candidate, including earlier auth, notebook, icon and recovery changes outside the 50-file manifest. Resolve conflicts without dropping working flows.
- [ ] **SRC-03** Create a traceability matrix from every original-brief requirement to its route/control, data store, error behavior and acceptance test. No mandatory requirement is unmapped or deferred.
- [ ] **SRC-04** Pin the supported Node 22 runtime and declared npm version, perform a clean install, preserve lockfile reproducibility and record the exact versions in CI.
- [ ] **SRC-05** Produce a reviewed, committed candidate and release manifest. CI, deployed assets, health revision and migration/content versions must identify that candidate; exclude unrelated research and private/raw test evidence from the published bundle.

## 2. Complete curriculum and reviewed content — curriculum/editorial owner

- [ ] **CUR-01** Implement configurable curriculum → subject → unit → topic → concept → skill structures with versioned identifiers, prerequisite links and no dangling references or prerequisite cycles.
- [ ] **CUR-02** Map IB DP/MYP, GCSE/IGCSE and AP requirements into that structure; support DP HL/SL, course variants and exam components. Record supported syllabus years and an explicit optional A-Level decision.
- [ ] **CUR-03** Complete course-specific learning flows for Math AA, Physics, Computer Science, Economics, English and languages: mathematical working, units/graphs, algorithms/code reasoning, economic diagrams/arguments, text analysis and language practice as appropriate. Executing untrusted code, if offered, requires isolation.
- [ ] **CUR-04** Create a coverage matrix for each offered course showing explanations, prerequisite support, diagnostic items, practice at relevant difficulty levels, review material and exam-component coverage. Fill every required gap; no advertised course may be backed by an empty adapter.
- [ ] **CUR-05** Expand the 25-question bank sufficiently to populate that matrix, including distinct transfer questions and non-identical retries. Validate every answer key, mark value, explanation, misconception, calculator policy, estimated time and provenance entry.
- [ ] **CUR-06** Obtain recorded subject/content review for all material published or retrieved by AI. Resolve the 53 historical flags; every one of the 245 inventoried guides needs an explicit approved, corrected or excluded disposition. Exclusion cannot leave a promised course unsupported.
- [ ] **CUR-07** Verify copyright/licensing and attribution for text, questions, diagrams, images and papers. Use original, authorized or appropriately licensed content; handle user-uploaded material privately without assuming redistribution rights.
- [ ] **CUR-08** Implement IA milestones, deadlines, evidence and revision progress. Grade estimates require enough entered evidence, the correct component weights/boundaries, source/date and limitations; otherwise show insufficient evidence. Do not label a model estimate an official predicted grade.

## 3. Finish the learning model and assessment loop — learning systems/QA owner

- [ ] **LRN-01** Verify subject-, unit- and concept-level adaptive diagnostics against the curriculum map, retaining accuracy, difficulty, supplied confidence, elapsed time, hints and repeated errors.
- [ ] **LRN-02** Handle insufficient questions, ambiguous answers, alternate correct forms, units, exhausted banks and unsupported question types honestly. Never turn missing evidence into failure or mastery.
- [ ] **LRN-03** Validate unassessed/developing/weak/mastered transitions, prerequisite strength, recency and review eligibility using independently checked answers. Repeated memorization of one question must not establish transferable mastery.
- [ ] **LRN-04** Give historical, generated, deterministic, learner-attested and teacher-confirmed attempts explicit provenance. Connect legitimate sources to one knowledge model without upgrading provisional AI feedback to verified marks.
- [ ] **LRN-05** Verify every practice mode: targeted weakness, mixed review, exam, rapid-fire, prerequisite repair and challenge. Each submission produces appropriate feedback, a usable next question and an idempotent evidence update.
- [ ] **LRN-06** Verify optional mistake capture with question/context, cause, corrected reasoning and retry history. Include all requested error categories; mark inferred causes as hypotheses rather than facts.
- [ ] **LRN-07** Connect cards, concepts, mistakes, formulas and definitions to a consistent review queue. Test ratings, lapses, postponement, timezone/day boundaries, missed days and repeated submissions; explain the scheduling heuristic without claiming calibrated forgetting probabilities.
- [ ] **LRN-08** Review the knowledge visualization and analytics against raw attempts. Accuracy, confidence, difficulty, hints and recency remain distinguishable; every metric has a denominator, time window and useful empty state.
- [ ] **LRN-09** Validate diagnostic and feedback usefulness with subject reviewers and learners. Resolve misleading classifications and obvious teaching failures; do not require or advertise an unperformed learning-gains study.

## 4. Today, planner, dashboard and Focus — product/frontend owner

- [ ] **DAY-01** Verify Today includes entered deadlines/assignments, overdue tasks, due cards, practice, assessments, weak concepts, recent evidence and a focus suggestion; every recommendation explains its actual evidence.
- [ ] **DAY-02** Verify prioritization accounts for exam proximity, weakness, prerequisites, review risk, urgency and availability. Explain conflicts and backlog when all work cannot fit; preserve manual overrides.
- [ ] **DAY-03** Connect assessment dates, IA milestones and evidence-backed revision tasks to the same planner. Subject/task changes must update recommendations without inventing exams or silently duplicating tasks.
- [ ] **DAY-04** Verify recurring commitments, free-time windows, daily limits, deadlines and priority-aware missed-task rebalancing. Keep fixed appointments fixed; test DST, midnight, holidays, collisions, expired deadlines and an entirely full calendar. Clearly state when rescheduling runs.
- [ ] **DAY-05** Verify completion history, reopen/edit/delete actions and planned/completed/backlog/pressure summaries. Distinguish scheduled duration marked complete from measured focus time.
- [ ] **DAY-06** Finish Focus linkage to the current task, timer, breaks, session notes and completion summary. Preserve the session through refresh/interruption and show the next useful step; only report mastery changes when actual evidence changed.
- [ ] **DAY-07** Verify dashboard subjects, topic/accuracy/mastery trends, study time, task completion, upcoming exams and optional streaks answer what changed and what to do next. No arbitrary composite score is presented as learning progress.
- [ ] **DAY-08** Provide working opt-out controls for gamification. Test genuine streak/XP/goal/milestone calculations and all five games, including rotation, lazy loading, pause, keyboard/touch, silence and preservation of study state.
- [ ] **DAY-09** Close the recorded calendar integration and background scheduling gap: define provider permissions, import/export direction, duplicate/conflict handling, timezone changes, disconnect/revocation and idempotent scheduled jobs. Verify missed work is handled when the app is closed without moving fixed appointments. Until implemented, retain the explicit foreground-only limitation.

## 5. AI tutor and exam workspace — AI systems/assessment owner

- [ ] **AI-01** Test Explain, Teach, Quiz, Hint, Solve With Me, Challenge Me and Exam Mode through the real provider path, including progressive steps, attempted-answer prompts and appropriate difficulty changes.
- [ ] **AI-02** Verify explanations, analogous problems, error feedback, misconception hypotheses, summaries, note-to-question conversion and revision plans against trusted references. Ground source-based answers in the supplied material and expose unavailable evidence.
- [ ] **AI-03** Consolidate duplicated AI entry points around consistent context, mode, sources, permissions and error behavior. Switching interfaces must not lose a draft or send another account's context.
- [ ] **AI-04** Implement durable conversation history, with resume/search/delete/export across sessions and devices. Define retention, bounded history/context limits, conflict handling and account isolation; browser-session storage alone does not close this item.
- [ ] **AI-05** Freeze an evaluation set and acceptance thresholds before running live evaluations. Cover factual correctness, citations, answer leakage in hint/quiz modes, refusals, ambiguity, prompt injection in documents and fabricated certainty/marks.
- [ ] **AI-06** Verify timeout/cancel/retry/fallback behavior, quota enforcement and cost controls on the deployed provider configuration. Define acceptable response latency and per-session cost, then measure them; no fabricated fallback answer may look successful.
- [ ] **EXM-01** Complete the exam workspace across the offered course components: sections, question navigation, marks, calculator constraints, flags, timer, answer persistence and expiry behavior.
- [ ] **EXM-02** Verify refresh, multi-tab/device conflict, clock manipulation and interrupted submission. Define client-timer limits honestly; only claim tamper-resistant timing if enforced server-side.
- [ ] **EXM-03** Verify score/topic/time analysis, lost-mark causes, conceptual versus careless errors and revision actions. Keep AI-inferred causes and provisional marks distinct from confirmed results.
- [ ] **EXM-04** Verify supported original/open papers and user-uploaded authorized material end to end. If a format requires human marking, provide that usable workflow instead of fabricated auto-grading.

## 6. Notes, documents and search — product/data owner

- [ ] **NTS-01** Complete note creation/editing with rich text or an equivalently usable formatted editor, math, images, tags, subjects, concept links and links between notes. Test rename/delete/undo or recovery, autosave, refresh and export.
- [ ] **NTS-02** Implement bounded PDF/worksheet import: allowlisted formats, size/page/text limits, safe parsing, private storage and deletion. Test malformed, encrypted, scanned and oversized files with honest fallback/error states; do not claim OCR unless implemented.
- [ ] **NTS-03** Verify note AI actions: summarize, quiz, flashcards, explain selected text and identify prerequisite gaps. Persist generated material with its source references and review status.
- [ ] **NTS-04** Verify immediate search and Cmd/Ctrl+K across concepts, lessons, questions, notes, documents, cards and durable conversations. Include autocomplete, recents, subject context, keyboard navigation, direct navigation and accurate result counts.
- [ ] **NTS-05** Verify indexing after edits/deletions, pagination, no results, cloud failure, long queries and slow responses. Signing out or switching accounts must immediately clear private results and pending responses.
- [ ] **NTS-06** Preserve source-location references through import, generation, review and export: document/page or supported text-span identity, source version and missing-source recovery. Verify citations point to the actual supporting content after edits; do not fabricate page references for text-only imports.

## 7. Persistence, offline use and recovery — storage/frontend owner

- [ ] **DAT-01** Implement offline access to the saved study materials and active session promised by the brief: notes, saved questions, flashcards and current work. Make cache availability explicit; an online-only AI request must fail clearly while drafts remain usable.
- [ ] **DAT-02** Add and verify an offline application-loading strategy, versioned cache updates and rollback. Do not cache auth tokens or private API responses in a shared/public cache; isolate or purge account content on logout.
- [ ] **DAT-03** Verify cloud acknowledgements, durable retry/outbox behavior, idempotency and two-device conflicts for every saved collection. Never show “saved to account” solely because a local write succeeded.
- [ ] **DAT-04** Inject lost connectivity, aborted writes, quota exhaustion, corrupted records, stale tabs, account switches and expired sessions. Original work survives, unsynced work stays exportable and recovery never silently overwrites newer content.
- [ ] **DAT-05** Verify deletion and account export cover new attempts, mistakes, conversations, notes, files, exams, planner history and queued/offline data. Deleted data must not reappear from an old cache or retry queue.

## 8. Database and migrations — database owner

- [ ] **DB-01** Establish a working isolated database runner and diagnose the recorded base-schema startup failure. Do not reset the shared/live project to make local tests pass.
- [ ] **DB-02** Reconcile the complete migration ledger and shared-project ownership. Include the practice-state and optional-school migrations plus any new feature migrations; inspect dependencies and currently applied versions.
- [ ] **DB-03** Replay every migration from empty state and from a production-shaped disposable snapshot. Run pgTAP and SQL lint, including the practice-state tests, with real execution receipts.
- [ ] **DB-04** Verify table/view/RPC grants, RLS, owner filtering, readiness functions, durable rate limits, singleton writes and account deletion cascades. Test concurrent writes and conflict acknowledgements rather than only schema text.
- [ ] **DB-05** Rehearse backup restoration and forward-compatible migration/application rollback, then apply the reviewed migration sequence to staging and production with environment-specific receipts.

## 9. Authentication, authorization and privacy — security/account owner

- [ ] **SEC-01** Verify the intended signup/access policy, email verification, onboarding, login, OAuth if offered, linking, refresh, expiry/revocation, recovery emails and logout with disposable real accounts.
- [ ] **SEC-02** Test anonymous, pending, partially onboarded, approved, non-admin and admin paths. User-editable profile metadata must not grant authorization; browser route guards are not the security boundary.
- [ ] **SEC-03** Prove User A cannot read, list, search, mutate, export or delete User B's objects by guessed IDs through APIs, database access or file storage. Include all new learning/chat records and async account-switch races.
- [ ] **SEC-04** Audit server-only keys, deployed environment scopes, repository history and built assets. Keep provider/service credentials out of clients and logs; remediate real exposure and verify rotations when needed.
- [ ] **SEC-05** Verify body/input limits, authorization, rate limits, CORS, unsafe HTML/Markdown/math/URLs, uploads, parsing and prompt-injection boundaries. Database/limiter failure must not open unrestricted expensive or privileged endpoints.
- [ ] **SEC-06** Verify production CSP/security headers, private API caching and index controls. Check for private text in telemetry, analytics, exceptions, filenames, URLs and provider logs; minimize collection and enforce retention.
- [ ] **SEC-07** Obtain appropriate review of privacy, terms, age/consent and safeguarding arrangements for the intended student population and jurisdictions. Match policies to actual storage, AI providers, retention, deletion and support practices.
- [ ] **SEC-08** Verify account export/deletion and session revocation live, including retained-token behavior. Publish usable contact, privacy-request and incorrect/unsafe-output reporting paths with responsible owners.
- [ ] **SEC-09** Re-run dependency/security scans on the final lockfile and artifact, triage every finding and close exploitable release issues. A zero dependency audit is not a substitute for authorization tests.

## 10. UI, accessibility and performance — frontend/QA owner

- [ ] **UX-01** Inventory every route and interactive control, including deep links, errors and 404. Remove or implement dead controls and production TODO/mock/dummy/placeholder content; do not remove legitimate input hints or test fixtures merely to silence a scan.
- [ ] **UX-02** Complete a consistent blue/white design system while preserving the logo, study terminology and revision trace. Verify icons/favicon/manifest assets, typography, spacing, forms, feedback, loading, empty and retry states.
- [ ] **UX-03** Capture and inspect all core routes at 1440, 1024 and 390 pixels, in both themes; correct overflow, masking, dropdown/modal stacking, sticky elements, long content, mobile keyboard and touch problems.
- [ ] **UX-04** Verify keyboard-only operation, focus return/trapping, visible focus, semantic labels, screen-reader status, zoom/text resizing, contrast and reduced motion. No concealed or offscreen control may remain in the focus order.
- [ ] **UX-05** Run representative desktop Chromium, Firefox and WebKit plus real mobile Safari/Chrome journeys. Test rotation, back navigation and reload; do not infer cross-browser compatibility from Chromium alone.
- [ ] **UX-06** Profile critical routes for loading, API waterfalls, hydration errors, redundant requests, fonts/images, animations and lazy dependencies. Keep frozen bundle budgets passing and fix measured bottlenecks.
- [ ] **UX-07** Define and pass reproducible mobile loading/interaction and API latency budgets on representative hardware/network conditions. Label laboratory measurements correctly; verify responsiveness during a continuous two-hour study session.

## 11. Editorial publication, public discovery and commercial scope — product/editorial owner

- [ ] **PUB-01** Audit product copy, metadata, demos, pricing and dashboards for unsupported learner counts, outcomes, testimonials, endorsements, grades and guarantees. Use recorded data or accurate empty states.
- [ ] **PUB-02** Publish only approved content into routes, retrieval, previews, sitemaps and structured metadata. Verify canonical links, social images, robots, sitemap and redirects on the real HTTPS domain; private routes remain excluded.
- [ ] **PUB-03** Resolve access and payment scope explicitly. A free launch has no working-looking checkout or unenforced paid/unlimited claims. If paid access is offered, implement and test prices, entitlements, webhook verification/idempotency, failures, cancellation, refunds, receipts and account-deletion interactions before closing this gate.
- [ ] **PUB-04** Verify transactional email delivery, sender configuration, valid/expired links, duplicate handling and delivery-failure visibility. Test with disposable inboxes, without exposing one-time links in logs.
- [ ] **PUB-05** Make onboarding, help, educational limitations, data controls and support instructions match the shipped product. A new student can recover from an error without repository knowledge or operator intervention.

## 12. Domain, deployment and operations — release/operations owner

- [ ] **OPS-01** Freshly verify the owning registrar/DNS zone, Vercel project, canonical host and current deployments. Diagnose the previously recorded TLS-before-HTTP failure; review records/certificates before changing them.
- [ ] **OPS-02** Verify trusted HTTPS for apex and canonical host, intended redirects, A/AAAA behavior where configured, certificate renewal and legacy-host behavior from independent networks. No redirect loops, parked pages or stale deployment aliases.
- [ ] **OPS-03** Separate preview/staging/production configuration; verify server-only secrets, OAuth redirect allowlists, provider availability and production environment completeness without printing secret values.
- [ ] **OPS-04** Deploy the exact reviewed candidate. Health revision, assets, migration ledger and approved content version must agree; protected readiness must pass every required dependency rather than merely returning liveness.
- [ ] **OPS-05** Exercise monitoring for auth failure, persistence failure, provider timeout, rate-limit-store outage and client errors. Confirm redacted telemetry, deduplicated alerts, working delivery and named incident ownership.
- [ ] **OPS-06** Define and verify provider spend/usage limits, capacity limits, backup retention, recovery objectives and degraded-service messaging. Record a tested backup restore and rollback to a known healthy release.
- [ ] **OPS-07** Confirm failed CI, database, readiness or smoke gates prevent promotion. Publish an operator runbook with current ownership, rollback/recovery steps and post-release checks.

## 13. Final acceptance journey — QA plus a learner reviewer

Run every step below on the same staging candidate and again on production using disposable accounts. Use real auth, storage and provider integrations for certification; fixtures remain regression tools. Retain redacted receipts without private student content.

- [ ] **JNY-01** Create a permitted account and verify the intended access/verification flow.
- [ ] **JNY-02** Choose curriculum, course level and subjects; refresh and confirm persistence.
- [ ] **JNY-03** Complete a meaningful diagnostic with enough distinct reviewed items.
- [ ] **JNY-04** See strengths, weaknesses and unassessed concepts with their supporting evidence.
- [ ] **JNY-05** Enter availability and an assessment/deadline; receive a feasible, explained plan.
- [ ] **JNY-06** Search for a concept immediately using the bar and Cmd/Ctrl+K, then open the correct result.
- [ ] **JNY-07** Learn from approved content and use a tutor mode without losing context or bypassing the intended attempt.
- [ ] **JNY-08** Answer practice questions and complete a timed exam session with refresh/resume.
- [ ] **JNY-09** Receive correct, appropriately qualified feedback and exactly one evidence update per submission.
- [ ] **JNY-10** Save a mistake, record corrected reasoning and perform a later retry.
- [ ] **JNY-11** Create/edit a note, import supported material, generate revision cards/questions and retrieve them later.
- [ ] **JNY-12** Complete Focus with task, breaks and notes; pause/play a game without disturbing study state.
- [ ] **JNY-13** Return the following day and on another device; see the right progress, due reviews, saved work and conversation history. Test offline continuation and reconnection.
- [ ] **JNY-14** Switch accounts and prove no data leaks; export and delete the disposable account and verify downstream cleanup.
- [ ] **JNY-15** Complete a continuous two-hour realistic study session without dead controls, unexplained dashboards, blocking layout failures, unhandled errors or lost work. Retest every defect found by the reviewer.

## 14. Close the release — accountable release owner

- [ ] **REL-01** All mandatory gates above are evidenced; no failed, blocked, unverified or deferred item remains. Conditional billing/A-Level decisions are recorded and reflected in the actual interface and claims.
- [ ] **REL-02** Final candidate installation, CI, database replay/contracts, browser/accessibility suite, live AI evaluation and content approval all pass. Archive failures and fixes as well as final passes; do not weaken checks or fabricate evidence.
- [ ] **REL-03** Production domain, readiness, exact revision, real-account journeys, two-account isolation, monitoring and recovery all have current receipts for the same release.
- [ ] **REL-04** Reconcile older audit/checklist/status documents to the final evidence. Confirm the shipped surface matches the requirement matrix and that no hidden backlog is being called complete.
- [ ] **REL-05** Record an explicit GO decision, release owner, deployment URL/SHA, migration/content versions, rollback target and evidence index. If any required proof is absent, retain NO-GO.

## Execution order and existing commands

### Retained earlier expansion work: explicit scope decisions required

The earlier execution plan includes the following work beyond the current core gates.
These entries are retained so "nothing remaining" cannot silently discard them.
Each needs an explicit product scope decision: include and implement with acceptance
evidence, or record that it is outside this release and remove any public promise.
An out-of-scope decision does not mean the feature was implemented. Mandatory core
capabilities above cannot be excluded through this mechanism.

- [ ] **EXT-01** Resolve teacher/tutor confirmation roles, immutable confirmation records, revocation and audit history (VX-502); include the live role/forgery matrix if offered. Existing learner-attested evidence must never be described as teacher verification.
- [ ] **EXT-02** Resolve private artefact sharing with expiring/revocable links (VX-503), including selected-content export, metadata redaction, enumeration resistance and immediate revocation.
- [ ] **EXT-03** Resolve invitation-based comments/collaboration and notifications (VX-508), including owner/collaborator/teacher permissions, removal, audit history and notification privacy.
- [ ] **EXT-04** Resolve a chronological revision history linking note, attempt, feedback, confirmation and retry (VX-501), preserving the evidence status of every event.
- [ ] **EXT-05** Resolve pre-action quota/usage transparency (VX-507), matching server accounting and reset semantics without promising calls that enforcement rejects; cross-reference AI-06 and PUB-03.
- [ ] **EXT-06** Close the feedback-to-evaluation maintenance workflow (VX-505): reviewed incorrect-output reports become de-identified regression fixtures only through explicit privacy controls; demonstrate a failure before its fix and a passing regression afterward.
- [ ] **EXT-07** Add per-candidate route/chunk size deltas and alerts (VX-403) alongside existing frozen budgets; a smaller total bundle must not conceal a critical-route regression.

### Checklist maintenance

The companion [gate register](COMPLETION_GATE_REGISTER.json) enumerates every
checkbox in this document with its owner role and acceptance text. It starts at
`OPEN`, with empty receipt lists; historical local passes do not close complete
release gates. Keep the register and this checklist synchronized when scope or
evidence changes. Dependencies and named people must be resolved before executing
external gates; owner roles here are responsibilities, not assigned individuals.

Cross-check performed on 24 September against the existing execution plan, finish
and final-readiness lists, QA matrix, exam release gates, improvement report and
Learning OS report. This is a repository-record scope audit, not proof that every
requirement from an unavailable original conversation has been recovered. SRC-03
remains open until the original brief is mapped to implementation and tests.

Start with source reconciliation and a working isolated database. Complete curriculum/content and the remaining product systems, then perform real integration, privacy/security and usability verification. Finish with the reviewed deployment, production journey and operational certification. Source/content/model/configuration changes after testing invalidate the affected receipts.

These are existing repository entry points, not a claim they were rerun for this checklist. Use the supported Node/npm toolchain in the clean candidate. **`db:test` resets a database: run it only against a confirmed disposable local test target, never production or the shared project.** Inspect environment-dependent commands before execution; do not put tokens in command-line arguments or logs.

```sh
rtk npm ci
rtk npm run ci
rtk npm run content:audit
rtk npm run db:test
rtk proxy npx playwright test --config playwright.learning.config.ts
rtk npm run test:e2e:local-accessibility
rtk npm run test:e2e:authenticated-golden
rtk npm run eval:ask:live
rtk npm run check:public-boundary
rtk npm run probe:gates
rtk npm run test:smoke
```

The current learning Playwright configuration is Chromium-only and uses fixtures for integrations. Extend it to satisfy the browser and live-journey gates above. A script returning zero does not substitute for content approval, successful database execution, live account isolation, a restore rehearsal or a learner review.

## Evidence and historical references

- [Learning OS implementation report](LEARNING_OS_2026-09-21.md)
- [50-file implementation manifest](../ci-evidence/learning-os-20260921/source-manifest.json)
- [Historical source CI receipt](../ci-evidence/learning-os-20260921/ci-planner-final.log)
- [Historical 31-scenario browser receipt](../ci-evidence/learning-os-20260921/browser-full-final.log)
- [Previous operational checklist](FINAL_READINESS_CHECKLIST.md), [QA matrix](QA_MATRIX.md), [exam release gates](EXAM_PREP_RELEASE_GATES.md)
- [Repository isolation boundary](../VERTEXED_REPO_ISOLATION.md) and [current WIP warning](../DO_NOT_USE_AS_CANONICAL.md)

Release record to complete: candidate SHA; deployment ID/URL; canonical host; Node/npm versions; migration ledger; approved content manifest; provider/model configuration; gate-to-receipt index; editorial/security/QA/operations verifiers; rollback target; final GO timestamp.
