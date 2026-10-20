# VertexED mega checklist

Updated 20 October 2026. This is the live product ledger for
`codex/vertexed-mega-completion`, based on a source audit of routes, React
components, API handlers, migrations, contracts, tests, and existing release
records. It is not a production-readiness claim.

Status vocabulary: **VERIFIED** means a current-slice receipt exists;
**IMPLEMENTED-UNVERIFIED** means source is present but needs the listed current
verification; **BLOCKED** needs authorised infrastructure, editorial, or policy
action; **NOT STARTED** means no adequate vertical slice was found. Historical
green tests are useful context, not verification of this branch.

## Audit summary

Already present in source: authenticated account flows, Apex tutor modes and
conversation snapshots, Notebook sources/PDF text extraction and structured
outputs, notes-to-flashcards/quizzes, local spaced repetition, original adaptive
practice, planner and calendar import, answer review, paper maker, MYP and AP
directories, learning-library search, account export/delete paths, use limits,
and a restricted waitlist administration route. Most are account-scoped in
source, but migration replay, live auth/RLS, provider, and production-domain
verification remain open.

Partially implemented: dashboard evidence views, retries, study plans,
curriculum coverage, AI output quality gates, offline recovery, admin analytics,
and MYP/AP content availability. They have useful UI and contracts, but not all
have verified real-service journeys or approved content.

Missing or materially inadequate: an IB DP dashboard that tracks HL/SL subjects,
chosen target grades, IA/EE and paper deadlines; collaboration; subscription
entitlements; referrals; support/moderation tooling; verified public content
publication; and operational release proof. Item **IB-01** below is the first
new vertical slice in this branch.

## Prioritised delivery ledger

