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

## Retention follow-up applied on 24 October 2026

Migration `20261024091122_waitlist_rate_limit_retention` added the global
`attempted_at` index and `public.prune_waitlist_rate_limits(timestamptz)`.
Execution remains limited to `service_role`; `anon` and `authenticated` cannot
execute the function. The function refuses a cutoff that preserves fewer than
seven days.

Immediately before apply, `public.waitlist_rate_limits` contained **180** rows,
from `2026-07-25T05:36:35.004418Z` through
`2026-10-22T17:25:08.743Z`. The approved 30-day prune removed **179** expired
rows. Verification after apply found **1** retained row, with both the oldest
and newest timestamp equal to `2026-10-22T17:25:08.743Z`.

At the end of the 24 October work, `pg_cron` remained uninstalled. The
[25 October completion receipt](../COMPLETION_EXECUTION_2026-10-25.md) supersedes
that scheduler status and records the subsequent tested migrations and
postflight checks. Its remaining Auth/upgrade/backup boundaries still apply.

## Open platform work

1. **Auth URLs:** Supabase Auth still uses the expired `https://www.vertexed.app` Site URL. The dashboard was reachable on 24 October, but its save action did not persist while Supabase reported an active technical incident. Set the Site URL to `https://vertex-ed-ai.vercel.app`, retain the exact plain callback, add exact `?recovery=1` and `?invite=1` callback variants, and remove the expired-domain callback. Verify with invalid-token redirect probes and real test accounts.
2. **Leaked-password protection:** Security Advisor still reports `auth_leaked_password_protection`. This is a Supabase Auth dashboard setting, not a SQL migration.
3. **Postgres patch:** Security Advisor still reports `vulnerable_postgres_version`. Schedule the managed upgrade only after recording backup/rollback and a maintenance window, then re-run the security advisor and production checks.
4. **Migration provenance:** the hosted migration ledger has a newer, distinct lineage from this dirty checkout. Do not replay or rename local migration files to manufacture equivalence; reconcile from the canonical release source before the next database deployment.

