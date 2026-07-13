# Supabase Production Hardening — Final Owner Actions

Project: `xwlrzgfuhfbckgvcmyoq` (ap-south-1)

## Applied and verified

The following migrations are already present in the connected project:

- `20260713063338_production_baseline_alignment`
- `20260713063355_core_learning_exam_architecture`
- `20260713063700_rls_hardening_performance`
- `20260713063751_remove_duplicate_lesson_progress_index`
- `20260713064337_least_privilege_grants`

The applied boundaries are deliberate:

- `profiles` is the only direct browser database surface. Authenticated users can
  select, insert, and update only their own profile through RLS.
- Study artefacts, assessment sessions/responses, evidence, mastery, review dates,
  and recommendations are all server-mediated; browser roles have no table grant.
- Curriculum, question, source-rights, mark-scheme, grading, and audit data are
  server-mediated and protected by both no-access RLS policies and no browser grant.
- `auth_email_exists` is executable only by `service_role`; browser roles cannot
  call it. `handle_new_user` is trigger-only and not browser-callable.
- No Supabase Storage bucket exists in this project. Do not create a bucket without
  first choosing a private/public access model, content-type allowlist, file-size
  limit, retention rule, and object RLS policy.

## Required owner decision: waitlist

`public.waitlist` is still the one exception: it has RLS disabled and retains broad
`anon`/`authenticated` grants. The application does **not** need direct browser
database access for waitlist operations; `/api/waitlist` uses the server role.

If that remains the product design, run this in **Database → SQL Editor**:

```sql
alter table public.waitlist enable row level security;
revoke all on table public.waitlist from anon, authenticated;
create policy "No direct client access" on public.waitlist
  for all to anon, authenticated using (false) with check (false);
```

Then run this verification query. It must return `true` for RLS and no grants for
`anon` or `authenticated`:

```sql
select c.relrowsecurity as rls_enabled
from pg_class c
where c.oid = 'public.waitlist'::regclass;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'waitlist'
  and grantee in ('anon', 'authenticated');
```

Do not use that SQL if the product is intentionally being redesigned for direct
browser waitlist writes. In that case, define a separate, reviewed insert-only
policy with a narrowly constrained RPC or server-side abuse control first.

## Required dashboard actions

These settings cannot be changed safely through the database migration interface.

1. **Authentication → Providers → Email**: set OTP expiry to **60 minutes or less**.
2. **Authentication → Security**: enable **Leaked Password Protection**.
3. **Database → Settings / Upgrades**: apply the available Postgres security patch.
4. **Database → Backups**: enable the plan’s strongest available backup/PITR option;
   record an owner, recovery objective, and restore test date.
5. **Authentication → URL Configuration**: allow only the production callback
   `https://www.vertexed.app/auth/callback` and explicit development origins. Remove
   wildcard or retired preview URLs that are no longer required.
6. **Project Settings → API Keys**: confirm the browser uses only a publishable/anon
   key; rotate the service-role key if it has ever appeared in a client build, git
   history, shared chat, or browser environment variable.
7. **Vercel → Environment Variables**: store `SUPABASE_SERVICE_ROLE_KEY` only as a
   server-side secret. Never use a `VITE_` prefix for it. Set
   `WAITLIST_RATE_LIMIT_SALT` to a high-entropy secret and run
   `npm run validate:prod-env` in the deployment environment.

## Content and learner-data release gate

The database currently contains no authorized curriculum or assessment content.
Before enabling verified practice for a public subject:

1. Register the source with rights holder, authorization basis/reference, permitted
   uses, territory, expiry, source URL or controlled storage key, and SHA-256.
2. Record the source version/parser, then have a qualified human verify parsing.
3. Import each question with its exact source locator, mark total, mark-scheme
   points, classifications, confidence values, and difficulty method.
4. Human-verify every mark-scheme point and classification.
5. Publish the curriculum and subject, then activate only questions that pass the
   full source → parse → mark-scheme → classification review chain.
6. Have an assessment specialist sample deterministic scoring, question/mark total
   consistency, command-term coverage, and prerequisite links before public use.

Never activate constructed-response automatic scores until a human review process
has measurable calibration and agreement evidence. The current product correctly
withholds those scores from mastery and recommendations.

## Release verification queries

Run after the waitlist decision and before launch:

```sql
-- No table in public should have RLS disabled.
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity;

-- Browser grants should exist only for profiles, unless a separately reviewed
-- browser-facing table has been intentionally introduced.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- All current tables except profiles should show no browser grant.
-- Re-run Supabase Database Advisors and resolve ERROR/WARN findings before launch.
```

The expected final browser-grant output is exactly `profiles` for role
`authenticated` with `SELECT`, `INSERT`, and `UPDATE`; it must not include
`waitlist` after the recommended decision is applied.
