# VertexED Production Database Certification — 2026-08-05

## Scope

Read-only production verification was run against Supabase project `xwlrzgfuhfbckgvcmyoq` for the database portion of issue #13. No secret values or user records were copied into this report.

## Verified pass

- Required tables exist: `profiles`, `waitlist`, `waitlist_rate_limits`, and `user_study_artifacts`.
- Row Level Security is enabled on all four required tables.
- All columns required by `docs/PRODUCTION_SQL_CHECKS.sql` are present.
- Profile policies restrict select, insert, and update to the authenticated user's own row.
- Study artifact policies restrict select, insert, update, and delete to the authenticated user's own rows.
- Waitlist and rate-limit client access is explicitly denied for `anon` and `authenticated`.
- Required helper functions are security-definer functions, are not executable by `anon` or `authenticated`, and remain executable by `service_role`.
- The `on_auth_user_created` AFTER INSERT trigger calls `handle_new_user()`.
- Required waitlist, rate-limit, and study-artifact indexes exist after remediation.
- The waitlist auth-user and study-artifact auth-user foreign keys exist with their intended delete behavior.
- The study-artifact kind constraint exists.
- Duplicate case-insensitive waitlist email groups: `0`.
- Approved entries missing both an auth user and invite token: `0`.
- Linked users retaining live invite tokens: `0`.

## Waitlist drift found and repaired

Production was missing or diverged from three declared guarantees:

- `waitlist_status_check`, which restricts status to `pending`, `approved`, or `rejected`.
- `waitlist_status_idx`, the expected status lookup index.
- The `waitlist.status` column was nullable despite the repository schema declaring it `NOT NULL`.

Before remediation, the only existing values were `approved` (12 rows) and `pending` (1,793 rows), with zero null or unsupported values.

Applied production migrations:

1. `20260805141302_waitlist_status_integrity_index`
   - added and validated `waitlist_status_check`;
   - restored `waitlist_status_idx`.
2. `20260805141839_waitlist_status_not_null`
   - refused to proceed if any null status existed;
   - enforced `waitlist.status NOT NULL`.

Post-migration verification:

- `waitlist_status_check` exists and is validated.
- `waitlist_status_idx` exists.
- `waitlist.status` reports `is_nullable = NO`.
- Invalid or null waitlist status rows: `0`.

## Separate confirmed profile drift

The repository schema declares `profiles.id` as a foreign key to `auth.users(id) ON DELETE CASCADE`. The connected production table currently has no foreign-key constraint on `profiles.id`, and a read-only aggregate check found one profile row without a matching auth user.

No row was deleted and no profile foreign key was added during this certification. The orphan must be classified and handled through a separate reviewed cleanup before the foreign key can be restored safely.

## Supabase advisor state

Security advisors still report two dashboard/infrastructure actions that cannot be completed through SQL:

1. Leaked password protection is disabled.
2. The current Supabase Postgres build has security patches available and should be upgraded through project infrastructure settings.

Performance advisors reported only informational unused-index notices. No index was removed because low observed usage is insufficient evidence that an index is unnecessary.

## Remaining external certification

This report completes only the database-verification portion of issue #13. The authenticated browser journeys, Google OAuth callback, live AI-provider calls, cross-session persistence, account cleanup, dashboard Auth configuration, redirect allowlist, backup/PITR configuration, leaked-password protection, and Postgres upgrade remain external checks.
