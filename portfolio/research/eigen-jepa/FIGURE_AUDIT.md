# Eigen-JEPA paper figure audit

**Status:** retained-result visualization only; no new experiment and no scientific promotion.

## Source boundary

The figure `figures/primary-comparison.svg` is generated exclusively from `FIGURE_DATA.json`, which is bound to the canonical retained result surface `RESULTS.md` and source-package SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`.

The plotted primary aggregate values are exactly the retained covariance-matrix MSE values:

| Method | Matrix MSE | Displayed ×10^-9 value |
|---|---:|---:|
| raw ridge | `5.7734384e-09` | `5.7734384` |
| log ridge | `5.7896089e-09` | `5.7896089` |
| Eigen-JEPA | `5.8318226e-09` | `5.8318226` |
| Cholesky | `5.8762487e-09` | `5.8762487` |
| persistence | `7.7708315e-09` | `7.7708315` |

Panel B retains the paired Eigen-JEPA-minus-raw-ridge matrix-MSE difference `+5.8384e-11` and retained 95% interval `[-2.3565e-10, 4.1744e-10]`. In display units these are approximately `+0.058384`, `-0.23565`, and `+0.41744` ×10^-9. Positive values favor raw ridge under the retained difference convention; the interval crosses zero.

## Determinism and claim guard

`scripts/generate-eigen-jepa-paper-figure.mjs` deterministically renders the SVG from the machine-readable data object. `tests/eigen-jepa-paper-figure.test.mjs` requires every plotted method/value, paired difference, interval endpoint, held-out count, and source digest to appear in the canonical retained result; it then regenerates the SVG in memory and requires byte-for-byte equality with the committed figure.

Current committed SVG SHA-256: `b9a1fb084f5c88506c342e0489ec64ddc8840b3427413a756fc9fb0de88f98bd`.

The figure explicitly states that lower primary MSE is better and that the retained paired interval crosses zero. It may not be used to claim statistical significance, state-of-the-art performance, financial alpha, external validation, or universal spectral superiority.

## Manuscript-ready caption

**Figure 1. Frozen held-out primary comparison for Eigen-JEPA.** Panel A shows covariance-matrix MSE for the five retained methods on the chronological 111-block test set; lower is better. Eigen-JEPA improves on persistence but has higher primary MSE than both raw and log ridge in this retained run. Panel B shows the retained paired Eigen-JEPA-minus-raw-ridge MSE difference and retained 95% interval. Positive values favor raw ridge under the frozen difference convention, and the interval crosses zero. The figure is descriptive evidence from the frozen study and does not introduce a new post-outcome decision threshold.

## Release boundary

This closes the missing deterministic real-result figure artifact for the current mixed/negative manuscript. It does not close external reproduction, authorship, venue formatting, PDF compilation, visual PDF inspection, or normal scientific review. The result remains frozen mixed/negative evidence.