| ID | Pri | Status | User-facing interaction | Surfaces and persistence | Acceptance, dependencies, verification |
|---|---|---|---|---|---|
| AI-01 | P0 | IMPLEMENTED-UNVERIFIED | Ask Apex a subject question and continue a saved conversation. | `AIChatbot`, global chat, `/api/ask`, conversation snapshot migration. | Student can reopen only their own thread with mode/context visible. Needs real provider/auth; run conversation E2E and two-account denial. |
| AI-02 | P0 | IMPLEMENTED-UNVERIFIED | Upload a supported document or PDF and ask grounded follow-ups. | Notebook import, PDF worker, `/api/import-source`, `/api/notebook`. | Source text, citations and unavailable states are visible; raw file never leaks between accounts. Needs real file/API journey. |
| AI-03 | P1 | IMPLEMENTED-UNVERIFIED | Choose Socratic, quick, tutor, exam, or deep help before asking. | Tutor modes, Apex panels, server prompt builder. | The chosen mode changes instructions without pretending to mark work. Verify frozen prompt tests and UI keyboard selection. |
| AI-04 | P1 | NOT STARTED | Attach an image of a diagram or written working and receive an explicitly limited explanation. | Image intake, OCR/vision policy, `/api/review`, source storage. | Student sees accepted formats, consent, source preview and abstention for unreadable images. Requires provider/cost approval. |
| AI-05 | P1 | NOT STARTED | Hear a source passage and control playback speed, pause and resume. | Notebook TTS component, server/provider capability policy. | Audio is opt-in, control is keyboard usable and text remains available. Requires approved voice provider or local browser policy. |
| AI-06 | P0 | IMPLEMENTED-UNVERIFIED | See remaining AI use before submitting a request. | Usage settings, `/api/ai-usage`, rate-limit/usage migrations. | Display matches server reservation and refused calls; no fabricated quota. Needs applied migration and live provider check. |
| AI-07 | P1 | IMPLEMENTED-UNVERIFIED | Save a useful AI answer into notes with source/context and edit it. | `ApexMessageList`, durable study-artifact API, Saved Work and Notetaker restore handoff. | A completed response can be saved as an ordinary editable note with question, visible cited excerpts and an explicit verification label. Focused persistence tests pass; needs browser save-open-edit journey and cloud account proof. |
| AI-08 | P1 | IMPLEMENTED-UNVERIFIED | Report an incorrect or unsafe AI answer from the answer itself. | `AiFeedbackControls`, privacy-minimised `/api/telemetry`, observability store. | The answer-level control acknowledges accepted feedback; server accepts fixed tokens only, strips prompts/answers/identity and rate-limits requests. Needs applied observability storage and an authorised support-response policy. |
| ST-01 | P0 | IMPLEMENTED-UNVERIFIED | Turn selected notebook sources into cards, study them, and rate recall. | Notebook study set, `srDeck`, local/account learner state. | Cards have source links and due scheduling; a later reopen preserves the deck. Verify account recovery and browser workflow. |
| ST-02 | P0 | IMPLEMENTED-UNVERIFIED | Generate a bounded source-backed quiz and submit responses. | Notebook quiz editor, `/api/quiz`, output contract. | Every question has a source reference or is withheld; invalid AI output is rejected. Needs provider fixture/live check. |
| ST-03 | P0 | IMPLEMENTED-UNVERIFIED | Take original adaptive practice and see exact-key feedback. | Learning workspace, question bank, practice-state API. | Client cannot forge a correct answer; verified evidence feeds only eligible weakness views. Run focused learning tests. |
| ST-04 | P1 | IMPLEMENTED-UNVERIFIED | Record why a mistake happened and the corrected reasoning. | Mistake notebook, practice mistake state. | Reflection persists, can be edited safely, and informs a retry without asserting mastery. Verify recovery and keyboard flow. |
| ST-05 | P1 | IMPLEMENTED-UNVERIFIED | Receive a due retry linked to the earlier measured attempt. | Retry queue, dashboard, learner state. | Retry displays original score/context/due date; no retry is manufactured from generic AI text. Verify retry regression journey. |
| ST-06 | P1 | IMPLEMENTED-UNVERIFIED | Start a timed Paper Maker session and resume it after refresh. | Paper Maker, exam-session history, learner state. | Timer/answers recover without changing recorded results. Needs browser refresh and cross-device verification. |
| ST-07 | P1 | IMPLEMENTED-UNVERIFIED | Review an answer with criterion-specific suggested feedback. | Answer Reviewer, review-safe handler, review contract. | Feedback stays suggested unless a valid key/teacher input confirms it. Verify forged-score and unsafe image tests. |
| ST-08 | P1 | NOT STARTED | Build a mixed-subject practice examination from approved question pools. | Assessment builder, approved content bank, exam sessions. | Student chooses duration/components and receives only published material. Depends on editorial approvals and coverage. |
| ST-09 | P2 | NOT STARTED | Compare attempts over time by topic and question type. | Attempt timeline, revision history, analytics queries. | View shows source attempts and unknown states, not invented improvement. Depends on retained practice history. |
| ST-10 | P1 | IMPLEMENTED-UNVERIFIED | Create a revision schedule from real availability and deadlines. | Planner, calendar import, task API. | Manual creation works without AI and conflicts are explained. Needs real calendar/account journey. |
| ST-11 | P2 | NOT STARTED | Choose a study method for a topic and see why it fits available evidence. | Recommendation engine, knowledge model, UI explanation. | Recommendation lists data used and abstains without evidence. Depends on calibrated decision policy. |
| ST-12 | P2 | IMPLEMENTED-UNVERIFIED | Focus with timer, notes and a break without losing work. | Study Zone and device storage. | Pause/resume is recoverable and no game/animation claims learning progress. Verify mobile/background interruption. |
| IB-01 | P0 | IMPLEMENTED-UNVERIFIED | Add actual IB DP HL/SL subjects, chosen target grades, and IA/EE/Paper deadlines. | New `/ib-diploma` route, `ibStudyPlan`, learner-state API and migration. | Plan persists device-first and queues owner-scoped sync; targets are never labelled predictions. Focused contract tests pass; needs Node-22 build, migration replay and viewport checks. |
| IB-02 | P0 | NOT STARTED | Browse a verified IB DP subject dashboard with syllabus topics and HL/SL distinctions. | DP catalogue, curriculum route, approved content records. | Student sees exact source/version and held-topic empty states. Depends on licensed/editorial programme mapping. |
| IB-03 | P1 | NOT STARTED | Mark syllabus topics as planned, attempted, reviewed or still unassessed. | Topic-state model, DP dashboard, learner state. | State is a learner record, not claimed coverage or mastery. Depends on IB-02 catalogue. |
| IB-04 | P1 | IMPLEMENTED-UNVERIFIED | Link an IA milestone to a research question, method, evidence and supervisor feedback. | IB plan project workspace, owner-scoped learner state. | Student can create a subject-bound IA workspace, link a matching real deadline, and persist a question, method, source notes and feedback text. Focused contract tests pass; collaboration/author identity is intentionally not claimed. Needs browser/account sync proof. |
| IB-05 | P1 | IMPLEMENTED-UNVERIFIED | Plan an Extended Essay with checkpoints, bibliography entries and source notes. | IB plan project workspace, owner-scoped learner state. | Student can keep a private EE working question, method, bibliography/source notes, feedback and linked EE deadline. Focused contract tests pass; citation formatting and export remain open. |
| IB-06 | P1 | NOT STARTED | Practise Paper 1, 2 or 3 in the correct configured format. | DP assessment metadata, paper builder, approved bank. | Component format is sourced/versioned and unavailable components say so. Depends on approved material. |
| IB-07 | P1 | NOT STARTED | Set a personal grade goal and distinguish it from evidence. | DP dashboard, plan state, analytics. | UI says "target", lists supporting attempt count, and never shows a prediction without validated model evidence. Depends on IB-01 and attempts. |
| IB-08 | P2 | NOT STARTED | Receive an IB study plan that schedules actual subject deadlines and due reviews. | Planner integration, DP plan, retry model. | Every recommendation names its deadline/evidence; student can edit/reject it. Depends on IB-01, ST-05 and ST-10. |
| DASH-01 | P0 | IMPLEMENTED-UNVERIFIED | Open Today and see the next real retry, unfinished mock and saved work. | Main dashboard, learner state, artefact collection. | Empty state directs first action without fake statistics. Verify authenticated browser route. |
| DASH-02 | P1 | IMPLEMENTED-UNVERIFIED | Inspect weak, developing and unassessed concepts with evidence. | Knowledge model, weakness heatmap. | Each state shows attempt count/date; no evidence means unassessed. Run learning-model tests. |
| DASH-03 | P1 | IMPLEMENTED-UNVERIFIED | View study streaks based on recorded sessions. | Activity/streak storage, dashboard. | Missed dates do not create a false streak; wording is self-reported activity. Verify time-zone boundary. |
| DASH-04 | P1 | IMPLEMENTED-UNVERIFIED | See upcoming study and assessment deadlines. | Planner plus exam setup. | Dates originate in entered tasks/targets; conflicts are visible. Needs real account sync journey. |
| DASH-05 | P2 | NOT STARTED | Set weekly learning goals and track completion against actions. | Goal records, dashboard, planner. | Goal progress is derived from linked checked actions and can be reset. Depends on account state schema. |
| DASH-06 | P2 | NOT STARTED | View weekly progress graphs with data provenance. | Analytics aggregation, chart component. | Every graph has date range, record count and empty/held state. Depends on verified activity data. |
| DASH-07 | P2 | NOT STARTED | Get a ranked next-action explanation. | Recommendation policy, dashboard. | Shows why this task is first and allows dismiss/edit; no black-box score. Depends on ST-11. |
| KM-01 | P0 | IMPLEMENTED-UNVERIFIED | Create, edit and retrieve a note. | Study Notebook, artefact API, account storage. | Editing is saved/recovered without overwriting another device’s newer data. Verify conflict test/live sync. |
| KM-02 | P1 | IMPLEMENTED-UNVERIFIED | Import text, Markdown, CSV and supported PDF text into a source. | Source import, PDF worker, artefact API. | Size/type errors are actionable and original source stays intact on failure. Verify import path. |
| KM-03 | P1 | IMPLEMENTED-UNVERIFIED | Organise saved notes, papers and reviews into folders. | `SavedWork`, `SavedWorkList`, persisted artefact `organisation.folder` metadata and account-scoped update API. | Student can create a folder while moving an item, filter it, rename it or remove it. Renames/removals disclose their loaded-page scope; singleton snapshots are intentionally excluded. 47 focused tests pass; needs browser/two-account verification. |
| KM-04 | P1 | IMPLEMENTED-UNVERIFIED | Search saved study materials and open the correct result. | Saved Work, global search, resource index. | Search labels loaded-page boundary and never exposes another account’s title. Verify pagination/security route. |
| KM-05 | P2 | IMPLEMENTED-UNVERIFIED | Draw or inspect concept links from a source-backed notebook. | Concept map, notebook outputs. | Links are text-accessible and generated relationships are clearly provisional. Verify keyboard/sanitisation. |
| KM-06 | P1 | NOT STARTED | Save, tag and revisit an AI response with its originating source set. | Chat-to-artefact action, tags, revision graph. | Saved response retains provenance and user edits; deletions remove retrieval access. Depends on AI-07. |
| PERS-01 | P1 | IMPLEMENTED-UNVERIFIED | Choose curriculum, year and subjects during onboarding. | Onboarding, profile/curriculum metadata. | Choices persist per account and guide routes without changing access authorization. Verify onboarding recovery. |
| PERS-02 | P1 | IMPLEMENTED-UNVERIFIED | Receive difficulty selection informed by verified attempts. | Adaptive practice, learning model. | Difficulty explanation names attempt evidence and stays unassessed when none exists. Run adaptive regressions. |
| PERS-03 | P2 | NOT STARTED | Set learning preferences such as session length and explanation format. | Settings, preference state, AI request policy. | Preferences are editable/exportable and are not inferred from surveillance. Needs preference contract. |
| PERS-04 | P2 | NOT STARTED | Adjust a proposed pathway after marking it too easy or too difficult. | Recommendation feedback, learner model. | Change is visible, reversible and does not mutate historical evidence. Depends on PERS-02. |
| PERS-05 | P2 | NOT STARTED | Remember a learner’s stated preferences between devices. | Account preference API, conflict handling. | Last-write/conflict state is explained and account deletion covers it. Needs migration and live sync. |
| COL-01 | P1 | NOT STARTED | Create a private study group and invite named members. | Group/member schema, invite endpoints, UI. | Owner can invite/remove; invitations expire; no public member discovery. Requires safeguarding/privacy approval. |
| COL-02 | P1 | NOT STARTED | Share a selected note or resource with revocable access. | Share-link tokens, artefact access API. | Link has scope/expiry/revocation and never grants account-wide access. Requires security review. |
| COL-03 | P2 | NOT STARTED | Run a collaborative study session with a shared agenda and optional notes. | Session room, presence, shared artefacts. | Join/leave and data ownership are clear; session has usable offline/error states. Requires realtime service approval. |
| COL-04 | P1 | NOT STARTED | Comment on a shared resource with author and timestamp. | Comment schema, notification/event UI. | Owner can remove access/comments; user can report abuse. Depends on COL-02. |
| COL-05 | P0 | NOT STARTED | Report abusive shared content and see resolution status. | Moderation queue, admin tooling, audit trail. | Report is private, rate-limited and actionable by a named moderator. Requires operations owner. |
| ACCT-01 | P0 | IMPLEMENTED-UNVERIFIED | Sign up, log in, recover access and log out. | Supabase Auth routes and client context. | Real disposable accounts complete all paths and failed states do not leak account info. Needs live auth. |
| ACCT-02 | P1 | IMPLEMENTED-UNVERIFIED | Complete onboarding with profile and curriculum choices. | Onboarding, profile, starter plan. | Interrupted setup is restored per account/device with no cross-account data. Verify browser/auth journey. |
| ACCT-03 | P0 | IMPLEMENTED-UNVERIFIED | Export and delete account data. | Account export/delete handlers, privacy UI. | Export includes each new object; deletion is tested with durable/outbox data. Needs live proof. |
| ACCT-04 | P1 | IMPLEMENTED-UNVERIFIED | See AI usage and reset semantics. | Usage dashboard and server accounting. | Usage values have policy/date labels and match enforcement. Needs applied usage ledger. |
| ACCT-05 | P0 | NOT STARTED | Buy, cancel and receive a receipt for a subscription only if paid access is offered. | Billing provider, entitlement/webhook ledger, settings. | Webhook idempotency, refund/cancellation/failure and deletion flows pass. Requires explicit commercial/provider authorisation. |
| ACCT-06 | P2 | NOT STARTED | Redeem a referral and see a transparent benefit. | Referral codes, entitlement ledger, fraud controls. | Duplicate/self/referral abuse is rejected and benefit has expiry/audit trail. Depends on ACCT-05 scope. |
| UX-01 | P0 | IMPLEMENTED-UNVERIFIED | Navigate all core study routes with useful loading, empty and retry states. | Router, layouts, error boundaries. | No dead decorative control; every action reaches a real route/state. Needs current route inventory test. |
| UX-02 | P1 | IMPLEMENTED-UNVERIFIED | Use the product at 1440px, 1024px and 390px without clipped controls. | Shared styles and route CSS. | Screenshots are inspected/corrected for core paths, including IB-01. Needs browser run. |
| UX-03 | P0 | IMPLEMENTED-UNVERIFIED | Complete learning and planning flows keyboard-only. | Focus traps, native controls, modals/navigation. | Focus is visible, Escape returns to opener and menus trap correctly. Needs cross-browser accessibility receipt. |
| UX-04 | P1 | IMPLEMENTED-UNVERIFIED | Use reduced-motion and reduced-transparency settings. | Motion tokens, landing/workspace styles. | Content never relies on motion; reading surfaces remain opaque. Needs current route checks. |
| UX-05 | P1 | IMPLEMENTED-UNVERIFIED | Use consistent blue/white revision-trace language across new surfaces. | Brand tokens, existing logo, route styles. | IB-01 preserves original mark, terminology, semantic controls and no invented outcomes. Verify visual QA. |
| UX-06 | P2 | NOT STARTED | Recover from an offline save with a clear pending/saved state. | Durable outbox, cloud-save banner. | Student can retry/export unsynced work and no local save is called cloud saved. Needs injected network tests. |
| ADM-01 | P1 | IMPLEMENTED-UNVERIFIED | Review private-beta/waitlist records as an authorised admin. | Admin route and waitlist handlers. | Non-admin access is denied server-side and errors are actionable. Needs live role test. |
| ADM-02 | P1 | IMPLEMENTED-UNVERIFIED | See aggregate usage/failed requests without student content. | New `admin/analytics` route, `admin-analytics` handler and privacy-safe observability aggregation. | An authorised admin can choose 7/30/90 days and inspect capability-level runs, failures and feedback. The server selects only fixed operational columns, rate-limits access and excludes prompts, answers and identities. Focused privacy tests pass; needs migrated telemetry storage and live role verification. |
| ADM-03 | P1 | NOT STARTED | Publish or hold curriculum content through review status. | Content CMS/revision approvals, publication scripts. | Only approved revisions appear in search/AI/sitemap; held content shows no false availability. Depends on editorial owner. |
| ADM-04 | P1 | NOT STARTED | Review AI-safety and collaboration reports in one queue. | Moderation dashboard, report workflow. | Moderator actions are audited and reporters receive safe status. Depends on AI-08/COL-05. |
| ADM-05 | P2 | NOT STARTED | Search support cases by account-scoped request ID. | Support case model, operator dashboard. | Operators cannot browse unrelated learning contents and cases have retention rules. Requires support policy. |
| REL-01 | P0 | BLOCKED | Open `www.vertexed.app` over trusted HTTPS on the intended deployment. | DNS, registrar, owning Vercel project. | DNS/TLS/health revision agree on one SHA. Requires authorised domain/project owner. |
| REL-02 | P0 | BLOCKED | Use real authenticated persistence without account leakage. | Supabase migrations/RLS, disposable accounts. | Two-account API and UI denial tests pass on deployed candidate. Requires database owner. |
| REL-03 | P0 | BLOCKED | Use approved AI providers without surprise cost or silent failure. | Provider keys, routing, usage ledger. | Frozen live evaluation and spend limits pass; errors degrade safely. Requires provider authorisation. |
| REL-04 | P0 | NOT STARTED | Run a final learner journey from onboarding to later retry and export. | All core routes plus staging/production. | Real next-day/two-device journey, accessibility, monitoring and rollback receipts exist for the same SHA. Depends on REL-01 to REL-03. |
| REL-05 | P1 | NOT STARTED | Operate a launch with monitoring, incident ownership and rollback. | Health checks, alerts, runbook, deployment controls. | Controlled failure alerts and rollback are rehearsed. Requires operations owner. |
| CURR-01 | P0 | IMPLEMENTED-UNVERIFIED | Browse AP and MYP learning libraries by course and topic. | Course routes, generated catalogues, public learning-library assets. | Learner reaches only exact published paths and sees clear held/empty status. Needs current content-audit receipt. |
| CURR-02 | P0 | NOT STARTED | Open a complete, source-attributed IB DP course map before making a plan. | DP source registry, topic catalogue, editorial approval records. | Every topic identifies programme/version/source or is unavailable. Requires curriculum/editorial review. |
| CURR-03 | P1 | NOT STARTED | Filter practice and resources by subject, level, topic and assessment component. | Unified metadata index, search API/UI. | Filters affect actual result sets and a zero-result state explains the gap. Depends on CURR-02 and approved content. |
| CURR-04 | P1 | NOT STARTED | Open a lesson with worked examples, misconceptions and linked practice. | Lesson reader, approved source citations, practice links. | Each lesson has accessible headings, source provenance and an honest unavailable state. Requires authored/reviewed material. |
| CURR-05 | P1 | NOT STARTED | Report a curriculum error or obsolete syllabus entry from that resource. | Resource feedback form, moderation/editorial queue. | Report captures route/revision without private answer text and leads to a visible reviewed/held state. Depends on ADM-03. |

