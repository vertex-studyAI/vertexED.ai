# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** `main` plus exact-head GitHub Actions evidence

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. This dashboard separates merged runnable/tested packages from the stricter nine-gate `Certified complete` count.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Runnable project packages merged and verified: **8**
- Tested project packages merged and verified: **8**
- Research-complete projects verified: **0**
- Demo-ready project packages merged and verified: **1**
- Projects with certified raw-result + independent-QA packages: **0**

The First-100 selection is a work queue, not a completed-project claim. A project may be useful, runnable, tested, or preserve a valuable negative result before it satisfies all nine certification gates.

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
| 18 | `T2424-0025` | Non-Gaussian Memory Transformer | Robust memory-aggregation mechanism screen | merged package from PR #187 | head `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`, CI `31413572999`, merged `0eb46d07f7d23fccd1333e3c62617457ba3ba423` | Synthetic attention-memory aggregation under clean/heavy-tail controls; not a full Transformer or learned-language result | `TESTED_RESEARCH_SCREEN`; not certified complete |
| 23 | `T2424-0030` | Adaptive Theory Geometry in World Models | Geometry-aware synthetic mechanism screen | merged package from PR #186 | head `145a654c40c3fcc2a609031e380bec2846e2e8f8`, CI `31413316287`, merged `0239fa06b29ec537f4163b487ffb7318a5ebee2e` | Synthetic one-step trajectory mechanism screen; not learned neural geometry or general world-model superiority | `TESTED_RESEARCH_SCREEN`; not certified complete |
| 27 | `T2424-0034` | Quant ML Visualizer | Developer / quant analytics tool | `portfolio/project2424/projects/T2424-0034/` | head `b62475cec9d867209ce64ee58bb6a22f25633439`, CI `31409366246`, merged `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | Deterministic descriptive analytics/demo input only; no predictive or alpha claim | `TESTED_TOOL / DEMO_READY`; not certified complete |
| 29 | `T2424-0036` | Rubik's A* Intelligence | Bounded search/tool prototype | merged package from PR #169 | head `422807799833247d6ea7ab095b557d26d41e2b57`, CI `31409707818`, merged `1b143eb8904e5568f9ed8db537951a701e22f88f` | Six-scramble returned-path benchmark on orientation-free 2×2 corner permutations; not a full cube solver | `TESTED_TOOL`; not certified complete |
| 31 | `T2424-0038` | Obscured Records Agent | Editorial research-triage tool | `portfolio/project2424/projects/T2424-0038/` | head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`, CI `31411209123`, merged `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | Deterministic evidence-gating only; supplied evidence values are not truth scores; no autonomous publication | `TESTED_TOOL`; not certified complete |
| 42 | `T2424-0049` | Project24 Render | Evidence-preserving static portfolio renderer | merged package from PR #190 | head `d517efc42fb89b8f0374f2d559a82334a82eeb6d`, CI `31414274233`, merged `6581a39539267c85b247aa30363d5285daef0173` | Renders supplied evidence records only; does not inspect GitHub, infer completion, or validate scientific claims | `TESTED_TOOL`; not certified complete |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | Scientific-ML tooling prototype | `portfolio/project2424/projects/T2424-1767/` | head `1496c991a3b00473700b2f4c3d173d428f793e9b`, CI `31409012137`, merged `8c4bb2b31140f8e580135a5595f2731b0068d146` | Deterministic synthetic cost/error frontier in abstract resource units; no Scientific-ML superiority claim | `TESTED_TOOL`; not certified complete |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | Negative/inconclusive scientific-ML screen | `portfolio/new-projects/t2424-1863-local-diffusion-operator/` | head `8368b2daa9e7720cd972accee6e8d363f67c3a59`, dedicated reproduction `31411206631`, repository CI `31411208847`, merged `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | Predeclared >75% improvement gate **failed**: observed 67.777%; planted coefficient 0.18 recovered as 0.179689; zero-diffusion control -0.029% | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`; not certified complete |
| Remaining 92 | See queue | See queue | Mixed | unverified on `main` | unverified on `main` | queue metadata only | `EXECUTION_READY` |

## Exact-head-green but deliberately unmerged First-100 work

These do **not** increase the eight-package merged count. Their PR boundaries must be respected rather than bypassed simply because CI is green.

### Reverified on 11 August 2026

- `T2424-0050` Benchmark Augmentation Theory — PR #193, head `fd4e31790115b04d2534e23703c3bfc13e2737e4`, CI `31415101835` success.
- `T2424-0046` Auto-Research Foundry — PR #192, head `88dad71acca583a80ae2496b1278f88a825b4766`, CI `31414879015` success.
- `T2424-0053` Scientific Motif Dictionary — PR #179, head `298b739675850d4980a1397cd3bf5fefd699e5dc`, CI `31411557245` success.
- `T2424-0029` PDE Representation Transitions — PR #176, head `4c43ec9f88bda4f0857506730ab1083711f53dba`, CI `31411015601` success.
- `T2424-0026` Counterfactual Defect Worlds — PR #174, head `93c857e8f5e5408f9b5cda6c0053fbb2b903c993`, CI `31410824608` success.

### Previously recorded review-ready work not re-counted as merged

- `T2424-0035` Grokking Agent evaluator — PR #167; synthetic learning-curve detector; explicit no-auto-merge boundary.
- `T2424-0037` NLP-to-CAD — PR #165; controlled-language parametric compiler demo; explicit no-auto-merge boundary.
- `T2424-0054` Theory-Manifold Experiment Planner — PR #170; transparent heuristic planner; explicit no-auto-merge boundary.
- `T2424-0028` Residual Event Tokenizer — PR #163; synthetic codec mechanics; explicit no-auto-merge boundary.
- `T2424-0024` Trust Under Uncertainty — PR #172; deterministic uncertainty-evaluation mechanics; explicit no-auto-merge boundary.

## External deployment-status boundary

The connected parent repository is wired to Vercel. During this execution window both Vercel commit-status contexts repeatedly reported a free-plan deployment-rate limit (`more than 100` deployments/day). That status is an external capacity boundary and must not be rewritten as repository-CI failure.

No Project 2424 PR should be merged merely to increase the count when its own PR boundary says to hold or when doing so would create deployment-side effects outside the authorized scope.

## Promotion rule

Increase `Certified complete` only after linking the exact implementation, frozen protocol, clean run command, baseline, retained raw result, ablation/negative-result analysis, explicit verdict, and independent QA. A reproducible negative result may count as executed/tested work without becoming a successful hypothesis.

Do not double-count multiple implementations under the same registry ID. Do not convert CI success into a scientific or production claim that the evidence does not support.
