# T2424-0025 — REPRODUCE

## Frozen implementation

Scientific implementation base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

Fresh wave execution used commit `db9f470ec68f74a95c6e586d88b27927d734dc44`, containing only the frozen wave protocol/workflow in addition to the base; an implementation-diff guard passed before execution.

## Environment

Observed fresh environment:

- Ubuntu 24.04.4 GitHub-hosted x86_64 runner;
- Node `v22.23.1`;
- workflow run `31616573215`;
- job `94180746280`.

## Commands

Reference screen:

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs
```

50-seed robust-readout ablation:

```bash
node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs
```

Focused regression suite:

```bash
node --test \
  tests/project2424NonGaussianMemory.test.mjs \
  tests/project2424NonGaussianMemoryAblation.test.mjs
```

## Fixed protocol

Reference screen:

- 30 deterministic seeds;
- heavy-tail setting fixed by the existing implementation;
- weighted mean vs weighted median;
- no seed filtering.

Ablation:

- 50 deterministic seeds per condition;
- contamination rates `[0, 0.05, 0.10, 0.18, 0.25, 0.35]`;
- trim fraction `0.10`;
- Huber delta `0.15`;
- weighted mean, median, trimmed mean and Huber retained for every condition.

## Retained evidence

The fresh workflow saved raw JSON outputs, test logs, environment metadata, git status, and SHA-256 checksums in GitHub Actions artifact `project2424-repro-wave-31616573215`.

Artifact ZIP digest:

```text
sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705
```

Important raw-file checksums include:

```text
7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1  T2424-0025-reference.json
f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e  T2424-0025-ablation.json
e3fdb89f70d889038fe692e5fc313106f423e62befaf45ea352ba90a84c4f25f  T2424-0025-tests.log
```

## Failure / protocol-deviation rule

Do not change contamination rates, seed counts, readout hyperparameters, thresholds or gates after seeing a result. If a bug invalidates the experiment, first retain the failed output, then make the fix in a separate commit and rerun while explicitly separating pre-fix and post-fix results.