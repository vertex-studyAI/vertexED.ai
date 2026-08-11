# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** current `main`, frozen `FIRST_100_QUEUE.ndjson`, merged PR identity, exact-head GitHub Actions evidence, and explicit manual/external gates

## Truth boundary

Being selected into the First-100 queue is **not** completion evidence. This dashboard separates:

1. queue-consistent implementations merged and test-verified on `main`;
2. merged evidence-recovery packages whose original scientific source is still missing;
3. exact-head-green manual review packages;
4. unresolved registry identity collisions; and
5. the stricter nine-gate `Certified complete` count.

### Current counts

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Queue-consistent runnable/tested implementations merged: **12**
- Merged evidence-recovery packages excluded from implementation count: **2** (`T2424-0016`, `T2424-0019`)
- Research-complete projects verified: **0**
- Demo-ready implementation packages verified: **1**
- Known unresolved registry identity collisions on `main`: **1** (`T2424-0050`)
- Exact-head-green manual identity repair ready: **1** (`T2424-0050`, PR #230)
- Exact-head-green new First-100 package awaiting manual/external preview clearance: **1** (`T2424-0027`, PR #242)

A green CI run proves repository integration/execution on that head. It does **not** establish external validity, scientific superiority, publication readiness, production readiness, or completion under the nine-gate contract.

## Nine-gate certification contract

A project enters `Certified complete` only after evidence exists for all nine:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA/reproduction.

## Queue-consistent runnable/tested implementations on `main`

| Rank | ID | Canonical project | Evidence boundary |
|---:|---|---|---|
| 1 | `T2424-0023` | Multilingual Epistemic Blind Spots Benchmark | Synthetic aligned-record evaluation mechanics; no real-model multilingual/fairness/translation claim |
| 18 | `T2424-0025` | Non-Gaussian Memory Transformer | Synthetic robust memory-aggregation screen; not a full Transformer result |
| 23 | `T2424-0030` | Adaptive Theory Geometry in World Models | Synthetic one-step geometry mechanism screen; not learned world-model geometry |
| 27 | `T2424-0034` | Quant ML Visualizer | Descriptive/evaluation tooling; no alpha or investment claim |
| 29 | `T2424-0036` | Rubik's A* Intelligence | Bounded orientation-free 2×2 search prototype |
| 31 | `T2424-0038` | Obscured Records Agent | Deterministic evidence-gating tool; no autonomous truth/publication claim |
| 39 | `T2424-0046` | Auto-Research Foundry | Planning/evidence-gating library; manifest commands are metadata, not executed by the tool |
| 41 | `T2424-0049` | Multiphase Porous JEPA | Deterministic porous-flow surrogate screen; not a trained JEPA/external benchmark |
| 44 | `T2424-0051` | ADR Predictive Surrogate | Controlled analytic 1D periodic ADR surrogate/interpolation mechanics only |
| 46 | `T2424-0053` | Scientific Motif Dictionary | Synthetic normalized-shape indexing mechanics only |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | Synthetic resource/error frontier; no general Scientific-ML superiority claim |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | Negative/inconclusive: frozen >75% improvement gate failed at 67.777% |

These are **12 distinct frozen queue identities**. Auxiliary tools and duplicate recovery branches do not increase the count.

## Merged evidence-recovery packages — excluded from runnable implementation count

### `T2424-0016` — Predictive Stability Theory (PST)

Canonical evidence recovery is merged. Retained controlled evidence and negative findings are preserved, but the original neural source/checkpoints/raw-evidence tree remains unmigrated. Historical Paul15/Pancreas/Dentate headline metrics remain unverified; external biological validation remains blocked.

State: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_BLOCKED`.

### `T2424-0019` — Neural Predictive Memory Spectroscopy (NPMS)

Canonical evidence recovery is merged. The package preserves compact runs, ablations, robustness records and explicit metric limitations. Original implementation/config/result/evidence/manuscript source remains unmigrated and has not been independently rerun from canonical Git.

State: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`.

**Neither package increases the 12-implementation count.**

## P0 registry identity gate — `T2424-0050`

Frozen queue rank 43 assigns `T2424-0050` to **Darcy Latent Operator**. Current `main` still contains Benchmark Augmentation Theory in the canonical folder, so the folder is excluded from the queue-consistent implementation count.

Canonical manual repair is **PR #230**. Exact head `8539bbc38624b8bafe1d188876869b2e72c451a4` passed canonical CI `31456520689`.

The repair:

- restores Darcy Latent Operator to `portfolio/project2424/projects/T2424-0050/`;
- preserves Benchmark Augmentation Theory under auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`;
- restores Darcy's deterministic 1D solver, retained 20-seed result and regressions;
- repairs benchmark-audit imports; and
- adds a zero-exception frozen-queue ↔ package-title identity regression.

PR #230 explicitly requires **manual review / no auto-merge / no deploy**. It remains excluded from the merged count. If manually approved and merged after final-base revalidation, the queue-consistent merged/tested count may move from **12 to 13**. The auxiliary benchmark audit must never be double-counted.

## New exact-head-green manual package — `T2424-0027`

Frozen queue rank 20: **Sapir–Whorf Latent Tongue**.

Draft PR #242 head `6e71f109db7bba64e222029f298072ed64cc42de` passed canonical GitHub Actions CI `31457981699`, including the canonical release gate, production-browser certification and local accessibility certification.

The package contains:

- frozen falsifiable synthetic mechanics claim and protocol;
- deterministic 4-concept × 3-language latent generator;
- raw and language-centered concept/language probes;
- global-centering negative control;
- retained raw JSON + SHA-256 manifest;
- baseline analysis and explicit GO/STOP verdict;
- implementation-independent fail-closed evidence verifier; and
- focused regressions.

Actual retained synthetic metrics:

- raw concept accuracy `1.0`;
- raw language accuracy `1.0`;
- language-centered concept accuracy `1.0`;
- language-centered language accuracy `0.3611111111111111`;
- chance `0.3333333333333333`;
- normalized excess language-leakage reduction `0.9583333333333334`;
- global-centering language accuracy `1.0`.

All frozen mechanics gates pass. This remains **synthetic diagnostic evidence only**: no Sapir–Whorf, linguistic-relativity, real-model, cultural, translation, external-validation, publication or research-complete claim.

PR #242 is explicitly **manual review / no auto-merge / no deploy**. Linked Vercel preview checks are externally blocked by build-rate-limit capacity, so it is not counted as merged even though canonical GitHub Actions is green.

## Promotion rule

Increase `Certified complete` only after all nine certification gates are evidenced under the project's supported claim. A reproducible negative result can be executed/tested work without becoming a successful hypothesis. A recovered evidence validator can preserve scientific provenance without becoming a recovered implementation.

Do not double-count duplicate branches, auxiliary artifacts, evidence-only recoveries, or folder names whose identity disagrees with the frozen queue.
