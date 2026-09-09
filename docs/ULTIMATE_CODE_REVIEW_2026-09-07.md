# VertexED: code review and ultimate improvement checklist

Reviewed 7 September 2026. Review of the current working tree, including pre-existing staged changes. Application code was not changed for this review.

> This document preserves the **pre-implementation review** and its original evidence. The subsequent implementation, updated test results, completed tasks, and remaining limits are recorded in [`PROJECT_FINISH_CHECKLIST.md`](../PROJECT_FINISH_CHECKLIST.md). Findings and unchecked expansion ideas below are historical recommendations, not a claim that the fixes are still absent.

## Overall judgment

VertexED is a substantial private-beta exam-preparation workspace. It has real authentication, server-side AI calls, persistence, timed practice, answer review, retry scheduling, and a useful attempt to distinguish AI feedback from measured learning. Calling it merely a scaffold would be inaccurate.

Its largest weakness is consistency across these features. Different modules implement different storage, identity, validation, grading, and progress rules. The app can generate useful study materials while losing a flashcard schedule, exaggerating activity, or mischaracterizing a student's trajectory. Those failures undermine its central promise more than missing features do.

**Its strongest purpose is to help a student decide what to study next, attempt it, understand the mistake, and demonstrate improvement later.** The durable product asset would be the relationship between curriculum objectives, source material, attempts, verified corrections, and delayed retrieval. Generating another document is useful only when it advances that loop.

Recommended positioning: **“Your next study action, backed by your syllabus and evidence of what you can actually do.”** This is a strategic interpretation of the implementation, not a claim that learning outcomes have already been validated.

## Scope and evidence limits

The review inventoried the repository and scanned the application for unfinished-code markers, traced its important feature and data flows, inspected configuration/migrations/tests, and ran local checks. This is a repository-wide engineering review, not a claim that every line or every study-guide factual assertion was individually certified.

Tracked inventory includes 239 files under `src`, 55 under `api`, 26 under `supabase`, 21 under `evals`, 184 under `tests`, 32 GitHub workflows, and 423 files under `portfolio`. The repository's own `VERTEXED_REPO_ISOLATION.md` excludes the unrelated portfolio/research projects from the VertexED runtime boundary. Their integration and maintenance impact is assessed here; their individual scientific claims are not certified.

Local checks used Node 26.8.1, whereas the package declares Node 22.x. Passing here does not substitute for the pinned CI runtime. Live AI quality, deployed database state, real authentication-provider settings, production browser behavior, and real-user educational outcomes were not certified. No production data was changed.

| Check | Result |
|---|---|
| `npm run typecheck` | Passed; limited to `src`, with strictness disabled |
| `npm run lint:ci` | Passed; several important JS/MJS paths have zero effective rules |
| `npm run test:app` | 524 passed, zero failed/skipped |
| `npm run test:eval` | 25 passed |
| `npm run eval:ask` | 13/13 offline fixture prompts passed |
| `npm run eval:grading:check` | Passed on six synthetic grading cases |
| `npm run build` | Passed |
| `npm run performance:bundle` | Passed; initial JS 219,224 gzip bytes; initial CSS 29,592; largest JS 230,951; total JS 967,353 |
| Targeted logic reproductions | Confirmed duplicate flashcard IDs and false declining mastery trend |
| Authenticated browser journey | See verification addendum below |
| Local database reset/pgTAP, live provider benchmark, production dependency audit | Not run in this review |

## What is going well

1. **The core study loop exists.** `examFlow.ts`, `MockExamMode.tsx`, `AnswerReviewer.tsx`, `retryQueue.ts`, and `ExamPrep.tsx` connect practice and follow-up instead of presenting only disconnected generators.
2. **AI is not automatically declared correct.** `api/_lib/verifiedGrading.js:139` distinguishes evidence-linked and provisional model judgments and always sets model-only measurement eligibility to false. Exact answer spans and rubric totals are checked.
3. **Graceful degradation is unusually explicit.** `learningArtifactFallbacks.js` labels source-extraction and practice scaffolds, attaches digests, and warns when there is no factual answer key. Preserve this honesty.
4. **There is meaningful security infrastructure.** Authenticated API handlers validate users server-side; database migrations narrow grants and apply ownership policies; atomic rate limiting fails closed in production; account deletion revokes refresh sessions before deleting the identity.
5. **Recovery has been taken seriously.** Account-scoped storage, revision-sensitive acknowledgements, idempotency keys, and an IndexedDB outbox are valuable foundations. Their coverage and consistency need work, rather than replacement from scratch.
6. **Tests cover real contracts as well as source assertions.** The 524 passing app tests are useful evidence for existing behavior. Database tests and browser journeys also exist.
7. **Release integrity has deliberate controls.** Build revision stamping, health/readiness checks, locked installs, pinned Actions, and production smoke checks are good practices.
8. **Performance work is already visible.** Route splitting, delayed telemetry, constrained-network prefetch rules, and executable bundle budgets make further optimization measurable.
9. **Accessibility is more than an afterthought.** Shared modal/focus helpers, semantic controls, keyboard tests, reduced-motion consideration, and accessible status components exist.
10. **Privacy documentation describes limitations.** The policy distinguishes browser-only data, supported cloud sync, generated material, and account deletion. Match implementation more tightly to these descriptions.

