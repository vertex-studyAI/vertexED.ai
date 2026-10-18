# Website completion pass, 16 October 2026

This is a local implementation and regression receipt for the canonical VertexED
checkout. It extends `SITE_FINISH_2026-10-15.md`; earlier failures and release
receipts remain intact. The master scope is still
`PUBLISHABLE_COMPLETION_CHECKLIST.md`. This document does not close unverified
master gates or certify a production release.

The current successor outcome is **BLOCKED**: 1,736 application tests and both
final builds pass, but the final browser rerun is not executed after host disk
exhaustion. Mandatory product/content and external acceptance gates also remain
open. See the current [evidence index](evidence/product-verification-20261016.json)
and the later implementation section below. Earlier counts in this document are
preserved historical receipts, not current-candidate certification.

The user subsequently confirmed that hosting access will be recovered separately
and asked to focus this pass on improving the code. No further hosting or
deployment action is part of this implementation pass.

## Implemented in this pass

- Coursework and assessment tracking in `/planner#coursework`: projects, subject
  and course labels, deadlines, up to 20 milestones per project, learner-recorded
  completion, evidence/source-location text and append-only revision notes.
  Milestones open the existing task editor with their deadline. Today displays
  outstanding coursework deadlines, including final submission even when no
  milestones exist. Submission status is explicitly learner-recorded. Editing a
  project preserves milestones; project and individual milestone removal require
  confirmation. Coursework and the whole open plan are
  exportable, including edits whose device/cloud save failed.
- Coursework travels in the existing revision-checked planner snapshot, rather
  than a new database table. Legacy snapshots remain readable. Invalid or future
  data must not be replaced by empty state. Planner payload version 2 prevents an
  old client silently erasing coursework. Device revision checks protect against
  stale tabs. The existing account export/delete namespace includes coursework.
- Focus uses elapsed clock time, preserving pause, reload and time away. It keeps
  a chosen planner task or custom task, notes and bounded recent summaries.
  Pomodoro breaks start explicitly. Device-only status, clock adjustments,
  conflicts and export remain visible. Timer completion is not an attention,
  mastery or planner-task-completion claim.
- Focus mode and quick-note controls now distinguish the selected item in both
  themes. Coursework dialogs explicitly remember their opener so Escape returns
  keyboard focus correctly in Safari as well as Chromium and Firefox.
- Private search includes saved source titles and full content, generated
  material, review answers, paper questions and durable conversation history.
  Notebook source results open the matching source preview. Missing sources and
  cloud failures remain explicit; deleted device material cannot be resurrected
  by stale cloud search results.
- CI evidence binds the actual checked-out source revision and keeps the
  workflow revision separately. Canonical gate logs, including failed runs, are
  retained and hashed in the manifest.

Coursework evidence is learner-entered text, not a document upload, independently
verified source citation or teacher approval. No syllabus weight or grade is
invented: the interface states that a grade estimate has insufficient evidence.

## Verification

The complete application suite passed **1,448 tests**, with zero failures or
skips. After the final coursework boundary cases were added, the focused
coursework and sync suite passed **22 tests**; the Focus helper suite passed
**11 tests**. These counts overlap and must not be added into a fictional full
suite total. Evaluation contract tests passed 25/25, the fixture Ask evaluation
passed 13/13, and the synthetic grading contract passed.

TypeScript passed after the final coursework focus-restoration change. Copy
lint scanned 460 files with zero findings, and all three copy-rule tests passed.
Full ESLint passed with two retained legacy hook warnings:
`ExamBaselinePractice.tsx:77` (unnecessary `setupRevision` dependency) and
`AuthContext.tsx:180` (missing `postAuthUpsertProfile` dependency).

Browser verification passed **36/36** coursework, Focus and saved-search cases
across Chromium, Firefox and WebKit, then **60/60** broader Chromium regressions
covering the golden study journey, login returns, planner, notebook/PDF import,
calendar import/export, navigation and actual offline caching. After the final
mobile Quick Notes CSS correction, the affected Focus width cases passed
**9/9** across all three engines. The last nine repeat cases in the first matrix.

The final standard production build passed on Node 22.22.0. Frozen gzip budgets
passed: initial JavaScript 226,413 bytes; initial CSS 34,764 bytes; largest
JavaScript chunk 130,257 bytes; total JavaScript 953,851 bytes. No budget was
raised. The synthetic authentication builds are separate test artifacts and
must not be deployed. `git diff --check` passed.

