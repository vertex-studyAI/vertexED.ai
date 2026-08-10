# Project 2424 — Execution Evidence

**Session date:** 10 August 2026

This ledger records only evidence actually observed during the current GitHub-connected execution session. It separates executed candidate work from full research completion.

## First-100 queue

Canonical queue commit on `main`: `f7c8ff7edd693f7daa0d2fc28e9a821eeb0d2702`  
Files: `FIRST_100_EXECUTION_WAVE.md`, `FIRST_100_QUEUE.ndjson`, `PROJECT_2424_FIRST_100.md`, `EXECUTION_QUEUE.md`, `MORNING_HANDOFF.md`  
Observed result: 100 entries are selected into an evidence-first execution wave. Selection is not paper-ready or completion evidence.

Current evidence boundary:

- queue defined: 100 / 100
- candidate packages implemented/executed: 2 / 100
- dedicated GitHub reproductions passed: 2 / 100
- cheap-screen hypotheses passed: 1 / 100
- negative/inconclusive hypotheses preserved: 1 / 100
- fully certified complete under all nine acceptance requirements: 0 / 100

## T2424-1767 — Resource-Bounded Mixture-of-Experts benchmark

Project: `T2424-1767`  
Branch: `agent/t2424-1767-resource-bounded-moe-20260810`  
Draft PR: #156  
Recorded branch head after evidence update: `119fc95a7a42c3d831a3801e4bbaad40abe63cd2`

Artifacts:

- dependency-free affine baseline;
- learned threshold top-1 two-expert MoE;
- deterministic piecewise synthetic benchmark;
- globally linear negative control;
- regression suite;
- `README.md`, `RESULTS.md`, `STATUS.md`, package metadata;
- path-scoped GitHub Actions reproduction workflow.

Observed execution evidence:

- regression suite: 4 tests passing in the retained package evidence;
- 20-seed piecewise baseline mean RMSE: `1.191554`;
- 20-seed MoE mean RMSE: `0.178297`;
- mean relative improvement: `85.002%`;
- routing: `1 / 2` experts active per sample;
- linear negative-control mean relative improvement: `-1.010%`;
- dedicated reproduction runs `31408111421` and `31408207187`: success;
- repository CI run `31408207087`: build/test, local accessibility browser gate, and production browser certification succeeded; PR-only production smoke was skipped by workflow condition.

Verdict: `PASS_CHEAP_FALSIFICATION_SCREEN`.

Known limitations: synthetic 1D data, simple affine experts/router, branch later diverged behind moving `main`, no real scientific dataset, no independent scientific QA beyond the dedicated CI reproduction. No scientific superiority or publication-readiness claim is authorized.

## T2424-1863 — Resource-Bounded local diffusion operator

Project: `T2424-1863`  
Branch: `agent/t2424-1863-local-diffusion-operator-20260810`  
Draft PR: #158  
Recorded branch head: `8317146f65a4b0359528dfc57ff9dfe5a8caeca1`

Predeclared cheap-screen requirement: mean held-out one-step RMSE improvement **>75%** over persistence on synthetic diffusion while recovering the planted coefficient near `0.18` and using a 3-point local stencil.

Observed execution evidence:

- initial >75% effect-size assertion failed and was not relaxed after observing the result;
- regression suite preserves the failed gate and passes 4 tests in retained package evidence;
- 20-seed mean learned coefficient: `0.179689`;
- mean persistence RMSE: `0.015610`;
- mean operator RMSE: `0.005023`;
- mean relative improvement: `67.777%` — below the predeclared gate;
- zero-diffusion negative-control mean relative improvement: `-0.029%`;
- dedicated reproduction run `31408660274`: success;
- repository CI run `31408660116`: canonical build/test, local keyboard-accessibility browser certification, and production browser certification all succeeded; PR-only production smoke was skipped by workflow condition.

Verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

Known limitations: synthetic one-step diffusion, scalar coefficient, no real PDE benchmark, no long-horizon rollout, no FNO/DeepONet/PINO comparison, independent scientific QA pending.

## Other Project 2424 / portfolio execution observed on main

`e956ec60e8fe9675cb0ca90f8a11df403458890c` merged a falsifiable asteroid tracklet baseline under `portfolio/new-projects/`. It is a real prototype artifact, but it is not being silently counted as one of the First-100 queue entries without an explicit queue mapping.

## Connected GitHub repository surface

Observed accessible repositories under the connected installation:

- `vertex-studyAI/vertexED.ai`
- `vertex-studyAI/LAM-JEPA`
- `vertex-studyAI/Text-To-Video`

Observed limitation: Project 2424's canonical PRO-BLADE source, FinanceMeta, The Bu1LD, Atlas, and Percy do not resolve as writable connected repositories in this session. Therefore canonical-source restore, FinanceMeta target application, Bu1LD target fixes, and Percy local DB repair are external-access blocked here rather than silently marked complete.

## VertexED production boundary

Repository: `vertex-studyAI/vertexED.ai`

Observed source/CI state: current repository work has repeatedly passed canonical source and browser gates on exact PR heads.

Observed live-production evidence retained in issue #137:

- latest recorded scheduled production-health failure in the fetched issue history: run `31402868158` against workflow commit `fa413b4096c88aac9801eb9b25bdddcc0515dd09`;
- last retained direct production probe returned HTTP 200 but no JSON `revision` field and no `X-VertexED-Revision` response header.

Verdict: production immutable-revision identity remains unresolved. Successful source CI or Vercel commit statuses must not be promoted to a claim that the public domain serves the latest source revision.

Authenticated production certification remains separately blocked on disposable-account evidence.

## LAM-JEPA

Repository: `vertex-studyAI/LAM-JEPA`

Observed state: substantial ARC-v5 research execution already exists. The retained scientific verdict is negative/inconclusive; no confirmatory-test or research-complete claim is authorized.

## Text-To-Video

Repository: `vertex-studyAI/Text-To-Video`

Observed state: local media encoding / render validation work exists. Production queue ownership, hosting, retries, durable storage, real narration, and public media delivery remain outside the proven boundary.

## Safety boundary

No production deployment, destructive migration, force-push, credential rotation, secret disclosure, fabricated benchmark, fabricated test pass, or fabricated research result is claimed by this ledger update.
