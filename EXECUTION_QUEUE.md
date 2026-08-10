# Execution Queue

Updated: 10 August 2026

State vocabulary: `TODO`, `RUNNING`, `BLOCKED`, `FAILED`, `VERIFYING`, `DONE`.

## P0 — VertexED source and release truth

### VX-147
Project: VertexED  
Priority: P0 security  
Expected artifact: verified password-recovery authorization boundary  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: merged commit `f5e7d1f3631f718e89bafaa539ec65516786c53a`; exact source head passed canonical CI #577 before merge.

### VX-152
Project: VertexED  
Priority: P0/P1 account isolation  
Expected artifact: stale-profile race fix  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: merged commit `6961002e3fa6a311a25d16d23f4b8ff742b02a0d`; exact source head passed canonical CI #580 before merge.

### VX-153
Project: VertexED  
Priority: P1 account isolation  
Expected artifact: transient Study Zone draft isolation  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: merged commit `02f16b8b89daabf27a99cab405a39de481c19d2f`; exact source head passed canonical CI #586 before merge.

### VX-149
Project: VertexED  
Priority: P1 correctness/cost  
Expected artifact: Apex prompt deduplication  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: merged commit `4e8648d6f453d1342b132703c52daac3c4e512df`; exact source head passed canonical CI #579 before merge.

### VX-161
Project: VertexED  
Priority: P1 reliability/cost  
Expected artifact: abort in-flight Apex network request on learner cancel/clear/scope change  
Dependencies: VX-149  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: stale stacked PR #150 was closed unmerged and replaced by clean current-main PR #161. Exact head `b89acab1cfae43b81cb956ea1379d2f2b523d641` passed canonical CI #617, including build/test, production browser certification, and local keyboard accessibility; squash merged as `5863d868dc9c68bac2dc21f1901abeb22823dde8`.

### VX-PROD
Project: VertexED  
Priority: P0 release  
Expected artifact: exact live immutable revision proof + authenticated production certification  
Dependencies: canonical Vercel project configuration and disposable production identities  
Assigned worker: external/account-boundary  
State: BLOCKED  
Evidence: issue #44 and #13. Repository source status and green Vercel commit statuses are not substitutes for exact live revision identity.

## P0 — Project 2424

### P2424-RESTORE
Project: Project 2424  
Priority: P0  
Expected artifact: verified canonical Git repository with preserved dirty overlay and rerun baseline  
Dependencies: local PRO-BLADE/Inkling source access  
Assigned worker: local Percy/Atlas environment  
State: BLOCKED  
Evidence: control issue #20 documents the source and required non-destructive recovery path.

### P2424-FIRST100
Project: Project 2424  
Priority: P0  
Expected artifact: evidence-first queue of 100 distinct projects with explicit next artifacts and go/no-go gates  
Dependencies: none for queue; restored source for implementation  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: PR #155 merged as `f7c8ff7edd693f7daa0d2fc28e9a821eeb0d2702`; exact latest-head build-and-test succeeded, including Project 2424 recovery-package verification and the canonical release gate. Certified project-completion count remains `0 / 100`.

### P2424-REAL1
Project: Project 2424  
Priority: P1  
Expected artifact: first newly counted runnable/tested project from the First-100 queue  
Dependencies: Project 2424 canonical source or a self-contained control-repo implementation with its own executable test gate  
Assigned worker: research/software factory  
State: TODO  
Evidence: do not increment the completed count until implementation + test/result evidence exists.

## P0/P1 — Portfolio blocked targets

### FM-TARGET
Project: FinanceMeta  
Priority: P0/P1  
Expected artifact: applied authorization hardening + target CI/release evidence  
Dependencies: GitHub write access to canonical FinanceMeta target and production Supabase access  
Assigned worker: external/account-boundary  
State: BLOCKED  
Evidence: control issue #19/#22.

### BUILD-TARGET
Project: The Bu1LD  
Priority: P0/P1  
Expected artifact: immutable deployed source + hydration fix + seven role-journey certification  
Dependencies: canonical GitHub/Supabase/Cloudflare target access  
Assigned worker: external/account-boundary  
State: BLOCKED  
Evidence: control issue #16/#84/#22.

### PERCY-SNAPSHOT
Project: Percy  
Priority: P0  
Expected artifact: backward-compatible snapshot migration + worker liveness proof  
Dependencies: local Percy source and SQLite DB  
Assigned worker: local execution environment  
State: BLOCKED  
Evidence: control issue #95.

## P1 — Research / demo

### LAM-EXT
Project: LAM-JEPA  
Priority: P0 research credibility  
Expected artifact: externally grounded benchmark package with strong baselines, >=5 seeds, ablations, robustness, raw artifacts and independent verifier  
Dependencies: benchmark protocol/data and compute  
Assigned worker: research lane + independent QA  
State: TODO  
Evidence: LAM-JEPA issue #10/#38; current repaired validation does not authorize superiority/research-complete claims.

### VIDEO-NEXT
Project: Notes-to-Video  
Priority: P1  
Expected artifact: either polished local-demo release package or production-grade render queue/storage boundary  
Dependencies: product choice; production infrastructure if taking hosted path  
Assigned worker: demo/product lane  
State: TODO  
Evidence: `vertex-studyAI/Text-To-Video@f33195695a94b352e4470477b57d1d7de76461da` documents real local MP4 proof and the current production boundary.
