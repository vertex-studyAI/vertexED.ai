# Profiles Auth-User Foreign Key Certification — 2026-08-05

## Scope

This report records the production reconciliation for `public.profiles.id` and `auth.users(id)` in Supabase project `xwlrzgfuhfbckgvcmyoq`. No profile ID, email address, token, or other identifying row data is included.

## Starting drift

Read-only checks found:

- `public.profiles.id` had no foreign key to `auth.users(id)`;
- exactly one profile row had no matching Auth user;
- the repository schema declared `profiles.id references auth.users(id) on delete cascade`.

## Orphan classification

Aggregate-only checks established that the orphan profile:

- had no onboarding fields or selected subjects;
- had no assessment sessions, review schedules, lesson progress, learning evidence, recommendations, mastery state, study artifacts, or created content;
- was not referenced by any UUID column in the public schema;
- shared its email with one approved waitlist entry;
- differed from the waitlist's current Auth user ID;
- had a separate, existing Auth user and valid current profile for that same email.

These invariants classified the row as a stale duplicate profile rather than the current user record.

## Cleanup action

A single all-or-nothing production block:

1. required exactly one orphan profile;
2. required exactly one active replacement Auth user, valid profile, and approved waitlist link for the same email;
3. scanned every UUID column in the public schema and refused deletion if the orphan ID appeared anywhere;
4. deleted only the classified orphan row.

The first attempted block failed before changing data because PostgreSQL does not support `min(uuid)`. The corrected block completed successfully. A post-cleanup query returned:

- orphan profiles: `0`;
- valid profiles: `2`;
- total profiles: `2`.

## Applied migration

Supabase migration `20260805143552_restore_profiles_auth_user_foreign_key` was applied to production. It:

- refuses to proceed if an orphan profile exists;
- adds `profiles_id_fkey` only when absent;
- references the stable primary key `auth.users(id)`;
- uses `ON DELETE CASCADE`;
- adds the constraint as `NOT VALID`, then validates it explicitly.

Post-migration verification returned:

- constraint: `profiles_id_fkey`;
- type: foreign key;
- validated: `true`;
- definition: `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`;
- orphan profiles: `0`.

## Advisor results

Security advisors reported only two pre-existing dashboard/infrastructure warnings:

1. leaked-password protection is disabled;
2. the current Supabase Postgres build has security patches available.

Performance advisors reported only informational unused-index notices. No index was removed because absence of observed usage is not sufficient evidence that an index is unnecessary.

## Result

The production `profiles` table now matches the repository-declared Auth ownership contract, and future Auth-user deletion will cascade to the corresponding profile.
