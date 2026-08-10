# WHAT ACTUALLY CHANGED

**Execution date:** 10 August 2026

This handoff reports inspectable repository/CI evidence only. It does not convert queues into completed projects, synthetic screens into external scientific validation, green source CI into immutable production proof, or inaccessible repositories into executed work.

## 1. SHIPPED / MERGED / VERIFIED

### VertexED — P0 source-side production identity fix is ready for owner-gated release

PR #184 is **review-ready, not merged, not deployed**. Exact head `256c15de93e064b5a931ecf6a9f2f29159750046` passed CI `31412824339` and Production Health Monitor `31412824223`.

It:

- generates a normalized immutable `BUILD_REVISION` from Vercel/GitHub SHA or Git fallback;
- stamps the revision during the build;
- makes `/api/health` fall back to the stamped revision when runtime SHA variables are absent;
- requires a valid revision during Vercel deploy builds rather than emitting an unverifiable production artifact;
- includes regression coverage for normalization, precedence, Git fallback, generated-module output, fail-closed required mode, and health fallback.

This closes the **source-side** gap that allowed health to return 200 without a provable revision. It does not prove the public site serves this head until an explicitly authorized merge/deploy occurs and production returns matching body/header SHA. Because the PR changes `vercel.json`, build lifecycle, and health runtime, it must not be auto-merged/deployed.

### Project 2424 — five verified packages on `main`

1. **T2424-0034 Quant ML Visualizer** — PR #166; exact-head CI `31409366246`; descriptive quantitative tool/demo, not predictive alpha.
2. **T2424-0036 Rubik's A* Intelligence** — PR #169; CI `31409707818`; bounded orientation-free 2×2 corner-permutation A*, not a full cube solver.
3. **T2424-0038 Obscured Records editorial triage** — PR #178; CI `31411209123`; evidence-gated triage, not factual/legal verification or autonomous publishing.
4. **T2424-1767 Resource-Bounded MoE Operator** — PR #162; CI `31409012137`; synthetic resource/error screen, not a superiority result.
5. **T2424-1863 Resource-Bounded Local Operator** — PR #177; predeclared >75% gate failed at **67.777%**. Learned coefficient 0.179689 versus planted 0.18; zero-diffusion control -0.029%. Negative/inconclusive verdict preserved.

### Text-To-Video — fail-closed media integrity merged

Canonical PR #7 merged as `1d1ad2d027ca38e6fb0581ccf280333da454b672`. Exact head `4791f21a55217520955db603d917d8a5f2d7f06a` passed CI `31409630201` covering workspace release checks, FFmpeg/ffprobe verification, real MP4 smoke encoding, external render-job encoding, dependency audit, and evidence uploads.

Current attempts are staged away from the final MP4, verified before promotion, cleaned on failure, and cannot expose a failed current-attempt digest/URL. Previous verified media is preserved. Parallel PR #8 is closed unmerged. No hosted queue/storage/deployment behavior was added.

### LAM-JEPA — research status/provenance merged

PR #53 merged `RESEARCH_STATUS.md`, versioning the ARC eligibility boundary, frozen controls, repaired-v5 outcome, supported/unsupported claims, and the stop rule forbidding locked ARC test use to rescue the failed hypothesis.

PR #54 merged `RELEASE_PROVENANCE.md`, recording validation dataset identity/hashes/counts, test-split prohibition, comparison conditions, dependency surface, reproduction entry points, and claim boundaries.

These changes **do not change the negative/inconclusive scientific verdict** and do not claim `RESEARCH_COMPLETE`. A root license and final citation/author metadata remain explicit owner-only publication decisions; none was invented.

## 2. PROJECT 2424 — CURRENT DASHBOARD

- First-100 execution-ready queue: **100 / 100**
- Distinct First-100 entries with substantive verified implementations: **13 / 100**
- Merged verified packages on `main`: **5 / 100**
- Exact-head-green review-ready distinct packages: **8 / 100**
- Strict certified complete: **0 / 100**
- Merged synthetic research screens with retained result/verdict evidence: **2**
- Preserved merged negative/inconclusive screen: **1**

The eight review-ready distinct entries are:

- T2424-0024 Trust Under Uncertainty — #172
- T2424-0026 Counterfactual Defect Worlds — #174
- T2424-0028 Residual Event Tokenization — #163
- T2424-0029 Representation Phase Transitions for PDEs — #176
- T2424-0035 Grokking Agent evaluator — #167
- T2424-0037 Controlled NLP-to-CAD — #165
- T2424-0053 Scientific Motif Dictionary — #179
- T2424-0054 Theory-Manifold Experiment Planner — #170

Strict certification remains 0 because the full gate still requires immutable source, falsifiable claim, frozen protocol, runnable command, baseline, raw artifacts, ablation/negative analysis, explicit verdict, and independent QA.

### Failures caught rather than hidden

