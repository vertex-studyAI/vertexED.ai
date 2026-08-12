# T2424-0040 — FinanceMeta Learning Graph

A deterministic prerequisite-aware scheduling tool for a directed learning graph, packaged as a controlled Project 2424 experiment.

## What is implemented

`src/core.mjs` provides:

- graph validation for duplicate IDs, missing prerequisites, self-dependencies and cycles;
- mastery-threshold prerequisite checks;
- deterministic prerequisite-aware recommendation;
- a prerequisite-blind utility-only baseline;
- deterministic policy simulation with retained violation counts.

The frozen six-node experiment is intentionally small enough to inspect line by line.

## Run

```bash
node portfolio/project2424/projects/T2424-0040/experiment/run.mjs
```

The checked-in output is:

`evidence/results.json`

Its SHA-256 is pinned in `evidence/manifest.json`.

## Verify without importing the scheduler

```bash
node portfolio/project2424/projects/T2424-0040/reproduction/verify.mjs
```

The verifier re-hashes the retained result and independently recomputes unmet prerequisites and violation counts from the stored selection sequence. It does not import `src/core.mjs`.

## Frozen controlled result

- prerequisite-aware policy: `0` violating selections, `0` unmet prerequisite edges, `6 / 6` concepts completed;
- utility-only negative control: `5` violating selections, `7` unmet prerequisite edges, `6 / 6` concepts completed;
- verdict: `PASS_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS`.

See `CLAIM.md`, `PROTOCOL.md`, `analysis/baseline.md`, and `analysis/verdict.md` for the exact gate and interpretation.

## Certification state

`certification-manifest.json` deliberately remains `CERTIFICATION_PENDING`. It treats the controlled claim/protocol/run/baseline/raw result/negative control/verdict/separate verifier as present, but leaves immutable merged source identity unresolved until integration produces a canonical commit.

This package must not be called `CERTIFIED_COMPLETE` merely because its synthetic mechanics tests pass.

## Boundary

The concept labels are finance-related, but the experiment contains no learner data and does not validate FinanceMeta pedagogy, finance knowledge, engagement, retention, personalization, optimal sequencing or learning outcomes.
