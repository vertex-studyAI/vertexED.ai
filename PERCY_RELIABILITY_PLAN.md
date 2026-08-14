# PERCY_RELIABILITY_PLAN

**As of:** 2026-08-14 IST  
**Objective:** make Percy trustworthy before making it larger. Logical identities and task rows are not worker throughput or reliability evidence.

## Retained evidence boundary

Retained repository/state evidence supports only bounded claims that Percy has substantive control-plane machinery: persistent task/state storage, task/lease concepts, dependency-aware allocation, bounded execution/provider fixtures, historical integrity checks, worktree ownership protections, and a registry specification of **16,256 logical identities**. This does **not** prove 16,256 physical workers or current live host health.

Because the canonical Mac `/Volumes/PRO-BLADE/Atlas/Percy` SQLite/WAL/process state is unavailable from this execution surface, current queue counts, live leases/heartbeats, worker population, stale state, provider health and resource pressure remain `UNKNOWN` until `PERCY-STATE-001` runs read-only on the real host.

## Infrastructure triage

| Capability | Decision | Minimum evidence before promotion |
|---|---|---|
| Evidence-native task graph | **BUILD/CONSOLIDATE NOW** | completion cannot occur without required evidence manifests; dependency tests |
| Experiment registry | **KEEP/CANONICALIZE** | one schema with protocol/version/hash/failed-run lineage |
| Claim ledger | **KEEP/CANONICALIZE** | claim IDs, non-claims and evidence links validated machine-readably |
| Artifact hashing | **BUILD/VERIFY NOW** | raw/processed/config/code bundle hashes survive reproduction |
| Checkpointing | **VERIFY LIVE** | non-destructive snapshot + restart comparison on canonical host |
| Crash recovery | **HIGHEST PRIORITY LIVE TEST** | process kill during fixture; restart preserves exactly one task/evidence state |
| Task canonicalization | **BUILD NOW** | explicit `SUPERSEDED_BY`, `DUPLICATE_OF`, `CHILD_OF`, `BLOCKED_BY` relations |
| Semantic deduplication | **AFTER TASK SCHEMA** | reviewed fixture set with measured false merges/misses; never merge distinct scientific hypotheses merely by text similarity |
| Dependency graph | **VERIFY END-TO-END** | blocked task cannot allocate; completion unlocks only intended children |
| Resource-aware scheduler | **VERIFY BEFORE SCALE** | throughput/resource curve under measured concurrency |
| Provider routing | **TEST FAILURE PATH FIRST** | deterministic failure/retry evidence before multi-provider optimization |
| Cost accounting | **BUILD BASIC** | per-task provider/model/tokens/runtime/cost estimate with reconciliation |
| Compute accounting | **BUILD BASIC** | wall time, CPU/GPU/RAM peak and calls per task/experiment |
| Project budgets | **AFTER ACCOUNTING** | hard/soft limits and override provenance |
| Queue fairness | **DEFER** | starvation/fairness metrics only after no-loss/no-dup reliability passes |
| Failed-run preservation | **KEEP + TEST** | failed artifacts survive retry/restart and remain addressable |
| Stale-task detection | **VERIFY LIVE** | kill worker, let lease expire, exactly-one reclaim, no double execution |
| Independent verifier agents | **USE AS ROLE, NOT EXTERNAL INDEPENDENCE** | verifier cannot mutate source result; recomputes from raw |
| Reviewer simulation | **KEEP** | criticism maps to evidence/decisive experiment, never automatic acceptance |
| Reproducibility bundles | **STANDARDIZE** | protocol/raw/processed/verifier/env/hashes/reproduce command |
| Paper artifact generation | **AFTER PROVENANCE GRAPH** | table/figure generators consume registered processed artifacts only |
| Scientific freeze/preregistration | **ENFORCE NOW** | protocol hash/time precedes reserved/final outputs |
| Provenance graph | **BUILD MINIMAL NOW** | `claim -> table/figure -> processed -> raw -> config -> commit`; missing edge is a blocker |

## Real-host qualification protocol

### A — recover without mutation

1. identify canonical Percy root, Git head/branch/dirty state and executable version;
2. locate SQLite DB, WAL/SHM, checkpoints and artifact roots;
3. take a non-destructive online/consistent backup preserving WAL semantics;
4. hash DB/WAL/checkpoint and run integrity/quick checks on the backup;
5. record schema/version and enumerate tasks by state, dependencies, leases, heartbeats, stale records, failures and blockers;
6. record active processes plus CPU/RAM/swap/disk/provider state;
7. independently recount from the snapshot before any scheduling change.

### B — controlled failure fixtures

Use disposable fixture tasks, never irreplaceable scientific experiments.

1. claim a fixture and kill the worker before completion;
2. restart Percy and verify no fabricated completion/evidence;
3. let a lease become stale and verify exactly-one reclaim;
4. run two workers contending for one fixture and verify only one active claim/side effect;
5. force fake-provider failure and verify truthful retry/failure state;
6. interrupt an artifact write and verify partial/atomic handling;
7. snapshot/restore and compare task/evidence hashes;
8. verify failed-run history remains queryable after retry and restart.

### C — measured concurrency sweep

Only after A/B pass, run the same bounded fixture workload at concurrency `1, 2, 3, ...` and record:

- throughput;
- p50/p95 task latency;
- RAM/swap/CPU/GPU/disk pressure;
- SQLite lock/wait time;
- provider rate-limit/failure rate;
- duplicate/stale/retry rate;
- verifier backlog/latency;
- cost per verified completed task.

Stop increasing concurrency when marginal verified throughput flattens, failure/duplicate/stale rate rises, verifier backlog grows, or predeclared resource thresholds are crossed. **Choose concurrency from the measured knee, not registry size.**

## Reliability release gate

Percy may become **GREEN — real-host reliability candidate** only when all are evidenced:

- DB/WAL backup/restore/integrity passes;
- crash/restart preserves task and evidence state;
- stale lease recovery is exactly once;
- duplicate claim/execution fixture passes;
- failed runs remain preserved;
- task completion alone cannot forge evidence/claims;
- provider failure path is truthful;
- measured resource/concurrency report exists;
- exact version/environment is recorded.

This remains distinct from **external independent validation**, which requires another operator/environment.

## Scale prohibition

Until the above gate passes, do not launch enormous worker populations or infer capacity from the 16,256 logical registry. New concurrency must be justified by measured verified throughput, hardware/provider limits and verifier capacity.