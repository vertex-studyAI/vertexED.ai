# PORTFOLIO SNAPSHOT — 2026-08-14

**Snapshot time:** 2026-08-14 12:03 IST  
**Branch:** `agent/portfolio-closure-20260814`  
**Purpose:** verified convergence snapshot; claim-specific status only.

## Evidence boundary

This snapshot was recovered from the connected GitHub surface, the authoritative 22:00 closeout ledgers already on `vertex-studyAI/vertexED.ai`, the current `vertex-studyAI/LAM-JEPA` main branch, current open issues/workflow state, and retained Percy research artifacts. It does **not** infer local Percy host state.

Connected GitHub currently exposes only:

- `vertex-studyAI/vertexED.ai`
- `vertex-studyAI/LAM-JEPA`
- `vertex-studyAI/Text-To-Video`

The live Percy host at `/Volumes/PRO-BLADE/Atlas/Percy` is not visible from this execution surface. Therefore current SQLite/WAL integrity, leases, heartbeats, physical worker counts, queued/failed/stale/running task counts, dirty worktrees and provider/resource health are **UNKNOWN** until inspected on the host. The retained `16,256` Percy identities are a logical registry namespace, not physical workers.

Current GitHub evidence checked during this snapshot:

- `vertexED.ai` main: `f177d87c4ee3f8daeb04cbded6c5be299cde4bae`.
- Current VertexED Vercel commit statuses are `success`, but scheduled **Production Health Monitor** run `31771831538` failed on 2026-08-14 against that head. Production must therefore remain separate from source status.
- `LAM-JEPA` main: `88f759ef47263c416f2a667427286a3284d8221c`; latest claim-boundary workflow on that head completed successfully.
- Open PRs on the three connected repositories: none observed in the recovery pass.
- FinanceMeta and The Bu1LD remain outside the currently installed writable GitHub surface.

## Verified portfolio table

