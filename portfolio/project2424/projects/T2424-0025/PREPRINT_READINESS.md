# T2424-0025 Preprint Readiness — Evidence-Bounded Robust Readout Study

Status: **NO-GO / NOT PREPRINT_READY**

This document freezes the manuscript claim boundary for the current evidence-bearing T2424-0025 precursor. It does not upgrade the work into a Transformer or learned-memory result.

## Canonical evidence anchors

- Independent reproduction merge: `715aea0b632c70493c226a84473d77ff7ca8cfc6` (PR #311).
- Frozen historical experiment revision recorded in `RESULTS.md`: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.
- Retained machine-readable metrics: `raw_metrics/repro-wave-20260812.json`.
- Evidence-derived figure generator: `figures/generate.mjs`.
- Figure derivation ledger: `figures/FIGURE_DATA.json`.
- Figure provenance/claim audit: `figures/FIGURE_AUDIT.md`.
- Primary-source literature audit: `RELATED_WORK_AUDIT.md`.
- Reproduction commands:
  - `node portfolio/project2424/projects/T2424-0025/experiment/run.mjs > screen.json`
  - `node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs > ablation.json`
- Reproduced output digests:
  - screen: `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`
  - ablation: `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`
- Reproduction environment retained in issue #525: Python 3.13.5, Node v22.16.0, Linux x86_64, no CUDA.

## Claim-to-evidence matrix

| Candidate manuscript claim | Evidence | Verdict |
|---|---|---|
| Robust weighted readouts reduce MAE relative to arithmetic mean on this bounded synthetic aggregation task under heavy-tail contamination. | 30-seed screen: mean MAE `0.3615267855`; weighted median MAE `0.0165609423`; relative reduction `95.42%`. | **SUPPORTED, BOUNDED** |
| Robust readouts remain competitive across a contamination sweep. | 50-seed sweep at contamination `[0, .05, .10, .18, .25, .35]`; median/trimmed/Huber retained in `RESULTS.md`. | **SUPPORTED, BOUNDED** |
| The gain is uniquely caused by non-Gaussian contamination. | At 0% Cauchy contamination, median MAE `0.0125699` vs mean `0.0246469`, about 49% relative reduction. | **FALSIFIED / NOT ISOLATED** |
| T2424-0025 establishes a Non-Gaussian Memory Transformer mechanism. | Current task uses deterministic RBF aggregation and hand-specified robust readouts; no learned Transformer memory is tested. | **UNSUPPORTED** |
| T2424-0025 establishes learned-memory superiority. | No capacity-matched learned-memory baseline or learned proposed mechanism exists in the frozen precursor. | **UNSUPPORTED** |
| The current study is independently reproducible. | PR #311 preserves byte-exact fresh local reruns with Git-blob source verification and matching output digests. | **SUPPORTED** |

## Manuscript sections that can be written from current evidence

### Methods / Setup — READY FOR BOUNDED PRECURSOR

The current frozen study can truthfully describe:
- synthetic bounded aggregation with 24 anchor queries on `[0,1]`;
- seven replicas per anchor;
- deterministic smooth latent signal;
- Gaussian clean condition and Cauchy-contamination heavy-tail condition;
- deterministic RBF attention weights;
- weighted arithmetic mean baseline;
- weighted median candidate;
- 10% weighted trimmed mean and Huber (`delta=0.15`) references;
- MAE as the primary metric;
- 30 deterministic seeds for the screen;
- 50 deterministic seeds per contamination level for the ablation.

### Results — READY FOR BOUNDED PRECURSOR

The evidence-backed results table already lives in `RESULTS.md`. The manuscript must retain the 0% contamination negative control prominently rather than burying it.

### Failure analysis — READY

Central failure of the mechanism story: the robust median improves substantially even under the clean control. The observed gain therefore cannot be uniquely attributed to non-Gaussian contamination or a non-Gaussian memory mechanism.

### Limitations — READY

Required limitations:
1. synthetic aggregation, not a learned Transformer;
2. deterministic RBF attention;
3. hand-specified noise family;
4. robust readouts outperform the arithmetic mean in the clean control;
5. no capacity-matched learned Gaussian/reference memory;
6. no sequence modeling, delayed recall, likelihood, or real-data benchmark;
7. arithmetic-mean outcomes under Cauchy contamination are highly skewed, so mean ± SD is descriptive rather than a strong inferential summary;
8. the contamination ablation is post-result mechanism analysis, not a preregistered confirmatory test.

### Reproducibility — READY

The paper can cite the exact commands, frozen source identity, environment, and output digests listed above. No new rerun is required solely to improve the narrative.

## Tables and figures from retained evidence

Allowed without new experimentation:
1. **Table 1:** 30-seed heavy-tail vs clean screen from `RESULTS.md`.
2. **Table 2:** 50-seed contamination sweep across mean / median / trimmed / Huber.
3. **Figure 1:** `figures/figure1_contamination_mae.svg`, contamination level vs MAE for the four readouts.
4. **Figure 2:** `figures/figure2_relative_improvement.svg`, relative improvement of median over mean vs contamination, including the non-zero improvement at 0% contamination.

Both figures are generated directly from `raw_metrics/repro-wave-20260812.json`. Exact derived values and the formula used by Figure 2 are retained in `figures/FIGURE_DATA.json`; `figures/FIGURE_AUDIT.md` records provenance and the interpretation boundary. No visually estimated or manually invented points are permitted.

## Related-work audit status

**PRIMARY-SOURCE AUDIT COMPLETE; MANUSCRIPT INTEGRATION OPEN.** `RELATED_WORK_AUDIT.md` verifies primary/original records spanning classical robust estimation, robust aggregation in learned systems, contaminated time-series forecasting, learned external memory, and robust Transformer attention. It also records explicit non-equivalence boundaries so those citations cannot be used to upgrade this precursor into a learned-memory or Transformer result.

Introduction and Related Work are still not release-complete until those verified sources are integrated sentence-by-sentence and the final bibliography is checked against the primary records.

## Data / code / authorship / licensing

- **Code statement:** repository code and exact reproduction commands are identified.
- **Data statement:** current study uses synthetic generated data; the generator identity and parameters must be referenced directly from the frozen source in the final paper.
- **Authorship statement:** OPEN; final author list/contributions must be explicitly reviewed.
- **License statement:** BLOCKED; an obvious root `LICENSE` file was not found in the repository and release rights must not be inferred.

## Release gate

`PREPRINT_READY` requires all of the following:
- [x] canonical evidence-bearing precursor identity is explicit;
- [x] frozen protocol is documented;
- [x] raw/result artifacts are retained;
- [x] independent reproduction is evidenced;
- [x] central negative control is preserved;
- [x] claim boundary is explicit;
- [x] evidence-derived figures are generated and checked against raw metrics;
- [x] current primary-source related-work audit is complete;
- [ ] Introduction and Related Work are citation-complete;
- [ ] final Methods/Results/Discussion manuscript is assembled without upgrading the claim;
- [ ] authorship/contribution statement is complete;
- [ ] license/code/data statements are complete;
- [ ] clean manuscript/PDF is compiled and audited;
- [ ] no manuscript sentence implies Transformer, learned-memory, or uniquely non-Gaussian superiority from this precursor.

## Successor science is separate

A learned NGMT successor must not overwrite or reinterpret this precursor. Before any successor outcome access, freeze B0 no-memory, B1 standard learned memory, B2 robust-statistics/Gaussian-reference control, B3 proposed mechanism; matched capacity/tokens/steps/data/optimizer; conditions; seeds; primary statistic; falsifier; compute budget; stop rule; environment; artifact paths; and explicit execution authorization.

The precursor paper and successor experiment must retain distinct identities and evidence lineages.
