# VertexED product rebuild: live execution checklist

Started 21 September 2026. This is an implementation ledger for the current dirty checkout, not production certification. Existing uncommitted work is preserved. `DO_NOT_USE_AS_CANONICAL.md` identifies this checkout as WIP; no production promotion is implied.

## Repository evidence

- React 19.2.7 / Vite 7.3.6 / Router 7 / TypeScript 5.8; Node 22.22 required. Lazy routes in `src/app/App.tsx`; contexts and account-scoped browser storage, no global Redux store.
- One Vercel function dispatches authenticated, rate-limited API handlers. Supabase Auth and Postgres own profiles, artefacts, learner state and waitlist access. Server reads/writes derive ownership from verified bearer identity. Existing SQL migrations and RLS tests must remain authoritative.
- AI uses server-side providers and bounded output contracts. Notes, notebook, quizzes, papers, answer review and transcription already exist. Apex is the product's existing tutor name. No Percy rename or duplicate tutor is needed.
- `userContent.ts` already supplies cloud artefacts, account guards, IndexedDB/device recovery, idempotency and restore handoffs. Notebook sources/outputs, retry queues, measured weakness evidence, Today Plan, timed exams, step checking, graphing, audio and local chat history already have implementations. Their presence alone does not establish end-to-end correctness.
- At intake, global search was a static directory with substring matching. Resource Library actually opens board guides; its search description incorrectly promises saved documents. Saved work restores through `SavedWorkList`.
- At intake, the outer workspace used `overflow-x-hidden`; popovers inherit navigation containing/stacking contexts. Decorative clipping and actual scroll regions need separate ownership.
- At intake, favicon generation downsampled the detailed raster and did not rebuild ICO. Manifest declares a 512px raster without generating install icons or a maskable asset. No service worker/offline application guarantee found.
- Notebook file picker supports text/Markdown/CSV; PDFs are excerpts, not a working universal binary import pipeline. Source-linked output generation exists. No evidence of a billing integration, full classroom platform or background learner job system in the inspected runtime.
- Tests: Node application/evaluation suites, Playwright browser suites, Supabase SQL contracts, copy/content gates, bundle budgets. Baseline lint/copy/typecheck/content passed; advisory service returned no vulnerability metadata and stopped `npm run ci` before tests/build.
- Content provenance: 245 files inventoried, 0 editorially approved, 53 flagged. Do not market these as approved curriculum resources.

## Execution queue

