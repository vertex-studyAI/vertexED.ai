# Eigen-JEPA — RESULTS

Evidence date: 2026-08-12
Status: **BLOCKED — CANONICAL SOURCE + MARKET-DATA CONTRACT UNAVAILABLE**

## Reproducibility finding

The connected portfolio records Eigen-JEPA as requiring a leakage-safe walk-forward finance benchmark, but the connected GitHub installation does not expose a canonical Eigen-JEPA repository or executable implementation. The portfolio also lacks a frozen market-data contract that would make a finance result reproducible.

Therefore no Eigen-JEPA experiment was executed in this wave and no numerical result is reported.

## Provisional research question

Once the actual method is recovered, the defensible question is whether the frozen Eigen-JEPA representation/prediction mechanism improves out-of-sample performance over simpler and standard baselines under a strictly chronological, cost-aware evaluation protocol.

The architecture-specific hypothesis cannot be stated more precisely until the source/equations are recovered. This wording is a benchmark contract, not a claim that the method works.

## Required task / data contract

Before training, freeze:

- public or otherwise reproducibly versioned market data;
- instruments/markets;
- exact timestamps and timezone handling;
- corporate-action handling where applicable;
- feature availability times;
- train/validation/test chronology;
- rolling/walk-forward windows;
- transaction costs, slippage assumptions and turnover accounting;
- delisting/survivorship policy;
- stress-regime definitions.

## Required baseline ladder

After the actual method is recovered, compare at minimum:

1. a no-skill/static benchmark appropriate to the prediction target;
2. a simple linear or similarly transparent predictive baseline;
3. a standard sequence/representation architecture under the same data and compute budget;
4. the proposed Eigen-JEPA method;
5. mechanism-specific ablations.

The exact baselines must be frozen before held-out evaluation and should match the final prediction objective.

## Metrics

The primary metric must be defined from the recovered task. For trading-oriented claims, report both predictive metrics and cost-aware portfolio metrics rather than headline return alone; include turnover and drawdown/risk measures where relevant.

## Seed / uncertainty policy

No seed policy is currently executable because no training implementation is connected. Once recovered, predeclare all stochastic seeds and report per-seed values, mean, sample SD and `n`; use chronological resampling or other dependence-aware uncertainty methods where appropriate rather than treating daily observations as independent IID samples.

## Result

```text
result = null
reason = canonical implementation and leakage-safe market-data contract unavailable
```

## Claim boundary

No finance alpha, JEPA advantage, statistical significance, novelty or paper-readiness claim is supported at this stage.