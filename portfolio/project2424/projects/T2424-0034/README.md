# T2424-0034 — Quant ML Visualizer

**Track:** C — Existing work → minimum experiment  
**Package type:** deterministic quantitative-analysis/reporting tool + walk-forward evaluation-mechanics baseline  
**Claim boundary:** no investment advice, predictive-alpha claim, strategy-profitability claim, or ML-superiority claim.

## What it does

The canonical package now has two deliberately separated layers.

### Descriptive analytics

`src/quantVisualizer.mjs` turns a positive price series into a reproducible report containing:

- arithmetic period returns;
- compounded equity curve;
- drawdown series and maximum drawdown;
- annualized sample volatility;
- annualized Sharpe ratio when variance is non-zero;
- rolling mean and rolling volatility utilities;
- best/worst period returns;
- a self-contained SVG with equity and drawdown curves;
- a self-contained HTML report with summary JSON;
- a zero-dependency Node CLI for JSON input → HTML output.

### Walk-forward mechanics

`src/walkForward.mjs` reconciles the useful no-lookahead work from the earlier noncanonical T2424-0034 follow-up into the canonical package without creating a second project tree.

The baseline:

1. converts positive prices to log returns;
2. builds one rolling mean-return feature using only returns before the current target;
3. fits a univariate linear regression using only previously scored feature/target pairs;
4. predicts the current target return;
5. takes a long/flat/short sign position;
6. subtracts explicit turnover × basis-point cost; and
7. only **after the row is scored**, appends that feature/target pair to the training history.

That score-before-train ordering is the core no-lookahead invariant.

## Package

```text
T2424-0034/
├── README.md
├── STATUS.md
├── src/
│   ├── quantVisualizer.mjs
│   └── walkForward.mjs
├── cli/
│   └── render-report.mjs
└── example/
    └── demo-input.json
```

Root regression coverage:

```text
tests/project2424T0034QuantMlVisualizer.test.mjs
tests/project2424T0034WalkForward.test.mjs
```

## Run the descriptive demo

From the repository root:

```bash
node portfolio/project2424/projects/T2424-0034/cli/render-report.mjs \
  portfolio/project2424/projects/T2424-0034/example/demo-input.json \
  /tmp/quant-ml-visualizer.html
```

The command prints summary metrics as JSON and writes a standalone HTML report.

## Library APIs

### Descriptive report

```js
import {
  buildQuantReport,
  renderQuantReportHtml,
} from './src/quantVisualizer.mjs';

const report = buildQuantReport({
  prices: [100, 101, 99, 103, 104],
  dates: ['d1', 'd2', 'd3', 'd4', 'd5'],
  periodsPerYear: 252,
  rollingWindow: 3,
});

const html = renderQuantReportHtml(report, { title: 'Experiment A' });
```

### Walk-forward baseline

```js
import {
  walkForwardBacktest,
  summarizeWalkForward,
} from './src/walkForward.mjs';

const rows = walkForwardBacktest(prices, {
  lookback: 3,
  minTrain: 5,
  costBps: 5,
});
const summary = summarizeWalkForward(rows);
```

The walk-forward code is an **evaluation-mechanics baseline**, not a validated trading strategy. No frozen real-market dataset or untouched external test period is bundled.

## Tests

Run package regressions:

```bash
node --test tests/project2424T0034QuantMlVisualizer.test.mjs
node --test tests/project2424T0034WalkForward.test.mjs
```

Or use the repository gate:

```bash
npm test
npm run ci
```

The descriptive suite checks hand-verifiable returns/equity/drawdown arithmetic, finite risk metrics, rolling warm-up behavior, report alignment, SVG/HTML generation and escaping, and fail-closed invalid contracts.

The walk-forward suite additionally checks:

- exact recovery of a known affine relationship;
- predictions before a cutoff remain identical when all later prices are heavily mutated;
- flat warm-up until the declared minimum training history exists;
- positive trading costs reduce strategy equity whenever turnover occurs;
- finite summary metrics and fail-closed evaluation settings.

## Limitations

- input prices are assumed already cleaned and ordered;
- no market data is downloaded by the package;
- the walk-forward model uses one rolling-return feature and univariate linear regression;
- no hyperparameter selection or model comparison is performed;
- annualized metrics assume caller-supplied frequency (walk-forward Sharpe defaults to 252);
- transaction cost is a simple linear basis-point approximation and omits spread, slippage, market impact, borrow, funding, and latency;
- no position-sizing, portfolio-capital, or execution engine is modeled;
- no external held-out market period has been frozen;
- visualization remains intentionally minimal and dependency-free.

## Next evidence gate

Before any quantitative-ML performance claim:

1. freeze a legally usable real historical dataset and its sampling frequency;
2. predeclare chronological train/validation/test periods;
3. compare against trivial, momentum, and mean-reversion baselines under the same cost model;
4. add a stronger regularized model without touching the final test period;
5. preserve raw predictions, positions, costs, and negative results;
6. report uncertainty and robustness across assets/periods; and
7. independently reproduce the frozen evaluation.

A green repository CI run proves software mechanics and the no-lookahead regression contract on the recorded head only.
