# Percy durable runtime — reliability baseline

This directory is a deliberately small **single-host control-plane baseline**. It proves reliable task ownership and persistent state before Percy grows more providers, agents, or Discord controls.

## Canonical task flow

```text
READY -> CLAIMED -> RUNNING -> VERIFYING -> COMPLETE
```

Exceptional states are `FAILED`, `BLOCKED`, `STALE`, and `CANCELLED`.

A worker may not move a task directly from running to complete. Successful execution first enters `VERIFYING`; `verifyComplete()` refuses completion unless at least one evidence record exists for the task. Evidence is stored in SQLite with a SHA-256 digest and metadata.

## Architecture

```text
CLI / future Discord adapter
        |
        v
SQLite task store (WAL)
  - authoritative task state
  - attempts / retained failures
  - worker owner_id
  - lease expiry / heartbeat
  - bounded READY queue
  - bounded task payload bytes
  - verified online backups
  - evidence + SHA-256
  - result/error
        |
        v
bounded worker executor
  - echo
  - sleep
  - intentional fail (test only)
```

There is **no arbitrary shell task kind**. Provider/model adapters must be explicit allow-listed executors with their own concurrency and timeout limits.

`advanced.mjs` already contains tested building blocks for class-based concurrency limits, recursive JSONL secret redaction, online backup/restore, and a lease-heartbeating worker loop. Those helpers are not yet equivalent to production provider integration; the primary CLI and future provider adapters still need to consume them explicitly.

## Requirements

- Node 22.22+ with `node:sqlite` available. The online backup API used here is available in the supported Node 22 line.
- Pin/test the production Node version because `node:sqlite` may still emit an experimental-feature warning on some releases.

## Exact launcher

Initialize with the conservative defaults explicitly shown:

```bash
PERCY_MAX_ACTIVE=2 \
PERCY_MAX_QUEUED=500 \
PERCY_MAX_PAYLOAD_BYTES=65536 \
node tools/percy-runtime/cli.mjs init
```

Submit a safe smoke task:

```bash
node tools/percy-runtime/cli.mjs submit --kind echo --payload '{"message":"hello"}'
```

Run one worker iteration:

```bash
node tools/percy-runtime/cli.mjs work-one --worker-id percy-local-01 --lease-ms 30000 --timeout-ms 10000
```

Inspect state and SQLite integrity:

```bash
node tools/percy-runtime/cli.mjs status
node tools/percy-runtime/cli.mjs integrity
```

Create an online backup without stopping Percy:

```bash
node tools/percy-runtime/cli.mjs backup --output .percy/backups/percy-$(date +%Y%m%d-%H%M%S).sqlite
```

The backup command refuses the live database path and refuses an existing output by default. Use `--overwrite` only when replacement is intentional. A backup is reported as `BACKUP_VERIFIED` only after the live database passes `PRAGMA integrity_check`, SQLite's online backup completes, the copy independently passes `PRAGMA integrity_check`, and the required Percy tables (`meta`, `tasks`, `evidence`, `failures`) are present. Snapshot row counts are returned as evidence but are intentionally not compared with a pre-backup count because legitimate concurrent writes can occur during an online backup. A failed verification removes the invalid copy.

Pause/resume new claims:

```bash
node tools/percy-runtime/cli.mjs pause
node tools/percy-runtime/cli.mjs resume
```

The database defaults to `.percy/percy.sqlite`; override with `--db` or `PERCY_DB`.

Safety limits are deliberately bounded:

- active work defaults to **2** and may only be set within `1..4` using `PERCY_MAX_ACTIVE` or `--max-active`;
- READY queue depth defaults to **500** and may only be set within `1..100000` using `PERCY_MAX_QUEUED` or `--max-queued`;
- serialized task payload size defaults to **65,536 bytes** and may only be set within `1..1,048,576` using `PERCY_MAX_PAYLOAD_BYTES` or `--max-payload-bytes`.

A submission that would exceed the READY queue limit fails before insertion. The depth check and insert run under `BEGIN IMMEDIATE`, so concurrent submitters share one serialized admission boundary. Payload bytes are checked before the transaction begins; oversized payloads never enter the task table.

