# T2424-0034 — Quant ML Visualizer

**Track:** C — Existing work → minimum experiment  
**Package type:** deterministic quantitative-analysis/reporting tool  
**Claim boundary:** descriptive analytics only. This package is not investment advice and does not establish predictive alpha, strategy profitability, or ML superiority.

## What it does

Quant ML Visualizer turns a positive price series into a reproducible descriptive report containing:

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

## Package

```text
T2424-0034/
├── README.md
├── STATUS.md
├── src/
│   └── quantVisualizer.mjs
├── cli/
│   └── render-report.mjs
└── example/
    └── demo-input.json
```

Root regression coverage:

```text
tests/project2424T0034QuantMlVisualizer.test.mjs
```

## Run the demo

From the repository root:

```bash
node portfolio/project2424/projects/T2424-0034/cli/render-report.mjs \
  portfolio/project2424/projects/T2424-0034/example/demo-input.json \
  /tmp/quant-ml-visualizer.html
```

The command prints summary metrics as JSON and writes a standalone HTML report to the requested output path.

## Library API

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

`buildQuantReport` requires at least three positive finite prices so sample/rolling volatility has a defensible minimum data contract.

## Tests

Run only this package:

```bash
node --test tests/project2424T0034QuantMlVisualizer.test.mjs
```

Or use the repository gate:

```bash
npm test
npm run ci
```

The regression suite checks:

- hand-verifiable return/equity/drawdown arithmetic;
- finite volatility and Sharpe calculations;
- aligned rolling-statistic warm-up behavior;
- report-series lengths and dates;
- SVG/HTML generation and XML escaping;
- absence of injected script markup in the generated SVG path;
- fail-closed invalid price/date/window/render contracts.

## Limitations

- prices are assumed already cleaned and ordered;
- arithmetic returns only;
- no transaction costs, slippage, position sizing, or portfolio accounting;
- Sharpe uses a simple per-period risk-free adjustment and sample standard deviation;
- annualization assumes the caller provides the correct periods-per-year value;
- visualization is intentionally minimal and dependency-free;
- no predictive model is trained or evaluated;
- no market data is downloaded by this package.

## Next evidence gate

A research-grade extension should freeze a real public dataset and a clearly defined predictive/portfolio task, separate train/validation/test periods, add transaction-cost-aware baselines, preserve raw predictions and trades, and compare predictive metrics separately from economic metrics. The current package should remain useful even if that later ML hypothesis fails.
