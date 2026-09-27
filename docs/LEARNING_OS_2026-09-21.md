# VertexED learning-system implementation, 21 September 2026

## Status and claim boundary

This is a substantial local implementation in the user-selected WIP checkout, not a production release or completion of every item in the platform brief. Existing uncommitted changes were preserved. No remote database migration, Git push, production deployment, DNS edit or learner-data mutation was performed. The 25-question original bank is limited coverage; it must not be described as a complete syllabus or a validated diagnostic instrument.

## 1. Initial audit

Baseline: React 19, Vite 7, React Router 7, TypeScript, Node 22, Supabase Auth/Postgres, server-side AI adapters and a 22-route Vercel catch-all. Existing systems already included onboarding/curriculum preferences, notebooks and text imports, generated notes/quizzes/cards, spaced repetition, saved work, paper timer/navigation, planner scheduling, Focus, account export/deletion and privacy-limited telemetry. No implemented billing system or offline application-shell service worker was found.

The main gaps were disconnected transient practice, missing concept/mistake persistence, categorical Today recommendations with no time budget, incomplete personal search, inference-depth-only tutor modes, browser alerts and one optional game. Existing auth, migrations, cache headers, provider limits, output validation, modal controls and recovery contracts were inspected and reused. Initial file status is retained in the evidence directory. See INITIAL_AUDIT.md there for prioritisation before architectural changes.

## 2. Bugs fixed

- Blank or ambiguous numeric answers no longer become zero; empty MCQ answers cannot become choice zero.
- Practice history is account scoped. Signed-out examples explicitly remain examples.
- No selected subject is called the weakest without measured evidence.
- A handcrafted classifier weight is no longer displayed as a calibrated probability.
- Notetaker failures use the existing toast system instead of blocking browser alerts.
- Tutor/game selects have explicit labels. Reduced-motion tutor and focus navigation avoid smooth scrolling.
- Floating companion/feedback controls move outside Today and learning reading columns. The correction pass caught and fixed an uncontained companion pseudo-element intercepting clicks.
- Desktop planner calendar/timeline positioning no longer masks the New Task control or other content; a normal-flow, seven-day agenda has readable native actions. Completed tasks no longer disappear, reopening cannot create a collision, and the daily dashboard score uses actual task/habit completion with an empty state when none are scheduled.
- Health tests inject the build stamp, so running tests after a build does not incorrectly treat a valid generated revision as absent.

## 3. UI changes

Today is named in navigation and places an availability-aware plan ahead of other study work. Existing secondary planner/revision actions remain under a disclosure. /today aliases /main. /learn is a protected, lazy-loaded learning workspace with practice, knowledge, mistakes and progress views. Blue/white identity, original logo, current icon refinement and existing tool names remain. Concept evidence uses a small readable grid rather than a dense graph canvas. Tables scroll within their own region on narrow screens.

## 4. Learning systems

- Original-bank question metadata: concepts, skill, difficulty, one-mark scoring, provenance, calculator policy and estimated time.
- Subject/topic/concept diagnostics adapt the next item to prior evidence and difficulty, without requiring an AI call.
- Diagnostic, targeted, mixed, exam, rapid recall, prerequisite repair and challenge selection modes.
- Attempts retain response, confidence when supplied, hint use, visible-page time, date and question identity.
- Concept states: unassessed, developing, weak and mastered. Mastery requires three recent unassisted correct responses spanning two questions and two days; repeated one-item success cannot promote mastery. The rules are transparent heuristics, not validated educational measurements.
- Review intervals use bounded 1–30 day heuristics and explicitly avoid retention-probability claims. Existing card scheduling remains intact.
- Optional mistake reflections retain cause and corrected reasoning. Retry history derives from real attempts.
- Exam sessions retain answers/flags/index and deadline across refresh, lock on expiry, defer feedback, then report marks, topic errors and timing. They use original material, not copyrighted exam papers.
- Today ranks entered tasks, overdue work, concept gaps, prerequisite weakness, due review intervals, upcoming subject assessments and cards; an editable time budget separates planned work from backlog.
- Progress shows recorded evidence and limits. It does not infer predicted grades, attention, scientific learning gains or whole-exam readiness.
- Planner now supports 2–12 explicit weekly commitments, per-task deadlines/priorities, opt-in automatic missed-task rescheduling in an entered daily window with a daily study limit and 14-day horizon. It runs when the planner opens and each minute while open, preserves fixed appointments, explains moved tasks, and keeps unplaceable work in backlog. A task can be manually locked. Completed history supports reopening and reports planned duration explicitly, not measured study time.
- Five optional games: existing Revision Stack plus number tiles, memory pairs, sequence recall and reaction. Lazy-loaded, silent, pauseable, keyboard/touch controls; study widgets remain mounted.

## 5. AI improvements

Apex now supports Explain, Teach, Quiz, Hint, Solve With Me, Challenge Me and Exam Mode independently of Quick/Tutor/Deep inference depth. Mode instructions are bounded server-side selections. Default tutor instructions apply even without a page context. Guided modes ask for an attempt and reveal steps progressively; feedback does not pretend to know unseen reasoning. Existing source grounding, provider routing, request cancellation, consent, errors and account-scoped conversation storage remain. Local prompt/fixture checks do not establish live-provider compliance or pedagogical quality.

## 6. Backend and database

New practice_attempt and practice_mistake state types use the existing bearer-authenticated, owner-filtered learner-state API, durable outbox and revision conflict handling. Server validation recalculates correctness from the fixed original answer bank and rejects invalid records/identity mismatches. Local saves precede queued cloud updates. Corrupt local records remain preserved and block replacement. Account export/deletion cover the same account-prefixed storage.

