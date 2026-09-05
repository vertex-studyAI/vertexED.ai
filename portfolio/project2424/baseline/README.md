# Project2424 minimum baseline

This bundle establishes a truthful, machine-readable floor for all **2,424 canonical `T2424-*` identities**.

It does **not** claim that 2,424 implementations, experiments, reproductions, manuscripts, or submission-ready papers exist. Each row instead has:

- an exact canonical T identifier and registry title;
- an explicit P/T non-inference boundary;
- source, implementation, protocol, experiment, reproduction, manuscript, and release states;
- exactly one disposition, blocker, and next decisive action;
- an evidence-bounded score with unsupported fields left `UNKNOWN`, `NOT_RUN`, or `NO_GO`.

## Bundle

- `PROJECT2424_MINIMUM_BASELINE_20260830.csv.gz` — 2,424 data rows plus header.
- `PROJECT2424_MINIMUM_BASELINE_SUMMARY_20260830.json` — aggregate counts, integrity locks, and decompressed CSV SHA-256.
- `PROJECT2424_MINIMUM_BASELINE_VALIDATION_20260830.md` — human-readable validation result.
- `validate_project2424_baseline.py` — deterministic standard-library verifier.
- `build_project2424_baseline.py` — provenance-preserving generator from `PROJECT_2424_IDENTITY_INVENTORY_2026-08-15.jsonl`.

Run:

```bash
python3 portfolio/project2424/baseline/validate_project2424_baseline.py
```

The P2424 registry and two orphan identities are deliberately excluded. No mapping is inferred from numeric suffixes.