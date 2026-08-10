# Project 2424 — First 100

**Updated:** 10 August 2026  
**Canonical queue source:** `FIRST_100_EXECUTION_WAVE.md` + `FIRST_100_QUEUE.ndjson`

## Truth boundary

This dashboard counts only evidence tied to inspectable implementation and execution artifacts. Being selected into the First-100 queue is **not** completion evidence.

- Certified complete: **0 / 100**
- Execution-ready registry entries: **100 / 100**
- Candidate packages implemented + locally executed: **2 / 100**
- Candidate packages reproduced by dedicated GitHub Actions: **2 / 100**
- Candidate hypotheses passing their predeclared cheap screen: **1 / 100**
- Candidate hypotheses preserved as negative/inconclusive: **1 / 100**
- Candidate branches passing the canonical repository build/test gate: **2 / 100**
- Independently QA-certified complete under the full nine-part acceptance gate: **0 / 100**

`Certified complete` remains 0 because neither candidate has yet cleared real-data/independent scientific QA and every acceptance-gate item. This intentionally separates **executed work** from **completed research**.

## Required completion evidence

Every counted project must have, at minimum:

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

| Queue rank | ID | Artifact | Implementation | Tests / execution | Result | Current status |
|---:|---|---|---|---|---|---|
| 52 | `T2424-1767` | Draft PR #156 — Resource-Bounded Mixture-of-Experts benchmark | Learned threshold router + two affine experts + dense affine baseline | Local 4/4 tests; 20 deterministic seeds; dedicated GitHub reproduction passed twice; canonical repository build/test + browser jobs passed on the recorded head | Piecewise held-out RMSE improved **85.002%** with **1/2** experts active; globally linear negative control **-1.010%** | `PASS_CHEAP_FALSIFICATION_SCREEN`; synthetic only; branch remains draft and behind moving `main`; real-data + independent scientific QA required |
| 92 | `T2424-1863` | Draft PR #158 — Resource-Bounded local diffusion operator | Learned scalar 3-point local update operator + persistence baseline | Local 4/4 negative-result regression tests; 20 deterministic seeds; dedicated GitHub reproduction passed; canonical repository build/test passed on the recorded head | Predeclared **>75%** improvement gate failed: observed **67.777%**; planted coefficient `0.18` recovered as `0.179689`; zero-diffusion control **-0.029%** | `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`; threshold preserved; real PDE benchmark + stronger baselines + independent QA required |

## Status of the remaining queue

The other **98 / 100** candidates remain `EXECUTION_READY`. Their registry metadata is not implementation, testing, experimental evidence, or completion.

The canonical ordered list remains in:

- `FIRST_100_EXECUTION_WAVE.md`
- `FIRST_100_QUEUE.ndjson`

## Promotion rule

Increase `Certified complete` only when a project-specific package clears all nine acceptance requirements with inspectable evidence. Negative results may count as executed research when the original gate is preserved and reproducible, but they do not count as successful hypotheses.

No candidate here is described as paper-ready, publication-ready, production-ready, or scientifically superior based on synthetic evidence alone.