| Project | Scientific Question | Current Evidence | Engineering State | Reproducibility | Manuscript | External Validation | Blocker | Recommended State |
|---|---|---|---|---|---|---|---|---|
| **LAM-JEPA** | Does frozen LAM-JEPA beat matched supervised ARC controls, and do planner/target mechanisms add value? | Five-seed frozen validation result is negative/inconclusive: full `0.254915±0.012997` vs supervised `0.266441±0.015460`; planner and target effects unsupported; locked ARC test untouched. | Mature repo; negative-result/release artifacts present. | Strong: retained artifact `9162165932`, SHA-256 `caa898f1...`, independent audit; current claim-boundary CI green. | Strongest current package; negative-result framing only. | Not established. | License/citation/authorship decisions, final provenance/figure audit, independent review. | **A — PUBLISH** as a negative/reproducibility paper or technical report. |
| **IRIS v0.2** | Can robust memory distinguish transient corruption from persistent regime change better than strong robust controls? | Current successor misses the frozen `>=10%` abrupt-regime gate at only ~`5.33–5.36%`; PCRW not cleanly above Huber; coherent bursts adverse; confirmatory seeds untouched. | Canonical source/manifest not available on current connected GitHub surface. | Partial retained reproduction; confirmatory reproduction not authorized. | Mixed/negative story exists; successor paper not justified yet. | None. | Recover canonical source/manifest; freeze successor, baselines, metric, effect statistic, falsifier and analysis before reserved seeds. | **D — NEGATIVE RESULT** for current successor; at most one **C — CONTINUE** successor lineage after preregistration. |
| **Project 2424 umbrella** | Which bounded mechanisms survive frozen protocols, strong baselines and independent reproduction? | Selected projects reproduce; registry scale itself is not scientific evidence. Canonical scientific-value reproduction artifact `9162627168`, SHA-256 `d9d1816d...`. | Registry/foundry useful; heterogeneous project source remains partly external to current connector. | Strong for selected bounded items; not portfolio-wide. | No single umbrella paper justified. | None portfolio-wide. | Canonicalization, deduplication, project-specific baseline/OOD gates. | **B — PRODUCTIZE** as a reproducibility/experiment foundry; research claims live only in promoted child projects. |
| **NeuroCAD / T2424-0037** | Does typed/validated IR improve executable CAD correctness over direct generation? | Frozen v1 held-out-template benchmark: `19/20` vs direct `12/20`; `12/12` valid cases produced non-empty STL; frozen negative-width failure preserved. | Functional controlled pipeline. | Focused suite `6/6`; deterministic benchmark retained. | Strong candidate after one decisive baseline/OOD expansion. | None. | Same-provider learned direct-vs-IR comparison, broader OOD/compositional prompts, independent reproduction. | **C — CONTINUE EXPERIMENTATION**, with explicit promotion gate to **A — PUBLISH**. |
| **Darcy / T2424-0050** | Does the reduced-resistance latent mechanism reduce pressure MAE while preserving flux? | Frozen 20-seed synthetic screen: MAE `0.065891→0.001137`, ~`97.88%` improvement, negligible flux error. | Working bounded implementation. | Focused suite `6/6`; retained in canonical artifact. | Plausible mechanism note, not broad neural-operator paper. | None. | Standard learned operator baselines, matched budget, 2D/OOD/misaligned fields, uncertainty table. | **C — CONTINUE EXPERIMENTATION**. |
| **NGMT v0.1** | Does equal-budget B3 memory beat B1/B2 under adverse conditions without clean regression? | Reproduced learned negative: B3 vs B2 `+0.4946%±1.5472%` vs `>=5%` FAIL; B3 vs B1 `+0.4393%±1.1529%` vs `>=3%` FAIL; clean regression gate PASS. | Tiny learned B0/B1/B2/B3 implementation exists. | Strong for v0.1: exact scientific replay retained; paired seeds and artifacts recorded. | Negative-result package possible; no superiority story. | None. | Only broader tasks/seeds/prior-work review if packaging; no v0.1 retuning. | **D — NEGATIVE RESULT**. |
| **APEN** | Does salience-aware memory improve rare-event prediction, and how does it fail as salience quality degrades? | Controlled benefit versus simple controls; advantage weakens/reverses under severe salience dropout; no oracle superiority. | Executable controlled study. | Retained Atlas rerun; key paired evidence preserved. | Moderate candidate if learned/naturalistic controls survive. | None. | Matched learned baseline, naturalistic task, preregistered salience-quality stress, external rerun. | **C — CONTINUE EXPERIMENTATION**. |
| **PEN** | Is there a distinct executable PEN mechanism with independent evidence? | Separate package referenced, but no distinct executable source-tree reproduction established; APEN evidence cannot be inherited. | Source boundary unresolved. | Not established. | Not ready. | None. | Recover standalone runnable source and protocol. | **F — EXTERNALLY BLOCKED** pending source recovery; archive if no distinct source/hypothesis is found. |
| **Eigen-JEPA** | Does spectral/eigen representation improve covariance forecasting over strong statistical baselines? | Reproduced real-data mixed/negative result; raw/log ridge remains competitive/stronger on primary matrix MSE. | Working controlled line. | Atlas rerun retained. | Negative/boundary result is defensible; positive paper not supported. | None. | Stronger spectral baselines, preregistered target hierarchy, multi-dataset replication if pursued. | **D — NEGATIVE RESULT** for current superiority claim. |
| **NPMS** | Do memory spectra encode controlled regime structure in a way that survives learned controls and OOD tasks? | Controlled diagnostic and companion learned evidence reproduce; natural-task causal transfer unestablished. | Working controlled study. | Retained Atlas reproduction. | Moderate candidate only after stronger controls/OOD. | None. | Stronger learned memory baseline, natural task, OOD/generalization, external rerun. | **C — CONTINUE EXPERIMENTATION**. |
| **T2424-0027** | Does the synthetic injected-coordinate leakage effect transfer to real multilingual encoders under proper controls? | Synthetic audit reproduced with `8/8` focused tests plus independent verifier. | Working synthetic audit. | Strong within synthetic boundary. | Not yet a paper. | None. | Real encoder, centering/random-group/random-subspace controls, preregistered probe. | **C — CONTINUE EXPERIMENTATION**. |
| **T2424-1863 local diffusion** | Does the local diffusion operator clear its frozen synthetic performance gate? | Exact-head reproduced negative; frozen `>75%` gate failed. | Working implementation and CI. | Strong exact-head negative reproduction. | Negative note only unless a broader scientific lesson emerges. | None. | New real-PDE/operator question must be versioned separately. | **D — NEGATIVE RESULT**. |
| **T2424-0028 residual events** | Do the frozen event-count reconstruction mechanics outperform meaningful compression/rate-distortion baselines? | Deterministic mechanics reproduced; superiority not established. | Working bounded codec mechanics. | Reproduced within frozen setting. | Weak currently. | None. | Byte/rate-distortion baseline, noisy/nonlinear/external signals, learned comparison. | **Tier B / C — CONTINUE only if cheap baseline is decisive**. |
| **T2424-0029 PDE transitions** | Does the analytic transition screen generalize beyond its deterministic setup? | Deterministic `3→2→2→1→1` screen reproduced. | Working analytic screen. | Reproduced within narrow boundary. | Weak currently. | None. | Nonlinear PDE, grid/energy sensitivity, learned representation comparison. | **Tier B / C — CONTINUE only after cheap falsifier**. |
| **Research Atlas V4** | Can portfolio experiments be packaged and rerun with claim boundaries preserved? | Checksummed archive, `39/39` tests, flagship reruns/manuscript rebuilds retained. | Useful evidence packaging layer. | Strong local package. | Supports papers rather than being the paper. | Independent rerun missing. | Independent clean-environment reproduction and canonical table/figure regeneration. | **B — PRODUCTIZE** as reproducibility infrastructure. |
| **Percy** | Can an evidence-native research execution system reduce false completion while preserving failures and provenance? | Retained runtime/design evidence exists; current host health and live counters are unknown from this surface. | Significant control-plane design exists; host inaccessible. | Host-level qualification not current. | Research benchmark is plausible only after false-green/dedup/verifier benchmarks. | None yet. | Mount real host; DB/WAL integrity, liveness, crash recovery, measured throughput, false-green benchmark. | **B — PRODUCTIZE**; scientific claims remain **C** until benchmarks run. |
| **VertexED** | Can the deployed product reliably carry a user through authenticated learning workflows on the exact served revision? | Source is GREEN. Current Vercel commit statuses are success, but Production Health Monitor run `31771831538` failed; production revision identity/authenticated journey not certified. | Strong source implementation. | Source gates strong; production certification incomplete. | Not a research-paper priority. | Real-user/product validation incomplete. | Exact served-revision proof, authenticated disposable-account golden journey, remaining platform hardening. | **F — EXTERNALLY BLOCKED** for production certification. |
| **FinanceMeta** | Does the product safely deliver a reproducible learning/research workflow to real members? | Recovery/hardening package exists; canonical target and production Supabase are outside current writable surface. | Source target not currently writable here. | Not independently certified on production. | Not a research-paper priority. | Needed. | GitHub/Supabase access, authorization hardening, golden journey, real-user validation. | **F — EXTERNALLY BLOCKED**. |
| **The Bu1LD** | Can the member/research platform support verified contribution workflows under correct role/security boundaries? | Retained source/recovery evidence exists; production hydration/deployment and role certification remain unresolved. | Target source/deploy surface unavailable here. | Production qualification incomplete. | Not a research-paper priority. | Needed. | Writable repo/Supabase/Cloudflare access, immutable deploy identity, seven role journeys. | **F — EXTERNALLY BLOCKED**. |
| **Hercules** | Does one bounded Hercules mechanism beat a same-budget Transformer baseline? | No credible matched-budget learned result recovered. | Architecture/runtime family only. | Not established scientifically. | Not ready. | None. | Canonical source + one frozen experiment; currently high opportunity cost. | **E — ARCHIVE** for the next month unless canonical source + one decisive cheap experiment are recovered. |
| **Olympus** | Does role decomposition improve correctness/evidence under equal provider/tool/task budget? | O0 roadmap/runtime only; O1 not executed. | Roadmap/runtime stage. | Not established scientifically. | Not ready. | None. | Freeze/run matched O1 with ablations; currently lower value than closure work. | **E — ARCHIVE** for the next month. |
| **Text-to-Video** | No current portfolio-grade scientific question recovered. | Connected repo exists, but no fresh evaluation/release evidence was audited. | Unknown/untriaged. | Unknown. | Unknown. | None. | Evidence audit would be required before any promotion. | **E — ARCHIVE** pending a concrete reason to reactivate. |

