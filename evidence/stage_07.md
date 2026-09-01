# VertexED Stage 07 — Supabase, RLS, security and recovery

**Gate: PARTIAL.** Every canonical public table is structurally checked for RLS;
user-owned policies bind to `auth.uid()`, service tables expose no client policy,
security-definer functions pin `search_path`, and public/anonymous/authenticated roles
are denied direct execution. A forward-only hardening migration was added, together with
non-destructive dump, catalog, isolated restore and rollback guidance.

Verification: `node --test tests/rls-schema.test.mjs` PASS 5/5; auth/isolation focused
suite PASS 98/98; full suite PASS 707/707. Evidence:
`supabase/migrations/20260901173000_security_definer_execute_hardening.sql` and
`docs/DATABASE_BACKUP_RESTORE.md`.

Truth boundary: no production migration, advisor run, live role impersonation, backup,
or isolated restore was executed without access to the owning Supabase project. The
smallest unblock is an authorized staging project snapshot on which to apply the forward
migration, run advisor/role tests, and restore a new isolated database.
