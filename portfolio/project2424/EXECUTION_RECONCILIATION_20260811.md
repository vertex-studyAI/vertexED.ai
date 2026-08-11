# Project 2424 — Evidence Reconciliation — 11 August 2026

## What changed

The durable First-100 dashboard previously recorded five merged/tested packages. GitHub mainline evidence shows two additional **queue-consistent** First-100 packages merged after that snapshot:

1. `T2424-0030` — Adaptive Theory Geometry in World Models
   - exact source head: `145a654c40c3fcc2a609031e380bec2846e2e8f8`
   - canonical CI: `31413316287`
   - merge commit: `0239fa06b29ec537f4163b487ffb7318a5ebee2e`
   - boundary: deterministic synthetic one-step local-geometry screen only

2. `T2424-0025` — Non-Gaussian Memory Transformer
   - exact source head: `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`
   - canonical CI: `31413572999`
   - merge commit: `0eb46d07f7d23fccd1333e3c62617457ba3ba423`
   - boundary: robust synthetic memory-aggregation mechanism only; not a full Transformer

A third later merge exposed a project-identity defect:

3. `portfolio/project2424/projects/T2424-0049/` — Project24 Render
   - exact source head: `d517efc42fb89b8f0374f2d559a82334a82eeb6d`
   - canonical CI: `31414274233`
   - merge commit: `6581a39539267c85b247aa30363d5285daef0173`
   - boundary: static rendering of supplied evidence; no automatic validation or completion inference
   - **identity conflict:** the canonical `FIRST_100_QUEUE.ndjson` assigns `T2424-0049` / rank 42 to **Multiphase Porous JEPA**, not Project24 Render

Because Project24 Render does not match the canonical First-100 identity, it is excluded from First-100 counts until the collision is repaired without overwriting the queue entry.

## Reconciled First-100 truth

- Registry entries: **100**
- Merged runnable packages with queue-consistent identity: **7**
- Merged tested packages with queue-consistent identity: **7**
- Demo-ready First-100 packages represented by the dashboard: **1**
- Certified complete: **0 / 100**
- Research complete: **0**
- Tested standalone package with First-100 ID collision: **1** (Project24 Render)

No certified-complete count is increased by this reconciliation. CI success is execution evidence, not independent QA, scientific validation, publication readiness, or production proof.

## Highest-value integrity repair

Repair the Project24 Render identity collision before any further automated count increase. The safe options are to assign the renderer a non-conflicting project identity or classify it explicitly outside the canonical First-100 queue; do not mutate the queue's `T2424-0049` Multiphase Porous JEPA identity merely to fit the already-merged directory.

## Highest-value completion gate

Advance one of the seven identity-consistent merged/tested packages through the missing completion gates—retained raw artifacts, frozen protocol, baseline/ablation evidence, explicit verdict, and independent QA—before optimizing for a larger headline count.

## Access boundary

The connected GitHub installation exposes `vertex-studyAI/vertexED.ai`, `vertex-studyAI/LAM-JEPA`, and `vertex-studyAI/Text-To-Video`. FinanceMeta, The Bu1LD, Atlas, Percy, and a separate canonical Project 2424 repository are not connector-visible. Project 2424 packages already merged inside `vertexED.ai` remain inspectable and countable only when their identity and evidence match the canonical queue.
