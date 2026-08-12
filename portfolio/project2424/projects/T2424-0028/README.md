# T2424-0028 — Residual Event Tokenization

**Frozen First-100 identity:** `T2424-0028` / rank 21  
**Track:** C — Existing work → minimum experiment

This package converts dense scalar time series into sparse causal residual-triggered event tokens with deterministic reconstruction.

Two predictors are implemented:

- `hold`: zero-order hold from the latest event;
- `linear`: causal extrapolation from the two latest events.

At each observation the encoder predicts using only already-emitted tokens. A new token is emitted when the absolute residual reaches the configured threshold. The decoder uses the same predictor and tokens.

## Core invariant

For an encoding produced by this implementation, every non-token observation has absolute reconstruction error strictly below the emission threshold; token positions reconstruct exactly.

## Run

```bash
node portfolio/project2424/projects/T2424-0028/experiment/run.mjs
node --test tests/residualEventTokenization.test.mjs
```

The deterministic minimum experiment uses a 120-point trend with two injected level defects and sweeps thresholds `0.1, 0.25, 0.5, 1, 2` for both predictors. It reports token count/ratio, compression factor, MAE, RMSE, and maximum absolute reconstruction error.

## Provenance

This is a canonical-path recovery of the tested legacy implementation from PR #163 / head `f35ac3a28063aee4f41fc5cc44e775655092f383`, which passed CI run `31409107038`. The algorithm has not been reconstructed from prose or changed during migration; tests are repointed to the frozen canonical path.

The new recovery branch still requires its own exact-head canonical CI before promotion to `TESTED_TOOL` or integration.

## Evidence boundary

The built-in controls show deterministic codec mechanics only. Token count is not encoded byte size, and the synthetic fixtures are not external validation.

## Limitations

- scalar series only;
- no entropy coding of indices or values;
- token payloads store full floating-point values;
- simple causal predictors only;
- manual threshold selection;
- no missing-data model;
- no irregular timestamps;
- no real benchmark;
- no comparison with standard change-point or compression codecs by encoded bytes.

## Next evidence gate

Freeze at least two real datasets with different dynamics, compare actual encoded bytes against uniform downsampling and standard change-point/event baselines, support irregular timestamps, predeclare rate–distortion metrics, retain raw outputs, and add an independent claim↔evidence verifier.
