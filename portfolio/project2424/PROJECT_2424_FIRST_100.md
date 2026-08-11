# Project 2424 — First 100

**Updated:** 11 August 2026  
**Source:** current `main`, frozen `FIRST_100_QUEUE.ndjson`, merged PR identity, and exact-head GitHub Actions evidence

## Truth boundary

Being selected into the First-100 queue is **not** completion evidence. This dashboard separates:

1. queue-consistent implementations that are merged and test-verified;
2. merged evidence-recovery packages whose original scientific source is still missing;
3. pending identity repairs; and
4. the stricter nine-gate `Certified complete` count.

### Current counts

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100**
- Queue-consistent runnable/tested implementations merged: **12**
- Merged evidence-recovery packages not counted as runnable implementations: **2** (`T2424-0016`, `T2424-0019`)
- Research-complete projects verified: **0**
- Demo-ready implementation packages verified: **1**
- Known unresolved registry identity collisions on `main`: **1** (`T2424-0050`)
- Exact-head-green manual identity repair ready: **1** (PR #216)

A green CI run proves the recorded package integrates and executes on that head. It does **not** by itself establish external validity, scientific superiority, publication readiness, production readiness, or completion under the nine-part certification gate.

## Certification gate

A project enters `Certified complete` only after evidence for all of the following exists:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

## Queue-consistent runnable/tested implementations on `main`

| Rank | ID | Canonical project | Verification / merge evidence | Evidence boundary |
|---:|---|---|---|---|
| 18 | `T2424-0025` | Non-Gaussian Memory Transformer | head `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`; PR #187; merge `0eb46d07f7d23fccd1333e3c62617457ba3ba423` | Synthetic robust memory-aggregation screen; not a full Transformer result |
| 23 | `T2424-0030` | Adaptive Theory Geometry in World Models | head `145a654c40c3fcc2a609031e380bec2846e2e8f8`; PR #186; merge `0239fa06b29ec537f4163b487ffb7318a5ebee2e` | Synthetic one-step geometry mechanism screen; not learned world-model geometry |
| 27 | `T2424-0034` | Quant ML Visualizer | head `b62475cec9d867209ce64ee58bb6a22f25633439`; CI `31409366246`; merge `868fa55153c8b1058f2ad9fbe3b0d397f347fe99`; later walk-forward extension recovered separately | Descriptive/evaluation tooling; no alpha or investment claim |
| 29 | `T2424-0036` | Rubik's A* Intelligence | head `422807799833247d6ea7ab095b557d26d41e2b57`; CI `31409707818`; merge `1b143eb8904e5568f9ed8db537951a701e22f88f` | Bounded orientation-free 2×2 search prototype |
| 31 | `T2424-0038` | Obscured Records Agent | head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`; CI `31411209123`; merge `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7` | Deterministic evidence-gating tool; no autonomous truth/publication claim |
| 39 | `T2424-0046` | Auto-Research Foundry | head `88dad71acca583a80ae2496b1278f88a825b4766`; PR #192; merge `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502` | Planning/evidence-gating library; commands remain metadata and are not executed by the tool |
| 41 | `T2424-0049` | Multiphase Porous JEPA | repaired source head `3023574cfdd6b94e8ec6fccb72deb0b726285ddf`; CI `31449904593`; PR #201; merge `a1b17cd6131ab6b18eacf1fed0657aea6f2cb7c7` | Deterministic porous-flow surrogate screen; not a trained JEPA or external benchmark |
| 44 | `T2424-0051` | ADR Predictive Surrogate | replacement head `7fe27ff01a8a8cc4701deecd2239aab80b7c1ee3`; original green CI `31449668954`; PR #205; merge `1ba9ecc09f7e84f43d8251c222e3d07351e7ed8a` | Controlled analytic 1D periodic ADR surrogate/interpolation mechanics only |
| 46 | `T2424-0053` | Scientific Motif Dictionary | replacement head `d01a1d2c12c7e2e2157e11c6bc92726edcbb1c29`; prior CI `31411557245`; PR #203; merge `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16` | Synthetic normalized-shape indexing mechanics only |
| 52 | `T2424-1767` | Resource-Bounded MoE Operator | head `1496c991a3b00473700b2f4c3d173d428f793e9b`; CI `31409012137`; merge `8c4bb2b31140f8e580135a5595f2731b0068d146` | Synthetic resource/error frontier; no general Scientific-ML superiority claim |
| 92 | `T2424-1863` | Resource-Bounded Local Operator for Scientific Forecasting | head `8368b2daa9e7720cd972accee6e8d363f67c3a59`; reproduction `31411206631`; repo CI `31411208847`; merge `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6` | Negative/inconclusive: frozen >75% improvement gate failed at 67.777% |
| 1 | `T2424-0023` | Multilingual Epistemic Blind Spots Benchmark | reconciled head `58449933c38afb9a9017dbd067a43874dec88354`; CI `31450669750`; PR #212; merge `3ce1260a3d3e80788b3c5d12cfe0df617b13665a` | Synthetic aligned-record evaluation mechanics; no real-model or language-performance claim |

These are **12 distinct queue identities**. Auxiliary tools rehomed during registry repairs do not add to this count.

## Merged evidence-recovery packages — deliberately excluded from runnable-implementation count

### `T2424-0016` — Predictive Stability Theory (PST)

PR #214 merged the canonical evidence boundary at `205dcaeb5dc5a0b5d3e9d4e59169b829829d5acc` after restoring the previously verified recovery package. The retained isolated bundle contains controlled experiment evidence and negative findings, but the original neural source/checkpoint/raw-evidence tree has not been migrated into canonical Git identity. Historical Paul15/Pancreas/Dentate headline metrics remain unverified and external biological validation remains blocked.

Status: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_BLOCKED`.

### `T2424-0019` — Neural Predictive Memory Spectroscopy (NPMS)

PR #213 merged at `c298d4cbe81e85e678c97261fbd4fbb6ca82c77c` after exact-head CI `31451120590` passed on repaired head `fb684fc3e16cf8e202b9069b0e7b37e6fa607006`. The recovery preserves 17 isolated tests, 15 compact runs, 36 ablation records, 45 robustness records, and explicit metric/interpretation limitations. The original implementation tree has not been migrated or independently rerun from canonical Git.

Status: `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`.

**Neither PST nor NPMS increases the 12-implementation count merely because its recovery validator is runnable.**

## Current P0 identity gate — `T2424-0050`

Frozen queue identity: **Darcy Latent Operator**.

Current `main` still contains **Benchmark Augmentation Theory** under `T2424-0050`, so the current folder is excluded from the queue-consistent count.

Latest repair path: PR #216 (`agent/p2424-0050-canonical-repair-latest-20260811`). It preserves Benchmark Augmentation Theory under auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`, restores Darcy Latent Operator to `T2424-0050`, restores its six regressions and retained 20-seed bounded result, and passed full canonical CI `31451716616` on exact head `9c9aacac73d1c59327cf6a882aa83566f658cf53`.

PR #216 is mergeable and ready for review, but its explicit boundary says **do not auto-merge or deploy**. It therefore remains excluded from the merged count. If manually approved and merged without the base changing, the queue-consistent runnable/tested implementation count may move from **12 to 13**. The auxiliary benchmark audit must not be double-counted.

## Additional exact-head-green work not counted as merged implementations

The repository also contains or has contained exact-head-green review paths for distinct queue projects such as `T2424-0024`, `T2424-0026`, `T2424-0028`, `T2424-0029`, `T2424-0035`, `T2424-0037`, `T2424-0054`, and others. They remain excluded from the merged count until their current canonical review/merge boundaries are satisfied.

## Promotion rule

Increase `Certified complete` only after all nine certification gates are evidenced. A reproducible negative result can count as executed/tested work without becoming a successful hypothesis. A recovered evidence validator can preserve scientific provenance without becoming a recovered implementation.

Do not double-count duplicate branches, auxiliary artifacts, or folder names whose identity disagrees with the frozen First-100 queue.
