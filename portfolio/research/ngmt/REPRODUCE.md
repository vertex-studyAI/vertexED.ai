# Reproduce NGMT

There is no valid Transformer-level NGMT reproduction command at the audited revision because the mechanism is not yet frozen. Do not create a result by relabeling T2424-0025 as NGMT.

## Reproduce the bounded precursor only

Use T2424-0025 at revision:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

Then run from `portfolio/project2424/projects/T2424-0025`:

```bash
node experiment/run.mjs > run.json
node experiment/ablation.mjs > ablation.json
```

See that project's `RESULTS.md`, `REPRODUCE.md`, `experiment_metadata.json`, and `raw_metrics/repro-wave-20260812.json` for the fresh 2026-08-12 reproduction.

## Gate before a Transformer-level run

Before any NGMT training command is accepted as scientific evidence, commit a frozen protocol that defines:

1. the memory state and distribution family;
2. the read rule;
3. the update rule;
4. the operational property that makes the memory non-Gaussian;
5. a no-memory/ordinary-model baseline;
6. a standard-memory baseline;
7. a capacity- and compute-matched Gaussian/reference-memory baseline;
8. the proposed NGMT variant;
9. datasets/tasks, split hashes, preprocessing, metric implementations, and sample counts;
10. paired seed list and failure policy;
11. parameter/FLOP/training-token accounting;
12. a predeclared falsification threshold.

## First-run evidence contract

The first legitimate learned run must retain:

```text
command
source commit
protocol commit
package lock/environment
seed
device and precision
start/end timestamps
runtime
stdout/stderr logs
checkpoint hash
raw per-example or per-sequence metrics where feasible
per-seed metrics
aggregate mean / sample SD / n
baseline deltas
failed/divergent runs
```

If a bug is discovered after the result is observed, preserve the invalid run, identify the bug and affected claim, fix it in a new commit, and rerun under a new evidence ID. Never rewrite the prior result in place.

## Stop rule

If the proposed non-Gaussian memory has no reproducible advantage over the ordinary, standard-memory, and Gaussian/reference-memory baselines under the frozen matched budget, record a negative result and stop the current mechanism claim rather than changing the task or baseline after seeing validation performance.
