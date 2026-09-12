# VertexED activation analytics

This document defines the small, privacy-safe event set used to measure whether the production journey works after deployment.

## Principles

- Track completed product actions and fixed operational categories, not private study content.
- Never send email addresses, usernames, user IDs, prompts, answers, messages, tokens, passwords, invite codes, URLs containing user data, or free-form user text.
- Keep properties to fixed categories, booleans, and counts.
- Analytics failure must never block signup, onboarding, saving, retrieval, logout, deletion, or another product action.
- Page views remain handled by the mounted Vercel Analytics component.
- Custom events are collected only when supported and enabled by the active Vercel plan.

## Event contract

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `Waitlist Joined` | The waitlist API accepts a submission | `method` |
| `Account Created` | Invite-backed account creation and automatic login complete | `invite_type` |
| `Onboarding Completed` | Profile metadata and the first planner snapshot are saved | `curriculum`, `subject_count`, `planner_sync` |
| `First Core Action Completed` | The learner has received an actual learner-visible result from a supported core study workflow | `kind`, `entry`, `result` |
| `Planner Saved` | A planner snapshot is saved to cloud storage or falls back to device storage | `destination`, `cloud_status`, `task_count_bucket` |
| `Planner Retrieved` | Planner loading resolves to a cloud snapshot, device snapshot, or empty state | `source`, `cloud_status`, `task_count_bucket` |
| `AI Request Completed` | An authenticated POST to a fixed AI feature endpoint returns, times out, or fails at the network boundary | `feature`, `outcome`, `status_class`, `duration_bucket` |
| `ai_run` telemetry | A fixed AI capability returns or fails | `route`, `capability`, `errorClass`, `outcome`, bounded `durationMs` |
| `ai_feedback` telemetry | A learner rates an AI result | `route`, `capability`, `outcome`, fixed `feedback`, fixed `reason` |
| `Logout Completed` | The centralized logout operation succeeds or fails | `outcome`, `backend` |
| `Account Deletion Completed` | `DELETE /api/account` returns or fails at the network boundary | `outcome`, `status_class` |

## First core action categories

`First Core Action Completed` is a user-level activation event. It is deliberately separate from page views, CTA clicks, provider requests, generation starts, self-reported session checkboxes, and other intent signals.

Allowed properties are fixed enums only:

- `kind`: `deterministic_quiz`, `answer_review`, `mock_review`, or `practice_session`.
- `entry`: `onboarding_handoff`, `dashboard`, `planner`, or `exam_prep`.
- `result`: `completed` or `degraded`.

The event never includes subject, topic, score, prompt, answer, user ID, artifact ID, free-form feedback, provider/model identity, or raw error text. Unknown properties or enum values fail closed.

The client keeps an account-scoped device receipt before attempting the analytics emission. The account identifier exists only inside the local storage key; it is never included in the analytics payload. If the receipt cannot be written, the event is not emitted because VertexED cannot prove once-per-account deduplication. Analytics-provider failure still never blocks the completed product action.

A feature surface may call the recorder only after it can prove that a learner-visible result exists. Merely navigating from the first-session handoff to `/exam-prep`, opening a task, sending a provider request, or checking off a self-reported session block does not qualify.

## Account lifecycle categories

Account lifecycle events never include email, username, user ID, identity provider account, session data, deletion reason, raw server error, exact response status, or the account endpoint URL.

- `Logout Completed` records only `success` or `failure` and whether the path used the configured `supabase` backend or the local disabled-auth fallback.
- `Account Deletion Completed` records only `success`, `failure`, or `network_error`, plus a reduced status class such as `2xx`, `4xx`, `5xx`, or `network`.
- Account deletion matching is limited to the exact `/api/account` pathname with the `DELETE` method. Other delete operations are not counted.

These events measure whether users can leave safely without retaining an analytics identifier or exposing account data.

## Planner persistence categories

Planner persistence events never include task names, dates, times, subjects, notes, mode, snapshot timestamps, user identity, artifact IDs, or raw errors.

- `Planner Saved` records only whether the durable destination was `cloud` or `device`, whether cloud storage reported `saved` or `error`, and a task-count bucket.
- `Planner Retrieved` records only whether the selected snapshot came from `cloud`, `device`, or an `empty` state; whether cloud storage was `available`, `missing`, `invalid`, or `error`; and a task-count bucket.
- Task counts are reduced to `empty`, `1_3`, `4_7`, `8_15`, or `16_plus`.

These events make the save-and-return journey measurable without exposing schedule content.

## AI request categories

`AI Request Completed` records attempts for a fixed allowlist only:

- chatbot and study-guide chat;
- answer review;
- planner;
- notes, quiz, paper, and notebook generation;
- transcription;
- board-resource generation.

The event never records the request body, response body, prompt, answer, source text, user identity, exact URL, request ID, exact latency, or raw transport error. HTTP results are reduced to status classes such as `2xx` or `5xx`; latency is reduced to one of five fixed buckets. Network failures use `outcome=network_error`; the fixed client deadline uses `outcome=timeout`. Both use `status_class=network`.

Because chatbot fallback attempts can call more than one endpoint, these metrics represent provider/API attempts rather than unique user actions. Activation events and page views should be used for user-level funnel analysis.

Server-side provider-run logs use `vertexed.ai_provider.v1` and add only fixed `provider`, `model`, `status`, `capability`, `outcome`, and bounded duration fields. Neither client telemetry nor server provider telemetry includes prompts, answers, sources, or identity.

## Funnel query

The first production activation funnel is:

1. Page view of `/signup`
2. `Waitlist Joined`
3. `Account Created`
4. `Onboarding Completed`
5. `Planner Saved` for the starter planner, whether the durable destination is cloud or device fallback
6. Dashboard first-session handoff shown
7. `First Core Action Completed`
8. A second protected session
9. D1 return
10. D7 return

Cloud planner retrieval remains an important durability metric, but it is not required to count a learner who completed a useful device-backed first action while cloud sync was degraded.

Treat `Account Deletion Completed` as a separate safety and compliance journey rather than a desired activation step. Use `AI Request Completed` separately to compare success rate and latency bucket by feature without joining to user identity or study content.

## Verification

- `tests/product-analytics.test.mjs` verifies event-name bounds, sensitive-key removal, the fixed first-core-action schema and enum rejection, account-scoped once-only deduplication, fail-closed behavior when the receipt cannot be persisted, the fixed AI endpoint allowlist, status reduction, timeout categorization, and duration bucketing.
- `tests/planner-sync.test.mjs` verifies planner count bucketing and the fixed save/retrieval property allowlists.
- `tests/account-lifecycle-analytics.test.mjs` verifies exact endpoint matching, status reduction, and fixed logout/deletion categories.
- `tests/api-request-recovery.test.mjs` verifies the one-retry session contract and stable timeout error.
- The canonical `npm run ci` command runs the analytics tests through `npm test` and verifies the application build.
- In production, confirm events in the Vercel Web Analytics events panel and compare counts against non-secret aggregate request evidence when production access is available.
