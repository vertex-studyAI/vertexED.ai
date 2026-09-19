# VertexED complete feature and true-readiness checklist

Evidence date: 14 September 2026.

This is the literal product-wide checklist. It combines every request spoken in the 10:34 screen recording with every user-facing route, study feature, API, persistence boundary, and release gate currently present in the VertexED repository.

Checkbox meaning:

- `[x]` means the current candidate has direct evidence for that exact claim.
- `[ ]` means the item still needs implementation, correction, current-environment verification, or owner approval.
- A passing unit test does not by itself mark a feature ready. Feature acceptance includes real UI, real account, failure-state, accessibility, responsive, and production checks.

## Current verdict

VertexED now has a substantially stronger private-beta candidate, including the requested landing corrections, the brand-authoritative Paper and Ink Apex appearances, a full Exam Prep assessment setup, account-scoped workspace layouts, safer notebook recovery, improved notes/export tooling, a shared OpenAI Responses API integration, and a read-only Agent Network directory. The deterministic authenticated browser suite is green on repository CI when run. It is still not truly ready for release.

**Public custom-domain boundary (reverified 18 September 2026):** `www.vertexed.app` still fails before application HTTP (`SSL_ERROR_SYSCALL` / TLS reset). DNS A records resolve to Namecheap (`104.219.250.37`) and Worldstream (`2.59.170.20`), not Vercel. By contrast, `https://vertex-ed-ai.vercel.app/api/health` returns HTTP 200 with `status=alive` and an immutable revision header. Do not treat repository-green CI, Vercel preview health, or a successful transport-diagnostics workflow as proof that the canonical public hostname is healthy. Remaining release gaps also include production secrets verification, live AI-provider results, production database/RLS certification, OAuth branding, licensed/editorially approved curriculum, legal/safeguarding approval, monitoring on the repaired host, current-account acceptance, and real-user validation.

## Evidence already established

- [x] Application test scope passes: 927 of 927 tests (reverified 18 September 2026 on local `codex/vertexed-publication-readiness` working tree; earlier checklist recorded 921/921).
- [x] Evaluation test scope passes: 25 of 25 tests.
- [x] Fixture-backed ask evaluation passes: 13 of 13 with an average of 4.38 out of 5.
- [x] Synthetic grading gate passes six fixtures with zero false-verified outcomes. This is not live-model evidence.
- [x] Production build succeeds with 2,597 modules transformed.
- [x] Frozen JavaScript and CSS bundle budgets pass.
- [ ] Capture a current production dependency audit receipt. The local audit fails closed because the sandbox cannot resolve the npm advisory registry, and an unrestricted dependency-tree submission requires explicit owner approval.
- [x] Copy lint scans 300 files with zero rule findings.
- [x] Local accessibility browser suite passes 51 checks with one desktop-inapplicable skip.
- [x] The fixture-backed approved-learner core journey passes.
- [x] Broad automated coverage exists for waitlist, account isolation, recovery, export, deletion, provisional evidence, and immutable revisions.
- [ ] Capture one clean, uninterrupted `npm run ci` receipt for the exact candidate. The observed full run stopped when advisory metadata was unavailable.
- [ ] Capture one fully green authenticated browser suite using a current approved test account and the updated Apex surface.
- [x] Resolve the React hook dependency warning in `UserSettings.tsx` without suppressing the rule or weakening account-transition invalidation.
- [ ] Configure test temporary storage with enough capacity. The internal data volume currently has about 911 MiB free; keep heavy test, database, and browser artifacts on the external workspace volume.

## Implementation evidence from this completion pass

- Local source: branch `codex/vertexed-publication-readiness`, HEAD `47b73e6c03a0ab58e6368d2b8085a71b84cda377`. The candidate remains uncommitted, so that SHA does not yet identify all changes in this checklist.
- Exact runtime: Node 22.23.2 and npm 10.9.8, matching the repository's Node 22 engine boundary.
- `npm run test:app`: 921 passed, 0 failed across 203 canonical test files.
- `npm run test:eval`: 25 passed, 0 failed. `npm run eval:ask`: 13 of 13 fixture prompts passed, average 4.38 of 5. `npm run eval:grading:check`: six synthetic fixtures passed with zero false-verified outcomes; live model quality was not measured.
- `npm run lint:ci`: 0 errors and 0 warnings. Copy lint scanned 300 files with zero findings. `npm run typecheck` passed.
- Production build: 2,597 modules, 1 Vercel function, 22 routed API endpoints, 87 public sitemap URLs, and 0 editorially approved guide URLs.
- Frozen bundle gate passed: initial JavaScript 246,124 bytes gzip, initial CSS 44,244, largest JavaScript 129,752, total JavaScript 854,953.
- Public Playwright smoke: 32 passed and 20 production-only API cases skipped locally. Local accessibility matrix: 51 passed with one desktop-inapplicable mobile-navigation skip. The deterministic authenticated suite passed 18 of 18 journeys.
- Landing and Apex were captured and inspected at 1440 px, 1024 px, and 390 px. The correction pass moved mobile Apex above the fixed chapter dock, shortened its small-screen label, verified keyboard focus on client-side navigation, and fixed the first keyboard or touch command in Revision Stack so it is no longer discarded when leaving demo mode.
- The configured Supabase Auth settings endpoint returned HTTP 200 with both email and Google providers enabled and deliberate public signup disablement. A browser login attempt with a fictional invalid account reached the provider and returned the new bounded recovery guidance; successful member login still requires a real approved test account.
- Apex persists the documented Paper or Ink appearance as a device preference, remains contained without covering the landing dock at 390 px, and is offered on eligible public, curriculum, study, account, and archive routes while remaining absent from auth, onboarding, admin, and legal transactions.
- Revision Stack now stores a validated high score in an account-scoped key with a signed-out device fallback. Demo scores never enter the saved record.
- The working checklist now has 136 of 610 items evidenced complete and 474 still open; open items remain explicit rather than being inferred from passing smoke tests.
- Current-tree secret scan found no credential-pattern files outside the ignored local environment file; no server secret is intentionally exposed through a `VITE_` variable. This is not a historical or external staging penetration test.
- OpenAI-backed text and image features now share server-side Responses API routing, `store: false`, strict JSON schemas where structured output is required, a one-way hashed learner safety identifier, and optional `OpenAI-Project`/`OpenAI-Organization` routing. Defaults are `gpt-5.6-terra` with `gpt-5.6-luna` fallback; audio transcription retains its dedicated transcription model.
- The authenticated Agent Network endpoint now paginates the OpenAI Agents API for the key's current project, exposes only safe agent metadata, and keeps all ten bounded VertexED study roles visible when the account inventory is empty or unavailable. The signed-in VertedED organisation's only visible project contained zero created reusable agents on 14 September 2026; platform templates were not misreported as active agents.
- Live OpenAI verification is blocked until the owner sets `OPENAI_API_KEY` and, for explicit VertexED project membership, `OPENAI_PROJECT_ID` in the server environment. No secret was requested or copied into source.
- Supabase CLI 2.116.0 is installed, but its sandboxed telemetry write is denied, the Docker Desktop socket is unavailable to this task, and Colima is stopped. With only about 911 MiB free on the internal volume, a new local database image campaign was not started. Static migration and account-isolation tests are included in the 921 passing app tests, but they do not replace a clean database rehearsal.
- The production dependency audit remains open because sandbox DNS could not resolve `registry.npmjs.org`; the repository correctly failed closed. The unrestricted registry submission was not run without explicit owner permission to transmit the dependency tree.
- Content quarantine remains active: 245 files inventoried, 0 approved, 53 flagged for human editorial review.

## 1. Every instruction from the screen recording

### Landing hero and first impression

