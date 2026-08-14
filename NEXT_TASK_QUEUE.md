# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after independent LAM raw-artifact verification, Darcy v2 protocol freeze, and latest VertexED production-monitor evidence  
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

## 5 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is frozen and canonical.
- Recover/hash the exact development trajectories, retained implementations/parameters and metric code required by the protocol.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 6 — DARCY-PREP-002 — P1 / FROZEN_PROTOCOL_WAITING_IMPLEMENTATION_FREEZE
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is already frozen in `portfolio/project2424/projects/T2424-0050/LEARNED_OPERATOR_OOD_PROTOCOL_V2.md` before any v2 outcome.
- Commit the exact generator/source revision, split manifest and hashes, reference-solver implementation/tests, learned-model implementations, library versions, model budgets, optimizer/tuning grids, seeds, hardware/compute cap and dataset hashes required by the protocol.
- No v2 training, ID-test or OOD-test outcome is authorized until those pre-outcome implementation/environment/data requirements are immutable.
- Any material change after outcome inspection becomes a new protocol version; do not rescue v2 in place.

## 7 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest scheduled production-health run `31817794439` on workflow commit `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**.
- The retained smoke artifact records expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries passed.
- Evidence artifact: `production-health-31817794439`, artifact ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- The unresolved fact is the **served deployment revision**, not whether the source repository contains a resolvable expected revision.
- Deliver: exact intended/served source identity, deployment ID, `/api/health` revision proof matching the deploy-relevant SHA, production monitor PASS, disposable-account core workflow + cleanup record.
- Do not add product features to work around deployment identity uncertainty.

## 8 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Deliver: canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive the line as bounded recovered evidence rather than inventing a replacement implementation.

## 9 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- The canonical programme remains one question: causal future-latent predictive-state recovery under noise/missingness.
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, objectives, TS-JEPA/data2vec/reconstruction/autoregressive/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives. No run is currently authorized.

## 10 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after the tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY:** canonical LAM paper/source work is on `LAM-JEPA/main`.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY:** raw Actions artifacts `9162165932`, `9003785715`, and `9003740436` were independently downloaded; ZIP/raw JSON digests matched canonical provenance; five-seed full/matched/ablation values and bounded pretrained characterization were independently recomputed; deterministic CSV/Markdown/SVG assets regenerated. Verification record merged as `725ae2fb17de9c988938d4b03bd8a6be456b8e8b`; numeric-basis guard merged as `bf8311e1a4d240e2891e51af38eaf7754944e300` with no scientific outcome change.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY:** immutable external reproduction/review packet merged as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no outside result exists yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** development-only false-open constrained baseline-frontier protocol is frozen; execution remains source-blocked.
- `DARCY-FREEZE-001` — **CLOSED PRE-OUTCOME:** learned-operator/OOD protocol v2 is frozen; execution remains unauthorized until its required implementation/environment/split/model-budget/data identities are committed.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded programme exists; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are source or live-state recovery first; Darcy v2 is protocol-frozen but implementation/environment/data identity must be frozen before execution; JEPA×time-series is dormant design; NeuroCAD research is deprioritized after its mechanism falsifier; LAM is owner metadata + external review only; VertexED is deployment certification only. Unused compute capacity should remain unused rather than generate low-information experiments.
