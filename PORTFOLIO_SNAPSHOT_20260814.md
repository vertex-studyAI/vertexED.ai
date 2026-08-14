# PORTFOLIO SNAPSHOT — 2026-08-14

**Mode:** evidence-first convergence  
**Recovery base:** `vertex-studyAI/vertexED.ai@f177d87c4ee3f8daeb04cbded6c5be299cde4bae`  
**Directly connected repositories:** `vertex-studyAI/vertexED.ai`, `vertex-studyAI/LAM-JEPA`, `vertex-studyAI/Text-To-Video`  
**Live Percy host:** unavailable from this evidence surface; SQLite/WAL/process/queue counters remain `UNKNOWN`  
**Rule:** claim-specific GREEN only. Negative results remain negative. Source success is not production success.

This snapshot supersedes status labels only where fresh evidence was directly checked during the 2026-08-14 recovery wave. Existing raw results, failed experiments, frozen thresholds, reserved confirmatory seeds and negative conclusions are preserved.

## Verified portfolio snapshot

| Project | Scientific Question | Current Evidence | Engineering State | Reproducibility | Manuscript | External Validation | Blocker | Recommended State |
|---|---|---|---|---|---|---|---|---|
| LAM-JEPA | Does the frozen full model beat matched ARC controls, and do planner/target mechanisms contribute? | Five-seed full `0.254915±0.012997` vs supervised `0.266441±0.015460`; planner/target effects unsupported; locked test untouched | Mature research implementation and evidence package | Strong retained multi-attempt reproduction plus independent audit | Strongest current paper package; negative-result figures/tables exist | Independent review and public-release/legal decisions still missing | related-work closure, license/authorship/citation approval, final release QA | **A — PUBLISH** as a negative result |
| IRIS v0.2 | Can robust memory separate transient outliers from persistent regime change better than strong robust controls? | Development gain only ~`5.33–5.36%` vs frozen `>=10%`; not cleanly above Huber; coherent bursts adverse | Reproduced v0.2 package; successor candidate remains RED | Reproduced development/stress package; confirmatory seeds untouched | Viable mixed/negative technical paper if framed conservatively | External data and independent review missing | prior-art closure, stronger baseline family, external dataset; no confirmatory rescue | **D — NEGATIVE RESULT** for v0.2; any successor is a new project/version |
| NeuroCAD / T2424-0037 | Does typed + validated intermediate representation improve executable CAD correctness and invalid rejection over direct extraction? | Held-out-template v1: typed `19/20` vs direct `12/20`; valid cases generate non-empty STL `12/12`; frozen negative-width failure preserved | Controlled compiler + validator + OpenSCAD backend + tests | Frozen benchmark and focused reruns retained | Strong bounded positive paper candidate | No third-party replication; no broad OOD/general CAD evidence | same-provider learned direct baseline, new-part-family OOD, novelty audit | **C — CONTINUE EXPERIMENTATION** with only decisive matched/OOD gates |
| VertexED | Can the product reliably deliver the intended learner workflow in production? | Source gates are strong; public production smoke works except exact served revision identity; authenticated golden journey incomplete | Source GREEN; live production not certified | Repository/source reproducibility strong; production identity unresolved | Not a research-paper priority | Real deployment and real authenticated journeys required | `/api/health` missing immutable revision; authenticated certification | **B — PRODUCTIZE** |
| Percy | Can evidence-native orchestration reliably recover, schedule, verify and preserve research work under real failures? | Control-repo runtime/governance artifacts exist; 16,256 identities are logical registry entries only; live dispatch/completion/failure counters unknown | Useful control-plane work exists; real host state unavailable | Production qualification not established from this surface | Research/system paper premature until measured real-host study exists | Real Mac host, provider failures, crash/restart and independent verification required | `/Volumes/PRO-BLADE/Atlas/Percy` inaccessible here | **F — EXTERNALLY BLOCKED** until host recovery; no scale-up |
| T2424-0027 | Can language-specific latent directions be removed while preserving concept structure in a controlled diagnostic? | Synthetic diagnostic passes frozen leakage-reduction gate (`0.9583` normalized excess reduction); independent verifier/focused tests retained | Runnable deterministic package | Strong for the synthetic boundary | Possible diagnostic paper only after real-model extension | Real multilingual encoder and independent replication missing | synthetic-only evidence; no linguistic-relativity claim | **C — CONTINUE EXPERIMENTATION** with one preregistered real-encoder study |
| Darcy / T2424-0050 | Does reduced harmonic resistance preserve the relevant 1D Darcy pressure solution under the frozen screen? | 20-seed synthetic screen: mean pressure MAE `0.0658913916→0.0011366559`, `97.8766%` relative improvement; flux error ~`1.37e-16` | Tested bounded scientific-computing tool | Frozen result and focused tests retained | Potential methods note after learned/OOD attack | No real porous-media or learned-operator evidence | matched learned operator, 2D/OOD/misaligned fields | **C — CONTINUE EXPERIMENTATION** |
| NGMT v0.1 | Does equal-budget B3 outperform B1/B2 under adverse conditions without excessive clean regression? | B3 vs B2 `+0.4946%±1.5472%` vs `>=5%` FAIL; B3 vs B1 `+0.4393%±1.1529%` vs `>=3%` FAIL; clean gate PASS | Frozen learned comparison exists | Unchanged replay reproduces metrics/hashes | Negative-results package possible but small/synthetic | Independent external task replication missing | only 3 paired seeds; narrow synthetic task | **D — NEGATIVE RESULT**; v0.1 receives no rescue compute |
| Eigen-JEPA | Does spectral/eigen representation improve the primary covariance forecast over strong direct statistical baselines? | Real-data rerun is mixed/negative; raw/log ridge stronger on primary matrix MSE | Research package exists | Atlas reproduction retained | Negative/mixed paper candidate | Multi-dataset external replication missing | stronger spectral baselines and frozen metric hierarchy | **D — NEGATIVE RESULT** for current superiority claim |
| APEN | Does adaptive salience preserve benefit as salience quality degrades? | Controlled benefit weakens/reverses under severe salience dropout | Research package exists | Atlas rerun retained | Useful failure/tradeoff result, not a superiority paper yet | Naturalistic task missing | matched learned baseline and realistic salience-quality model | **D — NEGATIVE RESULT** for broad robustness claim |
| NPMS | Does the controlled memory mechanism survive strong learned-memory controls and OOD/natural tasks? | Controlled diagnostic and companion RNN/GRU evidence reproduce; broad transfer unestablished | Research package exists | Retained controlled reproduction | Candidate only after external/generalization gate | External/natural task missing | strong learned memory controls + OOD/generalization | **C — CONTINUE EXPERIMENTATION** |
| T2424-0025 robust readouts | Do robust non-Gaussian readouts isolate a unique adverse-corruption mechanism? | Robust readout effect reproduces, but 0% control also benefits; mechanism not unique | Tested precursor/diagnostic | Focused suite retained | Weak standalone paper in current form | Learned memory mechanism untested | baseline/mechanism specificity | **C — CONTINUE EXPERIMENTATION** only as precursor to a separately frozen learned study |
| T2424-1863 local diffusion | Does the proposed local operator exceed the frozen `>75%` improvement gate? | Exact-head reproduced negative; frozen gate fails; zero-diffusion control does not rescue | Tested bounded screen | Exact-head workflows reproduce the negative | Low-priority negative note | Real PDE/learned baseline absent | low incremental information without real PDE study | **D — NEGATIVE RESULT**; preserve, no retuning |
| Research Atlas V4 | Can the packaged portfolio evidence be rebuilt reproducibly? | `39/39` tests; 18 base reruns; 61/65 selected artifacts byte-exact, four PDF timestamp-only differences | Mature local reproducibility package | Strong local/package reproduction | Infrastructure appendix/release artifact, not standalone flagship paper yet | Independent clean-environment reproduction missing | outside reproducer | **F — EXTERNALLY BLOCKED** for external-reproduction claim |
| Text-To-Video V6 | Can notes-to-video execute as a reliable local render pipeline before production hosting? | Real local MP4, validated external job, durable local queue, SHA-256 content-addressed storage; latest head CI successful | Strong local prototype; not production service | CI-backed local pipeline | Not a current research-paper priority | Hosted/object storage, deployed worker, auth/ownership and real narration unvalidated | production architecture and live validation | **B — PRODUCTIZE** at bounded priority |
| FinanceMeta | Can the product securely deliver a persistent member learning/program journey? | Recovery/hardening package exists; canonical target and production Supabase not connected here | Target mutation/production certification blocked | Current target not independently verified from this surface | Not a research-paper priority | Real target, production DB and real member/admin denial paths required | GitHub/Supabase authorization | **F — EXTERNALLY BLOCKED** |
| The Bu1LD | Can the platform reliably support its real role-based member/project workflows? | Source/recovery evidence exists; production hydration/deployment skew and role journeys remain unresolved | Target production certification blocked | Not established against current live target here | Not a research-paper priority | Real repo/Supabase/Cloudflare + seven role journeys required | access/deployment authorization | **F — EXTERNALLY BLOCKED** |
| PEN | Does the distinct PEN mechanism have executable, independently reproducible evidence separate from APEN? | Separate evidence package exists, but runnable source-tree reproduction is not established | Source identity unresolved | Not established | Not ready | Source recovery itself is prerequisite | standalone executable source missing | **F — EXTERNALLY BLOCKED** |
| Hercules | Does the proposed architecture beat a standard learned baseline under identical budget? | No credible matched-budget learned experiment | Architecture/runtime family only | Scientific reproduction not applicable yet | Not ready | No external validation | no frozen experiment, weak evidence-to-cost ratio | **E — ARCHIVE current form**; revive only with one frozen bounded experiment |
| Olympus | Does role decomposition improve correctness/evidence under equal provider/tool/task budget? | O0 roadmap/runtime only; O1 matched-provider experiment absent | Roadmap/runtime | No scientific reproduction | Not ready | None | no frozen O1 protocol or evidence | **E — ARCHIVE current form**; revive only after a bounded O1 protocol exists |
| Project 2424 umbrella | Is project count itself evidence of scientific value? | No. Selected child projects have bounded evidence; registry scale does not imply completed research | Useful registry/infrastructure | Child-specific only | No umbrella paper based on count | N/A | semantic duplication and status inflation risk | **E — ARCHIVE as standalone scientific project**; retain as canonical parent registry for surviving children |