- [x] Remove the `Private beta study system` badge/copy if it is the vibe-coded-looking element identified in the recording.
- [x] Remove the explanatory line about motion following device settings from the hero.
- [ ] Confirm what was meant by adding the `date or year in corporation`, then add only the agreed legal or date information.
- [x] Preserve the current blue and white identity, VertexED logo, study terminology, and revision-trace idea.
- [x] Keep the parts the user approved: the overall direction, the neural background, the revision example, and restrained blue lighting.
- [ ] Make the first viewport feel authored and focused rather than like a component showcase.
- [x] Check every hero layer for masking, edge clipping, accidental seams, and mismatched corner radii.
- [x] Remove excess negative space without crowding the headline or primary action.
- [ ] Keep the native cursor usable and text selectable under pointer effects.
- [x] Make dark mode the strongest presentation while keeping light and system modes complete.

### Apex companion

- [ ] Keep Apex's approved friendly mascot direction, but refine it to the quality bar of the Codex companion shown in the recording without copying Codex branding.
- [x] Add a direct mini text input to Apex so a learner can type a quick question without opening a full page.
- [x] Add a compact quick-navigation row in the Apex surface.
- [x] Let expanding Apex reveal useful actions, recent context, and navigation rather than decorative content.
- [x] Resolve the recording/brand conflict in favour of the persistent identity specification: Apex keeps the same workbook silhouette in Paper and Ink rather than becoming four unrelated characters.
- [x] Keep the approved open-book form as Apex's identity in both supported appearances.
- [x] Keep Ink as the documented midnight reading-surface appearance, not a duplicate character.
- [x] Give each appearance an accessible name and a visible selected state.
- [x] Persist the chosen appearance as the documented device preference.
- [x] Replace the weak or sad-looking wiggle with a deliberate finite reaction.
- [x] Improve hop, spin, blink, page-turn, and maths reactions so each has a purpose and clean start/end state.
- [x] Never loop decorative motion indefinitely; Apex starts at rest and every reaction has one finite iteration and a bounded reset.
- [ ] Pause reactions for reduced motion, hidden tabs, off-screen state, keyboard focus, and active reading. Reduced motion is implemented; the remaining suspension conditions need a dedicated acceptance run.
- [x] Keep drag-to-move working with pointer controls and add keyboard reposition or fixed-location alternatives.
- [x] Prevent Apex from covering primary actions at 1440, 1024, and 390 px.
- [x] Use the Apex icon, not a generic robot, everywhere the VertexED tutor or companion is represented.
- [x] Ensure only one Apex/tutor launcher is exposed at a time.
- [x] Preserve quick paths to Plan, Focus, Practise, and the full tutor.
- [x] Keep chat history isolated by account and clear it on account change or logout.
- [x] Add cancel/stop generation, retry, copy, feedback, and safe error recovery to the mini input.
- [x] Fix and rerun the authenticated Apex browser cases against the current `Think it through.` dialog and collapsed settings disclosure.

### Landing revision examples and content

- [x] Rotate through different questions on return visits rather than always showing the same example.
- [x] Vary examples across the learner's subjects, not just within one subject.
- [x] Keep Attempt, Review, and Retry visibly connected as one revision trace.
- [x] Keep examples truthful and original; never imply measured learner performance.
- [x] Fix the masking error around the example panels.
- [ ] Fix every card corner where the inner and outer radii do not align.
- [x] Check that text, borders, and animated layers stay inside their intended masks during transitions.
- [ ] Add more useful tags and content where the recording felt sparse, but cap them so they do not become visual noise.
- [x] Organise the gallery so related tools read as one system.
- [x] Reduce unnecessary scrolling to reach the memorable interactive sections.

### Concept Lens

- [x] Remove the always-visible standalone cooling-curve lens from its current landing placement.
- [x] Rebuild Lens as a contextual action a learner opens while exploring a concept, guide, answer, or graph.
- [x] Do not show Lens until the learner explicitly invokes it or a clearly labelled contextual action does.
- [ ] Make the lens content specific to the selected sentence, graph point, question, or concept.
- [x] Rotate the prompt/question rather than repeating one cooling question.
- [x] Support multiple subjects and content types.
- [ ] Provide zoom-in, explain, example, misconception, and practise-next actions only when relevant.
- [ ] Preserve source context and show where the explanation came from.
- [ ] Provide a useful empty state when nothing is selected.
- [x] Make close, escape, focus return, keyboard navigation, and reduced motion work.
- [ ] Remove the feature if it cannot offer more value than a generic static graph.

### Revision Stack and mini-games

- [x] Move Revision Stack/Tetris higher or shorten the path to it so learners do not have to scroll too far.
- [x] Reorganise the surrounding section so the game has a clear educational purpose.
- [x] Make the game faster and more responsive.
- [x] Add a first-play explanation because the user explicitly said they do not know how to play Tetris.
- [x] Explain keyboard, touch, rotate, drop, pause, restart, and scoring controls.
- [x] Preserve high score reliably per account with a device fallback.
- [x] Make focus, pause, page visibility, and reduced-motion behaviour deterministic.
- [x] Make the game fully usable by keyboard and touch.
- [x] Ensure game controls do not trap focus or hijack page scrolling unexpectedly.
- [ ] Add a small, coherent series of serious study mini-games only when each reinforces recall, sequencing, classification, or another named learning action.
- [ ] Define an educational objective, success rule, feedback rule, and evidence boundary for each mini-game.
- [ ] Do not award mastery or predicted grades from decorative game scores.

### Landing to authentication transition

- [ ] Remove the obvious visual seam between the landing experience and login experience.
- [x] Carry the same logo, blue/white palette, spacing rhythm, type hierarchy, surface depth, and background treatment into auth.
- [x] Fix the light/dark theme circle and the two background lights called out in the recording.
- [x] Verify the login card feels native to VertexED in both themes.
- [x] Keep dark as the preferred visual reference while making light mode intentional, not secondary.
- [ ] Audit the icon the transcript described as `coded` or `Codex` and remove it if it is not a VertexED-owned asset.
- [ ] Confirm which additional login providers are required before implementing them.
- [ ] Add only providers that have real configured, branded, tested OAuth flows.

### Dashboard and empty states

- [ ] Make `Continue where you left off` restore the exact unfinished artifact and state.
- [ ] Make `What needs attention` depend only on real recorded work.
- [ ] If nothing needs attention, say so cleanly without invented tasks.
- [ ] Never populate unconfigured features with fake learner-specific placeholders.
- [ ] Use a setup action when a feature lacks the data it needs.
- [ ] Keep general starter suggestions clearly labelled as examples.
- [ ] Verify that improved learner data actually reaches dashboard, planner, exam prep, notes, and tutor without cross-account leakage.

### Exam Prep requested expansion

- [x] Show only the subjects the learner is actually taking.
- [x] Add an obvious `Add subject` action beside the subject tabs.
- [ ] Let the learner edit, reorder, archive, and restore subjects.
- [x] If a subject is not configured, show `Set up your first [subject] exam prep` instead of a fabricated plan.
- [x] Ask what type of test or assessment is coming.
- [x] Ask for exam board/programme, course level, grade/year, subject, paper/component, date, duration, marks, calculator rules, and allowed materials.
- [x] Ask which topics, units, criteria, and command terms are included.
- [x] Ask whether it is an eAssessment and branch the setup accordingly.
- [x] For eAssessment setup, capture the official format and available past-paper metadata without claiming access to unavailable or unlicensed papers.
- [ ] Let learners upload or link their own past papers, tasks, mark schemes, notes, rubrics, teacher feedback, and syllabus extracts.
- [ ] Let learners enter prior paper scores, criterion scores, question-level marks, timings, confidence, and teacher-confirmed results. Overall scores, timing, confidence, question type, topic, command term, and confirmation source are implemented; criterion-level and per-question marks remain.
- [x] Explain which inputs are required, optional, unsupported, or awaiting review.
- [ ] Validate file type, size, ownership, duplication, malware risk, and deletion.
- [x] Create a review screen before finalising setup.
- [x] Allow setup edits without erasing prior sessions or measurements.
- [ ] Add a past-paper analytics section with question-type distribution, topic frequency, command terms, mark allocation, and timing. The section now covers all listed dimensions except mark-allocation distribution.
- [x] Show average scores only from attributable, comparable, human-confirmed inputs.
- [x] Distinguish learner results, cohort/reference results, synthetic examples, and unavailable data.
- [ ] Add score projection only after defining a validated method, uncertainty interval, minimum evidence, and prominent `not a predicted grade` boundary.
- [x] Do not manufacture score predictions when evidence is insufficient.
- [x] Add a short-question practice section.
- [x] Add a reading/review section for source material and unseen passages where relevant.
- [x] Add a tips/technique section tied to the assessment format.
- [x] Add timed and untimed modes.
- [x] Add baseline practice, targeted practice, mock exam, review, retry, and spaced follow-up paths.
- [x] Keep 25, 45, and 75 minute session blocks, but let the learner set a custom duration if needed.
- [x] Make the current phase clearly schedule-based, not an ability label.
- [x] Show why each recommended task was chosen.
- [x] Keep self-reported completions separate from measured evidence.
- [ ] Preserve session history and retry sync safely across tabs and devices.
- [ ] For English and History essay review, highlight the exact weak passage and explain how it can improve.
- [ ] Also highlight exact strong evidence or reasoning so good work is visible.
- [ ] Preserve the real-world-example highlighting the user approved.
- [ ] Link every highlight to a criterion, command term, mark-scheme point, or clearly labelled general writing principle.

