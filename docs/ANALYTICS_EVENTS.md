# VertexED activation analytics

This document defines the small, privacy-safe event set used to measure whether the production journey works after deployment.

## Principles

- Track completed product actions, not private study content.
- Never send email addresses, usernames, user IDs, prompts, answers, messages, tokens, passwords, invite codes, or free-form user text.
- Keep properties to fixed categories, booleans, and counts.
- Analytics failure must never block signup, login, onboarding, or another product action.
- Page views remain handled by the mounted Vercel Analytics component.
- Custom events are collected only when supported and enabled by the active Vercel plan.

## Event contract

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `Waitlist Joined` | The waitlist API accepts a submission | `method` |
| `Account Created` | Invite-backed account creation and automatic login complete | `invite_type` |
| `Login Succeeded` | Email/password login completes | `method` |
| `OAuth Started` | The user starts Google OAuth | `provider` |
| `OAuth Completed` | A Google OAuth callback resolves to a session | `provider`, `next_step` |
| `Password Reset Requested` | Supabase accepts a reset request | `method` |
| `Onboarding Completed` | Profile metadata and the first planner snapshot are saved | `curriculum`, `subject_count`, `planner_sync` |

## Funnel queries

The first production activation funnel is:

1. Page view of `/signup`
2. `Waitlist Joined`
3. `Account Created`
4. `Onboarding Completed`
5. Subsequent protected feature page views

Authentication reliability can be reviewed through `Login Succeeded`, `OAuth Started`, and `OAuth Completed` without storing identity data.

## Verification

- `tests/product-analytics.test.mjs` verifies event-name bounds, primitive-only properties, and sensitive-key removal.
- The canonical `npm run ci` command runs the analytics tests through `npm test` and verifies the application build.
- In production, confirm events in the Vercel Web Analytics events panel and compare counts against non-secret Supabase aggregate totals when production access is available.
