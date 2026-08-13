# Reproduce T2424-0028

## Frozen commands

From the repository root:

```bash
node portfolio/project2424/projects/T2424-0028/experiment/run.mjs
node --test tests/residualEventTokenization.test.mjs
```

The canonical evidence runner executes the same commands and retains stdout:

```bash
node portfolio/project2424/projects/T2424-0028/experiment/run.mjs \
  | tee reproducibility-wave/raw/T2424-0028-residual-events.json
node --test tests/residualEventTokenization.test.mjs \
  | tee reproducibility-wave/T2424-0028-tests.log
```

## Frozen protocol

- task: deterministic 120-point trend with two level defects plus clean linear controls
- proposed method: residual-triggered event stream with linear event-to-event prediction
- baseline: zero-order-hold event predictor
- thresholds: `0.1, 0.25, 0.5, 1, 2`
- metric: maximum absolute reconstruction error, event count, event ratio, event-count compression factor, MAE, RMSE
- seed policy: no RNG; deterministic fixtures
- success gate: each mode/threshold max error `< threshold + 1e-12`; exact clean linear control emits exactly two linear events; hold emits >10x the two-event linear representation
- failure gate: any bound violation, non-finite metric, invariant failure, or focused regression failure

Do not change thresholds or fixtures after observing a result. A protocol-changing extension must be versioned separately.

## Fresh retained execution

- commit: `4eb3fed7f582428c389a66dd388c241d8a152e8e`
- workflow run: `31656575356`
- artifact: `9164597422`
- artifact digest: `sha256:252392c0447a443b9c75b5926c80403ddded48ef7465a829fe4001ba27cae15e`
- Node: `v22.23.1`
- OS/kernel: Ubuntu 24.04 Azure x86_64, Linux `6.17.0-1020-azure`
- focused tests: `5/5` pass

## Evidence files

- `RESULTS.md`
- `experiment_metadata.json`
- `raw_metrics/repro-wave-20260813.json`
- `PROTOCOL.md`
- `CLAIM.md`

## Interpretation

A successful rerun establishes bounded synthetic codec mechanics only. It is not evidence for external rate-distortion superiority, learned representation quality, production compression, or generalization.
