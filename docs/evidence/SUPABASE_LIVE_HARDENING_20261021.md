# Live Supabase hardening receipt — 21 October 2026

## Scope and identity

- **Project:** `xwlrzgfuhfbckgvcmyoq` (`vertexed25-byte's Project`)
- **Region:** `ap-south-1`
- **Database:** PostgreSQL 17, hosted build `supabase-postgres-17.4.1.074`
- **Method:** authenticated Supabase management connector; read-only catalog checks before and after the one applied migration.

This record distinguishes completed database changes from open platform configuration. It does not certify the custom domain, email delivery, real-user Auth journeys, backups, network restrictions, or a managed Postgres upgrade.

## Applied migration

| Version | Name | Result |
| --- | --- | --- |
| `20261021145915` | `vertexed_public_rls_hardening` | Applied successfully to the hosted project. |

The migration set `FORCE ROW LEVEL SECURITY` on the 23 public tables that previously had RLS enabled but did not force it: the legacy cache, assessment, curriculum, content, grading, learning-evidence, review-schedule, explainer and testimonial tables.

### Verification after apply

- Public base tables with RLS: **31**.
- Public base tables without FORCE RLS: **0**.
- `vertexed_readiness()` returned all six required capabilities as `true`.
- Browser roles retain no grant to the service-only tables. The three advisor entries for `learner_state_items`, `observability_events` and `schools` remain intentional: each has RLS and FORCE RLS, no client policies, no browser-role table privileges, and a server/service-only access model.
- The only `SECURITY DEFINER` functions are `auth_email_exists(text)` and the `auth.users` trigger `handle_new_user()`. Both have an explicit search path and are not executable by `anon` or `authenticated`.

## Retention change deliberately not applied

The intended second migration would add a server-only global pruning function and an `attempted_at` index for `waitlist_rate_limits`, then remove attempts older than 30 days. The management connector expired its request state twice before applying any part of that migration. It was not retried after a readback confirmed no partial change.

The untouched target is precisely identified:

- **179** rows in `public.waitlist_rate_limits`;
- oldest: `2026-07-25T05:36:35.004418Z`;
- newest: `2026-09-05T20:44:42.742865Z`;
- no rate-limit row was deleted in this pass.

`pg_cron` is not installed, so there is no safe existing scheduler to assume for a recurring retention job. Apply the retention migration only after connector reliability or an approved migration pipeline is restored, then verify the function grant, index and row count.

## Open platform work

1. **Auth URLs:** Supabase Auth still uses the expired `https://www.vertexed.app` Site URL. Set the Site URL to `https://vertex-ed-ai.vercel.app`, retain the exact plain callback, add exact `?recovery=1` and `?invite=1` callback variants, and remove the expired-domain callback. Verify with invalid-token redirect probes and real test accounts.
2. **Leaked-password protection:** Security Advisor still reports `auth_leaked_password_protection`. This is a Supabase Auth dashboard setting, not a SQL migration.
3. **Postgres patch:** Security Advisor still reports `vulnerable_postgres_version`. Schedule the managed upgrade only after recording backup/rollback and a maintenance window, then re-run the security advisor and production checks.
4. **Migration provenance:** the hosted migration ledger has a newer, distinct lineage from this dirty checkout. Do not replay or rename local migration files to manufacture equivalence; reconcile from the canonical release source before the next database deployment.

