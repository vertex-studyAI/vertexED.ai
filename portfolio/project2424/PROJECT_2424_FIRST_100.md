# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** current `main` through `c298d4cbe81e85e678c97261fbd4fbb6ca82c77c` plus exact-head GitHub Actions evidence  
**Identity authority:** frozen `FIRST_100_QUEUE.ndjson`

## Truth boundary

A queue entry is not a completed project, and a green artifact does not count under a registry ID unless its identity matches the frozen queue assignment.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Queue-consistent runnable implementation/tool packages merged and verified: **12**
- Queue-consistent tested implementation/tool packages merged and verified: **12**
- Research-complete projects verified: **0**
- Demo-ready queue-consistent packages merged and verified: **1**
- Projects with certified raw-result + independent-QA packages: **0**
- Canonical evidence-boundary recoveries with source migration still pending: **2** (`T2424-0016` PST, `T2424-0019` NPMS)

## Certification rule

`Certified complete` requires all nine gates:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. ablation or negative-result analysis;
8. explicit go/no-go verdict;
9. independent QA.

Green CI proves that the checked package executes on the recorded head. It does not establish external validity, scientific superiority, deployment, publication readiness, or completion under this nine-gate rule.

## Queue-consistent implementation/tool packages verified on `main`

| Rank | ID | Name | Evidence | Claim boundary | Status |
|---:|---|---|---|---|---|
| 1 | `T2424-0023` | Multilingual Epistemic Blind Spots Benchmark | PR #212; head `58449933c38afb9a9017dbd067a43874dec88354`; CI `31450669750`; merged `3ce1260a3d3e80788b3c5d12cfe0df617b13665a` | Synthetic aligned-record evaluation only; no real multilingual model/fairness/translation claim | `TESTED_TOOL` |
| 18 | `T2424-0025` | Non-Gaussian Memory Transformer | head `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`; CI `31413572999`; merged `0eb46d07f7d23fccd1333e3c62617457ba3ba423` | Synthetic robust memory-aggregation mechanism only; no full Transformer or real-world robustness claim | `TESTED_TOOL` |
| 23 | `T2424-0030` | Adaptive Theory Geometry in World Models | head `145a654c40c3fcc2a609031e380bec2846e2e8f8`; CI `31413316287`; merged `0239fa06b29ec537f4163b487ffb7318a5ebee2e` | Interpretable synthetic one-step geometry mechanism only; no general learned world-model superiority claim | `TESTED_TOOL` |
| 27 | `T2424-0034` | Quant ML Visualizer | head `b62475cec9d867209ce64ee58bb6a22f25633439`; CI `31409366246`; merged `868fa55153c8b1058f2ad9fbe3b0d397f347fe99`; later walk-forward extension merged via #202 | Deterministic descriptive/walk-forward analytics; no predictive-alpha claim | `TESTED_TOOL / DEMO_READY` |
| 29 | `T2424-0036` | Rubik's A* Intelligence | head `422807799833247d6ea7ab095b557d26d41e2b57`; CI `31409707818`; merged `1b143eb8904e5568f9ed8db537951a701e22f88f` | Bounded orientation-free 2×2 search benchmark; not a full cube solver | `TESTED_TOOL` |
| 31 | `T2424-0038` | Obscured Records Agent | head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`; CI `31411209123`; merged `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | Deterministic evidence-gating only; no autonomous publication or truth-score claim | `TESTED_TOOL` |
| 39 | `T2424-0046` | Auto-Research Foundry | PR #192; head `88dad71acca583a80ae2496b1278f88a825b4766`; CI `31414879015`; merged `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502` | Deterministic manifest/dependency/budget/evidence mechanics only; no scientific correctness claim | `TESTED_TOOL` |
| 42 | `T2424-0049` | Multiphase Porous JEPA | PR #201; head `3023574cfdd6b94e8ec6fccb72deb0b726285ddf`; CI `31449904593`; merged `a1b17cd6131ab6b18eacf1fed0657aea6f2cb7c7` | Heterogeneous porous-flow latent/surrogate mechanism only; not a trained JEPA or real benchmark | `TESTED_TOOL` |
| 44 | `T2424-0051` | ADR Predictive Surrogate | PR #205; head `7fe27ff01a8a8cc4701deecd2239aab80b7c1ee3`; CI `31450093762`; merged `1ba9ecc09f7e84f43d8251c222e3d07351e7ed8a` | Controlled analytic 1D periodic linear ADR surrogate/interpolation only; no neural-operator/SOTA claim | `TESTED_TOOL` |
| 46 | `T2424-0053` | Scientific Motif Dictionary | PR #203; head `d01a1d2c12c7e2e2157e11c6bc92726edcbb1c29`; CI `31450035136`; merged `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16` | Synthetic 1D normalized-shape indexing only; no scientific-meaning/novelty claim | `TESTED_TOOL` |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | head `1496c991a3b00473700b2f4c3d173d428f793e9b`; CI `31409012137`; merged `8c4bb2b31140f8e580135a5595f2731b0068d146` | Synthetic cost/error frontier in abstract resource units; no Scientific-ML superiority claim | `TESTED_TOOL` |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | head `8368b2daa9e7720cd972accee6e8d363f67c3a59`; reproduction `31411206631`; repository CI `31411208847`; merged `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | Predeclared >75% improvement gate failed at 67.777%; negative/inconclusive result retained | `NEGATIVE_OR_INCONCLUSIVE` |
| Remaining 88 | See queue | — | Not yet both queue-consistent + merged + verified as implementation/tool packages | Queue metadata alone is not implementation | `EXECUTION_READY / ACTIVE / BLOCKED` |

