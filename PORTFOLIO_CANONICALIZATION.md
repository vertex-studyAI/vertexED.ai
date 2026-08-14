# PORTFOLIO CANONICALIZATION

**Snapshot basis:** `PORTFOLIO_SNAPSHOT_20260814.md`  
**Rule:** preserve evidence; canonicalize identities and control surfaces, not history.

## Canonical source-of-truth map

| Project / surface | Canonical source for this campaign | Duplicate / alias handling | Decision |
|---|---|---|---|
| Portfolio control/status | `vertex-studyAI/vertexED.ai` root ledgers (`FINAL_STATUS_2200.md`, `MASTER_STATUS.md`, `RESEARCH_STATUS.md`, `CLAIM_LEDGER.md`, this snapshot) | Older `research/24h/*` rollups are historical evidence, not higher authority than current root closeout. | **PARENT/CHILD** — root control ledgers are canonical; historical rollups retained. |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA`, current main `88f759ef…`; scientific head/provenance retained in attempt-4 audit | Do not fork a positive rescue line from the frozen ARC result. | **DISTINCT** dedicated research repo. |
| IRIS v0.2 / PABIM | Control-repo IRIS evidence plus durable Library bundle `IRIS_common_adaptation_harness_v1_negative_20260813.zip`; negative branch `agent/iris-common-adaptation-negative-20260813` | Prior scalar/PCRW/PABIM development lineages remain provenance. A successor is a new version, never a silent rename. | **PARENT/CHILD** — IRIS family parent; v0.2/PABIM current candidate is frozen negative child. |
| Project 2424 | Control-repo Project 2424 ledgers/artifact references until the real local canonical source is recovered | Do not equate proposal count, worktrees, `_migrations` copies, or frozen-source bundles with distinct completed projects. | **PARENT/CHILD** — umbrella is registry/repro infrastructure; scientific IDs are children. |
| T2424-0025 precursor / NGMT v0.1 | Keep robust-readout precursor and learned NGMT v0.1 as separate evidence lineages | Robust median/readout evidence cannot be claimed as a Transformer-memory mechanism result. | **PARENT/CHILD** — precursor informs NGMT, does not certify it. |
| NeuroCAD | T2424 child / dedicated evidence package within current control/Atlas state | Direct baseline and structured-IR pipeline are experimental arms, not separate projects. | **DISTINCT** scientific/product child. |
| Darcy | Canonical ID **T2424-0050** | Benchmark Augmentation Theory remains auxiliary; do not reassign T2424-0050. | **DISTINCT** child. |
| APEN / PEN | Maintain APEN evidence separately from PEN | PEN cannot inherit APEN status, tests or results. | **DISTINCT** — never merge evidence. |
| Eigen-JEPA | Current retained real-data/spectral evidence lineage | Stronger classical baselines are controls, not new projects. | **DISTINCT**. |
| NPMS | Current retained controlled/learned companion evidence | Coordinate-invariant parameter control is an ablation/control. | **DISTINCT**. |
| T2424-0027 | Synthetic leakage audit is the current bounded project; real-encoder extension is the next gate | Do not create a separately named “real multilingual” project before the gate is run. | **PARENT/CHILD** within one canonical ID/version lineage. |
| T2424-0028 | Event-count/reconstruction mechanics | Baseline variants remain experiment arms. | **DISTINCT**. |
| T2424-0029 | PDE-transition analytic screen | Grid/energy/nonlinear variants remain experiment arms. | **DISTINCT**. |
| T2424-1863 | Exact-head local-diffusion negative screen | A real-PDE learned-operator successor must be separately frozen/versioned. | **DISTINCT** frozen negative child. |
| Research Atlas V4 | Artifact/reproducibility infrastructure | Manuscript rebuilds and project bundles are outputs, not separate scientific projects. | **PARENT/CHILD** infrastructure parent. |
| VertexED | `vertex-studyAI/vertexED.ai` for source; exact served deployment identity is a separate production state | Never merge source-GREEN and production-GREEN. | **DISTINCT STATES, ONE PRODUCT**. |
| FinanceMeta | **UNRESOLVED canonical target** from connected GitHub | Certified overlays/packages are not the canonical deployed target. | **F — EXTERNALLY BLOCKED** until target is recovered. |
| The Bu1LD | **UNRESOLVED canonical target** from connected GitHub | A health workflow inside the control repo does not prove canonical source/deployment ownership. | **F — EXTERNALLY BLOCKED** until target is recovered. |
| Percy | Local canonical root `/Volumes/PRO-BLADE/Atlas/Percy`; durable DB reported as `control-plane/memory/percy.db` | `mega-network-control/` is a parallel/duplicate control implementation and source of ideas only; `.worktrees` and `_migrations` are noncanonical copies unless explicitly promoted. | **ARCHIVE ONE / PARENT-CHILD** — SQLite control plane is canonical; parallel queue is noncanonical. |
| Hercules | Canonical source/mechanism not sufficiently recovered | Do not create renamed variants to manufacture a canonical project. | **ARCHIVE** pending a cheap falsifiable gate. |
| Olympus | O0 roadmap/runtime only | Do not treat model-scale names as trained systems. | **ARCHIVE** for next 30 days. |
| Text-To-Video | Accessible repo but no current flagship evidence/claim | Do not promote because it happens to be accessible. | **ARCHIVE**. |

## Strong-overlap decisions

1. **IRIS versions:** `PARENT/CHILD`. Failed v0.2/PABIM stays frozen. Any new mechanism is a versioned successor with a changed-hypothesis record.
2. **T2424-0025 ↔ NGMT:** `PARENT/CHILD`, not MERGE. The robust-readout precursor exposed a confound; NGMT v0.1 then tested a learned equal-budget version and failed its gates.
3. **APEN ↔ PEN:** `DISTINCT`. Similar naming is not evidence equivalence.
4. **Project 2424 umbrella ↔ child experiments:** `PARENT/CHILD`. The umbrella is registry/repro infrastructure, not a scientific claim.
5. **Research Atlas ↔ project evidence bundles:** `PARENT/CHILD`. Atlas packages evidence but does not own the scientific claim.
6. **Percy SQLite control plane ↔ `mega-network-control`:** `ARCHIVE ONE` as an execution authority. Preserve the latter as reference code; do not run two canonical queues.
7. **Hercules ↔ Olympus:** `DISTINCT but ARCHIVED`. Both lack enough matched-budget evidence to justify active compute; Olympus is not a promotion of Hercules evidence.
8. **VertexED source ↔ production:** `DISTINCT STATES`. Do not resolve deployment failure by relabeling source completion.

## Scoring model

All component scores are 0–5 and reflect currently recovered evidence, not aspiration.

- **SI** scientific importance
- **O** originality
- **E** evidence strength
- **R** reproducibility
- **B** baseline strength
- **RR** result robustness
- **IQ** implementation quality
- **Paper** paper potential
- **Product** product potential
- **EV** external-validation potential
- **CF** compute feasibility
- **TC** time-to-closure
- **Neg** negative-result value
- **Strategic** portfolio value

Priority emphasizes impact × evidence × closure probability ÷ remaining cost:

`impact = mean(SI, O, max(Paper, Product), EV, Strategic)`  
`evidence = mean(E, R, B, RR)`  
`closure = mean(CF, TC)`  
`cost_penalty = 1 + (5-CF)/5 + (5-TC)/5`  
`priority = 100 × (impact/5) × (evidence/5) × (closure/5) / cost_penalty`

The score is a queue heuristic, not a scientific metric.

| Project | SI | O | E | R | B | RR | IQ | Paper | Product | EV | CF | TC | Neg | Strategic | Priority |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LAM-JEPA | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 5 | 1 | 4 | 5 | 5 | 5 | 5 | **92.0** |
| NGMT v0.1 | 4 | 3.5 | 4.5 | 4.5 | 4.5 | 4.5 | 4 | 4 | 2 | 3.5 | 5 | 4.5 | 4.5 | 4 | **59.1** |
| Eigen-JEPA | 3.5 | 3.5 | 4.5 | 4.5 | 4.5 | 4.5 | 4 | 4 | 2 | 4 | 5 | 4.5 | 4.5 | 4 | **59.1** |
| IRIS v0.2 | 4 | 3.5 | 4.5 | 4.5 | 4.5 | 4 | 4 | 4 | 1 | 3.5 | 5 | 4.5 | 4.5 | 4 | **57.4** |
| Project 2424 consolidation | 4 | 3 | 4 | 4 | 3.5 | 4 | 4 | 3 | 4 | 4 | 5 | 4 | 4 | 5 | **46.5** |
| Research Atlas V4 | 2.5 | 2.5 | 4.5 | 4 | 3 | 4 | 4 | 2 | 5 | 5 | 5 | 4 | 2 | 5 | **46.5** |
| NeuroCAD | 4 | 3.5 | 4 | 4 | 3 | 3.5 | 4 | 4 | 4 | 4 | 4.5 | 4 | 2 | 4 | **37.0** |
| APEN | 4 | 3.5 | 4 | 4.5 | 3 | 4 | 4 | 4 | 2 | 4 | 4.5 | 3.5 | 3.5 | 4 | **34.5** |
| T2424-0027 | 3.5 | 3 | 4 | 4.5 | 3.5 | 4 | 4 | 3.5 | 2 | 4 | 4.5 | 3.5 | 3 | 4 | **32.9** |
| VertexED | 2 | 2 | 4 | 3.5 | 2 | 3 | 4 | 1 | 5 | 5 | 4 | 4 | 1 | 5 | **27.1** |
| Percy | 3.5 | 4 | 3.5 | 3 | 3 | 3 | 4 | 3.5 | 5 | 5 | 4 | 3 | 3 | 5 | **24.6** |
| NPMS | 3.5 | 3.5 | 4 | 4.5 | 3 | 3.5 | 4 | 3.5 | 2 | 4 | 4 | 3 | 3.5 | 4 | **24.3** |
| T2424-0028 | 3 | 2.5 | 3.5 | 4 | 2 | 3.5 | 3.5 | 2.5 | 2 | 3 | 5 | 3.5 | 2.5 | 3 | **23.8** |
| T2424-0029 | 3 | 2.5 | 3.5 | 4 | 2 | 3.5 | 3.5 | 2.5 | 2 | 3 | 5 | 3.5 | 2.5 | 3 | **23.8** |
| Darcy | 4 | 3 | 3.5 | 3.5 | 2.5 | 3 | 4 | 4 | 2 | 4 | 4 | 3 | 2.5 | 4 | **20.8** |
| The Bu1LD | 2 | 2 | 2 | 1 | 1 | 1 | 3 | 1 | 4 | 4 | 3 | 2 | 1 | 4 | **4.0** |
| FinanceMeta | 1.5 | 1.5 | 2 | 1 | 1 | 1 | 3 | 1 | 4 | 4 | 3 | 2 | 1 | 3.5 | **3.6** |
| Hercules | 2.5 | 2.5 | 1.5 | 1 | 1 | 1 | 2.5 | 2 | 2 | 3 | 3 | 2 | 2 | 2.5 | **2.8** |
| PEN | 3 | 2.5 | 1.5 | 1 | 1 | 1 | 2 | 2 | 1 | 2 | 3 | 2 | 2 | 2 | **2.6** |
| Olympus | 2 | 2 | 1 | 1 | 1 | 1 | 2 | 1.5 | 2 | 3 | 2 | 1.5 | 1.5 | 2 | **1.3** |
| Text-To-Video | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 2 | 3 | 2 | 1 | 1 | **1.2** |

## Tier selection

### TIER S — 4 flagship closure efforts

These are selected because the evidence is already strong enough that a defensible closure artifact is plausible without speculative rescue.

1. **LAM-JEPA — negative-result paper package.** No more ARC rescue experiments.
2. **NGMT v0.1 — concise reproduced negative learned-result package.** Any redesign is a new project/version.
3. **Eigen-JEPA — reproduced baseline-dominance/negative package + provenance reconciliation.** No metric shopping.
4. **IRIS v0.2 — negative development-gate package.** Current PABIM confirmatory seeds remain quarantined.

Tier S here means **closure priority**, not positive scientific success.

### TIER A — 7 strong secondary efforts

1. **Project 2424 consolidation** — aggressively shrink the umbrella to canonical scientific children.
2. **Research Atlas V4** — make provenance/reproduction infrastructure independently usable.
3. **NeuroCAD** — one decisive matched same-provider direct-vs-IR experiment.
4. **APEN** — one matched learned-memory control + salience stress.
5. **T2424-0027** — real-encoder controls, only under a frozen protocol.
6. **VertexED** — production incident closure + exact served revision + real validation.
7. **Percy** — dependency-critical exception: recover the real Mac state before any new queue expansion.

### TIER B

- NPMS
- Darcy
- T2424-0028
- T2424-0029
- PEN (blocked source recovery)
- FinanceMeta (blocked target access)
- The Bu1LD (blocked target access)

Tier B work receives no major compute while any Tier S/A decisive gate is runnable.

### ARCHIVE / NO SIGNIFICANT COMPUTE FOR 30 DAYS

- Hercules
- Olympus
- Text-To-Video
- unpromoted Project 2424 proposals/variants without a distinct falsifiable question and evidence package
- duplicate Percy control-plane implementations/worktree copies as execution authorities

## Compression result

The active scientific portfolio is no longer “hundreds/thousands of projects.” It is:

- **4 closure-first Tier S lines**
- **7 Tier A secondary/system/product efforts**
- **7 Tier B/blocked or lower-priority efforts**
- the remainder archived unless evidence earns promotion

No archived evidence is deleted. Promotion requires a new artifact, baseline result, reproduction, source recovery, or external validation—not a renamed project.