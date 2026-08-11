# Reproduction — T2424-0024

From a clean checkout of the target branch/revision:

```bash
node --version
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

Expected minimum invariants:

- 20 observations and 70% correctness in both policies;
- moderate Brier score approximately `0.04`;
- overconfident Brier score approximately `0.2542`;
- moderate 5-bin ECE approximately `0.20`;
- overconfident 5-bin ECE approximately `0.262`;
- all five focused tests pass;
- no network, credential, production data or external service is required.

Compare the runner output with `../evidence/raw/minimum-experiment.json`. A mismatch must fail the evidence claim rather than be silently normalized.

Independent QA on GitHub remains a separate gate: require canonical repository Actions to pass on the exact PR head before promotion to `TESTED_TOOL`.
