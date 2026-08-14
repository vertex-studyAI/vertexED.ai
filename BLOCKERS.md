# BLOCKERS

**As of:** 2026-08-14 12:01 IST  
Only blockers that prevent a stronger evidence claim are listed. A blocker is not failure unless the underlying hypothesis/gate failed.

## P0 — Percy authoritative live state

- **Observed:** connected GitHub can inspect repository evidence but cannot directly inspect the existing Percy Mac SQLite/WAL/process state.
- **Impact:** live queue depth, failed/running/stale tasks, leases/heartbeats, physical worker peak and dispatch counts remain `UNKNOWN`.
- **Resolution:** run `PERCY-STATE-001` on the existing host state: checksum DB+WAL+checkpoint, integrity/schema check, leases/heartbeats/stale reconciliation, raw counter snapshot and independent recount. No reset or replacement DB.

## P0 — VertexED exact production revision

- **Observed today:** scheduled Production Health Monitor run `31771831538` failed after three bounded attempts on current main because `/api/health` did not expose the expected revision `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`.
- **Also observed:** homepage, API 404, invalid-waitlist rejection, logged-out AI/user/admin denial and untrusted-origin denial passed. Both Vercel commit-status contexts on current GitHub head report success.
- **Impact:** source is GREEN and public boundaries are reachable, but exact served revision/production correctness remains unverified.
- **Evidence:** artifact `9208406163`, SHA-256 `f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b`.
- **Resolution:** identify canonical Vercel project, enable/verify immutable system revision exposure, deploy intended verified runtime revision, make scheduled monitor pass, then run issue #13 authenticated disposable-account journey.

## P0 — Project 2424 canonical source recovery

- **Observed:** selected experiment reproductions are retained, but the true source/dirty overlay recovery described by issue #20 depends on the preserved local/Inkling environment.
- **Impact:** do not use control-repo branch proliferation or proposal counts as current source truth.
- **Resolution:** preserve status/diffs/untracked overlay, bundle refs, verify `git fsck`/ancestry, rerun smallest baseline, then establish one child-project map.

## P0 — IRIS successor decision

- **Observed:** current successor development evidence is RED: ~5.33–5.36% abrupt-regime gain vs frozen `>=10%`; Huber is not cleanly beaten; coherent bursts remain adverse.
- **Impact:** reserved confirmatory seeds cannot be used to rescue the candidate.
- **Resolution:** either close the successor line or create a versioned successor whose changed hypothesis/mechanism is justified by failure evidence and whose baselines, metric, effect statistic, gate, falsifier and analysis plan are frozen before evaluation.

## P0 — NeuroCAD dangerous baseline / OOD

- **Observed:** controlled v1 is strong (`19/20` vs `12/20`; `12/12` valid STL) but small/template-controlled and not a same-provider learned direct-vs-IR comparison.
- **Impact:** arbitrary NLP-to-CAD/generalization claims remain unsupported.
- **Resolution:** freeze `NEUROCAD-FREEZE-001`, then run exactly one same-provider/OOD experiment with executable/semantic/error metrics and independent recomputation.

## P0/P1 — LAM-JEPA release/external review

- **Observed:** scientific result is reproducibly negative/inconclusive and paper artifacts exist. Root owner-approved `LICENSE` and `CITATION.cff` remain absent; authorship/release metadata cannot be guessed.
- **Impact:** paper package may be internally strong without being legally/bibliographically release-ready or externally validated.
- **Resolution:** complete internal provenance/table/figure verification; owner approves license/authorship/citation; then independent clean reproduction/reviewer attack.

## P1 — Darcy external/learned operator gate

- **Observed:** very strong frozen synthetic pressure-MAE screen; no learned matched-budget operator or physical OOD validation.
- **Resolution:** freeze numerical/reduced/learned controls, equal budget and held-out/misaligned regimes before run.

## P1 — APEN / Eigen-JEPA / NPMS

- **APEN:** matched learned control + naturalistic salience reliability missing.
- **Eigen-JEPA:** stronger spectral/statistical controls + frozen multi-dataset metric hierarchy missing.
- **NPMS:** stronger learned memory controls + natural/OOD task missing.
- **Resolution:** remain Tier A/secondary; no paper promotion until dangerous baselines/externalization are complete.

## P1 — Hercules / Olympus

- **Hercules:** no frozen same-budget Transformer/proposal/ablation evidence. Active training is killed until protocol freeze.
- **Olympus:** O0 roadmap/runtime only; O1 matched-provider monolithic/full/ablations not executed. Expansion is killed until O1 freeze.

## P1 — FinanceMeta / The Bu1LD target access

- **FinanceMeta:** canonical writable repo/production Supabase not exposed to current connector.
- **The Bu1LD:** canonical writable repo/production Supabase/Cloudflare deployment surface not exposed.
- **Resolution:** authorize the exact targets; then apply prepared work on isolated branches and verify real denial paths/journeys. Do not repeatedly mutate control-repo substitutes.

## P2 — PEN source identity

Standalone executable PEN source/protocol is not established. APEN evidence cannot be inherited. Recover source only if a distinct PEN claim remains strategically valuable.
