# CANONICAL OUTPUT COVERAGE

**As of:** 2026-08-14 22:09 IST  
**Purpose:** satisfy the closeout contract without creating duplicate truth sources.

| Required function/name | Canonical file used | State in this convergence branch | Duplicate-file rule |
|---|---|---|---|
| `MASTER_STATUS.md` | `MASTER_STATUS.md` | existing current-main truth preserved | update canonical only |
| `RESEARCH_STATUS.md` | `RESEARCH_STATUS.md` | existing | update canonical only |
| `PRODUCT_STATUS.md` | `PRODUCT_STATUS.md` | reconciled with latest product blockers | update canonical only |
| `MASTER_PORTFOLIO_REGISTRY.json` | `MASTER_PORTFOLIO_REGISTRY.json` | **added machine-readable companion** | human A–F table remains dated snapshot |
| `MASTER_PORTFOLIO_REGISTRY.md` | pointer/coverage contract of same name | **added pointer only** | must not duplicate snapshot table |
| `PROJECT_2424_CANONICAL_MAP.json` | same name | **added partial/source-gated map** | unknown IDs remain unknown |
| `PROJECT_2424_DISPOSITION_MATRIX.md` | same name | **added partial human view** | only directly evidence-backed IDs dispositioned |
| `CLAIM_LEDGER.md/json` | `CLAIM_LEDGER.md`, `CLAIM_LEDGER.json` | existing | do not create second claim registry |
| `EXPERIMENT_LEDGER.md/json` | `EXPERIMENT_LEDGER.md`, `EXPERIMENT_LEDGER.json` | existing | do not create second experiment registry |
| `EVIDENCE_REGISTRY.md/json` | `EVIDENCE_REGISTRY.md`, `EVIDENCE_REGISTRY.json` | **added evidence-location index** | does not own claim state |
| `FAILURE_ATLAS.md` | `RESEARCH_FAILURE_ATLAS.md` | existing canonical equivalent | do **not** create parallel `FAILURE_ATLAS.md` |
| `NEXT_TASK_QUEUE.md/json` | `NEXT_TASK_QUEUE.md`, `NEXT_TASK_QUEUE.json` | human queue reconciled; current-main JSON preserved | one live queue only |
| `BLOCKER_LEDGER.md` | `BLOCKERS.md` | reconciled canonical equivalent | do **not** create parallel blocker table |
| `HUMAN_ACTION_QUEUE.md` | `USER_ACTION_REQUIRED.md` | reconciled canonical equivalent | do **not** create parallel human-action queue |
| `EXTERNAL_VALIDATION_QUEUE.md` | same name | existing | package readiness ≠ external validation |
| `RELEASE_READINESS.md` | `PUBLIC_RELEASE_READINESS.md` | existing canonical equivalent | do **not** create parallel release table |
| `SUBMISSION_MATRIX.md` | same name | existing | submission ≠ acceptance/publication |
| `ARCHIVE_KILL_LIST.md` | `ARCHIVE_AND_KILL_LIST.md` | existing canonical equivalent | preserve archive history |
| `SECURITY_STATUS.md` | same name | **added** | source/local/live states separated |
| `DEPLOYMENT_STATUS.md` | same name | **added** | source SHA ≠ served revision |
| `REPRODUCIBILITY_STATUS.md` | same name | **added** | internal ≠ independent ≠ external validation |
| `COLLEGE_EVIDENCE_LEDGER.md` | same name | **added evidence-bounded ledger** | no unsupported scale/prestige/user claims |
| `MORNING_1000_CLOSEOUT.md/json` | same names | to be created as **PRECHECKPOINT_NOT_FINAL** in this run | may only be labeled FINAL with evidence observed at/after checkpoint |

## Other canonical files that remain authoritative

- `PORTFOLIO_SNAPSHOT_20260814.md` — dated human A–F disposition table.
- `PORTFOLIO_SNAPSHOT.md` — same-day delta pointer.
- `PORTFOLIO_CANONICALIZATION.md` — one-truth hierarchy and identity/versioning law.
- `PUBLIC_RELEASE_READINESS.md` — release gate status.
- `30_DAY_EXECUTION_PLAN.md` — longer-horizon execution plan; not a live task queue.

## Finalization law

A filename existing does not make its contents complete. The morning closeout must preserve `UNKNOWN`, `BLOCKED`, negative results and external dependencies exactly. Future updates should modify the canonical equivalents listed above instead of creating another family of status/queue files.