### Planner, focus tools, notes, papers, review, tutor, and guides

- [ ] Fix the broken `Plan your week` experience end to end.
- [x] Make focus-tool panels draggable/reorderable where that improves use, with a keyboard alternative and saved layout.
- [x] Remove the large empty regions in Study Zone and fill space only with useful controls or status.
- [x] Fix the 2D graphing tool while preserving working 3D graphing.
- [x] Make flashcard text render correctly at all lengths and in both themes.
- [x] Redesign the Notes/Flashcards/Audio layout so it feels coherent and not visually broken.
- [x] Add human-friendly maths entry: typing `x square` can become `x²`, common expressions can be inserted by buttons, and raw LaTeX remains optional for advanced users.
- [x] Provide an accessible equation toolbar, live formatted preview, undo, and plain-text fallback.
- [ ] Improve Word and PDF export presentation and verify exported maths, tables, page breaks, metadata, and filenames.
- [ ] Improve Practice Papers/Paper Maker visual hierarchy and workflow.
- [ ] Improve Answer Feedback/Answer Reviewer visual hierarchy and fix the observed bugs.
- [ ] Keep one clear question/review task at a time unless batch review is intentionally designed.
- [x] Keep AI Tutor's generally approved direction.
- [x] Fix the cross-origin failure observed in AI Tutor using same-origin production API routing.
- [x] Replace the generic robot icon with Apex.
- [ ] Improve `Study from your material` source upload, feedback, progress, and recovery.
- [x] Make `Create a new notebook` work reliably.
- [x] When cloud notebook storage is unavailable, allow safe local creation and save, show `Saved locally`, and offer later sync/recovery.
- [ ] Confirm whether `add one more edtech feature` or `add one more attachment feature` was intended in the final recording segment before adding scope.
- [ ] Rewrite study-guide copy so it does not read like generic chatbot output.
- [x] Keep the no-em-dash copy rule across authored and generated learner-facing content.
- [ ] Cover every included topic in a digest without forcing learners through one giant document.
- [ ] Break guides into tabs or progressive sections such as Overview, Concepts, Examples, Practice, Mistakes, and Retry.
- [ ] Reduce excessive information density and repair the guide UI at desktop, tablet, and mobile sizes.

## 2. Global product shell and navigation

- [ ] Verify the root route sends signed-out users to the landing page and signed-in approved users to the correct authenticated start.
- [ ] Verify logo/home navigation never loses unsaved work without warning.
- [ ] Verify desktop navigation, mobile menu, sticky state, skip link, breadcrumbs, back navigation, and route focus movement.
- [ ] Verify every active-nav state and every route title accurately names the current page.
- [ ] Verify legacy redirects for learning hub, world model, and archive paths preserve expected intent.
- [ ] Verify the global error boundary, route error boundary, loading fallback, offline state, and 404 page.
- [ ] Keep Feedback Launcher reachable but non-obstructive and remove accidental learner content from reports unless explicitly included.
- [ ] Make global toast messages keyboard-readable, time-safe, dismissible, and specific.
- [ ] Make Cloud Save Banner reflect the current account only and explain device-only, syncing, synced, conflict, and failed states.
- [ ] Prevent duplicate global overlays, nested scroll locks, and focus loss.
- [ ] Verify all external links, target behaviour, rel attributes, and safe return paths.
- [ ] Remove dead pages, duplicate entry points, and legacy copy only after confirming no saved link depends on them.

## 3. Public marketing pages

### Home

- [ ] Verify hero headline, supporting copy, primary action, secondary action, and trust statements against actual beta scope.
- [ ] Verify Landing Dock anchors reach the revision loop, tools, and exam-prep sections accurately.
- [ ] Verify Study Entry paths for `I have notes`, `I need practice`, and `I have an answer` open the correct tool with context.
- [ ] Verify the study folio, answer comparison, floating insight deck, feature rows, tool gallery, study loop strip, and final call to action.
- [ ] Remove duplicate or repetitive sections and keep page length proportionate.
- [ ] Verify every landing feature named is usable after login.

### Features

- [ ] Verify the revision-week timeline, product comparison, board-aware section, ecosystem panel, feature showcase, and FAQ.
- [ ] Ensure feature cards distinguish implemented, beta, limited, and planned capabilities.
- [ ] Ensure all feature links preserve login return destinations.
- [ ] Remove unsupported comparison claims and dated marketing language.

### About, Brand, Study Tools, and public resources

- [ ] Verify About tells the actual product purpose, evidence boundary, operator identity, and support route.
- [ ] Verify Brand/Vertex ED page uses the canonical name, logo, colours, typography, terminology, and asset rules.
- [ ] Verify Study Tools indexes only tools that are live and links to the canonical route for each.
- [ ] Verify the public Resources index search, categories, cards, metadata, related links, and mobile layout.
- [ ] Review each of the 22 public resource articles for factual currency, citations, originality, licensing, accessibility, and truthful calls to action.
- [ ] Update or remove time-sensitive pages such as `best AI study tools 2025` if they are no longer current.
- [ ] Verify Article table of contents, heading order, code/math/table rendering, link states, and reading width.
- [ ] Add visible update dates and reviewer/source information where claims could change.

## 4. Authentication, waitlist, and invitations

### Login

- [ ] Verify approved email/password sign-in with loading, invalid credentials, unapproved account, disabled account, timeout, and offline states.
- [ ] Verify `Forgot password`, show/hide password, return destination, and safe error copy.
- [ ] Verify Google sign-in with a verified VertexED consent screen and domain.
- [ ] Replace the raw Supabase project hostname visible in Google OAuth with an approved VertexED auth domain/brand.
- [ ] Configure app name, logo, verified domain, support email, privacy URL, and terms URL in Google Cloud.
- [ ] Test every supported provider on desktop and mobile before listing it.

### Signup and private-beta access

- [ ] Verify invite-code signup, private approval link signup, link expiry, already-used invite, email mismatch, duplicate account, and retry.
- [ ] Verify school, country, curriculum, other curriculum, grade/year, password, and consent fields.
- [ ] Keep direct open signup disabled while the product claims a controlled private beta.
- [ ] Verify team-generated invitations prove mailbox ownership before account activation.
- [ ] Verify invitation emails use the VertexED domain and correct reply/support address.
- [ ] Verify waitlist signup, duplicate handling, rate limiting, abuse controls, notification, and pending confirmation.
- [ ] Verify Waitlist Pending gives an accurate status and a safe path back.

### Callback, linking, and password lifecycle

