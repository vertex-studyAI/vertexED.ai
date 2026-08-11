# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** current `main` plus exact-head GitHub Actions evidence  
**Identity authority:** frozen `FIRST_100_QUEUE.ndjson`

## Truth boundary

Being selected into `FIRST_100_QUEUE.ndjson` is **not** completion evidence. A tested artifact also does **not** count as a First-100 registry project merely because it occupies a `T2424-XXXX` folder: its identity must match the frozen queue assignment.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Queue-consistent runnable project packages merged and verified: **10**
- Queue-consistent tested project packages merged and verified: **10**
- Research-complete projects verified: **0**
- Demo-ready queue-consistent packages merged and verified: **1**
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

## Queue-consistent verified packages on `main`

| Queue rank | ID | Name | Type | Implementation | Exact-head verification | Result boundary | Status |
|---:|---|---|---|---|---|---|---|
| 18 | `T2424-0025` | Non-Gaussian Memory Transformer | Robust memory-mechanism screen | `portfolio/project2424/projects/T2424-0025/` | head `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`, CI `31413572999`, merged `0eb46d07f7d23fccd1333e3c62617457ba3ba423` | Synthetic robust memory-aggregation mechanism only; no full Transformer, learned-attention or real-world robustness claim | `TESTED_TOOL`; not certified complete |
| 23 | `T2424-0030` | Adaptive Theory Geometry in World Models | Geometry-aware forecasting mechanism screen | `portfolio/project2424/projects/T2424-0030/` | head `145a654c40c3fcc2a609031e380bec2846e2e8f8`, CI `31413316287`, merged `0239fa06b29ec537f4163b487ffb7318a5ebee2e` | Interpretable synthetic one-step geometry mechanism only; no learned neural geometry or general world-model superiority claim | `TESTED_TOOL`; not certified complete |
| 27 | `T2424-0034` | Quant ML Visualizer | Developer / quant analytics tool | `portfolio/project2424/projects/T2424-0034/` | head `b62475cec9d867209ce64ee58bb6a22f25633439`, CI `31409366246`, merged `868fa55153c8b1058f2ad9fbe3b0d397f347fe99` | Deterministic descriptive analytics/demo input only; no predictive or alpha claim | `TESTED_TOOL / DEMO_READY`; not certified complete |
| 29 | `T2424-0036` | Rubik's A* Intelligence | Bounded search/tool prototype | merged package from PR #169 | head `422807799833247d6ea7ab095b557d26d41e2b57`, CI `31409707818`, merged `1b143eb8904e5568f9ed8db537951a701e22f88f` | Six-scramble returned-path benchmark on orientation-free 2×2 corner permutations; not a full cube solver | `TESTED_TOOL`; not certified complete |
| 31 | `T2424-0038` | Obscured Records Agent | Editorial research-triage tool | `portfolio/project2424/projects/T2424-0038/` | head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`, CI `31411209123`, merged `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | Deterministic evidence-gating only; supplied evidence values are not truth scores; no autonomous publication | `TESTED_TOOL`; not certified complete |
| 39 | `T2424-0046` | Auto-Research Foundry | Research-planning / evidence-gating tool | `portfolio/project2424/projects/T2424-0046/` | head `88dad71acca583a80ae2496b1278f88a825b4766`, CI `31414879015`, merged `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502` | Deterministic manifest/dependency/budget/evidence mechanics only; no command execution or scientific-correctness claim | `TESTED_TOOL`; not certified complete |
| 42 | `T2424-0049` | Multiphase Porous JEPA | Porous-flow latent-mechanism prototype | `portfolio/project2424/projects/T2424-0049/` after identity repair | head `3023574cfdd6b94e8ec6fccb72deb0b726285ddf`, CI `31449904593`, merged `a1b17cd6131ab6b18eacf1fed0657aea6f2cb7c7` via PR #201 | Deterministic heterogeneous porous-flow surrogate/latent mechanism only; not a trained JEPA, real porous-media benchmark or superiority result | `TESTED_TOOL`; not certified complete |
| 46 | `T2424-0053` | Scientific Motif Dictionary | Scientific time-series tooling prototype | `portfolio/project2424/projects/T2424-0053/` | final recovery head `d01a1d2c12c7e2e2157e11c6bc92726edcbb1c29`, CI `31450035136`, merged `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16` | Deterministic normalized-shape indexing on synthetic 1D numeric data; no scientific meaning, novelty or external-dataset-performance claim | `TESTED_TOOL`; not certified complete |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | Scientific-ML tooling prototype | `portfolio/project2424/projects/T2424-1767/` | head `1496c991a3b00473700b2f4c3d173d428f793e9b`, CI `31409012137`, merged `8c4bb2b31140f8e580135a5595f2731b0068d146` | Deterministic synthetic cost/error frontier in abstract resource units; no Scientific-ML superiority claim | `TESTED_TOOL`; not certified complete |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | Negative/inconclusive scientific-ML screen | `portfolio/new-projects/t2424-1863-local-diffusion-operator/` | head `8368b2daa9e7720cd972accee6e8d363f67c3a59`, dedicated reproduction `31411206631`, repository CI `31411208847`, merged `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | Predeclared >75% improvement gate **failed**: observed 67.777%; planted coefficient 0.18 recovered as 0.179689; zero-diffusion control -0.029% | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`; not certified complete |
| Remaining 90 | See queue | See queue | Mixed | not yet queue-consistent + merged + verified | not yet counted | queue metadata only | `EXECUTION_READY / ACTIVE / BLOCKED` |

## Tested auxiliary work and identity repair in progress

### Benchmark Augmentation Theory

Benchmark Augmentation Theory is real tested work, but it is **not currently counted as canonical `T2424-0050`**.

- merged recovery PR #199;
- exact head `b1342b274157786c2885b54cfa10f9b63b4b6200`;
- canonical CI `31449794955` succeeded;
- merge commit `615fb12f26963a355553f10379df85d26323c4ea`;
- synthetic shortcut-exposure claim boundary remains unchanged.

The frozen First-100 queue assigns `T2424-0050` / rank 43 to **Darcy Latent Operator**. Draft PR #207 is the non-destructive repair path: preserve Benchmark Augmentation Theory under an auxiliary identity and restore Darcy Latent Operator to the canonical registry path. Until that repair is fully verified and merged, the benchmark package remains useful auxiliary tested work and contributes **zero** to the queue-consistent First-100 count.

### Project24 Render

Project24 Render had the same class of identity problem at `T2424-0049`. Merged PR #201 repaired it non-destructively by preserving the renderer under an auxiliary identity and restoring canonical **Multiphase Porous JEPA** at `T2424-0049`. The canonical repaired package therefore counts above; the auxiliary renderer does not create an extra First-100 project.

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

Do not double-count multiple implementations or auxiliary tools under the same registry ID. Do not convert CI success into a scientific or production claim that the evidence does not support.
