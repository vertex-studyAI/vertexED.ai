# T2424-0025 Reproduction Protocol

## Source pin

Repository: `vertex-studyAI/vertexED.ai`  
Audited portfolio head: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

Before running, verify the exact file blobs:

```bash
git hash-object portfolio/project2424/projects/T2424-0025/src/core.mjs
git hash-object portfolio/project2424/projects/T2424-0025/src/robust_readouts.mjs
git hash-object portfolio/project2424/projects/T2424-0025/experiment/run.mjs
git hash-object portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs
```

Expected blobs:

```text
7826f9ba4577b471250ef13faa8e2c854aae4a73  src/core.mjs
badbc9529d04bc851b7782a9848e81d2d3aaf39a  src/robust_readouts.mjs
e5987fb6021fa0ed550166c8c45c8f4acce6fc1e  experiment/run.mjs
ed0e5b600425f67ae3e60e9809d8b9c8378bcaae  experiment/ablation.mjs
```

## Environment capture

```bash
node --version
uname -a
```

The 12 August 2026 fresh rerun used Node.js `v22.16.0` on Linux x86_64 kernel `6.18.35`.

## Primary screen

From the project directory:

```bash
/usr/bin/time -p node experiment/run.mjs > results/repro-20260812-primary.json 2> results/repro-20260812-primary.time
```

The script uses seeds `0..29`. Do not change its predeclared gate after observing the result.

Expected fresh-result SHA-256 from this wave:

```text
7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1
```

## Contamination ablation

```bash
/usr/bin/time -p node experiment/ablation.mjs > results/repro-20260812-ablation.json 2> results/repro-20260812-ablation.time
```

The script uses 50 seeds at contamination rates `0`, `0.05`, `0.10`, `0.18`, `0.25`, `0.35`.

Expected fresh-result SHA-256 from this wave:

```text
f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e
```

## Scientific protocol boundary

A passing synthetic gate is **not** a passing NGMT/Transformer gate. Preserve the clean 0% contamination control, because robust estimators improve it substantially. A future B3 non-Gaussian-memory mechanism requires frozen equations, a Gaussian/reference-memory baseline, capacity/FLOP matching, learned sequence tasks and preregistered falsifiers before validation.

## Bug policy

If execution fails, retain the failed command/output and diagnose the smallest correction. If a correction changes the data-generation, estimator, seed set, threshold, metric or gate, create a new experiment version instead of replacing this result.
