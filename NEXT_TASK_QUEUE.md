# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after IRIS, NPMS and Project 2424 source-recovery reconciliation  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state.
- Verify independently against the preserved snapshot.
- Failure: remain blocked; never create a replacement DB to make counters look clean.

## 2 — P2424-OVERLAY-RECONCILE-002 — P0 / WAVE001_BASE_RECOVERED_OVERLAY_BLOCKED
- `P2424-CANON-001` is materially narrowed: the manifest-selected historical Wave-001 Git bundle is recovered and verified at SHA-256 `4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`, complete-history HEAD `ff609f335f91297357b430a2531633fe111cd5a9`.
- Fresh clean-clone quality gate verifies 2,424 unique registry rows but only 24 source packages, 75 project tests, 24 bounded pilots, 0 independent reproductions and `RELEASE_REJECTED`.
- Recover/hash the later dirty Mac workspace/overlay or a byte-identical archive and the canonical migration/canonicalization record relating historical `P2424-*` identities to present-day `T2424-*` identities.
- Do not map by numeric suffix alone. Historical `P2424-0038` and current `T2424-0038` already demonstrate conflicting project identities.
- Deliver: overlay hash/manifest, proven ancestry or explicit non-ancestry, collision table, and provenance-backed child map. If the overlay cannot be recovered, keep current `T2424-*` evidence separate and return `OVERLAY_UNRECOVERED`.

## 3 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 4 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send that exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- External validation stays **RED/PENDING** until returned outside evidence exists.

## 5 — IRIS-FRONTIER-SOURCE-001 — P1 / PARTIALLY_RECOVERED_PROTOCOL_BLOCKED
- Checksum-matched v0.2 bundle, reproduction addendum, common adaptation harness and exact source-lineage archive are recovered and recorded in `portfolio/research/IRIS_SOURCE_RECOVERY_20260814.md`.
- Remaining required provenance: exact canonical development trajectories and exact adaptation-metric freeze/source edge required by the frozen frontier.
- If either cannot be recovered, retain `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 6 — DARCY-V2-MATERIALIZE-002 — P1 / PARTIAL_PRE_OUTCOME_FREEZE_NO_RUN
- `darcy-operator-ood-v2` is frozen and explicitly unexecuted.
- Deterministic generator/control scaffolding and machine-readable locks are on `main`; latest safety repair removes frozen-OOD outcome peeking from unit tests and records generator provenance.
- Close remaining B2/B3/B4 learned implementation/config, exact environment, hardware/compute and final manifest-hash prerequisites.
- **Do not execute learned training, ID-test or OOD evaluation until every frozen prerequisite is immutable.** Material changes require a new protocol version.

## 7 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Latest checked production-health run `31817794439` failed three bounded attempts because `/api/health` remained healthy but omitted revision identity.
- Public/router/logged-out/origin smoke boundaries passed; expected deploy-relevant revision is `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; artifact `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- Connected deployment statuses report rate limiting. Do not purchase an upgrade or churn code merely to force deployment.
- When externally unblocked, prove exact served revision/deployment ID and authenticated golden journey.

## 8 — NPMS-NATURAL-CAUSAL-FREEZE-002 — P2 / SOURCE_RECOVERED_NO_NEW_RUN_AUTHORIZED
- `NPMS-SOURCE-001` is closed for the controlled Atlas source: archive SHA `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`, base `projects/npms/experiment.py`; clean replay passes and reproduces byte-identical key evidence.
- Frozen invariant-parameter control independently replays NPMS `92.86%` vs invariant-parameter `89.29%`, verdict `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.
- Preserve adverse result and all known delay-PCA, multiscale, switching, missing/spurious-mode, conjugate-group and resolvent-proxy limitations.
- Before any new science, freeze a separate natural/causal protocol testing behavioral/intervention information beyond strong coordinate-invariant parameter summaries and state-space/spectral controls.
- No natural/OOD run is currently authorized.

## 9 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- Before any run, freeze one machine-readable cheap synthetic causal-future-latent experiment with exact generator, strong objective/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives. No run is currently authorized.

## 10 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed / narrowed this wave

- `LAM-PAPER-001` — **CLOSED INTERNALLY**; negative scientific outcome preserved.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY**; numerical/artifact verification complete without scientific outcome change.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY**; no outside result yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED DESIGN**.
- `IRIS-SOURCE-RECOVERY-20260814` — **PARTIAL RECOVERY:** substantial checksum-matched lineage recovered; two exact provenance edges remain.
- `DARCY-FREEZE-001` — **CLOSED DESIGN ONLY**; v2 remains not run.
- `DARCY-V2-MATERIALIZATION-PARTIAL` — **PARTIAL:** pre-outcome safety/scaffolding landed; learned/environment/hardware/hash prerequisites remain.
- `NPMS-SOURCE-001` — **CLOSED FOR CONTROLLED ATLAS SOURCE:** canonical source and base evidence recovered/replayed; adverse parameter-confound control preserved.
- `P2424-WAVE001-BASE-RECOVERY-20260814` — **CLOSED:** exact historical Git bundle recovered and freshly quality-gated; present-day overlay/ID-map reconciliation remains open.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN**; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** `VALIDATION_DOMINANT`.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy is live-host recovery; Project 2424 is overlay/identity reconciliation; IRIS is exact provenance closure; Darcy is pre-outcome prerequisite closure; NPMS is next-protocol design only; JEPA×time-series remains dormant; LAM is owner metadata + external review only; VertexED is deployment certification only. Unused compute should remain unused rather than generate low-information experiments.
