# Project 2424 — Execution Evidence

**Session date:** 10–12 August 2026

This ledger records only inspectable GitHub-connected execution evidence. It separates queue selection, merged/tested artifacts, negative results, and the stricter `Certified complete` gate.

## First-100 current evidence boundary

- queue defined: **100 / 100**
- merged + runnable + exact-head tested packages: **5 / 100**
- certified complete under all nine acceptance requirements: **0 / 100**
- research-complete: **0 / 100**
- remaining queue entries without a merged verified package: **95 / 100**

The five merged packages are `T2424-0034`, `T2424-0036`, `T2424-0038`, `T2424-1767`, and `T2424-1863`.

## T2424-0034 — Quant ML Visualizer

PR: #166  
Exact head: `b62475cec9d867209ce64ee58bb6a22f25633439`  
CI: `31409366246` — success  
Merged commit: `868fa55153c8b1058f2ad9fbe3b0d397f347fe99`

Evidence: deterministic price-return/equity/drawdown/volatility/Sharpe calculations, rolling metrics, SVG/HTML report, zero-dependency CLI, demo input, regression tests and evidence-gated status.

Boundary: descriptive analytics only. No market-data download, predictive model, alpha, profitability, investment-suitability, or quantitative-ML superiority claim.

## T2424-0036 — Rubik's A* Intelligence

PR: #169  
Exact head: `422807799833247d6ea7ab095b557d26d41e2b57`  
CI: `31409707818` — success  
Merged commit: `1b143eb8904e5568f9ed8db537951a701e22f88f`

Evidence: orientation-free 2×2 corner-permutation state, U/R/F moves + inverses, admissible lower bound, deterministic binary-heap A*, node/depth limits, six-scramble benchmark with returned-path verification, invalid-input and budget-exhaustion tests.

Boundary: tested search/tool prototype, not a complete Rubik's Cube solver and not evidence of general intelligence.

## T2424-0038 — Obscured Records Agent

PR: #178  
Exact head: `abf8c998bab4bc0adedfb3d1d1a19432603c355f`  
CI: `31411209123` — success  
Merged commit: `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7`

Evidence: structured lead/source validation, independent-publisher/source-type accounting, primary-source coverage, transparent evidence/freshness/novelty/impact/risk score, hard fail-closed blockers, deterministic decision ledger, runnable synthetic example, regression tests.

Boundary: supplied evidence values are inputs rather than verified truth scores. The tool does not fetch sources, establish factual/legal safety, replace editorial judgment, or autonomously publish.

## T2424-1767 — Resource-Bounded MoE Operator

PR: #162  
Exact head: `1496c991a3b00473700b2f4c3d173d428f793e9b`  
CI: `31409012137` — success  
Merged commit: `8c4bb2b31140f8e580135a5595f2731b0068d146`

Evidence: dependency-free resource-bounded MoE operator, explicit expert costs and per-sample budget, deterministic score-per-cost routing, top-K cap, fail-closed impossible-budget behavior, selected-expert softmax mixture, synthetic resource/error frontier, root regression coverage.

Boundary: software/tool prototype with synthetic benchmark and abstract resource units. No Scientific-ML superiority, novelty, publication, or real-workload claim.

A separate older Python cheap-screen PR #156 produced additional synthetic evidence but was intentionally closed after #162 became the canonical registry-ID implementation so T2424-1767 is not double-counted.

## T2424-1863 — Resource-Bounded Local Operator for Scientific Forecasting

