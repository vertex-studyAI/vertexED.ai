# Checkpoint — 11 August 2026

## Completed

- Merged VertexED password-recovery authorization hardening: `f5e7d1f3631f718e89bafaa539ec65516786c53a`.
- Merged stale-profile auth-session race fix: `6961002e3fa6a311a25d16d23f4b8ff742b02a0d`.
- Merged transient Study Zone account-scope reset: `02f16b8b89daabf27a99cab405a39de481c19d2f`.
- Merged Apex current-question deduplication: `4e8648d6f453d1342b132703c52daac3c4e512df`.
- Merged clean current-main Apex request cancellation: `5863d868dc9c68bac2dc21f1901abeb22823dde8`; exact branch head passed canonical CI #617.
- Merged the falsifiable Asteroid Tracklet Baseline: `e956ec60e8fe9675cb0ca90f8a11df403458890c`; latest branch head passed canonical CI #593 before merge.
- Merged the Project 2424 First-100 evidence-first execution wave: `f7c8ff7edd693f7daa0d2fc28e9a821eeb0d2702`.
- Merged evidence-backed portfolio control files: `31dcdd484e9f16db15329b868d9977f9c5940315`.
- Merged and exact-head verified five previously recorded First-100 packages: `T2424-0034`, `T2424-0036`, `T2424-0038`, `T2424-1767`, and `T2424-1863`.
- Subsequently merged and exact-head verified `T2424-0030` Adaptive Theory Geometry in World Models — head `145a654c40c3fcc2a609031e380bec2846e2e8f8`, CI `31413316287`, merge `0239fa06b29ec537f4163b487ffb7318a5ebee2e`.
- Subsequently merged and exact-head verified `T2424-0025` Non-Gaussian Memory Transformer screen — head `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`, CI `31413572999`, merge `0eb46d07f7d23fccd1333e3c62617457ba3ba423`.
- Verified that the merged `Project24 Render` package at `portfolio/project2424/projects/T2424-0049/` passed exact-head CI `31414274233`, but discovered that the canonical First-100 queue assigns `T2424-0049` to **Multiphase Porous JEPA**. The renderer is therefore excluded from the First-100 count pending identity repair.
- Reconciled the First-100 dashboard from five to **seven** defensible merged/tested packages while preserving the stricter certified-complete count at zero.
- Inspected the three repositories exposed by the connected GitHub installation: VertexED, LAM-JEPA, and Text-To-Video.

## In progress / verifying

- PR #194 / branch `agent/p2424-evidence-reconcile-20260811` reconciles durable status files and records the `T2424-0049` identity collision.

## Blocked

- Exact immutable VertexED production SHA and authenticated production certification.
- Canonical local Project 2424 source restore/access outside the material already merged into `vertexED.ai`.
- FinanceMeta target GitHub/Supabase access.
- The Bu1LD target GitHub/Supabase/Cloudflare access.
- Percy local SQLite/runtime source.
- Atlas canonical GitHub repo is not exposed to this GitHub installation.

## Tests passing

- PR #147 exact head: canonical CI #577 passed before merge.
- PR #152 exact head: canonical CI #580 passed before merge.
- PR #153 exact head: canonical CI #586 passed before merge.
- PR #149 exact head: canonical CI #579 passed before merge.
- PR #145 latest head: canonical CI #593 passed before merge.
- PR #155 latest head: `build-and-test` succeeded.
- PR #157 exact head: canonical CI #612 passed before merge.
- PR #161 exact head: canonical CI #617 passed.
- `T2424-0030` exact head: CI `31413316287` passed before merge.
- `T2424-0025` exact head: CI `31413572999` passed before merge.
- Project24 Render exact head: CI `31414274233` passed before merge, but package identity conflicts with the First-100 queue and therefore does not increase First-100 counts.

## Tests failing

No failing test is currently recorded for the seven identity-consistent merged/tested First-100 packages. CI success is not being converted into scientific validation or certified completion.

## Project 2424 First-100

- Evidence-gated queue merged: 100 candidates.
- Runnable project packages merged, verified, and identity-consistent with the queue: **7**.
- Tested project packages merged, verified, and identity-consistent with the queue: **7**.
- Demo-ready First-100 packages represented by the dashboard: **1**.
- Certified complete from that queue: **0 / 100**.
- Research-complete: **0**.
- Identity conflict: `T2424-0049` currently names Project24 Render in the implementation path/PR, while the canonical queue maps that ID to Multiphase Porous JEPA.

## Research experiments completed

- `T2424-0030` has a deterministic synthetic local-geometry forecasting screen and straight-motion negative control; it is not a learned/general world-model result.
- `T2424-0025` has a deterministic synthetic heavy-tail memory-aggregation screen and Gaussian clean control; it is not a full Transformer or real-world robustness result.
- `T2424-1863` preserves a negative/inconclusive result against its predeclared >75% improvement gate rather than relaxing the threshold.
- No new LAM-JEPA or Hercules research-complete claim is made by this checkpoint.

## Important discoveries

1. Connected GitHub access currently exposes only three repositories.
2. Project 2424 work is materially present inside `vertex-studyAI/vertexED.ai` even though no separate repository named `2424` is exposed.
3. The durable First-100 dashboard was stale at five packages; two additional queue-consistent packages (`T2424-0030` and `T2424-0025`) had already merged and passed exact-head CI.
4. A third later merge, Project24 Render, reused `T2424-0049` even though the canonical queue assigns that ID to Multiphase Porous JEPA. Counting it would corrupt project identity.
5. The defensible current First-100 state is seven merged/tested, zero certified complete, zero research complete.

## Highest-value next tasks

1. Keep PR #194 unmerged until its exact-head repository CI passes.
2. Repair the Project24 Render ID collision without overwriting the canonical `T2424-0049` queue entry; assign a non-conflicting identity or classify it outside First-100.
3. Advance one of the seven merged/tested First-100 packages through missing raw-artifact and independent-QA gates.
4. Restore/expose the canonical local Project 2424 source and reconcile it losslessly against the GitHub First-100 packages.
5. Complete exact VertexED live revision certification and disposable-account authenticated production certification.
6. Obtain connector access to FinanceMeta, The Bu1LD, Atlas, and local Percy sources.
