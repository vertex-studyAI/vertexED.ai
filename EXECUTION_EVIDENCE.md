# Execution Evidence

Updated: 11 August 2026

Only achievements with concrete GitHub, CI, or read-only connected-service evidence are recorded as completed. First-100 counting also requires the implementation identity to match the frozen queue assignment.

## 11 August 2026 continuation

### Project 2424 — T2424-0046 Auto-Research Foundry recovery

Project: Project 2424  
Source PR: #192  
Exact verified head: `88dad71acca583a80ae2496b1278f88a825b4766`  
Verification before merge: canonical CI run `31414879015` / #665 — success  
Merge commit: `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502`  
Result: deterministic manifest validation, dependency/wave planning, CPU-budget selection and evidence-gated completion mechanics are now on `main`. The package deliberately does not execute manifest commands and does not claim scientific correctness.  
Superseded PR: #189 closed unmerged after the clean recovery path landed.

### Project 2424 — Benchmark Augmentation Theory auxiliary artifact

Project: Project 2424 auxiliary tested work  
Initial recovery PR: #193 became non-mergeable after `main` advanced; it was not force-pushed.  
Clean recovery PR: #199  
Exact verified head: `b1342b274157786c2885b54cfa10f9b63b4b6200`  
Verification before merge: canonical CI run `31449794955` / #679 — success  
Merge commit: `615fb12f26963a355553f10379df85d26323c4ea`  
Result: deterministic synthetic shortcut-exposure audit mechanics, runnable experiment and six regressions are on `main`.  
Identity correction: subsequent frozen-queue reconciliation established that `T2424-0050` / rank 43 is **Darcy Latent Operator**, not Benchmark Augmentation Theory. Therefore this tested artifact is **excluded from the queue-consistent First-100 count** while it occupies the colliding path.  
Current repair: PR #210 preserves the benchmark audit under auxiliary identity `AUX-P2424-BENCHMARK-AUGMENTATION`, restores Darcy Latent Operator to the canonical T2424-0050 path, repoints the benchmark regression, and restores the Darcy regression/result package. Exact head `d502de803701c0be1d7e3306b30b8036824ca251` passed canonical CI run `31450427123` / #697. GitHub reports the PR mergeable. Its own boundary explicitly says **do not auto-merge or deploy**, so it remains unmerged and the current canonical count remains 10.  
Known limitations: benchmark audit is a synthetic mechanism only; no benchmark-validity theorem, semantic guarantee for arbitrary augmentations, real-model robustness or research-complete claim. Darcy is a deterministic 1D reduced-resistance mechanism screen only; no learned neural operator or real porous-media superiority claim.  
Superseded PRs: #191, #193 and earlier closed repair paths remain unmerged.

### Project 2424 — T2424-0053 Scientific Motif Dictionary recovery

Project: Project 2424  
Stale source PR: #179  
Clean recovery PR: #203  
Exact final-base head: `d01a1d2c12c7e2e2157e11c6bc92726edcbb1c29`  
Verification before merge: canonical CI run `31450035136` / #688 — success, including build/test, production browser certification and local keyboard-accessibility certification  
Merge commit: `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16`  
Result: normalized 1D scientific time-series motif-indexing prototype, synthetic experiment and regression suite are now on `main`.  
Known limitations: no scientific-meaning, novelty, multivariate, state-of-the-art or external-dataset-performance claim.  
Superseded PR: #179 closed unmerged.

### Project 2424 — T2424-0049 identity repair

Project: Project 2424  
Source PR: #201  
Exact verified head: `3023574cfdd6b94e8ec6fccb72deb0b726285ddf`  
Verification before merge: canonical CI run `31449904593` — success  
Merge commit: `a1b17cd6131ab6b18eacf1fed0657aea6f2cb7c7`  
Result: a frozen-queue identity collision was repaired without deleting useful work. Project24 Render was rehomed under an auxiliary identity, and canonical `T2424-0049` / rank 42 now contains **Multiphase Porous JEPA**.  
Claim boundary: deterministic heterogeneous porous-flow surrogate/latent mechanism only; not a trained JEPA, real porous-media benchmark, neural-representation superiority result, publication result or research-complete package.  
Counting result: canonical `T2424-0049` is queue-consistent and therefore counts once; auxiliary Project24 Render does not create an additional First-100 entry.

