# VertexED experience architecture

## Boundaries

The curriculum identifies the task. The student attempts it. Review produces provisional feedback. Only explicitly verified marks enter the measured-evidence store. A retry targets the recorded gap. Never convert AI confidence, page visits or a self-check into a verified grade.

The existing account-scoped artifact, weakness and retry stores remain canonical. The new practice panel does not introduce a second progress store. Its scratch answer is deliberately ephemeral and this is disclosed beside the input.

## Application and account

`Signup → POST /api/waitlist → waitlist.application_profile → admin approval → invitation verification → auth_user_id`

The application holds school (optional), country, curriculum, grade/year, age in whole years and explicit storage consent. Server validation is authoritative. Unknown fields are discarded. The private beta currently accepts ages 13 and over. This is not a substitute for jurisdiction-specific parental-consent review before a wider launch.

The profile is retained on the original application when the invitation becomes an account. It is not copied into public user metadata or prompts. Admin list access uses the existing admin gate. Account export includes the profile only for the authenticated account. Existing account deletion removes the linked application. Legacy application rows may have a null profile.

Migration: `20260913044839_waitlist_application_profile.sql`. Deploy the migration before the new handler and form. Do not ship the form alone against an old schema. No production migration has been applied by this pass. Local SQL execution is pending a running Docker database.

## Capability routing

`api/_lib/aiRouting.js` is a stateless selection policy. The server, not a request-body field, chooses capability. It reads no personal application information and keeps no conversation memory.

| Work | Policy | Boundary |
| --- | --- | --- |
| Tutoring | Economy for routine questions; advanced for long or explicit complex reasoning | Existing bounded history and source-citation validation |
| Quiz generation | Complexity based on bounded source text | Structured question validation and labelled deterministic fallback |
| Quiz/answer grading | Advanced | Provisional marks and evidence verification unchanged |
| Notebook | Economy unless custom instruction signals complexity | Supplied source IDs only; structured output validation |
| Paper generation | Advanced for text | Image requests retain the existing vision model |
| Notes | Complexity-aware primary | Existing explicit fallback models and degraded metadata |
| Flashcards | Economy | Existing source and output boundaries |
| Planner | Economy, capability override available | At most two model candidates; schedule remains editable |
| Study-guide tutoring | Complexity-aware | Approved retrieved passages required; no passages means no fabricated answer |
| OCR/audio transcription | Dedicated existing models | Not downgraded to generic text models |

Settings are provider-scoped: `AI_OPENAI_ECONOMY_MODEL`, `AI_OPENAI_ADVANCED_MODEL`, equivalent `AI_NVIDIA_*` / `AI_GOOGLE_*`, and a capability override such as `AI_OPENAI_GRADING_MODEL`. Use real provider IDs, not Codex display names. No Astro or Terra Light API ID has been assumed.

`AI_OPENAI_ECONOMY_MAX_TOKENS` and its advanced/provider equivalents can lower supported callers' output caps, never increase them. The existing per-user rate limits, input bounds and request deadlines still apply. Planner and legacy note fallback paths retain their explicit output caps. Transcription keeps its dedicated audio model; its note and flashcard enrichment uses the shared router. This is an initial deterministic router, not an evaluated classifier or a financial spending limit. It does not yet calculate dollar cost or enforce a monthly account budget.

Before enabling model overrides: verify endpoint compatibility, structured JSON, vision support where applicable, latency, answer-quality fixtures and costs. Capability overrides allow a grading model to remain stronger without making routine chat expensive. Provider telemetry continues to exclude prompts, emails and school/age fields.

## Curriculum and exam preparation

The new `examPractice.ts` pack contains eight original editorial tasks: six MYP science exercises, one DP algebra-to-integration task and one AP accumulation task. Chemistry spans A/B/C/D practice. These are independent exercises, not official mark schemes, a complete syllabus or licensed past papers.

The practice interface follows: target selection, scratch attempt, worked reasoning, explicit checklist, transfer question. The existing verified-evidence store feeds an independent diagnosis summary. Partial-fraction weakness suggests coefficient matching before rational-function integration. Essay weaknesses suggest a claim/evidence/reasoning repair, not invented examiner preferences.

Competitor research informed short topic-led sets and clear question/solution navigation, not copied questions or layout. References: [RevisionDojo question bank](https://www.revisiondojo.com/features/questionbank), [Revision Village exam builder](https://help.revisionvillage.com/en/introducing-build-my-exam), [IB MYP sciences](https://ibo.org/programmes/middle-years-programme/curriculum/science/), and the linked OpenStax concept sources in each original exercise.

### Next evidence-dependent layers

1. Curriculum coverage registry: programme, version, subject, topic, criterion/skill, prerequisites and editorial status. Expand and independently review original content before marking it approved.
2. Paper metadata ingestion: licensed or user-authorised source, session, paper, topic, command term, marks and optional question reference. Never scrape protected question banks or claim a corpus that does not exist.
3. Descriptive trend analysis: show counts and sample sizes within the same syllabus and paper type. Past frequency does not establish the next paper's probability.
4. Grade projection: requires current boundaries, representative timed evidence, sufficient topic coverage and validation against later outcomes. Show uncertainty and never label a practice average as an official predicted grade.
5. Prerequisite graph: reviewed topic dependencies, evidence links and tested remediation chains. No automatic mastery transfer between related topics.

## Release state

This pass is local work, not a production deployment. Existing guide audit still reports 245 guide files, zero approved and 53 flagged for review. The new original exercise pack does not change those approval counts. Full curriculum coverage, validated forecasts, live provider certification, all requested visual effects and a production launch are not complete.
## School directory and graphing follow-through

New applications resolve an optional school through a private server-only directory. The SHA-256 identity uses a normalized school name and country, without fuzzy campus merging. Directory association never authorizes reading another learner's data. Unknown curricula have an explicit name field. The authenticated onboarding prefill reads only the current auth_user_id, aborts stale responses and never replaces an edited curriculum. Existing applications are not retroactively matched.

Apply the application-profile migration and `20260913062013_school_directory.sql` before releasing the new waitlist API. These migrations have not been applied by this local UI task. Directory identities are self-reported, not verified school memberships. Country aliases and spelling variants require a future reviewed reconciliation flow.

Desmos 2D supports the documented v1.11 API when `VITE_DESMOS_API_KEY` is configured. Instances are destroyed on tool/account transitions. Expression input is bounded; API failure falls back to an iframe. The 3D tool remains an iframe, not a claimed 3D API integration. Live API-key/CSP validation remains a release check. Reference: https://www.desmos.com/api/v1.11/docs/index.html
## Apex structured learning workspace

`ApexCommandBar` uses the existing authenticated `/api/ask` adapter, with a bounded JSON-card request. The local parser whitelists five card kinds and text fields, rejects malformed or oversized structures, and discards action/code fields. The existing sanitised Markdown renderer presents content. Student working is retained during card/layout changes and included in explicit Markdown downloads. It is not automatically saved to the cloud or a notebook.

The command subtree is keyed by account identity and aborts pending generation on unmount. Navigation supports only fixed notebook/planner/study-zone targets. Sign-in requests offer the existing Google OAuth flow behind explicit confirmation. Multi-action requests across OAuth are not automatically resumed: the interface says to reopen Apex and submit the study request after sign-in. Do not advertise universal autonomous app control.

The public cubic lesson is original sample content, not generated learner evidence or a demonstrated improvement in exam marks. Live model output quality and OAuth/provider configuration remain release validation steps.
