# PERCY_RELIABILITY_PLAN

**As of:** 2026-08-14 IST  
**Objective:** make Percy trustworthy before making it larger. Logical identities, queue rows and source code are not worker-throughput or production-reliability evidence.

## Evidence boundary

Retained state supports bounded claims that Percy has substantive control-plane machinery: persistent task/state concepts, leases/dependencies, evidence-aware execution patterns, historical integrity checks and a registry specification of **16,256 logical identities**. It does **not** establish 16,256 physical workers, 16,256 completed unique tasks or current host health.

The canonical Mac `/Volumes/PRO-BLADE/Atlas/Percy` SQLite/WAL/process state is not observable here, so live queue counts, leases/heartbeats, worker population, stale state, provider health and resource pressure remain `UNKNOWN` until `PERCY-STATE-001` executes read-only on the real host.

## Infrastructure triage

| Capability | Decision | Promotion evidence |
|---|---|---|
| Evidence-native task graph | **CONSOLIDATE NOW** | task cannot complete without required evidence manifest; dependency tests |
| Claim ledger | **KEEP/CANONICALIZE** | machine validation of claims, non-claims and evidence links |
| Experiment ledger | **KEEP/CANONICALIZE** | one protocol/version/hash/failed-run lineage; no conflicting second mutable registry |
| Artifact hashing | **BUILD/VERIFY NOW** | raw/processed/config/code hashes survive replay |
| Checkpointing | **VERIFY LIVE** | non-destructive snapshot + restart comparison |
| Crash recovery | **HIGHEST PRIORITY LIVE TEST** | kill process mid-fixture; restart preserves exactly one truthful task/evidence state |
| Task canonicalization | **BUILD NOW** | `SUPERSEDED_BY`, `DUPLICATE_OF`, `CHILD_OF`, `BLOCKED_BY` relations |
| Semantic deduplication | **AFTER CANONICAL SCHEMA** | reviewed duplicate/non-duplicate fixtures; distinct hypotheses never merged by text similarity alone |
| Dependency graph | **VERIFY** | blocked task cannot allocate; completion unlocks only intended children |
| Resource-aware scheduler | **VERIFY BEFORE SCALE** | measured throughput/resource curve |
| Provider routing | **FAILURE PATH FIRST** | deterministic failure/retry truth before routing optimization |
| Cost accounting | **BASIC NOW** | per-task model/provider/tokens/runtime/cost with reconciliation |
| Compute accounting | **BASIC NOW** | wall time, CPU/GPU/RAM peak and calls per task/experiment |
| Project budgets | **AFTER ACCOUNTING** | hard/soft budget enforcement + override provenance |
| Queue fairness | **DEFER** | starvation metrics only after no-loss/no-duplication passes |
| Failed-run preservation | **KEEP + TEST** | failed artifacts survive retry/restart and remain queryable |
| Stale-task detection | **VERIFY LIVE** | killed-worker lease expires; exactly-one reclaim; no double side effect |
| Independent verifier agents | **USE AS INTERNAL ROLE** | verifier recomputes from raw and cannot mutate source result; never call same-system verification external independence |
| Reviewer simulation | **KEEP** | criticism maps to evidence/decisive experiment, not automatic acceptance |
| Repro bundles | **STANDARDIZE** | protocol/raw/processed/verifier/env/hashes/reproduce command |
| Auto paper artifacts | **AFTER PROVENANCE GRAPH** | tables/figures consume registered processed artifacts only |
| Scientific freeze | **ENFORCE NOW** | protocol hash/time precedes reserved/final outputs |
| Provenance graph | **MINIMAL NOW** | `claim -> table/figure -> processed -> raw -> config -> commit`; missing edge blocks release |

## Real-host qualification

### A — recover without mutation
1. identify canonical root, Git branch/head/dirty state and executable version;
2. locate SQLite DB, WAL/SHM, checkpoints and artifact roots;
3. take a consistent non-destructive backup preserving WAL semantics;
4. hash DB/WAL/checkpoint and run integrity/quick checks against the backup;
5. record schema/version and tasks by state, dependencies, leases, heartbeats, stale records, failures and blockers;
6. record active processes, CPU/RAM/swap/disk and provider state;
7. independently recount the snapshot before any scheduling change.

### B — controlled failure fixtures
Use disposable fixture tasks, never irreplaceable scientific experiments.

1. claim one fixture and kill the worker before completion;
2. restart Percy and verify no fabricated completion/evidence;
3. expire a lease and verify exactly-one reclaim;
4. contend two workers for one fixture and verify one claim/side effect;
5. force fake-provider failure and verify truthful retry/failure state;
6. interrupt artifact write and verify partial/atomic handling;
7. snapshot/restore and compare task/evidence hashes;
8. verify failed-run lineage remains queryable after retry/restart.

### C — measured concurrency sweep
Only after A/B pass, run the same bounded fixture workload at concurrency `1,2,3,...` and record throughput; p50/p95 task latency; RAM/swap/CPU/GPU/disk pressure; SQLite lock/wait; provider rate-limit/failure; duplicate/stale/retry rate; verifier backlog; and cost per **verified** completed task.

Stop increasing concurrency when marginal verified throughput flattens, error/duplicate/stale rate rises, verifier backlog grows or predeclared resource thresholds are crossed. Select the measured knee, not a logical identity count.

## Reliability release gate

Percy can become **GREEN — real-host reliability candidate** only when:
- DB/WAL backup/restore/integrity passes;
- crash/restart preserves task/evidence state;
- stale-lease recovery is exactly once;
- duplicate claim/execution fixture passes;
- failed runs remain preserved;
- task completion cannot forge evidence/claim state;
- provider failure path is truthful;
- measured concurrency/resource report exists;
- exact version/environment is recorded.

External independent validation remains a separate gate requiring another operator/environment.

## Scale prohibition

Until this qualification passes, do not launch huge worker populations or infer capacity from 16,256 logical identities. Any concurrency increase must be justified by measured verified throughput, hardware/provider bottlenecks, cost and verifier capacity.
