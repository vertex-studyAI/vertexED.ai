# APEN / PEN / Eigen-JEPA / NPMS — Reproducibility Status — 13 August 2026

**Primary recovered execution package:** `BU1LD_Research_Atlas_Flagships_v4_REPRO_CORRECTED_2026-08-12.zip`  
**Archive SHA-256:** `500e4c6b3e6f1be16ef78c9b55e62f647efefd92e8a27eeadef1190a50352b48`  
**Canonical source SHA:** unavailable for this recovered archive; do not claim Git-backed independent reproduction.  
**Fresh environment:** Python 3.13.5, NumPy 2.3.5, pandas 2.2.3, SciPy 1.17.0, scikit-learn 1.8.0, PyTorch 2.10.0+cpu, Matplotlib 3.10.8, CUDA unavailable.

## Package-integrity boundary

Before executing the scientific reruns, `sha256sum -c SHA256SUMS.txt` verified 761 listed paths and reported eight pre-existing mismatches. The mismatches were seven generated PDFs plus `projects/memory_spectrum_transfer/README.md`; none was an APEN, Eigen-JEPA or NPMS scientific CSV/JSON/NPZ result artifact.

The mismatch set is preserved in `portfolio/research/evidence/atlas-v4-memory-spectral-repro-20260813.json`. The package manifest has **not** been rewritten to manufacture a clean integrity report. Regenerated PDFs continue to change hashes while their corresponding numerical evidence remains stable.

Focused current tests:

```bash
python -m pytest -q projects/apen projects/eigen_jepa projects/npms
```

Result: **7 passed**; wall time about `5.22 s`; peak RSS about `437 MB`.

---

## APEN — localized positive mechanism with a reproduced failure boundary

### Frozen question

Does a salience-guided retrieval trace improve prediction of delayed rare events relative to simple recent-memory, uniform-memory and exponential-trace controls under the same ridge estimator and chronological data split?

### Protocol

The controlled task uses autocorrelated five-dimensional sequences. Rare events are delayed contributions associated with an extreme first channel. The base grid includes delays 12, 24 and 48 and noise levels 0.2 and 0.5. Each condition uses eight paired seeds. All methods share the same Ridge estimator and validation-selected regularization; APEN changes the retrieval trace, not the downstream predictor class.

Baselines:

- recent memory;
- uniform memory;
- exponential trace;
- oracle delay.

Fresh commands:

```bash
python -m projects.apen.experiment
python -m projects.apen.extended_experiment
```

The base experiment ran in about `10.78 s` wall and the salience-robustness sweep in about `15.59 s`, each below roughly `421 MB` peak RSS.

### Base result

| Method | Overall MSE | Rare-event MSE |
|---|---:|---:|
| APEN | 2.210393 | 17.060349 |
| Exponential trace | 2.145430 | 18.860263 |
| Oracle delay | 2.056096 | 16.687710 |
| Recent | 2.133970 | 18.967381 |
| Uniform memory | 2.240880 | 18.714592 |

Across the 48 paired condition-seed comparisons, APEN minus exponential-trace rare-event MSE is `-1.7999` with retained bootstrap 95% interval about `[-2.0902, -1.5161]`; APEN minus recent is about `-1.9070` with interval `[-2.2167, -1.5995]`; APEN minus uniform memory is about `-1.6542` with interval `[-1.9041, -1.4016]`. Against the oracle delay, the mean difference is `+0.3726` with interval `[-0.3845, 1.0991]`.

This is a bounded rare-event effect. APEN does not minimize overall MSE and does not beat the oracle point estimate.

### Salience reliability falsifier

| Salience dropout | APEN rare MSE | Exp trace | Recent | Uniform memory |
|---:|---:|---:|---:|---:|
| 0.0 | 18.1004 | 19.5282 | 19.5601 | 19.1307 |
| 0.2 | 18.1205 | 19.4966 | 19.4374 | 19.2275 |
| 0.5 | 18.3423 | 19.0298 | 19.1125 | 18.7053 |
| 0.8 | 18.8790 | 18.9525 | 18.9821 | **18.8415** |
| 1.0 | **20.9062** | 20.7725 | 20.8146 | **20.5102** |

The mechanism's advantage collapses around 80% salience dropout and reverses under completely uninformative salience. This failure region is a first-class result, not an inconvenience to tune away.

**APEN promotion:** `REPRODUCED_SYNTHETIC_CONTROLLED_MIXED`. The evidence supports a localized informative-salience rare-event benefit and simultaneously shows a strong dependency on salience reliability. It does not establish a general adaptive-memory advantage, public continual-learning superiority or external validity.

---

## PEN — independent package found, but no fresh source-tree rerun yet

The Library contains a genuinely independent `MODEL-PEN` evidence package rather than only APEN material. That corrects the earlier assumption that no separate PEN existed.

The retained package reports three main compact seeds `17, 23, 29` and preserves an invalidated earlier run where the write policy collapsed to zero. The repaired compact aggregate reports:

| Method | Predictive MSE, mean |
|---|---:|
| PEN | 0.2382847617 |
| No memory | 0.2414076626 |
| Random write | **0.2373956343** |
| Attention only | **0.2357257257** |

PEN's retained mean causal-event MSE is `2.6002264818`, retrieval precision `0.0630441904`, memory utilization `0.84375`, and interference rate `0.6666666865`.

The important retained result is negative: PEN slightly beats no-memory, but does not beat random writes or attention-only memory. Learned salience superiority is unsupported. Required ablations were executed at seed 17 and distractor robustness was only single-seed.

