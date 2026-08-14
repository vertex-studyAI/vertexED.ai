# PORTFOLIO_CANONICALIZATION

**Updated:** 2026-08-14 after Notes-to-Video evidence correction, Darcy v2 protocol freeze, and source-gated registry reconciliation  
**Purpose:** one source of truth per project/claim; preserve provenance while ending duplicate active work.

## Canonical truth hierarchy

| Scope | Canonical source | Rule |
|---|---|---|
| Cross-portfolio status/claims/queues/blockers | `vertex-studyAI/vertexED.ai` default branch | control docs summarize evidence; project-native artifacts win on raw results |
| Human A–F portfolio disposition table | `PORTFOLIO_SNAPSHOT_20260814.md` + same-day delta pointer `PORTFOLIO_SNAPSHOT.md` | do not create a competing same-day human registry table |
| Machine-readable portfolio identity/disposition companion | `MASTER_PORTFOLIO_REGISTRY.json` | derived/subordinate to the human snapshot and current canonical deltas; unresolved discoveries remain separate candidates |
| Project 2424 machine-readable ID map | `PROJECT_2424_CANONICAL_MAP.json` | partial until preserved canonical host source/overlay is recovered; unknown IDs stay unknown |
| Project 2424 human disposition view | `PROJECT_2424_DISPOSITION_MATRIX.md` | only directly evidence-backed IDs receive A–F states before source recovery |
| LAM-JEPA science/manuscript | `vertex-studyAI/LAM-JEPA` default branch | frozen protocols/artifacts + negative manuscript are authoritative |
| VertexED product source | `vertex-studyAI/vertexED.ai` source tree | source and production state separate |
| VertexED Notes-to-Video child subsystem | `vertex-studyAI/Text-To-Video` default branch | local media/queue/storage evidence belongs under VertexED; local subsystem evidence is not production evidence |
| VertexED production | served deployment + monitor/journey evidence | CI/Vercel status alone cannot certify served revision |
| Project 2424 research | preserved canonical source + standalone child evidence | registry/count is not completion |
| Percy runtime | existing Percy SQLite/WAL/checkpoints on real host | GitHub specs are not live queue/process truth |
| FinanceMeta / The Bu1LD | canonical targets once authorized | control-repo overlays cannot certify target state |

## Canonical control files

`MASTER_STATUS.md`; `RESEARCH_STATUS.md`; `PORTFOLIO_SNAPSHOT.md`; `PORTFOLIO_CANONICALIZATION.md`; `MASTER_PORTFOLIO_REGISTRY.json` with pointer `MASTER_PORTFOLIO_REGISTRY.md`; `PROJECT_2424_CANONICAL_MAP.json`; `PROJECT_2424_DISPOSITION_MATRIX.md`; `CLAIM_LEDGER.md/json`; `EXPERIMENT_LEDGER.md/json`; `RESEARCH_FAILURE_ATLAS.md`; `EXTERNAL_VALIDATION_QUEUE.md`; `SUBMISSION_MATRIX.md`; `ARCHIVE_AND_KILL_LIST.md`; `30_DAY_EXECUTION_PLAN.md`; `NEXT_TASK_QUEUE.md/json`.

Do not create a second experiment registry, live queue, or competing same-day A–F table. Older `NEXT_48H_QUEUE`, `EXECUTION_QUEUE`, checkpoints and closeouts are history/provenance. `MASTER_PORTFOLIO_REGISTRY.md` is only a pointer/coverage contract; the machine-readable registry is JSON and the human dispositions remain in the dated snapshot.

## Semantic overlap / identity decisions

| A | B | Decision | Boundary |
|---|---|---|---|
| Project 2424 registry | child experiments | **PARENT/CHILD** | children earn scientific status independently |
| NLP-to-CAD variants | NeuroCAD | **MERGE** | one CAD line; no renamed parallel projects |
| NeuroCAD v1 | component v2 | **VERSIONED EVIDENCE, NOT REPLACEMENT** | v1 `19/20 vs12/20` history remains; v2 shows validation closes current gap and falsifies typed-parser causal interpretation on reused diagnostic |
| FI-JEPA | Eigen-JEPA/finance representation | **MERGE/PARENT-CHILD** | no second flagship without distinct hypothesis |
| T2424-0025 | NGMT | **DISTINCT RELATED** | precursor robust readout cannot be called NGMT success |
| APEN | PEN | **DISTINCT** | APEN evidence does not transfer to PEN |
| Research Atlas V4 | child reruns | **REPRO CONTAINER** | packaging is not independent novelty |
| LAM repairs | frozen LAM conclusion | **VERSIONED HISTORY** | engineering repair cannot rescue frozen scientific result |
| IRIS successor | IRIS v0.2 | **NEW VERSION REQUIRED** | current architecture search closed; baseline frontier first |
| NGMT successor | NGMT v0.1 | **NEW VERSION REQUIRED** | no v0.1 rescue |
| Text-to-Video / Notes-to-Video V6 | VertexED | **PARENT/CHILD** | retain verified local media/queue/storage engineering as a VertexED subsystem; archive standalone product expansion; do not infer production or user validation |
| Darcy parent screen | Darcy learned/OOD v2 | **VERSIONED PROTOCOL** | parent aligned 24-cell/6-block result remains immutable; `DARCY-FREEZE-001` is frozen before any v2 learned/OOD outcome and must not inherit a positive result from the parent |
| stale agent/status/repro branches | default branch | **ARCHIVE HISTORY** | branch existence is not active work |
| PR #319 | current control main | **ARCHIVED CLOSED** | superseded/divergent; history retained |

## Active compression

### Tier S — 3
- LAM-JEPA — negative-result paper/reproducibility closure.
- IRIS — negative/tradeoff consolidation; no successor architecture yet.
- Percy — live-state/reliability qualification.

### Tier A
Darcy; NeuroCAD product + fresh research gate only; T2424-0025; NGMT negative package; APEN; Eigen-JEPA; NPMS; VertexED production qualification.

### No significant compute until gate changes
NeuroCAD parser rescue on old 20 cases; Hercules; Olympus; T2424-0028/0029/1863 beyond packaging; PEN without source; duplicate 2424/CAD variants; standalone Text-to-Video expansion; un-frozen new research branches.

## Darcy protocol law

`portfolio/project2424/projects/T2424-0050/LEARNED_OPERATOR_OOD_PROTOCOL_V2.md` is the canonical pre-outcome freeze for the next Darcy study. No v2 training/test outcome is authorized until the implementation, environment, split manifest, model budget and dataset hashes required by that protocol are committed. Any material change after outcome inspection becomes a new protocol version.

## Promotion law

A project is promoted only by retained evidence that passes its exact missing gate. A dangerous baseline that closes the gap triggers demotion or negative-result conversion. No project is promoted to fill an empty Tier-S slot.
