# RESEARCH_STATUS

As of: 2026-08-12 execution pass

Research maturity is assigned from evidence, not names, merges or intended scale.

| Research line | Current evidence class | What is actually supported | Missing promotion evidence |
|---|---|---|---|
| T2424-0037 controlled NLP-to-CAD | TESTED + MERGED / CONTROLLED BENCHMARK ONLY | recovery restored controlled parser, guarded parametric CAD generator, deterministic 20-prompt evaluator, web demo and focused tests; initial CI exposed one syntax defect; repaired head `7c79da9a...` passed canonical CI run #914; PR #266 merged | real CAD backend execution in canonical integrated evidence, broader/uncontrolled language benchmark, stronger adversarial inputs, independent reproduction before stronger claim |
| T2424-0025 robust-readout ablation | TESTED + MERGED / SYNTHETIC MECHANISM INCONCLUSIVE | stale #259 was rebuilt on current main as #271; exact head `4a910213...` passed canonical CI run #918 and merged as `5ee79ab8...`; 50-seed contamination sweep and robust readout implementations are integrated | intended contamination-mechanism attribution is not isolated because the 0% contamination control also favors robust readouts; needs a redesigned baseline/control before any mechanism or Transformer/learned-memory claim |
| T2424-0050 Darcy Latent Operator | TESTED IDENTITY REPAIR INTEGRATED | observed main history restores canonical frozen identity and bounded regressions while explicitly avoiding Certified Complete/research-complete claims | actual operator experiment, baselines, measured results, independent reproduction |
| Olympus runtime | O0 DETERMINISTIC RUNTIME EVIDENCE / O1 NEXT | current PR #257 head `47810e80...` passed CI #925; recovered Olympus names are treated as deterministic runtime roles and frozen scale concepts, not trained models; runtime doctor/architectural sanity evidence is recorded | preregistered matched-provider ~100-task O1 comparison; no parameter-scale claim is supported |
| Hercules learned architecture | SPECIFIED/CONTROLLED EXPERIMENT OWNER / ADVANTAGE NOT DEMONSTRATED | latest rationalization assigns trainable/local-model architecture to Hercules rather than Olympus runtime names | same-data/tokenizer/parameter/optimizer/training-budget baseline vs proposed vs ablated experiments on real hardware, plus downstream/stability/resource metrics |
| Percy reliability engineering | TESTED ARTIFACTS / LIVE RUNTIME BLOCKED | current #257 records authoritative SQLite WAL lifecycle, evidence-gated completion, bounded concurrency, leases/heartbeats, stale-owner rejection, migration/recovery regressions; current head CI #925 is green | actual Mac crash/restart, provider integration, contention, end-to-end shutdown/recovery and physical qualification |
| Research Atlas V4 | FRESH LOCAL REPRODUCIBILITY + PACKAGING EVIDENCE / EXTERNAL GATES OPEN | PR #262 records 39/39 tests, all 18 flagship experiments rerun, named robustness extensions, all 18 manuscripts recompiled, 18-project + 512-registry validator passed, regenerated 769-file release archives with manifests/checksums, and re-extracted source release re-tested 39/39 + validator | independent external replication, peer review, submission/acceptance; the 512 registry is not 512 completed papers |
| LAM-JEPA | VALID NEGATIVE / INCONCLUSIVE LINE | portfolio evidence preserves a fail-closed negative/inconclusive result and forbids relabeling it as positive | any new hypothesis requires preregistered new evidence, not threshold retuning or hidden confirmatory-test access |

## Architecture rationalization

- **Hercules** owns trainable/local-model architecture and learned-model experiments.
- **Olympus** owns the research runtime / deterministic roles. Hermes, Prometheus, Perseus, Atlas and Kronos are not counted as trained models merely because scale labels/names exist.
- **Percy** owns durable orchestration and task-state reliability.

This removes the prior duplication where architecture scale names, runtime roles and orchestration responsibilities could be conflated.

## NeuroCAD evidence boundary

The controlled benchmark measures parsing/IR validity, deterministic geometry-target matching, constraint satisfaction and source generation for a fixed 20-prompt set. Therefore:

- `TESTED`: supported for the controlled implementation/integration.
- `MERGED`: supported by PR #266 state.
- `GENERAL NLP-TO-CAD`: not demonstrated.
- `RESEARCH_COMPLETE`: not demonstrated.
- `RELEASED`: not demonstrated by this pass.

A separate sandbox note on #257 records 20/20 OpenSCAD STL render/reopen success outside GitHub. That is useful backend evidence but is not conflated with canonical integrated CI, independent replication, or a learned-model comparison.

## T2424-0025 evidence boundary

The robust-readout experiment is a useful negative/inconclusive result rather than a mechanism win. The 0% contamination control also favors the robust readouts, so the current experiment does not establish that robustness gains are caused by contamination handling. Preserve that finding; redesign the control/baseline instead of retuning thresholds or relabeling the result.

## Olympus maturity ladder (current rationalized interpretation)

- O0 — deterministic runtime/toy architecture validation: **demonstrated for the recovered runtime role implementation**.
- O1 — small controlled learned-provider baseline/comparison: **NEXT GATE**; preregistered ~100-task matched-provider experiment not yet run.
- O2 — architecture ablation: NOT DEMONSTRATED as a learned-model advantage; trainable architecture work belongs under Hercules.
- O3 — medium-scale replication: NOT DEMONSTRATED.
- O4 — optimized local release: NOT DEMONSTRATED.
- O5 — larger-scale training: NOT JUSTIFIED by current evidence/resources.

## Research claim rules

1. A paper is not promoted without measured central results.
2. Green unit tests prove implementation behavior, not scientific advantage.
3. A merge proves integration state, not research validity.
4. Architecture training alone is not evidence of superiority.
5. Failed or inconclusive experiments remain valid outputs and must not be renamed into wins.
6. Exact datasets, tokenizers, parameter budgets, optimizer/training budgets and evaluation suites must match for comparative architecture claims.
7. Local reproducibility and archive integrity are not the same as independent external replication or publication.
