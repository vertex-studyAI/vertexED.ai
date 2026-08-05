# VertexED activation analytics

This document defines the small, privacy-safe event set used to measure whether the production journey works after deployment.

## Principles

- Track completed product actions and fixed operational categories, not private study content.
- Never send email addresses, usernames, user IDs, prompts, answers, messages, tokens, passwords, invite codes, URLs containing user data, or free-form user text.
- Keep properties to fixed categories, booleans, and counts.
- Analytics failure must never block signup, onboarding, or another product action.
- Page views remain handled by the mounted Vercel Analytics component.
- Custom events are collected only when supported and enabled by the active Vercel plan.

## Event contract

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `Waitlist Joined` | The waitlist API accepts a submission | `method` |
| `Account Created` | Invite-backed account creation and automatic login complete | `invite_type` |
| `Onboarding Completed` | Profile metadata and the first planner snapshot are saved | `curriculum`, `subject_count`, `planner_sync` |
| `AI Request Completed` | An authenticated POST to a fixed AI feature endpoint returns or fails at the network boundary | `feature`, `outcome`, `status_class`, `duration_bucket` |

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
5. Subsequent protected feature page views

Use `AI Request Completed` separately to compare success rate and latency bucket by feature without joining to user identity or study content.

## Verification

- `tests/product-analytics.test.mjs` verifies event-name bounds, sensitive-key removal, the fixed AI endpoint allowlist, status reduction, and duration bucketing.
- The canonical `npm run ci` command runs the analytics tests through `npm test` and verifies the application build.
- In production, confirm events in the Vercel Web Analytics events panel and compare counts against non-secret aggregate request evidence when production access is available.
