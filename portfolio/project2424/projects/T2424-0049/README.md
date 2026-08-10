# T2424-0049 — Project24 Render

A static, evidence-preserving portfolio renderer for Project 2424 records.

## Goal

Turn structured project evidence into a readable HTML/JSON snapshot **without inferring completion or scientific validity from presentation quality**.

## Record contract

Every rendered project must provide:

- `id`
- `name`
- `type`
- one explicit state
- an inspectable artifact path or explicit URL
- an explicit verdict
- a claim boundary
- optional exact head / CI run identity
- optional `certifiedComplete: true`

Allowed states are intentionally narrower than free-form marketing copy:

- `MERGED_TESTED`
- `REVIEW_READY`
- `NEGATIVE_OR_INCONCLUSIVE`
- `EXECUTION_READY`
- `BLOCKED`

There is **no generic `COMPLETE` state**. Certified completion is counted only when the supplied record explicitly sets `certifiedComplete: true`.

## Outputs

`renderPortfolioHtml()` produces an accessible static table and evidence summary.

`renderPortfolioJson()` produces the same normalized/sorted records for machines.

All supplied text is HTML-escaped before rendering. Portfolio artifact paths become root-relative links; explicit HTTP(S) artifact URLs are preserved.

## Run the grounded demo

```bash
node portfolio/project2424/projects/T2424-0049/experiment/run.mjs
```

By default this reads `experiment/demo-records.json`, an evidence snapshot of seven Project 2424 packages that had merged and passed exact-head CI by the time this package was authored.

It writes:

```text
portfolio/project2424/projects/T2424-0049/results/project24.html
portfolio/project2424/projects/T2424-0049/results/project24.json
```

You can also provide another records file and output directory:

```bash
node portfolio/project2424/projects/T2424-0049/experiment/run.mjs records.json output-dir
```

## Test

```bash
node --test tests/project2424Project24Render.test.mjs
```

Regression coverage includes:

- HTML escaping;
- no completion inference from `MERGED_TESTED`;
- explicit certification only;
- deterministic state/ID sorting;
- evidence identity retention;
- fail-closed invalid states/artifact locations.

## Claim boundary

This renderer does not inspect GitHub, run tests, prove claims, verify publications, deploy projects, or decide whether a project is scientifically complete. It renders **supplied evidence records** and preserves their boundaries.

A polished page generated from weak records is still weak evidence.

## Safety boundary

- no network requests;
- no shell execution;
- no deployment;
- no secret handling;
- no HTML injection from supplied text;
- no automatic completion promotion.

## Next evidence gate

Generate records directly from a machine-readable Project 2424 evidence ledger, validate artifact existence and exact-head CI identities before rendering, add accessibility checks on generated HTML, and publish only through a separately authorized deployment path.