## Findings to address first

Priorities: **P1** = fix before expanding the pilot; **P2** = complete before a broad launch; **P3** = deliberate extension. No confirmed P0 critical exploit is asserted by this review.

### F01 — P1: generating flashcards replaces the entire study deck

**Evidence:** `src/pages/NotetakerQuiz.tsx:779–790`, especially line 788. The effect returns `cardsFromFlashcards(flashcards, deckId)` whenever the incoming cards differ from the existing array. It does not merge with the deck.

**Consequence:** Generate topic A, rate its cards, then generate topic B: A's cards and scheduling history disappear from the active SR deck. Importing notebook cards into that same deck is also vulnerable to replacement.

**Fix:** Model decks and cards separately, merge by stable card identity, and preserve scheduling for unchanged cards. Require an explicit replace action if replacement is intended.

**Acceptance:** Add two topics and a notebook output, rate cards, regenerate one topic, reload, and verify that unrelated cards and scheduling remain intact.

### F02 — P1: flashcard identity collisions can update multiple cards at once

**Evidence:** `src/lib/spacedRepetition.ts:21` derives identity from deck prefix and index. `src/components/notebook/NotebookOutputPanel.tsx:31` derives the prefix from only the first 20 title characters. `src/lib/srDeck.ts:44` deduplicates by text, not ID. Rating in `NotetakerQuiz.tsx:818` updates every matching ID.

**Reproduction:** Two different cards generated with `nb-Biology` both receive `nb-Biology-0`. Both can survive text deduplication, then both match a single rating operation.

**Fix:** Use persistent notebook/output/card IDs, enforce uniqueness, and migrate existing collisions without discarding scheduling history.

### F03 — P1: weekly review counts sum cumulative totals

**Evidence:** `src/lib/progressAnalytics.ts:57–66` records the total attempts present in the retained heatmap in each daily snapshot. Line 78 sums those snapshots as `reviewsThisWeek`. It also uses the last seven records rather than an actual seven-day time filter.

**Consequence:** Ten historical attempts present on seven snapshot days can display as 70 reviews even with no new attempts. Sparse snapshots can incorporate old activity. Readiness calculations consume this number.

**Fix:** Count distinct attempt events by timestamp in the actual reporting window. Keep cumulative totals and daily counts as different fields.

**Acceptance:** Ten attempts on Monday and none afterward still produce ten weekly attempts; attempts outside the last seven days contribute zero.

### F04 — P1: subject trend is derived from different topics, not time

**Evidence:** `src/lib/adaptiveLearning.ts:47–77` splits topic-average scores into “recent” and “older” slices. The input comes from `getWeakestTopics(8)`, which is sorted by weakness and excludes topics at 70% or above. `attempts: data.count` counts topics, not attempts.

**Reproduction:** Four observations at the same time, scored 20/30/40/60 with ten attempts each, returned `{ mastery: 38, attempts: 4, trend: 'declining' }`. No temporal decline exists in that input.

**Fix:** Compute trends from time-ordered comparable attempts; use the full measured subject population for subject summaries. Show insufficient evidence when change cannot be inferred.

### F05 — P1: planner and notebook snapshots can overwrite concurrent work

**Evidence:** `plannerSync.ts:121,162`, `notebookSync.ts:109,145`, and `api/_lib/userContentStore.js` use whole-snapshot selection/replacement. Updates do not require the expected previous revision. The singleton unique index prevents duplicate rows, not lost edits.

**Consequence:** Two devices load the same notebook collection, edit different notebooks, and save. The last accepted snapshot can erase the other device's changes. Out-of-order saves can overwrite more recent edits. Device timestamps and server update times are compared as though they share one trusted ordering.

**Fix:** Add optimistic concurrency with server revisions and conflict handling, then move to per-notebook/per-task writes. Provide a recoverable conflict copy rather than silently choosing a winner.

### F06 — P1: learner hydration silently stops at 500 mixed records

**Evidence:** `api/_lib/learnerStateStore.js:52` limits the combined weakness/retry/mock-draft query to 500. `/api/learner-state` returns no pagination cursor and the client performs one GET.

**Consequence:** As measurement history grows, an older unfinished mock or retry can fall outside the first 500 rows and disappear on a new device. The database may retain it, but normal recovery cannot retrieve it.

