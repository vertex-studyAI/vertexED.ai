# NEXT_TASK_QUEUE

**Rescored:** 2026-08-14 after LAM paper-source merge, IRIS frontier freeze, and JEPA×time-series programme compression  
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

## 3 — LAM-VERIFY-002 — P0 / READY_INTERNAL
- Independently regenerate the final manuscript tables, intervals and evidence figures from retained raw artifacts/config lineage.
- Deliver: source-data hashes, exact generation commands, claim→figure/table provenance, mismatch report.
- No new scientific seeds and no locked ARC test.
- Success: internal numerical/figure provenance closes; any mismatch reopens only the affected artifact edge, not the scientific conclusion.

## 4 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Finish owner-controlled release metadata only after the internal evidence regeneration is clean.
- Deliver: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary, immutable release revision.
- Do not infer these fields from repository history.

## 5 — EXTVAL-LAM-001 — P1 / WAITING_LAM_VERIFY
- Send the immutable LAM negative package to an independent validator for reproduction + skeptical review, not endorsement.
- Retain validator identity/date/artifact revision/discrepancies and compare to the frozen ledger.
- External validation stays RED until an outside report exists.

## 6 — IRIS-FRONTIER-SOURCE-001 — P1 / BLOCKED_CANONICAL_RAW_SOURCE
- `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is now frozen and canonical.
- Recover/hash the exact development trajectories, retained implementations/parameters, and metric code required by the protocol.
- If exact source cannot be recovered, output `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data.
- Confirmatory seeds `1000–1029` remain forbidden.

## 7 — DARCY-FREEZE-001 — P1 / WAITING_CANONICAL_SOURCE
- Freeze the dangerous learned/operator/OOD comparison before execution.
- Systems: numerical/reduced controls + matched learned operator family; equal budget; misaligned/correlation-length/held-out regimes.
- No run until data/version, metric, budget, uncertainty and falsifier are immutable.

## 8 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL
- Establish exact served revision and authenticated golden-journey truth.
- Deliver `/api/health` exact revision proof, deployment ID, production monitor PASS, disposable-account core workflow + cleanup record.
- Current failed monitor remains authoritative until superseded by verified production evidence.

## 9 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- The canonical programme is now one question: causal future-latent predictive-state recovery under noise/missingness.
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, objectives, TS-JEPA/data2vec/reconstruction/autoregressive/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives.

## 10 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score after the tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY:** merged to `LAM-JEPA/main` as `fe42aae9e14e6e42391a84b1f1b50de737a5b708`; numerical figure regeneration and owner/external gates remain separate tasks.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** development-only false-open constrained frontier protocol merged as `40928703c177df227c73e27e7b22436da5aa2bcc`; execution is source-blocked.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded programme merged as `3a5c160c2374fa98fdc8d84c795af8fdb921e88d`; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

No new major scientific experiment is immediately authorized. IRIS is source-recovery only; Darcy requires a freeze; JEPA×time-series requires a separate executable cheap-screen freeze; NeuroCAD research is deprioritized after the validation-confound falsifier. LAM is verification/release/external-review only. Unused compute capacity should remain unused rather than generate low-information experiments.
