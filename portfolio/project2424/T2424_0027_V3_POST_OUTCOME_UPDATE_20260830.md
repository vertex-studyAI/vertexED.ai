# T2424-0027 v3 post-outcome strategy update — 2026-08-30

This update supersedes any Project 2424 planning text that still treats the v3 real-encoder gate as outcome-free or pending execution.

## Frozen fact

Protocol `T2424-0027-REAL-ENCODER-GATE-v3` has completed its first authorized outcome-bearing run and is frozen at:

**`FAIL_PREDECLARED_REAL_ENCODER_GATE`**

Primary means:

- raw language accuracy `0.49236` vs frozen `>=0.75` — FAIL
- effect retention `0.87133` vs frozen `>=0.70` — pass
- intent drop `-0.00249` vs frozen `<=0.02` — pass
- specificity margin `0.81686` vs frozen `>=0.15` — pass
- seed passes `0/5` vs frozen `>=4/5` — FAIL

All five frozen seeds missed the raw-language-accuracy floor. The centering effect is therefore not enough to satisfy the preregistered success criterion.

## Strategy consequence

The old plan — “execute the frozen real-encoder successor, then decide whether it deserves flagship allocation” — has reached its decision point. The answer for v3 is **no flagship promotion as a positive real-encoder result**.

The retained v3 evidence can still support a bounded negative/methodological report: under the frozen encoder/data/probe choice, language centering produced a strong and specific reduction while the raw locale signal was too weak to satisfy the predeclared gate. That distinction must remain explicit.

## No rescue path inside v3

Do not:

- lower the `0.75` raw-language floor;
- replace the frozen encoder or dataset;
- substitute seeds;
- remove failed seed-level criteria;
- relabel the strong centering effect as a pass;
- re-run v3 until favorable noise appears;
- treat exploratory follow-up as confirmatory v3 evidence.

## Any future successor

A future v4 or differently named successor is a **new scientific line** and requires a new preregistration. Its motivation should come from the scientific question revealed by v3, not from an attempt to manufacture a positive continuation.

Reasonable future questions include whether the v3 failure is stable across encoder families or whether the raw-language-separability precondition itself determines when centering diagnostics are meaningful. Those are exploratory/new-protocol questions and must not alter the frozen v3 verdict.

## Queue impact

Effective immediately:

1. NeuroCAD S3/mechanism-falsification successor becomes the highest-upside unresolved Project 2424 flagship lane.
2. Darcy stronger successor remains a high-upside separate frozen-protocol lane.
3. NGMT v0.1 negative/failure-mode line or a separately frozen successor ranks ahead of attempting to rescue T2424-0027 v3.
4. T2424-0027 v3 remains valuable as a rigorous negative real-encoder gate, but no longer occupies the pre-outcome #1 flagship slot.
5. T2424-0025 and T2424-1863 remain bounded paper/release lanes with lower current flagship novelty.

This ranking can change only when new, separately admissible evidence changes the scientific story.
