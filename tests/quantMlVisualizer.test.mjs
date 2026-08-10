import test from "node:test";
import assert from "node:assert/strict";
import {
  fitLinearRegression,
  parsePriceText,
  summarizeBacktest,
  walkForwardBacktest
} from "../portfolio/new-projects/quant-ml-visualizer/src/core.mjs";

const prices = [
  100, 101, 100.5, 102, 103, 102.4, 104, 105.2, 104.7, 106.3,
  107.5, 106.8, 108.4, 109.7, 109.1, 111, 112.4, 111.6, 113.2, 114.8,
  114.1, 115.9, 117.2, 116.4, 118.5, 119.7, 119, 120.8, 122.2, 121.3,
  123.4, 124.9, 124.1, 126.2, 127.5, 126.8, 128.9, 130.3, 129.4, 131.7
];

test("linear regression recovers a simple affine relationship", () => {
  const model = fitLinearRegression([
    { x: -1, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 5 }
  ]);
  assert.ok(Math.abs(model.intercept - 1) < 1e-12);
  assert.ok(Math.abs(model.slope - 2) < 1e-12);
});

test("walk-forward predictions do not use future prices", () => {
  const baseline = walkForwardBacktest(prices, { lookback: 3, minTrain: 5, costBps: 5 });
  const mutated = prices.slice();
  mutated.splice(28, mutated.length - 28, ...mutated.slice(28).map((value, index) => value * (index % 2 === 0 ? 4 : 0.35)));
  const changed = walkForwardBacktest(mutated, { lookback: 3, minTrain: 5, costBps: 5 });

  const safeRows = baseline.filter((row) => row.priceIndex < 28);
  const changedSafeRows = changed.filter((row) => row.priceIndex < 28);
  assert.equal(safeRows.length, changedSafeRows.length);
  for (let index = 0; index < safeRows.length; index += 1) {
    assert.equal(changedSafeRows[index].feature, safeRows[index].feature);
    assert.equal(changedSafeRows[index].prediction, safeRows[index].prediction);
    assert.equal(changedSafeRows[index].position, safeRows[index].position);
  }
});

test("transaction costs reduce strategy equity whenever turnover occurs", () => {
  const free = walkForwardBacktest(prices, { lookback: 2, minTrain: 4, costBps: 0 });
  const costly = walkForwardBacktest(prices, { lookback: 2, minTrain: 4, costBps: 25 });
  const freeSummary = summarizeBacktest(free);
  const costlySummary = summarizeBacktest(costly);
  assert.ok(costlySummary.totalTurnover > 0);
  assert.ok(costlySummary.totalTradingCost > 0);
  assert.ok(costlySummary.strategyTotalReturn < freeSummary.strategyTotalReturn);
});

test("sample experiment produces finite auditable metrics", () => {
  const rows = walkForwardBacktest(prices, { lookback: 3, minTrain: 5, costBps: 5 });
  const summary = summarizeBacktest(rows);
  assert.equal(summary.observations, rows.length);
  assert.ok(summary.tradedObservations > 0);
  for (const [key, value] of Object.entries(summary)) {
    assert.ok(Number.isFinite(value), `${key} should be finite`);
  }
});

test("price parser accepts common pasted formats and rejects invalid data", () => {
  assert.deepEqual(parsePriceText("100, 101\n102;103 104 105 106 107"), [100, 101, 102, 103, 104, 105, 106, 107]);
  assert.throws(() => parsePriceText("100, 101, nope, 103, 104, 105, 106, 107"), /finite/);
  assert.throws(() => parsePriceText("100, 101, 0, 103, 104, 105, 106, 107"), /positive/);
});
