# NEXT TASK QUEUE

**Generated:** 2026-08-14  
**Rule:** this is a dependency-aware closure queue, **not** a replacement for the live Percy DB. Do not insert duplicate tasks into Percy until the existing host queue/checkpoint has been recovered and reconciled by ID/semantic equivalence.

Compute classes: `C0` analysis/docs/CPU-minutes · `C1` laptop/small local · `C2` modest GPU/cloud after gate · `C3` larger work requiring explicit promotion.

## 1 — PERCY-HOST-RECOVER-20260814

- **Project:** Percy
- **Objective:** recover trustworthy live control-plane state without resetting or deleting history.
- **Dependency:** `/Volumes/PRO-BLADE/Atlas/Percy` mounted/reachable.
- **Exact deliverable:** `evidence/PERCY_RUNTIME_RECOVERY_20260814.md` + `.json` containing DB path/schema/version, `PRAGMA integrity_check`, WAL presence/state, online backup hash, task counts by canonical state, leases, heartbeats, worker process/liveness classification, failed/stale preservation, worktree/dirty state, disk/provider/resource health.
- **Evidence requirement:** exact commands, timestamps, DB/backup hashes, non-secret process/task identifiers, before/after migration state if any.
- **Verification:** independent read-only snapshot command and second SQLite integrity check against backup.
- **Success criterion:** existing history is intact and all formerly `UNKNOWN` live counters become measured or individually explained.
- **Failure criterion:** DB inconsistency, missing history, unreconciled schema mismatch, or worker state cannot be proven; fail closed and do not create replacement queue.
- **Estimated compute:** C0–C1.
- **Priority:** P0.
- **Canonical artifact destination:** existing Percy host evidence directory; mirror only non-secret summary to control repo.

## 2 — VERTEX-PROD-REVISION-20260814

- **Project:** VertexED
- **Objective:** certify which immutable source revision production is serving.
- **Dependency:** canonical Vercel project/deployment configuration access.
- **Exact deliverable:** `docs/production/REVISION_CERTIFICATION_20260814.md` recording canonical project, deploy ID, expected runtime revision, `/api/health` body/header revision, monitor run and artifact.
- **Evidence requirement:** current failure is retained run `31771831538`, expected revision `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`, artifact `9208406163`, artifact SHA-256 `f08d3ece023eaaec205dc46248c48a17cb057b25a9d8389f3ebd813583cf610b`.
- **Verification:** rerun canonical production monitor unchanged; all existing public smoke/security assertions must still pass and revision must equal expected immutable SHA.
- **Success criterion:** production health body/header exposes exact expected revision and monitor passes.
- **Failure criterion:** missing/mismatched revision or any prior smoke/security check fails; production stays blocked.
- **Estimated compute:** C0.
- **Priority:** P0.
- **Canonical artifact destination:** VertexED production evidence/docs + GitHub Actions artifact.

## 3 — LAM-NEGATIVE-PAPER-CLOSE-20260814

- **Project:** LAM-JEPA
- **Objective:** finish the negative/reproducibility paper package without scientific retuning.
- **Dependency:** frozen ARC evidence on `88f759ef47263c416f2a667427286a3284d8221c` and retained artifact `9162165932`.
- **Exact deliverable:** complete manuscript/result tables/figures/repro bundle + final claim/provenance checklist; unresolved owner-only license/authorship/citation fields explicitly blocked rather than guessed.
- **Evidence requirement:** every manuscript result links to raw/processed artifact, frozen config, commit and table/figure command; locked ARC test remains untouched.
- **Verification:** independent table recomputation and claim-boundary audit against `CLAIM_LEDGER`.
- **Success criterion:** no unsupported superiority/planner/target claim; clean reproduction regenerates headline result; all remaining blockers are external/owner decisions.
- **Failure criterion:** numbers cannot be regenerated or prose exceeds evidence boundary.
- **Estimated compute:** C0–C1.
- **Priority:** P0.
- **Canonical artifact destination:** `vertex-studyAI/LAM-JEPA` paper/reproducibility directories.

## 4 — NEUROCAD-DIRECT-IR-FREEZE-20260814

- **Project:** NeuroCAD / T2424-0037
- **Objective:** preregister the decisive same-provider learned direct-generation vs typed-IR experiment and OOD suite.
- **Dependency:** canonical current NeuroCAD source/runner and frozen v1 evidence.
- **Exact deliverable:** `protocols/neurocad_direct_vs_ir_v2.json` + human-readable protocol containing provider/model/version, prompt budget, retries, valid/invalid/OOD families, scoring, primary metric, effect gate, seeds/determinism, compute cap and falsifier.
- **Evidence requirement:** protocol hash created before outcome execution; frozen v1 cases/results remain unchanged.
- **Verification:** independent reviewer can determine the winner and falsifier from protocol alone.
- **Success criterion:** no degree of freedom needed after results to define the primary comparison.
- **Failure criterion:** model/provider, scoring, prompt set construction or advancement threshold remains ambiguous.
- **Estimated compute:** C0.
- **Priority:** P0/P1.
- **Canonical artifact destination:** canonical NeuroCAD/T2424-0037 protocol directory.

## 5 — IRIS-CANONICAL-RECOVER-AND-FREEZE