## Persistence, migration, crash recovery and shutdown

A claimed/running task has an owner and lease expiry. While the lease is active another worker cannot own it. Expired leases are recovered to `READY`; attempt count increases on the next claim. A stale owner cannot transition the task after ownership transfers.

The runtime includes an additive legacy migration for the earlier `queued/running/succeeded/failed` schema. It preserves queued/completed/failed history, maps old in-flight `running` rows to `STALE` rather than assuming they are still owned after restart, and creates the new evidence/failure tables. The migration is covered by a dedicated regression test and SQLite integrity check.

SIGINT/SIGTERM handling in `work-one` marks owned active work `STALE` before the process exits. Stale tasks can be explicitly requeued. Failures are preserved in a dedicated table rather than overwritten by later attempts.

Results and errors live in SQLite and survive process restart. WAL mode and `busy_timeout=5000` are enabled. `PRAGMA integrity_check` is exposed through the CLI.

## Evidence gate

The bounded worker records its result as evidence, including a digest, before transitioning to `VERIFYING`. The final verification step checks that evidence exists before `COMPLETE` is allowed.

Real provider adapters must use stronger evidence kinds—tests, benchmark outputs, checksums, review artifacts, or other task-specific verification—rather than treating a model response alone as proof.

## Tests

```bash
node --test tests/percyRuntime.test.mjs
node --test tests/percyRuntimeAdvanced.test.mjs
```

The current regression matrix covers:

- `READY -> CLAIMED -> RUNNING -> VERIFYING -> COMPLETE` persistence across reopen;
- completion blocked when evidence is absent;
- default two-active-task concurrency cap and third-claim rejection;
- READY queue-depth admission cap and capacity release after claim;
- payload-byte rejection before insertion;
- verified online backup plus restore of task, evidence, and failure history;
- refusal to overwrite an existing backup or back up onto the live DB path accidentally;
- duplicate-claim prevention;
- expired-lease recovery;
- stale-owner transition rejection;
- bounded retry exhaustion with failure preservation;
- pause/resume;
- graceful stale marking and requeue;
- legacy database migration with history preservation;
- database integrity after reopen/migration;
- recursive JSONL redaction of secret keys and embedded credential strings;
- class-based concurrency limiting;
- worker-loop lease heartbeats, evidence completion, and provider-slot wait ownership.

## Concurrency policy

Do **not** equate control-worker count with model-worker count.

For a 16-GB MacBook Air class machine:

- **default active Percy work: 2**;
- raise to 3–4 only for measured provider-bound/light workloads;
- heavy local-model work should normally remain at 1 active model process;
- remote/API providers need provider-specific rate/concurrency caps.

Promotion from 2 -> 3 -> 4 must be empirical. Monitor memory pressure, swap growth, provider throttling, latency, heartbeat stability, duplicate claims, DB lock contention, and failure rate.

Do **not** run 16 simultaneous resource-heavy local-model agents.

## Discord boundary

No verified Discord slash-command adapter is part of this runtime yet. Do not claim `ping`, `status`, `task`, `queue`, `pause`, or `resume` are operational until the adapter is inspected and exercised against this same SQLite store.

Required Discord gates:

- user/channel allowlist;
- zero secret/token logging;
- no second task-state database;
- pause stops new claims without corrupting running tasks;
- resume cannot duplicate execution;
- read commands redact sensitive arguments.

## Remaining qualification work

1. Run crash/kill/restart qualification on the actual Mac/Percy installation.
2. Measure two-worker contention/resource behavior on that machine; promote above two only from evidence.
3. Integrate the existing class limiter into real provider adapters and add provider-specific retry/backoff policy.
4. Wire the existing redacting JSONL logger into the primary CLI/worker entrypoints.
5. Schedule and exercise periodic verified backups on the actual Mac, including an operational restore drill.
6. Expose the existing worker loop through the primary launcher and add bounded jitter/backoff.
7. Add real provider adapters behind explicit interfaces.
8. Add Discord only as a thin authenticated adapter after the runtime is qualified.
9. Pin the exact production Node version.

Production reliability remains incomplete until the real Mac passes the crash/restart, multiworker contention and shutdown gates.
