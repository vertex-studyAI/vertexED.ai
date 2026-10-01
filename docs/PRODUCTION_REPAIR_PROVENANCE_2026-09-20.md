# Production repair provenance — 2026-09-20

This is a **read-only provenance receipt** for the canonical VertexED Supabase project. It does not repair migration history, mutate production, replay old migrations, or authorize a blind `db push`.

Repository source inspected: `main@10dc7e931d53f17f57da1e5061a71568012f5a62`.

## Production ledger receipts

Read-only inspection of `supabase_migrations.schema_migrations` records the following uniquely-versioned September repair rows:

| Production version | Name | Statement count | SHA-256 of recorded statement body |
| --- | --- | ---: | --- |
| `20260919100350` | `vertexed_readiness_restore` | 1 | `8f43395b1d0c71fdb4389f6b1a53b931f7443064c386e8ad8e37a132852566e5` |
| `20260919113629` | `vertexed_runtime_storage_repair` | 1 | `3b128512234720381ef3d6a20c30674536f56c05840116fb67a3cc60e27de01d` |

The SHA-256 value is calculated over `array_to_string(statements, E'\n-- statement boundary --\n')`. No user rows, tokens, credentials, or secret values are included in this receipt.

## `vertexed_readiness_restore`: exact repository source match

The recorded production statement for `20260919100350_vertexed_readiness_restore` is byte-for-byte identical to the current repository file:

`supabase/migrations/20260908165433_exam_session_readiness.sql`

The repository file body hashes to the same SHA-256:

`8f43395b1d0c71fdb4389f6b1a53b931f7443064c386e8ad8e37a132852566e5`

This closes source identification for the readiness-repair body. It does **not** relabel the production ledger version or justify migration-history surgery.

## `vertexed_runtime_storage_repair`: source map

The recorded production statement for `20260919113629_vertexed_runtime_storage_repair` is a composite repair body rather than a byte-identical current-main migration file. Its immutable recorded-body SHA-256 is:

`3b128512234720381ef3d6a20c30674536f56c05840116fb67a3cc60e27de01d`

Read-only body comparison maps its major schema/function blocks to reviewed repository migrations:

- learner-state storage + privacy-safe observability: `20260906101155_learner_state_and_telemetry.sql`;
- atomic waitlist rate limiting + singleton planner/notebook integrity: `20260906103806_atomic_rate_limits_and_singletons.sql`;
- batched learner-state sync + explicit service-role privileges: `20260906112000_batch_state_and_privileges.sql`;
- the final `SECURITY INVOKER` rate-limit posture is consistent with `20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql` rather than the earlier definer form;
- `exam_session` learner-state support: `20260908105340_exam_session_history.sql`;
- readiness contract including `examSessionStorage`: `20260908165433_exam_session_readiness.sql`.

The repair body also contains defensive operational differences appropriate to its repair role (for example local lock/statement timeouts and explicit sequence revocation) and omits unrelated later sections from some source migrations. Therefore it must be treated as a **composite production repair**, not falsely claimed as byte-identical to one repository migration.

## Historical duplicate-version finding

The current production ledger contains **no rows** for legacy versions `20260711` or `20260725`.

That materially narrows issue #916:

- there is no current production ledger row whose version alone ambiguously selects one of the duplicate `20260711` or `20260725` repository files;
- production does contain later schema effects associated with those historical files, but ledger history cannot prove the one-time July backfills ran;
- `20260713063338_production_baseline_alignment` independently records creation/alignment of the planner/notebook artifact-kind contract and `waitlist.invite_token` + its unique partial index, which explains important present-day `20260711` DDL effects without assuming a collided `20260711` ledger row;
- no recorded production migration statement mentions `legacy_access` or `signup_method`, so the historical `20260725` data/backfill provenance remains **not safely inferable** from the present ledger/schema.

Do not infer one-time backfill execution from mutable current rows.

## Safe conclusions

1. The September readiness repair body now has an exact repository source identity and immutable production hash.
2. The runtime-storage repair body now has an immutable production hash and an explicit source map to reviewed repository migrations, while preserving the fact that it is a composite repair.
3. The legacy duplicate-version problem is now classified more precisely: `20260711` and `20260725` are absent from the current production ledger, so the remaining question is historical effect/backfill provenance rather than choosing among ambiguous current ledger rows.
4. None of this authorizes rewriting old migration files, inserting/deleting ledger rows, applying missing historical migrations blindly, or replaying one-time backfills.

## Remaining gate

Keep #913/#916 open until the composite runtime repair receives ordinary review, the missing July/September history has an auditable reconciliation story, and any proposed reconciliation is rehearsed production-equivalently with backup/rollback ownership. Production HTTP/TLS serving remains a separate #44 gate.