- **NLP-to-CAD:** CI caught `diameter` being parsed as radius through a single-letter regex collision; boundaries were repaired and the exact repaired head re-passed CI.
- **Trust Under Uncertainty:** CI showed the intended moderate synthetic confidence control was not actually better under five-bin ECE; the fixture was repaired without weakening the evaluator/test.
- **T2424-1863:** the predeclared scientific gate failed; the negative result was retained rather than threshold-adjusted.
- **Duplicate integration:** redundant T2424-0038 #181 and stale handoff #183 were closed instead of being carried as duplicate/conflicted work.

### Noncanonical T2424-0034 follow-up

PR #160 is a green walk-forward/no-lookahead/transaction-cost follow-up created before canonical T2424-0034 merged via #166. It is not double-counted as another project; useful changes should be reconciled into the canonical tree before any merge.

## 3. CORE PRODUCTS

### VertexED

The source-side immutable revision contract is now a tested release candidate in #184. The remaining gates are explicit: authorize merge/deploy, verify the exact stamped SHA from production body/header, then complete the authenticated disposable-account journey. No deployment was performed by this follow-on lane.

### The Bu1LD / FinanceMeta

No fresh direct-repository mutation/runtime certification is claimed because the canonical targets are not exposed by the current GitHub installation.

## 4. RESEARCH

T2424-1767 and T2424-1863 provide durable synthetic scientific-ML screening artifacts on `main`, including one preserved negative/inconclusive result. Review-ready PDE, uncertainty, grokking, motif, residual-event, and counterfactual packages have controlled experiment/test mechanics but still need project-appropriate external/real evidence, stronger baselines, or independent QA.

LAM-JEPA's negative/inconclusive ARC boundary is now more durable and reproducible through merged status/provenance documentation, not more positive.

## 5. ATLAS / PERCY

No fresh runtime-health claim is made. Canonical Atlas/Percy source, SQLite state, and live worker runtime are not exposed through the current GitHub installation.

## 6. REMAINING BLOCKERS

1. Owner-gated merge/deploy of VertexED #184, then exact public body/header SHA proof and authenticated production certification.
2. Canonical Bu1LD repository/runtime access.
3. Canonical FinanceMeta repository/runtime access.
4. Atlas canonical source/runtime access.
5. Percy local SQLite/source/runtime access.
6. Wider canonical Project 2424 archive/source beyond evidence restored into VertexED.
7. Full nine-gate Project 2424 certification for the 13 verified implementations.
8. LAM-JEPA owner decisions for root license and final citation/author metadata if public release packaging is desired.

## 7. TOP NEXT ACTIONS

1. If production deployment is explicitly authorized, merge/deploy #184 and prove the exact stamped SHA served by production; otherwise leave it review-ready.
2. Promote the strongest existing Project 2424 package through the full certification gate rather than optimizing only implementation count.
3. Reconcile PR #160's no-lookahead/transaction-cost work into canonical T2424-0034.
4. T2424-0024: evaluate retained real-model predictions with bootstrap uncertainty and subgroup slices.
5. T2424-0029: extend the frozen representation metric to a numerical nonlinear PDE.
6. T2424-0037: validate generated geometry through a real CAD kernel before broadening grammar claims.
7. T2424-0053: run external scientific time-series motif benchmarks against strong baselines.
8. T2424-1767/T2424-1863: move from synthetic screens to public scientific data and stronger baselines while preserving negative evidence.
9. Complete owner-only LAM-JEPA license/citation decisions if publication packaging is wanted.
10. Connect FinanceMeta, Bu1LD, Atlas, Percy, and wider Project 2424 source/runtime.

## 8. OWNER INTERVENTION REQUIRED

Do not paste secrets into chat or GitHub issues. Owner-side actions are access/authorization decisions:

- explicitly authorize merge/deploy of VertexED #184 if you want the production identity fix released;
- expose canonical FinanceMeta, Bu1LD, Atlas, Percy, and wider Project 2424 sources/runtimes;
- provide secure disposable production identities through the supported account/secret flow for authenticated VertexED certification;
- choose/approve LAM-JEPA root licensing and final public citation/author metadata if release packaging is desired.

## FINAL RECONCILED METRICS

Repositories inspected: **3**  
VertexED P0 immutable-build-revision candidate: **exact-head verified / review-ready / not deployed**  
Distinct First-100 implementations verified: **13**  
Merged verified First-100 packages: **5**  
Review-ready exact-head-green distinct First-100 packages: **8**  
Strict First-100 certified complete: **0 / 100**  
Merged synthetic research screens with retained verdict evidence: **2**  
Preserved merged negative/inconclusive screen: **1**  
Text-To-Video canonical integrity fix: **merged**  
LAM-JEPA status/provenance package: **merged**  
Production deployments intentionally performed by follow-on lane: **0**  
Unsupported positive research-result claims made: **0**
