# T2424-0028 Reproduction Protocol

Pinned source head: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

Verify source blobs:

```bash
git hash-object portfolio/project2424/projects/T2424-0028/src/core.mjs
git hash-object portfolio/project2424/projects/T2424-0028/experiment/run.mjs
```

Expected:

```text
af93f210b6c922b87281091a28bb8ad4d5ad864a  src/core.mjs
a238e5f984b4eee5a525c08416cb5f72754bfa10  experiment/run.mjs
```

Capture environment and execute from the project directory:

```bash
node --version
uname -a
/usr/bin/time -p node experiment/run.mjs \
  > results/repro-20260812-result.json \
  2> results/repro-20260812-runtime.txt
```

Fresh-wave result SHA-256:

```text
039f9264f833dbae10932a01865ac78a85104a5e6b9b1e67dc6e9b375356c046
```

The current experiment is deterministic; do not report repeated identical executions as independent samples. A statistical extension should freeze a family of noisy/multivariate/generated and natural sequences before execution.

Do not adjust thresholds after inspecting this result without creating a new experiment version. The current sweep is fixed at `0.1`, `0.25`, `0.5`, `1`, `2` for both `linear` and `hold` predictors.