| Priority / item | State | Scope and acceptance |
| --- | --- | --- |
| P0: preserve WIP, inspect architecture and critical flows | DONE | Git status recorded; brand, isolation, routing, auth/artefact ownership, search, notebook, dashboard and CI inspected. Continue auditing touched paths. |
| P0: search and command navigation | DONE | Implemented immediate focus, `/` and Cmd/Ctrl+K, typo tolerance, real saved work, scoped history, keyboard navigation, error/retry/partial results. All 18 browser scenarios passed before the notebook-practice extension; the final nine width/engine checks also passed after the mobile dock correction. |
| P0: reusable overlay / clipping boundary | DONE | Removed outer hidden scroll container; added portal-based anchored results constrained to visual viewport. Public search passed 1440/1024/390 in Chromium/WebKit/Firefox, including page-position, clipping and mobile dock regression assertions. Screenshots inspected in light/dark themes. |
| P0: favicon / install assets | DONE | Preserved full logo; generated SVG mark, 16/32/48 PNG and ICO, 180 touch, 192/512 application and 512 maskable assets. Dimension, ICO structure and safe-area tests passed. |
| P0: local runtime/security/regression checks | DONE | Canonical CI, production build, bounded security tests and all 18 cross-browser acceptance scenarios passed. Live auth/RLS/provider certification requires live credentials and a canonical release candidate. |
| P1: saved-work and dashboard coherence | DONE | Added protected saved-work library and direct owner-scoped lookup. Search lands in library before explicit editor restore. Dashboard links to complete library. Refresh/restore and API recovery passed in all three engines. This scoped library integration does not claim a full dashboard redesign. |
| P1: homepage, first-session learning | IN PROGRESS | Existing guided reasoning and adaptive practice passed their browser tests and were preserved. Full onboarding-to-first-persistent-learning-result redesign remains NOT STARTED. |
| P1: Study Pack / import vertical slice | IN PROGRESS | Hardened existing notebook text/Markdown/CSV import with drag/drop, progress, cancellation, retry, UTF-8/size checks and deduplication. Added persistent quiz responses, confidence, source references, reflection and contextual review using existing snapshots. Regeneration retains attempted versions. Added account-scoped reviewer text drafts. DONE for text import, saved practice and source-linked review: all 18 browser scenarios passed after the shared modal correction. Full binary PDF/DOCX/PPT import remains NOT STARTED. |
| P2: learner model, mastery, diagnostics, mistakes, review, Today Plan, exams | NOT STARTED | Extend existing measured-evidence/retry/exam structures after persistence and search gates. Avoid a parallel schema. |
| P3: canvas, step checker, replay, audio, proactive tutor | DEFERRED | Existing bounded step checker, sketch and audio pathways need separate validation after core flows. |
| P4: multiplayer, games, teacher platform, social systems | DEFERRED | Prioritise reliable solo learning; existing Revision Stack remains preserved. |
| Production deployment and certification | BLOCKED | Live `curl -I https://www.vertexed.app` fails with TLS `SSL_ERROR_SYSCALL`. The repo boundary probe resolves DNS to `2.59.170.20` and `104.219.250.37`, flags them as parking/non-Vercel, and cannot fetch shallow or deep health. `vercel domains inspect` reports no access under `build-the-future-11s-projects`; `vercel teams ls` exposes only that team. Requires access to the domain-owning Vercel account and DNS provider. This WIP checkout also needs canonical integration, live auth/provider checks and DB/RLS evidence before promotion. |

## Verification and completed changes

### Implemented architecture and behaviour

