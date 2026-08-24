# Project 2424 Run-Ready Contract — 24 August 2026

## Truth boundary

Project 2424 has a declared contract size of 2,424 identities, but the full current registry/source/result/disposition map is not proven. The canonical source-identity manifest currently proves 23 repository-backed child directories. Directory presence is not scientific completion or external validation.

Do not join historic `P2424-*` and current `T2424-*` projects by numeric suffix alone.

## Per-child run-ready requirements

A source-backed child may be labeled `RUN_READY_PREOUTCOME` only when all applicable items are satisfied:

- canonical ID and registry name match the source manifest;
- source directory exists and exact commit is recorded;
- `README`/status truth does not conflict with the canonical ledger;
- hypothesis and failure criteria are explicit;
- dataset path is local or deterministically fetchable and checksummed;
- split policy, seed policy, training/evaluation budgets are frozen;
- method and meaningful baselines are implemented;
- smoke config runs through the real loader/model/evaluator path on a bounded fixture;
- primary, ablation, robustness/OOD/falsification configs are materialized where appropriate;
- metrics are predeclared and units/aggregation fixed;
- raw output schema is machine-readable;
- tables/figures are generated from saved raw artifacts rather than handwritten values;
- provenance records commit/config/data/environment/hardware identity;
- known negative/mixed evidence is immutable;
- no prohibited holdout, seed, training, merge, or deploy boundary is crossed.

## Source-backed child identities currently recovered

| ID | Canonical name | Freeze action |
|---|---|---|
| T2424-0016 | PST — Predictive Single-Cell Transition Score | Recover exact runnable evidence path; classify protocol/model/data/baseline gaps |
| T2424-0019 | NPMS — Neural Predictive Memory Spectroscopy | Preserve current non-uniqueness finding; successor protocol must strengthen causal controls |
| T2424-0023 | Multilingual Epistemic Blind Spots Benchmark | Wire real-model adapters, baselines, raw-output schema and independent QA path before claim expansion |
| T2424-0024 | Trust Under Uncertainty | Inspect source/status; freeze benchmark/task definition before outcomes |
| T2424-0025 | Non-Gaussian Memory Transformer | Preserve precursor evidence; learned successor is a distinct study |
| T2424-0026 | Counterfactual Defect Worlds | Inspect source/status; require counterfactual controls and leakage-safe splits |
| T2424-0027 | Sapir–Whorf Latent Tongue | Inspect source/status; freeze linguistic task, baselines and causal interpretation boundaries |
| T2424-0028 | Residual Event Tokenization | Inspect claim/source; require matched tokenization baselines and fixed event metrics |
| T2424-0029 | Representation Phase Transitions for PDEs | Require numerical ground truth, phase-transition diagnostics and strong representation baselines |
| T2424-0030 | Adaptive Theory Geometry in World Models | Freeze synthetic/controlled worlds, geometry diagnostics and matched world-model baselines |
| T2424-0034 | Quant ML Visualizer | Separate tooling value from scientific claims; benchmark any analytical inference it makes |
| T2424-0035 | Grokking Agent | Freeze tasks, capability metric, compute budget and non-agent controls |
| T2424-0036 | Rubik's A* Intelligence | Freeze A*/IDA*/weighted/search baselines; measure optimality, nodes, runtime and learned-heuristic benefit |
| T2424-0037 | NLP-to-CAD | Structural CAD benchmark: parse, build, topology, constraints, parameter editability, semantics, robustness and manufacturability checks |
| T2424-0038 | Obscured Records Agent | Ground-truth retrieval/agent tasks, factuality and non-agent baselines |
| T2424-0040 | FinanceMeta Learning Graph | First restore source/build truth; then freeze learning-graph evaluation separate from product UX |
| T2424-0046 | Auto-Research Foundry | Evaluate against bounded reference research tasks; artifact generation alone is not success |
| T2424-0049 | Multiphase Porous JEPA | Physical metrics, conservation/field errors, operator baselines and OOD material regimes |
| T2424-0050 | Darcy Latent Operator | `training_authorized=false`; close all pretraining blockers only; no auto-merge/deploy or scientific outcome run |
| T2424-0053 | Scientific Motif Dictionary | Motif stability/repeatability plus downstream utility; visual plausibility alone is insufficient |
| T2424-0054 | Theory-Manifold Experiment Planner | Benchmark information gain/experiment quality against simple active-design/search baselines |
| T2424-1767 | Resource-Bounded Mixture-of-Experts Operator | Compute-quality Pareto protocol with matched compute/resource accounting |
| T2424-1768 | Self-Verifying Mixture-of-Experts Engine | Separate verification contribution from MoE gain; benchmark verifier calibration, false acceptance/rejection, cost and end-task quality |

## Status labels

- `RUN_READY_PREOUTCOME`: all preparation gates closed; scientific outcome not yet generated.
- `FROZEN_RESULT`: existing result is immutable; only reproduction/release work allowed.
- `BLOCKED_PROVENANCE`: source/data/split/metric identity prevents a clean run.
- `BLOCKED_IMPLEMENTATION`: required source/model/baseline/smoke path is incomplete.
- `BLOCKED_AUTHORIZATION`: technically prepared but an explicit training/holdout/release lock remains closed.
- `UNKNOWN`: repository evidence is insufficient.

## Morning handoff format per child

Every worked child must report:

`ID | canonical name | source commit | truth state | data state | method state | baseline state | smoke state | full-run manifest state | forbidden actions | exact next command`

The goal is not to maximize the number called complete. The goal is to maximize the number whose next scientific action is deterministic, auditable and impossible to confuse with a result already obtained.
