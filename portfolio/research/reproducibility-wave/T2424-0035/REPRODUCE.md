# T2424-0035 — REPRODUCE

## Frozen revision

Scientific implementation base:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

Fresh wave execution commit: `db9f470ec68f74a95c6e586d88b27927d734dc44`, after a successful implementation-diff guard.

## Environment

- Ubuntu 24.04.4 x86_64;
- Node `v22.23.1`;
- GitHub Actions run `31616573215`;
- job `94180746280`.

## Commands

```bash
node portfolio/project2424/projects/T2424-0035/experiment/run.mjs
node --test tests/grokkingAgent.test.mjs
```

## Protocol

Run the bundled delayed positive fixture and matched near-synchronous control without changing detector thresholds after observing the outcome. Retain the persistent-threshold, causal-moving-average and malformed-input tests.

## Retained evidence

Fresh artifact: `project2424-repro-wave-31616573215`.

```text
6f92f58c244dd4ab762f5fa1dcd681195af4e352fb549b49387b735a7a00ec0d  T2424-0035-results.json
66abb3d93ee5b31cfcc5287092340213f3177d6f13bebc2f92dbe684235af8d7  T2424-0035-tests.log
```

Artifact ZIP digest:

```text
sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705
```

## Failure policy

If a detector bug or future-data leakage is discovered, preserve the old result/log, patch separately, rerun, and explicitly classify old versus corrected detector outcomes. Real-model studies must freeze curves/selection criteria before evaluating detector performance.