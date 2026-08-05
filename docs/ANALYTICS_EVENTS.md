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
| `Planner Saved` | A planner snapshot is saved to cloud storage or falls back to device storage | `destination`, `cloud_status`, `task_count_bucket` |
| `Planner Retrieved` | Planner loading resolves to a cloud snapshot, device snapshot, or empty state | `source`, `cloud_status`, `task_count_bucket` |
| `AI Request Completed` | An authenticated POST to a fixed AI feature endpoint returns or fails at the network boundary | `feature`, `outcome`, `status_class`, `duration_bucket` |
| `Logout Completed` | The centralized logout operation succeeds or fails | `outcome`, `backend` |
| `Account Deletion Completed` | `DELETE /api/account` returns or fails at the network boundary | `outcome`, `status_class` |

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

The event never records the request body, response body, prompt, answer, source text, user identity, exact URL, request ID, or exact latency. HTTP results are reduced to status classes such as `2xx` or `5xx`; latency is reduced to one of five fixed buckets. Network failures use `outcome=network_error` and `status_class=network`.

Because chatbot fallback attempts can call more than one endpoint, these metrics represent provider/API attempts rather than unique user actions. Activation events and page views should be used for user-level funnel analysis.

## Funnel query

The first production activation funnel is:

1. Page view of `/signup`
2. `Waitlist Joined`
3. `Account Created`
4. `Onboarding Completed`
5. `Planner Saved` with `destination=cloud`
6. A later `Planner Retrieved` with `source=cloud`
7. Subsequent protected feature page views
8. `Logout Completed` with `outcome=success`

Treat `Account Deletion Completed` as a separate safety and compliance journey rather than a desired activation step. Use `AI Request Completed` separately to compare success rate and latency bucket by feature without joining to user identity or study content.

## Verification

- `tests/product-analytics.test.mjs` verifies event-name bounds, sensitive-key removal, the fixed AI endpoint allowlist, status reduction, and duration bucketing.
- `tests/planner-sync.test.mjs` verifies planner count bucketing and the fixed save/retrieval property allowlists.
- `tests/account-lifecycle-analytics.test.mjs` verifies exact endpoint matching, status reduction, and fixed logout/deletion categories.
- The canonical `npm run ci` command runs the analytics tests through `npm test` and verifies the application build.
- In production, confirm events in the Vercel Web Analytics events panel and compare counts against non-secret aggregate request evidence when production access is available.
