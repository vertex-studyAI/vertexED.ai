# T2424-0034 — Quant ML Visualizer

A small, dependency-free Project 2424 experiment for visualizing a **walk-forward quantitative prediction baseline** without silently leaking future prices into training.

## What exists

- a pure JavaScript backtest core;
- a one-feature rolling linear predictor;
- expanding-window walk-forward fitting;
- explicit transaction-cost accounting;
- strategy versus buy-and-hold equity curves;
- Sharpe, max-drawdown, directional-accuracy, turnover and cost summaries;
- a standalone browser UI for pasted price series;
- repository-level regression tests, including a future-data mutation test.

## Scientific / product question

Can a minimal quant-ML teaching tool make the most common backtest integrity boundaries visible and executable—especially **walk-forward training, transaction costs, and no lookahead**—without requiring a notebook, API key, data vendor, or external plotting package?

This package is an educational/research baseline. It does **not** claim predictive alpha, market efficiency violations, investability, or production trading readiness.

## Method

For a price series `p[0..n]`:

1. compute log returns;
2. at decision row `t`, form one momentum feature from the mean of the previous `lookback` returns;
3. fit a univariate linear regression using only completed samples strictly before `t`;
4. predict the current target return;
5. take position `-1`, `0`, or `+1` from the sign of that prediction;
6. subtract turnover × cost in basis points;
7. only **after scoring the row**, append its feature/target pair to the training set.

That final ordering is the key no-lookahead invariant.

## Run the demo

The UI uses browser-native ES modules and has no package install step.

```bash
cd portfolio/new-projects/quant-ml-visualizer
python3 -m http.server 8000
```

Then open `http://localhost:8000/web/`.

You can paste a comma-, whitespace-, semicolon-, or newline-separated price series and change:

- lookback;
- minimum historical training rows;
- transaction cost in basis points.

## Run the tests

From the VertexED repository root:

```bash
node --test tests/quantMlVisualizer.test.mjs
```

The canonical repository gate also includes this file through the existing `tests/*.test.mjs` suite.

## Test contracts

The tests require:

- exact recovery of a known linear relationship;
- predictions before a cutoff to remain identical after all later prices are heavily mutated;
- positive trading costs to reduce equity when turnover occurs;
- finite summary metrics on the sample experiment;
- strict validation of pasted price input.

## Files

```text
quant-ml-visualizer/
├── README.md
├── STATUS.md
├── src/
│   └── core.mjs
└── web/
    ├── index.html
    └── app.mjs
```

Repository integration test:

```text
tests/quantMlVisualizer.test.mjs
```

## Limitations

- the model is deliberately tiny: one rolling-return feature and univariate linear regression;
- the included browser series is synthetic demonstration data, not a market dataset;
- annualized Sharpe assumes 252 observations per year regardless of user input frequency;
- transaction costs are linear and do not model spread, slippage, market impact, borrow, funding, or latency;
- there is no train/validation hyperparameter search and no claim that the chosen defaults are optimal;
- shorting is represented mathematically but not operationally modeled;
- this is not investment advice.

## Next evidence gate

Before promoting this from a tested demo to a quantitative research result:

1. freeze a real, legally usable historical dataset and its frequency;
2. predeclare train/validation/test periods;
3. compare against trivial, momentum, and mean-reversion baselines;
4. add at least one stronger regularized model under the same walk-forward budget;
5. report confidence/robustness across assets and periods;
6. preserve negative results and costs.

A green software CI run proves implementation/reproducibility of this baseline only. It does not prove trading performance.
