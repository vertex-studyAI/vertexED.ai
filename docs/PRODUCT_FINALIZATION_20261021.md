# VertexED product finalization, 21 October 2026

Status: the bounded changes below are implemented, locally tested and deployed to production. The canonical Vercel alias serves the expected revision, deep service readiness passes, and anonymous production browser checks pass. The full requested product definition is not yet satisfied. Existing uncommitted content and notebook work has been preserved and included in verification, not attributed as newly authored in this pass.

## Implemented in this pass

- Replaced expired custom-domain runtime dependencies with the verified existing Vercel alias. Shared origin validation now rejects expired domains, credentials, paths, insecure remote origins and wildcard hosts. Updated CORS, invitation links, email URL fallback, metadata, sitemap, crawler files, health workflows and release probes. Legal/privacy contact links now use the same existing support mailbox as the footer.
- Connected the correct existing Vercel project under the supplied account. Updated its production APP_URL and provisioned the missing durable-rate-limit salt without exposing it. No production secrets were downloaded.
- Made Blue a true light theme and the default for new preferences, retaining saved choices and Midnight. Corrected the calculator's danger-text contrast and landing CTA colour after visual/browser checks.
- Reorganised the landing feature section around nine actual study destinations, with specific descriptions and an AP entry point.
- Gave Apex a history sidebar, responsive conversation workspace and multiline composer. Enter sends; Shift+Enter inserts a newline; composition events do not submit prematurely. Existing conversation persistence, citations, export, conflict recovery and account boundaries remain intact.
- Added an on-device exact polynomial derivative checker to Answer Reviewer. It identifies the first non-equivalent submitted derivative expression, accepts expanded/factored alternatives and exact fractions, explains the specific unreduced-power pattern when justified, and abstains on unsupported syntax. The arithmetic engine loads only on request, within the existing route bundle budget. It does not award marks or update mastery.
- Expanded the derivative-definition lesson from 8 to 25 original questions (17 added), covering limits, secants, tangents, units, continuity, piecewise differentiability and approximation/measurement errors. Regenerated the shared library and coverage receipts; preserved editorial holds.

## Curriculum and question inventory

The exact reviewer accepts both `18x(3x^2+1)^2` and `162x^5+108x^3+18x` as the derivative of `(3x^2+1)^3`. For `3x^4-2x+7`, it identifies `12x^4-2x` as a mismatch against `12x^3-2`. Inputs such as `sin(x)`, variable denominators and prose steps receive an unsupported result, rather than a fabricated analysis. These examples are covered by the arithmetic regression suite.

The current authored foundation library contains 42 lessons across 19 subjects, 27,877 note words, 154 worked examples, 301 questions and 344 flashcards. Only derivative-definition reaches the 25-question target; the other 41 lessons do not. AP inventory has 42 courses, 274 modules and 567 questions. MYP has 17 subjects, 205 lessons and 616 questions. Shared candidate mappings must not be counted as additional unique questions.

There are zero approved static assets, zero approved foundation lessons and zero independently verified complete courses. The reader and content pipeline are implemented and tested with isolated fixtures; public builds retain review holds. Independent subject/answer review and exact publication approvals are still required.

[Exact subject, topic, question and revision tables](evidence/CURRICULUM_INVENTORY_20261021.md) accompany the machine-readable coverage, syllabus and scope reports. The older report filenames remain for compatibility; their contents were regenerated from the current source.

## Nine flagship modules: verified scope and limits

