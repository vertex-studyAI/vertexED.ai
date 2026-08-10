function assertFiniteArray(values, name, minLength = 1) {
  if (!Array.isArray(values) || values.length < minLength) {
    throw new TypeError(`${name} must be an array with at least ${minLength} value(s)`);
  }
  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${name} must contain only finite numbers`);
  }
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleStd(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function priceReturns(prices) {
  assertFiniteArray(prices, 'prices', 2);
  if (prices.some((price) => price <= 0)) throw new TypeError('prices must be greater than zero');
  return prices.slice(1).map((price, index) => price / prices[index] - 1);
}

export function equityCurve(returns, initialValue = 1) {
  assertFiniteArray(returns, 'returns');
  if (!Number.isFinite(initialValue) || initialValue <= 0) {
    throw new TypeError('initialValue must be a positive finite number');
  }

  const curve = [initialValue];
  for (const value of returns) {
    if (value <= -1) throw new TypeError('returns cannot be <= -1');
    curve.push(curve.at(-1) * (1 + value));
  }
  return curve;
}

export function drawdownSeries(curve) {
  assertFiniteArray(curve, 'curve');
  if (curve.some((value) => value <= 0)) throw new TypeError('curve values must be greater than zero');
  let peak = curve[0];
  return curve.map((value) => {
    peak = Math.max(peak, value);
    return value / peak - 1;
  });
}

export function maxDrawdown(curve) {
  return Math.min(...drawdownSeries(curve));
}

export function annualizedVolatility(returns, periodsPerYear = 252) {
  assertFiniteArray(returns, 'returns');
  if (!Number.isFinite(periodsPerYear) || periodsPerYear <= 0) {
    throw new TypeError('periodsPerYear must be a positive finite number');
  }
  return sampleStd(returns) * Math.sqrt(periodsPerYear);
}

export function sharpeRatio(returns, { riskFreePerPeriod = 0, periodsPerYear = 252 } = {}) {
  assertFiniteArray(returns, 'returns');
  if (!Number.isFinite(riskFreePerPeriod)) throw new TypeError('riskFreePerPeriod must be finite');
  const excess = returns.map((value) => value - riskFreePerPeriod);
  const std = sampleStd(excess);
  if (std === 0) return null;
  return (mean(excess) / std) * Math.sqrt(periodsPerYear);
}

export function rollingMean(values, window) {
  assertFiniteArray(values, 'values');
  if (!Number.isInteger(window) || window < 1) throw new TypeError('window must be a positive integer');
  return values.map((_, index) => {
    if (index + 1 < window) return null;
    return mean(values.slice(index + 1 - window, index + 1));
  });
}

export function rollingVolatility(returns, window, periodsPerYear = 252) {
  assertFiniteArray(returns, 'returns');
  if (!Number.isInteger(window) || window < 2) throw new TypeError('window must be an integer >= 2');
  return returns.map((_, index) => {
    if (index + 1 < window) return null;
    return sampleStd(returns.slice(index + 1 - window, index + 1)) * Math.sqrt(periodsPerYear);
  });
}

export function buildQuantReport({ prices, dates = null, periodsPerYear = 252, rollingWindow = 20 }) {
  assertFiniteArray(prices, 'prices', 2);
  if (dates !== null && (!Array.isArray(dates) || dates.length !== prices.length)) {
    throw new TypeError('dates must be null or have one entry per price');
  }
  const returns = priceReturns(prices);
  const curve = equityCurve(returns);
  const drawdowns = drawdownSeries(curve);
  const rollWindow = Math.min(Math.max(2, rollingWindow), returns.length);
  const rollingVol = rollingVolatility(returns, rollWindow, periodsPerYear);
  const cumulativeReturn = curve.at(-1) / curve[0] - 1;

  return {
    metadata: {
      observations: prices.length,
      periodsPerYear,
      rollingWindow: rollWindow,
    },
    summary: {
      cumulativeReturn,
      annualizedVolatility: annualizedVolatility(returns, periodsPerYear),
      sharpeRatio: sharpeRatio(returns, { periodsPerYear }),
      maxDrawdown: Math.min(...drawdowns),
      bestPeriodReturn: Math.max(...returns),
      worstPeriodReturn: Math.min(...returns),
    },
    series: {
      dates: dates ?? prices.map((_, index) => String(index)),
      prices: [...prices],
      returns,
      equity: curve,
      drawdown: drawdowns,
      rollingVolatility: [null, ...rollingVol],
    },
    claimBoundary: 'descriptive visualization only; not investment advice or evidence of predictive alpha',
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function scale(values, minOut, maxOut) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => (minOut + maxOut) / 2);
  return values.map((value) => minOut + ((value - min) / (max - min)) * (maxOut - minOut));
}

function polylinePoints(values, { x0, x1, y0, y1 }) {
  const xs = values.map((_, index) => x0 + (index / Math.max(1, values.length - 1)) * (x1 - x0));
  const ys = scale(values, y1, y0);
  return values.map((_, index) => `${xs[index].toFixed(2)},${ys[index].toFixed(2)}`).join(' ');
}

function pct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function renderQuantReportSvg(report, { width = 960, height = 560, title = 'Quant ML Visualizer' } = {}) {
  if (!report?.summary || !report?.series) throw new TypeError('report must be produced by buildQuantReport');
  if (!Number.isFinite(width) || width < 480 || !Number.isFinite(height) || height < 360) {
    throw new TypeError('width/height are too small for the report');
  }

  const margin = 54;
  const plotRight = width - margin;
  const equityTop = 110;
  const equityBottom = Math.round(height * 0.58);
  const ddTop = equityBottom + 70;
  const ddBottom = height - 48;
  const equityPoints = polylinePoints(report.series.equity, {
    x0: margin,
    x1: plotRight,
    y0: equityTop,
    y1: equityBottom,
  });
  const ddPoints = polylinePoints(report.series.drawdown, {
    x0: margin,
    x1: plotRight,
    y0: ddTop,
    y1: ddBottom,
  });
  const sharpe = report.summary.sharpeRatio === null ? 'n/a' : report.summary.sharpeRatio.toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">Equity curve, drawdown curve, and descriptive return statistics.</desc>
  <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
  <text x="${margin}" y="38" font-family="system-ui, sans-serif" font-size="24" font-weight="700">${escapeXml(title)}</text>
  <text x="${margin}" y="68" font-family="system-ui, sans-serif" font-size="13">Return ${pct(report.summary.cumulativeReturn)} · Vol ${pct(report.summary.annualizedVolatility)} · Sharpe ${sharpe} · Max DD ${pct(report.summary.maxDrawdown)}</text>
  <text x="${margin}" y="98" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Equity curve</text>
  <rect x="${margin}" y="${equityTop}" width="${plotRight - margin}" height="${equityBottom - equityTop}" fill="none" stroke="currentColor" opacity="0.18"/>
  <polyline points="${equityPoints}" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="${margin}" y="${ddTop - 18}" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Drawdown</text>
  <rect x="${margin}" y="${ddTop}" width="${plotRight - margin}" height="${ddBottom - ddTop}" fill="none" stroke="currentColor" opacity="0.18"/>
  <polyline points="${ddPoints}" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="${plotRight}" y="${height - 14}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11">Descriptive only — not investment advice</text>
</svg>`;
}

export function renderQuantReportHtml(report, options = {}) {
  const svg = renderQuantReportSvg(report, options);
  const summaryJson = escapeXml(JSON.stringify(report.summary, null, 2));
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeXml(options.title ?? 'Quant ML Visualizer')}</title></head>
<body><main>${svg}<h2>Summary JSON</h2><pre>${summaryJson}</pre><p>${escapeXml(report.claimBoundary)}</p></main></body>
</html>`;
}
