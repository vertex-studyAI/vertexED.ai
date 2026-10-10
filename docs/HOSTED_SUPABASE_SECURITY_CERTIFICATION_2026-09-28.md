# Hosted Supabase security certification — 2026-09-28

Scope: read-only production security verification for the connected VertexED Supabase project. This record does not authorize unrelated schema changes, production release, DNS/TLS changes, or database upgrades.

## Project identity

- Project ref: `xwlrzgfuhfbckgvcmyoq`
- Project name: `vertexed25-byte's Project`
- Region: `ap-south-1`
- Project status during review: `ACTIVE_HEALTHY`
- Database engine: PostgreSQL 17
- Hosted build reported by the project: `supabase-postgres-17.4.1.074`

The security advisor observation used for this review was returned on 2026-09-28 and identified three current items:

1. informational `rls_enabled_no_policy` findings for `public.learner_state_items`, `public.observability_events`, and `public.schools`;
2. leaked-password protection disabled;
3. security patches available for the hosted Postgres build.

## Service-only RLS finding: dispositioned as intentional

The three policy-free tables are intentionally server/service-only. This is already the repository design in `docs/DB_INTEGRITY_PASS_2026-09-19.md`, `tests/rls-schema.test.mjs`, and the pgTAP database tests.

A fresh hosted role-privilege readback on 2026-09-28 showed the same access boundary for all three tables:

| Role | SELECT | INSERT | UPDATE | DELETE | BYPASSRLS |
| --- | --- | --- | --- | --- | --- |
| `anon` | no | no | no | no | no |
| `authenticated` | no | no | no | no | no |
| `service_role` | yes | yes | yes | yes | yes |
| `postgres` | yes | yes | yes | yes | yes |

For each of `learner_state_items`, `observability_events`, and `schools`, the hosted database also reports:

- RLS enabled;
- FORCE RLS enabled;
- zero RLS policies.

This means the advisor's no-policy finding is not evidence of public exposure. The browser roles have no table privileges at all. Adding a permissive client policy just to make the advisor disappear would weaken the intended design.

The server architecture supports this boundary:

- `api/_lib/serverSupabase.js` uses `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` only on the server;
- `api/_handlers/learner-state.js` routes account-owned learner-state writes through the server;
- `api/_lib/learnerStateStore.js` uses the server Supabase client for the sync RPC/table access;
- `api/_lib/observabilityStore.js` persists telemetry through the admin/server client;
- the school directory migration explicitly revokes access from `anon` and `authenticated`.

No RLS policy was added or widened during this review.

## Existing repo tests that encode this contract

The repository already has multiple independent checks:

- `tests/rls-schema.test.mjs`: service-only directory/telemetry/state tables must expose no client policies; fail-closed tables must FORCE RLS.
- `supabase/tests/database/structure.test.sql`: client roles cannot read learner state or telemetry; service role has explicit access; schools are service-role accessible; FORCE RLS is asserted.
- `supabase/tests/database/rls.test.sql`: authenticated users are explicitly checked not to have direct learner-state SELECT access.

This review extends `scripts/supabase-security-audit.sql` so an operator can reproduce the hosted role matrix and policy/FORCE-RLS state without mutating data.

## Remaining real security gates

### Leaked-password protection

The hosted advisor still reports leaked-password protection disabled. Supabase documents this as an Auth password-security control backed by the Pwned Passwords dataset. Enabling it is a dashboard/Auth configuration decision, not an RLS migration.

**Status: OPEN.** Do not claim this review enabled the setting.

### Postgres security patch

The hosted advisor reports that `supabase-postgres-17.4.1.074` has outstanding security patches.

**Status: OPEN.** Review Supabase's managed upgrade path, maintenance window, backup/rollback readiness, and application compatibility before scheduling the database upgrade. Do not bundle it with unrelated release changes.

## Release boundary

The service-only RLS findings are dispositioned and should not block release by themselves. Production security certification remains incomplete until the leaked-password setting and hosted Postgres patch/upgrade decision are recorded and, where applicable, verified after change.

This record does not close the separate `www.vertexed.app` DNS/TLS/hosting issue.
