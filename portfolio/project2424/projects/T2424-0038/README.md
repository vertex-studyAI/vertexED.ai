# T2424-0038 — Obscured Records Agent

A deterministic editorial research-triage tool for deciding which story leads are ready for deeper reporting and which must be held for verification.

## What this package does

- validates structured story leads and source records;
- distinguishes repeated citations from genuinely independent publishers;
- tracks primary-source coverage and source-type diversity;
- computes a transparent evidence/freshness/novelty/impact/risk score;
- applies hard verification blockers before ranking;
- requires stricter corroboration for high-risk claims;
- creates a deterministic decision ledger for editorial review.

The important design choice is **fail-closed reporting readiness**: a high-scoring rumor with weak corroboration stays on hold instead of being promoted because it is novel or high impact.

## Run

```bash
node portfolio/project2424/projects/T2424-0038/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424ObscuredRecordsAgent.test.mjs
```

The repository canonical test gate also discovers the regression file.

## Input shape

```js
{
  id: 'lead-id',
  title: 'Short working title',
  claim: 'The factual claim being evaluated',
  novelty: 0.0,   // to 1.0
  impact: 0.0,    // to 1.0
  risk: 0.0,      // to 1.0
  ageHours: 12,
  sources: [
    {
      publisher: 'agency.gov',
      primary: true,
      sourceType: 'official',
      evidence: 0.95
    }
  ]
}
```

## Hard blockers

A lead is `HOLD_FOR_VERIFICATION` when any of these minimum conditions fail:

- fewer than two independent publishers;
- for risk >= 0.7, fewer than three independent publishers;
- for risk >= 0.7, no primary source;
- mean source-evidence quality below 0.45.

These are conservative defaults for the prototype, not universal journalism standards.

## Limitations

- source `evidence` values are supplied inputs, not automatically verified truth scores;
- publisher independence is approximated by normalized publisher identity and does not resolve corporate ownership graphs;
- freshness uses a simple exponential half-life;
- the tool does not fetch sources, fact-check claims, detect defamation, assess legal exposure, or replace editorial judgment;
- the weights and blocker thresholds are transparent heuristics, not learned or externally validated;
- no autonomous publication action exists.

## Claim boundary

This package demonstrates reproducible editorial triage mechanics. It does **not** establish factual truth, journalistic quality, legal safety, newsroom productivity improvement, or autonomous reporting capability.

## Next evidence gate

Freeze a labeled set of historical leads with retrospective editor decisions, predeclare ranking/calibration metrics, compare this transparent heuristic against simple baselines, audit false promotions/holds, and independently review whether source-independence assumptions are defensible.