- **Project:** IRIS
- **Objective:** recover the exact v0.2 source/manifest and decide closure vs one successor development lineage.
- **Dependency:** canonical IRIS source/data manifest availability.
- **Exact deliverable:** `IRIS_SUCCESSOR_DECISION_20260814.md`; if continuing, a hashed successor protocol with changed hypothesis, reason for change, baseline family, dev seeds, protected confirmatory seeds, primary metric/effect, >=10% advancement rule or justified frozen replacement, falsifier and analysis plan.
- **Evidence requirement:** retain current ~5.33–5.36% gate miss, Huber comparison and coherent-burst failure unchanged.
- **Verification:** compare successor document against current negative claim ledger; confirm no reserved confirmatory seed is used.
- **Success criterion:** either current line is conclusively closed or exactly one successor is preregistered with no goalpost leakage.
- **Failure criterion:** canonical source cannot be recovered or successor definition depends on confirmatory outcomes.
- **Estimated compute:** C0.
- **Priority:** P1.
- **Canonical artifact destination:** IRIS canonical repo/evidence directory.

## 6 — P2424-CANONICAL-SURVIVORS-20260814

- **Project:** Project 2424
- **Objective:** reconcile project identities and reduce active science to evidence-backed children.
- **Dependency:** canonical Project 2424 source/registry or preserved source bundle.
- **Exact deliverable:** one registry export mapping ID → canonical source → evidence → status → duplicate parent → next gate; archive list for near-duplicates.
- **Evidence requirement:** preserve source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`, artifact `9162627168` and historical variants; do not rewrite source history.
- **Verification:** duplicate/identity audit; every promoted child has one canonical ID/status/command/artifact/verifier boundary.
- **Success criterion:** no duplicate active variants and at most the selected evidence-backed research children remain priority work.
- **Failure criterion:** contradictory identities/statuses remain unresolved.
- **Estimated compute:** C0–C1.
- **Priority:** P1.
- **Canonical artifact destination:** Project 2424 registry/status directory.

## 7 — LAM-INDEPENDENT-REPRO-PACKET

- **Project:** LAM-JEPA
- **Objective:** create a self-contained external reproduction/reviewer packet.
- **Dependency:** Task 3 internal paper/repro closeout.
- **Exact deliverable:** checksummed bundle containing immutable commit, install/reproduce instructions, config, raw/processed evidence manifest, expected headline table, claim ledger and reviewer questions.
- **Evidence requirement:** no credentials/private data; no locked ARC test outputs.
- **Verification:** dry-run bundle from a clean extraction before sending.
- **Success criterion:** an independent person can rerun and state the supported claim without hidden instructions.
- **Failure criterion:** hidden local path/state or undocumented manual step is required.
- **Estimated compute:** C0–C1.
- **Priority:** P1.
- **Canonical artifact destination:** LAM release/repro bundle directory + `EXTERNAL_VALIDATION_QUEUE.md` reference.

## 8 — NGMT-V01-NEGATIVE-CLOSE

- **Project:** NGMT v0.1
- **Objective:** freeze the reproduced negative learned experiment as a final evidence package.
- **Dependency:** retained B0/B1/B2/B3 runs/artifacts.
- **Exact deliverable:** `NGMT_V01_NEGATIVE_RESULT.md/json` with question, frozen gates, exact arm budgets, seed results, uncertainty, failure interpretation, limitations and reproduction command.
- **Evidence requirement:** B3-v-B2 and B3-v-B1 failures plus clean-regression pass; no post-result tuning.
- **Verification:** independent recomputation of all three gate statistics.
- **Success criterion:** negative result is reproducible and v0.1 is closed.
- **Failure criterion:** artifact/statistic mismatch; reopen reproduction defect only, not model tuning.
- **Estimated compute:** C0.
- **Priority:** P1.
- **Canonical artifact destination:** canonical NGMT/T2424 evidence directory.

## 9 — P2424-ONE-DECISIVE-BASELINE-SELECTION

- **Project:** Darcy / APEN / NPMS / T2424-0027
- **Objective:** choose exactly one additional experimental line for Week 2 by expected information gain, not prestige.
- **Dependency:** Task 6 canonicalization.
- **Exact deliverable:** `P2424_NEXT_SCIENCE_GATE.md` comparing one dangerous baseline/falsifier and estimated compute for each candidate, then selecting one experiment only.
- **Evidence requirement:** frozen current result, missing dangerous baseline, estimated cost and explicit kill criterion per candidate.
- **Verification:** selection can be reproduced from predeclared scoring; no outcome from new experiments used in selection.
- **Success criterion:** one winner occupies scientific slot 3; all others stay queued/archived.
- **Failure criterion:** more than one line is launched without a freed slot or selection criteria remain subjective.
- **Estimated compute:** C0.
- **Priority:** P1.
- **Canonical artifact destination:** Project 2424 research-gate directory/control repo mirror.

## 10 — PRODUCT-ACCESS-BOUNDARY-REFRESH

- **Project:** FinanceMeta + The Bu1LD
- **Objective:** determine whether either canonical product target is newly writable/inspectable, without repeated blind retries.
- **Dependency:** GitHub/Supabase/Cloudflare authorization controlled outside this repo.
- **Exact deliverable:** `PRODUCT_ACCESS_BOUNDARY_20260814.md` recording installed GitHub owners/repos, visible Supabase projects, deployment connector availability, and exact blocker per product; no secret values.
- **Evidence requirement:** connector installation/project listings and one safe read/write-permission probe where supported.
- **Verification:** compare against open access issue #22; do not infer access from old control-repo branches.
- **Success criterion:** one product can enter a real security/production-validation slot with canonical target access, or both remain explicitly externally blocked.
- **Failure criterion:** source-only patch is misrepresented as target mutation/production validation.
- **Estimated compute:** C0.
- **Priority:** P1.
- **Canonical artifact destination:** control repo product-access ledger; canonical product repo only after access exists.

## Dispatch rule

Tasks 1–10 are ordered by dependency and closure value. Do not fan them into hundreds of generic subtasks. A child task is permitted only when it has a concrete artifact/evidence output and a unique dependency that cannot be represented inside the parent task.