## Tier compression

### TIER S — maximum 5

1. **LAM-JEPA** — close and publish the negative/reproducibility package.
2. **NeuroCAD** — run the decisive learned direct-vs-IR/OOD attack; promote or falsify.
3. **Percy** — restore trustworthy host state and evidence-native reliability benchmarks.
4. **VertexED** — finish exact production identity and authenticated validation; stop feature expansion until certified.
5. **IRIS** — close the current negative line and permit only one preregistered successor development cycle.

### TIER A — maximum 10

- Project 2424 canonicalization/foundry
- Research Atlas V4 reproducibility infrastructure
- Darcy T2424-0050
- APEN
- NPMS
- Eigen-JEPA negative/boundary package
- NGMT v0.1 negative package
- T2424-0027 real-encoder gate
- FinanceMeta production hardening/validation
- The Bu1LD production/role validation

### TIER B

- T2424-1863 negative screen
- T2424-0028 residual events
- T2424-0029 PDE transitions
- PEN pending source recovery

### ARCHIVE / NO SIGNIFICANT COMPUTE THIS MONTH

- Hercules unless a canonical source plus one bounded same-budget experiment is immediately recoverable
- Olympus O1/O2 expansion
- Text-to-Video until a precise question/evaluation is recovered
- duplicate/renamed Project 2424 variants
- any architecture variant without a distinct hypothesis/falsifier
- any new JEPA/time-series paper fork before one flagship question is selected and baselines are frozen

## Immediate closure rule

No project in this snapshot may be promoted because of naming, manuscript existence, task count, agent count, implementation completion, or source-only CI. Promotion requires the next gate in the table and a provenance-linked artifact.
