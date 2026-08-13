# STATUS

Project: T2424-1863  
State: `GREEN_NEGATIVE_SCREEN / EXACT_HEAD_REPRODUCED`  
Claim boundary: synthetic one-step diffusion only

## Frozen scientific result

- predeclared >75% relative-improvement gate: **FAILED**;
- observed 20-seed mean held-out RMSE improvement vs persistence: **67.777%**;
- planted diffusion coefficient `0.18` recovered as mean `0.179689`;
- zero-diffusion negative control mean relative improvement: **-0.029%**;
- verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

This conclusion is frozen. Exact-head re-execution reproduced/preserved the failed gate; the coefficient learner, seeds, threshold, task, and control were not retuned.

## Retained prior evidence

- scientific source commit: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`;
- original dedicated GitHub reproduction: run `31411517815`, attempt 3, job `94262839511`;
- tests: 4 passed, 0 failed;
- environment: Ubuntu 24.04.4 LTS, Python 3.11.15, pytest 9.1.1, CPU;
- per-seed uncertainty retained in `experiment_metadata.json`;
- local regression suite preserves the failed gate as a regression.

## Current exact-head closure

Exact-head verification executed on head `147ce38bf2d965a4b14fa31844856153e6e18f7b`.

- dedicated `Project 2424 T2424-1863 local diffusion operator` workflow: run `31659932936` — **SUCCESS**;
- canonical repository CI: run `31659932951` — **SUCCESS**;
- frozen 20-seed negative verdict preserved;
- no scientific source retuning or threshold change was used to obtain green CI.

The dedicated exact-head workflow and canonical CI both ran against the same head SHA. This closes the repository-level exact-head reproducibility gate while leaving the scientific hypothesis negative.

## Scientific boundary

Supported:

> The bounded synthetic local-diffusion screen is executable and reproducible in the current integrated repository, but the proposed operator does not satisfy its predeclared >75% improvement criterion.

Still not supported:

- neural-operator superiority;
- real PDE generalization;
- long-rollout stability;
- superiority to FNO/DeepONet-class baselines;
- production or external validation;
- statistical-significance claims beyond the retained descriptive seed distribution.

Real-data PDE follow-up and independent scientific QA remain required before scientific promotion.
