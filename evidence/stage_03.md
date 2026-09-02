# VertexED Stage 03 — auth, onboarding, and account isolation

**Checked:** 2026-09-02
**Gate:** PARTIAL — source, deterministic local isolation and a mocked-service single-account golden journey are green; a real disposable two-account production journey is externally blocked.

## Revision boundary

- Canonical source baseline: `vertex-studyAI/vertexED.ai@fab4cdf86c11fd7a4f4638777ddb1834784f23aa`.
- Exact local runtime candidate: `1dc3134a6a89c9f673dbd81f4f29fd6cf125bfa1`.

## Unblocked work completed

- Traced email/invite signup, Google linking, password recovery, protected-route, onboarding, refresh, account-deletion, profile-recovery, planner ownership, notebook ownership, transient handoff, and local-storage isolation paths.
- Confirmed the SQL source contract enables RLS and uses `auth.uid()` ownership policies for `profiles` and every operation on `user_study_artifacts`.
- Ran the focused auth/account suite covering fail-closed invite behavior, genuine recovery-event binding, logout/session recovery, onboarding completeness, owner-derived writes, owner-scoped update/delete, two-account planner behavior, account-scoped notebook/learner/session storage, and safe account deletion.

## Verification

Command:

`node --test tests/auth.test.mjs tests/auth-recovery-truth.test.mjs tests/google-login-gating.test.mjs tests/password-recovery-flow.test.mjs tests/signup-invite.test.mjs tests/signupInviteRecovery.test.mjs tests/waitlist-signup-finalization.test.mjs tests/onboarding-status.test.mjs tests/profile-recovery.test.mjs tests/api-request-recovery.test.mjs tests/account-delete-integrity.test.mjs tests/user-content-isolation.test.mjs tests/user-content-account-storage.test.mjs tests/learner-state-account-storage.test.mjs tests/notebook-account-storage.test.mjs tests/session-handoff-account-storage.test.mjs tests/planner-replace-integrity.test.mjs`

Observed result: **101/101 PASS** under isolated Node `v22.22.0`.

The full exact-candidate suite passed **738/738**. The deterministic local browser
journey also passed approved signup, Google-link choice, onboarding, planner save,
note generation, FRQ answer/verified feedback/remediation, cloud-save requests, logout,
relogin, route restoration and saved-work recovery. Supabase, invite, AI and persistence
services were explicitly mocked; this is not a live-environment claim.

## Explicit isolation evidence

- API reads, updates, and deletes include the verified `user.id`; insert ownership is derived from the verified session and never accepted from the request body.
- Planner replacement tests use distinct `user-1` and `user-2` ownership and fail closed on lookup errors.
- Learner-derived state, notebooks, Apex history, Study Zone drafts, mock-review answers, planner/activity state, and handoffs have account-scoped keys and abandon unsafe shared legacy migration.
- SQL source policies require `auth.uid() = id` for profiles and `auth.uid() = user_id` for artifact select/insert/update/delete.

## External blocker

No authorized staging Supabase project, disposable production credentials, or canonical
Vercel project access exists in this workspace. The live production environment is also
serving an unverified older revision. Creating users or mutating production merely to
manufacture a pass was not authorized.

Smallest unblock:

1. Provide an isolated staging deployment/Supabase project or two explicitly disposable approved production accounts.
2. Provide the expected callback URL and allow it in Supabase Auth.
3. Run create → approve/invite → login/Google → onboard → create/read/update/delete owned artifact → logout denial → relogin persistence for account A.
4. Log in as account B and prove direct API/database reads, updates, and deletes of A's identifiers are denied; clean up both identities and retain only redacted evidence.

## Claim boundary

Auth and isolation are `IMPLEMENTED` and locally `GOLDEN_JOURNEY_TESTED` with deterministic
external-service mocks. A real authenticated two-account journey, provider configuration,
production callback allowlist, and deployed account isolation are not `DEPLOYED_VERIFIED`.

## Next action

Supply the isolated two-account test surface above; absent that, continue with the source-only Stage 04 learning-engine work while keeping Stage 03 PARTIAL.
