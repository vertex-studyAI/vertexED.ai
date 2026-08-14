# PORTFOLIO_CANONICALIZATION

**Established:** 2026-08-14 12:01 IST  
**Purpose:** one source of truth per project or claim family; preserve provenance while ending duplicate active work.

## Canonical truth hierarchy

| Scope | Canonical source | Rule |
|---|---|---|
| Cross-portfolio status, claims, queues and blockers | `vertex-studyAI/vertexED.ai` default branch | Control documents describe evidence; they do not override project-native artifacts. |
| LAM-JEPA science and manuscript artifacts | `vertex-studyAI/LAM-JEPA` default branch | Scientific claims trace to frozen protocol + retained artifacts + project-native audit. |
| VertexED product source | `vertex-studyAI/vertexED.ai` product source tree | Source state and production state remain separate. |
| VertexED production | served deployment + production monitor evidence | GitHub/Vercel commit status alone cannot certify the served revision. |
| Project 2424 canonical research source | preserved Project 2424 Git source identified in issue #20, not duplicated control-repo wrappers | Control repo may retain recovery/evidence packages; it is not allowed to inflate project completion counts. |
| Percy runtime state | existing Percy SQLite/WAL/checkpoints on the real host | GitHub registry specifications are not live queue/process truth. |
| FinanceMeta / The Bu1LD | their canonical target repos and production systems once authorized | Control-repo overlays remain preparation artifacts until applied and verified on target. |

## Canonical control files

- `MASTER_STATUS.md` — portfolio state summary.
- `RESEARCH_STATUS.md` — research-only maturity and evidence boundary.
- `PORTFOLIO_SNAPSHOT.md` — scored current portfolio and tiering.
- `PORTFOLIO_CANONICALIZATION.md` — identity/overlap decisions.
- `CLAIM_LEDGER.md` + `CLAIM_LEDGER.json` — claim truth.
- `EXPERIMENT_LEDGER.md` + `EXPERIMENT_LEDGER.json` — canonical experiment registry. **Do not create a conflicting second `EXPERIMENT_REGISTRY`.**
- `RESEARCH_FAILURE_ATLAS.md` — preserved failures and negative-result boundaries.
- `EXTERNAL_VALIDATION_QUEUE.md` — claims Percy cannot prove internally.
- `SUBMISSION_MATRIX.md` — evidence-to-release/venue fit.
- `ARCHIVE_AND_KILL_LIST.md` — work that receives no significant active compute.
- `30_DAY_EXECUTION_PLAN.md` — bounded campaign schedule.
- `NEXT_TASK_QUEUE.md` + `NEXT_TASK_QUEUE.json` — current execution order.

Older files such as `NEXT_48H_QUEUE.md`, `EXECUTION_QUEUE.md`, historical checkpoints and prior closeouts remain provenance/history, not competing live queues.

## Semantic overlap graph

| A | B | Decision | Canonical interpretation |
|---|---|---|---|
| Project 2424 registry | individual 2424 research projects | **PARENT/CHILD** | Registry is a portfolio/foundry container; scientific children stand on their own evidence. |
| T2424-0037 NLP-to-CAD variants | NeuroCAD | **MERGE / ARCHIVE DUPLICATE LINE** | All serious NLP-to-CAD research is represented by NeuroCAD's typed/validated IR question. Do not run parallel renamed CAD lines. |
| FI-JEPA variants | Eigen-JEPA / finance representation work | **MERGE / PARENT-CHILD** | Finance-specific implementation becomes a task/application beneath the canonical spectral/representation question; it is not a second flagship. |
| T2424-0025 robust readouts | NGMT | **DISTINCT BUT RELATED** | 0025 is a robust-readout precursor/diagnostic. NGMT v0.1 is a separately frozen learned B0/B1/B2/B3 experiment. 0025 cannot be relabeled as NGMT success. |
| APEN | PEN | **DISTINCT** | APEN evidence does not transfer to PEN. PEN remains blocked until standalone executable source/protocol is recovered. |
| Research Atlas V4 | contained project reruns | **PARENT/REPRODUCIBILITY CONTAINER** | Atlas proves a packaging/reproduction layer, not independent scientific novelty for every child project. |
| LAM-JEPA v3/v5/repair attempts | LAM-JEPA scientific conclusion | **PARENT/CHILD WITH IMMUTABLE HISTORY** | Software-repair attempts remain provenance; the frozen scientific verdict remains negative/inconclusive. |
| IRIS v0.2 | any successor | **PARENT/CHILD; NEW VERSION REQUIRED** | A failed development gate cannot be silently moved. A successor needs changed hypothesis, reason, falsifier and frozen protocol. |
| NGMT v0.1 | any NGMT successor | **PARENT/CHILD; NEW VERSION REQUIRED** | No in-place rescue. |
| dozens of `agent/*`, `repro-wave/*`, `status/*` branches | canonical default branch | **ARCHIVE HISTORY** | Branch existence is not active work. No new work should target a stale branch unless it contains unique unmerged evidence. |
| PR #319 Percy Prime closeout | current default branch control docs | **ARCHIVE ONE** | Closed unmerged 2026-08-14 because it was superseded/divergent; retained in Git history for provenance. |

## Branch and artifact policy

1. Do not mass-delete historical branches or artifacts. First establish that no unique evidence, result, patch or provenance exists only there.
2. New execution branches require one canonical task ID and one declared destination.
3. A second branch for the same task is allowed only for repair/rebase and must name the superseded branch in its evidence record.
4. Closed negative experiments remain immutable. New scientific mechanisms use new experiment IDs/versions.
5. A manuscript, README, CI badge or agent report cannot override a contradictory raw artifact.

## Project-state compression

### Active flagship set
- LAM-JEPA — paper/release conversion of a negative result.
- NeuroCAD — controlled positive story under stronger baseline/OOD attack.
- IRIS — negative-result consolidation; successor only if mechanism/falsifier justify it.
- Percy — reliability/provenance qualification, not worker-count expansion.

### Secondary active set
Darcy, T2424-0025, NGMT negative package, APEN, Eigen-JEPA, NPMS, VertexED production qualification.

### No significant compute until a gate changes
Hercules, Olympus, T2424-0028, T2424-0029, T2424-1863 beyond negative packaging, PEN without source recovery, Text-to-Video without an explicit owner/question, duplicate Project 2424 variants.

## Promotion law

A project is promoted only when the specific missing gate is passed with retained evidence. A project is demoted or archived when a dangerous baseline defeats it, a claimed mechanism is not isolated, the question is duplicative, or external evidence is the only remaining dependency.