### Project 2424 — earlier queue-consistent additions needed for the current count

#### T2424-0025 Non-Gaussian Memory Transformer

Exact verified head: `2d01cb02a88e8ee1f58f87918c7a4252a268baf7`  
Canonical CI: `31413572999` — success  
Merge commit: `0eb46d07f7d23fccd1333e3c62617457ba3ba423`  
Result boundary: synthetic robust memory-aggregation mechanism only; no full Transformer, learned-attention or real-world robustness claim.

#### T2424-0030 Adaptive Theory Geometry in World Models

Exact verified head: `145a654c40c3fcc2a609031e380bec2846e2e8f8`  
Canonical CI: `31413316287` — success  
Merge commit: `0239fa06b29ec537f4163b487ffb7318a5ebee2e`  
Result boundary: interpretable synthetic one-step geometry mechanism only; no learned neural geometry, general world-model superiority or research-complete claim.

### Project 2424 — queue-consistent merged count

Current frozen-queue-consistent First-100 state on `main`:  
Runnable merged+verified: `10`  
Tested merged+verified: `10`  
Certified complete: `0 / 100`  
Research complete: `0`  
Auxiliary tested artifacts with registry-ID collisions: not counted as canonical entries.  
The nine-gate completion rule remains unchanged.

The ten currently counted queue-consistent packages are:

1. `T2424-0025` Non-Gaussian Memory Transformer;
2. `T2424-0030` Adaptive Theory Geometry in World Models;
3. `T2424-0034` Quant ML Visualizer;
4. `T2424-0036` Rubik's A* Intelligence;
5. `T2424-0038` Obscured Records Agent;
6. `T2424-0046` Auto-Research Foundry;
7. `T2424-0049` Multiphase Porous JEPA after PR #201 identity repair;
8. `T2424-0053` Scientific Motif Dictionary;
9. `T2424-1767` Resource-Bounded MoE Operator;
10. `T2424-1863` Resource-Bounded Local Operator for Scientific Forecasting.

PR #210 is exact-head green and would restore canonical `T2424-0050` as Darcy Latent Operator, but it remains outside the merged count until its explicit manual merge boundary is cleared. If it lands and the identity guard remains green, the queue-consistent count becomes 11; the auxiliary benchmark audit still does not add another registry project.

### VertexED — live Supabase security metadata

Project: VertexED production Supabase project visible through the connected Supabase integration  
Operation type: read-only metadata/advisor queries only  
Result:
- every listed public-schema table has RLS enabled;
- `auth_email_exists` and `handle_new_user` are the only observed public-schema `SECURITY DEFINER` functions, each with explicit `search_path` settings and no PUBLIC execute privilege;
- no public-schema views were present;
- security advisor warns that leaked-password protection is disabled;
- security advisor warns that the current Supabase Postgres build has security patches available;
- performance advisor reports two unused-index INFO notices only.
Known limitations: metadata/advisor evidence is not an authenticated end-to-end production journey or immutable-live-revision proof. No production mutation, credential rotation, DDL or index removal was performed.

### FinanceMeta — repository recovery evidence

Repository: `build-the-future-11/finance4all-global-reach`  
Visibility: connector-readable, correcting the older “not exposed” status  
Current-main security evidence: original profile UPDATE policy permits users to update their own profile row without itself constraining role/email changes; notification migration grants authenticated INSERT with `WITH CHECK (true)` despite trigger-only intent.  
Recovery branch: `cursor/membership-security-supabase-fix`  
Branch relationship: `41` commits ahead / `0` behind `main`  
Recovered hardening evidence includes later profile write boundaries, notification-policy removal, CI, E2E tests and release artifacts.  
Write blocker: connector branch creation and PR creation both returned `403 Resource not accessible by integration`.  
Result: exact recovery path is identified, but no target write, production migration or false “fixed” claim was made.