- `GlobalStudySearch.tsx`, `globalSearchIndex.ts`, `searchHistory.mjs`: immediate native combobox, bounded typo matching, real commands, recent searches with clearing and cross-tab refresh. Search strings remain local; account-prefixed history is included by existing account export/deletion. Static results remain available while cloud work loads or fails. More saved work loads explicitly in pages of 50; the UI reports partial scope. Search is not claimed to cover every conversation or uploaded binary.
- `AccessibleModal.tsx`: added an optional opener reference for focus restoration when WebKit pointer activation does not focus the invoking button. Both notebook source-preview entry points supply the real opener. Initial focus and background inertness now apply before paint; cleanup skips focus restoration while the dialog is still connected during a Strict Mode remount.
- `AnchoredOverlay.tsx`, `navigation.css`, `workbook.css`, `SiteLayout.tsx`: body portal escapes transformed/blurred ancestors, responds to scroll/resize/visual viewport and bounds panel height. Removed shell `overflow-x-hidden`, card clipping and hover scaling from reading surfaces. Decorative layers have a separate clipping rule. Visual correction removed the duplicate browser clear control and made dark results opaque. This is a shared-boundary correction, not proof that every decorative mask on every route has been eliminated.
- `useStudyArtifactCollection.ts`, `savedWorkSearch.ts`, `SavedWork.tsx`, `App.tsx`, `Main.tsx`, `userContent.ts`, `api/_handlers/user-content.js`: protected paginated library, source-text/title search, direct lookup constrained by verified owner plus item ID, request invalidation on close/unmount/account change, reload and recovery UI. No database schema change.
- `SavedWorkList.tsx`: notebook/planner snapshots open their existing revision-checked workspace loaders without leaving an unconsumed restore payload. Notes/papers/reviews retain the existing restore mechanism.
- `SourceFileImport.tsx`, `sourceFileImport.mjs`, `StudyNotebook.tsx`: bounded real text reading, browse/drop, progress/cancel/retry, unsupported/binary/empty/oversized/invalid UTF-8 rejection, duplicate content guard, ownership checks and reader cancellation on destination change. Sources enter the existing notebook snapshot and generated outputs remain attached to that notebook. PDF excerpts can be pasted; binary PDF/DOCX/PPT parsing is not advertised.
- `NotebookQuizResponseEditor.tsx`, `NotebookOutputPanel.tsx`, `notebook.ts`, `snapshotValidation.mjs`, `StudyNotebook.tsx`: responses save as typed in the existing account notebook snapshot. Optional confidence is saved before reveal; original answers are kept after reveal. Reflection is explicitly self-reported. Attempted quiz versions survive regeneration and remain selectable. Source buttons open the actual referenced notebook source. The existing reviewer receives the actual question, answer, confidence and bounded source excerpts; its human-confirmation gate remains authoritative for mastery. No new database table or speculative schema.
- `AnswerReviewer.tsx`, `reviewDraft.mjs`, `userContentStorageScope.mjs`: account-scoped text draft and review-source recovery through the existing storage hook. Topic/retry contexts use separate draft keys. Known-string validation protects the editor from malformed storage. Defaults no longer overwrite restored curriculum/subject choices. Submitted reviews retain notebook/output/question identifiers and source context. New mock handoffs clear prior answers and origins. Storage failures keep edits visible and report failure. Images remain transient and the interface says so. Draft keys are inside existing export/deletion prefixes.
- `ResourceLibrary.tsx`: corrected “Add to Notebook” to “Open Notebook”; the existing link did not transfer guide content.
- `app-mark.svg`, `generate-icons.mjs`, generated public icons, manifest, `index.html`, `brand/DESIGN.md`: original full logo retained, user-requested simplified application derivative recorded, all install/favicons generated from one source. No offline service-worker claim.

### Current verification

- Node 22.22 canonical `npm run ci`: **PASS**, including lint, copy rules, typecheck, server route validation, content provenance, dependency audit, **1,097 application tests**, **25 evaluation tests**, ask evaluation, grading check, production build and frozen bundle budgets.
- Initial dependency audit failed because network restrictions yielded no vulnerability metadata. Retried with network access: **no high or critical production vulnerabilities**. This does not imply zero vulnerabilities or a full penetration test.
- Added executable tests for fuzzy/private search, account-separated history and deletion, source decoding, icon dimensions/ICO/maskable safe area, and direct saved-work lookup owner predicates.
- Browser fixtures intercept Supabase and AI. They verify application integration and error handling, not live service availability or pedagogical validity.
- Initial browser runs exposed missing pinned WebKit/Firefox engines and outdated fixture control labels. Installed the checkout's pinned engines and corrected fixtures. No product assertion was disabled.
- Screenshot correction found a Firefox page jump caused by `scrollIntoView` on a newly portalled option. Replaced it with list-only scrolling and made the overlay fixed before measurement; added an explicit page-position regression assertion.
- Mobile WebKit review found the landing dock's oversized blur pseudo-element inside its horizontal scroll container. Removed that decoration and backdrop filtering on mobile, made the surface opaque, added safe-area spacing and 44px link targets; native horizontal scrolling remains.
- Existing smoke, accessibility, golden authenticated study, guided reasoning and adaptive practice suites: **30 passed**, **6 existing skips**. The mobile-navigation skip was subsequently run at 390px and **passed**. The other five require a configured deployed API host and remain unexecuted, not waived. The full golden configuration was subsequently rerun: **18/18 passed**, including auth returns, corrupt-data recovery, planner races, student journey and tutor keyboard/reduced-motion behaviour.
- Before extending quiz practice, the full rebuild matrix passed **18/18** in Chromium/WebKit/Firefox. After the mobile dock correction, all **9/9** responsive search checks passed. The extended practice flow passed in Chromium and Firefox; WebKit exposed a source-preview focus-return issue. The shared modal now accepts an explicit opener reference. The isolated rerun then caught an initial-focus animation-frame race: Escape could reach the page before focus entered the dialog. Focus now transfers in the layout effect before paint, and cleanup avoids restoring focus during a still-connected Strict Mode remount. A concurrent Firefox library run also exhausted its 45-second total budget while navigating; its trace showed no failed cloud request. After both focus corrections, the final isolated matrix passed **18/18**. The Firefox library case passed without a timeout increase. Failure receipts remain under `ci-evidence/product-rebuild-20260921/findings/`.

