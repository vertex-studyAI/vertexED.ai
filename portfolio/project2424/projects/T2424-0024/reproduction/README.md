# Reproduction — T2424-0024

From a clean checkout of the target branch/revision:

```bash
node --version
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs /tmp/t2424-0024-results.json
node portfolio/project2424/projects/T2424-0024/reproduction/verify.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

Expected minimum invariants:

- 20 observations and 70% correctness in both confidence policies;
- moderate Brier score approximately `0.04`;
- overconfident Brier score approximately `0.2542`;
- moderate 5-bin ECE approximately `0.20`;
- overconfident 5-bin ECE approximately `0.262`;
- the independent verifier recomputes the retained metrics from `evidence/raw/results.json` and validates its SHA-256 binding;
- all five focused tests pass;
- no network, credential, production data or external service is required.

The canonical retained artifact is `../evidence/raw/results.json`; its hash is frozen in `../evidence/manifest.json`. Any mismatch must fail closed rather than be silently normalized.

GitHub Actions remains a separate repository-integration gate: require the canonical workflow to pass on the exact final PR head before promotion or merge.
