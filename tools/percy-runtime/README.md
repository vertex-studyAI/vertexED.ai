# Percy durable runtime — bounded reliability baseline

This directory is a small **single-host control-plane baseline**. It is intentionally narrower than a production Percy deployment: the goal is to prove persistent task ownership, bounded concurrency, crash recovery, evidence-gated completion, and operator visibility before adding real model providers or Discord control.

## Lifecycle

```text
READY -> CLAIMED -> RUNNING -> VERIFYING -> COMPLETE
```

Exceptional states are `FAILED`, `BLOCKED`, `STALE`, and `CANCELLED`.

SQLite is authoritative. WAL mode, foreign keys, a busy timeout, retained failure history, owner IDs, lease expiries, heartbeats, results, and SHA-256 evidence records are persisted. `VERIFYING -> COMPLETE` is refused when no evidence exists.

## Safety boundary

The built-in executor only allows `echo`, bounded `sleep`, and intentional `fail` tasks. There is **no arbitrary-shell executor**. Provider/model adapters must be explicit allow-listed task kinds with their own timeouts, idempotency strategy, and class limits.

Default active work is **2** and is hard-bounded to `1..4`. Provider/task-class semaphores apply an additional limit. A claimed task heartbeats while waiting for class capacity, and expired owners cannot start or revive an expired lease; this prevents the class-queue duplicate-execution path covered by the regression suite.

## Operator commands

Requires Node 22+ with `node:sqlite`.

```bash
# Database/integrity/status
node tools/percy-runtime/prime.mjs doctor
node tools/percy-runtime/prime.mjs status

# Submit bounded work
node tools/percy-runtime/prime.mjs submit --kind echo --payload '{"message":"hello"}'

# Run two control workers, but only one task in the "local-model" class
PERCY_CLASS_LIMITS='default=2,local-model=1' \
  node tools/percy-runtime/prime.mjs work --workers 2 --max-idle-ms 5000

# Pause/resume claims
node tools/percy-runtime/prime.mjs pause
node tools/percy-runtime/prime.mjs resume

# Online backup / restore
node tools/percy-runtime/prime.mjs backup --to .percy/backups/percy.sqlite
node tools/percy-runtime/prime.mjs restore --from .percy/backups/percy.sqlite --db .percy/restored.sqlite
```

`SIGINT`/`SIGTERM` requests a graceful drain: no new task is claimed, owned tasks finish their bounded execution, then the pool closes. A hard process death is recovered by lease expiry on the next claimant.

## Regression gates

```bash
node --test tests/percyRuntime.test.mjs tests/percyRuntimeAdvanced.test.mjs
```

Coverage includes lifecycle persistence, evidence-gated completion, active caps, duplicate-claim prevention, expired-lease recovery, rejection of expired-owner lease revival, stale-owner transitions, bounded retries, pause/resume, legacy migration, SQLite integrity, secret redaction, online backup/restore, queue/payload bounds, per-class concurrency, and a forced contention test where a 100 ms lease must survive a 160 ms class wait without duplicate execution.

## Claim boundary

This is **not production-qualified Percy**. It does not prove:

- reliability on the actual Mac installation under kill/restart/resource pressure;
- real provider/API/model adapters;
- distributed multi-host ownership;
- externally idempotent side effects;
- Discord authentication/control-plane behavior;
- production observability or SLOs.

Do not increase worker count because a launcher can create more processes. Promote beyond two active tasks only after real-machine measurements of memory pressure, swap, provider throttling, latency, lease stability, duplicate claims, SQLite contention, and failure rate.