| Module | Current implementation and local evidence | Remaining limits |
| --- | --- | --- |
| Learn | Course directories, foundation reader, notes, diagrams, worked examples, recall, practice, bookmarks, export and recovery; reader browser journeys pass | Draft lessons remain held; no complete curriculum claim |
| Exam Wiki & Prep | Existing exam context, original drills, time-boxed preparation and study continuation exercised in the main journey | No licensed past-paper bank or exam prediction claim; subject coverage incomplete |
| Question Bank & Paper Maker | Existing original-paper generator, validation, review/export and saved-work boundaries retained; main study journey exercises the workflow | Live provider quality and full 25-question coverage not certified |
| Answer Reviewer | Existing provisional rubric feedback plus new exact polynomial checks; seven arithmetic regression tests and responsive browser checks | Not a general proof checker; no reliable arbitrary row-operation/essay diagnosis claim; no official grading |
| Apex AI Tutor | New workspace/composer; saved conversations, sources, export, account isolation and stale-device conflict tests | Live tutoring quality and provider success not certified by fixtures |
| Study Planner | Manual calendar/task flows, clash rejection, midnight handling, stale AI-result protection and persistence tested | No new external calendar write integration or notification delivery certification |
| Study Zone | Timer, pause/resume, refresh, session notes, completion, Pomodoro, storage recovery and account switching tested | Real microphone/ambient-audio/device permissions not certified |
| Smart Notes | Existing notebook sources, editable study sets, version retention, generation failure recovery and notes-to-study workflows tested | Live transcription service and classroom recording consent require actual device/provider verification |
| Flashcards & Quizzes | Existing deck creation, recall, practice saving, quizzes and conservative evidence/mastery boundary tested | Authored curricular decks remain held; generated scores do not become verified mastery |

## Local acceptance evidence

- Application suite: 1,806 passed, 0 failed. Earlier stale receipt/domain/email expectations were corrected; no gate was weakened.
- Evaluation unit suite: 25 passed. Synthetic grading regression: 6/6 decisions correct, no false verified results. These are contract tests, not live model quality measurements.
- Broader browser suite: 43 passed, 3 calculator-contrast failures. The correction run passed all 7 selected tests, including all 3 formerly failing sizes. This establishes a pass for all 46 selected scenarios across the two recorded runs.
- Apex/reviewer final Chromium, Firefox and WebKit run: 15 passed, 0 failed.
- TypeScript, ESLint, copy lint (523 files, 0 findings), content audit and production build passed. Production dependency audit found no high or critical vulnerabilities.
- Frozen initial/total bundle budgets and critical-route growth checks passed after deferring the exact arithmetic module. No performance threshold was increased.
- Published-content inspection passed with zero leaks of held teaching bodies. Source secret scan passed after two narrowly documented synthetic test false positives were reviewed.
- Captured and inspected 1440px, 1024px and 390px layouts; exercised keyboard controls, reduced motion and theme switching; made a correction pass for overlap, contrast and input geometry.

Browser tests use explicit synthetic accounts and provider responses. They do not establish production OAuth, real account isolation in Supabase, live AI output quality, email delivery or transcription success.

## Deployment and provider state

Existing project: `vertex-ed-ai`, project ID `prj_0ypTk8puthIzjUY59EhhQZuqyTVQ`, team `ryan-gomezs-projects-5a5ab995`. Current verified alias: https://vertex-ed-ai.vercel.app. The project was identified from Vercel metadata, repository deployment records and the live VertexED health response.

Before this release the alias reported revision `e9eb3b7b1eb46521045798fd50826b8de78f3f74`, with deep readiness degraded. Read-only Supabase readiness checks passed all six schema/storage/RPC indicators. No schema migration or production data deletion was performed.

An isolated release checkout under `.release-work/product-finalization-20261021` preserves the main working branch/index. The deployed source revision is `200c0b17f61a53de0dff5ae62e088d274d4b9ac3`. The source snapshot is committed on `codex/product-finalization-20261021` inside that checkout; no GitHub push was performed. This post-release report and evidence were updated after the deployed commit.

