# FINAL_STATUS_2200 — Authoritative night closeout

**Closeout date:** 2026-08-13 22:00 IST  
**Control repository snapshot used:** `vertex-studyAI/vertexED.ai@f355bf02483451206486daebe4b5d5a4344a4daa`  
**LAM-JEPA snapshot used:** `vertex-studyAI/LAM-JEPA@88f759ef47263c416f2a667427286a3284d8221c`

## Truth boundary

This closeout continues the prior Percy state. No queue reset, re-registration, failed-task deletion, negative-result deletion, duplicate project creation, post-hoc rescue, or unsupported GREEN promotion is authorized by this document.

The local Percy host at `/Volumes/PRO-BLADE/Atlas/Percy` is **not directly observable from this connected execution surface**. Therefore live operational counters that require the SQLite/WAL/process state are recorded as `UNKNOWN`, not inferred from historical reports. The retained scheduling specification is exactly 16,256 logical identities (`P00000..P16255`, 127 squads × 128); this is a registry namespace, not evidence of physical concurrency or dispatch.

## Percy operational counters

| Counter | 22:00 value | Evidence boundary |
|---|---:|---|
| logical_agents_registered | 16,256 retained specification | not live-verified against local SQLite in this closeout |
| unique_agents_dispatched | UNKNOWN | local queue unavailable |
| physical_peak | UNKNOWN | local process/heartbeat state unavailable |
| complete | UNKNOWN | local task DB unavailable |
| failed | UNKNOWN | local task DB unavailable; failures must be preserved |
| blocked | UNKNOWN | local task DB unavailable |
| queued | UNKNOWN | local task DB unavailable |
| never_dispatched | UNKNOWN | cannot derive without dispatch history |

## Repository and integration state

- Control-repo exact head at closeout observation: `f355bf02483451206486daebe4b5d5a4344a4daa`, message `status: record T2424-1863 exact-head negative reproduction`.
- LAM-JEPA exact head: `88f759ef47263c416f2a667427286a3284d8221c`, adding a machine-readable attempt-4 audit without changing the frozen science.
- Open PRs observed through the connected GitHub surface: **0** in `vertexED.ai`; **0** in `LAM-JEPA`.
- Control-head combined commit status is `success`, but the two reported Vercel contexts are `Canceled by Ignored Build Step`; this is not evidence that the currently served production revision is correct.

## Authoritative portfolio dashboard

| Priority | Project | Closeout status | Supported claim | Primary next gate |
|---:|---|---|---|---|
| 1 | LAM-JEPA | **GREEN — reproducible negative result** | Frozen ARC validation reruns reproduce the negative/inconclusive superiority and mechanism verdict | paper conversion + external/independent review; locked ARC test remains untouched |
| 2 | IRIS v0.2 | **GREEN — reproduced mixed/negative package; candidate RED for successor promotion** | scalar heavy-tail effect is localized; abrupt adaptation / learned transfer do not support broad claim | freeze successor candidate, baseline family, metric, effect statistic, >=10% gate, falsifier and analysis plan before confirmatory seeds |
| 3 | Project 2424 strongest current story | **GREEN — bounded reproducibility factory; selected negative/controlled results reproduced** | multiple exact-head or frozen-source experiments reproduce within their claim boundaries | stronger real/learned baselines and external/generalization tests on a small flagship set |
| 4 | NeuroCAD | **GREEN — controlled + held-out-template gate** | frozen v1 typed/validated pipeline: 19/20 overall vs 12/20 direct; 12/12 valid cases produced non-empty STL | same-provider learned direct-vs-IR study + broader OOD/external reproduction |
| 5 | Darcy T2424-0050 | **GREEN — bounded synthetic mechanism screen** | 20-seed pressure-MAE screen reproduced; focused suite retained | learned operator, matched budget, OOD/misaligned fields, held-out physical regimes |
| 6 | NGMT v0.1 | **GREEN — reproduced negative learned B0–B3 result** | B3 misses both frozen adverse-condition advantage gates while clean-regression gate passes | redesign only as a versioned successor; do not retune v0.1 |
| 7 | APEN | **GREEN — reproduced controlled mixed result** | rare-event tradeoff reproduced; salience failure weakens/reverses benefit | matched learned baselines + naturalistic task + preregistered salience stress |
| 8 | Eigen-JEPA | **GREEN — reproduced real-data mixed/negative comparison** | stronger covariance forecasting baseline remains competitive/stronger on primary metric | stronger spectral baselines + preregistered target + multi-dataset replication |
| 9 | NPMS | **GREEN — controlled diagnostic + companion learned evidence reproduced** | controlled mechanism evidence only; no natural-task causal transfer claim | stronger sequence baselines + OOD/generalization |
| 10 | Hercules | **YELLOW** | architecture/implementation family only | same-budget Transformer vs proposal vs ablation |
| 11 | Olympus | **YELLOW** | O0 roadmap/runtime only | O1 matched-provider monolithic vs role-decomposition experiment, then ablation |

