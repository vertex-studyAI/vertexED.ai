# Eigen-JEPA — REPRODUCE

## Current state

No executable command is reported because the connected portfolio does not expose a canonical Eigen-JEPA source repository or frozen market-data contract.

## Source recovery

Before execution, record:

1. canonical repository and commit;
2. exact Eigen-JEPA equations/architecture;
3. dependency lock and compute environment;
4. training and evaluation entry points;
5. all stochastic seeds;
6. checkpoint and raw-prediction output schema.

## Leakage-safe data protocol

Freeze before held-out evaluation:

- dataset vendor/source and immutable version/hash where possible;
- symbol universe and inclusion dates;
- timestamps and timezone;
- availability lag for every feature;
- corporate actions;
- delistings and survivorship handling;
- walk-forward train/validation/test windows;
- no random temporal shuffling;
- transaction-cost/slippage model;
- portfolio construction and rebalance schedule if a trading claim is made.

A feature may only enter a prediction at time `t` if it was actually available by the protocol-defined decision time at `t`.

## Baselines

Once the prediction target is frozen, implement one simple/no-skill baseline, one transparent predictive baseline, one standard architecture baseline, Eigen-JEPA, and at least one mechanism ablation. Match training data, target, parameter/compute budget where meaningful, and evaluation costs.

## Statistics

Do not use IID assumptions over overlapping financial observations without justification. Report per-seed training variation separately from time-series sampling uncertainty. For a learned stochastic model, predeclare at least five seeds for the bounded first screen when compute permits. Any hypothesis test must account for the temporal/dependence structure and the number of model/strategy variants actually tried.

## Failure policy

Preserve negative returns, null predictive gains, unstable seeds and stress-regime failures. Never alter the test interval, asset universe, transaction costs or signal direction after observing held-out results without starting a new explicitly exploratory protocol.