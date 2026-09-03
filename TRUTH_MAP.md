# VertexED Truth Map

**Evidence date:** 2026-09-02

**Interpretation:** “verified” below means reproduced in this repository or its deterministic production-preview harness. It does not imply that the canonical live deployment serves this revision.

| Capability | State | Evidence boundary |
|---|---|---|
| Public product pages and navigation | **IMPLEMENTED + VERIFIED** | 32 responsive browser checks; keyboard, overflow and recovery-route coverage |
| Private-beta waitlist submission | **IMPLEMENTED + VERIFIED** | Handler validation, rate limiting, honeypot and failure-path source tests |
| Team invitation email ownership | **IMPLEMENTED + VERIFIED** | Invite creates no caller-supplied password account; verified callback session required |
| Approved-link account creation | **IMPLEMENTED + VERIFIED** | Deterministic end-to-end golden journey plus handler tests |
| Email/password login and logout | **IMPLEMENTED + VERIFIED** | Authenticated golden journey signs out, signs in and resumes the originating work route |
| Google OAuth / identity linking | **IMPLEMENTED + UNVERIFIED** | Source contracts pass; canonical live provider journey not run for this candidate |
| Password recovery and invite password setup | **IMPLEMENTED + VERIFIED** | Verified-event/session markers, shared password policy and sign-out-before-success tests |
| Live recovery email delivery | **PARTIAL** | Client/server flow exists; canonical email-provider delivery not certified |
| Onboarding and curriculum profile | **IMPLEMENTED + VERIFIED** | Golden journey selects board, grade and subject and reaches dashboard |
| Account isolation | **IMPLEMENTED + VERIFIED** | Ownership/RLS contracts and account-scoped storage tests; current live cross-account denial still pending |
| Dashboard study loop and saved-work resume | **IMPLEMENTED + VERIFIED** | Golden journey resumes note and quiz-review artifacts after logout/login |
| Study Planner | **IMPLEMENTED + VERIFIED** | Persistence, ownership, accessible editing and golden planner-save coverage |
| Notetaker, flashcards and quiz | **IMPLEMENTED + VERIFIED** | Provider/degraded-mode tests and authenticated notes→quiz→grading journey |
| Evidence-bound grading and Answer Reviewer | **IMPLEMENTED + VERIFIED** | Exact-evidence, confidence, escalation and score-contract tests |
| Paper Maker and mock-exam handoff | **IMPLEMENTED + VERIFIED** | Deterministic paper contract tests; labeled Paper Maker controls added to golden journey |
| Study Notebook | **IMPLEMENTED + VERIFIED** | Account ownership, accessible controls, sync ordering and modal tests |
| Apex tutor and study-guide chat | **IMPLEMENTED + VERIFIED** | Auth, cancellation, history and request-contract tests; live provider quality not certified |
| AI provider availability/quality in production | **IMPLEMENTED + UNVERIFIED** | Requires live keys, quotas and canonical deployment evidence |
| Deterministic no-provider fallback | **IMPLEMENTED + VERIFIED** | Note and paper fallbacks are bounded, provenance-marked and tested against invention |
| API authorization and origin protection | **IMPLEMENTED + VERIFIED** | Handler and dispatcher tests cover 401/403 behavior and payload limits |
| User-content persistence API | **IMPLEMENTED + VERIFIED** | Owner-scoped CRUD, idempotency, replay and conflict tests |
| Production database schema and RLS | **IMPLEMENTED + UNVERIFIED** | Migrations and tests exist; exact current production state not recertified for this candidate |
| Build revision identity | **IMPLEMENTED + VERIFIED** | Required stamps fail closed; local/CI source neutrality survives a complete build |
| Dependency security | **IMPLEMENTED + VERIFIED** | `npm audit --omit=dev --audit-level=high`: zero vulnerabilities |
| Bundle performance budgets | **IMPLEMENTED + VERIFIED** | All four frozen gzip budgets pass with zero violations |
| Accessibility baseline | **IMPLEMENTED + VERIFIED** | 34 browser checks pass with 2 inapplicable skips; WCAG AA token-pair checks pass |
| Canonical Vercel deployment | **BLOCKED** | No authorized proof that `www.vertexed.app` serves this exact candidate |
| Canonical authenticated production journey | **BLOCKED** | Requires canonical Vercel/Supabase access and approved disposable identities |
| Quantitative learning efficacy | **EXPERIMENTAL** | No controlled learner outcome evidence; publication claims are prohibited |
| Unrestricted public signup | **PLANNED** | Product intentionally remains private beta; this is not a current defect |

## Release statement

`SOURCE_VERIFIED=true`

`DETERMINISTIC_BROWSER_VERIFIED=true`

`DEPLOYED_VERIFIED=false`

`OUTCOME_VERIFIED=false`

The truthful current description is: **VertexED is a locally verified, end-to-end private-beta edtech product candidate awaiting canonical deployment, production-data and real-account certification.**