**Fresh execution boundary:** the handoff, workspace hash ledger, evidence records and reports are recoverable from the Library, but a single executable `MODEL-PEN` source archive/tree has not yet been materialized into this runtime. Therefore this wave does **not** relabel the retained metrics as a fresh reproduction, and APEN evidence is not inherited by PEN.

**PEN promotion:** `EVIDENCE_PACKAGE_DISCOVERED / FRESH_REPRODUCTION_BLOCKED_SOURCE_TREE`. The next valid step is source-tree recovery followed by the package's exact tests and compact commands; not a rewrite or APEN-to-PEN substitution.

---

## Eigen-JEPA — real-data mixed/negative result reproduced

### Frozen task

The Atlas V4 line evaluates covariance forecasting on official Fama-French daily factor data, 1963-07-01 through 2022-08-31, with 14,895 cleaned daily rows, 744 covariance blocks and 111 test samples. Twenty-day covariance blocks are shrinkage-regularized, four historical blocks form the context, and the split is chronological 70/15/15.

Fresh command:

```bash
python -m projects.eigen_jepa.experiment
```

Runtime: about `3.60 s` wall; peak RSS about `427 MB`.

### Result

| Method | Matrix MSE ↓ | Log distance ↓ | Eigenvalue MSE ↓ | Subspace distance ↓ |
|---|---:|---:|---:|---:|
| Raw ridge | **5.7734e-9** | 0.194598 | 2.49744e-8 | 1.034889 |
| Log ridge | 5.7896e-9 | **0.150606** | 2.64553e-8 | 0.973015 |
| Eigen-JEPA | 5.8318e-9 | 0.159502 | 2.63193e-8 | 1.019740 |
| Cholesky ridge | 5.8762e-9 | 0.173030 | **2.45271e-8** | 1.006703 |
| Persistence | 7.7708e-9 | 0.169472 | 3.62543e-8 | **0.894613** |

On matrix MSE, Eigen-JEPA's point estimate is better than persistence, but the retained paired mean difference over 111 targets is about `-1.939e-9` with bootstrap interval `[-6.8566e-9, 8.537e-10]`. Against log-ridge, Eigen-JEPA is worse by about `4.221e-11` and the retained interval `[2.224e-11, 6.725e-11]` excludes zero. Against raw ridge the mean difference is also adverse, while retained tests disagree about the shape-sensitive inference; no cherry-picking is appropriate.

The subspace metric is particularly important: persistence has the lowest reported distance. Switching the headline metric after seeing this would be metric-shopping.

The Library also contains a separate compact `MODEL-003` Eigen-JEPA lineage whose predeclared projector-distance result is negative against persistence. These are distinct evidence lineages and should be reconciled before a single canonical manuscript is declared.

**Eigen-JEPA promotion:** `REPRODUCED_REAL_DATA_MIXED_NEGATIVE`. It does not support superiority over strong direct covariance forecasting, and it does not support switching to a friendlier metric post hoc.

---

## NPMS — controlled diagnostic reproduced and strengthened with trained RNN/GRU transfer

### Reservoir diagnostic

Fresh command:

```bash
python -m projects.npms.experiment
```

Runtime: about `5.06 s` wall; peak RSS about `418 MB`.

The controlled study contains 112 reservoir realizations across four planted memory regimes and random orthogonal coordinate transforms.

- within-coordinate-equivalence spectrum cosine: `0.9959606006`;
- corresponding raw-parameter absolute cosine: `0.0992706397`;
- between-regime spectrum cosine: `0.9530792787`;
- leave-one-reservoir-out regime classification accuracy: `0.9285714286`.

This supports coordinate-stable and regime-discriminative **diagnostics** in the controlled reservoir setup. It is not by itself evidence that the diagnosed modes are causally used by a modern trained model.

### Memory Spectrum Transfer companion

A stronger companion experiment trains 24 vanilla-RNN/GRU models with 14 hidden units: two architectures × delays 3/8/15 × four seeds. Functional memory spectra are measured by out-of-sample linear-probe delay reconstruction, checked under random orthogonal hidden-coordinate rotations, and compared with six coarse parameter summaries for leave-one-seed-out delay-regime classification.

Fresh commands:

```bash
python -m pytest -q projects/memory_spectrum_transfer
python -m projects.memory_spectrum_transfer.experiment
```

Results:

- tests: **2 passed**;
- experiment wall: about `14.74 s`;
- peak RSS: about `497 MB`;
- mean orthogonal-rotation spectrum similarity: `1.0`;
- delay-regime classification from functional spectra: **0.875**;
- delay-regime classification from coarse parameter summaries: **0.666667**;
- models: `24`.

`memory_spectra.csv`, `model_results.csv`, `summary.csv`, `completion.json` and the PNG were byte-identical before and after the fresh rerun. Only the regenerated PDF changed hash.

**NPMS promotion:** `REPRODUCED_CONTROLLED_DIAGNOSTIC + REPRODUCED_TRAINED_RNN_GRU_COMPANION`. This is materially stronger than an untrained-reservoir-only result, but nonlinear reparameterizations, optimizer changes, larger architectures, natural sequence tasks and causal intervention selectivity remain open.

---

## Cross-project conclusion

These projects should not be flattened into one positive “memory architecture” story.

- APEN: bounded rare-event gain with a sharp salience-reliability failure boundary.
- PEN: independent compact negative evidence exists, but this wave has not yet recovered an executable source tree for a fresh rerun.
- Eigen-JEPA: mixed/negative real-data evidence; direct forecasting and persistence remain decisive controls depending on metric.
- NPMS: strongest current result is diagnostic reproducibility, now extended from controlled reservoirs to trained RNN/GRU memory-regime identification.

No external-validation or submission-ready label is assigned from these reruns alone.
