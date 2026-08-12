# Percy durable runtime — reliability baseline

This directory is a deliberately small **single-host control-plane baseline**. It exists to prove reliable task ownership and persistent state before Percy grows more providers, agents, or Discord controls.

## Architecture

```text
CLI / future Discord adapter
        |
        v
SQLite task store (WAL)
  - queue
  - attempts
  - worker owner_id
  - lease expiry
  - heartbeat
  - result/error
        |
        v
bounded worker executor
  - echo
  - sleep
  - intentional fail (test only)
```

There is **no arbitrary shell task kind**. Provider/model adapters should be explicit allow-listed executors with their own concurrency and timeout limits.

## Requirements

- Node 22 with `node:sqlite` available.
- Treat the current Node SQLite API as a runtime dependency that must be pinned/tested because Node still emits an experimental-feature warning on some 22.x releases.

## Exact launcher

Initialize:

```bash
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

Inspect state:

```bash
node tools/percy-runtime/cli.mjs status
node tools/percy-runtime/cli.mjs integrity
```

Pause/resume new claims:

```bash
node tools/percy-runtime/cli.mjs pause
node tools/percy-runtime/cli.mjs resume
```

By default the database is `.percy/percy.sqlite`; override with `--db` or `PERCY_DB`.

## Persistence and crash recovery

A claimed task has an owner and lease expiry. While the lease is active another worker cannot claim it. If the worker disappears and the lease expires, another worker can claim it, incrementing the attempt count. A stale worker cannot complete a task after ownership transfers.

Results and errors live in SQLite and survive process restart. WAL mode and `busy_timeout=5000` are enabled. `PRAGMA integrity_check` is exposed through the CLI.

## Tests

```bash
node --test tests/percyRuntime.test.mjs
```

Coverage includes:

- submit → claim → complete → reopen persistence;
- duplicate-claim prevention;
- expired-lease recovery;
- stale-owner completion rejection;
- bounded retry exhaustion;
- pause/resume;
- database integrity after reopen.

A pre-PR local smoke also ran eight concurrent control workers against one SQLite database and processed twelve bounded sleep tasks exactly once; all twelve finished with one attempt and `integrity_check = ok`.

## Concurrency policy

Do **not** equate control-worker count with model-worker count.

Recommended initial caps for a 16-GB MacBook Air class machine:

- **control/queue workers:** 4 by default; 8 may be acceptable for mostly waiting/I/O work after measurement;
- **heavy local model workers:** 1;
- **lightweight local inference workers:** start at 1–2 and raise only after measuring memory pressure, latency and thermal throttling;
- **remote/API workers:** provider-specific cap, initially 2–4 unless provider limits require less.

The runtime still needs an explicit provider-cap table before heterogeneous workers are allowed to run continuously.

## Discord boundary

No committed Discord slash-command adapter was found in the connected source during this audit. Do not claim `/ping`, `/status`, `/task`, `/queue`, `/pause`, or `/resume` are implemented yet.

When added, Discord should call the same store/service methods rather than maintain separate state. Secrets must come from the host environment/Keychain or another secret manager and must never be written into task payloads, SQLite results, logs, or repository files.

## Remaining P0/P1 reliability work

1. Add graceful SIGINT/SIGTERM drain around a long-running worker loop.
2. Add per-provider semaphores/concurrency caps and backoff policy.
3. Add structured JSONL logs with redaction.
4. Add queue depth limits and payload-size limits.
5. Add periodic SQLite backup and restore test.
6. Add a long-running worker command that repeatedly claims tasks with jitter/backoff.
7. Add real provider adapters behind explicit interfaces.
8. Add Discord as a thin authenticated adapter only after the store/runtime is stable.
9. Run the crash/kill/restart test on the actual Mac/Percy installation, not only the isolated Node harness.
10. Pin the exact Node version used for production Percy because `node:sqlite` API stability is still a dependency risk.