Migration: 20260921141447_learning_practice_state.sql extends the existing check and service-only invoker RPC without granting new browser privileges. Added SQL tests for supported state types, service-only execution and retained RLS. Migration is NOT applied remotely. An isolated local Supabase database on alternate ports failed during base-schema initialisation with LegacyDbSetupError / container exit 255, before repository migrations. Database acceptance is therefore unverified; SQL text checks are not a substitute.

## 7. Performance

No dependency added. The final normal-flow planner replaces duplicated day/mobile/week task markup and removes its legacy overlay CSS. Learning workspace and games are lazy-loaded. Concept bank, notebook/card/session search and practice hydration load on demand. After correction, initial JS is 237,138 bytes gzip, initial CSS 34,703 bytes and total JS 926,222 bytes; frozen budgets pass. These are build measurements, not real-user Core Web Vitals. The first implementation added the entire bank to initial JS; the correction removed that regression.

## 8. Security and privacy

Preserved independent bearer verification and owner filtering, RLS/service-only contracts, durable rate limits, no-store private APIs, same-origin AI requests, sanitised Markdown and bounded inputs. New API records are normalised against fixed question IDs; confidence/time are explicitly self-reported/browser-derived. Search reads only the current account's notebook, card, quick-note and main-session chat keys. Search contents stay local. No new third-party analytics, uploads, secrets or provider keys were added. Full npm audit reported zero findings across production and development dependencies.

## 9. Domain and deployment

Live read-only checks: vertexed.app and www.vertexed.app both resolve to 2.59.170.20 / 104.219.250.37 and fail TLS before HTTP. No AAAA answers were returned in this probe. The configured legacy vertex-ai-rho.vercel.app redirects to the failing custom domain. The configured fallback vertex-ed-ai.vercel.app responds, and /api/health reports alive at revision 2ca208c8ffd10c83005f3afe65057bc847277d5f. Its public readiness endpoint returns HTTP 503, degraded with redacted detail. Liveness is not authenticated readiness, nor the source revision of this local WIP. An initially tested similarly named host vertex-ed.vercel.app returned DEPLOYMENT_NOT_FOUND and is not the configured fallback. DNS/Vercel ownership must be verified before changing records.

## 10–11. Tests and build

Complete Node 22 CI passed (ci-planner-final.log): ESLint, copy lint (zero findings), TypeScript, route validation, content provenance, production dependency gate, 1,115 application tests, 25 evaluation tests, 13 fixture tutor prompts, synthetic grading contract checks, production build and frozen bundle budgets. Full npm audit also found zero vulnerabilities. Content provenance still reports 245 files, zero approved and 53 flagged; a green build is not editorial approval.

All 31 Chromium browser scenarios passed. Browser receipts are in browser-full-final.log; the final planner launcher correction is additionally checked at all three widths in browser-planner-verified.log. Coverage includes successful/rejected implicit auth return, delayed password recovery, account storage recovery, manual planner collision checks, AI suggestion races, weekly commitments, rescheduling/completion history, and 1440/1024/390 responsive light/dark/reduced-motion views, persisted diagnostic answers, mistakes, concept evidence, Today budgets, Cmd/Ctrl+K search, exam flags/deferred feedback/expiry, corrupt-record preservation, tutor mode payloads, games, and regressions for existing notebooks, reviews, saved work and landing controls. Tests use explicit local account/API fixtures; no real signup, OAuth, production RLS or live AI result is claimed. Screenshots are inspected and copied into the evidence directory after the final run.

## 12. External release blockers

Custom-domain TLS/DNS ownership, a successful isolated migration/RLS replay, remote application of the reviewed migration, live approved-account signup/OAuth journeys, live-provider quality/cost checks and exact-revision canonical deployment remain release gates. The WIP checkout must not be promoted as if it were the separately maintained canonical candidate.

## 13. Exact changes

See ci-evidence/learning-os-20260921/changed-files.txt for files edited in this implementation. It separates this session's work from the extensive pre-existing dirty tree. source-manifest.json hashes the final files. Generated audit receipts in ci-evidence/npm-audit were also refreshed by the canonical audit command. No dependency or lockfile change was made.

## 14. Remaining product work / highest-value improvements

The full brief is not yet complete. These are product limits, not external blockers:

1. Expand and independently review question/lesson coverage across curricula and course levels, including Economics, English and languages. Current data adapters expose curricula/levels/components, but a complete configurable syllabus editor, IA tracking and evidence-based predicted-grade workflow are not implemented.
2. Extend the bounded planner with calendar-provider integration and background scheduling. Weekly occurrences and opted-in rescheduling now work locally and sync through existing snapshots; there is no background scheduler when the application is closed.
3. Extend notebook imports to securely parsed PDFs/worksheets and richer image/tag/inter-note authoring. Text/Markdown/CSV and existing Markdown/math rendering remain supported.
4. Unify all historical practice sources into the new concept model with valid provenance; current generated/teacher-marked workflows remain separate and are not silently converted into trusted diagnostic evidence.
5. Add durable cross-device conversation storage and an offline application shell. Current notes/cards/drafts remain on the device, cloud state retries when available, and chat history is browser-session scoped.
6. Validate diagnostic reliability, misconception classifications, interval rules and daily usability with real learners. Do not advertise learning gains or scientific precision from these engineering checks.

These limits are explicitly retained rather than hidden behind disabled controls, fabricated data or claims of completion.