## Priority scoring

Each serious effort is scored `0–5` on: scientific importance (`SI`), originality (`O`), evidence (`E`), reproducibility (`R`), baseline strength (`B`), robustness (`RB`), implementation quality (`IQ`), paper potential (`PP`), product potential (`PrP`), external-validation potential (`EV`), compute feasibility (`CF`), time-to-closure (`TC`), negative-result value (`NRV`), and strategic value (`SV`). Scores are conservative portfolio-management judgments, not scientific measurements.

Priority is operationalized as:

`Impact = mean(SI, max(PP,PrP), SV)`  
`Evidence = mean(E,R,B,RB)`  
`Closure = mean(TC,CF,IQ)`  
`RemainingCost = max(1, 6 - mean(TC,CF))`  
`Priority = 100 × Impact × Evidence × Closure / (125 × RemainingCost)`

The score prioritizes defensible closure, including negative-result closure. Tier selection can be *smaller* than the numerical ranking when a result is too narrow to justify flagship status.

| Project | SI | O | E | R | B | RB | IQ | PP | PrP | EV | CF | TC | NRV | SV | Priority |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LAM-JEPA | 4.0 | 3.0 | 5.0 | 5.0 | 4.5 | 4.5 | 4.5 | 4.5 | 0.5 | 3.5 | 5.0 | 5.0 | 5.0 | 4.5 | **79.6** |
| IRIS v0.2 | 4.0 | 3.0 | 4.5 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 0.5 | 3.5 | 5.0 | 4.5 | 5.0 | 4.0 | **47.5** |
| VertexED | 2.0 | 1.5 | 4.5 | 4.0 | 3.0 | 3.5 | 4.5 | 1.0 | 5.0 | 5.0 | 5.0 | 4.5 | 0.5 | 5.0 | **44.8** |
| NGMT v0.1 | 3.5 | 3.0 | 4.0 | 4.5 | 4.0 | 3.5 | 4.0 | 3.0 | 0.5 | 3.0 | 5.0 | 4.5 | 5.0 | 3.5 | **38.4** |
| NeuroCAD / T2424-0037 | 4.0 | 3.5 | 4.0 | 4.0 | 3.0 | 3.0 | 4.5 | 4.0 | 3.5 | 4.0 | 5.0 | 4.0 | 2.5 | 4.0 | **33.6** |
| T2424-1863 | 2.5 | 2.0 | 4.0 | 4.5 | 3.0 | 4.0 | 4.0 | 2.5 | 0.5 | 2.5 | 5.0 | 4.5 | 4.5 | 2.5 | **27.9** |
| Eigen-JEPA | 3.5 | 2.5 | 3.5 | 4.0 | 3.5 | 3.0 | 3.5 | 3.5 | 0.5 | 3.5 | 5.0 | 4.0 | 4.0 | 3.5 | **27.2** |
| Research Atlas V4 | 2.5 | 1.5 | 4.0 | 4.5 | 3.0 | 3.5 | 4.0 | 2.5 | 2.0 | 4.5 | 5.0 | 4.0 | 2.5 | 4.0 | **26.0** |
| Text-To-Video V6 | 1.5 | 1.5 | 4.0 | 4.0 | 2.0 | 3.5 | 4.5 | 1.0 | 4.0 | 4.5 | 5.0 | 4.0 | 1.0 | 3.5 | **24.3** |
| T2424-0025 | 3.0 | 2.0 | 4.0 | 4.0 | 3.0 | 3.5 | 4.0 | 2.5 | 0.5 | 3.0 | 5.0 | 4.0 | 2.5 | 3.0 | **23.7** |
| Darcy / T2424-0050 | 3.5 | 2.5 | 4.0 | 4.0 | 2.5 | 3.0 | 4.0 | 3.5 | 1.0 | 4.0 | 5.0 | 3.5 | 2.0 | 3.5 | **22.5** |
| APEN | 3.0 | 2.5 | 3.5 | 4.0 | 2.5 | 3.0 | 3.5 | 3.0 | 0.5 | 3.0 | 5.0 | 4.0 | 4.0 | 3.0 | **21.7** |
| NPMS | 3.5 | 3.0 | 3.5 | 4.0 | 3.0 | 3.0 | 3.5 | 3.5 | 0.5 | 4.0 | 5.0 | 3.5 | 2.5 | 3.5 | **21.6** |
| T2424-0027 | 3.0 | 3.0 | 3.5 | 4.0 | 3.0 | 3.0 | 4.0 | 3.5 | 1.0 | 4.0 | 5.0 | 3.5 | 2.5 | 3.0 | **20.4** |
| Percy | 3.5 | 3.5 | 3.0 | 2.5 | 2.5 | 2.0 | 3.5 | 3.0 | 5.0 | 4.0 | 4.0 | 2.5 | 2.0 | 5.0 | **10.9** |
| The Bu1LD | 1.5 | 1.0 | 3.0 | 2.5 | 1.5 | 2.0 | 3.5 | 0.5 | 4.5 | 5.0 | 4.5 | 2.5 | 0.5 | 4.0 | **8.4** |
| FinanceMeta | 1.5 | 1.0 | 2.5 | 2.0 | 1.5 | 2.0 | 3.0 | 0.5 | 4.5 | 5.0 | 4.5 | 2.5 | 0.5 | 4.0 | **7.1** |
| PEN | 2.5 | 2.0 | 1.5 | 1.0 | 1.5 | 1.5 | 1.5 | 2.0 | 0.5 | 2.5 | 5.0 | 1.5 | 2.0 | 2.0 | **2.3** |
| Hercules | 3.0 | 2.0 | 1.0 | 1.0 | 0.5 | 0.5 | 2.0 | 1.5 | 1.5 | 2.0 | 3.0 | 1.0 | 1.0 | 2.5 | **0.7** |
| Olympus | 2.5 | 2.0 | 0.5 | 0.5 | 0.5 | 0.5 | 1.5 | 1.5 | 1.5 | 2.0 | 3.0 | 1.0 | 0.5 | 2.5 | **0.4** |

