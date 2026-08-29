# NPMS canonical lineage closure — 2026-08-29

Status: `CANONICAL_CONTROLLED_SOURCE_RECOVERED / CONTROLLED_RESULT_REPRODUCED / MECHANISM_BOUNDARY_PRESERVED`

This artifact reconciles a stale Project 2424 control-plane blocker with later retained evidence. It does not create a new NPMS result, authorize a natural/OOD run, or strengthen the mechanism claim.

## Evidence anchors

The retained source-recovery commit is:

- `10e4a5641ab5345e2c3356275ea668c1e822f0e0` — `research: add durable NPMS source recovery evidence`

That commit records the recovered immutable Atlas artifact:

- `/BU1LD Research Atlas/Fresh Runs/2026-08-12/BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`
- SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`
- canonical base experiment: `projects/npms/experiment.py`

It also records a clean replay using:

```bash
python3 -m projects.npms.experiment
python3 -m pytest -q projects/npms
```

with `2 passed`, 112 reservoir realizations, and byte-identical retained evidence hashes for `summary.json`, `statistical_analysis.json`, `reservoir_results.csv`, `raw_reservoir_parameters.csv`, and `raw_reservoir_spectra.csv`.

The later control-plane issue text still describes the `MODEL-NPMS -> T2424-0019` source migration as unresolved. That statement is stale with respect to the controlled Atlas source above and must not be used to re-open source recovery or substitute a different bundle.

## Frozen scientific boundary

The source-recovery record preserves the predeclared invariant-parameter adverse-control verdict:

`PARAMETER_CONFOUNDED_OR_NON_UNIQUE`

The retained comparison is:

- NPMS spectrum classification accuracy: `0.9285714285714286`
- invariant-parameter classification accuracy: `0.8928571428571429`
- advantage: `3.57` percentage points

Because this lies inside the predeclared five-percentage-point non-uniqueness band, the tested regime-classification result does not support a claim that the NPMS spectrum discovers regime information unavailable from simple coordinate-invariant parameter summaries.

## Closure decision

For the controlled Atlas source only:

- canonical source identity: **closed**;
- immutable archive identity: **closed**;
- clean replay: **closed**;
- retained evidence hashing: **closed**;
- adverse-control mechanism verdict: **closed and negative/confounded**;
- natural/OOD generalization: **not tested / not authorized**.

Historical and derived NPMS bundles remain separate evidence objects and must not silently replace the controlled Atlas source.

## Next scientific gate

Any successor must be a new preregistered experiment asking whether a memory-spectrum quantity predicts behavior or intervention response **beyond** strong coordinate-invariant parameter summaries and strong state-space/spectral controls. Exact source/data/model identities, splits, seeds, metrics, uncertainty, compute cap, success criterion, and falsifier must be frozen before execution.
