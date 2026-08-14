# PERCY_RELIABILITY_PLAN

**As of:** 2026-08-14 IST  
**Objective:** make Percy trustworthy before making it larger. Logical identities, task counts, and source files are not reliability evidence by themselves.

## Evidence boundary

### Retained implementation/test evidence

The retained Percy package/state supports a **bounded** claim that the system has meaningful control-plane machinery:

- Python package/repository and substantive task registry exist;
- SQLite-backed persistence/simulation has been exercised in retained tests;
- guarded/atomic task-claim and lock/lease behavior has bounded test evidence;
- a fake-provider task execution path was verified;
- historical SQLite integrity/quick-check evidence exists;
- worktree ownership code refuses reuse of an unowned/mismatched worktree path and checks project/repo ownership;
- retained queue logic orders READY work by priority/information-gain fields and checks dependencies before allocation;
- historical logical registry contains 16,256 identities, explicitly not physical workers.

These are **implementation/test claims**, not real-host production qualification.

### Not yet qualified as real-host capabilities

Do not claim these are reliable in production until live Mac evidence exists:

- crash/restart recovery;
- post-restart task/evidence state preservation;
- multiworker stress under contention;
- duplicate-execution stress under real provider latency/failure;
- stale lease expiry/reclaim under process death;
- WAL/backup/restore integrity on canonical host;
- graceful shutdown under active work;
- provider routing/fallback correctness;
- cost/compute accounting accuracy;
- queue fairness under heterogeneous workloads;
- measured resource-aware concurrency;
- current live queued/running/failed/blocked/complete counts.

## Infrastructure triage

| Capability | Decision | Why | Minimum evidence before promotion |
|---|---|---|---|
| Evidence-native task graph | **BUILD/CONSOLIDATE NOW** | directly prevents unsupported completion and links dependencies to evidence | schema + task dependency + required evidence manifests + tests that completion fails without evidence |
| Experiment registry | **KEEP / CANONICALIZE** | scientific lineage is already central to the portfolio | one canonical schema, protocol/version/hash fields, failed-run lineage, verifier |
| Claim ledger | **KEEP / CANONICALIZE** | prevents project-level status inflation | claim IDs linked to evidence and non-claims; machine-readable validation |
| Artifact hashing | **BUILD/VERIFY NOW** | cheap, high leverage for reproducibility and immutable negative results | hash raw/processed/config/code bundle and recheck on reproduction |
| Checkpointing | **VERIFY NOW** | state recovery is a core reliability prerequisite | non-destructive snapshot + restart comparison on canonical host |
| Crash recovery | **HIGHEST PRIORITY LIVE TEST** | system cannot be trusted without it | controlled kill during claimed task; restart; exactly-one execution/evidence state |
| Semantic task deduplication | **BUILD ONLY AFTER CANONICAL TASK SCHEMA** | valuable but dangerous if similarity merges scientifically distinct tasks | duplicate fixture set with false-positive/false-negative review and no evidence loss |
| Task canonicalization | **BUILD NOW** | current portfolio contains stale/superseded task lineage | explicit `SUPERSEDED_BY`, `DUPLICATE_OF`, `CHILD_OF`, `BLOCKED_BY` relations |
| Dependency graph | **KEEP / VERIFY** | allocation logic references dependencies; needs end-to-end evidence | blocked task cannot allocate; completion unlocks exactly intended dependents |
| Resource-aware scheduler | **VERIFY BEFORE EXPANDING** | concurrency must follow real bottlenecks | measured CPU/RAM/swap/DB/provider latency and verifier throughput under 1/2/3/... workers |
| Provider routing | **DEFER GENERALIZATION; TEST FAILURE PATH FIRST** | provider abundance is less important than truthful failure/retry | deterministic fake-provider + one real-provider failure/recovery test |
| Cost accounting | **BUILD BASIC COUNTERS** | needed before scale; not a reason to add providers | per task model/provider tokens/runtime/cost estimate with reconciliation |
| Compute accounting | **BUILD BASIC COUNTERS** | needed for matched scientific experiments and resource decisions | wall time, CPU/GPU/RAM peak, model calls per experiment/task |
| Project-level budgets | **BUILD AFTER BASIC ACCOUNTING** | protects portfolio convergence | hard/soft budget refusal with explicit override provenance |
| Queue fairness | **DEFER UNTIL RELIABILITY TESTS PASS** | fairness is secondary to no-loss/no-duplication | starvation fixtures and priority-class service metrics |
| Failed-run preservation | **KEEP / TEST EXPLICITLY** | scientific integrity requirement | failed task/artifacts survive retry/restart and remain addressable |
| Stale-task detection | **VERIFY LIVE** | leases are meaningless without stale recovery | kill worker, wait lease boundary, exactly-one reclaim, no double execution |
| Independent verifier agents | **USE AS ROLE, NOT AUTOMATIC INDEPENDENCE CLAIM** | separate code path is useful, but same system is not external independence | verifier cannot mutate source result; recomputes from raw; external independence labeled separately |
| Reviewer simulation | **KEEP AS DECISION SUPPORT** | cheap way to choose decisive experiment | every criticism maps to evidence requirement/experiment, never to automatic acceptance |
| Reproducibility bundles | **KEEP / STANDARDIZE** | already high-value across research lines | protocol/raw/processed/verifier/env/hashes/reproduce command |
| Automatic paper artifact generation | **BUILD AFTER PROVENANCE GRAPH** | automation is useful only when evidence chain is sound | figure/table generation consumes registered processed artifacts only |
| Scientific freeze/preregistration | **BUILD/ENFORCE NOW** | prevents goalpost movement | protocol hash/time precedes final/test outputs; code blocks protected seed sets |
| Provenance graph | **BUILD NOW, MINIMAL FIRST** | directly supports paper evidence law | `claim -> figure/table -> processed -> raw -> config -> commit` edges with missing-edge failure |

