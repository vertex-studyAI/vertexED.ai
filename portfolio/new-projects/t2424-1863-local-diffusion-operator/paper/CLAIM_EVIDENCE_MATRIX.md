# T2424-1863 claim-to-evidence matrix

Status: **NEGATIVE-RESULT PAPER CANDIDATE / NOT PREPRINT_READY**

Scientific source identity: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`  
Exact-head reproduction: PR #302, head `147ce38bf2d965a4b14fa31844856153e6e18f7b`, dedicated run `31659932936`, canonical CI `31659932951`  
Original hosted reproduction: run `31411517815`, attempt 3, job `94262839511`

## Provenance split that must be preserved

The retained source package contains a real seed-count documentation split and it must not be flattened in the paper:

- **Primary preregistered hypothesis test:** the README states the >75% hypothesis across **10 deterministic seeds**. Exact-source reevaluation of seeds `0..9` gives mean learned coefficient `0.17950753587054252`, persistence RMSE `0.015649163991132017`, operator RMSE `0.005021982408139878`, and mean relative improvement `67.88187868646336%` with per-seed improvement range `66.69998212218728%–69.58569386836451%`. This primary gate fails.
- **Expanded retained execution/reproduction:** the recorded benchmark command/default, retained metadata, PR evidence, and exact-head reproduction execute **20 deterministic seeds**. They give mean learned coefficient `0.1796885855`, persistence RMSE `0.0156104849`, operator RMSE `0.0050231824`, and mean relative improvement `67.77662111%` with range `65.4364%–70.5814%`. This expanded run also fails.

The 20-seed execution is corroborating expanded evidence, not a replacement preregistration. Historical files remain unchanged.

## Allowed manuscript claims

| Claim | Evidence | Status | Boundary |
|---|---|---|---|
| The literal preregistered >75% improvement hypothesis failed on seeds `0..9`. | Source README predeclares 10 deterministic seeds; exact-source subset mean improvement `67.88187868646336%`, range `66.69998212218728%–69.58569386836451%`. | SUPPORTED / PRIMARY NEGATIVE RESULT | Threshold and primary seed count must not be rewritten post hoc. |
| The expanded retained 20-seed execution independently preserves the negative verdict. | `experiment_metadata.json`: mean improvement `67.77662111%`, range `65.4364%–70.5814%`, n=20. | SUPPORTED / REPRODUCTION | Expanded evidence must be labeled as such. |
| The frozen local 3-point operator recovered the planted diffusion coefficient near 0.18. | 10-seed primary subset mean `0.17950753587054252`; retained 20-seed mean `0.1796885855`. | SUPPORTED | Synthetic 1D one-step task only. |
| The operator reduced one-step held-out RMSE relative to persistence. | 10-seed primary: `0.015649163991132017` → `0.005021982408139878`; 20-seed expanded: `0.0156104849` → `0.0050231824`. | SUPPORTED | Descriptive deterministic synthetic trials; no significance claim. |
| Zero-diffusion behavior does not show a material gain over persistence. | 10-seed primary subset mean improvement `-0.042850715586669554%`; 20-seed expanded mean `-0.0289%`. | SUPPORTED | Synthetic negative control only. |
| The negative result reproduces on exact repository head without retuning. | PR #302 preserves benchmark/source/threshold/baseline; dedicated and canonical CI succeeded on exact head. | SUPPORTED | Green CI establishes reproducibility/infrastructure, not scientific success. |

## Claims forbidden by current evidence

- neural-operator superiority;
- superiority to Fourier Neural Operator, DeepONet, PINO, or any matched learned-operator baseline;
- real-PDE or out-of-distribution generalization;
- long-horizon rollout stability;
- statistical significance or population-level uncertainty;
- publication novelty beyond the bounded negative-result/reporting contribution;
- production readiness.

## Required negative-result framing

The manuscript must state in the abstract, results, discussion, and conclusion that the literal 10-seed preregistered effect-size gate **failed**, and that the retained 20-seed execution is an expanded reproduction that preserves the same negative verdict. Coefficient recovery and error reduction are secondary observations and cannot relabel the experiment as a positive hypothesis test.

## Evidence-derived table source

All 20-seed numerical tables must be generated only from `experiment_metadata.json` or retained benchmark `--json` output. Any 10-seed table must be a deterministic subset calculation over the exact retained source for seeds `0..9`, labeled explicitly as the preregistered subset. No manual interpolation, retuning, threshold change, or alternate seed selection is permitted.

## Completion gates

- [x] canonical scientific source commit identified;
- [x] frozen >75% threshold retained;
- [x] literal 10-seed preregistered gate distinguished from 20-seed expanded execution;
- [x] both 10-seed and 20-seed evidence preserve the negative verdict;
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