- [ ] Verify auth callback for success, denial, malformed state, expired code, repeated callback, wrong account, and safe return.
- [ ] Verify Connect Google linking and unlinking rules without account takeover or lost data.
- [ ] Verify initial-password setup only works from a valid verified invitation and consumes that authority.
- [ ] Verify password recovery creates a recovery session, applies password rules, changes the credential, revokes sessions, and cannot be replayed.
- [ ] Verify session refresh, expiry mid-request, one retry, and terminal sign-out.
- [ ] Remove credentials and real email addresses from screenshots, traces, analytics, and error reports.

## 5. Onboarding and learner profile

- [ ] Verify first-run onboarding cannot be skipped into a misleading personalised dashboard.
- [ ] Capture board/programme, grade/year, subjects, exam targets, time zone, study goal, preferred session length, explanation depth, and AI style.
- [ ] Make all optional fields genuinely optional and explain why requested data helps.
- [ ] Add/remove/reorder subjects and support multiple exam dates/papers.
- [ ] Validate past dates, impossible combinations, other-board values, and partial completion.
- [ ] Save atomically to the intended account and preserve a recoverable device copy.
- [ ] Resume interrupted onboarding at the correct step.
- [ ] Allow later edits in Settings without corrupting plans, history, or saved artifacts.
- [ ] Make completion status derived from real required fields, not route visitation.

## 6. Dashboard / Your Study Desk

- [ ] Verify greeting and context use the current account only.
- [ ] Verify `Start exam prep` and `Open planner` preserve subject and timing context.
- [ ] Verify study summary values for streak, habits, due cards, and tasks today.
- [ ] Verify `Continue studying` restores notes, papers, reviews, notebooks, mocks, planner tasks, and Apex handoffs.
- [ ] Verify empty `Continue studying` sends the learner to a useful first action.
- [ ] Verify Today Plan completion, reversal, and navigation.
- [ ] Verify Study Loop Ring and seven-day rhythm use real activity and do not imply mastery.
- [ ] Verify Retrieval Pulse suggests a reasoned next action and can carry a prompt into Apex.
- [ ] Verify subject confidence controls, labels, term navigation, and storage.
- [ ] Verify readiness ring, subject mastery, weak-topic sprint, marks gaps, due flashcards, focus block, and loop closure.
- [ ] Keep measurements, self-report, predictions, and recommendations visually distinct.
- [ ] Verify all nine tool rows: Exam Prep, Plan Your Week, Focus Tools, Notes/Flashcards/Quizzes, Practice Papers, Answer Feedback, AI Tutor, Study From Your Materials, and MYP Study Guides.
- [ ] Verify Board Resources and support resources show only available content.
- [ ] Remove or collapse widgets that lack enough data instead of displaying decorative zeros or placeholders.

## 7. Exam Prep feature acceptance

- [ ] Verify profile-ready and setup-required states.
- [ ] Verify subject selection, exam target selection, countdown, board, grade/year, paper/component, and current phase.
- [ ] Verify recommended, practice, revision, and optional-baseline modes.
- [ ] Verify recommendation priority among pending mock, due retry, weak topic, due cards, revision, and practice.
- [ ] Verify 25, 45, and 75 minute session generation and the sum of block durations.
- [ ] Verify Retrieve, Practise, and Review block completion, reversal, and activity recording.
- [ ] Verify start-another-session does not erase history.
- [ ] Verify practice lab evidence, answer entry, solution reveal, explanation checks, transfer question, and reference link.
- [ ] Verify topic evidence and mistakes show only attributable records for the selected subject.
- [ ] Verify session history, queued changes count, retry sync, corrupt snapshot handling, and account switching.
- [ ] Verify preparation-evidence signals have plain-language definitions.
- [ ] Verify pending mock, due retry, weak-topic, and flashcard counts update without reload.
- [ ] Verify midnight/date/time-zone boundaries and passed-exam behaviour.
- [ ] Add and test the full setup, analytics, upload, prediction-boundary, short-practice, reading, tips, and essay-highlighting requests listed in section 1.

## 8. Planner / Plan Your Week

- [ ] Verify Day view on desktop and mobile.
- [ ] Verify Week view on desktop and its explicit mobile fallback.
- [ ] Verify previous month, next month, day selection, today action, and week labels.
- [ ] Verify current-time indicator and hour/day/week elapsed indicators.
- [ ] Verify manual task creation with name, date, start time, duration, subject, and notes.
- [ ] Verify AI task creation from natural language and review before save.
- [ ] Verify edit, move, resize/duration, complete, uncomplete, and delete.
- [ ] Verify overlapping tasks, tasks crossing midnight, past tasks, all-day deadlines, and time-zone changes.
- [ ] Verify exam timetable entries and linkage to exam targets.
- [ ] Verify save debounce, hydration, slow network, stale response invalidation, conflict handling, and retry.
- [ ] Verify account-scoped local fallback and migration to cloud.
- [ ] Never replace a newer local plan with an older remote snapshot silently.
- [ ] Add a clear unsaved/saving/synced/device-only/conflict state.
- [ ] Repair every interaction observed as broken in the recording, then run an actual learner week-creation journey.
- [ ] Remove legacy CSS that still conflicts with the current planner layout.

## 9. Study Zone / Focus Tools

### Workspace shell

- [ ] Verify cards can be opened, closed, arranged, and restored without accidental loss.
- [x] Add optional drag/reorder with keyboard move controls and saved layout.
- [x] Use responsive columns to eliminate unusable negative space.
- [ ] Verify focus mode, page scrolling, touch targets, panel headings, and close controls.

### Timer suite

- [ ] Verify countdown start, pause, resume, reset, custom time, zero state, alert, and background-tab behaviour.
- [ ] Verify stopwatch start, pause, resume, reset, and long-duration accuracy.
- [ ] Verify Pomodoro focus/break lengths, automatic transitions, manual skip, session count, and notifications.
- [ ] Avoid sound or notification permission prompts until initiated by the learner.

### Activity Log

- [ ] Verify add, edit if supported, timestamp, ordering, persistence, empty state, maximum length, and deletion.
- [ ] Keep log entries self-reported and separate from measured learning evidence.

### Daily Habits

- [ ] Verify add, complete, uncomplete, remove, daily reset, progress, account isolation, and corrupt-storage recovery.
- [ ] Clarify streak rules and prevent time-zone changes from fabricating streaks.

### Scientific Calculator

- [ ] Verify parser precedence, parentheses, unary minus, powers, roots, trigonometry, logs, constants, memory, clear, backspace, decimals, and error recovery.
- [ ] Verify keyboard entry, screen-reader announcements, copy, and mobile layout.

### Graphing Suite

- [x] Replace the broken 2D Desmos path with a first-party, CSP-safe 2D graph and table that does not execute learner input.
- [x] Preserve and verify 3D embedding.
- [x] Replace `Expression in LaTeX` as the primary learner interface with human-readable maths entry and an optional raw mode.
- [ ] Verify expression validation, fallback iframe, CSP/CORS, network failure, resize, keyboard use, and reduced motion.

### Breath Meditation

- [ ] Verify start, pause, reset, duration, breathing phase labels, audio if any, and reduced-motion alternative.
- [ ] Use non-medical copy and never imply treatment.

### Sketch Notepad

- [ ] Verify pen, colour, size, erase, undo, redo, clear confirmation, touch/pencil/mouse, save, restore, and export.
- [ ] Prevent the canvas from blocking page scroll on mobile.

### Quick Notes

- [ ] Verify title/body editing, formatting toolbar, maths entry, save, preview, delete, account isolation, and local fallback.
- [ ] Make broken text impossible through sanitisation and safe rich-text handling.

## 10. Notes, flashcards, quizzes, and audio

### Notes

- [ ] Verify topic/source entry and adaptive weak-topic prefill.
- [ ] Verify Quick Notes, Cornell Notes, Research Oriented, Detailed Overview, Bullet Points/Summary, Mapping, and Custom formats.
- [ ] Verify short, medium, and long output settings and clearly cap provider input/output.
- [ ] Verify build notes, loading, cancel, timeout, offline scaffold, error, retry, and stale-request invalidation.
- [ ] Verify edit, undo/redo snapshots, autosave, clear history confirmation, copy, preview, and hide/show notes.
- [ ] Verify Markdown, tables, code, links, maths, long words, and unsafe HTML rendering.
- [ ] Verify local and cloud save states, artifact restore, cross-account reset, and sync recovery.
- [ ] Add source citations or explicit source-bound labels for generated claims.

