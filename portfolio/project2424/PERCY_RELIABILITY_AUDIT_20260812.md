# Percy reliability audit — source-access boundary

**Audit date:** 12 August 2026

## Result

`BLOCKED_SOURCE_FOR_RUNTIME_CERTIFICATION`

The connected GitHub repository exposes Percy operating/governance documentation, including the evidence-driven `docs/PERCY_16384X.md` directive, but the current connected source surface does **not** expose the actual local Percy runtime required for this account: installation metadata, worker implementation, queue/database code, provider abstraction, process lifecycle, Discord bot implementation, secrets integration or canonical launcher.

A code search on the connected `vertex-studyAI/vertexED.ai` repository for Percy worker/SQLite/heartbeat/task-queue/Discord implementation terms did not surface a runtime package. Therefore this audit does not invent one.

## What can be established

The Percy governance document itself requires evidence, durable state, anti-loop controls, safe prioritization, and verification rather than uncontrolled agent spawning. That is a useful operating contract but is **not proof that the runtime implements those properties**.

## Architecture status

| Component | Status in current connected evidence | Certification |
|---|---|---|
| installation/setup | runtime source unavailable | NOT INSPECTED |
| entrypoint/launcher | unavailable | NOT VERIFIED |
| provider abstraction | unavailable | NOT VERIFIED |
| task queue | unavailable | NOT VERIFIED |
| database/state persistence | unavailable | NOT VERIFIED |
| worker lifecycle | unavailable | NOT VERIFIED |
| structured logging | unavailable | NOT VERIFIED |
| retries/backoff/timeouts | unavailable | NOT VERIFIED |
| crash recovery | unavailable | NOT VERIFIED |
| locking/idempotency | unavailable | NOT VERIFIED |
| process cleanup | unavailable | NOT VERIFIED |
| Discord implementation | unavailable | NOT VERIFIED |
| secret storage | unavailable | NOT VERIFIED |

## Critical test matrix

The following tests were **not run** because the executable runtime and state store are not mounted/connected here:

1. start one worker;
2. submit one task;
3. persist result;
4. kill worker mid-task;
5. restart and verify task ownership/state;
6. run multiple workers;
7. detect duplicate execution;
8. validate locks/leases;
9. run database integrity check against the actual store;
10. graceful shutdown and process cleanup.

No item should be marked passed until a command, exact runtime identity and retained result exist.

## Safe concurrency recommendation

For a 16 GB consumer machine, the reliability gate should begin at **one resource-heavy local model worker at a time**, with the control plane kept lightweight. Increase only after measuring:

- resident memory per worker;
- system memory pressure / swap;
- task latency and throughput;
- DB lock/busy errors;
- provider rate-limit errors;
- duplicate/retry rate;
- heartbeat misses;
- cleanup after cancellation.

This is a conservative starting rule, **not an empirically measured Percy maximum**. Do not interpret it as proof that two, four or sixteen local model workers are safe.

## Reliability design requirements once source is mounted

### Queue and ownership

Every task should have at minimum:

- immutable task ID;
- state enum;
- owner worker ID;
- lease/acquired timestamp;
- heartbeat timestamp;
- attempt count;
- idempotency key or duplicate-prevention rule;
- started/finished timestamps;
- bounded error summary;
- result/evidence path.

Task acquisition should be atomic. A worker should never execute a task merely because it saw `queued` in a non-transactional read.

### Retries

- bounded retries;
- exponential backoff + jitter where provider calls are involved;
- explicit retryable vs terminal error classes;
- attempt history retained;
- no silent infinite retry loops;
- task timeout distinct from provider/network timeout.

### Heartbeat and crash recovery

- stable worker IDs per process;
- periodic heartbeat;
- lease expiry policy;
- orphaned task transition rule;
- restart reconciliation that does not duplicate already committed results;
- recovery tests with deliberate `SIGKILL`, not only clean exits.

### SQLite if it is the state store

Verify rather than assume:

- `PRAGMA integrity_check` / `quick_check`;
- journal mode and busy timeout;
- transaction boundaries for task claims;
- uniqueness constraints supporting idempotency;
- backup/restore command;
- behavior after process death during a write.

### Graceful shutdown

- stop accepting new work;
- finish or explicitly relinquish current leases;
- flush logs/state;
- close DB/provider clients;
- terminate child processes;
- prove no orphan processes remain.

### Structured logs

Recommended fields:

```text
timestamp level event task_id worker_id attempt provider duration_ms state error_class evidence_path
```

Never log provider tokens, Discord tokens, session cookies, raw OAuth credentials or full secret-bearing environment dumps.

## Discord control plane

The requested commands are reasonable as a control surface only after authorization is explicit:

- `ping`
- `status`
- task submission
- queue inspection
- `pause`
- `resume`

Requirements:

- allowlisted server/user/role IDs;
- no secret values in command responses;
- task payload size limits;
- command audit log;
- destructive/admin controls fail closed;
- rate limiting;
- status output contains IDs/state summaries, not credentials.

## Exact launcher

**Not verified.** The exact Percy launcher cannot be responsibly supplied from the connected evidence because no canonical runtime entrypoint is visible. Any fabricated `python -m percy`, `percy start`, shell script name or worker count would violate this audit's evidence rule.

A read-only local probe was produced separately to discover the actual installation, entrypoint candidates, SQLite files, reliability mechanisms and secret-file hygiene without printing secret contents or mutating state.

## Bugs fixed

None claimed in Percy runtime. Runtime source was unavailable, so there was no legitimate code target to patch.

## Unresolved P0 reliability risks

1. canonical runtime/launcher identity unavailable;
2. queue claim atomicity unknown;
3. task persistence and crash recovery unknown;
4. duplicate execution behavior unknown;
5. state-store integrity/locking configuration unknown;
6. worker/resource bounds unknown empirically;
7. Discord authorization and secret handling unverified;
8. process cleanup and graceful shutdown unverified.

These are unknowns, not confirmed defects.
