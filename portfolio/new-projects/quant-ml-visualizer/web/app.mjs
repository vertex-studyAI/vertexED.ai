import {
  parsePriceText,
  summarizeBacktest,
  walkForwardBacktest
} from "../src/core.mjs";

const samplePrices = [
  100, 100.8, 100.2, 101.5, 102.3, 101.9, 103.1, 104.4, 103.8, 105.2,
  106.1, 105.5, 107.4, 108.2, 107.7, 109.5, 110.8, 110.1, 111.9, 113.2,
  112.5, 114.1, 115.3, 114.7, 116.8, 117.6, 116.9, 118.7, 120.2, 119.4,
  121.5, 122.9, 122.1, 124.3, 125.4, 124.8, 126.7, 128.2, 127.3, 129.5
];

const pricesElement = document.querySelector("#prices");
const metricsElement = document.querySelector("#metrics");
const chartElement = document.querySelector("#chart");
const errorElement = document.querySelector("#error");
const runButton = document.querySelector("#run");

pricesElement.value = samplePrices.join(", ");

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function renderMetrics(summary) {
  const metrics = [
    ["Strategy return", formatPercent(summary.strategyTotalReturn)],
    ["Buy & hold", formatPercent(summary.benchmarkTotalReturn)],
    ["Strategy Sharpe", summary.strategySharpe.toFixed(2)],
    ["Max drawdown", formatPercent(summary.strategyMaxDrawdown)],
    ["Directional accuracy", formatPercent(summary.directionalAccuracy)],
    ["Trading cost paid", formatPercent(summary.totalTradingCost)]
  ];
  metricsElement.replaceChildren(
    ...metrics.map(([label, value]) => {
      const card = document.createElement("div");
      card.className = "metric";
      const title = document.createElement("div");
      title.textContent = label;
      const number = document.createElement("strong");
      number.textContent = value;
      number.style.display = "block";
      number.style.fontSize = "1.7rem";
      number.style.marginTop = ".4rem";
      card.append(title, number);
      return card;
    })
  );
}

function pathFor(values, width = 1000, height = 320, padding = 24) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1e-9);
  return values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / span) * (height - 2 * padding);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

function svgPath(d, opacity = "1") {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "3");
  path.setAttribute("opacity", opacity);
  return path;
}

function renderChart(rows) {
  const strategy = rows.map((row) => row.strategyEquity);
  const benchmark = rows.map((row) => row.benchmarkEquity);
  const combinedMin = Math.min(...strategy, ...benchmark);
  const combinedMax = Math.max(...strategy, ...benchmark);
  const normalize = (values) => values.map((value) => (value - combinedMin) / Math.max(combinedMax - combinedMin, 1e-9));
  chartElement.replaceChildren(
    svgPath(pathFor(normalize(strategy))),
    svgPath(pathFor(normalize(benchmark)), "0.45")
  );
}

function run() {
  errorElement.textContent = "";
  try {
    const prices = parsePriceText(pricesElement.value);
    const rows = walkForwardBacktest(prices, {
      lookback: Number(document.querySelector("#lookback").value),
      minTrain: Number(document.querySelector("#minTrain").value),
      costBps: Number(document.querySelector("#costBps").value)
    });
    renderMetrics(summarizeBacktest(rows));
    renderChart(rows);
  } catch (error) {
    errorElement.textContent = error instanceof Error ? error.message : String(error);
    metricsElement.replaceChildren();
    chartElement.replaceChildren();
  }
}

runButton.addEventListener("click", run);
run();
