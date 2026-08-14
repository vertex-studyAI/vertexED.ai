# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after latest VertexED production monitor evidence and Darcy v2 protocol freeze  
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
- Internal numerical/asset provenance is now closed; current LAM `main` includes the numeric-basis guard at `bf8311e1a4d240e2891e51af38eaf7754944e300` without changing the frozen scientific outcome.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 4 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest checked scheduled production-health run `31817794439` failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries passed.
- The monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; that SHA resolves to the repository security commit that patched the PostCSS Nano ID override. Evidence artifact `production-health-31817794439` is artifact ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- Current source already attempts revision provenance through runtime `VERCEL_GIT_COMMIT_SHA`/`GITHUB_SHA` and a deploy-build generated fallback. The unresolved fact is the **served deployment/function provenance**; do not guess which Vercel configuration/build path is responsible without direct project evidence.
- Deliver: canonical Vercel project/deployment identity; verify relevant system-environment/build settings without exposing secrets; exact intended/served source identity; `/api/health` revision proof matching the deploy-relevant SHA; production monitor PASS; disposable-account core workflow + cleanup record.
- Do not add product features or weaken the monitor to work around deployment identity uncertainty.

## 5 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send that exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- Retain validator identity/date, exact artifact revision, observed hashes/numbers, discrepancies, source-method critique and success/failure interpretation.
- External validation stays **RED/PENDING** until returned outside evidence exists. Packet readiness or outreach is not validation.

## 6 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is frozen and canonical.
- Recover/hash the exact development trajectories, retained implementations/parameters and metric code required by the protocol.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 7 — DARCY-PREFLIGHT-002 — P1 / BLOCKED_CANONICAL_PREFLIGHT
- `portfolio/project2424/projects/T2424-0050/LEARNED_OPERATOR_OOD_PROTOCOL_V2.md` is already the canonical pre-outcome freeze; `DARCY-FREEZE-001` is closed.
- Before any v2 run, commit/hash the exact implementation and environment, data/version and split manifest, matched numerical/reduced/learned model budget, metrics/uncertainty implementation and required dataset hashes.
- Systems/regimes remain those in the frozen protocol; do not inherit the aligned parent result as a learned/OOD outcome.
- Any material protocol change after outcome inspection requires a new protocol version.

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
- `DARCY-FREEZE-001` — **CLOSED PROTOCOL ONLY:** v2 learned/operator/OOD comparison is frozen before outcome inspection; execution is blocked on its canonical preflight artifacts.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded programme exists; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are source or live-state recovery first; Darcy v2 is protocol-frozen but preflight-blocked; JEPA×time-series is dormant design; NeuroCAD research is deprioritized after its mechanism falsifier; LAM is owner metadata + external review only; VertexED is deployment certification only. Unused compute capacity should remain unused rather than generate low-information experiments.
