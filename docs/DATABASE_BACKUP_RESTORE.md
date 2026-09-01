# VertexED database backup, restore, and migration recovery

This runbook is deliberately non-destructive. Never test restore against the production project, never use a database reset as a migration strategy, and never place credentials in command history or evidence artifacts.

## Preconditions

- Confirm the Supabase project reference and environment (`development`, `staging`, or `production`) out of band.
- Record the application revision, latest applied migration, PostgreSQL version, and UTC timestamp.
- Use a least-privilege operator credential supplied through the environment or an approved secret manager.
- For production, enable a maintenance/rollback decision with the named operator before any write.

## Logical backup

Use the provider-supported backup first. For an additional logical backup, run `pg_dump` in custom format against the explicitly selected database:

```sh
pg_dump --format=custom --no-owner --no-acl --file=vertexed_TIMESTAMP.dump "$DATABASE_URL"
```

Do not print `DATABASE_URL`. Hash the resulting file with `shasum -a 256`, store the digest beside the encrypted artifact, and restrict the artifact because learner data may be present.

## Non-destructive verification

Listing a custom-format archive does not restore or mutate data:

```sh
pg_restore --list vertexed_TIMESTAMP.dump
```

Verify that the list includes `public.profiles`, `public.user_study_artifacts`, `public.waitlist`, RLS policy entries, functions, and the auth-user profile trigger. This proves archive structure only, not recoverability.

For restore testing, provision an explicitly disposable, isolated project with no production integrations. Restore there, run `docs/PRODUCTION_SQL_CHECKS.sql`, and execute two-account denial tests. Record row counts only in aggregate; do not copy personal rows into logs.

## Migration rollout

1. Back up and hash the intended target.
2. Compare the target migration ledger to `supabase/migrations/`.
3. Apply migrations in filename order to staging.
4. Run schema/RLS checks and application integration tests.
5. Apply once to production through the authorized path.
6. Re-run read-only schema/RLS checks and the authenticated golden journey.

## Recovery and rollback

Applied migrations are recovered with an explicit forward migration. Do not delete migration-ledger rows, drop user tables, or reset production. Application rollback is permitted only to a revision compatible with the applied schema. If a migration causes harmful writes, stop traffic to the affected capability, preserve logs and the backup, and have the named database operator choose between a forward repair and a restore into a newly provisioned project.

## Evidence boundary

A successful `pg_restore --list` is `BACKUP_STRUCTURE_VERIFIED`. Only a completed restore into an isolated target plus integrity, RLS, and application checks is `RESTORE_VERIFIED`. Neither state is claimed until its commands and artifacts actually exist.
