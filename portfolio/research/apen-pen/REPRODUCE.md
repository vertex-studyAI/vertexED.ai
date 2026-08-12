# Reproduce APEN / PEN

## Source identity

Use the checksum-addressed source archive:

- package: `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`
- SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`

Do not substitute a later archive under the same project name without recording a new checksum.

## Environment used in this wave

- Linux x86_64 CPU
- Python 3.13.5
- NumPy 2.3.5
- pandas 2.2.3
- SciPy 1.17.0
- scikit-learn 1.8.0
- PyTorch 2.10.0+cpu
- Matplotlib 3.10.8
- pytest 9.0.2

## Commands

From the extracted Atlas package root:

```bash
pytest -q
python -m projects.apen.experiment
python -m projects.apen.extended_experiment
```

The fresh full-suite result was `39 passed`.

## Seed policy

Base experiment: delays `[12, 24, 48]`, noise levels `[0.2, 0.5]`, seeds `0..7` for each condition, using the frozen deterministic seed construction in the package. This yields 48 paired condition cells for each compared method.

Robustness extension: salience dropout `[0, 0.2, 0.5, 0.8, 1.0]`, delays `[24, 48]`, eight paired deterministic seeds per condition.

## Required evidence

Retain the generated condition-level CSVs, aggregate summaries, statistical-analysis JSON, completion JSON, and plots. Compare raw numerical artifacts before interpreting the result. PDF byte differences caused only by `CreationDate` metadata should be documented separately from metric drift.

## Failure policy

Do not modify salience/dropout settings, seeds, alpha-selection logic or baselines after observing a result. If a scientific bug is found, preserve the invalid run, commit the smallest fix, and rerun as a separately labeled revision.

## PEN boundary

There is no distinct executable PEN experiment in this frozen package. Do not relabel or duplicate APEN evidence as PEN. A separate PEN result requires its own implementation, protocol, command, seeds and retained metrics.
