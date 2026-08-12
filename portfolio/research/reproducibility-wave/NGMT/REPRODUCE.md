# NGMT — REPRODUCE

## Current status

There is no defensible full-NGMT reproduction command yet because the architecture/mechanism is not frozen. Do not turn the project name into a result.

The reproducible precursor is T2424-0025. Its fresh commands are:

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs
node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs
node --test \
  tests/project2424NonGaussianMemory.test.mjs \
  tests/project2424NonGaussianMemoryAblation.test.mjs
```

Fresh precursor evidence was produced in GitHub Actions run `31616573215`, job `94180746280`, on Ubuntu 24.04.4 / Node v22.23.1.

## Protocol that must be frozen before full NGMT execution

A new NGMT experiment must commit, before looking at held-out results:

1. exact equations and state update;
2. dataset/generator version and fixed train/validation/test split;
3. tokenizer/input representation where applicable;
4. parameter-count matching rule;
5. optimizer, learning-rate schedule, batch size and training budget;
6. seed list;
7. B0–B2 baselines and proposed B3;
8. component ablations;
9. primary and secondary metrics;
10. stopping/failure criteria;
11. compute environment and maximum budget;
12. raw prediction/checkpoint retention policy.

## Recommended statistical protocol

For stochastic learned models, use at least five predeclared seeds for the first bounded screen when compute permits. Report per-seed values, mean, sample SD and robust summaries. Use paired comparisons where the same seeds/splits are shared. Any confidence interval or significance test must be named and justified; do not infer significance from non-overlapping means alone.

## Failure policy

A failed or null learned comparison is a valid NGMT result. Do not change distribution families, corruption severity, readout choice or stopping threshold after observing the first held-out result merely to obtain a positive conclusion.