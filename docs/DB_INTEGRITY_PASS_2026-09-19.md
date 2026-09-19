# DB integrity pass — 2026-09-19

Read-only migration audit of `supabase/migrations` for RLS, ownership policies, and `user_id` lookup indexes. No production `db reset`, push, or destructive remote mutation.

## Verdict

Highest-confidence **safe additive** gap: `public.product_feedback` lacked an explicit `service_role` grant despite an admin-review contract, and several fail-closed tables never set `FORCE ROW LEVEL SECURITY`. Fixed in migration `20260919055925_feedback_service_grants_and_force_rls.sql`.

## Table inventory

| Table | RLS | Client policies | `user_id` / owner lookup index | Notes |
| --- | --- | --- | --- | --- |
| `profiles` | enabled | own select/insert/update via `auth.uid() = id` | PK on `id` | No client delete (account delete cascades from `auth.users`) |
| `user_study_artifacts` | enabled | own CRUD via `auth.uid() = user_id` | `(user_id, kind, updated_at desc)` + singleton/idempotency uniques | Ownership `WITH CHECK` present |
| `product_feedback` | enabled | insert-only, `auth.uid() = user_id` | `(user_id, created_at desc)` | Was missing explicit `service_role` grant |
| `learner_state_items` | enabled | none (API/service only) | PK `(user_id, …)` + `(user_id, updated_at desc)` | Intentional no client policies |
| `waitlist` | enabled | none | unique partial `auth_user_id` | Service-role only |
| `waitlist_rate_limits` | enabled | none | `(ip_hash, attempted_at desc)` | Service-role only |
| `observability_events` | enabled | none | n/a (no user column) | Privacy by design |
| `schools` | enabled | none | unique `identity_key` | Service-role select/insert; upsert uses `ignoreDuplicates` |

## Gaps addressed in this PR

1. **Explicit `service_role` privileges on `product_feedback`** (`select, insert, delete`) so admin review matches the table comment.
2. **`REVOKE … FROM PUBLIC`** on `product_feedback`, `schools`, and reaffirmed on `waitlist`.
3. **`FORCE ROW LEVEL SECURITY`** on every public base table so non-bypass owners cannot skip policies.

## Gaps reviewed and left alone

- No missing `user_id` covering indexes on owned tables (artifact/feedback/learner-state/waitlist auth linkage already indexed).
- `learner_state_items` / `schools` / `observability_events` correctly have RLS with zero client policies.
- `FORCE RLS` still requires a human production migration apply; local Docker was unavailable for `npm run db:test` in this session.
- Broader `docs/PRODUCTION_SQL_CHECKS.sql` coverage of newer tables remains a follow-up (read-only ops doc), not required to ship this additive migration.

## Local validation

Static (ran):

```bash
node --test tests/rls-schema.test.mjs tests/product-feedback.test.mjs tests/migration-filenames.test.mjs
```

When Docker is available:

```bash
npm run db:test
```

Do **not** run destructive resets against production.
