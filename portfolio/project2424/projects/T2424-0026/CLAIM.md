# T2424-0026 — Claim

## Falsifiable claim

For a deterministic radius-one elementary cellular automaton, a single localized counterfactual intervention at `(t0, x0)` cannot change any cell outside the discrete causal cone `|x - x0| <= t - t0` when baseline and counterfactual runs share the same initial state, rule, boundary condition, and update schedule.

## Primary metric

Number of causal-cone violations returned by `causalConeViolations()`.

## Success condition

`0` violations on the frozen deterministic Rule-110 minimum experiment and on the dedicated regression controls.

## Negative control

Before the intervention time, Hamming divergence must remain exactly `0`.

## Boundary

This claim is only about the implemented deterministic cellular-automaton mechanism. It does not establish physical realism, causal discovery, learned world-model quality, external validity, or publication novelty.
