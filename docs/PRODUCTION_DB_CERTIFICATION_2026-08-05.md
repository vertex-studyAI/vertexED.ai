# VertexED production database certification — 2026-08-05

## Scope

Read-only verification of the connected production Supabase project against
`docs/PRODUCTION_SQL_CHECKS.sql`. No secret values or user records were read or
stored, and no production schema or data was changed.

- Project ref: `xwlrzgfuhfbckgvcmyoq`
- Region: `ap-south-1`
- Project state: `ACTIVE_HEALTHY`
- Database engine: Postgres 17 (`17.4.1.074`)
- Production application: `https://www.vertexed.app`

## Verified passes

- Required tables exist: `profiles`, `waitlist`, `waitlist_rate_limits`, and
  `user_study_artifacts`.
- RLS is enabled on all four required tables.
- Profile policies restrict select, insert, and update to the authenticated
  user's own row.
- Artifact policies restrict select, insert, update, and delete to the
  authenticated user's own rows.
- Waitlist and rate-limit client access is explicitly denied for `anon` and
  `authenticated` roles.
- Required artifact, invite-token, auth-user, case-insensitive email, and
  rate-limit indexes exist.
- `user_study_artifacts.kind` is constrained to the documented values.
- The auth-user creation trigger exists and calls `handle_new_user()` after
  inserts into `auth.users`.
- `auth_email_exists(text)` and `handle_new_user()` are security-definer
  functions, are not executable by `anon` or `authenticated`, and remain
  executable by `service_role`.
- Waitlist consistency checks returned zero duplicate normalized email groups,
  zero approved unlinked entries without invite tokens, and zero linked users
  retaining live invite tokens.

## Confirmed drift

### 1. Waitlist status integrity

Production did not have the documented `waitlist_status_check` constraint or
`waitlist_status_idx` index. The `status` column was also nullable.

A read-only preflight found:

- total waitlist rows: **1,805**
- null status rows: **0**
- unsupported status rows: **0**

`supabase/migrations/20260805_waitlist_status_integrity.sql` restores the
constraint, non-null guarantee, and index. The migration aborts before changing
schema if incompatible data appears.

### 2. Profile foreign-key drift

The repository schema declares `profiles.id` as a foreign key to
`auth.users(id) on delete cascade`, but the connected production table does not
currently expose that foreign-key constraint. A read-only orphan check found
**1 profile row without a matching auth user**.

No automatic deletion or foreign-key addition is included in this change. The
orphan must be classified and cleaned up through an explicit, separately
reviewed production action before the foreign key can be safely restored.

## Supabase advisor findings

Security advisors currently report two warnings:

1. Leaked-password protection is disabled.
   - Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
2. The current Supabase Postgres build has security patches available.
   - Remediation: https://supabase.com/docs/guides/platform/upgrading

Performance advisors only reported informational unused-index findings. No
index was removed because the production workload window and launch traffic are
not yet sufficient to prove those indexes are unnecessary.

## Certification boundary

This evidence advances the database portion of issue #13, but does not certify:

- administrator login and approval flow
- approval-link account creation
- team invite account creation
- Google OAuth callback
- authenticated AI and study-tool journeys
- persistence across a fresh session
- logout and post-logout authorization
- dashboard-only Auth URL/provider settings
- cleanup of disposable certification accounts

The production schema remains unchanged until the migration is reviewed and
explicitly applied through the normal release process.
