function requireFiniteNumber(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

export function validatePrices(prices) {
  if (!Array.isArray(prices) || prices.length < 8) {
    throw new TypeError("prices must contain at least 8 observations");
  }
  prices.forEach((price, index) => {
    requireFiniteNumber(price, `prices[${index}]`);
    if (price <= 0) throw new RangeError(`prices[${index}] must be positive`);
  });
  return prices.map(Number);
}

export function logReturns(prices) {
  const clean = validatePrices(prices);
  return clean.slice(1).map((price, index) => Math.log(price / clean[index]));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationStd(values) {
  const center = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - center) ** 2)));
}

export function fitLinearRegression(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new TypeError("samples must be non-empty");
  }
  const xs = samples.map((sample) => sample.x);
  const ys = samples.map((sample) => sample.y);
  xs.forEach((value, index) => requireFiniteNumber(value, `samples[${index}].x`));
  ys.forEach((value, index) => requireFiniteNumber(value, `samples[${index}].y`));

  const xMean = mean(xs);
  const yMean = mean(ys);
  const variance = xs.reduce((sum, value) => sum + (value - xMean) ** 2, 0);
  if (variance <= Number.EPSILON) return { intercept: yMean, slope: 0 };
  const covariance = samples.reduce(
    (sum, sample) => sum + (sample.x - xMean) * (sample.y - yMean),
    0
  );
  const slope = covariance / variance;
  return { intercept: yMean - slope * xMean, slope };
}

export function walkForwardBacktest(prices, options = {}) {
  const clean = validatePrices(prices);
  const lookback = options.lookback ?? 3;
  const minTrain = options.minTrain ?? 5;
  const costBps = options.costBps ?? 5;

  if (!Number.isInteger(lookback) || lookback < 1) throw new RangeError("lookback must be a positive integer");
  if (!Number.isInteger(minTrain) || minTrain < 2) throw new RangeError("minTrain must be an integer >= 2");
  requireFiniteNumber(costBps, "costBps");
  if (costBps < 0) throw new RangeError("costBps must be >= 0");

  const returns = logReturns(clean);
  if (returns.length <= lookback + minTrain) {
    throw new RangeError("price series is too short for the requested lookback and training window");
  }

  const historicalSamples = [];
  const rows = [];
  let previousPosition = 0;
  let strategyLogEquity = 0;
  let benchmarkLogEquity = 0;

  for (let targetIndex = lookback; targetIndex < returns.length; targetIndex += 1) {
    const featureWindow = returns.slice(targetIndex - lookback, targetIndex);
    const feature = mean(featureWindow);
    const targetReturn = returns[targetIndex];

    let prediction = 0;
    let position = 0;
    if (historicalSamples.length >= minTrain) {
      const model = fitLinearRegression(historicalSamples);
      prediction = model.intercept + model.slope * feature;
      position = prediction > 0 ? 1 : prediction < 0 ? -1 : 0;
    }

    const turnover = Math.abs(position - previousPosition);
    const tradingCost = turnover * (costBps / 10_000);
    const strategyReturn = position * targetReturn - tradingCost;
    strategyLogEquity += strategyReturn;
    benchmarkLogEquity += targetReturn;

    rows.push({
      priceIndex: targetIndex + 1,
      feature,
      prediction,
      targetReturn,
      position,
      turnover,
      tradingCost,
      strategyReturn,
      benchmarkReturn: targetReturn,
      strategyEquity: Math.exp(strategyLogEquity),
      benchmarkEquity: Math.exp(benchmarkLogEquity),
      trainSamples: historicalSamples.length
    });

    historicalSamples.push({ x: feature, y: targetReturn });
    previousPosition = position;
  }

  return rows;
}

export function maxDrawdown(equity) {
  if (!Array.isArray(equity) || equity.length === 0) throw new TypeError("equity must be non-empty");
  let peak = equity[0];
  let worst = 0;
  for (const value of equity) {
    requireFiniteNumber(value, "equity value");
    if (value <= 0) throw new RangeError("equity values must be positive");
    peak = Math.max(peak, value);
    worst = Math.min(worst, value / peak - 1);
  }
  return worst;
}

export function annualizedSharpe(returns, periodsPerYear = 252) {
  if (!Array.isArray(returns) || returns.length < 2) return 0;
  returns.forEach((value, index) => requireFiniteNumber(value, `returns[${index}]`));
  const sigma = populationStd(returns);
  if (sigma <= Number.EPSILON) return 0;
  return (mean(returns) / sigma) * Math.sqrt(periodsPerYear);
}

export function summarizeBacktest(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new TypeError("rows must be non-empty");
  const strategyReturns = rows.map((row) => row.strategyReturn);
  const benchmarkReturns = rows.map((row) => row.benchmarkReturn);
  const strategyEquity = rows.map((row) => row.strategyEquity);
  const benchmarkEquity = rows.map((row) => row.benchmarkEquity);
  const tradedRows = rows.filter((row) => row.position !== 0);
  const correctDirection = tradedRows.filter(
    (row) => Math.sign(row.position) === Math.sign(row.targetReturn)
  ).length;

  return {
    observations: rows.length,
    tradedObservations: tradedRows.length,
    strategyTotalReturn: strategyEquity.at(-1) - 1,
    benchmarkTotalReturn: benchmarkEquity.at(-1) - 1,
    strategySharpe: annualizedSharpe(strategyReturns),
    benchmarkSharpe: annualizedSharpe(benchmarkReturns),
    strategyMaxDrawdown: maxDrawdown(strategyEquity),
    benchmarkMaxDrawdown: maxDrawdown(benchmarkEquity),
    directionalAccuracy: tradedRows.length === 0 ? 0 : correctDirection / tradedRows.length,
    totalTurnover: rows.reduce((sum, row) => sum + row.turnover, 0),
    totalTradingCost: rows.reduce((sum, row) => sum + row.tradingCost, 0)
  };
}

export function parsePriceText(text) {
  if (typeof text !== "string") throw new TypeError("text must be a string");
  const values = text
    .split(/[\s,;]+/u)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  return validatePrices(values);
}