## Current execution log

| Date | Item | Result | Evidence / next verification |
|---|---|---|---|
| 2026-10-20 | Audit | Complete source-level inventory of routes, APIs, migrations, contracts and prior release records. | This checklist; no production claim. |
| 2026-10-20 | IB-01 | Added the DP workspace, device-first owner-scoped state, server validation and unapplied migration. | Focused Node tests passed. Run Node-22 build, migration replay and 1440/1024/390 keyboard/reduced-motion inspection before changing to VERIFIED. |
| 2026-10-20 | AI-07 | Added Save to Notes on completed full-page Apex answers. | The output is written through the existing idempotent, device-first artifact API, includes the learner question/cited excerpts and opens through Saved Work into Notes. 38 focused save/recovery tests pass; browser/cloud verification remains open. |
| 2026-10-20 | AI-08 | Reconciled the existing answer-level reporting flow. | Feedback control posts only fixed rating/reason tokens to a 30-per-minute, privacy-minimised telemetry handler. Existing implementation needs deployed storage and support ownership before VERIFIED. |
| 2026-10-20 | IB-04 / IB-05 | Extended the IB plan with owner-scoped IA/EE planning workspaces and deadline linking. | Question, method, supervisor feedback and bibliography/source notes persist with strict IA subject and IA/EE deadline compatibility validation. 15 focused learner-state, IB and save-note tests plus typecheck pass; migration/browser/cloud proof remains open. |
| 2026-10-20 | KM-03 | Added persisted Saved Work folders without adding a separate shadow data store. | Create/move/filter/rename/remove actions mutate existing owner-scoped artifacts, preserve the underlying payload, and state their loaded-page boundary. 47 focused tests, copy lint and typecheck pass; browser/cloud verification remains open. |
| 2026-10-20 | ADM-02 | Added a protected aggregate analytics dashboard and API. | API uses existing admin authentication, per-user rate limits and a fixed observability projection; tests assert the absence of learner content fields. Focused admin privacy tests, typecheck and copy lint pass; deployed observability storage and an admin-account journey remain open. |
| 2026-10-20 | Copy lint | Completed against the new interface copy. | No findings were emitted. Existing content/editorial approval status remains unchanged. |
| 2026-10-20 | Typecheck | Passed after the current AI save, folders, IA/EE and admin analytics changes. | `npm run typecheck` completed successfully. |
| 2026-10-20 | Production build | Passed in the isolated worktree. | `npm run build` transformed 2,707 modules and emitted the production bundle. Content generation reported 0 approved items and 53 flagged items; no content gate was bypassed. |
| 2026-10-20 | Visual QA | BLOCKED for protected workflow proof. | Local preview starts, but its existing service-worker cache served an older route manifest and the new study/admin routes require an authenticated, beta-approved test account. No authentication or cache bypass was performed; 1440/1024/390 screenshots and keyboard/reduced-motion proof remain open. |

## Non-negotiable release boundary

No item is production-complete merely because a component, test fixture, local
build, or preview exists. The live custom domain, provider calls, migration
ledger, RLS, real accounts, editorial approvals, safeguards and operational
receipts remain separate release gates. Do not enable billing, collaboration
realtime, external storage, or paid AI modalities without explicit approval.
