# MASTER_STATUS

As of: 2026-08-12 20:40 IST
Control repository: `vertex-studyAI/vertexED.ai`
Observed base `main`: `89b6ea8feadec164fad2a1f0615f1e33a1f73a05`

Evidence rule: a name, branch, generated file, planned experiment, green predecessor or deployment label is not completion. `IMPLEMENTED`, `TESTED`, `MERGED`, `LIVE`, `EXTERNALLY VALIDATED`, `PUBLISHED` and `RELEASED` stay distinct.

| System | Evidence-backed state | Strongest current evidence | Primary blocker / warning | Next executable gate |
|---|---|---|---|---|
| VertexED source | TESTED + SOURCE-INTEGRATED | account-scoped transient learner handoffs and timed answers merged; immutable build revision support integrated | merge-head Vercel statuses currently report build-rate-limit failures | verify exact served revision through `/api/health`, then authenticated golden journey |
| VertexED live backend | LIVE + READ-ONLY SECURITY AUDITED | connected Supabase project ACTIVE_HEALTHY; sampled production-domain auth/API requests return successful responses; 26/26 public tables have RLS; 31 policies; no user-metadata/auth.role policy risks; owned UPDATE paths have USING + WITH CHECK | leaked-password protection disabled; Postgres security patches available | enable leaked-password protection, schedule database upgrade, re-run advisors, then destructive-path/ownership tests with disposable accounts |
| Percy | RUNNABLE / TESTED BOUNDED BASELINE | durable SQLite/WAL lifecycle merged; evidence-gated completion; leases/heartbeats/retries; state doctor merged after CI #932 | actual Mac crash/restart, provider adapter, long soak and resource contention remain unverified | run real-host queued/in-flight crash/restart + provider-failure matrix |
| Project 2424 | ACTIVE EVIDENCE FACTORY | multiple isolated exact-head-green packages integrated; open PR queue reduced to zero | most results remain synthetic/bounded; external/generalization gates differ by project | rank next work by research value × novelty × feasibility × evidence potential ÷ effort |
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED COMPILER BENCHMARK | exact-head CI #914 lineage integrated | OOD language, same-provider direct-vs-IR comparison, broader backend validation | freeze OOD benchmark and learned-provider comparison |
| T2424-0025 robust readouts | EXPERIMENTED + ANALYZED + MERGED | 50-seed contamination sweep | robust estimators also win at 0% contamination, so mechanism-specific claim is not isolated | matched Gaussian/reference controls + mechanism ablations |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | synthetic pressure-MAE screen retained | not a learned neural operator; no real porous-media validation | learned matched-budget operator baselines on frozen dataset |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | exact-head CI #830; deterministic 1D heat-equation spectral-dimension transition fixture | no nonlinear/learned/generalization evidence | learned-latent and nonlinear-PDE replication |
| T2424-0028 residual events | TESTED + MERGED CURRENT-LINEAGE RECOVERY | fresh CI #949; exact package/test blobs recovered onto newer main | scalar synthetic codec only | rate-distortion + noisy/multivariate external controls |
| T2424-0027 latent language audit | TESTED + MERGED CURRENT-LINEAGE RECOVERY | fresh CI #950; retained hash-bound evidence + independent verifier | generator explicitly injects language/concept coordinates | real multilingual encoder study with preregistered controls |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED BOUNDED CALIBRATION PACKAGE | exact-head CI #827; paired synthetic calibration/ablation evidence | no real-model trustworthiness or deployment-safety evidence | evaluate frozen real-model predictions and abstention controls |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED BOUNDED CA SCREEN | exact-head CI #828 | no learned world model / causal-discovery evidence | learned/interventional baseline on nontrivial environment |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED PREREQUISITE MECHANICS | exact-head CI #858; graph-aware fixture avoids violations vs utility-only control | no real learner benefit / curriculum validity | offline learner trace study, then prospective evaluation |
| T2424-1768 self-verifying MoE | TESTED + MERGED SYNTHETIC CONTRACT SCREEN | exact-head CI #957; corrupt expert can be rejected under caller-supplied contract | no formal verification, arbitrary verifier correctness or real SciML benefit | heterogeneous expert/task benchmark with false-accept/false-reject analysis |
| T2424-0035 Grokking Agent | TESTED + MERGED SYNTHETIC DETECTOR | exact-head CI #831; integrated concurrently | no evidence of grokking in a trained network | run detector on frozen real training curves + adversarial controls |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOLING | exact-head CI #833; integrated concurrently | deterministic heuristic, not optimal experimental design | compare planner decisions against simple/random/greedy baselines on historical tasks |
| Research Atlas V4 | FRESH LOCAL REPRODUCIBILITY + PACKAGING | 39/39 local tests, 18 experiment reruns/manuscript rebuilds, validator + release manifest integrated | not independent replication, review, submission or acceptance | choose 1–3 strongest studies for external reproduction and venue-fit cleanup |
| FinanceMeta | TESTED RECOVERY OVERLAY + TRUTH-FIRST TARGET PACKAGE INTEGRATED IN CONTROL REPO | auth recovery overlay + web recovery scripts/audit merged | canonical GitHub target and FinanceMeta Supabase are not exposed by current connections | authorize target repo/project, apply exact-SHA recovery, run live denial paths |
| The Bu1LD | TRUTH-FIRST TARGET PACKAGE INTEGRATED IN CONTROL REPO | proof-density/people recovery scripts and claims audit merged | canonical target repo is not exposed by current GitHub connection | authorize target, apply scripts on isolated branch, build/accessibility verify |
| Hercules/Olympus | O0 RATIONALIZED / O1 NOT DEMONSTRATED | model-name claims separated from train/eval evidence | no matched-budget learned Transformer vs proposal vs ablation experiment | run identical-budget baseline/proposal/ablation study |

## GitHub execution surface

The active GitHub installation exposes only `vertex-studyAI/vertexED.ai`, `vertex-studyAI/LAM-JEPA`, and `vertex-studyAI/Text-To-Video`. The FinanceMeta/Bu1LD canonical targets are not currently mutable from this session.

## Queue state

At the end of the integration/cleanup wave, the `vertexED.ai` open pull-request queue was **0**. Stale duplicate recoveries and superseded governance bundles were closed with explicit provenance comments.

## Production truth boundary

- No production database rows were destructively changed in this wave.
- Supabase inspection was read-only.
- No force-push was used.
- The public site is reachable, but exact latest-source SHA served has not been verified because direct health-endpoint DNS access is unavailable in the execution sandbox and latest-main Vercel checks are rate-limit blocked.
- No publication, peer-review, independent-replication, frontier-model or mass-agent-running claim is implied by repository integration.