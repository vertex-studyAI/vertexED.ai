# Project 2424 — Registry Identity Audit

**Date:** 2026-08-11  
**Source of truth:** `portfolio/project2424/FIRST_100_QUEUE.ndjson`

## Invariant

A First-100 project ID is an immutable registry identity, not a convenient slot for the next implementation. A package may evolve, but its ID/name relationship must remain traceable to the frozen queue. Auxiliary portfolio infrastructure must use an auxiliary identity rather than occupying a First-100 ID.

## Confirmed collisions in the recent execution wave

| ID | Frozen First-100 identity | Conflicting implementation | Evidence state | Repair action |
|---|---|---|---|---|
| `T2424-0049` | Multiphase Porous JEPA | Project24 Render | renderer merged on prior `main` via PR #190 | preserve renderer under `portfolio/project2424/tools/project24-render/`; restore `T2424-0049` to Multiphase Porous JEPA; require exact-head CI before promotion |
| `T2424-0050` | Darcy Latent Operator | Benchmark Augmentation Theory | replacement PR #193 exact-head CI green but still open | **do not merge under `T2424-0050`**; rehome the benchmark audit under a non-colliding identity before any merge |

## Control examples checked

- `T2424-0046` → Auto-Research Foundry: aligned.
- `T2424-0053` → Scientific Motif Dictionary: aligned.
- `T2424-0054` → Theory-Manifold Experiment Planner: aligned.

These examples do not prove the rest of the registry is collision-free; they establish the immediate repair boundary for observed recent work.

## Counting rule

A package must not increase First-100 runnable/tested/completed counts when:

1. its implementation name does not correspond to the frozen registry identity;
2. two different canonical-looking packages compete for the same ID; or
3. the evidence ledger cannot identify which package owns the ID.

A useful collided artifact should be preserved and rehomed, not deleted or retroactively relabeled as the registry project.

## Current repair

Branch `agent/p2424-0049-identity-repair-20260811`:

- preserves Project24 Render as `AUX-P2424-PROJECT24-RENDER`;
- restores `portfolio/project2424/projects/T2424-0049/` to Multiphase Porous JEPA;
- adds a deterministic synthetic porous-flow latent prediction experiment;
- adds a persistence baseline, held-out conditions, conservation gate, zero-dynamics negative control, and regression suite;
- leaves scientific/research-complete claims closed until stronger external evidence exists.

## Next integrity gate

Add a repository-level machine-readable identity manifest and CI check that rejects duplicate IDs or a package-to-registry identity mismatch before future First-100 PRs can merge.