### Flashcards and spaced repetition

- [ ] Verify card generation count from 4 through 16.
- [ ] Verify front/back text, reveal, previous/next, fullscreen, and keyboard controls.
- [ ] Verify add-to-deck idempotency and duplicate handling.
- [ ] Verify due queue, reveal, Again/Hard/Good/Easy ratings, interval scheduling, time-zone boundaries, and cram queue.
- [ ] Verify deck persistence, account isolation, export/recovery, and corrupt-card handling.
- [x] Fix clipping, overflow, contrast, and broken text observed in the recording.
- [x] Do not treat a card rating as proof of mastery.

### Quizzes

- [ ] Verify Adaptive Learning, Knowledge Application, Fundamental, and Exam Oriented quiz modes.
- [ ] Verify Easy, Medium, and Hard difficulty.
- [ ] Verify Short FRQ, Long FRQ, Mixed/MCQ-heavy, and MCQ option-count controls.
- [ ] Verify generation only after adequate source notes and explain disabled states.
- [ ] Verify question navigation, typed answers, MCQ selection, submission, reset, and resubmission policy.
- [ ] Verify answer keys, validation, score status, confidence, human-review flag, remediation, and degraded mode.
- [ ] Verify quiz history chart labels, zero data, small data, and no fabricated accuracy.
- [ ] Record weakness only from permitted measured/evidence-linked outcomes.

### Audio capture and transcription

- [ ] Verify microphone permission request, denial, no device, interruption, start, stop, waveform, one-hour cap, playback, deletion, and re-record.
- [ ] Verify supported MIME types, actual byte limits, safe filename handling, and server transcription validation.
- [ ] Verify transcript insertion, correction, retry, cancellation, and privacy copy.
- [ ] Never upload audio before explicit learner action.

### Export

- [ ] Verify text/Markdown copy and download.
- [ ] Verify PDF export preserves headings, lists, tables, equations, page breaks, source labels, and Unicode.
- [ ] Verify Word export opens cleanly and preserves the same information hierarchy.
- [ ] Use useful filenames and remove hidden private metadata.

## 11. Paper Maker and mock exams

- [ ] Verify curriculum/board options actually supported by the generator.
- [ ] Verify subject, grade/year, topics, difficulty, duration, marks, question count, criteria mode, notes, and mark-scheme choices.
- [ ] Verify image/file upload validation, preview, removal, limits, missing-image handling, and ownership.
- [ ] Verify generation loading, cancel, timeout, fallback scaffold, retry, and stale-response invalidation.
- [ ] Verify paper title, metadata, instructions, sections, question numbering, marks, approximate time, images, rubric notes, and total calculations.
- [ ] Make `criteria mode` understandable and ensure hidden totals do not leak.
- [ ] Keep mark scheme hidden by default and clearly separate it from questions.
- [ ] Verify reveal/hide mark scheme, Question PDF, Question Word, and Mark Scheme Word.
- [ ] Verify saved paper restore, local fallback, account sync, delete, and source handoff.
- [ ] Verify timed exam start, close confirmation, timer, question navigation, autosave, resume, submit, and unanswered warning.
- [ ] Verify cram mock appears only under the intended exam-date rule.
- [ ] Verify completed mock handoff into Answer Reviewer without losing questions, answers, images, or timing.
- [ ] Mark generated paper content as practice material requiring syllabus/mark-scheme review.
- [ ] Test paper accuracy and mark allocation with independent subject reviewers before advertising board alignment.
- [ ] Redesign the dense form and preview based on the recording feedback.

## 12. Answer Reviewer

- [ ] Verify curriculum, subject, grade/year, marks, strictness, question, answer, additional context, and reset-all.
- [ ] Verify typed question/answer and question/answer image uploads or clipboard pastes.
- [ ] Verify file type, size, duplicate, removal, OCR/vision, and inaccessible-image failure states.
- [ ] Verify submit disabled/enabled rules and one active request at a time.
- [ ] Verify cancel, timeout, provider failure, same-origin/CORS, retry, and stale-request/account-switch invalidation.
- [ ] Verify structured score status, overall score, criterion rows, evidence quotes, offsets, command-term gaps, errors, remediation, retry prompt, and human-review requirement.
- [ ] Highlight exact quoted evidence in the learner's original response, including weak and strong passages.
- [ ] Make highlight offsets robust to whitespace, Unicode, pasted formatting, and repeated phrases.
- [ ] Never present AI feedback as an official grade.
- [ ] Require teacher or official-mark-scheme confirmation before recording measured progress.
- [ ] Verify corrected criterion marks and their allowed range before recording.
- [ ] Verify confirmation method/reference, immutable audit ID, retry completion, and weakness recording.
- [ ] Verify mock-exam import and direct subject/topic prefill.
- [ ] Verify save, local fallback, copy, Markdown download, word count, feedback controls, and restore.
- [ ] Run an independent grading comparison set for the launch subjects.
- [ ] Simplify the visual hierarchy and repair all observed bugs before sign-off.

## 13. AI Tutor and global Apex chat

- [ ] Verify Quick, Tutor, and Deep modes have distinct, truthful behaviour.
- [ ] Verify Chat, How It Helps, and Socratic Drill tabs.
- [ ] Verify prompt chips, typed prompt, submitted prompt, streaming, stop, regenerate, copy, and feedback.
- [ ] Verify maths, essay, exam-question, and feedback-follow-up prompts.
- [ ] Verify context from current route, learner profile, selected subject, saved handoff, and notebook sources.
- [ ] Make context visible and removable before sending.
- [ ] Verify source-grounded responses cite only supplied notebook/guide sources when grounding is claimed.
- [ ] Prevent prompt injection from uploaded sources, retrieved guides, and prior messages.
- [x] Fix all cross-origin failures through the canonical same-origin API.
- [ ] Verify timeout, retry, provider failover, rate limit, quota exhaustion, malformed stream, offline, and cancel.
- [x] Keep chat history account-scoped with clear/new conversation and export/delete controls.
- [x] Use Apex branding consistently and remove generic robot imagery.
- [ ] Keep the tutor Socratic where appropriate without blocking direct help when the learner needs it.
- [ ] Add academic-integrity boundaries for live assessment requests.
- [ ] Verify safety handling, crisis language routing, abuse reporting, and age-appropriate responses.

## 14. Study Notebook / Study From Your Materials

- [ ] Verify new notebook creation, rename, select, reorder if supported, and delete confirmation. Creation and local recovery are fixed; the complete rename/select/delete journey still needs a credentialed acceptance run.
- [x] Fix the observed inability to create a notebook.
- [x] Permit local notebook creation when cloud hydration or save is unavailable.
- [x] Show Hydrating, Saving, Cloud Synced, Saved Locally, Conflict, Read Only, and Recovery states accurately.
- [ ] Verify reload-cloud-copy keeps a recoverable local backup and requires informed confirmation.
- [ ] Verify pasted source title/content and text, Markdown, and CSV uploads.
- [ ] Reconcile the UI's mention of PDF excerpts with the actual accepted file types. Add safe PDF extraction or remove the unsupported claim.
- [ ] Verify file size and character limits agree in code and copy.
- [ ] Verify importing saved notes, papers, and reviews as sources.
- [ ] Verify source preview, include/exclude, remove, word count, duplicate detection, and source ownership.
- [ ] Verify source content is sanitised and cannot inject instructions, scripts, or cross-account references.
- [ ] Verify grounded chat citations point to the correct source passage.
- [ ] Verify every studio output: Study Guide, Briefing, FAQ, Quiz, Concept Map, Glossary, Comparison, Flashcards, Board Deep Dive, Audio Script, Audio Brief, Audio Critique, and Audio Debate.
- [ ] Verify output generation loading, cancel, timeout, failure, retry, replace, and save.
- [ ] Verify generated flashcards add idempotently to the spaced-repetition deck.
- [ ] Verify generated quiz handoff and study-mode handoff.
- [ ] Verify concept-map labels, relationships, layout, text alternatives, and overflow.
- [ ] Verify text-to-speech play, pause, resume, stop, voice/rate, empty content, page navigation, and browser support.
- [ ] Verify notebook JSON export, import/recovery expectations, and no secret/private metadata.
- [ ] Test large source sets, source removal during generation, account switch during request, concurrent tabs, and two devices.
- [ ] Make the three-column workspace responsive and reduce density on smaller screens.

