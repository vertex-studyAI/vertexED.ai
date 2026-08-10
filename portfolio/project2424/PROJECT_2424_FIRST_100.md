# Project 2424 — First 100

**Updated:** 10 August 2026  
**Source branch:** `agent/project2424-first100-20260810`

## Truth boundary

This dashboard counts only evidence present on this branch. Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Runnable project packages verified on this branch: **0**
- Tested project packages verified on this branch: **0**
- Research-complete projects verified on this branch: **0**
- Demo-ready project packages verified on this branch: **0**
- Projects with branch-local raw result artifacts: **0**

The First-100 selection is a work queue, not a completed-project claim. A project may move to `DONE` only after the acceptance gate below is satisfied with inspectable evidence.

## Required completion evidence

Every counted project must have, at minimum:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. one ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

## Status table

The canonical ordered list is maintained in:

- `FIRST_100_EXECUTION_WAVE.md`
- `FIRST_100_QUEUE.ndjson`

Until a project has its own evidence-backed package, its status remains `EXECUTION_READY`, not `DONE`.

| # | ID | Name | Type | Implementation | Tests | Results | Docs | Status |
|---|---|---|---|---|---|---|---|---|
| 1–100 | See queue | See queue | Mixed | Unverified | Unverified | Unverified | Queue metadata only | EXECUTION_READY |

## Promotion rule

When a project becomes defensibly complete, replace the aggregate row above with a project-specific row and link the exact implementation, test command, raw result artifact, verdict, and QA evidence. Do not increase the completed count without those links.
