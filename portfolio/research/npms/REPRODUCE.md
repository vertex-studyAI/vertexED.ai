# Reproduce NPMS

## Source identity

This wave used the immutable source archive `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`, SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`. No Git commit is invented for the extracted Atlas package.

The NPMS experiment source file SHA-256 is `b4658727dc66dbdd68a8ba0f487c6e064f7b2c0611bea676381606224a83c51d`.

## Environment

Fresh wave environment:

- Python `3.13.5`
- NumPy `2.3.5`
- pandas `2.2.3`
- SciPy `1.17.0`
- scikit-learn `1.8.0`
- PyTorch `2.10.0+cpu`
- pytest `9.0.2`
- Linux x86_64 CPU execution

The clean Atlas extraction passed `39/39` tests before the experiment reruns.

## Command

From the extracted Atlas root:

```bash
python -m projects.npms.experiment
```

Observed wall runtime in the individual priority rerun: `5.39 s`.

## Protocol

Four reservoir regimes vary spectral radius and leak. Seven base reservoirs are generated per regime and each is evaluated in original coordinates plus three random orthogonal transforms. Functional delay spectra use 24 probes. The experiment compares within-equivalence spectrum similarity with raw-parameter similarity, checks between-regime spectrum similarity, and performs leave-one-reservoir-out regime classification.

## Evidence retention

The source package writes raw reservoir rows, raw parameters, raw spectra, aggregate summary, statistical analysis, and figures under `projects/npms/artifacts/`. In the reproducibility-wave bundle these are retained alongside `RESULTS.md` and machine-readable metadata.

## Failure policy

Do not silently alter the reservoir generator, spectrum definition, matching metric, seed policy, or classifier after observing results. If a scientific bug is found, preserve this result as the old protocol, document the bug, version the fix, and rerun separately.