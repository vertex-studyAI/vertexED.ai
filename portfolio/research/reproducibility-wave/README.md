# Research Reproducibility Wave — 2026-08-12

This directory is the evidence-first reproducibility package for the portfolio research wave. It separates execution success from scientific support and preserves negative/null outcomes.

## Current portfolio outcome

| Priority | Project | Execution state | Scientific state |
|---:|---|---|---|
| 1 | LAM-JEPA | exact-head container/build/import reproducible | frozen ARC superiority hypothesis unsupported; planner/target mechanism not supported by current controls |
| 2 | T2424-0025 | freshly reproduced; 30-seed reference + 50-seed ablation | robust aggregation effect supported on synthetic fixture; uniquely non-Gaussian / Transformer mechanism not isolated |
| 2 | T2424-0027 | freshly reproduced + independent verifier | controlled synthetic language-leakage mechanics supported; no real multilingual claim |
| 2 | T2424-1768 | freshly reproduced | controlled out-of-contract expert rejection supported; no real Scientific-ML/verifier-correctness claim |
| 2 | T2424-0035 | freshly reproduced | synthetic delayed-generalization detector mechanics supported; no real-model grokking claim |
| 3 | NGMT | precursor reproducible | full architecture remains at specification gate; no Transformer-level result |
| 4 | APEN/PEN | not executable from connected canonical sources | blocked; result is null; identity/source recovery required |
| 5 | Eigen-JEPA | not executable from connected canonical sources | blocked; source + leakage-safe market-data contract required |

## Frozen Project 2424 execution

Protocol base:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

First fresh wave execution:

```text
GitHub Actions run: 31616573215
job: 94180746280
environment: Ubuntu 24.04.4 x86_64, Node v22.23.1
artifact: project2424-repro-wave-31616573215
artifact ZIP SHA-256: 79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705
```

The workflow ran an implementation-diff guard before executing T2424-0025, T2424-0027, T2424-1768 and T2424-0035. All selected steps/tests completed successfully and raw metrics/logs were checksum-bound. In-repo raw metric snapshots are retained alongside the results so the scientific record does not depend on Actions artifact retention.

## LAM-JEPA execution check

Source commit:

```text
2f59b4297e5978d4ce769ebe95adb363e1e75d7a
```

Fresh GitHub Actions rerun `31610610381`, job `94178966319`, successfully rebuilt the research container, executed the CLI help entry point and imported the installed package on CPU. This does not replace the frozen five-seed ARC result.

## Per-project package

Each selected line contains, as applicable:

- `RESULTS.md` — hypothesis/task/baselines/protocol/result/uncertainty/limitations;
- `REPRODUCE.md` — exact commands, environment and failure policy;
- `metadata.json` — machine-readable experiment/status metadata;
- `raw_metrics.json` — fresh machine-readable metric snapshot for executed Project 2424 experiments;
- figures where they add information, e.g. `T2424-0025/contamination_sweep.svg`.

## Reproducibility rules

1. Freeze scientific protocol before held-out evaluation.
2. Never tune a threshold, seed list, split or comparator merely because the result is negative.
3. Retain failed runs before repairing invalidating bugs.
4. Separate execution-only fixes from scientific/protocol changes.
5. Use meaningful simple, standard and ablated baselines.
6. Report sample count, mean and sample SD for stochastic multi-run studies.
7. Do not infer significance without a suitable dependence-aware analysis.
8. Treat deterministic fixtures as exact mechanics reproductions, not inferential `n=1` experiments.
9. A project name does not establish a mechanism.
10. `result=null` is preferable to an invented experiment when source/data provenance is missing.
