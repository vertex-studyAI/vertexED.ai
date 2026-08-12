# Reproducibility bug log — 2026-08-12

## Incident: post-merge Project 2424 verifier

- old failing Actions run: `31617979117`
- failing job: `94185443041`
- old branch head: `d260b10783507a135c48943056f09690e0bfe3ed`
- failure stage: `Reproduce T2424-0025 robust-readout screen`
- the scientific T2424-0025 commands completed and emitted their base-screen and ablation JSON outputs before the verifier exited.

## Bug

The stale CI verifier expected an obsolete ablation JSON shape:

- `a.seeds`
- `a.summary`
- `row.contamination`
- `row.median.mae`

The frozen experiment actually emits the canonical shape:

- `a.sweep.seeds`
- `a.sweep.rows`
- `row.contaminationRate`
- `row.metrics.median.mean`

The verifier therefore exited with code 1 after experiment execution. This is a **reproducibility-infrastructure verifier bug**, not a scientific-result failure.

## Preserved old evidence

Run `31617979117` and its partial artifact remain preserved. The failed run is not overwritten or relabeled.

## Fix and rerun

Verifier-only fix commit on the historical execution branch: `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`.

Only the verifier schema was corrected. Scientific source, experiment commands, source paths, seeds, contamination grid, readouts, tests, metrics and result gates were unchanged.

The unchanged focused reproduction reran as Actions run `31618609967` and completed **SUCCESS**. Every focused step passed:

- T2424-0025 base screen, 50-seed ablation, verifier and focused tests;
- T2424-0027 deterministic latent-language run, independent verifier and tests;
- T2424-0037 frozen 20-case NeuroCAD benchmark and tests;
- T2424-0050 bounded 20-seed Darcy screen and tests.

Fixed-run artifact digest: `sha256:380ca0a2b9628eee8cb9f06d7a56cc28b75b1974c75fdb4582b81125617c1c05`.

## Scientific status

No scientific claim is promoted because of the verifier fix. The earlier frozen reproduction `31616762393` already passed. The clean 0% contamination control continues to show substantial generic robust-readout benefit, so NGMT remains a bounded synthetic robust-aggregation precursor rather than a demonstrated Transformer mechanism.
