# Profiles Auth Foreign-Key Certification — 2026-08-05

## Objective

Restore the repository-declared ownership relationship from `public.profiles.id` to `auth.users.id` without deleting, reassigning, or exposing user data.

## Production sequence

A prior read-only production audit found the foreign key absent and one orphan profile. That state was isolated in issue #40 rather than repaired by deleting data blindly.

Immediately before restoration, aggregate-only checks were rerun. They found:

- orphan profiles: `0`;
- related rows belonging to orphan profile IDs across the inspected user-owned tables: `0`;
- existing `profiles` → `auth.users` foreign keys: `0`.

Production migration `20260805143552_restore_profiles_auth_user_foreign_key` then:

1. aborted if any orphan profile existed at execution time;
2. added `profiles_id_fkey` only when absent;
3. referenced `auth.users(id)` with `ON DELETE CASCADE`;
4. created the constraint as `NOT VALID` and then validated it.

## Post-migration verification

Aggregate and catalog checks confirmed:

- orphan profiles: `0`;
- constraint name: `profiles_id_fkey`;
- validated: `true`;
- definition: `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`.

No profile ID, email, name, school, age, IP address, token, or other identifying value was copied into the repository or issue tracker.

## Repository preservation

The exact production SQL is stored in:

`supabase/migrations/20260805143552_restore_profiles_auth_user_foreign_key.sql`

The migration is idempotent with respect to an existing correctly named constraint and retains the zero-orphan execution guard.

## Remaining Supabase security work

Fresh security advisors still report two dashboard or infrastructure actions:

- enable leaked-password protection;
- apply the available Supabase Postgres security upgrade.

Performance advisor findings are informational unused-index notices. No index should be removed without query and workload evidence.
