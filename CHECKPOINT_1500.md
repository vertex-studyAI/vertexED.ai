# CHECKPOINT_1500 — Percy closure wave

**Date:** 13 August 2026  
**Truth rule:** claim-specific GREEN only. Negative results remain first-class evidence. No failed scientific result was retuned, no locked confirmatory set was used for rescue, and no completed queue item is recreated here.

## Control state

- Logical identities: **16,256** (`P00000..P16255`), 127 squads × 128. This is a scheduling namespace, not physical concurrency.
- Physical model-heavy concurrency: remains bounded by the merged Percy runtime policy; real-host Mac qualification remains external.
- Canonical research status: `portfolio/research/REPRODUCIBILITY_STATUS_20260813.md/.json`.
- Current control-repository head at checkpoint: `ed3463105cf6d790900b6b59df24db4980393b1e`.
- Current LAM-JEPA main head at checkpoint: `c6351bcd5f15a22a21b08da23da747e45023e239`.
- Open control-repo PRs: **0**.
- Open LAM-JEPA PR: **#72**, draft, stale/diverged from current main; preserve its attempt-4 evidence but do not merge over newer canonical closure work without reconciliation.

## Queue reconciliation

Recovered queue evidence shows completed work for LAM-JEPA audit, Project 2424/NeuroCAD verification, IRIS lineage/claim audit, Eigen-JEPA reproduction, APEN/NPMS reruns, and independent Atlas tests. Previously blocked states have been rechecked against current Git history rather than assumed stale.

Important queue changes since the earlier snapshot:

- **NGMT is no longer blocked on mechanism freeze.** v0.1 B0/B1/B2/B3 was frozen before implementation, executed, independently replayed, and is a legitimate GREEN negative result.
- **NeuroCAD held-out-template gate is complete.** Frozen v1 is 19/20 overall vs 12/20 direct baseline; 12/12 valid cases emit non-empty STL through OpenSCAD. The negative-width failure is preserved in v1 and separately repaired post-result.
- **IRIS stronger development baselines are reproduced.** They do not rescue PABIM/IRIS; successor confirmatory seeds remain quarantined.
- **PEN remains separate.** An evidence package exists, but fresh executable source-tree reproduction remains blocked; APEN evidence is not inherited.

## Claim-specific status

| Project | Checkpoint state | Evidence boundary |
|---|---|---|
| LAM-JEPA | **GREEN — reproducible negative scientific result + paper closure artifacts** | ARC superiority/planner/target/repaired-quantization claims unsupported; locked ARC test unused |
| IRIS v0.2 | **GREEN — reproduced mixed/negative package** | scalar heavy-tail effect localized; broad shift/learned-transfer claim fails; PABIM not promoted |
| Project 2424 runner | **GREEN — 12 priority paths exact-head/fail-closed reproduced** | project-specific synthetic/controlled boundaries retained |
| NeuroCAD | **GREEN — controlled + held-out-template + executable CAD checks** | v1 19/20 vs direct 12/20; OpenSCAD 12/12; not arbitrary NLP-to-CAD |
| NGMT v0.1 | **GREEN — learned B0–B3 negative result reproduced** | B3 misses both frozen adverse-condition advantage gates; no superiority/significance claim |
| APEN | **GREEN — reproduced controlled mixed result** | rare-event benefit collapses/reverses under salience dropout; stronger learned/naturalistic baseline still needed |
| PEN | **BLOCKED_EXTERNAL/SOURCE** | distinct evidence package exists; executable source tree not recovered; cannot inherit APEN evidence |
| Eigen-JEPA | **GREEN — reproduced real-data mixed/negative result** | no superiority over strong covariance forecasting; replication gate frozen separately |
| NPMS | **GREEN — controlled diagnostic + trained RNN/GRU companion reproduced** | controlled evidence only; natural-task/causal transfer not established |
| Hercules | **YELLOW** | architecture family; no credible same-budget learned experiment yet |
| Olympus | **YELLOW** | O0 roadmap/runtime only; O1 learned experiment not yet evidenced |
| VertexED source | **GREEN** | current source head and repository gates are available |
| VertexED production | **BLOCKED_EXTERNAL / unhealthy revision identity** | public smoke functionality passes, but `/api/health` omits the expected deployed revision; production monitor run `31683422558` failed after 3 attempts and retained artifact `9174416597` |
| FinanceMeta | **BLOCKED_EXTERNAL** | target-repository/live Supabase authorization access remains the real gate; do not burn closure time retrying inaccessible writes |
| Bu1LD | **BLOCKED_EXTERNAL for target write/deployment work** | public health workflow exists; target-source write/application work still requires correct repository/environment access |
| Percy host runtime | **BLOCKED_EXTERNAL_MAC for production qualification** | logical namespace/runtime tests are green; real Mac SQLite/lease/provider/RAM qualification is not established by hosted CI |

