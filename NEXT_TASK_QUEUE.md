# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after latest VertexED production verification, IRIS/NPMS source recovery, and Darcy v2 pre-outcome materialization  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state.
- Verify independently against the preserved snapshot.
- Failure: remain blocked; never create a replacement DB to make counters look clean.

## 2 — P2424-CANON-001 — P0 / BLOCKED_EXTERNAL_SOURCE
- Re-establish the preserved canonical Project 2424 source/overlay and reconcile count/status contradictions.
- Deliver: verified HEAD/ancestry, dirty-overlay manifest/hashes, smallest baseline rerun, canonical child map.
- Failure: block source-dependent new experiments; preserve bounded existing reproductions.

## 3 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is now closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 4 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send that exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- Retain validator identity/date, exact artifact revision, observed hashes/numbers, discrepancies, source-method critique and success/failure interpretation.
- External validation stays **RED/PENDING** until returned outside evidence exists. Packet readiness or outreach is not validation.

## 5 — IRIS-FRONTIER-SOURCE-001 — P1 / PARTIALLY_RECOVERED_PROTOCOL_BLOCKED
- Checksum-matched v0.2 bundle, reproduction addendum, common adaptation harness and exact source-lineage archive have been recovered and recorded in `portfolio/research/IRIS_SOURCE_RECOVERY_20260814.md`.
- Remaining required provenance: exact canonical development trajectories and exact adaptation-metric freeze/source edge required by `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md`.
- If either cannot be recovered, retain `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 6 — DARCY-V2-MATERIALIZE-002 — P1 / PARTIAL_PRE_OUTCOME_FREEZE_NO_RUN
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is frozen and explicitly records `EXPERIMENT NOT YET RUN`.
- Deterministic generator/control scaffolding and machine-readable training lock have landed on canonical main.
- Remaining prerequisites include the protocol-required learned B2/B3/B4 implementations/config identities, exact environment/library lock, hardware identity/compute cap and final split/data/manifest hashes.
- **Do not execute learned training, ID-test or OOD evaluation until every prerequisite named by the frozen protocol is committed.** Any material protocol change becomes a new version.

## 7 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest checked scheduled production-health run `31817794439` failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries passed.
- The monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; evidence artifact `9225715176` has SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- Connected Vercel project statuses have reported deployment rate limiting. Do not purchase a paid upgrade or churn source merely to force a deployment.
- Deliver when externally unblocked: exact intended/served source identity, deployment ID, `/api/health` revision proof matching the deploy-relevant SHA, production monitor PASS, disposable-account core workflow + cleanup record.

## 8 — NPMS-NATURAL-CAUSAL-FREEZE-002 — P2 / SOURCE_RECOVERED_NO_NEW_RUN_AUTHORIZED
- `NPMS-SOURCE-001` is closed for the controlled Atlas source: archive SHA `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`, base `projects/npms/experiment.py`, clean tests pass and key base artifacts reproduce byte-identically.
- The frozen invariant-parameter control independently replays `92.86%` NPMS versus `89.29%` invariant-parameter accuracy and verdict `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.
- Preserve this adverse result and all known delay-PCA, multiscale, switching, missing/spurious-mode, conjugate-group and resolvent-proxy limitations.
- Before any new science, freeze a separate natural/causal protocol testing behavioral/intervention information beyond strong coordinate-invariant parameter summaries and state-space/spectral controls, with exact task/data/model identities, seeds, primary metric, uncertainty, compute cap and falsifier.
- No natural/OOD run is currently authorized.

## 9 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- The canonical programme remains one question: causal future-latent predictive-state recovery under noise/missingness.
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, objectives, TS-JEPA/data2vec/reconstruction/autoregressive/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives. No run is currently authorized.

## 10 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after the tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY**.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY:** independent raw-artifact digest/numerical/asset verification complete with no scientific outcome change.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY:** immutable outside-reproduction packet exists; no outside result yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** development-only frontier protocol frozen.
- `IRIS-SOURCE-RECOVERY-20260814` — **PARTIAL RECOVERY RECORDED:** substantial checksum-matched source chain recovered; exact trajectory + metric provenance still block execution.
- `DARCY-FREEZE-001` — **CLOSED DESIGN ONLY:** v2 protocol frozen before outcomes.
- `DARCY-V2-MATERIALIZATION-PARTIAL` — deterministic pre-outcome scaffolding/training lock landed; remaining implementation/environment/hardware/hash prerequisites stay open.
- `NPMS-SOURCE-001` — **CLOSED FOR CONTROLLED ATLAS SOURCE:** canonical Atlas archive recovered; clean base replay reproduces byte-identical key evidence; stronger invariant-parameter adverse control replays `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded programme exists; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424 remain source/live-state recovery first; IRIS remains blocked on two exact provenance edges; Darcy v2 may close pre-outcome implementation/config/hash prerequisites only; NPMS requires a new frozen natural/causal protocol before further science; JEPA×time-series remains dormant design; NeuroCAD is deprioritized; LAM is owner metadata + external review only; VertexED is deployment certification only. Unused compute should remain unused rather than generate low-information experiments.