## Frozen scientific anchors

### LAM-JEPA

Frozen ARC result remains negative/inconclusive. Five-seed aggregates:

- full: `0.254915 ± 0.012997`
- matched supervised: `0.266441 ± 0.015460`
- no_planner: `0.250169 ± 0.012997`
- no_target: `0.261695 ± 0.020395`

Planner contribution unsupported. Target contribution unsupported. Locked ARC test remains untouched. Retained artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`. Independent retained-artifact audit also records validation prediction-support collapse behavior; no rescue is permitted.

### IRIS

Successor candidate remains RED. Development stress seeds show approximately `5.33–5.36%` abrupt-regime improvement over fixed HTAM versus frozen `>=10%` gate. PCRW does not cleanly beat Huber on the relevant abrupt comparison; coherent burst outliers remain adverse. Reserved confirmatory seeds remain untouched.

### Project 2424 canonical reproduction

Canonical reproduction source: `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`; workflow `31618609967`; job `94295733785`; artifact `9162627168`; SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`. Latest reproduction establishes **scientific-value agreement**, not latest byte identity.

Retained focused evidence: T2424-0025 `10/10`; T2424-0027 `8/8` plus independent verifier; NeuroCAD `6/6`; Darcy `6/6`.

### NGMT v0.1

Frozen equal-budget tiny-Transformer B0/B1/B2/B3 experiment used 6,049 trainable parameters per arm and equal 18-scalar runtime memory for B1/B2/B3. Three paired seeds × four arms, zero B3 divergence. B3 vs B2 adverse improvement `+0.4946% ± 1.5472%` vs required `>=5%`: FAIL. B3 vs B1 `+0.4393% ± 1.1529%` vs required `>=3%`: FAIL. Clean regression vs B2 `+0.9600% ± 2.7060%` vs allowed `<=2%`: PASS. Verdict: `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

## Product boundary

- **VertexED source:** GREEN by repository evidence.
- **VertexED production:** `BLOCKED_EXTERNAL_OR_STALE_DEPLOY`. Production monitor `31683422558` passed public smoke boundaries but `/api/health` did not provide the expected deployed revision; artifact `9174416597`, SHA-256 `717fe1c19f0cdc77cf88ea64a446510f95093d68738314fc85eabe83b9e51237`.
- **FinanceMeta:** BLOCKED_EXTERNAL on canonical target/live authorization.
- **The Bu1LD:** BLOCKED_EXTERNAL for target write/deployment work.
- **Percy host production qualification:** BLOCKED_EXTERNAL_MAC from this surface; do not infer local runtime health.

## 28-hour handoff rule

The next run must start by loading the existing Percy DB/checkpoint and these ledgers, not by generating a new registry. First actions: verify SQLite+WAL integrity, reconcile leases/heartbeats/stale tasks, preserve failures, measure the previously UNKNOWN counters, then execute `NEXT_48H_QUEUE.md` in evidence-value order. No frozen negative result may be retuned in place.
