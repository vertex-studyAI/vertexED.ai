# MASTER_STATUS

**As of:** 2026-08-14 12:35 IST closure audit  
**Latest control evidence incorporated:** `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`  
**LAM-JEPA head observed:** `88f759ef47263c416f2a667427286a3284d8221c`

## Status semantics

Two status layers are intentionally separate:

1. **Claim-specific evidence status** — e.g. implementation GREEN, reproducible negative GREEN, production BLOCKED. These can coexist because they answer different claims.
2. **Portfolio state** — exactly one of `A PUBLISH`, `B PRODUCTIZE`, `C CONTINUE EXPERIMENTATION`, `D NEGATIVE RESULT`, `E ARCHIVE`, `F EXTERNALLY BLOCKED` for each canonical project.

`PORTFOLIO_SNAPSHOT.md` is authoritative for the one-state A–F disposition. `IMPLEMENTED`, `TESTED`, `REPRODUCED`, `PAPER PACKAGE`, `LIVE`, `EXTERNALLY VALIDATED`, `PRODUCTION`, `SUBMITTED`, `PUBLISHED` and `ACCEPTED` remain distinct claim states.

## Portfolio dashboard

| Project | Claim-specific evidence status | Portfolio state | Boundary / next gate |
|---|---|---|---|
| LAM-JEPA | **GREEN — reproducible negative scientific result** | **A — PUBLISH** | ARC superiority/planner/target claims unsupported; locked test untouched; finish negative-result paper/release provenance and independent review |
| IRIS v0.2 | **GREEN — reproduced mixed/negative package; successor promotion RED** | **D — NEGATIVE RESULT** | ~5.33–5.36% abrupt gain misses frozen `>=10%` gate; no new successor architecture authorized; reserved confirmatory seeds `1000–1029` remain quarantined |
| NeuroCAD | **GREEN — v1 bounded software result preserved; GREEN — v2 validation-dominant mechanism falsification** | **C — CONTINUE EXPERIMENTATION** | v1 remains `19/20` vs direct `12/20` with `12/12` valid STL. Frozen v2 shows direct+matched validation `20/20`, equal to current typed/validated `20/20`, recovery fraction `1.0`; typed-IR/parser-specific causal claim is dead on this diagnostic. Only a separately frozen learned/constrained + broader-OOD reliability/coverage question remains eligible |
| Project 2424 umbrella | **GREEN only for selected bounded child reproductions; canonical source recovery blocked** | **B — PRODUCTIZE** | registry/project count is not scientific completion; recover preserved source/overlay and maintain one canonical child map |
| Darcy T2424-0050 | **GREEN — bounded synthetic mechanism** | **C — CONTINUE EXPERIMENTATION** | learned matched-budget operator + held-out/OOD physical regimes required |
| T2424-0025 | **GREEN — reproduced precursor; mechanism not unique** | **C — CONTINUE EXPERIMENTATION** | isolate learned sequence mechanism; cannot be relabeled as NGMT success |
| NGMT v0.1 | **GREEN — reproducible negative learned result** | **D — NEGATIVE RESULT** | both adverse superiority gates fail; no in-place rescue |
| APEN | **GREEN — reproduced controlled mixed result** | **C — CONTINUE EXPERIMENTATION** | matched learned/naturalistic baseline + salience-quality stress |
| PEN | **BLOCKED — executable source not recovered** | **F — EXTERNALLY BLOCKED** | recover distinct executable source; APEN evidence cannot transfer |
| Eigen-JEPA | **GREEN — reproduced mixed/negative real-data result** | **D — NEGATIVE RESULT** | superiority claim unsupported; any new multi-dataset study must be a separately frozen version |
| NPMS | **GREEN — controlled reproduced evidence** | **C — CONTINUE EXPERIMENTATION** | stronger learned memory controls + natural/OOD task |
| T2424-0027 | **GREEN — synthetic audit only** | **C — CONTINUE EXPERIMENTATION** | real multilingual encoder + preregistered probes required |
| T2424-0028 | **GREEN — bounded mechanics** | **E — ARCHIVE** | reactivate only with serious external rate-distortion/noisy-signal gate |
| T2424-0029 | **GREEN — bounded analytic screen** | **E — ARCHIVE** | reactivate only with nonlinear PDE + learned comparison |
| T2424-1863 | **GREEN — reproducible negative screen** | **D — NEGATIVE RESULT** | frozen `>75%` gate failed; no tuning; new real-PDE question must be separately frozen |
| Hercules | **YELLOW — learned claim untested** | **E — ARCHIVE** | one canonical mechanism + frozen matched-budget Transformer/proposal/ablation gate required before reactivation |
| Olympus | **YELLOW — O0 runtime/spec only** | **E — ARCHIVE** | matched-provider O1 monolithic/full/ablation protocol required before reactivation |
| Percy | **BLOCKED for live host qualification; repository/control artifacts exist** | **F — EXTERNALLY BLOCKED** | existing Mac/PRO-BLADE SQLite/WAL/process state is unavailable here; first host action is non-destructive state snapshot/integrity/recount, never reset |
| VertexED | **Source gates GREEN; production identity BLOCKED** | **F — EXTERNALLY BLOCKED** | production monitor `31771831538` failed 3/3 on missing `/api/health` revision; exact served SHA + disposable-account authenticated golden journey required |
| FinanceMeta | **BLOCKED — canonical writable target/live Supabase unavailable** | **F — EXTERNALLY BLOCKED** | restore target GitHub/Supabase authorization before target mutation or user validation |
| The Bu1LD | **BLOCKED — canonical writable target/deployment unavailable** | **F — EXTERNALLY BLOCKED** | restore repo/deployment/Supabase access before seven-role production validation |
| Text-to-Video | **Existing engineering system; current portfolio claim untriaged** | **E — ARCHIVE** | explicit owner/job/success metric and evidence-triggered reactivation required |