## 15. Study guides, MYP hub, and eAssessment

### Imported Study Guides

- [x] Keep all 245 imported guide files out of promised production scope until approved.
- [ ] Decide whether unapproved pages should be inaccessible rather than merely labelled `Held for editorial review`.
- [x] Create a ledger row per page with source, licence, curriculum version, reviewer, review date, status, and content hash.
- [ ] Resolve all 53 current content-review flags.
- [ ] Verify guide routing, subject index, grouped navigation, page navigation, search, no-result state, mobile drawer, and deep links.
- [ ] Verify Markdown headings, tables, maths, lists, callouts, internal links, and source links.
- [ ] Replace giant-document presentation with topic tabs/progressive disclosure while preserving URL-addressable sections.
- [ ] Remove generic chatbot voice, repetition, excessive density, and prohibited em dashes.
- [ ] Make every included topic discoverable and state unavailable coverage honestly.
- [ ] Ensure study-guide chat retrieves only approved content and exposes source references.

### MYP 5 Hub and subject lessons

- [ ] Verify subject-group filter, search, result counts, empty state, and all subject cards.
- [ ] Verify every subject/topic route and Subject Not Found handling.
- [ ] Verify topic rail, previous/next topic, Build the Concept, Make the Reasoning Visible, worked examples, original practice, command terms, and retry path.
- [ ] Verify science-specific content and any diagrams or formulae.
- [ ] Verify detailed-lesson counts and fallback summaries do not imply missing content is complete.
- [ ] Independently review every MYP lesson against the current programme and subject guide.

### eAssessment Hub

- [ ] Verify exam-technique guidance, assessment guides, question bank, subject filter, difficulty filter, and attempt links.
- [ ] Verify command terms, marks, depth guidance, timing, and response structures.
- [ ] Label every question as original practice unless licensed otherwise.
- [ ] Do not imply access to all official past papers.
- [ ] Verify question coverage by subject/topic and publish gaps.
- [ ] Review question accuracy and marking guidance independently.

## 16. Curriculum tools and board resource library

- [ ] Verify curriculum selector data, grade ranges, subject examples, features, board badges, and command-term glossary.
- [ ] Verify curriculum feature routes for planner, focus, paper maker, answer reviewer, AI tutor, and any other configured feature.
- [ ] Keep route claims aligned with the actual board support in each tool.
- [ ] Verify Humanities example content, evidence, and link destination.
- [ ] Verify Resource Library board selection, grade, topics, cached guide retrieval, generation, cancellation, and account-scoped cache.
- [ ] Verify generated board guides are labelled AI-drafted and require course-material checks.
- [ ] Prevent stale guide responses after board/topic/account changes.
- [ ] Verify unavailable board/topic combinations and provider failures.
- [ ] Review board names, programme terminology, syllabus versions, and regional variants.

## 17. Archives

- [ ] Decide whether Archives remains a supported public product area or is consolidated into approved Study Guides.
- [ ] Verify Archives Home and LnL, History, and Geography subject pages.
- [ ] Verify starter guides, exemplars, subject cards, external/internal links, and legacy redirects.
- [ ] Audit every exemplar for ownership, permission, anonymisation, academic integrity, and current criteria.
- [ ] Remove `curated` or completeness claims that the evidence ledger does not support.
- [ ] Add review status, curriculum version, source, and correction route.

## 18. User Settings, saved work, and account lifecycle

### Curriculum and learning profile

- [ ] Verify curriculum, board, grade/year, subjects, and all exam targets save and reload.
- [ ] Verify study goal, grade level, AI style, explanation depth, and session length.
- [ ] Verify invalid exam dates and unsupported combinations produce actionable errors.
- [ ] Verify profile-completeness status and dashboard/exam-prep updates.

### Appearance and accessibility

- [ ] Verify Light, Dark, and System themes immediately and after reload.
- [ ] Verify reduced motion follows the system by default and can be controlled accessibly if allowed.
- [ ] Verify high contrast, larger text, reading width, simple mode, pointer effects, and Apex visibility settings if exposed.
- [ ] Ensure collapsed `Appearance and animations` settings remain discoverable and browser tests match the current disclosure.
- [ ] Verify theme meta colour and no flash of wrong theme.

### Saved work

- [ ] Verify All, Notes, Papers, and Reviews filters.
- [ ] Verify open/restore, delete confirmation, pagination, empty state, loading, failure, and retry.
- [ ] Verify notebook and planner data are discoverable or explicitly handled elsewhere.
- [ ] Verify account switching cannot display the prior account's artifacts.

### Account actions

- [ ] Verify current-device sign-out and all-session revocation feedback.
- [ ] Verify account export includes paginated cloud data plus complete device-owned data without secrets.
- [ ] Verify exported schema/version, timestamps, checksums, and recovery instructions.
- [ ] Verify permanent deletion warning, reauthentication if required, in-flight request cancellation, cloud deletion, auth deletion, local cleanup, and final redirect.
- [ ] Verify linked waitlist PII is removed according to policy.
- [ ] Verify partial deletion failure has a safe retry and support escalation path.

## 19. Admin waitlist

- [ ] Verify admin route denies unauthenticated, normal approved, pending, and spoofed-role users.
- [ ] Verify admin status comes from authoritative server-side account checks.
- [ ] Verify waitlist list/search/filter/pagination if supported.
- [ ] Verify approve, reject, invite, resend, revoke, and duplicate actions if supported.
- [ ] Verify request invalidation prevents one applicant's slow response from changing another applicant.
- [ ] Verify every admin mutation records actor, target, time, result, and request ID.
- [ ] Minimise displayed PII and prevent copying/export without an authorised purpose.
- [ ] Verify invitation delivery, bounce, complaint, expired link, and already-registered user behaviour.
- [ ] Add least-privilege admin roles, access review, and emergency revocation.

## 20. API handler acceptance, route by route

### Public and session infrastructure

- [ ] `/api/health`: verify shallow health, deep readiness, exact build SHA, capability details, safe caching, and no secret leakage.
- [ ] `/api/telemetry`: verify allowlisted events, schema/version, size limit, PII rejection, abuse controls, and durable failure behaviour.
- [ ] `/api/admin-status`: verify authenticated least-privilege status with no client-controlled role trust.

### Waitlist and access

- [ ] `/api/waitlist`: verify validation, duplicate handling, rate limit, notification, privacy, and safe response equivalence.
- [ ] `/api/waitlist-status`: verify token/account ownership, non-enumeration, and correct pending/approved/rejected state.
- [ ] `/api/waitlist-admin`: verify every admin operation, audit record, concurrency, and scope.
- [ ] `/api/signup-invite`: verify invite token/code, email ownership, expiry, one-time use, resend, and recovery.

### Account data

- [ ] `/api/account`: verify authenticated profile update/read/delete operations and ownership.
- [ ] `/api/account-export`: verify completeness, pagination, device merge contract, content disposition, timeout, and no secrets.
- [ ] `/api/learner-state`: verify scoped read/write/batch sync, validation, ordering, idempotency, and conflict rules.
- [ ] `/api/user-content`: verify scoped list/create/read/update/delete, pagination, idempotency, restore, and operation scope.
- [ ] `/api/notebook`: verify snapshot read/write, schema version, conflict detection, read-only recovery, and size limits.
- [ ] `/api/planner`: verify snapshot read/write, validation, AI-plan contract, conflict detection, and slow-request safety.

