# Project24 Render — auxiliary Project 2424 tool

Project24 Render is a static, evidence-preserving portfolio renderer for Project 2424 records.

## Identity

This is an **auxiliary portfolio tool**, not a First-100 registry project. It was originally merged under `T2424-0049`, but the frozen First-100 registry assigns `T2424-0049` to **Multiphase Porous JEPA**. This repair preserves the useful renderer while restoring the registry ID to its canonical project.

Auxiliary identity: `AUX-P2424-PROJECT24-RENDER`.

## Goal

Turn structured project evidence into readable HTML/JSON without inferring completion or scientific validity from presentation quality.

Allowed evidence states are deliberately bounded:

- `MERGED_TESTED`
- `REVIEW_READY`
- `NEGATIVE_OR_INCONCLUSIVE`
- `EXECUTION_READY`
- `BLOCKED`

There is no generic `COMPLETE` state. Certified completion is counted only when a supplied record explicitly sets `certifiedComplete: true`.

## Run

```bash
node portfolio/project2424/tools/project24-render/experiment/run.mjs
```

The command reads the bundled evidence snapshot and writes `project24.html` and `project24.json` under the tool's `results/` directory.

## Test

```bash
node --test tests/project2424Project24Render.test.mjs
```

## Claim boundary

This renderer does not inspect GitHub, run tests, prove claims, verify publications, deploy projects, or decide whether a project is scientifically complete. It renders supplied evidence records and preserves their boundaries.

## Safety boundary

- no network requests;
- no shell execution;
- no deployment;
- no secret handling;
- supplied text is escaped before HTML rendering;
- no automatic completion promotion.