- Vercel deployment `dpl_8CSsxNpkxcb8n4ptwAkheKK6ewK7` reached **READY**, target **production**. [Deployment record](https://vercel.com/ryan-gomezs-projects-5a5ab995/vertex-ed-ai/8CSsxNpkxcb8n4ptwAkheKK6ewK7).
- [Production application](https://vertex-ed-ai.vercel.app) serves that exact revision in health JSON and revision headers. The canonical alias was checked directly; no claim relies on the expired custom domains or a preview URL.
- Live health returned 200/alive, deep readiness returned 200/ready, and unauthenticated agents returned 401. [Read-only gate receipt](evidence/production-gates-20261021.json).
- All deployment smoke checks passed: expected revision, HEAD headers, homepage, unknown API 404, malformed waitlist input 400, three authenticated API boundaries 401 and untrusted CORS 403. Same-origin requests from the canonical alias returned 200 with the exact allow-origin header.
- Real anonymous Chromium checks passed all 12 checks: landing at 1440/1024/390, all nine module links, eight protected-route redirects and the public library. No browser page errors occurred. Production screenshots were captured and inspected at all three widths. [Browser receipt](evidence/production-browser-20261021.json).
- The first deployment was blocked by Vercel because the local Git identity used `youremail@example.com`. Correcting the release commit author to the supplied project-owner account resolved the block. No team permission or deployment protection was weakened.
- Vercel retains its existing custom-domain aliases in project metadata. The application no longer depends on them. The secondary team-qualified Vercel alias did not expose the application revision anonymously and is not the verified public entry point.

## Open production and coverage checks

Supabase dashboard access was supplied after deployment. The subsequent inspection confirmed an expired Site URL and missing recovery/invitation callback variants; see the follow-up below. Signup, OAuth, password recovery and email confirmation must be exercised against the production URL before claiming end-to-end authentication readiness. Resend sender/API configuration was absent from the listed production variables, so waitlist email delivery is not certified. No live AI-quality or transcription evaluation has been completed. Independent editorial review, complete versioned curriculum maps, authorised past-paper licensing, and most 25-question-per-subtopic targets remain open.

The hosted install reported 10 dependency audit findings (4 moderate, 6 high) across the full build dependency tree. The separate production dependency audit passed with no high or critical findings. Development/build dependency remediation remains open; no force upgrade was applied during release.

Automatic approval review rejected downloading the production environment to a local file because it would store production API/service-role secrets. That action was not retried through another mechanism. Release preparation continued using variable names, read-only schema metadata and the hosted build environment.

## Authentication configuration follow-up, 21 October 2026

The user signed into the correct Supabase project. The dashboard showed Site URL `https://www.vertexed.app` and seven allowlist entries: the expired custom-domain callback, the exact plain Vercel callback, and five local development entries. The browser connection failed during the attempted Site URL save and remained unavailable after reconnect/reset attempts. A subsequent public invalid-token probe confirmed that the fallback still points at the expired domain. No successful configuration mutation is claimed.

[Live redirect probes](evidence/auth-redirect-probe-before-20261021.json), using invalid tokens only, returned:

| Requested callback | Observed destination | Result |
| --- | --- | --- |
| `https://vertex-ed-ai.vercel.app/auth/callback` | Same origin and path | Allowed |
| `https://vertex-ed-ai.vercel.app/auth/callback?recovery=1` | `https://www.vertexed.app/` | Required variant missing |
| `https://vertex-ed-ai.vercel.app/auth/callback?invite=1` | `https://www.vertexed.app/` | Required variant missing |
| `https://untrusted.example/auth/callback` | Default Site URL | Untrusted target rejected |

The required dashboard correction is concrete: set Site URL to `https://vertex-ed-ai.vercel.app`; retain the existing plain Vercel callback; add the two exact query variants above; remove `https://www.vertexed.app/auth/callback`; preserve trusted local development entries. Do not add wildcard preview domains. Verify saved values with the same probes before reporting success.

[Public auth settings](evidence/auth-public-settings-20261021.json) returned HTTP 200 with Google and email enabled, direct signup disabled, email auto-confirm disabled and anonymous sign-in disabled. This is configuration evidence, not a completed login. No real account, email or session was created by these checks. The passing service readiness endpoint does not detect the dashboard redirect misconfiguration. Authentication acceptance remains blocked pending the correction and real-user journeys.

Updated the active production launch checklist and SQL-check comments to the required Vercel configuration. Historical deployment reports remain unchanged.
