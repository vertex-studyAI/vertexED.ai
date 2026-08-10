# Project 2424 — First 100

**Updated:** 10 August 2026  
**Source:** `main` plus exact-head GitHub Actions evidence

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. This dashboard separates merged runnable/tested packages from the stricter nine-gate `Certified complete` count.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Runnable project packages merged and verified: **3**
- Tested project packages merged and verified: **3**
- Research-complete projects verified: **0**
- Demo-ready project packages merged and verified: **1**
- Projects with certified raw-result + independent-QA packages: **0**

The First-100 selection is a work queue, not a completed-project claim. A project may move to `DONE` only after the acceptance gate below is satisfied with inspectable evidence.

## Required certification evidence

Every project counted in `Certified complete` must have, at minimum:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. one ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

A project can be useful, runnable, and tested before it satisfies all nine certification gates. Those states are reported separately rather than discarded or inflated.

## Verified project packages on `main`

| # | ID | Name | Type | Implementation | Tests | Results | Docs | Status |
|---|---|---|---|---|---|---|---|---|
| 27 | T2424-0034 | Quant ML Visualizer | Developer / quant analytics tool | Merged: `portfolio/project2424/projects/T2424-0034/` | Exact head `b62475cec9d867209ce64ee58bb6a22f25633439` passed CI `31409366246`; merged as `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | Deterministic descriptive analytics/demo input; no predictive or alpha claim | README + STATUS | TESTED_TOOL / DEMO_READY; NOT CERTIFIED_COMPLETE |
| 29 | T2424-0036 | Rubik's A* Intelligence | Bounded search/tool prototype | Merged package from PR #169 | Exact head `422807799833247d6ea7ab095b557d26d41e2b57` passed CI `31409707818`; merged as `1b143eb8904e5568f9ed8db537951a701e22f88f` | Fixed six-scramble benchmark with returned-path verification; deliberately orientation-free 2×2 corner permutation model | README + STATUS | TESTED_TOOL; NOT FULL CUBE SOLVER; NOT CERTIFIED_COMPLETE |
| 52 | T2424-1767 | Resource-Bounded MoE Operator | Scientific-ML tooling prototype | Merged: `portfolio/project2424/projects/T2424-1767/` | Exact head `1496c991a3b00473700b2f4c3d173d428f793e9b` passed CI `31409012137`; merged as `8c4bb2b31140f8e580135a5595f2731b0068d146` | Deterministic synthetic cost/error benchmark only; no superiority claim | README + STATUS | TESTED_TOOL; NOT CERTIFIED_COMPLETE |
| Remaining 97 | See queue | See queue | Mixed | Unverified on `main` | Unverified on `main` | Unverified | Queue metadata only | EXECUTION_READY |

## Verified but deliberately unmerged packages

These do **not** increase the merged package counts above. They remain review artifacts because their PRs preserve explicit deployment/merge boundaries or currently require reconciliation with newer `main`:

- T2424-0035 Grokking Agent — PR #167, exact-head canonical CI passed; review-ready, not merged.
- T2424-0037 NLP-to-CAD — PR #165, diameter/radius parser defect repaired; exact-head canonical CI #629 passed; review-ready, not merged.
- T2424-0054 Theory-Manifold Experiment Planner — PR #170, exact-head canonical CI #627 passed; explicit no-auto-merge boundary.
- T2424-0028 Residual Event Tokenizer — PR #163, exact-head CI passed but explicit no-auto-merge boundary and current merge reconciliation required.

## Promotion rule

When a project becomes defensibly complete, move it from a tested/runnable state to `DONE` only after linking the exact implementation, test command, raw result artifact, verdict, and independent QA evidence. Do not increase `Certified complete` merely because a PR exists or CI is green.