## Fresh evidence at checkpoint

### NGMT v0.1

Frozen tiny-Transformer experiment uses equal 6,049 trainable parameters in B0/B1/B2/B3 and equal 18-scalar runtime memory for B1/B2/B3. Three paired seeds × four arms executed with zero B3 divergence.

Frozen effect gates:

- B3 vs B2 adverse improvement: **+0.4946% ± 1.5472%**, required `>=5%` → **FAIL**;
- B3 vs B1 adverse improvement: **+0.4393% ± 1.1529%**, required `>=3%` → **FAIL**;
- clean regression vs B2: **+0.9600% ± 2.7060%**, allowed `<=2%` → PASS.

First valid run `31661313386`, artifact `9166307730`; unchanged-protocol replay `31661621771`, artifact `9166406618`. Scientific metrics, all 12 training histories and all 12 checkpoint hashes replay exactly. Verdict remains `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

### NeuroCAD

Frozen held-out-template v1:

- typed/validated compiler: 12/12 valid exact, 7/8 invalid rejection, **19/20 = 95% overall**;
- direct extraction baseline: 12/12 valid exact, 0/8 invalid rejection, **12/20 = 60% overall**;
- delta: **+35 percentage points**, above frozen +15-point gate;
- OpenSCAD 2021.01: **12/12** valid cases produced non-empty STL;
- retained v1 failure: negative width accepted. Post-result safety repair is separate and does not rewrite v1.

### IRIS

Fresh v0.2 reproduction remains byte-identical for result CSVs/figures/tables from archive SHA-256 `5d689ade...`. Stronger development baseline addendum is reproduced, but PABIM still loses strong Huber controls on clean and regime conditions. Confirmatory successor seeds remain unused. The current legitimate GREEN is **reproduced mixed/negative package**, not successor success.

### VertexED production truth

Scheduled production monitor run `31683422558` checked `https://www.vertexed.app` three times. Homepage, router 404, malformed waitlist rejection, logged-out auth boundaries, and untrusted-origin rejection all passed. The run failed because `/api/health` returned no revision while the source contract expected deploy revision `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`. Evidence artifact `9174416597`, SHA-256 `717fe1c19f0cdc77cf88ea64a446510f95093d68738314fc85eabe83b9e51237`. Keep state as `SOURCE_GREEN / PRODUCTION_BLOCKED_EXTERNAL_OR_STALE_DEPLOY`.

## Reprioritized 15:00→18:00 closure queue

Priority is impact × probability of closure × evidence value ÷ remaining time.

1. **LAM-JEPA:** reconcile stale/diverged draft PR #72 with current main; preserve unique attempt-4 audit without overwriting newer closure artifacts. Do not rerun or retune science.
2. **IRIS:** package the already-frozen successor measurement gate and strongest-baseline failure taxonomy; do not touch quarantined confirmatory seeds.
3. **Project 2424:** close canonical status/reproduce alignment only for projects with existing executable evidence; no new project proliferation.
4. **NeuroCAD:** preserve v1/post-fix split and add paper-ready table/failure taxonomy only if missing; same-provider learned comparison remains N/A until a provider-backed method exists.
5. **APEN/Eigen-JEPA/NPMS:** close claim/reproducibility ledgers; do not metric-shop or inherit PEN evidence.
6. **Hercules/Olympus:** only proceed if a pre-existing executable bounded experiment can be frozen without inventing architecture after seeing results; otherwise leave YELLOW.
7. **VertexED:** keep source GREEN; treat live revision-identity failure as deployment evidence, not source failure. Do not claim production verified.
8. **FinanceMeta/Bu1LD:** retain exact access/application instructions and move on if target write/live environment remains unavailable.
9. **Percy:** preserve 16,256 logical identities, dedupe/stale evidence, and bounded concurrency; real-host production qualification stays blocked until Mac execution is available.

## Closure rule

At ~17:00 stop opening exploratory lines. Prefer test/CI closure, evidence reconciliation, independent verification, artifact generation, stale-branch/PR disposition, and reviewable commits. Any negative gate remains negative.
