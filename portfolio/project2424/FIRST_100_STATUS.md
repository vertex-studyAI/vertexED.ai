# Project 2424 — First 100 Status

**Checkpoint:** 10 August 2026

This dashboard counts only evidence-backed execution against the 100-candidate queue in `FIRST_100_EXECUTION_WAVE.md`. A candidate is not promoted merely because it has a title, generated prose, or an unexecuted protocol.

## Current counts

- Queue defined: **100 / 100**
- Implemented + locally executed: **2 / 100**
- GitHub-dedicated reproduction passed: **2 / 100**
- Predeclared cheap screen passed: **1 / 100**
- Negative/inconclusive screen preserved: **1 / 100**
- Full repository build/test gate passed: **2 / 100**
- Full browser gate passed: **1 / 100**
- Full browser gate still running: **1 / 100**
- Remaining candidates without an executed package: **98 / 100**

## Executed candidates

| Rank | ID | Artifact | Verdict | Local evidence | GitHub reproduction | Repository gate | Remaining gate |
|---:|---|---|---|---|---|---|---|
| 52 | `T2424-1767` | PR #156 — Resource-Bounded MoE benchmark | `PASS_CHEAP_FALSIFICATION_SCREEN` | 4/4 tests; 20 seeds; +85.002% mean RMSE improvement; 1/2 experts active; linear control -1.010% | dedicated workflow passed twice | canonical build/test + local accessibility + production browser passed | branch is behind moving `main`; real-data/independent scientific QA required |
| 92 | `T2424-1863` | PR #158 — Local diffusion operator | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE` | 4/4 regression tests; 20 seeds; +67.777% vs predeclared >75% gate; coefficient 0.179689 vs planted 0.18; zero-diffusion control -0.029% | dedicated workflow passed | canonical build/test passed | browser jobs still running; real PDE benchmark and stronger baselines required |

## Counting rules

A candidate enters **Implemented + locally executed** only when code, a runnable command, tests, and retained results exist.

A negative result counts as executed research when the original gate is preserved and the result is reproducible. It does **not** count as a successful hypothesis.

No candidate here is called paper-ready, publication-ready, production-ready, or scientifically superior based on synthetic evidence alone.

## Next execution order

1. Finish repository/browser verification for the two executed packages without weakening gates.
2. Prefer additional small-compute candidates from distinct domains rather than cloning the same toy.
3. Promote candidates to real-data experiments only after the cheap falsification screen survives.
4. Keep the queue at 100 until evidence supports replacement; do not inflate the completed count.