## Canonical recovered evidence packages — **not included in the 12 implementation count**

### Rank 2 — `T2424-0016` PST

PR #214 merged the canonical fail-closed evidence boundary:

- exact head `625d7261aeac319461418fdd4bb5ef9094fe6025`;
- canonical CI `31451145817` fully green;
- merge `205dcaeb5dc5a0b5d3e9d4e59169b829829d5acc`;
- retained controlled findings and negative results are machine-readable;
- historical Paul15/Pancreas/Dentate Gyrus claims remain quarantined as unverified;
- external biological validation remains blocked;
- original isolated neural source/checkpoints/raw evidence still require migration and clean rerun.

Status: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_BLOCKED`.

### Rank 3 — `T2424-0019` NPMS

PR #213 merged the canonical evidence boundary:

- exact head `fb684fc3e16cf8e202b9069b0e7b37e6fa607006`;
- canonical CI `31451120590` fully green;
- merge `c298d4cbe81e85e678c97261fbd4fbb6ca82c77c`;
- validator preserves missing/spurious-mode limitations, conjugate-mode truncation weakness, resolvent-vs-transfer-function boundary, and delay-PCA/multiscale/switching weaknesses;
- original isolated source/config/result/evidence/manuscript tree still requires migration and independent rerun.

Status: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING`.

## Registry collision still open — `T2424-0050`

Current `main` contains a tested Benchmark Augmentation Theory package under the `T2424-0050` path, but the frozen queue assigns rank 43 to **Darcy Latent Operator**. The benchmark audit therefore contributes **zero** to the canonical First-100 count.

PR #210 contains a lossless repair that preserves the benchmark audit as auxiliary work and restores Darcy to canonical `T2424-0050`. Its exact head previously passed canonical CI `31450427123`, but it is now stale against current `main` and its explicit boundary says **do not auto-merge or deploy**. It must be recovered/reverified under the same manual gate before canonical Darcy can join the count.

## Deliberately unmerged work

Green or partially verified PRs with explicit no-auto-merge/manual boundaries remain outside the count, including Grokking Agent, NLP-to-CAD, Theory-Manifold Experiment Planner, Residual Event Tokenizer, PDE Representation Transitions, Counterfactual Defect Worlds, and Trust Under Uncertainty.

## Promotion rule

Do not increase `Certified complete` until all nine evidence gates are linked. Do not double-count auxiliary work, competing implementations, or evidence-only recovery packages as canonical runnable implementations. A reproducible negative result may be valuable executed work without becoming a successful hypothesis.
