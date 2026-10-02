# Disposable database verification

Use Node 22.22.0/npm 10.9.4 and a running Docker-compatible runtime. These commands create a uniquely named **local test project**, not a remote connection. Keep the destination new; the preparer refuses to overwrite prior evidence.

```sh
rtk npm run db:prepare -- /absolute/new/test-directory vertexed-test-your-run 55320
rtk proxy npx supabase start --workdir /absolute/new/test-directory -x gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
VERTEXED_TEST_DB_WORKDIR=/absolute/new/test-directory rtk npm run db:test
rtk proxy npx supabase stop --workdir /absolute/new/test-directory
```

The final command stops only this test project and preserves its database volume. Do not use `--linked` or a production URL. The guarded reset rejects missing preparation metadata, a changed project identity, a remote project link, or modified/missing migration and SQL-test files.

Legacy eight-digit filenames are normalised only in the disposable copy, with deterministic order and a SHA-256 mapping to each unchanged original SQL file. This mapping is not a replacement for reconciling the production migration ledger.

The runner resets the explicitly local target, lints the migrated application with the existing fail-on-error policy, installs pgTAP only as a test dependency, and copies the exact tests into a disposable pg_prove container pinned by digest. Copying avoids empty bind mounts on external drives that the container VM does not mount. The test runner is removed after execution; failed logs and the database remain recoverable. Schema lint precedes pgTAP installation because pgTAP's own functions refer to per-test temporary objects that do not exist outside a test session.

The 27 September execution passed 29 migrations, schema lint and 59 assertions across five SQL files. Initial failures were retained: two corrupt cached container images, a missing external-drive bind mount, a fixture that reused a unique revision ID, and linting of test-only pgTAP objects. The fixture correction uses separate revisions and adds an explicit duplicate-revision rejection assertion; no database constraint was relaxed.

This is local empty-state replay and SQL permission evidence. A production-shaped restore, deployed API authorization, real account journeys and production migration approval remain separate requirements.