Source and evidence hashes are recorded in
[`evidence/full-site-finish-20261016.json`](evidence/full-site-finish-20261016.json).
Raw current-run evidence lives under `.tmp/full-site-20261016/`.
Synthetic account/provider fixtures test code paths; they do not establish live
service acceptance. Offline study has a separate worker-enabled test suite;
mocked account suites block workers so WebKit cannot bypass their request
fixtures and contact real hosts.

Visual inspection covers 1440px, 1024px and 390px in light and dark themes with
reduced motion. Coursework creation, milestone dialogs, saved-material results,
source previews and Focus were inspected. Corrections include solid coursework
buttons, accurate selected controls, stable full-page captures, a mobile
Quick Notes grid that stays within its card, and explicit dialog focus return
for Safari. Keyboard opening, Escape and restored focus are exercised.

Initial selector mistakes, WebKit fixture failures and intermediate screenshots
remain in their original logs. They are not counted as passing receipts. The
floating Apex companion overlapped footer links at some mobile scroll
positions in this earlier pass; the inspected saved-result controls remained
unobscured. The later correction and its acceptance evidence are recorded below.

## Production and remaining scope

The 16 October read-only probe remains **NO-GO**. See
`.tmp/full-site-20261016/release/audit-summary.json` and its hashed raw logs.

- `vertexed.app` and `www.vertexed.app` fail TLS before HTTP. The connected
  Vercel team has no VertexED project and denies access to the domain.
- Both recorded fallback deployments return readiness 503 on revision
  `2b0b51c5a0df8fd42af74252fabc5d8aec6d29e6`. Neither is this working tree.
- The shared Supabase migration ledger, real account/provider journeys, backup
  restoration, two-device acceptance, editorial approval and legal/operational
  owner sign-off remain unclosed. No database, DNS or deployment mutation was
  performed in this pass.
- Live Google/Outlook calendar synchronisation and scheduling while the app is
  closed remain unimplemented. The existing bounded ICS workflow and foreground
  rescheduling must not be described as those integrations.
- Focus persists on the current device only. Downloading the public offline
  application does not grant offline account authentication. Real mobile and
  the continuous two-hour learner acceptance session remain separate gates.
- The broader existing dirty checkout is preserved. Local source tests and
  builds do not establish a clean committed candidate or an exact-source hosted
  CI receipt. The CI correction takes effect only when that workflow runs.

The 74-route inventory in `.tmp/full-site-20261016/release/route-inventory.json`
describes route declarations and source references. It is not proof that every
route has passed human or browser acceptance.

## Subsequent full-product implementation and verification pass

This section is a successor to the earlier receipt above, not a replacement for
its 1,448-test, 36-case or 60-case records. The complete requested product remains
**BLOCKED / NO-GO**. Current executed counts, command outcomes, negative evidence,
source hashes and artifact hashes are in the single
[product verification index](evidence/product-verification-20261016.json).
Every existing master ID is mapped in `COMPLETION_GATE_REGISTER.json`. Current
partial implementation does not recertify the three historical PASS gates.

### Access and runtime changes

The local server registry now enforces verified email and explicit approved
VertexED membership before product/admin handler work. Account status, usage,
export and deletion remain owner-accessible without beta approval. The browser
requires both the approved state and explicit server access, rechecks approval
without discarding an open draft, and removes product access after revocation.
Checking, verification, pending, denied and temporary outage states are distinct.
Requests have deadlines/cancellation, non-JSON diagnostics and rate-limit
cooldowns. Invitation lookup escapes literal mailbox metacharacters. Signup
scrubs URL tokens, preserves safe form input, clears passwords after account
creation, offers recovery if subsequent login fails, and cannot redirect a user
back after they deliberately navigate away.

The production cause is not fully resolved. The fresh canonical
`/api/waitlist-status` probe failed TLS before any HTTP response (curl 35,
HTTP 000). The connected Vercel team had seven projects but no VertexED project
and denied domain access. This establishes a current transport/ownership blocker;
it does not identify the exact cause of an earlier learner's displayed error.
Local handler, dependency and state defects were independently reproduced and
corrected. They cannot repair a domain that fails before reaching the API.

