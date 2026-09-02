# VertexED Stage 07 — Supabase, RLS, security and recovery

**Gate: PARTIAL.** Every canonical public table is structurally checked for RLS;
user-owned policies bind to `auth.uid()`, service tables expose no client policy,
security-definer functions pin `search_path`, and public/anonymous/authenticated roles
are denied direct execution. A forward-only hardening migration was added, together with
non-destructive dump, catalog, isolated restore and rollback guidance.

Verification: `node --test tests/rls-schema.test.mjs` PASS 5/5; auth/isolation focused
suite PASS 101/101; full suite PASS 745/745. Evidence:
`supabase/migrations/20260901173000_security_definer_execute_hardening.sql` and
`docs/DATABASE_BACKUP_RESTORE.md`.

Truth boundary: no production migration, advisor run, live role impersonation, backup,
or isolated restore was executed without access to the owning Supabase project. The
2026-09-02 access probe found no installed/authenticated Supabase CLI session, no
`SUPABASE_ACCESS_TOKEN`, no repository project link, and no local environment file beyond
the variable-name-only `.env.example`. `npx supabase@latest projects list` returned
`LegacyPlatformAuthRequiredError` before exposing any project data.

The smallest unblock is an authorized staging project snapshot or least-privilege CLI
access on which to compare the migration ledger, run advisor/role tests, and restore a
backup into a new isolated database. Credentials must be supplied through the environment
or approved secret manager, never committed or pasted into evidence.
