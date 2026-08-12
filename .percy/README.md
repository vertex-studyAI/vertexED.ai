# Percy Durable State

This directory stores evidence-backed **durable control snapshots** for the Percy 16384X execution engine. The files are not, by themselves, proof that a worker, heartbeat, lease, local queue or long-running Percy runtime is currently alive.

Rules:

- Count only real, verified iterations.
- Never store credentials, private keys, passwords, invite codes, or service-role secrets.
- Revalidate external state before acting on it.
- Use isolated branches for changes.
- Preserve exact blockers and continuation points.
- `portfolio/portfolio.yaml` remains the detailed human-maintained control source during bootstrap; `.percy/portfolio.json` is the execution snapshot.
- Treat stale durable state as stale. Do not interpret an old `active_task`, task ranking or blocker snapshot as a current scheduler decision without revalidation.

## State doctor

Run:

```bash
node scripts/percy-state-doctor.mjs
```

The doctor validates:

- schema versions;
- completed/last/next iteration continuity;
- task-rank uniqueness and basic queue structure;
- blocker-id uniqueness;
- snapshot timestamps and cross-file timestamp skew;
- snapshot freshness.

A stale but structurally valid snapshot returns a `STALE_SNAPSHOT` verdict and exit code `0`, because historical durable state can be valid without being current runtime state.

Before launching or resuming a Percy runtime, require freshness explicitly:

```bash
node scripts/percy-state-doctor.mjs --require-fresh --max-age-hours=24
```

With `--require-fresh`, stale/unknown freshness exits with code `2`. Structural corruption exits with code `1` in all modes.

The doctor intentionally reports `runtimeEvidence: false`: freshness and structural validity still do not prove a live worker or queue. A runtime-resume gate must separately verify the actual process, database/queue, leases/heartbeats and persisted task progression.
