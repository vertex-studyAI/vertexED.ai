# STATUS

Project: T2424-1863  
State: `GREEN_NEGATIVE_SCREEN / EXACT_HEAD_REVERIFY_PENDING`  
Claim boundary: synthetic one-step diffusion only

## Frozen scientific result

- predeclared >75% relative-improvement gate: **FAILED**;
- observed 20-seed mean held-out RMSE improvement vs persistence: **67.777%**;
- planted diffusion coefficient `0.18` recovered as mean `0.179689`;
- zero-diffusion negative control mean relative improvement: **-0.029%**;
- verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

This conclusion is frozen. Exact-head re-execution must reproduce/preserve the failed gate; it must not retune the coefficient learner, seeds, threshold, task, or control.

## Retained prior evidence

- scientific source commit: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`;
- original dedicated GitHub reproduction: run `31411517815`, attempt 3, job `94262839511`;
- tests: 4 passed, 0 failed;
- environment: Ubuntu 24.04.4 LTS, Python 3.11.15, pytest 9.1.1, CPU;
- per-seed uncertainty retained in `experiment_metadata.json`;
- local regression suite preserves the failed gate as a regression.

## Current exact-head closure

This branch starts from current repository main `775b2740ff6ebeb69bb29cf3aeb934868063942f` and changes **status wording only** so the existing path-triggered workflow reruns the frozen 20-seed benchmark and regression suite against the current integrated repository state.

Closure requires:

1. dedicated `Project 2424 T2424-1863 local diffusion operator` workflow green on this exact PR head;
2. canonical repository CI green on the same head;
3. frozen negative verdict preserved;
4. no unexpected project-source changes.

A workflow failure is retained as evidence; do not weaken the regression to obtain green CI.

## Scientific boundary

Supported only if exact-head gates pass:

> The bounded synthetic local-diffusion screen is executable and reproducible in the current integrated repository, but the proposed operator does not satisfy its predeclared >75% improvement criterion.

Still not supported:

- neural-operator superiority;
- real PDE generalization;
- long-rollout stability;
- superiority to FNO/DeepONet-class baselines;
- production or external validation;
- statistical-significance claims beyond the retained descriptive seed distribution.

Real-data PDE follow-up and independent scientific QA remain required before scientific promotion.