### AI learning tools

- [ ] `/api/ask`: verify authentication, prompt contract, context limits, streaming/cancel, grounding, routing, model policy, timeout, failover, rate limit, and safe errors.
- [ ] `/api/note`: verify all note formats, source limits, structured response, fallback truth, and cancellation.
- [ ] `/api/quiz`: verify all quiz modes/difficulties/lengths, answer-key provenance, score statuses, and false-verification prevention.
- [ ] `/api/paper-generator`: verify parameters, image validation, structured paper, mark-scheme boundary, fallback truth, and cost limit.
- [ ] `/api/review`: verify text/image input, evidence offsets, criteria, errors, remediation, provisional grading, and human-confirmation boundary.
- [ ] `/api/study-guide-chat`: verify retrieval only from eligible guide content, citation fidelity, injection resistance, and unavailable-answer behaviour.
- [ ] `/api/transcribe`: verify authenticated multipart/input contract, supported audio, byte/time limits, timeout, privacy, and provider errors.
- [ ] `/api/board-resource`: verify board/topic validation, cache scope, AI-draft label, cancellation, and stale request handling.

### Shared API controls

- [x] Verify central routing rejects unknown methods and paths consistently.
- [ ] Verify authentication, account scope, request IDs, security headers, CORS/origin policy, input validation, sanitisation, and JSON size limits on every route. Automated contract coverage passes; a deployed route-by-route security run remains.
- [ ] Verify atomic database-backed rate limits for all expensive or sensitive operations.
- [x] Verify fetch/provider timeouts and AbortSignal propagation.
- [x] Verify provider telemetry excludes prompts, answers, emails, school, account IDs, and free-form errors.
- [ ] Verify retries/failover are idempotent and do not duplicate artifacts, analytics, or future charges. Artifact idempotency is covered; live provider charge behaviour is not.

## 21. Supabase, migrations, storage, and recovery

- [ ] Decide whether VertexED gets a dedicated Supabase project or remains in the currently shared project.
- [ ] Prefer a dedicated project unless the owner accepts cross-application migration and operational risk.
- [ ] Back up and verify the existing remote project before any schema change.
- [ ] Restore/clone into an isolated disposable environment.
- [ ] Reconcile the remote migration ledger with every ordered file under `supabase/migrations/`.
- [ ] Run `supabase db reset`, pgTAP, and SQL lint on a clean local stack.
- [ ] Rehearse all pending migrations on the disposable clone.
- [ ] Verify application-profile and school-directory migrations before exposing dependent forms.
- [ ] Verify RLS and explicit grants with unauthenticated client, Account A, Account B, and service operations.
- [ ] Verify rate-limit RPC, learner-state batch sync, observability, exam sessions, user content, planner, notebooks, waitlist, and singleton constraints.
- [ ] Reconcile duplicate singleton rows without deleting ambiguous learner data.
- [ ] Test concurrent tabs and two-device conflicts.
- [ ] Test offline edits, durable outbox, reconnect, retry queue, and corrupt-record preservation.
- [x] Verify local-storage keys are account-scoped and legacy unscoped data cannot attach to the wrong account.
- [x] Verify transient sessions and sign-out clear sensitive memory and pending operations.
- [ ] Enable backups/PITR appropriate to beta risk.
- [ ] Perform a restore drill, then rerun authenticated isolation and core journeys.
- [ ] Define recovery-point objective, recovery-time objective, operator, and escalation path.

## 22. AI quality, educational evidence, and cost

- [ ] Exercise Apex, notes, quizzes, flashcards, papers, review, planner, notebook, guide chat, vision, and transcription using exact production provider/model IDs.
- [ ] Build representative launch-subject evaluation sets with independent answer keys and human reviewers.
- [ ] Measure factual accuracy, helpfulness, citation fidelity, structured-output validity, false-verification rate, and severe-error rate.
- [ ] Measure p50, p95, and p99 latency plus timeout, cancellation, retry, and fallback rates per capability.
- [ ] Test long, short, ambiguous, multilingual, adversarial, and curriculum-mismatched inputs.
- [ ] Red-team prompt injection through notes, uploads, retrieved guides, image text, and conversation history.
- [ ] Red-team cross-account leakage, unsafe Markdown/URLs, output script injection, oversized files, malformed JSON, and provider spoofing.
- [ ] Set provider quota/cost alerts and a kill switch per expensive route.
- [ ] Record cost per successful learner action under realistic beta use.
- [ ] Keep paid plans, usage units, and pay-per-use hidden until the authoritative server ledger and billing lifecycle exist.
- [ ] Prove retries and failover cannot double-count future allowance or billing.
- [x] Keep recommendations and forecasts calibrated to available evidence.
- [x] Do not claim learning gain, examiner agreement, predicted grades, or coverage completeness without a study that supports that exact claim.

## 23. Content, provenance, and editorial readiness

- [ ] Choose a narrow launch curriculum and subject set.
- [ ] Publish a coverage map: reviewed, partial, planned, and unavailable.
- [ ] Version content by programme, syllabus version, subject, topic, criterion, and prerequisite.
- [ ] Record source, licence, author, reviewer, review date, hash, and correction history for every content asset. The generated 245-file ledger has hashes and explicit unknown/null provenance, not the missing owner-supplied evidence.
- [ ] Obtain rights for every third-party question, passage, diagram, exemplar, rubric, and mark-scheme reference.
- [ ] Independently review original questions and guidance for correctness, age suitability, command terms, and scoring language.
- [ ] Add visible report/correct controls and an owner/severity/takedown workflow.
- [x] Regenerate public sitemap and retrieval eligibility only from approved pages; search and related-content indexes still need an explicit release receipt.
- [x] Prevent project-authored fixtures and synthetic examples from being presented as external validation.

## 24. Accessibility, responsive design, and motion

- [ ] Capture and inspect every major route at 1440 px, 1024 px, and 390 px.
- [ ] Repeat key routes in dark, light, high-contrast/simple, reduced-motion, and 200 percent text zoom states.
- [ ] Complete all core journeys keyboard-only with visible focus and logical order.
- [ ] Verify screen-reader names, roles, states, live regions, errors, dialogs, tabs, disclosures, charts, graphs, canvases, and timers.
- [ ] Verify minimum touch targets, mobile keyboard behaviour, safe-area insets, orientation, and no horizontal overflow.
- [ ] Verify colour contrast, non-colour status cues, forced-colours mode, and long dark-mode reading comfort.
- [x] Verify modal focus trap, Escape, close button, background inertness, and focus return.
- [x] Verify reduced motion stops non-essential landing parallax, pointer lights, auto-advance, mascot reactions, and game animation.
- [x] Make all new drag operations available through buttons or keyboard.
- [ ] Add alternatives or explanations for Desmos, charts, concept maps, sketch pad, waveform, and Revision Stack.
- [x] Run the correction pass required by the project UI instructions after inspecting landing and login at 1440 px, 1024 px, and 390 px.

## 25. Performance and browser compatibility

- [x] Preserve route-level lazy loading for Markdown, charts, KaTeX, documents, PDF, and large tools.
- [x] Keep initial CSS below 45,000 gzip bytes; the current local production build measures 44,244 bytes.
- [x] Keep initial JS under 275,000 gzip bytes, largest chunk under 240,000, and total JS under 1,000,000.
- [ ] Measure Core Web Vitals on the actual production domain under mobile/slow-network conditions.
- [ ] Set dimensions, compression, format, priority, and cache policy for logo, Apex, screenshots, and future media.
- [ ] Test low-end mobile CPU/memory with landing effects, sticky navigation, Apex, charts, and games active.
- [ ] Test current Safari, Chrome, Edge, and Firefox plus iOS Safari and Android Chrome.
- [ ] Verify no feature silently depends on third-party cookies, localStorage availability, microphone support, speech synthesis, or cross-origin iframe behaviour.
- [ ] Test offline shell behaviour and slow/failed chunks.

