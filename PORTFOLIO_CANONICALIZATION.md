# PORTFOLIO CANONICALIZATION

**Date:** 2026-08-14  
**Purpose:** reduce duplicate/near-duplicate work and establish one canonical evidence location and one active state per serious project.

## Canonicalization rules

1. A project name is not a scientific contribution.
2. A portfolio/registry is not itself a scientific experiment.
3. A precursor screen is not a learned-model result.
4. A frozen failed version remains a negative result; a changed mechanism is a successor project/version.
5. Duplicate repositories may remain for provenance but only one location is authoritative for current status.
6. No archived item is deleted. Archive means no significant compute/engineering allocation in the next 30 days unless a new evidence-backed gate is approved.

## Semantic project graph

| A | B | Relationship | Canonical decision |
|---|---|---|---|
| Project 2424 umbrella | T2424-0025 / T2424-0027 / Darcy T2424-0050 / T2424-1863 / other numbered items | PARENT/CHILD | Keep Project 2424 as provenance registry only; children carry scientific states independently. |
| T2424-0025 robust-readout precursor | NGMT v0.1 | PARENT/CHILD evidence | 0025 is precursor/mechanism evidence; NGMT v0.1 is the learned equal-budget test. Do not inherit a positive Transformer claim from 0025. |
| IRIS v0.2 | any IRIS successor | DISTINCT VERSIONED SUCCESSOR | v0.2 stays frozen negative/mixed. A successor requires a new hypothesis, mechanism, falsifier and preregistration. |
| `build-the-future-11/IRIS` | control-repo IRIS evidence package | ARCHIVE ONE / CANONICALIZE | Visible standalone repo is empty-size and does not supersede the evidence in `vertex-studyAI/vertexED.ai/portfolio/research` and retained artifacts. |
| FinanceMeta product | `build-the-future-11/finance4all-global-reach` | CANONICAL | This is the canonical portal target for engineering/security work. |
| FinanceMeta showcase | `build-the-future-11/FinanceMeta-Global` | DISTINCT / ARCHIVE AS SHOWCASE | It is a gallery/showcase repo, not the canonical member portal. Its `FI-JEPA` subfolder is a stub, not a serious active research implementation. |
| `vertexed25-byte/FinanceMeta-Global` | canonical FinanceMeta product | ARCHIVE ONE | Tiny/read-only duplicate surface; preserve provenance but do not use for current product status. |
| FinanceMeta landing | `build-the-future-11/FinanceMeta-Landing` | CHILD | Landing/marketing surface; product engineering status belongs to canonical portal unless a deployment specifically uses this repo. |
| The Bu1LD product | `ryangomez010/bu1ld-landing` | CANONICAL | Current product source target. |
| The Bu1LD research repos | `THE-BU1LD/*` research repositories | DISTINCT | Do not fold independent research repos into product-release status; each needs its own hypothesis/evidence before promotion. |
| LAM-JEPA | generic JEPA/time-series ideas | DISTINCT | LAM-JEPA is a frozen ARC negative result. A time-series JEPA programme must be separately preregistered and cannot inherit LAM claims. |
| Eigen-JEPA | future JEPA×time-series candidate | PARENT/CHILD only if same hypothesis | Current Eigen-JEPA frozen primary target is negative; future TS work must define a different question if continued. |
| Hercules | Olympus | DISTINCT but both inactive | Different architecture/system questions; both lack matched scientific evidence and receive no next-month compute. |

## Scoring model

Each dimension is scored `0–5`: scientific importance, originality, evidence strength, reproducibility, baseline strength, result robustness, implementation quality, paper potential, product potential, external-validation potential, compute feasibility, time-to-closure, negative-result value, strategic portfolio value.

The closure priority is not a prestige score. It favors defensible output using:

`impact × evidence × probability_of_closure ÷ remaining_cost`

where impact combines scientific/product/paper/external/strategic value, evidence combines evidence/reproducibility/baselines/robustness/implementation, probability of closure uses reproducibility/time-to-closure/external-validation tractability, and remaining cost increases as compute feasibility and time-to-closure worsen. Scores below are normalized within this audited set and are used only for ordering work, not for scientific claims.

## Dimension scores and tiers

Legend order: `SI O ES R BS RR IQ PP PrP EV CF TC NR SV`.

