# Reproducibility bug log — 2026-08-12

## Incident: Project 2424 post-documentation verification run

- failing Actions run: `31617979117`
- failing job: `94185443041`
- branch head at failure: `d260b10783507a135c48943056f09690e0bfe3ed`
- failure stage: `Reproduce T2424-0025 robust-readout screen`
- scientific commands completed and emitted their JSON outputs before the failure.

## Bug

The CI verification snippet expected an obsolete ablation JSON shape:

- `a.seeds`
- `a.summary`
- `row.contamination`
- `row.median.mae`

The frozen experiment actually emits the current canonical shape:

- `a.sweep.seeds`
- `a.sweep.rows`
- `row.contaminationRate`
- `row.metrics.median.mean`

Because the verifier read fields that do not exist, it exited with code 1 after the experiment outputs had already been produced. This is a **reproducibility-infrastructure verifier bug**, not evidence that the T2424-0025 scientific implementation changed or that its numerical result failed to reproduce.

## Preserved old evidence

The failed workflow is retained as run `31617979117`. Its uploaded partial evidence artifact is intentionally preserved rather than overwritten.

## Fix policy

Only the verifier schema is changed. The scientific experiment commands, source paths, seeds, contamination grid, readout implementations, tests, and result gates remain unchanged. The fixed verifier will read the canonical `sweep` schema and rerun the same frozen experiment commands. The old failed run and the fixed rerun must remain separately identifiable.

## Scientific status

No scientific claim is promoted because of the verifier fix. The earlier frozen reproduction run `31616762393` already succeeded, including T2424-0025 base + ablation and focused tests. The clean 0% contamination control continues to show substantial generic robust-readout benefit, so the NGMT identity remains a bounded synthetic robust-aggregation precursor rather than a demonstrated Transformer mechanism.
