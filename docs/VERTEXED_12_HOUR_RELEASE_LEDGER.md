# VertexED 12-Hour Release Ledger

Run started: 2026-08-21 IST  
Isolated branch: `codex/production-strike-20260821`  
Base/source SHA: `3614446d836f452e77a4438c2086b01e8045b497` (`origin/main`)  
Release status: **RED**

## Source and deployment truth

- Canonical repository: `vertex-studyAI/vertexED.ai`; clean isolated clone created because the supplied workspace was an unversioned snapshot.
- Latest `main` release-gate job passed, but the overall CI run `32481664347` failed because production smoke never observed the expected revision.
- Live `https://www.vertexed.app/api/health` returns HTTP 200 and basic health JSON, but no immutable `revision` and no `X-VertexED-Revision` header.
- Both Vercel deployments for the base SHA failed: `vertex-ed-ai` deployment `dpl_6NY2bQ5cUuSssbsVczi6EfD2JZE1` and `vertex-ai` deployment `dpl_E6xU2iKzwMKKEcAdjicc718GkCz4`.
- The authenticated local Vercel account can see neither owning project, so causal deployment logs and canonical-domain ownership remain unavailable from this execution context.

## Blocker graph

1. **P0 auth ownership:** `main` lets a shared team code create an already-confirmed password account for an arbitrary email. This permits pre-claiming another person's address.
2. **P0 production identity:** both current production deployments fail; the older served function omits immutable revision identity; exact served source cannot be proven.
3. **P0/P1 auth hardening:** PR #420 contains production admin fail-closed work; PR #421 contains profile-integrity/login recovery work; PR #422 targets invite ownership but its exact head currently fails CI.
4. **Journey certification:** deterministic signup/login/onboarding/data persistence/recovery/account-isolation proof depends on a safe signup path and controlled mailbox/Supabase credentials.

## Actions

### A1 — Team-invite email ownership

- Problem: shared eligibility code is incorrectly treated as proof of mailbox ownership.
- Reproduction: new focused tests failed 3/3 on the base because the team path called `auth.admin.createUser` with caller email/password and `email_confirm: true` before email verification.
- Files changed: `.env.example`, `api/_handlers/signup-invite.js`, `api/_lib/inviteCode.js`, `src/lib/inviteAcceptance.mjs`, `src/pages/AuthCallback.tsx`, `src/pages/SetInitialPassword.tsx`, `src/pages/Signup.tsx`, and focused tests.
- Repair: shared codes now send a Supabase mailbox invite, the client sends no password on that path, password setup requires an invited and email-confirmed Supabase session, and unsafe/legacy shared-code configuration fails closed.
- Commit/PR: pending.
- Tests: focused 18/18; `npm run typecheck`; `npm run lint:ci`; full `npm test` 478/478.
- CI/deployment: pending.
- Remaining risk: production `SIGNUP_INVITE_CODE` must be rotated if it ever matched a checked-in example; live invite delivery requires an authorized test mailbox.

### A2 — Admin fail-closed behavior

- Problem: when `/api/admin-status` failed or returned non-success, the production hook fell back to `VITE_ADMIN_EMAILS` and treated a browser-visible allowlist as an authorization decision.
- Reproduction: focused policy test failed on the base source because `useIsAdmin` called `setIsAdmin(isAdminUser(user))` after API failure.
- Files changed: `src/hooks/useIsAdmin.ts`, `src/lib/adminAccessPolicy.mjs`, `tests/admin-access-policy.test.mjs`.
- Repair: the server decision is authoritative; missing API decisions deny access in production; the client allowlist is available only for local development.
- Commit/PR: pending.
- Tests: focused admin/security tests 8/8; `npm run typecheck`; `npm run lint:ci`.
- CI/deployment: pending.
- Remaining risk: this client gate is defense in depth; server routes must continue enforcing `ADMIN_EMAILS` independently.

## Release gate

- Verified green: clean source identity; canonical release-gate job on base; public unauthenticated route smoke and production browser suite on base.
- Partial: source-level build revision contract; profile/RLS evidence exists in PR #421 but is not in `main`.
- Blocked: Vercel causal logs/domain ownership; authenticated mailbox journey; exact production revision.
- Failed: live immutable revision; overall `main` CI; safe shared team-invite behavior on `main`.
