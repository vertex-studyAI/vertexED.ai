# Project 2424 — First 100

**Updated:** 10 August 2026  
**Source:** current `main` plus exact-head GitHub Actions evidence

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. This dashboard separates substantive implementation progress from the stricter nine-gate `Certified complete` count.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100 / 100**
- Distinct First-100 entries with substantive verified packages: **13 / 100**
- Runnable/tested packages merged and verified on `main`: **5 / 100**
- Exact-head-green review-ready distinct packages not merged: **8 / 100**
- Research-complete projects verified: **0 / 100**
- Projects satisfying the full raw-result + independent-QA certification gate: **0 / 100**

A project may be useful, runnable, tested, or preserve a valuable negative result before it satisfies all nine certification gates. Those states are reported separately rather than inflated into completion.

## Required certification evidence

Every project counted as `Certified complete` must have:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. one ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

A green CI run proves the recorded implementation executes on that head. It does not by itself establish external validity, scientific superiority, publication readiness, deployment readiness, or completion under this gate.

## Verified project packages on `main`

| ID | Name | Exact evidence | Result boundary | Status |
|---|---|---|---|---|
| `T2424-0034` | Quant ML Visualizer | PR #166; head `b62475cec9d867209ce64ee58bb6a22f25633439`; CI `31409366246`; merge `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | deterministic descriptive analytics/demo; no predictive-alpha claim | `TESTED_TOOL / DEMO_READY`; not certified complete |
| `T2424-0036` | Rubik's A* Intelligence | PR #169; head `422807799833247d6ea7ab095b557d26d41e2b57`; CI `31409707818`; merge `1b143eb8904e5568f9ed8db537951a701e22f88f` | bounded orientation-free 2×2 corner-permutation search; not full cube solver | `TESTED_TOOL`; not certified complete |
| `T2424-0038` | Obscured Records editorial triage | PR #178; head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`; CI `31411209123`; merge `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | deterministic evidence gating; no factual/legal verification or autonomous publication | `TESTED_TOOL`; not certified complete |
| `T2424-1767` | Resource-Bounded MoE Operator | PR #162; head `1496c991a3b00473700b2f4c3d173d428f793e9b`; CI `31409012137`; merge `8c4bb2b31140f8e580135a5595f2731b0068d146` | synthetic abstract cost/error frontier; no Scientific-ML superiority claim | `TESTED_TOOL / SYNTHETIC_SCREEN`; not certified complete |
| `T2424-1863` | Resource-Bounded Local Operator | PR #177; head `8368b2daa9e7720cd972accee6e8d363f67c3a59`; dedicated reproduction `31411206631`; repository CI `31411208847`; merge `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | predeclared >75% improvement gate **failed** at 67.777%; coefficient 0.179689 vs planted 0.18; zero-diffusion control -0.029% | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`; not certified complete |

## Exact-head-green review-ready distinct packages

These do **not** increase the five-package merged count and must retain their explicit no-auto-merge/deployment boundaries.

| ID | Package | PR | Verified boundary |
|---|---|---:|---|
| `T2424-0024` | Trust Under Uncertainty | #172 | Brier/ECE/selective-risk/abstention evaluator on paired synthetic controls; first invalid ECE control was caught and repaired |
| `T2424-0026` | Counterfactual Defect Worlds | #174 | deterministic cellular-world intervention, divergence, and radius-one causal-cone mechanics |
| `T2424-0028` | Residual Event Tokenization | #163 | controlled residual-event codec/reconstruction mechanics |
| `T2424-0029` | Representation Phase Transitions for PDEs | #176 | analytic heat-equation spectral effective-rank experiment; “transition” is operational only |
| `T2424-0035` | Grokking Agent evaluator | #167 | delayed-vs-matched synthetic learning-curve detector; no real-model grokking claim |
| `T2424-0037` | Controlled NLP-to-CAD | #165 | controlled plate grammar to validated SVG/OpenSCAD; diameter/radius parser regression caught, repaired, and re-certified |
| `T2424-0053` | Scientific Motif Dictionary | #179 | exact head `298b739675850d4980a1397cd3bf5fefd699e5dc`; CI `31411557245`; deterministic z-normalized 1D motif indexing mechanics; no semantic/SOTA claim |
| `T2424-0054` | Theory-Manifold Experiment Planner | #170 | transparent cost/value/uncertainty/diversity planning heuristic; not optimal experimental design |

## Noncanonical duplicate/follow-up

PR #160 is an exact-head-green `T2424-0034` walk-forward/no-lookahead/transaction-cost follow-up produced before canonical `T2424-0034` landed through #166. It is **not** counted as a second project. Reconcile any useful changes into the canonical package rather than merging a duplicate tree.

## Promotion rule

Increase `Certified complete` only after linking the exact implementation, frozen protocol, clean run command, baseline, retained raw result, ablation/negative-result analysis, explicit verdict, and independent QA. A reproducible negative result may count as executed/tested work without becoming a successful hypothesis.

Do not double-count multiple implementations under the same registry ID. Do not convert CI success into a scientific or production claim that the evidence does not support.
