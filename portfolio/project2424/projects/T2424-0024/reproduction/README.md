# T2424-0024 Independent Reproduction

This reproduction path verifies the frozen **synthetic evaluator-mechanics** claim only. It does not validate a real model, deployment policy, or external benchmark.

## Preconditions

- clean checkout of the PR/review head;
- Node.js version supported by the repository CI;
- no external API, dataset, credential, network request, or random seed is required.

## 1. Regenerate retained evidence

```bash
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
```

This must deterministically regenerate `../evidence/results.json` from the fixed 20 outcomes and fixed confidence policies declared in `PROTOCOL.md`.

## 2. Run author regressions

```bash
node --test tests/project2424TrustUnderUncertainty.test.mjs
```

## 3. Run implementation-independent QA

```bash
node --test tests/project2424TrustUnderUncertaintyQa.test.mjs
```

The QA path intentionally does not import `src/core.mjs`. It reads the retained evidence and independently recomputes Brier score, 5-bin ECE, selective-risk points, the frozen gates, and the bounded verdict.

## Expected bounded result

```text
accuracy (both):              0.70
moderate Brier:               0.0400
overconfident Brier:          0.2542
moderate 5-bin ECE:           0.2000
overconfident 5-bin ECE:      0.2620
selective-risk ordering:      identical
verdict:                      GO_EVALUATOR_MECHANICS_ONLY
```

## Fail closed

Reproduction fails if the retained evidence is missing, independent recomputation disagrees with the stored metrics, the moderate policy does not beat the overconfident control on Brier/ECE, ranking-only selective risk changes despite identical confidence ordering, or the result is promoted beyond the synthetic claim boundary.

See `../evidence/manifest.json` for immutable Git blob identities of the source, protocol, retained evidence and independent QA path.