| Project | 14 scores | Closure priority /100 | Tier | Canonical state |
|---|---|---:|---|---|
| LAM-JEPA | `4 3 5 5 4 4 5 5 0 4 5 5 5 5` | 100 | **S** | A — PUBLISH |
| NeuroCAD | `4 4 4 4 3 4 5 5 4 4 5 4 2 5` | 52 | **S** | C — CONTINUE EXPERIMENTATION |
| VertexED | `2 2 4 4 4 4 5 1 5 5 5 4 0 5` | 51 | **S** | F — EXTERNALLY BLOCKED |
| Percy | `3 4 4 3 3 3 5 3 5 5 4 3 1 5` | 26 | **S** | B — PRODUCTIZE |
| NGMT v0.1 | `4 3 5 5 4 4 4 4 1 3 5 5 5 4` | 76 | **A** | D — NEGATIVE RESULT |
| T2424-1863 | `3 2 5 5 3 4 4 3 1 3 5 5 5 3` | 57 | **A** | D — NEGATIVE RESULT |
| Eigen-JEPA | `4 3 4 4 4 4 4 4 1 4 5 4 5 4` | 45 | **A** | D — NEGATIVE RESULT |
| IRIS v0.2 | `4 3 4 4 4 4 4 4 1 3 5 4 5 4` | 39 | **A** | D — NEGATIVE RESULT |
| T2424-0027 | `4 4 4 4 3 4 4 4 1 4 5 3 1 4` | 31 | **A** | C — CONTINUE EXPERIMENTATION |
| NPMS | `4 3 4 4 3 3 4 4 1 4 5 3 2 4` | 28 | **A** | C — CONTINUE EXPERIMENTATION |
| APEN | `4 3 4 4 3 3 4 4 1 3 5 3 4 4` | 24 | **A** | C — CONTINUE EXPERIMENTATION |
| Darcy T2424-0050 | `4 3 4 4 2 4 4 4 2 4 4 3 2 4` | 22 | **A** | C — CONTINUE EXPERIMENTATION |
| The Bu1LD | `2 2 3 3 3 3 4 0 5 5 5 3 0 4` | 23 | **A** | F — EXTERNALLY BLOCKED |
| FinanceMeta | `2 2 2 2 1 1 3 0 5 5 5 3 0 4` | 12 | **A** | B — PRODUCTIZE |
| PEN | `3 3 2 1 2 2 3 3 1 2 5 2 2 3` | 4 | B | F — EXTERNALLY/SOURCE BLOCKED |
| T2424-0025 precursor | `3 2 4 4 3 4 4 2 1 2 5 5 2 3` | 37 | B | E — ARCHIVE AS STANDALONE / child evidence |
| T2424-0028 | `2 2 4 4 2 4 4 2 1 2 5 4 1 2` | 18 | B | E — ARCHIVE |
| T2424-0029 | `3 2 4 4 2 4 4 2 1 2 5 4 1 3` | 21 | B | E — ARCHIVE |
| Hercules | `4 3 1 2 1 1 3 3 2 3 3 2 1 3` | 4 | **ARCHIVE** | E — ARCHIVE / compute freeze |
| Olympus | `3 2 1 2 1 1 3 2 2 3 4 2 1 3` | 4 | **ARCHIVE** | E — ARCHIVE / compute freeze |
| Project 2424 umbrella | n/a — registry, not one scientific hypothesis | n/a | **ARCHIVE** as active effort | E — provenance parent only |
| FinanceMeta-Global/FI-JEPA stub | insufficient implementation/evidence | n/a | **ARCHIVE** | E — ARCHIVE |
| standalone empty IRIS repo | no independent evidence package | n/a | **ARCHIVE** | E — ARCHIVE as non-canonical surface |

### Why high negative-result scores do not automatically become Tier S

NGMT v0.1 and T2424-1863 score highly on closure because their negative gates are cleanly reproducible and cheap to close. Tier S is capped further by likely external value and manuscript/product leverage. They should be packaged efficiently, not consume flagship experimental bandwidth.

## Frozen Tier S allocation

Only four flagships are active for this wave:

1. **LAM-JEPA** — paper conversion; no new scientific tuning.
2. **NeuroCAD** — one decisive learned baseline + OOD/generalization attack.
3. **VertexED** — exact production identity + authenticated external certification, not feature expansion.
4. **Percy** — reliability qualification against the existing host state; no agent-count escalation.

No fifth flagship is promoted yet. The fifth slot stays empty until a Tier A effort clears a decisive gate.

## Tier A promotion gates

- **IRIS:** keep v0.2 negative; successor only after full freeze and stronger change-aware baselines.
- **T2424-0027:** real multilingual encoder + preregistered probes/controls.
- **Darcy:** matched-budget learned operator + OOD/held-out physical regimes.
- **APEN:** matched learned baseline + naturalistic task + frozen salience-quality stress.
- **NPMS:** stronger learned memory controls + natural/OOD task.
- **Eigen-JEPA:** current version remains negative; any successor needs stronger spectral baselines and a new frozen protocol.
- **NGMT/T2424-1863:** package negative results; do not consume successor compute without a separately justified new question.
- **FinanceMeta/Bu1LD:** close security/deployment/reliability gates before feature development.

## Canonical source-of-truth policy

The control repo `vertex-studyAI/vertexED.ai` remains the portfolio-level source of truth for `MASTER_STATUS`, `RESEARCH_STATUS`, claim/experiment/reproducibility/failure ledgers, closure snapshot, canonicalization, submission matrix, external-validation queue, kill list and next queue. Project-specific raw artifacts and source remain in their canonical project repositories/artifact stores; the control repo must link/identify them rather than duplicate raw evidence.
