# VertexED Repository Isolation — 2026-09-02

This branch is a non-destructive cleanup surface for VertexED.

## Preservation guarantees

- The mixed repository state at `main@7c99ca4d5228ea1b1cc7a661d3a5df2b202c132e` is preserved at `archive/mixed-main-20260902`.
- A pre-portfolio historical VertexED baseline is preserved at `cleanup/vertexed-pure-baseline-20260902` from `eaef7e6cbb7129c030cd28c600089777baeecd14`.
- No NeuroCAD, Project 2424, Percy, Bu1LD, FinanceMeta, IRIS, NGMT, Olympus, LAM-JEPA, Obscured Records, outreach, research, or portfolio artifact has been deleted in this cleanup step.

## Canonical VertexED runtime boundary

Treat the following as the VertexED application surface unless a later reviewed migration explicitly changes the boundary:

- `src/`
- `api/`
- `supabase/`
- `evals/` when evaluating VertexED/Apex behavior
- VertexED-specific files in `e2e/`, `tests/`, `scripts/`, `public/`, and `docs/`
- application/build configuration at repository root (`package.json`, Vite/TypeScript/Tailwind/PostCSS/Vercel configuration)

## Quarantined cross-project material

The following material remains present only so nothing is lost. It is not part of the VertexED application boundary and must not be wired into VertexED build, deploy, runtime, product QA, or release certification:

- `portfolio/` and Project 2424 projects, including T2424-0037 / NeuroCAD
- generic `research/` material unrelated to VertexED
- `.percy/` and Percy runtime/reliability artifacts
- Bu1LD and FinanceMeta recovery/certification workflows
- NeuroCAD workflows, browser tests, OpenSCAD QA, publishing scripts, public artifacts, manuscripts, and outreach evidence
- IRIS, NGMT, Olympus, LAM-JEPA, Obscured Records, and other portfolio research artifacts
- generic portfolio ledgers, queues, checkpoints, status documents, submission matrices, and research evidence files

## Change made in this branch

`package.json` no longer executes `scripts/publish-neurocad-alpha.mjs` during VertexED `prebuild`. This removes the direct NeuroCAD -> VertexED deployment coupling while preserving the NeuroCAD script and all source/evidence files unchanged.

## Next cleanup rule

Future cleanup should migrate quarantined material to its correct repository or archival branch before removing it from the VertexED working tree. Do not delete preserved research or operational evidence merely to make this tree visually smaller.