### The Bu1LD — repository recovery evidence

Repository: `ryangomez010/bu1ld-landing`  
Visibility: connector-readable, correcting the older “not exposed” status  
Branch evidence: `cursor/final-polish-admin-and-ux` and `cursor/member-hub-attention-queue` are each `0` commits ahead of `main`; no hidden unique work needs resurrection from those branches.  
Current-main release evidence: CI runs typecheck, lint, tests, build and release check; strict release mode additionally requires real Supabase schema/RLS verification.  
Repository-stated remaining external actions: database apply/verify, Supabase Auth URLs, deployment variables, email configuration and seven-role smoke tests.  
Known limitation: Bu1LD's Supabase project is not connected to the current Supabase integration, so production DB state was not guessed or modified.

## VertexED — password recovery authorization

Project: VertexED  
Commit: `f5e7d1f3631f718e89bafaa539ec65516786c53a`  
Source PR: #147  
Files changed: password-recovery marker, auth callback, reset-password route, regression tests  
Verification before merge: exact source head `1c9e5c5a86e42560736a7abc9be596486c1a16b3` passed canonical CI run `31398993528` / #577  
Result: password-reset authorization now requires the genuine Supabase `PASSWORD_RECOVERY` event and binds the session marker to the live account id.  
Known limitations: does not replace disposable-account production recovery testing.

## VertexED — stale profile race

Project: VertexED  
Commit: `6961002e3fa6a311a25d16d23f4b8ff742b02a0d`  
Source PR: #152  
Files changed: `src/contexts/AuthContext.tsx`, learner account-storage regression test  
Verification before merge: exact source head `89b40185726b26bfff5a4dba799712bf4a1f443c` passed canonical CI run `31399074472` / #580  
Result: delayed profile responses are rejected unless both the active user id and request epoch still match; profile state is cleared on identity change.  
Known limitations: source/CI evidence only; not a live production account-switch certification.

## VertexED — transient Study Zone account isolation

Project: VertexED  
Commit: `02f16b8b89daabf27a99cab405a39de481c19d2f`  
Source PR: #153  
Verification before merge: exact source head `ce78b9b4c1681eaef5a2685fbb263e2936af5610` passed canonical CI run `31399386499` / #586  
Result: Activity Log draft and SketchPad caption transient state clear when their authenticated account storage scope changes.  
Known limitations: no claim that all authenticated learner journeys are production-certified.

## VertexED — Apex prompt deduplication

Project: VertexED  
Commit: `4e8648d6f453d1342b132703c52daac3c4e512df`  
Source PR: #149  
Verification before merge: exact source head `ca7f82973d9eb39014912b91bf6d90f690c9bd5e` passed canonical CI run `31399023520` / #579  
Result: the newest Apex question is no longer included in both `history` and the separate `question` field; both server handlers defensively discard a trailing duplicate from older/malformed clients.  
Known limitations: no model-quality improvement is claimed; this is a context correctness/cost fix.

## VertexED — Apex request cancellation

Project: VertexED  
Commit: `5863d868dc9c68bac2dc21f1901abeb22823dde8`  
Source PR: #161  
Superseded PR: #150 was closed unmerged because it carried stale stacked history.  
Exact verified source head: `b89acab1cfae43b81cb956ea1379d2f2b523d641`  
Verification before merge: canonical CI run `31409138814` / #617 completed successfully. `build-and-test`, production browser certification, and local keyboard accessibility all passed.  
Failure repaired before merge: the first clean run exposed one brittle formatting-only history-contract assertion; 228/229 tests passed, including all new cancellation tests. The regression was rewritten to assert request semantics rather than one-line formatting, then the full gate passed.  
Result: Apex owns one `AbortController` per in-flight request, propagates its `AbortSignal` through authenticated fetch, and aborts on Cancel, Clear, account/thread scope changes, unmount, and request supersession while preserving the request-id guard.  
Known limitations: this is source/CI/browser evidence; it does not prove provider-side billing behavior or replace authenticated production journey certification.

