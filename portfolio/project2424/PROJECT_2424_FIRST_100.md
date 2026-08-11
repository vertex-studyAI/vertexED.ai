# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** `main` plus exact-head GitHub Actions evidence

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. This dashboard separates merged runnable/tested packages from the stricter nine-gate `Certified complete` count.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Runnable project packages merged and verified: **7**
- Tested project packages merged and verified: **7**
- Research-complete projects verified: **0**
- Demo-ready project packages merged and verified: **1**
- Projects with certified raw-result + independent-QA packages: **0**

The First-100 selection is a work queue, not a completed-project claim. A project may be useful, runnable, tested, or even preserve a valuable negative result before it satisfies all nine certification gates.

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

A green CI run proves the recorded package executes on that head. It does **not** by itself establish external validity, scientific superiority, publication readiness, deployment readiness, or completion under this gate.

## Verified project packages on `main`

| Queue rank | ID | Name | Type | Implementation | Exact-head verification | Result boundary | Status |
|---:|---|---|---|---|---|---|---|
| 27 | `T2424-0034` | Quant ML Visualizer | Developer / quant analytics tool | `portfolio/project2424/projects/T2424-0034/` | head `b62475cec9d867209ce64ee58bb6a22f25633439`, CI `31409366246`, merged `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | Deterministic descriptive analytics/demo input only; no predictive or alpha claim | `TESTED_TOOL / DEMO_READY`; not certified complete |
| 29 | `T2424-0036` | Rubik's A* Intelligence | Bounded search/tool prototype | merged package from PR #169 | head `422807799833247d6ea7ab095b557d26d41e2b57`, CI `31409707818`, merged `1b143eb8904e5568f9ed8db537951a701e22f88f` | Six-scramble returned-path benchmark on orientation-free 2×2 corner permutations; not a full cube solver | `TESTED_TOOL`; not certified complete |
| 31 | `T2424-0038` | Obscured Records Agent | Editorial research-triage tool | `portfolio/project2424/projects/T2424-0038/` | head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`, CI `31411209123`, merged `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | Deterministic evidence-gating only; supplied evidence values are not truth scores; no autonomous publication | `TESTED_TOOL`; not certified complete |
| 39 | `T2424-0046` | Auto-Research Foundry | Research-planning / evidence-gating tool | `portfolio/project2424/projects/T2424-0046/` | head `88dad71acca583a80ae2496b1278f88a825b4766`, CI `31414879015`, merged `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502` | Deterministic manifest/dependency/budget/evidence mechanics only; the tool does not execute manifest commands or establish scientific correctness | `TESTED_TOOL`; not certified complete |
| 43 | `T2424-0050` | Benchmark Augmentation Theory | Benchmark-audit prototype | `portfolio/project2424/projects/T2424-0050/` | recovery head `b1342b274157786c2885b54cfa10f9b63b4b6200`, CI `31449794955`, merged `615fb12f26963a355553f10379df85d26323c4ea` | Synthetic shortcut-exposure mechanism only; no benchmark-validity theorem, semantic guarantee or real-model robustness claim | `TESTED_TOOL`; not certified complete |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | Scientific-ML tooling prototype | `portfolio/project2424/projects/T2424-1767/` | head `1496c991a3b00473700b2f4c3d173d428f793e9b`, CI `31409012137`, merged `8c4bb2b31140f8e580135a5595f2731b0068d146` | Deterministic synthetic cost/error frontier in abstract resource units; no Scientific-ML superiority claim | `TESTED_TOOL`; not certified complete |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | Negative/inconclusive scientific-ML screen | `portfolio/new-projects/t2424-1863-local-diffusion-operator/` | head `8368b2daa9e7720cd972accee6e8d363f67c3a59`, dedicated reproduction `31411206631`, repository CI `31411208847`, merged `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | Predeclared >75% improvement gate **failed**: observed 67.777%; planted coefficient 0.18 recovered as 0.179689; zero-diffusion control -0.029% | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`; not certified complete |
| Remaining 93 | See queue | See queue | Mixed | unverified on `main` | unverified on `main` | queue metadata only | `EXECUTION_READY` |

## Final-base verification in progress

- `T2424-0053` Scientific Motif Dictionary — recovery PR #203; implementation/test package is recovered and exact final-base CI is running. It is **not** included in the seven-package merged count until that gate passes and the PR lands.

## Verified or active but deliberately unmerged First-100 work

These do **not** increase the merged count. Their PR boundaries must be respected rather than bypassed simply because a test run is green.

- `T2424-0035` Grokking Agent evaluator — PR #167; synthetic learning-curve detector; explicit no-auto-merge boundary.
- `T2424-0037` NLP-to-CAD — PR #165; controlled-language parametric compiler demo; explicit no-auto-merge boundary.
- `T2424-0054` Theory-Manifold Experiment Planner — PR #170; transparent heuristic planner; explicit no-auto-merge boundary.
- `T2424-0028` Residual Event Tokenizer — PR #163; synthetic codec mechanics; explicit no-auto-merge boundary.
- `T2424-0029` PDE Representation Transitions — PR #176; controlled analytic heat-equation experiment; explicit no-auto-merge boundary.
- `T2424-0026` Counterfactual Defect Worlds — PR #174; deterministic cellular-automaton intervention package; explicit no-auto-merge boundary.
- `T2424-0024` Trust Under Uncertainty — PR #172; deterministic uncertainty-evaluation mechanics; explicit no-auto-merge boundary.

## Promotion rule

Increase `Certified complete` only after linking the exact implementation, frozen protocol, clean run command, baseline, retained raw result, ablation/negative-result analysis, explicit verdict, and independent QA. A reproducible negative result may count as executed/tested work without becoming a successful hypothesis.

Do not double-count multiple implementations under the same registry ID. Do not convert CI success into a scientific or production claim that the evidence does not support.
