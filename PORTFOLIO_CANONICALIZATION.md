# PORTFOLIO CANONICALIZATION

**As of:** 2026-08-14  
**Goal:** one canonical identity and evidence source per serious effort; archive overlap without deleting provenance.

## Authority hierarchy

1. **Raw experiment artifacts + frozen protocol + exact source commit** outrank prose status.
2. **Project-local claim/evidence files** outrank portfolio summaries for project-specific scientific facts.
3. `CLAIM_LEDGER.md`, `EXPERIMENT_LEDGER.md`, `REPRODUCIBILITY_LEDGER.md`, `RESEARCH_FAILURE_ATLAS.md`, `RESEARCH_STATUS.md`, `PRODUCT_STATUS.md`, and `MASTER_STATUS.md` are the current control-repo portfolio ledgers.
4. `PORTFOLIO_SNAPSHOT.md` points to the newest dated verified recovery snapshot.
5. Branch names, task titles, agent output, proposal workbooks and old roadmaps are **not** evidence by themselves.
6. Live deployment/host facts outrank source-only claims when production state is in question.

## Canonical repositories / locations

| Effort | Canonical source | Canonical evidence boundary | Non-canonical material treatment |
|---|---|---|---|
| Portfolio control / status | `vertex-studyAI/vertexED.ai` | root ledgers + `portfolio/` evidence | stale status branches remain provenance only until merged |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | frozen ARC protocol/results + retained artifact audits | control-repo summaries mirror, never override, LAM-local science |
| VertexED | `vertex-studyAI/vertexED.ai` | source gates + live production monitor | Vercel status alone cannot establish served revision |
| Text-To-Video V6 | `vertex-studyAI/Text-To-Video` | local render pipeline + exact-head CI | do not fold local-media success into VertexED production claims |
| Percy runtime | real host at `/Volumes/PRO-BLADE/Atlas/Percy` once accessible | canonical SQLite/WAL/process/checkpoint state | control-repo Percy docs are secondary until reconciled with host |
| Project 2424 | `portfolio/project2424/` plus retained frozen reproduction artifacts | child-project IDs and project-specific frozen evidence | umbrella proposal count is catalog metadata, not research evidence |
| NeuroCAD | `portfolio/project2424/projects/T2424-0037/` | controlled + held-out-template + OpenSCAD evidence | any generic “NLP-to-CAD” branch is historical unless it maps to T2424-0037 lineage |
| Darcy | `portfolio/project2424/projects/T2424-0050/` | bounded 1D frozen screen | Benchmark Augmentation Theory is auxiliary tooling, not T2424-0050 science |
| T2424-0027 | `portfolio/project2424/projects/T2424-0027/` | synthetic latent-language diagnostic | no real multilingual claim inherited from synthetic package |
| APEN | retained APEN source/evidence package | salience tradeoff and dropout stress | never inherit PEN status |
| PEN | distinct PEN package/source when recovered | separate executable protocol required | APEN evidence cannot certify PEN |
| Eigen-JEPA | retained Eigen-JEPA package | real-data covariance-forecast comparison | no generic JEPA superiority inherited |
| NPMS | retained NPMS package | controlled memory diagnostic + learned companion | no natural/OOD claim inherited |
| Research Atlas V4 | retained checksummed archive | packaging/reproduction infrastructure | not a substitute for independent external reproduction |

## Semantic project graph

`Project 2424 registry`
→ parent of `T2424-0025`, `T2424-0027`, `T2424-0037 NeuroCAD`, `T2424-0050 Darcy`, `T2424-1863`, and other bounded children.

`JEPA research family`
→ `LAM-JEPA` (ARC/planning/target question)  
→ `Eigen-JEPA` (spectral/covariance question)  
→ future `JEPA × time-series` work only after one hypothesis is frozen.

`Robust memory family`
→ `T2424-0025 robust readout diagnostic`  
→ `NGMT v0.1 learned equal-budget experiment`  
→ future successor only as a newly versioned protocol.

`VertexED product family`
→ `VertexED core product`  
→ `Text-To-Video V6` as a separate local-media subsystem/repository and release boundary.

