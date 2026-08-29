# A Reproducible Negative Screen for a Resource-Bounded Local Diffusion Operator

## Abstract

We evaluate a deliberately small local forecasting operator on a synthetic one-dimensional diffusion task under a frozen, falsifiable effect-size criterion. The model learns one scalar coefficient for a three-point stencil and is compared with persistence on held-out one-step forecasts across 20 deterministic seeds. The operator recovered the planted diffusion coefficient (`0.18`) with mean estimate `0.1796886 ± 0.0013562` sample SD and reduced mean RMSE from `0.0156105` for persistence to `0.00502318`. However, the resulting mean relative improvement was `67.7766%`, below the predeclared requirement of **greater than 75%**. The frozen hypothesis therefore failed. A zero-diffusion negative control produced mean relative improvement `-0.0289%`, consistent with no material gain. Exact-head repository reproduction preserved the failed gate without modifying the benchmark, seeds, threshold, baseline, or scientific source. These results support a narrow conclusion: a resource-bounded local stencil can recover planted diffusion structure in this synthetic setting, but the tested effect-size hypothesis is not supported. We make no claim of neural-operator superiority, real-PDE generalization, or long-horizon forecasting performance.

## 1. Motivation and scope

Learned operators for partial differential equations are often evaluated as function-to-function models with substantially greater capacity than the scalar local update studied here. Fourier Neural Operator (FNO), DeepONet, and physics-informed neural operators such as PINO provide important reference families for future matched comparisons. This study does **not** compare against those models and therefore cannot support a superiority claim. Its narrower purpose is methodological: test a cheap local-physics hypothesis under an explicit rejection threshold, retain the negative result when that threshold is missed, and verify that the result is reproducible from the repository.

The experiment asks whether a three-point local diffusion update can both recover a planted scalar coefficient and improve held-out one-step RMSE by more than 75% relative to persistence while showing no material benefit when the planted diffusion coefficient is zero.

## 2. Frozen hypothesis

The frozen primary hypothesis was:

> A learned scalar three-point diffusion operator will improve mean held-out one-step RMSE by more than 75% relative to persistence while recovering the planted coefficient near `0.18`; under zero diffusion, it will learn a coefficient near zero and show no material improvement.

The >75% threshold is the primary falsifier. It was not relaxed after observing outcomes.

## 3. Method

### 3.1 Synthetic dynamics

The benchmark generates one-dimensional states on a 32-point grid according to the local update

`u[t+1,i] = u[t,i] + alpha * (u[t,i-1] - 2u[t,i] + u[t,i+1]) + noise`,

with planted diffusion coefficient `alpha = 0.18` for the main condition. Gaussian noise has standard deviation `0.005`. Each deterministic seed contains 140 samples and uses the frozen 70/30 train/evaluation split recorded by the benchmark metadata.

### 3.2 Proposed operator

The proposed method is intentionally simple: one scalar diffusion coefficient is estimated from training transitions by least squares and used with a three-point local stencil. It is not a neural operator and contains no learned global grid-to-grid mapping.

### 3.3 Baseline and control

The matched baseline is persistence: the next state is predicted as the current state. The negative control sets the planted diffusion coefficient to zero while retaining the same evaluation machinery. This control tests whether the local fitting procedure appears to create an artificial forecasting gain when diffusion is absent.

### 3.4 Seeds, metric, and uncertainty

The retained experiment reports deterministic seeds `0..19`. The primary metric is mean held-out RMSE relative improvement versus persistence. Sample standard deviations and ranges are descriptive summaries across the 20 retained seed trials; no population-level significance claim is made.

### 3.5 Reproducibility environment

The scientific source is commit `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`. A hosted replay used Ubuntu 24.04.4 LTS, Python 3.11.15, pip 26.2.1, pytest 9.1.1, and CPU execution. The repository records the commands `python -m pip install -e .`, `pytest -q`, and `python -m local_diffusion_operator.benchmark --seeds 20`; machine-readable per-seed output is emitted by the same benchmark with `--json`.

## 4. Results

| Metric | Mean | Sample SD | n |
|---|---:|---:|---:|
| learned diffusion coefficient | 0.1796886 | 0.0013562 | 20 |
| persistence RMSE | 0.0156105 | 0.0005888 | 20 |
| local-operator RMSE | 0.00502318 | 0.00008758 | 20 |
| relative improvement | 67.7766% | 1.3748 percentage points | 20 |
| zero-diffusion learned coefficient | -0.0003114 | 0.0013562 | 20 |
| zero-diffusion relative improvement | -0.0289% | 0.0789 percentage points | 20 |

