# T2424-0019 — NPMS — Neural Predictive Memory Spectroscopy

This is the canonical Project 2424 recovery package for First-100 rank #3. The frozen queue title above is authoritative; the retained provisional project identity `MODEL-NPMS` is preserved as recovery provenance rather than treated as a competing canonical identity.

NPMS is preserved as a **diagnostic system for predictive memory**, not promoted into a generic forecasting architecture. The retained isolated package analysed fitted latent dynamics through eigenmodes, timescales, frequencies, singular spectra, impulse/resolvent responses and modal interventions. All executed evidence in the recovered bundle is `SYNTHETIC_CONTROLLED`.

## What was actually recovered

The isolated handoff records:

- `make test` — 17 tests passed;
- clean target installation passed;
- smoke execution on a linear dynamical system and delayed-copy system;
- compact execution across seeds 7, 19 and 41 on five controlled systems;
- 15 compact runs;
- 36 ablation records;
- 45 noise/sparsity robustness records;
- a 5,709-word checked manuscript and 16-row claim-evidence matrix.

The retained compact aggregate reports:

- mean eigenvalue MAE: `0.21398422742689097`;
- mean target-prediction MSE: `0.029106375131836094`;
- standard deviation of eigenvalue MAE: `0.13148632187474893`;
- standard deviation of target-prediction MSE: `0.026760194791606542`.

The smoke aggregate reports mean eigenvalue MAE `0.03363788618886249` and mean target-prediction MSE `0.006667285747895972` across two runs.

These numbers are recovered from the retained experiment report. They have **not** been rerun from canonical Git source in this package because the original isolated source tree is not currently mounted into the connected repository.

## Negative results that must remain visible

The recovered package is not a clean success story:

- compact delay-PCA recovery on the directly observed linear system is much worse than the identity smoke path;
- multiscale-AR spectral recovery remains weak;
- the negative switching regime is poorly recovered;
- the current Hungarian/matched-eigenvalue metric can ignore missing planted modes and extra spurious modes;
- the current mode-truncation ablation ranks individual eigenvalues rather than conjugate groups;
- the reported frequency response is an autonomous-operator resolvent proxy, not a complete identified input-output transfer function.

The canonical validator fails if these key evidence boundaries are removed or upgraded.

## Run the recovery gate

```bash
node portfolio/project2424/projects/T2424-0019/experiment/validate_recovery.mjs
```

## Test

```bash
node --test tests/project2424NpmsEvidenceRecovery.test.mjs
```

The root repository test suite discovers this regression file automatically.

## What this package proves

It proves that a retained isolated NPMS execution report exists with internally recorded tests, compact/robustness run counts, aggregate metrics, negative findings and hashes, and that those claims have now been mapped to canonical queue ID `T2424-0019` under a fail-closed evidence contract.

It does **not** prove that the original source and retained hashes reproduce from this Git branch. It does not evaluate a real trained model, external benchmark or real dataset. It does not establish novelty, validated interpretability, forecasting superiority, publication readiness or Project 2424 certified completion.

## Next evidence gate

Migrate the original isolated `projects/MODEL-NPMS/` source/config/result/evidence/manuscript tree; validate retained hashes; rerun `make test`, compact and robustness commands from a clean canonical checkout; fix the matched-mode metric, contiguous switching estimation and conjugate-group truncation; add residual/uncertainty checks; then evaluate an actual frozen model checkpoint or real dataset under a versioned external protocol and independent QA.