**Fix:** Stable cursor pagination or separate active-state queries from paginated history. Define retention per state type.

### F07 — P1: the committed CSP blocks the graphing iframe

**Evidence:** `GraphingSuite.tsx:12,37` embeds `https://www.desmos.com`. `vercel.json:36` has `default-src 'self'` but no `frame-src` or `child-src` allowance.

**Consequence:** A deployment applying this policy blocks the embedded tool. The inference follows the documented fallback from `frame-src` to `child-src` to `default-src`; see [MDN's frame-src reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src). This was not a live production browser observation.

**Fix:** Explicitly permit the required frame origin after checking the actual embed flow, retain restrictive defaults, and test with deployment-equivalent headers.

### F08 — P1: clearing the account does not clear its current-device study stores

**Evidence:** `UserSettings.tsx:223–246` deletes the cloud identity then logs out locally. `AuthContext.tsx` resets auth and storage scope, but does not delete the account's localStorage and IndexedDB recovery records.

**Consequence:** Study text and queued records can remain on the device after account deletion. Account scoping prevents normal cross-account display; it is not physical erasure of data.

**Fix:** After confirmed server deletion, remove only that account's local/session data and IndexedDB records. Make cleanup failures explicit and retryable. Do not erase another account's recovery data.

### F09 — P2: lint/typecheck success overstates coverage

**Evidence:** `tsconfig.app.json:18` disables strict checks and includes only `src`. `eslint.config.js` applies recommended JavaScript rules to API libraries and tests, but not API handlers, source MJS, or evaluation/build scripts.

**Reproduction:** ESLint's resolved configuration reported zero rules for `api/_handlers/quiz.js`, `src/lib/progressAnalyticsCore.mjs`, `evals/scripts/run-grading-eval.mjs`, and `scripts/build.mjs`; `api/_lib/auth.js` had 61 rules.

**Fix:** Add explicit lint configurations for every application JS/MJS surface, then enable strict typing incrementally and typecheck the server. Verify effective configuration in a small configuration-contract test.

### F10 — P2: AI quiz responses are insufficiently validated

**Evidence:** `api/_handlers/quiz.js:151–176` checks that `questions` is a nonempty array, then spreads each model object. It does not enforce unique IDs, requested counts, supported types, valid choices, or an answer belonging to the choices. The server correctly replaces model provenance with its own metadata.

**Consequence:** Syntactically valid provider JSON can still produce broken quizzes or misleading scores. Similar notebook output paths assume collections have array methods without validating their shape.

**Fix:** Shared runtime schemas for every output kind, semantic checks, bounded repair attempts, and a clearly labeled failure/fallback state.

### F11 — P2: notebook growth quickly exceeds its single-artifact payload cap

**Evidence:** `notebookSync.ts` serializes all notebooks and sources into one artifact; `api/_handlers/user-content.js:14` caps an artifact at 256 KiB.

**Consequence:** A moderately populated notebook collection can become local-only even when each individual notebook is reasonable. The server rejects oversized data rather than silently accepting it, but the storage model is too coarse.

**Fix:** Store notebooks, sources, and outputs as separate records; upload larger source bodies to appropriate object storage; expose size and sync status before failure.

### F12 — P2: “Concept Map” has generation but no diagram renderer

**Evidence:** `api/_lib/grounding.js:117` requests Mermaid. `NotebookOutputPanel.tsx` routes it to `ChatMarkdown.tsx`, which provides math/Markdown rendering but no Mermaid component.

**Consequence:** Users receive diagram source code, not the promised concept map.

**Fix:** Safely render diagrams with an accessible text alternative, or clearly rename the output as diagram source until implemented.

### F13 — P2: export excludes recovery data that exists only in IndexedDB

**Evidence:** `src/lib/accountExport.ts` collects localStorage; the outbox supports IndexedDB records, including when localStorage persistence fails. The account export flow does not merge the durable outbox.

**Consequence:** A user's export can omit their latest unsynced work exactly when recovery matters most. Local-only planner/notebook snapshots also require their separate storage keys to be included explicitly.

**Fix:** Export a reconciled inventory from all supported persistence stores, with source, revision, sync status, and a restorable schema version.

### F14 — P2: successful HTTP responses do not mean successful AI work

**Evidence:** Missing providers can return HTTP 200 with degraded note/paper/review output. `src/lib/monitoring.ts` classifies an AI run by HTTP status. Provider telemetry records provider response status before downstream output validation.

**Consequence:** Availability and useful-generation rates can diverge while dashboards look healthy.

**Fix:** Record transport success, schema validity, degraded mode, and user-usable completion separately. Keep the existing restriction against logging raw study content.

### F15 — P1: guide retrieval does not carry the editorial trust boundary

**Evidence:** `public/study-guides/myp/provenance-ledger.json` records 245 files: zero approved, 192 unreviewed, and 53 quarantined; all 245 are held from indexing. `api/_lib/studyGuideRetrieval.js` loads pages from the manifest without reading that ledger. `study-guide-chat.js` passes their text to the model and returns source labels/paths without editorial status.

**Consequence:** Retrieval grounding can reproduce material that has not passed factual/source review. The guide reader does show warnings, which is good, but the retrieval/API contract does not distinguish reviewed material from quarantined content. Being grounded in a repository file is not equivalent to being correct.

**Fix:** Make editorial status part of retrieval eligibility and returned source metadata. Exclude quarantined material from ordinary tutoring; use an explicit unverified-content mode if the pilot needs unreviewed sources. With zero approved pages, be candid that the approved corpus is not ready, and prioritize a small reviewed subject set.

## Pseudocode, scaffolding, placeholders, and incomplete promises

The source scan did not reveal widespread TODO/FIXME stubs or unimplemented production methods. HTML input placeholders and random IDs are not evidence of fake functionality. Important incompleteness is mostly in behavior and validation rather than obvious comments.

| Surface | Actual status | Recommended treatment |
|---|---|---|
| Note fallback | Real deterministic study scaffold, explicitly labeled | Preserve; never treat as researched factual notes |
| Paper fallback | Generic command-term prompts and human-check instructions | Keep separate from exam-standard question banks |
| Quiz fallback | Questions constructed from supplied note segments | Label consistently in the quiz UI; generation handler metadata is not currently retained by its quiz-generation UI flow |
| Adaptive recommendations | Handwritten ranking rules | Useful first version; expose reasons and validate outcomes before claims of sophisticated personalization |
| Preparation/readiness score | Weighted activity heuristic plus limited assessment data | Keep activity distinct from predicted exam performance; fix the upstream counting defects |
| Teacher confirmation | Learner selects a confirmation method | Call it learner-attested checking; a verified teacher workflow needs reviewer identity and an editable confirmed mark |
| Concept map | Mermaid source generated without renderer | Complete the visual feature |
| Notebook quiz | Question display and answer reveal | Extend to attempts, grading, and retries if advertised as practice assessment |
| Audio modes | Generated scripts spoken by browser speech synthesis | Useful playback; not a produced multi-voice downloadable podcast |
| Source grounding | Prompted source restrictions and textual retrieval | Not proof that every claim is supported; add citation validation and abstention tests |
| Board guides | Explicitly AI-generated/unverified, cached for 30 days | Add specification-version/source checks and preserve status on exports |
| Ask evaluation | 13 stored fixture responses | Contract/regression evidence, not a current model benchmark |
| Grading evaluation | Six synthetic normalizer cases | Does not establish grading accuracy against teachers |
| Auth context no-op defaults | Provider fallback values | Replace with a missing-provider error where useful; not evidence that login itself is fake |
| Monitoring comment | Mentions a Sentry DSN while implementation sends custom telemetry | Remove stale integration commentary |
| Package metadata | `vite_react_shadcn_ts`, version `0.0.0` | Replace template metadata with deliberate project metadata |
| Research/portfolio artifacts | Preserved cross-project material | Honor the archival boundary; do not present as VertexED capability |

## Architecture that would improve this product

Keep the current React/Vite/Supabase approach unless a measured limitation justifies changing it. A rewrite would postpone the important work.

Converge on a shared domain: **curriculum version → objective → source → practice item → attempt → assessment → verification → scheduled retry**. Notes, flashcards, notebooks, papers, and tutor conversations should reference this domain rather than carrying unrelated versions of it.

Use one persistence interface with account-bound credentials, runtime validation, durable writes, server revisions, conflict reporting, and queryable sync state. Use one assessment contract distinguishing model suggestions, learner attestations, authenticated reviewer decisions, and validated answer keys. Build progress from timestamped attempt events, not reconstructed dashboard snapshots.

Split the largest pages by responsibility as behavior is stabilized: `NotetakerQuiz.tsx` is 1,820 lines, `AnswerReviewer.tsx` 1,093, and `StudyNotebook.tsx` 774. Extract domain hooks and services before splitting JSX merely to reduce line counts.

## Ultimate checklist

Unchecked items are proposed work, not claims that every capability is completely absent. Priorities describe recommended sequencing. The 126 items below include fixes, verification, product decisions, and expansion work.

### 1. Purpose and product focus

- [ ] **P1 PRODUCT-01:** Choose one pilot curriculum/year/subject cluster and document exactly what is supported.
- [ ] **P1 PRODUCT-02:** Make the primary journey “next action → attempt → correction → retry,” with one clear next step after each completion.
- [ ] **P2 PRODUCT-03:** Define activation as a completed study loop rather than an account signup or generated document.
- [ ] **P2 PRODUCT-04:** Measure return visits and completed delayed retries by cohort before broadening the feature menu.
- [ ] **P2 PRODUCT-05:** Distinguish activity, self-reported confidence, assessed performance, and curriculum coverage throughout the interface.
- [ ] **P2 PRODUCT-06:** Create a capability matrix: live, degraded, local-only, verified, experimental, and planned.
- [ ] **P3 PRODUCT-07:** Interview learners who abandoned their second session and prioritize the repeated obstacles.

### 2. Data integrity and synchronization

- [ ] **P1 DATA-01:** Fix whole-deck replacement (F01) and duplicate card identity (F02).
- [ ] **P1 DATA-02:** Add server revisions and conflict handling to planner/notebook saves (F05).
- [ ] **P1 DATA-03:** Paginate learner-state hydration without losing active retries or drafts (F06).
- [ ] **P1 DATA-04:** Bind planner/notebook hydration and saves to captured account identity and token; test account changes during requests and 401 refresh.
- [ ] **P1 DATA-05:** Preserve edits while uploads are in flight; confirm every acknowledgement against the uploaded revision.
- [ ] **P2 DATA-06:** Display combined localStorage/IndexedDB pending state, including failed durable writes and stale acknowledgements.
- [ ] **P2 DATA-07:** Implement sync for flashcard scheduling, or clearly state its device-only limitation wherever continuity is promised.

### 3. Storage, recovery, and portability

- [ ] **P1 RECOVERY-01:** Clear current-account localStorage, sessionStorage, and IndexedDB data after confirmed account deletion (F08).
- [ ] **P2 RECOVERY-02:** Include all durable unsynced work and local planner/notebook data in exports (F13).
- [ ] **P2 RECOVERY-03:** Add a validated import/restore flow with preview, duplicate handling, and schema migration.
- [ ] **P2 RECOVERY-04:** Split notebook collections into independently saved records before the 256 KiB limit becomes routine (F11).
- [ ] **P2 RECOVERY-05:** Centralize storage errors; quota/full/blocked storage must produce explicit recoverable UI states.
- [ ] **P2 RECOVERY-06:** Add bounded request deadlines and retry/backoff to background persistence, so a hung fetch cannot hold a single-flight lock indefinitely.
- [ ] **P2 RECOVERY-07:** Test concurrent tabs, offline edits, device clock skew, interrupted requests, and browser restart with pending writes.

### 4. Assessment integrity and pedagogy

- [ ] **P1 ASSESS-01:** Preserve the rule that model-only evidence cannot update measured mastery.
- [ ] **P1 ASSESS-02:** Allow a human-checked score to differ from the suggested AI score; record both with an explanation.
- [ ] **P2 ASSESS-03:** Separate learner attestation from authenticated teacher verification in the data model and labels.
- [ ] **P2 ASSESS-04:** Attach verification to an immutable attempt and rubric/specification version, not only a generic reference string.
- [ ] **P2 ASSESS-05:** Validate criterion maxima against the trusted question/rubric rather than allowing model-provided maxima to define authority.
- [ ] **P2 ASSESS-06:** Add a correction/retraction path that recalculates dependent mastery and retry decisions.
- [ ] **P3 ASSESS-07:** Measure delayed retention and transfer to unseen questions using a predefined pilot protocol.

### 5. Progress and adaptive planning

- [ ] **P1 PROGRESS-01:** Replace cumulative weekly review sums with distinct timestamped attempts (F03).
- [ ] **P1 PROGRESS-02:** Replace cross-topic pseudo-trends with longitudinal comparable evidence (F04).
- [ ] **P1 PROGRESS-03:** Count attempts accurately and compute subject summaries from all relevant evidence, not only the weakest topics.
- [ ] **P2 PROGRESS-04:** Base day/week boundaries on the learner's explicit timezone; test midnight and daylight-saving transitions.
- [ ] **P2 PROGRESS-05:** Expire stale streak display and exclude historical activity from current preparation signals.
- [ ] **P2 PROGRESS-06:** Show sample size, coverage, recency, and uncertainty beside mastery values.
- [ ] **P3 PROGRESS-07:** Compare recommendation policies using retry completion and later correctness, not click-through alone.

### 6. Curriculum and content

- [ ] **P1 CONTENT-01:** Enforce editorial status in retrieval (F15), approve a small source corpus, and introduce objective IDs with board, course, level, and syllabus edition.
- [ ] **P2 CONTENT-02:** Map generated questions and review criteria to objectives without treating arbitrary model IDs as verified mappings.
- [ ] **P2 CONTENT-03:** Track authoritative source, edition, section/page, review date, reviewer, and usage permission for curated content.
- [ ] **P2 CONTENT-04:** Build a content-review queue for factual accuracy, ambiguous questions, missing prerequisites, and obsolete exam structures.
- [ ] **P2 CONTENT-05:** Add board-guide cache identity for grade/level and specification version; current board/topic-only caching can reuse the wrong variant.
- [ ] **P2 CONTENT-06:** Preserve AI/unverified/degraded provenance in exported notes, papers, guides, and flashcards.
- [ ] **P3 CONTENT-07:** Expand to additional boards only after the first curriculum has useful coverage and human-reviewed examples.

### 7. AI reliability and source grounding

- [ ] **P1 AI-01:** Validate generated quiz and notebook structures and semantic constraints (F10).
- [ ] **P2 AI-02:** Use shared schemas and versioned prompts for every provider-facing feature.
- [ ] **P2 AI-03:** Treat source text as untrusted data and test embedded instructions, misleading citations, and conflicting documents.
- [ ] **P2 AI-04:** Add resolvable citation IDs, source excerpts, and a validator that rejects nonexistent references.
- [ ] **P2 AI-05:** Make insufficient-source abstention and truncation visible rather than silently dropping late sources.
- [ ] **P2 AI-06:** Consolidate provider configuration, output parsing, cancellation, deadlines, fallback policy, and failure taxonomy.
- [ ] **P3 AI-07:** Benchmark section retrieval and keyword search before investing in more complex retrieval infrastructure.

### 8. Notes, notebooks, and flashcards

- [ ] **P1 STUDY-01:** Preserve card schedules across regeneration, rename, merge, import, and notebook-title changes.
- [ ] **P2 STUDY-02:** Add explicit deck management, source links, duplicate review, card editing, and undo.
- [ ] **P2 STUDY-03:** Render concept maps accessibly and safely (F12).
- [ ] **P2 STUDY-04:** Turn notebook quizzes into attemptable practice with saved answers and a retry handoff.
- [ ] **P2 STUDY-05:** Retain and display deterministic quiz fallback metadata in the frontend.
- [ ] **P2 STUDY-06:** Add source-upload progress, extraction failures, citation anchors, and file-size limits if extending ingestion.
- [ ] **P3 STUDY-07:** Extend audio with selectable voices, segment navigation, transcript highlighting, and explicit export support only when implemented.

### 9. Planner, mocks, and Study Zone

- [ ] **P1 FLOW-01:** Fix the Desmos frame policy and verify both graph modes with production-equivalent headers (F07).
- [ ] **P2 FLOW-02:** Ask for real availability before assigning starter sessions at fixed 5/6 PM slots.
- [ ] **P2 FLOW-03:** Detect schedule overlaps, capacity overload, and tasks scheduled after the exam date.
- [ ] **P2 FLOW-04:** Link task completion to actual attempts where possible while keeping manual completion clearly labeled.
- [ ] **P2 FLOW-05:** Test mock recovery after reload, browser suspension, expired session, and offline completion.
- [ ] **P2 FLOW-06:** Add question-level navigation, incomplete-answer warnings, and mark/time allocation checks to mock QA.
- [ ] **P3 FLOW-07:** Add calendar import/export, optional reminders, and workload rescheduling with explicit learner control.

### 10. Frontend architecture and contracts

- [ ] **P1 CODE-01:** Apply ESLint rules to handlers, source MJS, evaluation scripts, and build scripts (F09).
- [ ] **P2 CODE-02:** Enable strict TypeScript in domain and persistence modules first, then feature by feature.
- [ ] **P2 CODE-03:** Add server typechecking and shared request/response runtime validation.
- [ ] **P2 CODE-04:** Consolidate overlapping contracts in `src/contracts`, `src/types`, and server-side shape normalization.
- [ ] **P2 CODE-05:** Extract notes generation, quiz attempts, exports, and SR state from the large Notetaker page.
- [ ] **P2 CODE-06:** Replace global mutable storage scopes where feasible with explicit account-scoped service instances.
- [ ] **P2 CODE-07:** Give the package real metadata and remove stale comments, paths, unused compatibility branches, and dead exports after checking references.

### 11. UX and accessibility

- [ ] **P1 UX-01:** Make “saved,” “pending,” “device-only,” “conflict,” and “failed” mean the same thing on every feature.
- [ ] **P2 UX-02:** Replace content-dependent DOM accessibility patches with labels, dialogs, focus behavior, and status regions owned by React components.
- [ ] **P2 UX-03:** Replace disruptive alert-based generation failures with inline recovery and preserved input.
- [ ] **P2 UX-04:** Manually test keyboard, screen reader, zoom, mobile reflow, dark/light contrast, and reduced motion on the complete core loop.
- [ ] **P2 UX-05:** Keep one prominent next action and move low-frequency tools behind progressive disclosure.
- [ ] **P2 UX-06:** Give long AI operations meaningful progress, cancel/retry controls, and protection against duplicate submissions.
- [ ] **P3 UX-07:** Add learner preferences for text density, reading size, reduced animation, and study-session length without making onboarding burdensome.

### 12. Security and abuse resistance

- [ ] **P1 SEC-01:** Verify deployed grants, RLS, function privileges, and Auth signup settings against the migration/access contract.
- [ ] **P1 SEC-02:** Test cross-account reads/writes, revoked identities, refresh races, exports, and deletion through the real API boundary.
- [ ] **P2 SEC-03:** Use role-scoped database clients for ordinary user operations where practical; keep service-role usage narrowly audited.
- [ ] **P2 SEC-04:** Enforce request byte limits on actual received content in every adapter, including pre-parsed and streamed requests.
- [ ] **P2 SEC-05:** Add per-account daily AI budgets, concurrent-generation limits, and a global spend cutoff beyond per-endpoint rate limits.
- [ ] **P2 SEC-06:** Audit CSP inline-script requirements, embed origins, external links, and sanitization with malicious generated content fixtures.
- [ ] **P2 SEC-07:** Add secret scanning, dependency update ownership, and an incident-response drill; run a fresh production dependency audit.

### 13. Privacy and operational policy

- [ ] **P1 PRIVACY-01:** Verify deletion clears cloud rows and current-device content, while accurately describing backups and other devices.
- [ ] **P2 PRIVACY-02:** Define and implement retention periods for telemetry, expired rate-limit rows, old drafts, and abandoned accounts.
- [ ] **P2 PRIVACY-03:** Document subprocessors, actual configuration, and the fields sent by each AI capability.
- [ ] **P2 PRIVACY-04:** Establish an age/guardian/school process appropriate to the intended pilot before widening student access; obtain qualified review of policy obligations.
- [ ] **P2 PRIVACY-05:** Verify the privacy/support mailboxes and account-data request handling actually work.
- [ ] **P2 PRIVACY-06:** Make local-only data and shared-device behavior understandable in Settings.
- [ ] **P3 PRIVACY-07:** Add opt-in teacher sharing with explicit scope, revocation, and a visible access history.

### 14. Testing and evaluation

- [ ] **P1 TEST-01:** Add behavioral regression tests for F01–F08 before modifying their implementations.
- [ ] **P1 TEST-02:** Run authenticated golden tests before merge; the current workflow restricts that job to main/master pushes.
- [ ] **P2 TEST-03:** Replace source-regex proofs of safety with executed account-switch, storage, and asynchronous race tests.
- [ ] **P2 TEST-04:** Run database contracts from a blank schema and test upgrade from representative existing learner data.
- [ ] **P2 TEST-05:** Create a teacher-labeled held-out grading set spanning subjects, score ranges, misconceptions, and handwriting quality.
- [ ] **P2 TEST-06:** Report live-provider quality separately from fixture/normalizer results, including disagreement, abstention, malformed output, and latency.
- [ ] **P2 TEST-07:** Test at least the core browser matrix and deploy-equivalent routing/headers; do not rely exclusively on mocked Chromium requests.

### 15. Performance and scale

- [ ] **P2 PERF-01:** Measure core routes on a constrained mobile device/network, including long notes and populated notebooks.
- [ ] **P2 PERF-02:** Preserve current bundle budgets; total JS is already about 96.7% of its limit and the largest chunk about 96.2%.
- [ ] **P2 PERF-03:** Inspect the dependency chain for PDF, Markdown, charts, and optional visual components before adding packages.
- [ ] **P2 PERF-04:** Add per-account/capability request, token, cost, and latency budgets using non-content telemetry.
- [ ] **P2 PERF-05:** Measure query plans and indexes for real artifact/learner-state sizes after fixing pagination.
- [ ] **P2 PERF-06:** Restrict year-long immutable caching to content-addressed assets; unversioned public filenames must be refreshable.
- [ ] **P3 PERF-07:** Add background jobs/object storage only for demonstrated long-running generation or ingestion needs.

### 16. Observability, deployment, and operations

- [ ] **P1 OPS-01:** Separate transport success, valid output, degraded fallback, and useful completion metrics (F14).
- [ ] **P2 OPS-02:** Add privacy-safe request/build/prompt version correlation for failures and feedback.
- [ ] **P2 OPS-03:** Alert on sustained auth, sync, provider, and malformed-output failures with actionable runbooks.
- [ ] **P2 OPS-04:** Re-run the complete candidate gate under the declared Node/npm versions.
- [ ] **P2 OPS-05:** Prove rollback and database restore in an isolated environment with explicit recovery targets.
- [ ] **P2 OPS-06:** Compare production schema/readiness and deployed revision to the candidate before announcing release readiness.
- [ ] **P2 OPS-07:** Document ownership of migrations, content review, support, model changes, and incident response.

### 17. Repository hygiene, documentation, and discovery

- [ ] **P1 REPO-01:** Stop unrelated quarantined projects from gating VertexED releases; `npm test` currently runs the quarantine scope too.
- [ ] **P2 REPO-02:** Archive/migrate unrelated projects and workflows using the preservation rules in `VERTEXED_REPO_ISOLATION.md`.
- [ ] **P2 REPO-03:** Keep one current status document linked to generated evidence instead of many competing handoff ledgers.
- [ ] **P2 REPO-04:** Update the README's outdated planner paths and overbroad lint/testing descriptions.
- [ ] **P2 REPO-05:** Audit every public claim against tested behavior, especially official alignment, adaptation, mastery, and audio/diagram functionality.
- [ ] **P2 REPO-06:** Check public resource freshness, canonical URLs, indexing rules, and social metadata as delivered without client execution.
- [ ] **P3 REPO-07:** Consider prerendering public editorial pages after measuring crawler/share-preview problems; avoid rebuilding the authenticated app solely for SEO.

### 18. High-value extensions

- [ ] **P3 EXT-01:** Build a curriculum coverage map connecting every objective to source material, attempts, verification, and next action.
- [ ] **P3 EXT-02:** Build a mistake notebook that groups recurring misconceptions and schedules varied follow-up questions.
- [ ] **P3 EXT-03:** Add a teacher moderation inbox for disputed/uncertain grades with criterion-level corrections.
- [ ] **P3 EXT-04:** Add a short diagnostic that separates unknown material from demonstrated weakness and produces a feasible first week.
- [ ] **P3 EXT-05:** Generate constrained practice variants from approved question families, preserving objective and difficulty provenance.
- [ ] **P3 EXT-06:** Add a weekly evidence report: what improved, what remains uncertain, which retries are due, and why next week's plan changed.
- [ ] **P3 EXT-07:** Add explainable prerequisite suggestions when repeated mistakes indicate a missing foundation, with learner override.

## What to build next, and what to defer

**Best next extension:** the mistake notebook plus curriculum coverage map. Both extend existing retry/weakness/source machinery and make the product more useful each week. They also create a coherent reason to use the notes, tutor, planner, and mock features together.

**Next after that:** teacher moderation and a calibrated diagnostic. These strengthen the evidentiary boundary that the code already tries to respect.

**Defer:** broad social feeds, competitive leaderboards, extra generic AI generators, elaborate decorative dashboards, full LMS administration, and multi-board expansion without content review capacity. These are product prioritization judgments, not claims that such features are universally bad.

## Suggested execution order

| Stage | Deliverable | Exit criterion |
|---|---|---|
| 1: Preserve work and correct feedback | F01–F08 and F15; behavior tests | No deck loss, false trends/counts, unreported sync overwrites, unlabeled trust-boundary bypass, or blocked graphing in the core loop |
| 2: Make contracts dependable | Runtime schemas, effective lint/type coverage, unified persistence and export | Invalid model output and storage failures produce recoverable, correctly labeled states |
| 3: Establish educational evidence | Versioned objectives, reviewed content, teacher-labeled evaluation | Claims match independently checked results and sample sizes |
| 4: Improve the experience | Simpler next-action flow, accessible components, realistic schedules | Pilot learners complete and resume the loop across devices |
| 5: Extend selectively | Mistake notebook, coverage map, teacher moderation | Extension measurably improves delayed retry completion or assessed performance |

Treat each task as complete only when behavior, recovery, accessibility where relevant, and evidence are all reviewable. A green build is necessary; a learner reliably retaining their work and receiving accurate feedback is the actual standard.

## Verification references

Supabase's [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) supports checking both grants and row policies and testing allowed/denied operations. The review inspected the local migrations; it did not infer deployed security from their existence. The changelog Markdown endpoint could not be retrieved through the web tool, and no Supabase implementation changes were made.

Local command logs are in `/tmp/vertexed-review-*.log`; they are temporary rather than committed release evidence. See the addendum below for the final browser result.

## Verification addendum

The authenticated golden browser command could not execute the learner journey. The first attempt was blocked from binding localhost by the sandbox. A permitted retry started the local preview successfully, then Playwright failed before browser launch because its expected Chromium headless-shell executable was not installed. This is an environment/setup failure, not an observed application assertion failure, and no browser pass is claimed.

The only added repository file is this review. The build script restored its generated revision module after both builds. Existing staged changes to `.env.example`, `api/_handlers/health.js`, `api/_lib/auth.js`, `src/lib/supabaseClient.ts`, and `tests/health.test.mjs` were preserved.