### Remaining risks and next sequence

1. Restore domain ownership/access, then repair TLS using provider-observed DNS requirements. Do not guess DNS or deploy this WIP snapshot as a canonical release.
2. Finish live multi-account auth, RLS/migration replay and provider canaries on a canonical candidate. A build stamped with HEAD does not identify these uncommitted changes.
3. Notebook responses now hand off to the existing reviewer and confirmed-mark pathway. The mocked-service browser journey verifies zero measured writes before confirmation and durable weakness/retry writes afterwards. Next validate that pathway with live services and expand concept-level recommendations; self-checks must remain separate from measured mastery.
4. Add validated binary document extraction and source location references before expanding file format claims. Validate generated artefacts, source relationships and recovery before adding a Study Pack label.
5. Expand full-route mobile/keyboard/zoom audits, first-user learning flow and contextual tutor handoffs. Then execute P2 diagnostics, daily planning and mistake-driven practice against existing state contracts.

### Performance and release evidence

- Final build: initial JavaScript **236,921 bytes gzip**, initial CSS **34,754 bytes gzip**, total JavaScript **903,626 bytes gzip**; frozen budgets passed. Notebook and reviewer additions remain route-loaded; no dependency was added. These are bundle measurements, not live Core Web Vitals.
- The new optional fields live in the existing notebook JSON payload and account-prefixed draft keys. No migration was created or applied for this pass. Older valid snapshots remain readable; invalid new response records fail closed without replacing saved bytes.
- Text imports remain limited to 200 KB / 50,000 characters per source. The existing 256 KB cloud collection limit can stop sync as retained quiz versions accumulate; the UI reports local-only storage and supports notebook/account export. PDF/DOCX/PPT extraction, page/slide citations and image-draft persistence are not implemented.
- Existing working and dirty files were preserved. No commit, push, migration, DNS change or deployment was performed. The build is a local WIP candidate, not a promoted canonical release.

Receipts: `ci-evidence/product-rebuild-20260921/` contains CI and browser logs, inspected screenshots, negative findings, domain-access/DNS evidence and a source-hash manifest. The hashes identify the tested working tree; they are not production attestation.

States remain evidence-bound. Physical iOS Safari, virtual keyboard behaviour on real devices, live provider quality, real database RLS and production deployment are unverified here.


## Follow-up improvement checklist, 21 September 2026

The requested first-session, dashboard, saved-work, review/retry, landing,
save-state, mobile and reduced-motion improvements are implemented in this WIP
checkout. See [the completed checklist and exact receipts](IMPROVEMENTS_2026-09-21.md).
The new guided notebook path extends the P1 first-session work above. Verification:
1,098 application tests, 25 evaluation tests, 30 distinct browser scenarios across
main/correction runs, and a final nine-case responsive/theme/reduced-motion pass.
Build, type checking, copy lint and frozen bundle budgets passed. The full CI
rerun with registry access passed end to end, resolving the earlier sandbox DNS
failure; no high or critical production dependency findings were reported. Receipt:
`ci-evidence/improvements-20260921/ci-network-verified.log`. No production promotion
is implied.
