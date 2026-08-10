# Execution Evidence

Updated: 10 August 2026

Only achievements with concrete GitHub evidence are recorded as completed.

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

## Project 2424 — First 100 queue

Project: Project 2424  
Source PR: #155  
Current artifacts: `portfolio/project2424/FIRST_100_EXECUTION_WAVE.md`, `portfolio/project2424/FIRST_100_QUEUE.ndjson`, `tests/project2424First100Queue.test.mjs`  
Result: 100 evidence-gated candidates are represented as an execution queue rather than falsely marked complete.  
State: VERIFYING on latest PR head; do not count as merged/completed until current CI passes and the PR is merged.  
Known limitations: registry metadata is not implementation, experiments, or paper readiness; the canonical Project 2424 source remains inaccessible to the connected GitHub installation.

## Repository discovery evidence

Repositories visible to the connected GitHub App during this execution window:

1. `vertex-studyAI/vertexED.ai` — public, admin/write access.
2. `vertex-studyAI/LAM-JEPA` — public, admin/write access.
3. `vertex-studyAI/Text-To-Video` — private, admin/write access.

No `Atlas`, canonical Project 2424, FinanceMeta, Bu1LD, or Percy repository was returned by the current GitHub installation. Those areas therefore remain explicitly blocked rather than being counted as inspected source.

## Live-release boundary

Before this execution, `vertexED.ai` main `fa413b4096c88aac9801eb9b25bdddcc0515dd09` had successful GitHub commit-status contexts for both configured Vercel projects. This is deployment-status evidence only. The open production gate remains exact proof of the immutable SHA served by `www.vertexed.app` plus authenticated production certification. No deployment was performed in this execution window.