## Asteroid Tracklet Baseline

Project: standalone portfolio research/software prototype  
Commit: `e956ec60e8fe9675cb0ca90f8a11df403458890c`  
Source PR: #145  
Exact verified source head: `aaab8d5a2ff1b02d0c489e5201f2f60803763ffa`  
Verification before merge: canonical CI run `31407928862` / #593 completed successfully.  
Artifacts: implementation package, tests, benchmark CLI, README, and two follow-on experiment contracts under `portfolio/new-projects/asteroid-tracklet-baseline/`.  
PR-recorded local project evidence: `PYTHONPATH=src pytest -q` -> 3 passed; 20-seed synthetic benchmark recorded precision `0.9787` and recall `0.8604`.  
Result: a runnable/tested falsifiable baseline for linking synthetic moving-object detections under an approximately constant angular velocity model.  
Known limitations: synthetic-only; no asteroid discovery, orbit determination, astronomical usefulness, novelty, or publication-readiness claim. It is not automatically counted as a Project 2424 First-100 completion because no queue mapping has been certified.

## Project 2424 — First 100 execution wave

Project: Project 2424  
Commit: `f7c8ff7edd693f7daa0d2fc28e9a821eeb0d2702`  
Source PR: #155  
Exact source head: `04e9bd43a2ea82cbe34e8df39b776c174c6023cc`  
Artifacts: `portfolio/project2424/FIRST_100_EXECUTION_WAVE.md`, `FIRST_100_QUEUE.ndjson`, `PROJECT_2424_FIRST_100.md`, `EXECUTION_QUEUE.md`, `EXECUTION_EVIDENCE.md`, `MORNING_HANDOFF.md`, and `tests/project2424First100Queue.test.mjs`.  
Verification: latest-head `build-and-test` job in CI run `31408112019` succeeded, including `Test Project 2424 recovery package` and the canonical release gate. The browser jobs were cancelled by workflow concurrency while main was moving; #155 changed no runtime product files.  
Result: 100 evidence-gated candidates are represented on main as an execution queue rather than falsely marked complete.  
Certified First-100 completion count: `0 / 100`.  
Known limitations: registry/queue metadata is not implementation, experiments, or paper readiness; historical/canonical Project 2424 source identity outside the recovered control-repo packages remains a separate provenance problem.

## Portfolio execution control

Project: portfolio control plane  
Commit: `31dcdd484e9f16db15329b868d9977f9c5940315`  
Source PR: #157  
Exact verified source head: `9ea3d6089d0be153826ec82deb271cea9550ffe2`  
Verification before merge: canonical CI run `31408777593` / #612 completed successfully.  
Artifacts: root `MASTER_PORTFOLIO_STATUS.md`, `EXECUTION_QUEUE.md`, `EXECUTION_EVIDENCE.md`, `CHECKPOINT.md`, and `MORNING_HANDOFF.md`.  
Result: connector-visible work and blockers are durably recorded on main with explicit truth boundaries.

## Repository discovery evidence

Repositories directly verified through the connected GitHub App in this continuation include:

1. `vertex-studyAI/vertexED.ai` — public, admin/write access.
2. `vertex-studyAI/LAM-JEPA` — public, admin/write access.
3. `vertex-studyAI/Text-To-Video` — previously connector-visible in the portfolio ledger.
4. `build-the-future-11/finance4all-global-reach` — public and readable; attempted branch/PR writes returned integration `403`.
5. `ryangomez010/bu1ld-landing` — public and readable; canonical `main` and stale branch relationships were inspected.

Atlas and Percy remain unavailable as canonical connector-visible repositories in this execution window. Project 2424 implementation packages are being recovered and verified inside `vertex-studyAI/vertexED.ai`; that does not erase the separate provenance question for historical/local Project 2424 source.

## Live-release boundary

No production deployment was performed in this continuation. Green GitHub CI and browser evidence are source/release-gate evidence only. The open VertexED production gate remains exact proof of the immutable SHA served by the public domain plus authenticated production certification.