## Portfolio tier cap

**Tier S active priorities: 3** — LAM-JEPA, IRIS v0.2 closure, Percy reliability/provenance.  
**Tier A:** NeuroCAD narrowed reliability/OOD test, Project 2424 canonicalization, Darcy, T2424-0025, NGMT negative package, APEN, Eigen-JEPA, NPMS, VertexED production qualification.  
Everything else is Tier B, archived or externally blocked unless a documented gate changes.

Tier and state are independent: a Tier-S project can be `D` because closing an important negative result is high priority, or `F` because removing a critical external blocker is high priority. NeuroCAD is demoted from Tier S because its first causal-ablation attack fully explained the bounded benchmark gap with matched validation alone.

See `PORTFOLIO_SNAPSHOT.md`, `PORTFOLIO_CANONICALIZATION.md`, `CLAIM_LEDGER.md/json`, `EXPERIMENT_LEDGER.md/json`, `RESEARCH_FAILURE_ATLAS.md`, `ORIGINALITY_AUDIT.md`, `ARCHIVE_AND_KILL_LIST.md` and `NEXT_TASK_QUEUE.md/json` for the canonical evidence and execution policy.

## Percy accounting boundary

Retained registry specification: **16,256 logical identities**, `P00000..P16255`, **127 squads × 128**. This is not physical concurrency. Because the real Percy SQLite/WAL/process state is not observable here, `unique_agents_dispatched`, `physical_peak`, `complete`, `failed`, `blocked`, `queued`, `never_dispatched` and stale-worker counts remain **UNKNOWN** until `PERCY-STATE-001` runs against the existing host state.

Do not initialize a replacement database, discard WAL/history, or infer live counters from registry files.

## Repository/branch boundary

- `vertexED.ai/main` is the cross-portfolio control-document truth source once reviewed changes merge.
- `LAM-JEPA/main` is the LAM scientific artifact truth source.
- Large historical branch populations are provenance, not active project count. Do not mass-delete until unique evidence is ruled out.
- The public `build-the-future-11/IRIS` repository is a placeholder rather than the recovered IRIS scientific source; use retained control/evidence artifacts until canonical source recovery improves.

## Frozen non-rescue rule

LAM-JEPA, IRIS v0.2/current failed successor, NGMT v0.1, Eigen-JEPA, T2424-1863 and the NeuroCAD typed-IR/parser-specific v2 mechanism claim must not be retuned in place. New scientific mechanisms require a new version, changed hypothesis, frozen protocol/falsifier and preserved relationship to the predecessor before confirmatory evaluation.