### Durable learning and recovery

Onboarding preserves an existing planner, including coursework, and keeps an
account-scoped recovery draft until the required save succeeds. Completion is
not persisted ahead of that acknowledgement. Empty, malformed and future-version
snapshots are not silently replaced with empty defaults. General and bound API
responses cannot be consumed after an account switch, including a switch while
their body is still arriving.

User-content writes keep a device outbox before attempting the network and
validate returned identity, kind and payload before clearing recovery data.
Delete failures remain visible. Submitted mock exams retain review records;
failed submission does not erase answers or pretend the exam is still actively
timed. Leaving unsaved exam work and restoring paper-maker drafts are explicit.
Conversation and practice-history empty-string corruption preserve the original
bytes. Archive writes check concurrent changes and read back the result; they
do not evict previous history or replace the active session.

New approved practice attempts carry the exact published content revision;
legacy history is preserved without inventing one. Held, unknown or stale
question versions retain raw answers/reflections but do not create verified
mastery. Saved sessions from held banks are readable/exportable, with marking,
timers and new question admission paused. Attempt ordering uses numeric instants
and UTC-day grouping, including offset and clock-boundary regressions.

These improvements extend the earlier coursework, Focus and private-search work.
Local Focus/history limits and account/cloud boundaries remain as stated above.
Real database conflict, two-device and account-lifecycle acceptance is still open.

### Content and publication

The current review packet contains 874 coverage rows. The authoring inventory is
42 AP courses, 274 modules and 551 questions; 17 MYP subjects, 205 lessons and
616 questions; 245 guides (192 unreviewed, 53 quarantined); 35 adaptive questions,
30 formula references, 25 exam drills and five complex-number definitions.
Three distinct AP calculus transfer/retry items were prepared with hints,
objectives, prerequisites, marking guidance and review cards. A geometric-series
feedback total was corrected from 252 to 186. Machine checks are partial technical
validation, not a claim that all authored material is correct or syllabus-aligned.

There are zero independent approval entries. Forty mandatory course maps are
missing: 18 IB DP, ten GCSE, ten IGCSE and MYP French/Hindi. The 40 gaps are not the
total remaining authoring or review workload. Official AP/Cambridge overview
checks are bounded; the IB pages returned 403, and full specification years,
components, rights and subject review remain incomplete.

Exact-hash approval now controls development, preview, static output, search,
sitemaps, offline content and tutor retrieval. In addition to the static
collections, 29 legacy modules and ten teaching sections are held. Source files
and learner-owned history remain intact. The emitted AP/MYP directories show
course metadata with zero available lessons/questions; held article paths show
review notices. Built-output scanning and independent samples found no held body
in those bounded paths. The pipeline has not turned unreviewed material into an
approved curriculum, and hidden material does not close a course gate.

The built coursework journey exposed a real Today crash: its command-word drill
read a term from the empty publication-filtered array. The drill now has an honest
review state while Quick Capture and confidence controls remain usable. A React
runtime regression uses the actual publication transform; the pre-fix failing
browser traces and tests remain in the evidence directory.

### AI allowance and security boundary

The user authorised choosing reasonable limits. The local policy reserves up to
USD 1/account/day and USD 10/project/day, using database UTC admission days and
limits of two/eight unresolved requests. Stable operation keys survive token
refresh; retries cannot silently switch paid endpoints after an uncertain result.
Supported requests use pinned, reviewed OpenAI text model contracts and integer
microUSD. The worst-case reservation includes the full input context and bounded
output, so a positive displayed balance does not guarantee admission.

Unknown model/input contracts fail before paid dispatch. Image preprocessing's
separate raw SDK path was removed from admission until a valid cost contract is
implemented. Complete provider bodies, byte limits, cancellation, usage validation
and settlement are bounded. A stalled telemetry body is separately cancelled and
cannot keep a completed paid request waiting indefinitely. Unknown outcomes keep
their reservation and concurrency slot; UTC rollover never silently refunds them.
The price policy expires on 23 October 2026 and must be reviewed before renewal.

Settings shows owner usage, reserved amounts, previous-day unresolved exposure,
reset time, capacity and useful unavailable states. Account A's late response
cannot overwrite B's display. Historical export remains available after pricing
expiry, but a missing ledger or incomplete pagination fails the complete export.
Detailed semantics, source references, unsupported modalities and the migration
sequence are in `BETA_ACCESS_RECONCILIATION_2026-10-16.md`.