`Agent-system family`
→ `Percy` as evidence-native orchestration engineering/research  
→ `Olympus` as a distinct unproven role-decomposition research hypothesis.

## Pairwise overlap decisions

| Pair / cluster | Decision | Rationale |
|---|---|---|
| NeuroCAD vs T2424-0037 controlled NLP-to-CAD | **MERGE** | They are the same canonical project identity. Use `T2424-0037 / NeuroCAD` everywhere. |
| T2424-0050 Darcy vs old T2424-0050 Benchmark Augmentation Theory placement | **ARCHIVE ONE as research project** | Darcy owns canonical ID T2424-0050. Benchmark Augmentation Theory remains preserved as `AUX-P2424-BENCHMARK-AUGMENTATION` tooling without scientific-ID inheritance. |
| Project 2424 umbrella vs surviving T2424 children | **PARENT/CHILD** | Registry is organizational infrastructure; scientific claims live only at child-project level. |
| T2424-0025 robust readouts vs NGMT v0.1 | **PARENT/CHILD research program** | Robust-readout diagnostic motivates but does not prove the learned NGMT mechanism. Evidence must not transfer upward. |
| NGMT v0.1 vs any NGMT successor | **DISTINCT** | v0.1 is a frozen negative result. A successor requires a new version, hypothesis, gate and protocol. |
| IRIS v0.2 vs any IRIS successor | **DISTINCT** | v0.2/current candidate failed its development gate; successor cannot silently move the goalposts. |
| APEN vs PEN | **DISTINCT** | Separate mechanism/source identity; APEN evidence cannot certify PEN. |
| LAM-JEPA vs Eigen-JEPA | **DISTINCT** | Different scientific questions, tasks and falsifiers despite JEPA naming. |
| LAM-JEPA vs future JEPA×time-series work | **DISTINCT** | ARC negative result neither validates nor falsifies time-series latent prediction. |
| Eigen-JEPA vs JEPA×time-series program | **PARENT/CHILD** | Eigen-JEPA is one possible time-series/spectral child, not evidence for the entire program. |
| Percy vs Olympus | **DISTINCT** | Percy is a real orchestration system; Olympus is an unproven decomposition hypothesis. |
| Hercules vs Olympus | **DISTINCT** | Architecture/model proposal vs agent-decomposition proposal; neither inherits the other's evidence. |
| VertexED vs Text-To-Video V6 | **PARENT/CHILD product family** | Related learner product scope, but separate repository, CI, deployment and production-validation boundaries. |
| Research Atlas V4 vs scientific projects it packages | **DISTINCT infrastructure** | Reproduction packaging can validate artifact handling, not scientific external validity. |

## Branch canonicalization rule

The repository contains many historical `agent/*`, `percy/*`, `research/*`, `repro-wave/*`, `status/*`, and other execution branches. They are evidence-bearing provenance, **not parallel canonical project sources**. A branch becomes authoritative only when:

1. its exact scientific/engineering scope is identified;
2. relevant tests/evidence pass;
3. result boundaries are reconciled with existing ledgers;
4. it is merged intentionally into the canonical source;
5. frozen negative results are not rewritten by the merge.

Do not delete historical branches merely to make the graph look clean. Stop creating new branches for semantically duplicate work.

## Canonicalization actions

- Use `T2424-0037 / NeuroCAD` as the only canonical NeuroCAD identity.
- Use `T2424-0050 / Darcy Latent Operator` as the only canonical T2424-0050 scientific identity.
- Treat `AUX-P2424-BENCHMARK-AUGMENTATION` as auxiliary tooling, not a scientific project.
- Treat Project 2424 as a parent registry and stop reporting registry count as completed research.
- Freeze LAM-JEPA, IRIS v0.2, NGMT v0.1, Eigen-JEPA and T2424-1863 negative/mixed result families in place.
- Recover PEN source before spending scientific compute on PEN.
- Recover the Percy host before creating any new high-volume queue.
- Use one `JEPA × time-series` umbrella only for hypothesis selection; create a child project only after a question/falsifier/baselines are frozen.
