# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after latest bounded VertexED production-health verification, Darcy v2 protocol-freeze reconciliation, and FinanceMeta source recovery  
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

## 6 — DARCY-V2-MATERIALIZE-002 — P1 / READY_IMPLEMENTATION_NO_RUN
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is already frozen and explicitly records `EXPERIMENT NOT YET RUN`.
- Materialize only the pre-outcome implementation required by that protocol: deterministic generator/reference solver, fixed M1/A1/A2/B1/B2 systems, eligible FNO/DeepONet implementation/config grid, environment lock, split-manifest generator, hardware/compute-budget declaration, unit/eligibility tests and exact hashes.
- Deliver: committed implementation revision; environment/config hashes; split-manifest hash; model-budget declaration; test evidence showing the code path is internally valid without evaluating the frozen ID/OOD outcomes.
- **Do not execute training, ID-test or OOD evaluation until every prerequisite named by the frozen protocol is committed.** Any material protocol change becomes a new version.

## 7 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest checked scheduled production-health run `31817794439` on control head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries passed.
- The monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`; evidence artifact `9225715176` has SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- Both connected Vercel project statuses for the control head currently report `Deployment rate limited — retry in 24 hours.` Do not purchase a paid upgrade or churn source merely to force a deployment.
- Deliver when externally unblocked: exact intended/served source identity, deployment ID, `/api/health` revision proof matching the deploy-relevant SHA, production monitor PASS, disposable-account core workflow + cleanup record.
- Do not add product features to work around deployment identity uncertainty.

## 8 — FINANCEMETA-REVIEW-001 — P0 PRODUCT / SOURCE_RECOVERED_WRITE_BLOCKED
- Canonical portal source is `build-the-future-11/finance4all-global-reach`; branch `cursor/membership-security-supabase-fix` is 41 commits ahead of `main` and 0 behind.
- The branch contains the retained hardening/release-candidate work, migrations `018`–`021`, verification tooling, contribution history and journey analytics.
- This execution surface attempted to open a PR and GitHub returned `403 Resource not accessible by integration`; no authenticated `gh` CLI fallback is available.
- Deliver: owner-authorized GitHub identity opens the **existing branch** against `main`; exact-head CI and source/security review complete; merge only if those gates are green.
- Do not recreate the 41 commits, weaken security checks, or treat branch-authored local test reports as independent CI evidence.

## 9 — FINANCEMETA-PROD-002 — P0 PRODUCT / BLOCKED_EXTERNAL_LIVE_STATE
- Depends on `FINANCEMETA-REVIEW-001` source review/merge.
- Verify owner-controlled Supabase has the complete intended hardened migration/RLS state including migration `021`; set real authorized production env; deploy an exact reviewed revision.
- Run authenticated multi-account core journey, cross-user isolation/denial, persistence, recovery/logout and cleanup.
- A green PR is source evidence only; it does not certify live RLS, deployment identity, users, telemetry or adoption.

## 10 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Deliver: canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive the line as bounded recovered evidence rather than inventing a replacement implementation.

## 11 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- The canonical programme remains one question: causal future-latent predictive-state recovery under noise/missingness.
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, objectives, TS-JEPA/data2vec/reconstruction/autoregressive/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives. No run is currently authorized.

## 12 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after the tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY:** canonical LAM paper/source work is on `LAM-JEPA/main`.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY:** raw Actions artifacts `9162165932`, `9003785715`, and `9003740436` were independently downloaded; ZIP/raw JSON digests matched canonical provenance; five-seed full/matched/ablation values and bounded pretrained characterization were independently recomputed; deterministic CSV/Markdown/SVG assets regenerated. Verification record merged as `725ae2fb17de9c988938d4b03bd8a6be456b8e8b`; numeric-basis guard merged as `bf8311e1a4d240e2891e51af38eaf7754944e300` with no scientific outcome change.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY:** immutable external reproduction/review packet merged as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no outside result exists yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** development-only false-open constrained baseline-frontier protocol is frozen; execution remains source-blocked.
- `DARCY-FREEZE-001` — **CLOSED DESIGN ONLY:** learned-operator/OOD v2 protocol is frozen before outcomes; experiment remains not run and implementation/hash prerequisites remain open.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded programme exists; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/IRIS/NPMS are source or live-state recovery first; Darcy v2 may advance through implementation/config/hash closure only, not scientific outcome execution; JEPA×time-series is dormant design; NeuroCAD research is deprioritized after its mechanism falsifier; LAM is owner metadata + external review only; VertexED is deployment certification only; FinanceMeta is source review and production qualification only. Unused compute capacity should remain unused rather than generate low-information experiments.
