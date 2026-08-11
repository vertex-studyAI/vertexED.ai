# T2424-0040 — Frozen Protocol

## Question

Can a deterministic prerequisite-aware scheduler enforce a declared learning-graph ordering on a controlled synthetic finance-labelled curriculum, compared with a deliberately prerequisite-blind utility-only negative control?

## Frozen fixture

Six concepts:

| Concept | Prerequisites | Utility | Difficulty |
|---|---|---:|---:|
| budgeting | none | 2 | 1 |
| time_value | budgeting | 4 | 1 |
| bonds | time_value | 5 | 1 |
| diversification | budgeting | 4 | 1 |
| capm | time_value, diversification | 8 | 1 |
| options | bonds, capm | 9 | 1 |

All initial mastery values are `0`.

## Frozen mechanics

- mastery threshold: `0.8`;
- action budget: `6` selections;
- selecting a concept in this synthetic fixture sets its mastery to `1`;
- a prerequisite violation occurs when a selected concept has at least one prerequisite with mastery `< 0.8` at selection time;
- prerequisite-aware candidates must have zero unmet prerequisites;
- prerequisite-aware ranking score is `(1 - mastery) * utility / difficulty`;
- prerequisite-aware ties break by higher utility then lexical concept ID;
- negative control ignores prerequisites and chooses highest utility among incomplete concepts, ties lexical by concept ID;
- graph validation rejects missing prerequisite references, duplicate IDs, self-dependencies and cycles.

## Predeclared gates

PASS only when all are true:

1. prerequisite-aware violating selections `<= 0`;
2. prerequisite-aware completed concepts `= 6` after at most six selections;
3. utility-only baseline violating selections `>= 4`.

No threshold is changed after seeing the result.

## Commands

Run:

```bash
node portfolio/project2424/projects/T2424-0040/experiment/run.mjs
```

Verify retained evidence independently of the scheduler implementation:

```bash
node portfolio/project2424/projects/T2424-0040/reproduction/verify.mjs
```

## Data / seeds / cost

- data: fixed synthetic graph defined above;
- randomness: none;
- seeds: not applicable;
- external data: none;
- expected compute cost: negligible CPU;
- external API cost: none.

## Scientific boundary

This protocol tests deterministic graph-ordering mechanics. It is not an experiment on students, educational outcomes, FinanceMeta curriculum validity, real engagement, finance knowledge acquisition or learned personalization.
