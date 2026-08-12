# T2424-1768 — REPRODUCE

## Frozen revision

Project 2424 base commit:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

Fresh wave execution commit: `db9f470ec68f74a95c6e586d88b27927d734dc44`. The implementation-diff guard passed before the run.

## Environment

- Ubuntu 24.04.4 x86_64 GitHub runner;
- Node `v22.23.1`;
- run `31616573215`;
- job `94180746280`.

## Commands

```bash
node portfolio/project2424/projects/T2424-1768/experiment/syntheticBenchmark.mjs
node --test tests/project2424T1768SelfVerifyingMoe.test.mjs
```

## Frozen protocol

- 81 deterministic scalar samples;
- 3 fixed experts;
- fixed uniform router scores;
- contract interval `[-0.6, 1.1]`;
- corrupted candidate C adds `+6` for `x > 0.2`;
- clean control removes only the injected corruption;
- accepted-expert quorum remains enabled.

Do not relax the contract or gates after observing output.

## Evidence retained

Fresh artifact: `project2424-repro-wave-31616573215`.

```text
1d8290e0d7e25f228df4b212af3db8cbcdf73cb2f9cd6039c7c6208bdc4154b6  T2424-1768-results.json
b0252ab086077aeacba742ec12abe29f41ab5320252fc599c6a2066216b22633  T2424-1768-tests.log
```

Artifact ZIP digest:

```text
sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705
```

## Failure policy

A verifier bug or data-leakage bug invalidates the scientific interpretation even if tests pass. Retain the old output, fix separately, rerun, and label both lineages. Any future real-task benchmark must derive verifier contracts without reading held-out targets.