## Real-host qualification protocol

This is the next Percy engineering gate and does **not** authorize mass concurrency.

### A. Recover without mutation

1. identify canonical Percy root and executable version;
2. record Git branch/head/dirty state/worktrees;
3. locate SQLite DB, WAL, SHM, checkpoints and task artifact roots;
4. create a non-destructive backup while preserving WAL semantics;
5. run integrity/quick checks on the backup and record schema/version;
6. enumerate tasks by state, leases, heartbeats, workers, stale records, failures and blockers;
7. record CPU/RAM/swap/disk/process/provider state.

### B. Controlled failure tests

Use disposable fixture tasks, never irreplaceable experiments.

1. claim one task and kill worker before completion;
2. restart Percy and verify task state is recoverable and evidence is not fabricated;
3. let a lease become stale and verify exactly-one reclaim;
4. run two workers contending for the same fixture and verify one active claim;
5. force fake-provider failure and verify retry/failure state without duplicate side effects;
6. interrupt during artifact write and verify atomic/partial-artifact handling;
7. restore from snapshot and compare task/evidence hashes.

### C. Resource/concurrency sweep

Only after A/B pass:

- run identical bounded fixture workload at concurrency 1, 2, 3, ...;
- measure throughput, p50/p95 task latency, RAM/swap, DB lock time, provider rate-limit/failure rate, duplicate/stale rate and verifier backlog;
- stop increasing concurrency when marginal throughput falls, failures rise, verifier backlog grows, or resource pressure crosses the predeclared safety threshold.

**Concurrency is selected from the measured knee of this curve, not from logical registry size.**

## Percy release gate

Percy may be called **GREEN — real-host reliability candidate** only when:

- DB/WAL backup/recovery passes;
- crash/restart preserves task/evidence state;
- stale lease recovery is exactly-once;
- duplicate claim/execution test passes;
- failed runs remain preserved;
- artifact/claim evidence cannot be forged by task completion alone;
- provider failure path is truthful;
- measured resource/concurrency report exists;
- exact version/environment is recorded.

This still does not constitute external independent validation. A separate operator/reproducer is required for that label.