Two migrations are prepared, not applied: artifact service-only ACL reconciliation
and the service-only atomic usage ledger. The live catalog already has the desired
artifact ACL; do not replay a redundant change merely to align ledger appearance.
Actual SQL replay, pgTAP and concurrent database tests were not run because the
disposable Docker database and native PostgreSQL tools were unavailable.
Static schema and mocked RPC tests do not prove locks or deployed ceilings.

The prepared ledger schema would remove the direct user ID on account deletion
but retain a pseudonymous account hash and spent/uncertain exposure. This is not
executed deletion evidence or anonymous deletion.
Retention review and a safe operator reconciliation implementation are mandatory.
The shared Auth reverse-product boundary also remains a coordinated dependency;
no other product was changed. Hosted leaked-password protection and the available
PostgreSQL patch remain owner-side security actions.

The initial dependency audit reported four low-severity entries from one KaTeX
advisory, GHSA-238p-pmpm-9mq7. The installed renderer reproduced its trust bypass
under synthetic pre-existing prototype pollution; no attacker-reachable pollution
primitive was established. Direct and transitive KaTeX resolutions are now pinned
to 0.18.2, with rendering/security regressions and a fresh production dependency
audit reporting zero vulnerabilities. The earlier four-entry report and reproduced
failure remain retained. This bounded dependency result is not a complete security
certification or proof that all user-supplied content is safe.

A separate redacted Gitleaks 8.30.1 successor scan covered 1,489 enumerated
VertexED input files and both final builds. An earlier scan also counted 1,489
files but included a Space-JEPA workflow; the successor excludes it and adds the
new Focus browser helper. The earlier scan and its scope clarification remain
preserved. The locally reachable path-filtered history scan is reused with its
documented identity limits, not newly rerun. There are four current
input and 17 historical findings: public verification identifiers, synthetic/test
values, a prose match and a historical localhost-only TLS test private key.
No privileged production credential was confirmed. Both emitted builds had zero
pattern findings. This is bounded local detection, not deployed environment-scope,
unreachable-object or whole-repository certification. Exact commands, path filters,
input hashes and unsuppressed triage are in the evidence index.

### UX and verification boundaries

The blue/white identity, logo, study terminology and revision trace remain.
Access, content-held states, usage, recovery, coursework, Focus and saved search
have 1440/1024/390 viewport cases, themes, keyboard paths and reduced motion.
Corrections include hidden/disabled modal focus targets, Safari focus return,
button contrast, unreachable footer links under an Apex pseudo-element, docked
Apex incorrectly offset above the footer, and Feedback hidden by mobile navigation.
Usage captures position the heading below the sticky header and hit-test actual
controls. A further notebook correction docks Apex whenever the real footer enters
view, preserves the launcher DOM node and keyboard focus, and places Feedback in
document flow. Shared KaTeX error tokens replace the low-contrast default in all
four renderers while retaining explicit untrusted-input handling. The empty toast
viewport no longer intercepts footer clicks, while toast actions and dismiss
controls remain interactive; the browser flow closes its visible success toast
before testing the controls beneath it. Rejected TeX's calculated
contrast is 6.46:1 on the light surface and 9.12:1 on the dark surface; browser
computed-colour and actual footer-hit assertions provide separate checks. The final evidence index distinguishes inspected captures from merely
executed scenarios and records each browser/version.

The later correction pass also reproduced nine failing Focus diagnostic cases:
calculator clear/delete labels measured about 4.31:1 in light mode and 1.67:1 in
dark mode, while the floating Apex intercepted the mobile timer reorder control
in all three engines. Focus now uses the existing docked companion, places
Feedback in document flow and uses scoped danger-text colors. The existing Focus
browser cases retain timer-action and footer hit tests and measure composited
calculator contrast against the actual rendered surface. Their viewport,
calculator and footer captures are separate from tall full-page screenshots.
The Del/C diagnostic then passed all nine cases. Inspection found a further
light-theme equals-key defect: white on yellow measured about 1.82:1. A scoped
ink foreground now gives a static calculated 9.34:1 against the previously
observed yellow, and the canonical checks include `=`. Two subsequent browser
launch attempts failed with ENOSPC before any application assertion; no browser
contrast or visual acceptance is claimed for this last correction.

