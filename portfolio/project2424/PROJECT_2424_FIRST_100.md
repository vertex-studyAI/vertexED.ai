# Project 2424 — First 100

**Updated:** 10 August 2026  
**Canonical queue:** `FIRST_100_EXECUTION_WAVE.md` + `FIRST_100_QUEUE.ndjson`

## Truth boundary

This dashboard separates **executed candidate work** from **fully certified completion**. Selection into the First-100 queue is not completion evidence.

- Certified complete under all nine acceptance requirements: **0 / 100**
- Execution-ready queue entries: **100 / 100**
- Candidate packages implemented + executed: **2 / 100**
- Candidate packages reproduced by dedicated GitHub Actions: **2 / 100**
- Candidate hypotheses passing their predeclared cheap screen: **1 / 100**
- Candidate hypotheses preserved as negative/inconclusive: **1 / 100**
- Candidate branches passing the configured repository build/test/browser gate on their recorded heads: **2 / 100**
- Remaining entries without a per-project executed package: **98 / 100**

`Certified complete` remains **0** because neither executed candidate has yet cleared every requirement below, including real-data/independent scientific QA where applicable. The purpose of the intermediate counts is to show real execution progress without weakening the completion definition.

## Required completion evidence

Every counted complete project must have, at minimum:

1. immutable source identity or explicit `NO_SOURCE`;
2. one falsifiable claim;
3. frozen protocol;
4. clean runnable command;
5. baseline evidence;
6. raw artifacts;
7. one ablation or negative-result analysis;
8. explicit go/no-go verdict; and
9. independent QA.

## Executed candidates

| Queue rank | ID | Artifact | Evidence | Verdict | Remaining gate |
|---:|---|---|---|---|---|
| 52 | `T2424-1767` | Draft PR #156 — Resource-Bounded Mixture-of-Experts benchmark | 4-test regression package; 20 deterministic seeds; dedicated GitHub reproduction passed twice; configured repository build/test + accessibility/browser gates passed on recorded head; piecewise RMSE improvement **85.002%** with **1/2** experts active; linear control **-1.010%** | `PASS_CHEAP_FALSIFICATION_SCREEN` | synthetic-only result; branch is behind moving `main`; real scientific data and independent scientific QA required |
| 92 | `T2424-1863` | Draft PR #158 — Resource-Bounded local diffusion operator | 4-test negative-result regression package; 20 deterministic seeds; dedicated GitHub reproduction passed; configured repository build/test + accessibility/browser gates passed on recorded head; observed improvement **67.777%** against predeclared **>75%** gate; planted coefficient `0.18` recovered as `0.179689`; zero-diffusion control **-0.029%** | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE` | real PDE benchmark, stronger baselines, rollout/runtime evidence, and independent scientific QA required |

## Remaining queue

The other **98 / 100** candidates remain `EXECUTION_READY`. Registry metadata, a title, or an unexecuted protocol is not implementation/testing/result evidence.

The ordered queue remains in:

- `FIRST_100_EXECUTION_WAVE.md`
- `FIRST_100_QUEUE.ndjson`

## Promotion rule

Increase `Certified complete` only when a project-specific package clears all nine acceptance requirements with inspectable evidence. A reproducible negative result counts as executed research when the original gate is preserved; it does **not** count as a successful hypothesis.

No candidate here is described as paper-ready, publication-ready, production-ready, or scientifically superior based on synthetic evidence alone.
