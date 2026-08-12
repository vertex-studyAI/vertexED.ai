# T2424-0040 — Baseline / Negative Control

## Baseline

The frozen negative control is **utility-only scheduling**: among incomplete concepts, choose the highest utility and ignore prerequisite state.

This is intentionally simple. It is not presented as a strong educational recommender baseline; it exists to test whether the prerequisite constraint changes ordering in the controlled graph.

## Retained result

Under the same six-node graph, zero initial mastery, `0.8` threshold and six-action budget:

| Policy | Completed concepts | Violating selections | Unmet prerequisite edges |
|---|---:|---:|---:|
| prerequisite-aware | 6 | 0 | 0 |
| utility-only negative control | 6 | 5 | 7 |

The utility-only sequence starts with `options`, then `capm`, then `bonds`, causing prerequisite violations by construction. The prerequisite-aware sequence starts with `budgeting` and never selects a concept before its declared prerequisites meet threshold.

## Interpretation

The negative control demonstrates the narrow mechanism being tested: a scheduler that ignores prerequisite state can choose high-utility downstream concepts before dependencies are satisfied, whereas the constrained scheduler does not on this fixture.

It does **not** demonstrate that the graph-aware order teaches better, learns faster, maximizes long-term utility, matches real curriculum dependencies, or improves any learner outcome.