## 26. Security, privacy, legal, and safeguarding

- [ ] Identify the contracting entity and responsible operators.
- [ ] Obtain legal review of Terms, Privacy, governing law, retention, deletion, subprocessors, and support contacts.
- [ ] Complete jurisdiction-specific age, parental-consent, school-use, and student-data analysis.
- [ ] Publish a precise retention schedule for accounts, content, logs, waitlist records, audio, uploads, and backups.
- [ ] List subprocessors and execute required data-processing agreements.
- [ ] Document lawful basis and consent boundaries for profile, study, and analytics data.
- [ ] Provide accessible privacy, correction, export, deletion, complaint, and support routes.
- [ ] Rotate any secret exposed in a repository, screenshot, chat, log, or shared environment.
- [x] Verify service-role, AI, email, and invite secrets never enter browser bundles in the current production build.
- [ ] Run secret scanning, dependency review, static checks, and an external staging security test.
- [ ] Verify CSP, CORS, origin validation, CSRF posture, XSS sanitisation, upload handling, SSRF resistance, rate limits, and admin authorization.
- [ ] Define incident severity, on-call ownership, containment, notification, recovery, and review.
- [ ] Add abuse/reporting and safeguarding paths suitable for teenage learners.
- [ ] Define appropriate AI tutor boundaries for self-harm, abuse, harassment, sexual content, illegal activity, and academic cheating.

## 27. SEO and public-web truth

- [ ] Ensure canonical URLs point only to the real production host.
- [ ] Verify `robots.txt`, public sitemap, guide sitemap, noindex rules, redirects, 404s, Open Graph, social images, and structured data.
- [ ] Exclude auth, account, admin, unapproved guides, and private learner routes from indexing.
- [ ] Verify sitemap URLs return 200 with canonical content and no parked/preview host.
- [ ] Remove SEO claims for unsupported boards, grades, subjects, past papers, or AI outcomes.
- [ ] Run search-engine submission only after production DNS, TLS, revision, and content approval are correct.

## 28. Production domain, deployment, and operations

- [ ] Move `vertexed.app` and `www.vertexed.app` off the Namecheap parked-domain host.
- [ ] Attach both names to the canonical VertexED Vercel project.
- [ ] Configure approved DNS records and remove conflicting parking records.
- [ ] Issue and verify valid TLS for bare and `www` domains.
- [ ] Redirect the bare domain permanently to `https://www.vertexed.app`.
- [ ] Confirm the production host serves the current VertexED build, not a preview or parked page.
- [ ] Confirm `/api/health` and `/api/health?readiness=1` are green.
- [ ] Confirm response body and `X-VertexED-Revision` match the exact 40-character deployed Git SHA.
- [ ] Verify production environment variables belong to the intended project and match the approved matrix.
- [ ] Run live smoke and authenticated golden journeys against that exact SHA.
- [ ] Create staging with synthetic accounts and sanitised content.
- [ ] Execute all scenarios in `STAGING_INTEGRATION_PROTOCOL.md` and retain hash-bound evidence.
- [ ] Define availability and latency objectives.
- [ ] Alert on health/readiness, auth failure spikes, provider timeouts, 5xx, rate saturation, email failure, and sync failure.
- [ ] Monitor Vercel, Supabase Auth/database, email delivery, AI quotas, and domain/TLS expiry.
- [ ] Create operator runbooks for login, lost work, provider outage, incorrect feedback, account deletion, rollback, and security incident.
- [ ] Prove rollback to the previous deployment and record recovery time.
- [ ] Record production owner, Vercel project, Supabase project, registrar owner, secret owner, and rollback authority.
- [ ] Never state that a preview deployment updated production.

Observed on 14 September 2026: both public names resolved to a Namecheap parked page over HTTP; HTTPS failed from the review environment; `/api/health` was unreachable. Recheck from a second network and owner dashboards before DNS work.

## 29. CI, test coverage, and release evidence

- [ ] Commit or intentionally discard the current uncommitted CI/staging-evidence work before release freeze.
- [ ] Freeze Node 22.22.x, npm 10.9.8, lockfile, provider model IDs, migration set, and content hashes.
- [ ] Run lint, copy lint, typecheck, function validation, content audit, production dependency audit, 921 application tests, 25 eval tests, ask eval, grading gate, production build, and bundle budgets in one clean CI job.
- [ ] Run database reset, pgTAP, and SQL lint against the release migration set.
- [ ] Run local accessibility, authenticated golden, production smoke, and mobile journeys for the same revision.
- [x] Add/update feature-specific browser tests for the modal, reduced-motion landing, and mobile-mastery corrections.
- [ ] Test first session, return session, unconfigured account, partial account, offline, slow network, provider outage, expired auth, and Account A to Account B switching.
- [x] Keep updated selectors tied to stable roles and current accessible names.
- [ ] Generate a hash-bound evidence manifest for source SHA, commands, outputs, artifacts, environment, and timestamps.
- [x] Preserve exact counts and do not merge separate test scopes into a misleading total.
- [x] Mark older audit totals as historical.
- [ ] Require a clean or intentionally documented worktree for the candidate.

## 30. Product validation and launch discipline

- [ ] Define the core loop as choose a topic, attempt, review, retry, schedule, and return.
- [ ] Make the first useful learner-visible result possible within minutes.
- [ ] Define activation as a completed useful action, not a page view.
- [ ] Measure second attempt and delayed retry, not only generation volume.
- [ ] Test the complete first session with at least five target learners and record hesitation/failure points.
- [ ] Choose a narrow pilot curriculum, subject set, and population.
- [ ] Freeze matched pre, post, and delayed questions, scoring, control materials, product revision, and analysis plan.
- [ ] Obtain required consent/privacy approvals.
- [ ] Use independent scoring for outcome claims.
- [ ] Separate activity, confidence, performance, and delayed retention.
- [ ] Report null and negative findings internally as faithfully as positive ones.
- [ ] Interview learners who abandon the first or second session.
- [ ] Use beta evidence to remove, combine, or prioritise tools rather than continually adding surface area.

## 31. Controlled private-beta release gate

VertexED is ready for a controlled private beta only when every item below is checked:

- [ ] The candidate is committed, clean, built, and bound to an immutable revision.
- [ ] Public DNS, HTTPS, canonical redirect, production environment, and deep readiness are green.
- [ ] Database migrations, RLS, backups, restore, and recovery ownership are verified.
- [ ] One full real-account lifecycle and one two-account isolation run pass in production.
- [ ] Every advertised AI capability passes a live-provider test.
- [ ] Every advertised core feature completes its primary, failure, recovery, accessibility, responsive, and account-switch journeys.
- [ ] All explicit recording requests in section 1 are implemented or consciously rejected with an owner decision.
- [ ] The narrow launch curriculum is licensed, independently reviewed, and accurately represented in the coverage map.
- [ ] CI, database, accessibility, authenticated golden, mobile, and smoke suites are green for the same SHA.
- [ ] Privacy, terms, consent, retention, support, safeguarding, and incident ownership are approved.
- [ ] Monitoring, alerts, provider limits, email delivery, rollback, and cleanup ownership are active.
- [ ] The invitation states the product's actual limits and makes no unsupported outcome claims.

## 32. Broader public or paid launch gate

- [ ] Real beta traffic demonstrates acceptable reliability, latency, cost, recovery, and support load.
- [ ] D1 and D7 return plus delayed-retry completion are measured under the privacy-safe event contract.
- [ ] Selected curriculum coverage is materially complete and reviewed.
- [ ] Controlled evidence supports every public learning-outcome claim.
- [ ] Billing, authoritative quotas, tax, refunds, cancellation, reconciliation, and support are implemented and tested if payment is offered.
- [ ] Capacity, abuse handling, safeguarding, moderation, and support staffing can absorb intended launch volume.
- [ ] A final go/no-go review records owners, accepted risks, rollback triggers, and the exact production revision.