Canonical clean PR: #177  
Exact head: `8368b2daa9e7720cd972accee6e8d363f67c3a59`  
Dedicated reproduction: `31411206631` — success  
Repository CI: `31411208847` — success  
Merged commit: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`

A fresh independent replay of the merged frozen job completed successfully as Actions run `31411517815`, attempt 3, job `94262839511` on 12 August 2026. Environment: Ubuntu `24.04.4` LTS, runner image `20260720.247.2`, CPython `3.11.15`, pip `26.2.1`, pytest `9.1.1`, CPU. Focused regression suite: `4 passed in 0.18s`.

Predeclared screen: mean held-out one-step RMSE improvement **>75%** over persistence on synthetic diffusion, planted coefficient near `0.18`, 3-point local stencil, and zero-diffusion negative control.

Observed and independently replayed 20-seed evidence:

- learned coefficient: `0.179689`;
- persistence RMSE: `0.015610`;
- operator RMSE: `0.005023`;
- relative improvement: **67.777%** — below the predeclared gate;
- zero-diffusion control: **-0.029%** improvement.

Verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

The >75% threshold was not relaxed after observing the result. This is a useful reproduced negative/inconclusive screen, not a successful scientific hypothesis. The current CLI reports aggregate 20-seed means but does not yet retain per-seed standard deviation/variance/confidence intervals; that is an explicit uncertainty-reporting gap. Real PDE data, stronger baselines, rollout stability and compute accounting remain open.

Reproduction package: `portfolio/new-projects/t2424-1863-local-diffusion-operator/RESULTS.md`, `REPRODUCE.md`, and `experiment_metadata.json`.

## Deliberately unmerged First-100 evidence

The following open packages have explicit PR instructions not to auto-merge because the parent repository is connected to external deployment systems or otherwise has a stated no-auto-merge boundary:

- `T2424-0035` Grokking Agent — PR #167;
- `T2424-0037` NLP-to-CAD — PR #165;
- `T2424-0054` Experiment Planner — PR #170;
- `T2424-0028` Residual Event Tokenizer — PR #163;
- `T2424-0029` PDE Representation Transitions — PR #176;
- `T2424-0026` Counterfactual Defect Worlds — PR #174;
- `T2424-0024` Trust Under Uncertainty — PR #172.

These do not increase the merged-package count.

## Other portfolio execution completed during this session

### Text-To-Video

Issue #6 (stale/partial render output integrity) was fixed through PR #7 and merged as `1d1ad2d027ca38e6fb0581ccf280333da454b672` after exact-head CI `31409630201` passed the workspace release gate, FFmpeg/ffprobe toolchain, real MP4 smoke encode, external render-job encode and dependency audit.

The merged fix stages current attempts away from the final MP4 path, promotes only verified media, preserves a prior final artifact on failure, cleans staging and records explicit fail-closed provenance. Duplicate PR #8 was closed as superseded.

### LAM-JEPA

Release-provenance PR #54 passed Reproducibility CI `31409820106` and ARC Protocol V2 QA `31409820356`, then merged as `6f7fbe8914dc02760a7bd17c7ada4a5104e8b065`.

It records the frozen ARC-Challenge dataset identity/hashes/counts, test-split prohibition, repository/dependency/reproduction entry points and negative/inconclusive claim boundaries. Root LICENSE and final `CITATION.cff` were deliberately not invented; issue #14 remains open for owner-approved legal/bibliographic metadata.

## Connected GitHub surface

Writable repositories observed through the connected GitHub installation:

- `vertex-studyAI/vertexED.ai`
- `vertex-studyAI/LAM-JEPA`
- `vertex-studyAI/Text-To-Video`

FinanceMeta, The Bu1LD, Atlas, Percy and the canonical local PRO-BLADE Project-2424 source do not resolve as writable connected repositories in this session. They remain external-access blocked here rather than silently counted as inspected or completed source.

## VertexED production boundary

Repository/source CI is substantially stronger than the live-production identity evidence. The last retained public `/api/health` probe in the repository issue history returned HTTP 200 but no JSON `revision` field and no `X-VertexED-Revision` header; the scheduled immutable-revision monitor also retained a failure against the recorded workflow commit.

Therefore no claim is made that the public production domain serves the latest source SHA. Authenticated production certification remains separately bounded by disposable-account evidence. No deployment was performed or claimed in this ledger.

## Safety boundary

No destructive migration, force-push, secret disclosure, credential rotation, fabricated benchmark, fabricated test pass, fabricated research result, paid API use, or explicit production deployment is claimed by this evidence update.