## Compressed tiers

### TIER S — 4 efforts only

1. **LAM-JEPA — A/PUBLISH.** Finish the negative-result paper/release package; no scientific rescue runs.
2. **NeuroCAD / T2424-0037 — C/CONTINUE.** Run only the same-provider learned direct-vs-IR and new-part-family OOD gates, then publish or falsify.
3. **VertexED — B/PRODUCTIZE.** Repair exact production revision identity and complete one authenticated golden journey; no feature expansion.
4. **IRIS v0.2 — D/NEGATIVE RESULT.** Close as a mixed/negative package. A successor is not Tier S until separately preregistered and passes development gates.

No fifth Tier S slot is filled. Capacity is intentionally left unused rather than promoting a weaker story.

### TIER A — 10 secondary efforts

NGMT v0.1 negative package; Eigen-JEPA negative/mixed package; Darcy T2424-0050; T2424-0027; NPMS; APEN; Research Atlas V4; Percy host recovery/qualification; Text-To-Video V6; T2424-0025 robust-readout precursor.

### TIER B

T2424-1863 negative archive package; FinanceMeta while target access is blocked; The Bu1LD while target/deployment access is blocked; PEN while executable source is missing; other bounded Project 2424 tools with useful engineering evidence but no current flagship question.

### ARCHIVE / NO SIGNIFICANT COMPUTE

