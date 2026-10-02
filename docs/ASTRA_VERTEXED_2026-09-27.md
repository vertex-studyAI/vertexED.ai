# VertexED ASTRA execution scope and evidence map

27 September 2026. Applies only to megaprompt 13 in the supplied 22-prompt document.
Production decision: **NO-GO**. This is product completion and regression work, not a research-paper project.

## Starting point

Branch `codex/final-release-export-20260925`, HEAD `6a20571a` on arrival. Six tracked files and three untracked paths were already changed. The initial status and binary diff are preserved locally under `ci-evidence/astra-20260927/`. Existing user changes are not attributed to this pass. `DO_NOT_USE_AS_CANONICAL.md` still applies. The runtime boundary is `VERTEXED_REPO_ISOLATION.md`.

The recent product rebuild already supplies the study desk, original-bank practice, mistakes, concept evidence, Today recommendations, planner, notebooks, search, saved work, Apex, recovery and study games. This pass strengthens that core; it does not replace the identity or claim those earlier features as new.

## Prompt-to-evidence checklist

| Requirement | Work and evidence | Remaining boundary |
| --- | --- | --- |
| 1. Signup to learning journey | Auth-return, authenticated golden, learning and desk browser suites; auth and onboarding source inspected | Real invite, OAuth, recovery and email journeys on one deployed candidate need controlled accounts |
| 2. Inventory every AI feature | AI table below; registered handlers and server model policy inspected | Deployed model/environment overrides are not available here |
| 3. Real integrations or honest failure | Existing server provider paths and schema/grounding checks retained; offline API/fallback tests in full CI | No provider key is present in the local environment file; no live AI success is claimed |
| 4. Learner loop and resume | Practice session validation, stable question/attempt references, stale-tab protection and copyable recovery implemented | Current practice session is device-local; attempt/mistake sync requires the live database |
| 5. In-app experience | Preserve substantial existing study-desk rebuild; collapse setup during a session, show subject/save/answer context and expose recovery | 54 browser-matrix cases pass; screenshots and keyboard checks are local fixture evidence |
| 6. Cross-reference isolation | Reject stale deep links, duplicate/unknown question IDs and misbound submitted IDs; account-bound session key; preserve newer tab copy | Real two-account/two-device RLS checks are still required |
| 7. Automated regression coverage | New session unit tests and browser recovery cases plus existing account isolation tests | Fixture tests do not prove deployed RLS or session revocation |
| 8. Billing/paywall | Runtime search found no payment or subscription implementation; no transaction attempted | Any later paid product needs entitlement and webhook acceptance |
| 9. Build/typecheck/lint/tests/E2E | Current commands and receipts recorded in `ASTRA_FINAL_REPORT.md` | Full live acceptance is separate from local checks |
| 10. Stabilise existing flow first | No unrelated feature, dependency, curriculum claim or production deployment added | Broader mandatory gates in `PUBLISHABLE_COMPLETION_CHECKLIST.md` remain open unless independently evidenced |

## AI feature inventory

All URLs below are same-origin API paths. Server authentication, consent/limits and ownership checks remain necessary even when provider configuration exists. `api/_lib/vertexAgents.js` supplies shared role instructions; `aiRouting.js` can select provider-scoped model overrides. These are code defaults, not assertions about models available or configured in production.

| UI / entry | API and provider/model configuration | Prompt/data dependency | Failure / fallback |
| --- | --- | --- | --- |
| Apex chat and companion learning cards | `/api/ask`; OpenAI by default (`gpt-4.1-mini`, fallback `gpt-4o-mini`) or explicitly selected NVIDIA models; quick/tutor/deep overrides in `modelPolicy.js` | `askPrompt.js`, tutor modes, bounded learner messages/context; companion parses bounded cards | Unconfigured 503, failed/empty generation 502; same-provider fallback only |
| Notes and flashcards | `/api/note`; OpenAI `NOTE_MODEL` (existing fine-tuned default), `NOTE_FALLBACK_MODEL` (`gpt-4o-mini`); flashcard routing | Notes Architect role, topic, supplied notes, course context | Explicit deterministic/partial generation metadata; not a successful model generation |
| Quiz and quiz grading | `/api/quiz`; OpenAI `OPENAI_MODEL` or `gpt-4o-mini`, routing by capability | Supplied notes, answer/question contract | Labelled deterministic generation fallback; grading is provisional |
| Planner AI suggestion | `/api/planner`; Gemini when configured (initial `gemini-2.5-flash`, bounded fallback), otherwise configured chat provider | Manual commitments/dates, validated schedule contract | Unavailable/error; manual task entry remains usable |
| Paper Maker | `/api/paper-generator`; OpenAI `OPENAI_MODEL` or `gpt-4.1` | Subject/context, permitted images, bounded paper schema | Labelled deterministic fallback, original practice only |
| Answer Reviewer and notebook practice review | `/api/review`; OpenAI `OPENAI_REVIEW_MODEL` / `OPENAI_MODEL` / `gpt-4.1-mini` | Normalised question/answer/rubric, structured grading and verified evidence contracts | Text-only degraded review; images without provider return 503, unreadable images 502; never convert model output into verified marks |
| Study notebook chat/summary/quiz/cards/map | `/api/notebook`; OpenAI `NOTEBOOK_MODEL` or `gpt-4o-mini` | Selected private source IDs/excerpts, per-mode schema and citation validation | 503 without configuration; invalid output or references 502; sources preserved |
| Study-guide tutor | `/api/study-guide-chat`; Gemini `GEMINI_STUDY_GUIDE_MODEL` or `gemini-3.1-flash-lite`, or configured OpenAI route | Editorially eligible retrieval passages and exact citations | Unavailable retrieval/configuration and unverifiable citations fail closed; zero approved guides in current audit |
| Board resource draft | `/api/board-resource`; OpenAI `BOARD_RESOURCE_MODEL` / `OPENAI_MODEL` / `gpt-4.1-mini` | Entered course context, independent draft instructions | 503 unconfigured; 502 failed/short output; not official syllabus evidence |
| Audio transcription and enrichment | `/api/transcribe`; OpenAI `gpt-4o-mini-transcribe`, enrichment `gpt-4o-mini` | Validated audio input, notes/cards enrichment contracts | Provider/input errors remain errors; no invented transcript |

`/api/agents` exposes the authenticated role registry, not an additional learner-generation feature. Original-bank diagnostics, deterministic maths checks, practice marks and Today rules are local algorithms, not extra live AI integrations.

## Data and claim boundaries

- Server `verifyAuthUser` checks the bearer token through `getUser`; saved-work queries include the verified user ID, including individual ID lookups, updates and deletion.
- The page is remounted per account/query. Session reads/writes use an explicit account key; stale storage snapshots pause editing and expose answers for copying. This is a conflict guard for observed storage changes, not an atomic multi-device database transaction.
- Six new unit cases cover malformed session recovery, IDs, visited questions, completed/exam navigation and stale writes. Browser cases cover stale storage, invalid records/links and quota failure.
- The 25-question original bank is limited coverage. Practice rules are not validated mastery measurements, and imported guides remain unapproved. No learning-gains study, paper, licence grant or subject review was generated.
- Full curriculum coverage, calendar/background scheduling, content rights/approval, safeguarding review, provider quality, live privacy/deletion, monitoring and restore/rollback are still tracked in the existing complete-product checklist. A local pass does not close them.
