# VertexED 12-Hour Release Ledger

Run started: 2026-08-21 IST  
Last evidence refresh: 2026-08-22 IST
Isolated branch: `codex/production-strike-20260821`  
Base/source SHA: `3614446d836f452e77a4438c2086b01e8045b497` (`origin/main`)  
Release status: **RED**

## Source and deployment truth

- Canonical repository: `vertex-studyAI/vertexED.ai`; clean isolated clone created because the supplied workspace was an unversioned snapshot.
- Latest `main` release-gate job passed, but the overall CI run `32481664347` failed because production smoke never observed the expected revision.
- Live `https://www.vertexed.app/api/health` returns HTTP 200 and basic health JSON, but no immutable `revision` and no `X-VertexED-Revision` header.
- Both Vercel deployments for the base SHA failed: `vertex-ed-ai` deployment `dpl_6NY2bQ5cUuSssbsVczi6EfD2JZE1` and `vertex-ai` deployment `dpl_E6xU2iKzwMKKEcAdjicc718GkCz4`.
- The authenticated local Vercel account can see neither owning project. The in-app browser also reaches a Vercel login/404 surface and no alternate connected browser session exists, so causal deployment logs and canonical-domain ownership remain unavailable from this execution context.

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
- Commit: `36576c7671bdc9fee7d70f0376c84b6bec41f2d4`; integration PR recorded below.
- Tests: focused 18/18; `npm run typecheck`; `npm run lint:ci`; full `npm test` 478/478.
- CI/deployment: pending.
- Remaining risk: production `SIGNUP_INVITE_CODE` must be rotated if it ever matched a checked-in example; live invite delivery requires an authorized test mailbox.

### A2 — Admin fail-closed behavior

- Problem: when `/api/admin-status` failed or returned non-success, the production hook fell back to `VITE_ADMIN_EMAILS` and treated a browser-visible allowlist as an authorization decision.
- Reproduction: focused policy test failed on the base source because `useIsAdmin` called `setIsAdmin(isAdminUser(user))` after API failure.
- Files changed: `src/hooks/useIsAdmin.ts`, `src/lib/adminAccessPolicy.mjs`, `tests/admin-access-policy.test.mjs`.
- Repair: the server decision is authoritative; missing API decisions deny access in production; the client allowlist is available only for local development.
- Commit: `d0a13b5de55d9a1c4c634c8b802c053614de1b68`; integration PR recorded below.
- Tests: focused admin/security tests 8/8; `npm run typecheck`; `npm run lint:ci`.
- CI/deployment: pending.
- Remaining risk: this client gate is defense in depth; server routes must continue enforcing `ADMIN_EMAILS` independently.

### A3 — Historical profile and login recovery integrity

- Problem: email login blindly upserted Auth metadata into `profiles`; missing names produced `full_name: null` despite the database `NOT NULL` contract and empty metadata could overwrite learner-edited fields.
- Reproduction: focused source regression failed on the base blind-upsert implementation.
- Files changed: `src/contexts/AuthContext.tsx`, `src/lib/profileRecovery.mjs`, `supabase/migrations/20260821131000_backfill_missing_profiles.sql`, and profile/content isolation tests.
- Repair: update existing rows using only non-empty identity fields; insert missing rows with a stable `Learner` fallback; tolerate only the concurrent unique-key race; provide an idempotent historical backfill migration.
- Commit: `8718cd9dd71d80e802d3bfa268ab37a7abacb1c9`; integration PR recorded below.
- Tests: focused profile and service-role ownership tests 9/9; `npm run typecheck`; `npm run lint:ci`.
- CI/deployment: pending. The migration is committed but was not applied from this branch; PR #421 separately records a completed production repair with 31/31 profiles.
- Remaining risk: other environments still require migration application; the authenticated two-account browser journey remains unexecuted here.

### A4 — Immutable revision packaging and retry safety

- Problem: the generated server revision was stamped only during the build lifecycle; live serverless packaging repeatedly served a function with no revision. The ignore hook also compared only `HEAD^`, allowing a later operations-only commit to hide earlier undeployed runtime changes.
- Reproduction: packaging regression failed 1/3 because `installCommand` was only `npm ci`; live health continues to omit both revision body and header.
- Files changed: `vercel.json`, `scripts/vercel-ignore-build.mjs`, `tests/vercelRevisionPackaging.test.mjs`, `tests/vercel-ignore-build.test.mjs`.
- Repair: stamp the exact immutable revision immediately after dependency install, before function tracing; compare deploy relevance from `VERCEL_GIT_PREVIOUS_SHA` when available and fail closed on malformed history identity.
- Commit: `a0ff34b10728422f1df2ef8ba8e6bb65a5a5e858`; integration PR recorded below.
- Tests: build/health/Vercel-focused tests 26/26; function-count validator green; direct generated-module check matched exact pre-action HEAD.
- CI/deployment: pending. Both current Vercel owner projects remain inaccessible from this session, and the existing production alias still serves an unidentifiable older function.
- Remaining risk: only a successful deployment plus matching live `/api/health` JSON/header can close this blocker; local packaging tests are not production proof.

### A5 — Production browser regression gate

- Problem: the prior production journey asserted the unsafe password-at-signup behavior, so it could not detect that production still exposed the pre-fix invite flow.
- Files changed: `e2e/smoke.spec.ts`.
- Repair: require the shared-code form to omit the password field, show the secure mailbox-invite action, and explain that email verification precedes password setup.
- Commit: `f56401ea`; integration PR recorded below.
- Local proof: the invite-flow assertion passed in all four configured viewport projects (4/4) against the exact branch build.
- Production proof: the desktop assertion failed twice against `https://www.vertexed.app` because the live page still renders one Password field. This is an intentional red release signal until deployment succeeds.

## Verification evidence

- Runtime used for canonical verification: Node.js `22.22.0`, matching CI's Node 22 contract.
- Canonical `npm run ci`: lint green; typecheck green; function validator green (1 function, 18 routes); production dependency audit green (0 high-or-greater findings); unit/security tests 496/496; evals 20/20; production build green with revision `a0ff34b10728422f1df2ef8ba8e6bb65a5a5e858`.
- Local accessibility suite against a dedicated exact-branch preview: 34 passed, 2 skipped.
- Secure team-invite browser regression against that preview: 4/4 viewport projects passed.
- Live deployment smoke expected deploy-relevant revision `a0ff34b10728422f1df2ef8ba8e6bb65a5a5e858`: all public/API contract checks passed except immutable revision identity; `/api/health` returned HTTP 200 with neither a revision body field nor `X-VertexED-Revision`.
- Live secure-invite assertion: failed as expected; production still exposes the Password field before mailbox ownership proof.

## Integration

- Branch: `codex/production-strike-20260821`.
- Pull request: pending publication.
- No unfinished PR branch was merged, cherry-picked, rebased over, or overwritten. The repairs were independently reproduced and implemented on the isolated branch.

## Release gate

- Verified green: clean source identity; canonical local release gate on the repair branch; exact-branch production build; local public/accessibility browser proof; server-side unauthorized API checks.
- Partial: source-level build revision contract; profile/RLS evidence exists in PR #421 but is not in `main`; automated CI is pending branch publication.
- Blocked: Vercel causal logs/domain ownership; authenticated mailbox journey; exact production revision.
- Failed: live immutable revision; overall `main` CI; live secure shared team-invite behavior.
