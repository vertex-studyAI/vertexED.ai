# T2424-1863 claim-to-evidence matrix

Status: **NEGATIVE-RESULT PAPER CANDIDATE / NOT PREPRINT_READY**

Scientific source identity: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`  
Exact-head reproduction: PR #302, head `147ce38bf2d965a4b14fa31844856153e6e18f7b`, dedicated run `31659932936`, canonical CI `31659932951`  
Original hosted reproduction: run `31411517815`, attempt 3, job `94262839511`

## Allowed manuscript claims

| Claim | Evidence | Status | Boundary |
|---|---|---|---|
| The frozen local 3-point operator recovered the planted diffusion coefficient near 0.18. | `experiment_metadata.json`: mean learned coefficient `0.1796885855`, sample SD `0.0013561664`, n=20. | SUPPORTED | Synthetic 1D one-step task only. |
| The operator reduced one-step held-out RMSE relative to persistence. | Persistence RMSE `0.0156104849`; operator RMSE `0.0050231824`; mean relative improvement `0.6777662111`, n=20. | SUPPORTED | Descriptive deterministic synthetic trials; no significance claim. |
| The predeclared >75% improvement hypothesis failed. | Frozen threshold `>75%`; observed mean improvement `67.7766%`; per-seed range `65.4364%–70.5814%`. | SUPPORTED / PRIMARY NEGATIVE RESULT | Threshold must not be relaxed or rewritten post hoc. |
| Zero-diffusion behavior does not show a material gain over persistence. | Mean zero-diffusion relative improvement `-0.0002886`, range `-0.0025956–0.0015816`. | SUPPORTED | This is a synthetic negative control, not an external validity test. |
| The negative result reproduces on exact repository head without retuning. | PR #302 states unchanged benchmark, source, seeds, threshold and baseline; dedicated and canonical CI succeeded on exact head. | SUPPORTED | Green CI establishes reproducibility/infrastructure, not scientific success. |

## Claims forbidden by current evidence

- neural-operator superiority;
- superiority to Fourier Neural Operator, DeepONet, PINO, or any matched learned-operator baseline;
- real-PDE or out-of-distribution generalization;
- long-horizon rollout stability;
- statistical significance or population-level uncertainty;
- publication novelty beyond the bounded negative-result/reporting contribution;
- production readiness.

## Required negative-result framing

The manuscript must state in the abstract, results, discussion, and conclusion that the predeclared effect-size gate **failed**. Coefficient recovery and error reduction are secondary observations and cannot be used to relabel the experiment as a positive hypothesis test.

## Evidence-derived table source

All numerical tables must be generated only from `experiment_metadata.json` or the retained benchmark `--json` output. No manual metric interpolation or new tuned runs are permitted.

## Completion gates

- [x] canonical scientific source commit identified;
- [x] frozen threshold and protocol retained;
- [x] 20 deterministic seed records summarized with dispersion;
- [x] zero-diffusion negative control retained;
- [x] exact-head reproduction documented;
- [x] claim boundary recorded;
- [ ] independent manuscript claim audit against rendered PDF;
- [ ] clean PDF build and visual inspection;
- [ ] authorship/contribution statement finalized;
- [ ] repository/code license applicability verified for release;
- [ ] archive/release DOI or immutable public artifact selected;
- [ ] external PDE/strong-baseline successor completed (required only for stronger positive/generalization claims, not for the bounded negative-result paper).
