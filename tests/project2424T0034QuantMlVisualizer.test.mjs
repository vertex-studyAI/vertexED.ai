import assert from 'node:assert/strict';
import test from 'node:test';

import {
  annualizedVolatility,
  buildQuantReport,
  drawdownSeries,
  equityCurve,
  maxDrawdown,
  priceReturns,
  renderQuantReportHtml,
  renderQuantReportSvg,
  rollingMean,
  rollingVolatility,
  sharpeRatio,
} from '../portfolio/project2424/projects/T2424-0034/src/quantVisualizer.mjs';

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('return, equity, and drawdown calculations match a hand-checkable path', () => {
  const returns = priceReturns([100, 110, 99, 108.9]);
  close(returns[0], 0.1);
  close(returns[1], -0.1);
  close(returns[2], 0.1);

  const curve = equityCurve(returns);
  close(curve[0], 1);
  close(curve[1], 1.1);
  close(curve[2], 0.99);
  close(curve[3], 1.089);

  const drawdowns = drawdownSeries(curve);
  close(drawdowns[0], 0);
  close(drawdowns[1], 0);
  close(drawdowns[2], -0.1);
  close(maxDrawdown(curve), -0.1);
});

test('volatility and Sharpe are finite for non-constant returns', () => {
  const returns = [0.01, -0.005, 0.015, 0.002, -0.003];
  assert.ok(Number.isFinite(annualizedVolatility(returns)));
  assert.ok(Number.isFinite(sharpeRatio(returns)));
  assert.equal(sharpeRatio([0.01, 0.01, 0.01]), null);
});

test('rolling statistics preserve alignment with null warmup', () => {
  assert.deepEqual(rollingMean([1, 2, 3, 4], 3), [null, null, 2, 3]);
  const rolling = rollingVolatility([0.01, -0.01, 0.02, 0], 2, 1);
  assert.deepEqual(rolling.slice(0, 1), [null]);
  assert.equal(rolling.length, 4);
  assert.ok(rolling.slice(1).every(Number.isFinite));
});

test('report includes aligned series and descriptive claim boundary', () => {
  const prices = [100, 101, 99, 103, 104, 102];
  const dates = prices.map((_, index) => `2026-08-${String(index + 1).padStart(2, '0')}`);
  const report = buildQuantReport({ prices, dates, periodsPerYear: 252, rollingWindow: 3 });

  assert.equal(report.metadata.observations, prices.length);
  assert.equal(report.series.prices.length, prices.length);
  assert.equal(report.series.equity.length, prices.length);
  assert.equal(report.series.drawdown.length, prices.length);
  assert.equal(report.series.rollingVolatility.length, prices.length);
  assert.equal(report.series.returns.length, prices.length - 1);
  assert.deepEqual(report.series.dates, dates);
  assert.match(report.claimBoundary, /not investment advice/i);
  assert.ok(report.summary.maxDrawdown <= 0);
});

test('SVG and HTML rendering are self-contained and escape titles', () => {
  const report = buildQuantReport({ prices: [100, 102, 101, 105, 103] });
  const svg = renderQuantReportSvg(report, { title: '<Alpha & Beta>' });
  assert.match(svg, /^<svg/);
  assert.match(svg, /&lt;Alpha &amp; Beta&gt;/);
  assert.match(svg, /Equity curve/);
  assert.match(svg, /Drawdown/);
  assert.doesNotMatch(svg, /<script/i);

  const html = renderQuantReportHtml(report, { title: 'Quant Report' });
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<svg/);
  assert.match(html, /Summary JSON/);
  assert.match(html, /not investment advice/i);
});

test('invalid and underspecified inputs fail closed', () => {
  assert.throws(() => priceReturns([100, 0, 101]), /greater than zero/);
  assert.throws(() => buildQuantReport({ prices: [100, 101] }), /at least 3/);
  assert.throws(() => buildQuantReport({ prices: [100, 101, 102], dates: ['a'] }), /one entry per price/);
  assert.throws(() => rollingMean([1, 2], 0), /positive integer/);
  assert.throws(() => renderQuantReportSvg(buildQuantReport({ prices: [1, 2, 3] }), { width: 100 }), /too small/);
});