The main-condition relative-improvement range was `65.4364%–70.5814%`. Thus neither the mean nor any retained seed reached the frozen >75% gate. The primary hypothesis failed.

At the same time, the learned coefficient closely tracked the planted value and the local operator substantially reduced one-step RMSE relative to persistence. These secondary observations do not override the failed primary criterion.

The zero-diffusion control remained centered near no improvement, with relative-improvement range `-0.2596%–0.1582%`. This supports the limited interpretation that the fitting procedure did not produce a material artificial gain under the control condition.

## 5. Failure analysis

The experiment fails because the measured effect size is consistently below the preregistered threshold, not because of a repository or execution failure. Exact-head reproduction subsequently succeeded while preserving the same negative verdict. This distinction is important: infrastructure verification establishes that the failed result is executable and reproducible; it does not convert the scientific outcome into a pass.

The retained evidence does not identify a single causal reason for the shortfall. Plausible contributors include observation noise, the deliberately restricted scalar coefficient, one-step evaluation, and the strength of persistence on locally smooth trajectories. These are hypotheses for successor studies, not post-hoc explanations established by the current experiment.

## 6. Related-work boundary

Three verified operator-learning references define comparator families that would be necessary for a stronger successor study:

1. Z. Li et al., *Fourier Neural Operator for Parametric Partial Differential Equations*, arXiv:2010.08895.
2. L. Lu, P. Jin, and G. E. Karniadakis, *DeepONet: Learning nonlinear operators for identifying differential equations based on the universal approximation theorem of operators*, arXiv:1910.03193.
3. Z. Li et al., *Physics-Informed Neural Operator for Learning Partial Differential Equations*, arXiv:2111.03794.

These works are cited only to establish relevant model families. Because the present study does not execute matched FNO, DeepONet, or PINO baselines, it makes no comparative performance claim against them.

## 7. Limitations

The evidence is restricted to synthetic one-step scalar diffusion on a 32-point grid. The proposed method is a fitted scalar local stencil rather than a neural operator. There is no real or public PDE dataset, long rollout, distribution shift, mesh-resolution study, matched FNO/DeepONet/PINO comparison, comprehensive runtime or peak-memory benchmark, or statistical inference beyond descriptive seed dispersion. The experiment therefore cannot establish general operator-learning performance or external scientific validity.

A documentation inconsistency also requires caution: an older README sentence refers to a 10-seed predeclared claim while the merged negative package, reproduction records, metadata, and reported result use the retained 20-seed protocol. This manuscript treats the exact retained 20-seed experiment and its frozen >75% gate as the evidence-bearing result and does not use the older sentence to infer an unrecorded alternate protocol. The provenance discrepancy should be explicitly resolved before release metadata is finalized.

## 8. Data and code availability

The experiment uses generated synthetic states and therefore requires no external dataset download. Source, tests, frozen metadata, reproduction instructions, and summarized results are retained in the repository directory `portfolio/new-projects/t2424-1863-local-diffusion-operator/`. A release should point to an immutable repository commit or archival DOI rather than only a moving branch.

## 9. Reproducibility statement

The original hosted reproduction reports four passing tests and retained environment metadata. A later exact-head verification on PR #302 reran the unchanged frozen 20-seed benchmark and canonical repository CI against head `147ce38bf2d965a4b14fa31844856153e6e18f7b`, preserving the negative gate. No threshold, seed set, baseline, benchmark task, or scientific source was rescue-tuned to obtain a passing scientific outcome.

## 10. Conclusion

A compact local operator recovered the planted diffusion coefficient and reduced one-step synthetic forecasting error, but it failed the experiment's predeclared >75% improvement criterion. The defensible conclusion is therefore negative with respect to the primary hypothesis. The result is useful precisely because the threshold was preserved: it shows that repository reproducibility and mechanism recovery can coexist with failure of a stronger effect-size claim. Any successor claim about learned operators, real PDEs, or superiority must be evaluated under a separately frozen protocol with matched strong baselines and cannot be used to rewrite this result.

## Release status

**NOT PREPRINT_READY.** Required remaining gates: resolve the 10-versus-20-seed provenance wording, verify authorship/contributions and repository license applicability, build a clean PDF, visually inspect tables/captions/references, and perform a sentence-level claim audit against the rendered artifact.
