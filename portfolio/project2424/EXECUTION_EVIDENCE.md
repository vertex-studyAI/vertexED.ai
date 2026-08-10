# Project 2424 — Execution Evidence

**Session date:** 10 August 2026

This ledger records only evidence actually observed during the GitHub-connected execution session. It distinguishes executed artifacts from certified completion.

## First-100 execution boundary

Canonical queue on `main`: 100 entries in `FIRST_100_EXECUTION_WAVE.md` / `FIRST_100_QUEUE.ndjson`.

Current evidence:

- queue defined: **100 / 100**
- candidate packages implemented/executed: **2 / 100**
- dedicated GitHub reproductions passed: **2 / 100**
- predeclared cheap screens passed: **1 / 100**
- negative/inconclusive screens preserved: **1 / 100**
- fully certified complete under all nine acceptance requirements: **0 / 100**

## T2424-1767 — Resource-Bounded Mixture-of-Experts benchmark

Branch: `agent/t2424-1767-resource-bounded-moe-20260810`  
Draft PR: #156  
Recorded evidence head: `119fc95a7a42c3d831a3801e4bbaad40abe63cd2`

Artifacts include a dependency-free affine baseline, learned threshold top-1 two-expert MoE, deterministic piecewise benchmark, globally linear negative control, regression suite, retained results/status docs, package metadata, and a path-scoped GitHub Actions reproduction workflow.

Observed evidence:

- retained regression suite: **4 tests passing**;
- 20-seed baseline mean RMSE: `1.191554`;
- 20-seed MoE mean RMSE: `0.178297`;
- mean relative improvement: **85.002%**;
- routing: **1 / 2 experts active per sample**;
- linear negative-control mean relative improvement: **-1.010%**;
- dedicated reproduction runs `31408111421` and `31408207187`: success;
- repository CI run `31408207087`: canonical build/test, local accessibility browser gate, and production browser certification succeeded; PR-only production smoke was skipped by workflow condition.

Verdict: `PASS_CHEAP_FALSIFICATION_SCREEN`.

Boundary: synthetic-only; no real scientific dataset or independent scientific QA yet. The branch later diverged behind moving `main`. No scientific-superiority or publication-readiness claim is authorized.

## T2424-1863 — Resource-Bounded local diffusion operator

Branch: `agent/t2424-1863-local-diffusion-operator-20260810`  
Draft PR: #158  
Recorded evidence head: `8317146f65a4b0359528dfc57ff9dfe5a8caeca1`

Predeclared screen: mean held-out one-step RMSE improvement **>75%** over persistence on synthetic diffusion, coefficient recovery near `0.18`, 3-point local stencil, and a zero-diffusion negative control.

Observed evidence:

- the original >75% assertion failed and was **not relaxed after observing the result**;
- retained negative-result regression suite: **4 tests passing**;
- 20-seed learned coefficient mean: `0.179689`;
- mean persistence RMSE: `0.015610`;
- mean operator RMSE: `0.005023`;
- mean relative improvement: **67.777%** — below the predeclared gate;
- zero-diffusion control mean relative improvement: **-0.029%**;
- dedicated reproduction run `31408660274`: success;
- repository CI run `31408660116`: canonical build/test, local keyboard-accessibility browser certification, and production browser certification all succeeded; PR-only production smoke was skipped by workflow condition.

Verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

Boundary: synthetic one-step diffusion only; real PDE data, stronger neural-operator baselines, rollout stability, runtime/memory evidence, and independent scientific QA remain required.

## Other concrete portfolio execution observed this session

- `e956ec60e8fe9675cb0ca90f8a11df403458890c` on VertexED `main` merged a falsifiable asteroid tracklet baseline. It is not silently counted as one of the First-100 entries without an explicit queue mapping.
- Text-To-Video issue #6 was fixed and closed by merged squash commit `1d1ad2d027ca38e6fb0581ccf280333da454b672`: external-job and smoke media now stage away from the final MP4 path, promote only verified media, preserve prior output on failure, and expose explicit fail-closed provenance. Exact-head CI run `31409630201` passed the workspace release gate, real FFmpeg smoke encode, validated external render-job encode, and dependency audit.
- LAM-JEPA draft PR #54 adds evidence-backed release provenance and README claim-boundary links without inventing a license or authorship metadata. Legal/bibliographic owner approval remains intentionally unresolved.

## Connected GitHub surface

Accessible repositories observed:

- `vertex-studyAI/vertexED.ai`
- `vertex-studyAI/LAM-JEPA`
- `vertex-studyAI/Text-To-Video`

Project 2424's canonical PRO-BLADE source, FinanceMeta, The Bu1LD, Atlas, and Percy do not resolve as writable connected repositories in this session. Those workstreams remain external-access blocked here rather than silently marked complete.

## VertexED production boundary

The repository's retained public-production evidence still does not prove immutable live revision identity.

Latest fetched scheduled failure in issue #137: run `31402868158` against workflow commit `fa413b4096c88aac9801eb9b25bdddcc0515dd09`.

Last retained direct public probe: HTTP 200, but no JSON `revision` field and no `X-VertexED-Revision` header.

Therefore source/browser CI success must not be promoted into a claim that the public domain serves the latest source SHA. Authenticated production certification also remains separately blocked on disposable-account evidence.

## Safety boundary

No production deployment, destructive migration, force-push, secret disclosure, credential rotation, fabricated benchmark, fabricated test pass, or fabricated research result is claimed by this ledger.
