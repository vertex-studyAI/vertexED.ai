import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const DATA_PATH = 'portfolio/research/eigen-jepa/FIGURE_DATA.json';
const OUTPUT_PATH = 'portfolio/research/eigen-jepa/figures/primary-comparison.svg';

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function scaledMatrixMse(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`invalid matrix MSE: ${raw}`);
  }
  return value * 1e9;
}

function scaledDifference(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`invalid paired difference: ${raw}`);
  }
  return value * 1e9;
}

export function validateFigureData(data) {
  if (data?.schema !== 'eigen-jepa.paper-figure-data.v1') {
    throw new Error('unexpected Eigen-JEPA figure-data schema');
  }
  if (data?.primary_metric?.name !== 'covariance-matrix MSE') {
    throw new Error('primary metric drift');
  }
  if (data?.primary_metric?.direction !== 'lower_is_better') {
    throw new Error('primary metric direction drift');
  }
  if (!Array.isArray(data?.primary_metric?.methods) || data.primary_metric.methods.length !== 5) {
    throw new Error('expected exactly five frozen compared methods');
  }
  if (data?.paired_primary_comparison?.comparison !== 'Eigen-JEPA minus raw ridge') {
    throw new Error('paired comparison drift');
  }
  if (data?.scientific_boundary?.primary_superiority_supported !== false) {
    throw new Error('figure data cannot promote unsupported primary superiority');
  }
  if (data?.scientific_boundary?.post_outcome_rescue_allowed !== false) {
    throw new Error('figure data cannot authorize post-outcome rescue');
  }
}

export function buildSvg(data) {
  validateFigureData(data);

  const width = 900;
  const height = 620;
  const plotX = 220;
  const plotWidth = 560;
  const maxMse = 8;
  const methods = data.primary_metric.methods;

  const bars = methods.map((method, index) => {
    const value = scaledMatrixMse(method.matrix_mse);
    const y = 110 + index * 62;
    const barWidth = (value / maxMse) * plotWidth;
    const isEigen = method.name === 'Eigen-JEPA';
    return [
      `<text x="${plotX - 14}" y="${y + 20}" text-anchor="end" font-size="16">${esc(method.name)}</text>`,
      `<rect x="${plotX}" y="${y}" width="${barWidth.toFixed(3)}" height="28" fill="${isEigen ? '#777' : '#bbb'}" stroke="#222" stroke-width="1"/>`,
      `<text x="${Math.min(plotX + barWidth + 8, 810).toFixed(3)}" y="${y + 20}" font-size="14">${value.toFixed(7)}</text>`,
    ].join('\n');
  }).join('\n');

  const ticks = [0, 2, 4, 6, 8].map((tick) => {
    const x = plotX + (tick / maxMse) * plotWidth;
    return [
      `<line x1="${x}" y1="95" x2="${x}" y2="405" stroke="#ddd" stroke-width="1"/>`,
      `<text x="${x}" y="430" text-anchor="middle" font-size="13">${tick}</text>`,
    ].join('\n');
  }).join('\n');

  const intervalMin = -0.3;
  const intervalMax = 0.5;
  const intervalY = 520;
  const interval = data.paired_primary_comparison;
  const point = scaledDifference(interval.difference);
  const lower = scaledDifference(interval.interval_95[0]);
  const upper = scaledDifference(interval.interval_95[1]);
  const intervalX = (value) => 220 + ((value - intervalMin) / (intervalMax - intervalMin)) * 560;
  const zeroX = intervalX(0);
  const lowerX = intervalX(lower);
  const upperX = intervalX(upper);
  const pointX = intervalX(point);

  const intervalTicks = [-0.3, -0.1, 0.1, 0.3, 0.5].map((tick) => {
    const x = intervalX(tick);
    return `<text x="${x.toFixed(3)}" y="585" text-anchor="middle" font-size="13">${tick.toFixed(1)}</text>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n` +
`<rect width="100%" height="100%" fill="white"/>\n` +
`<g font-family="Arial, Helvetica, sans-serif" fill="#111">\n` +
`<text x="40" y="42" font-size="22" font-weight="700">Eigen-JEPA frozen primary comparison</text>\n` +
`<text x="40" y="70" font-size="14">Retained held-out aggregate evidence; n=${data.source.heldout_blocks} chronological test blocks.</text>\n` +
`<text x="40" y="98" font-size="17" font-weight="700">A. Covariance-matrix MSE (×10⁻⁹; lower is better)</text>\n` +
`${ticks}\n${bars}\n` +
`<line x1="${plotX}" y1="405" x2="${plotX + plotWidth}" y2="405" stroke="#222" stroke-width="1.5"/>\n` +
`<text x="500" y="455" text-anchor="middle" font-size="14">Primary matrix MSE ×10⁻⁹</text>\n` +
`<text x="40" y="490" font-size="17" font-weight="700">B. Paired Eigen-JEPA − raw-ridge MSE difference (×10⁻⁹)</text>\n` +
`<line x1="220" y1="${intervalY}" x2="780" y2="${intervalY}" stroke="#222" stroke-width="1.5"/>\n` +
`<line x1="${zeroX.toFixed(3)}" y1="495" x2="${zeroX.toFixed(3)}" y2="555" stroke="#555" stroke-width="1.5" stroke-dasharray="5 4"/>\n` +
`<line x1="${lowerX.toFixed(3)}" y1="${intervalY}" x2="${upperX.toFixed(3)}" y2="${intervalY}" stroke="#222" stroke-width="4"/>\n` +
`<line x1="${lowerX.toFixed(3)}" y1="510" x2="${lowerX.toFixed(3)}" y2="530" stroke="#222" stroke-width="2"/>\n` +
`<line x1="${upperX.toFixed(3)}" y1="510" x2="${upperX.toFixed(3)}" y2="530" stroke="#222" stroke-width="2"/>\n` +
`<circle cx="${pointX.toFixed(3)}" cy="${intervalY}" r="7" fill="#777" stroke="#111" stroke-width="1.5"/>\n` +
`${intervalTicks}\n` +
`<text x="500" y="607" text-anchor="middle" font-size="13">Positive favors raw ridge under the frozen difference convention; retained 95% interval crosses zero.</text>\n` +
`</g>\n</svg>\n`;
}

export function generateFromRepo(root = process.cwd()) {
  const data = JSON.parse(readFileSync(resolve(root, DATA_PATH), 'utf8'));
  const svg = buildSvg(data);
  writeFileSync(resolve(root, OUTPUT_PATH), svg, 'utf8');
  return svg;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateFromRepo();
}