A complete intermediate matrix passed 152 cases and failed one WebKit390
coursework Escape focus-return assertion. Three unchanged, instrumented
repetitions then passed. No modal patch was made: the original failure remains
unexplained, the instrumentation may affect timing, and the passing repetitions
do not prove an inert-release or document-focus cause. The earlier Safari fix
above remains a historical result, not a diagnosis of this later failure.

The native auth-lock adapter preserves cross-tab Web Locks while preventing
expected SDK lock failures from also appearing as native callback rejections.
Focused regressions preserve timeout, operation-error identity and exclusion.
Playwright is pinned to 1.64.1 with its matching browser engines; this resolves
the reproduced old WebKit offline-emulation defect without weakening the real
application worker test. Browser packaging and protocol-mismatch failures remain
separate from product assertion failures.

The final test summary in the evidence index is authoritative. Earlier failures
include literal-invite lookup, strict access approval, body cancellation,
corruption recovery, modal focus, footer overlap, the dashboard empty bank,
test-fixture/source-expectation mistakes and browser launch/resource failures.
They remain retained and are not counted as passing tests. Synthetic account,
storage and provider fixtures exercise code; the offline suite separately uses
the actual service worker. That test exposed a one-byte mismatch between the
generated public JSON and the preview middleware response: the missing trailing
newline failed the worker integrity check and prevented installation. Both paths
now share a serializer, with an exact-byte/SRI regression; integrity enforcement
was preserved. Real mobile hardware, live email/OAuth/providers,
following-day/two-device and continuous two-hour acceptance remain NOT_RUN.

The final source after that equals-key correction passed both builds and
**1,736/1,736 application tests**, with zero failures, cancellations, skips or
todo cases. Type checking passed. Copy lint scanned 471 files with zero findings;
its three rule tests passed. ESLint retained the same two legacy hook warnings.
Frozen gzip budgets passed: initial JavaScript 212,593 bytes, initial CSS 35,033,
largest JavaScript chunk 130,146, total JavaScript 850,679. The built publication
verifier and seven real local anonymous API checks passed. Production dependency
audit reported zero vulnerabilities within its scope; no budget was raised.

**Final-artifact browser and visual verification: NOT_RUN / NOT_VERIFIED.**
The last complete matrix was 152 passes and one failure on the earlier artifact;
the nine Del/C passes also precede the equals-key change. A later `--list`
generated 153 discovery entries with empty results; these are neither executed
tests nor passing/skipped acceptance cases. All original reports are retained.
The historical visual summary revalidates 116 image paths across seven review
receipts, without attributing those captures to the final artifact. Reclaim at
least 2 GB on the Mac's internal disk, then execute the prepared nine-case Focus,
153-case combined and nine-case access configurations sequentially and inspect
the new captures. The project volume has space; unrelated files were not deleted.

### Candidate and exact remaining actions

The checkout remains `main` on base `e28f24ff1c051eaa91b5443a79fe392987d0c688`
with preserved pre-existing and new uncommitted changes. This base SHA is not the
candidate identity. The index hashes current source inputs and both artifacts;
the synthetic browser artifact must not be deployed. No commit, push, deployment,
DNS change, live database write, broad approval or external message occurred.

The next engineering work is substantive: complete missing course maps and
topic-level material, subject-specific marking/alternate forms and sufficient
distinct questions; connect the unified due-review queue and full revision
timeline; finish supported input/modality accounting and spend reconciliation;
complete required calendar/background behavior; and resolve/implement retained
teacher confirmation, private sharing and collaboration scope. Per-gate blockers
are recorded in the master register. Passing this local repair set does not mean
those systems are complete.

Release operators must supply the owning Vercel/domain account, a confirmed
disposable production-equivalent database and independent content/security/learner
reviewers. Reconcile migration and legacy approval provenance, run actual SQL and
parallel-account tests, restore a backup, verify supported provider contracts and
email/OAuth flows, then establish a clean reviewed commit with matching hosted CI.
Production database, deployment and DNS actions still require explicit approval
for the proven target. Only then can the same-candidate HTTPS, readiness, account
isolation, recovery and full learner journeys establish a release decision.
