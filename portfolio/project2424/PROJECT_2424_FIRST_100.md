# Project 2424 — First 100

**Updated:** 10 August 2026  
**Queue source:** `FIRST_100_QUEUE.ndjson`  
**Follow-on evidence:** `FOLLOWON_EXECUTION_EVIDENCE_20260810.md`

## Truth boundary

Being selected into the First-100 queue is **not** completion evidence. Likewise, a green implementation PR is not automatically a certified First-100 completion: the strict promotion gate below also requires frozen protocol/result/negative-analysis/QA evidence appropriate to the project.

### Strict certified count

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100 / 100**
- Certified packages merged into this dashboard branch: **0 / 100**

### Follow-on implementation wave

- Substantive First-100 package PRs created: **8**
- Exact-head canonical CI verified: **8 / 8**
- Review-ready: **8 / 8**
- Merged to `main`: **0 / 8**
- Promoted through the full First-100 completion gate: **0 / 8**

These eight candidates represent real implementation progress without changing the strict 0/100 completion count prematurely.

## Follow-on candidate table

| Queue ID | Package | PR | Implementation | Regression gate | Controlled experiment/demo | Docs | Current state |
|---|---|---:|---|---|---|---|---|
| T2424-0024 | Trust Under Uncertainty | #172 | Yes | Exact-head CI passed after fixing invalid synthetic calibration control | Paired calibration/selective-risk experiment | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0026 | Counterfactual Defect Worlds | #174 | Yes | Exact-head CI passed | Rule-110 paired intervention experiment | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0028 | Residual Event Tokenization | #163 | Yes | Exact-head CI passed | Deterministic residual-event threshold sweep | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | Yes | Exact-head CI passed | Analytic heat-equation spectral sweep | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0034 | Quant ML Visualizer | #160 | Yes | Exact-head CI passed | Walk-forward browser/demo baseline | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0035 | Grokking Agent | #167 | Yes | Exact-head CI passed | Delayed-vs-matched learning-curve controls | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0037 | Controlled NLP-to-CAD | #165 | Yes | Exact-head CI passed after parser bug repair | Plate-to-OpenSCAD/SVG demo | README + STATUS | REVIEW_READY_CANDIDATE |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | Yes | Exact-head CI passed | Cost/diversity constrained decision run | README + STATUS | REVIEW_READY_CANDIDATE |

## Why the certified count is still 0

The package PRs above contain meaningful code, tests, documentation and controlled experiment/demo entry points. They are not counted as fully complete here because:

1. they remain open/unmerged to avoid an implicit deployment path without explicit authorization;
2. controlled/synthetic mechanics tests are not external scientific results;
3. several research candidates still need frozen external or real-data protocols, raw result artifacts and negative/ablation analysis; and
4. the strict gate requires independent QA beyond the branch's own implementation test evidence.

## Required completion evidence

Every project counted as certified complete must have, at minimum:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. one ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

## Canonical queue

The ordered First-100 selection remains in:

- `FIRST_100_EXECUTION_WAVE.md`
- `FIRST_100_QUEUE.ndjson`

Unimplemented rows remain `EXECUTION_READY`, not `DONE`.

## Promotion rule

A candidate may increase the strict certified count only after its implementation, exact test command, raw result artifact, verdict and independent QA evidence are linked here. Do not infer certification merely from queue membership, PR creation, CI success or presentation quality.
