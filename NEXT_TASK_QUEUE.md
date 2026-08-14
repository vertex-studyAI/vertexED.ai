# NEXT TASK QUEUE

**Rescored:** 2026-08-14 after NeuroCAD falsification, IRIS frontier freeze, and LAM source-method closure  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard. No task exists solely to keep agents busy.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state, provider/resource snapshot.
- Verify independently against the preserved snapshot and raw SQLite/process queries.
- Success: actual queued/running/failed/blocked/stale/completed counts and physical worker truth become known.
- Failure: remain blocked; never create a replacement DB or reset failed runs to make counters look clean.

## 2 — P2424-CANON-001 — P0 / BLOCKED_EXTERNAL_SOURCE
- Re-establish the preserved canonical Project 2424 source/overlay and reconcile count/status contradictions.
- Deliver: verified HEAD/ancestry, dirty-overlay manifest/hashes, smallest baseline rerun, canonical child map and exact mapping from retained artifacts to source.
- Failure: block source-dependent new experiments; preserve bounded existing reproductions.

## 3 — LAM-VERIFY-002 — P0 / READY_INTERNAL
- Independently regenerate final negative-manuscript tables, intervals and evidence-backed figures from retained raw artifacts/config lineage.
- Deliver: source-data hashes, exact generation commands, generated artifact hashes, and claim→figure/table→raw→protocol→source provenance.
- Source-method reconciliation is already closed on current LAM main; do not rewrite it unless a verifier finds a factual mismatch.
- No new scientific seeds and no locked ARC test.
- Success: internal `GREEN — PAPER EVIDENCE PACKAGE`; external/release states remain separate.

## 4 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL
- Establish exact served revision and authenticated golden-journey truth.
- Deliver: `/api/health` exact revision proof, deployment ID, production monitor PASS, disposable-account core workflow + cleanup record.
- Current failed monitor remains authoritative until superseded by verified production evidence.
- Failure: production remains non-GREEN; no feature expansion to distract from certification.

## 5 — DARCY-FREEZE-001 — P1 / WAITING_CANONICAL_SOURCE
- Freeze the dangerous learned/operator/OOD comparison **before execution**.
- Systems: numerical/reduced controls + matched learned operator family where task-appropriate; equal budget; misaligned/correlation-length/held-out regimes.
- Deliver: data/generator version, systems, metric hierarchy, parameter/FLOP/training budget, seeds, uncertainty rule, minimum effect, falsifier and artifact destination.
- No run until canonical source is recovered and this freeze is immutable.

## 6 — IRIS-SOURCE-001 — P1 / BLOCKED_SOURCE
- Recover the exact canonical raw development trajectories, implementations, parameters and metric code required by frozen protocol `IRIS-FRONTIER-DEV-20260814`.
- Deliver: hashes, source/config map, environment manifest and a protocol-readiness verifier.
- Do **not** regenerate approximately equivalent synthetic data and call it canonical.
- Success: frontier becomes execution-ready on development seeds `0–9` only.
- Failure: record `PROTOCOL_BLOCKED`; v0.2 stays negative/mixed and no successor architecture is authorized.
- Confirmatory seeds `1000–1029` remain forbidden.

## 7 — NPMS-SOURCE-001 — P1 / SOURCE_RECOVERY
- Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Deliver: canonical source identity + hashes + clean rerun against retained compact evidence, or a precise `SOURCE_UNRECOVERED` verdict.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive the line as recovered bounded evidence rather than inventing a replacement implementation.

## 8 — EXTVAL-LAM-001 — P1 / WAITING_LAM-VERIFY
- After task 3 closes, send one immutable LAM package to an independent validator for reproduction + skeptical review, not endorsement.
- Retain validator identity/date, exact artifact revision, commands, discrepancies, and success/failure interpretation.
- Sending the package is not external validation GREEN; only returned independent evidence can change that state.

## 9 — NEUROCAD-NEWBENCH-FREEZE-002 — P2 / DEPRIORITIZED
- Do not tune or rescue the typed/parser mechanism on the old 20 cases.
- Only if higher-priority closure work leaves capacity: freeze a genuinely new compositional/part-family benchmark plus a competent contemporary direct/program-generation baseline under matched backend/provider/budget and execution/semantic metrics.
- If a fair fresh benchmark cannot be frozen without method-specific leakage, keep NeuroCAD product/engineering only.
- No implementation of a new parser/IR architecture is authorized merely to preserve flagship status.

## 10 — PORTFOLIO-RESCORE-002 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after tasks above produce material evidence: real Percy state, LAM paper verification/external reproduction, Vertex production truth, IRIS source/frontier result, or Darcy/other decisive gates.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED:** development-only false-open-constrained frontier frozen; execution blocked on canonical raw source.
- `LAM-SOURCE-METHOD-001` — **CLOSED:** current LAM main pins exact ARC method/source boundary, including same-input EMA target and non-contextual token path.
- `NEUROCAD-COMPONENT-V2` — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one predictable-state question defined; no experiment authorized.
- PR #319 — **CLOSED UNMERGED**, history preserved.
- LAM PR #78 — **CLOSED UNMERGED AS SUPERSEDED**, current main retained the stronger canonical version.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.**

- Percy and Project 2424 need source/live-state recovery.
- LAM is paper/reproduction only.
- Darcy needs canonical source + frozen experiment manifest.
- IRIS has a frozen frontier but cannot execute until exact source/raw trajectories are recovered.
- NeuroCAD research is deprioritized after mechanism falsification.
- JEPA×time-series is programme design only and has no executable freeze.
- T2424-0027 remains Tier B synthetic evidence only; no real-encoder run is in the top queue.

Unused compute capacity should remain unused rather than generate low-information experiments.
