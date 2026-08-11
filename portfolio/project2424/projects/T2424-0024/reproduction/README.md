# Reproduction — T2424-0024

From a clean checkout of the target branch/revision:

```bash
node --version
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
node portfolio/project2424/projects/T2424-0024/reproduction/verify.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

Expected minimum invariants:

- 20 observations and 70% correctness in both policies;
- moderate Brier score approximately `0.04`;
- overconfident Brier score approximately `0.2542`;
- moderate 5-bin ECE approximately `0.20`;
- overconfident 5-bin ECE approximately `0.262`;
- independent evidence verifier prints `PASS`;
- the focused regression suite passes;
- no network, credential, production data or external service is required.

The canonical retained artifact is `../evidence/raw/results.json` with SHA-256 `8e5b49bff8cd47cb0b20266b34aa55533823dda5c4855dd7da49365925f7fa39`.

The verifier fails closed if the retained bytes change or if the public evaluator API no longer reproduces the claimed Brier/ECE/selective-risk/abstention values.

Canonical GitHub Actions on the exact PR head remains the integration gate before promotion to `TESTED_TOOL`.
