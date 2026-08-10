# Project 2424 — First 100

**Updated:** 10 August 2026  
**Source:** current `main` plus exact-head GitHub Actions evidence

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. This dashboard separates substantive implementation progress from the stricter nine-gate `Certified complete` count.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100 / 100**
- Distinct First-100 entries with substantive verified packages: **13 / 100**
- Runnable/tested packages merged on `main`: **5 / 100**
- Exact-head-green review-ready packages not merged: **8 / 100**
- Research-complete projects verified: **0 / 100**
- Demo-ready merged package count: **1 / 100**
- Projects satisfying the full raw-result + independent-QA certification gate: **0 / 100**

A project may be useful, runnable and tested before it satisfies all nine certification gates. Those states are reported separately rather than discarded or inflated.

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

## Verified project packages on `main`

| ID | Name | Merge evidence | Test/result evidence | Current status |
|---|---|---|---|---|
| T2424-0034 | Quant ML Visualizer | PR #166 merged as `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | exact head `b62475cec9d867209ce64ee58bb6a22f25633439` passed CI `31409366246`; deterministic descriptive quant analytics/demo | TESTED_TOOL / DEMO_READY; NOT CERTIFIED_COMPLETE |
| T2424-0036 | Rubik's A* Intelligence | PR #169 merged as `1b143eb8904e5568f9ed8db537951a701e22f88f` | exact head `422807799833247d6ea7ab095b557d26d41e2b57` passed CI `31409707818`; fixed six-scramble returned-path verification | TESTED_TOOL; bounded orientation-free 2×2 corner-permutation model; NOT CERTIFIED_COMPLETE |
| T2424-0038 | Obscured Records editorial triage | PR #178 merged as `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | exact head `abf8c998bab4bc0adedfb3d1d1a19432603c355f` passed CI `31411209123`; deterministic evidence-gated editorial triage controls | TESTED_TOOL; does not verify factual/legal truth or autonomously publish; NOT CERTIFIED_COMPLETE |
| T2424-1767 | Resource-Bounded MoE Operator | PR #162 merged as `8c4bb2b31140f8e580135a5595f2731b0068d146` | exact head `1496c991a3b00473700b2f4c3d173d428f793e9b` passed CI `31409012137`; retained synthetic resource/error screen with explicit no-superiority boundary | TESTED_TOOL / SYNTHETIC_SCREEN; NOT CERTIFIED_COMPLETE |
| T2424-1863 | Resource-Bounded Local Operator | PR #177 merged as `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | exact package evidence preserves 20-seed result: 67.777% RMSE improvement vs predeclared >75% gate, learned coefficient 0.179689 vs planted 0.18, zero-diffusion control -0.029%; verdict retained negative/inconclusive | EXECUTED_NEGATIVE_SCREEN; NOT CERTIFIED_COMPLETE |

### Scientific result boundary for merged screens

T2424-1767 and T2424-1863 contain retained synthetic screening evidence. They are **not** represented as real-data scientific validation or publication-ready results. In particular, T2424-1863 failed its predeclared >75% improvement gate and the threshold was not relaxed after observing 67.777%.

## Exact-head-green review-ready packages not merged

These eight **distinct** First-100 entries have substantive implementation/test/doc packages and successful exact-head canonical CI, but remain unmerged and therefore do not increase the `main` package count:

| ID | Package | PR | Evidence boundary |
|---|---|---:|---|
| T2424-0024 | Trust Under Uncertainty | #172 | Brier/ECE/selective-risk/abstention evaluator on paired synthetic confidence controls; first invalid control fixture was caught and repaired |
| T2424-0026 | Counterfactual Defect Worlds | #174 | deterministic cellular-world interventions, divergence and radius-one causal-cone verification |
| T2424-0028 | Residual Event Tokenization | #163 | causal residual-event codec with deterministic reconstruction/error contracts on controlled series |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | analytic heat-equation spectral dimension/diffusivity experiment; “transition” is operational effective-rank change only |
| T2424-0035 | Grokking Agent evaluator | #167 | delayed-vs-matched synthetic learning-curve evaluator; no real-model grokking claim |
| T2424-0037 | Controlled NLP-to-CAD | #165 | controlled plate grammar to validated SVG/OpenSCAD; diameter/radius parser defect caught, repaired and re-certified |
| T2424-0053 | Scientific Motif Dictionary | #179 | deterministic z-normalized 1D motif indexing/recovery mechanics; no scientific-meaning or SOTA claim |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | transparent cost/value/uncertainty/diversity heuristic; not optimal experimental design |

## Noncanonical follow-up not double-counted

PR #160 is a separate exact-head-green T2424-0034 walk-forward quant/ML follow-up created before the canonical T2424-0034 package was merged via #166. It is **not counted as a second project**. Its no-lookahead/transaction-cost work should be reconciled into the canonical T2424-0034 package rather than merged as a duplicate tree.

## Promotion rule

When a project becomes defensibly complete, move it from a tested/runnable state to `DONE` only after linking the exact implementation, test command, raw result artifact, verdict and independent QA evidence. Do not increase `Certified complete` merely because a PR exists, CI is green, a synthetic screen passes, or a package is merged.