Hercules current broad architecture narrative; Olympus current roadmap narrative; Project 2424 as a project-count competition; duplicate/renamed architecture variants without a distinct falsifiable question; proposal-only registry entries without source/evaluation; any attempt to rescue frozen LAM-JEPA, IRIS v0.2, NGMT v0.1, Eigen-JEPA or T2424-1863 by post-hoc retuning.

## Fresh 2026-08-14 deltas

- VertexED `main` is `f177d87c4ee3f8daeb04cbded6c5be299cde4bae` on the recovered surface.
- The scheduled production monitor on 2026-08-14 failed after bounded retries because `/api/health` did not expose the expected immutable deployed revision; homepage, API-404, malformed-waitlist, logged-out auth-boundary and untrusted-origin checks passed. Production therefore remains **not certified**.
- `Text-To-Video` is no longer `UNKNOWN/UNTRIAGED`: current `main` `5b9835a06f41f07f52029ee830b82565969c0965` has a successful CI run and documents a strong local render pipeline, while explicitly denying production-service status.
- PR #319 was checked directly and is **closed, unmerged, draft**; stale search indexing must not be used to claim an open PR.

## Immediate operating constraint

Until the real Percy host is observable, do **not** create a large new Percy queue. First recover the existing SQLite/WAL state, reconcile queued/running/failed/blocked/stale tasks, preserve failed runs, and measure real physical throughput. The logical registry count is not worker concurrency.
