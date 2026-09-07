import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export function renderEvidenceFigure(raw) {
  const width = 960;
  const height = 540;
  const left = 82;
  const right = 36;
  const top = 92;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const yMin = -0.05;
  const yMax = 0.80;
  const x = (seed) => left + (seed / 19) * plotWidth;
  const y = (value) => top + ((yMax - value) / (yMax - yMin)) * plotHeight;
  const ticks = [0, 0.25, 0.50, 0.75];
  const series = [
    { key: 'diffusion', label: 'Diffusion', color: '#185FA5' },
    { key: 'zero_diffusion', label: 'Zero-diffusion control', color: '#BA7517' },
  ];
  const lines = series.map(({ key, color }) =>
    raw[key].trials.map((trial) => `${x(trial.seed).toFixed(2)},${y(trial.relative_improvement).toFixed(2)}`).join(' ')
  );
  const circles = series.flatMap(({ key, label, color }) =>
    raw[key].trials.map((trial) =>
      `  <circle cx="${x(trial.seed).toFixed(2)}" cy="${y(trial.relative_improvement).toFixed(2)}" r="4" fill="${color}"><title>${esc(label)} seed ${trial.seed}: ${(trial.relative_improvement * 100).toFixed(3)}%</title></circle>`
    )
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    '  <title id="title">T2424-1863 per-seed relative improvement</title>',
    '  <desc id="desc">Twenty fixed diffusion seeds and twenty zero-diffusion control seeds. Every diffusion result is below the frozen greater-than-75-percent gate, preserving the negative verdict.</desc>',
    '  <rect width="100%" height="100%" fill="#ffffff"/>',
    '  <text x="82" y="34" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#17202A">T2424-1863: every retained seed misses the frozen gate</text>',
    '  <text x="82" y="60" font-family="system-ui, sans-serif" font-size="14" fill="#4D5B68">Relative one-step RMSE improvement vs persistence; fixed seeds 0–19</text>',
    ...ticks.flatMap((tick) => [
      `  <line x1="${left}" x2="${width - right}" y1="${y(tick).toFixed(2)}" y2="${y(tick).toFixed(2)}" stroke="#D9E1E8" stroke-width="1"/>`,
      `  <text x="${left - 12}" y="${(y(tick) + 5).toFixed(2)}" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#4D5B68">${Math.round(tick * 100)}%</text>`,
    ]),
    `  <line x1="${left}" x2="${width - right}" y1="${y(0.75).toFixed(2)}" y2="${y(0.75).toFixed(2)}" stroke="#C43C39" stroke-width="3" stroke-dasharray="8 6"/>`,
    `  <text x="${width - right}" y="${(y(0.75) - 9).toFixed(2)}" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#C43C39">Frozen &gt;75% criterion</text>`,
    `  <polyline points="${lines[0]}" fill="none" stroke="#185FA5" stroke-width="2"/>`,
    `  <polyline points="${lines[1]}" fill="none" stroke="#BA7517" stroke-width="2"/>`,
    ...circles,
    `  <line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" stroke="#17202A"/>`,
    ...[0, 5, 10, 15, 19].flatMap((seed) => [
      `  <line x1="${x(seed).toFixed(2)}" x2="${x(seed).toFixed(2)}" y1="${height - bottom}" y2="${height - bottom + 6}" stroke="#17202A"/>`,
      `  <text x="${x(seed).toFixed(2)}" y="${height - bottom + 24}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#4D5B68">${seed}</text>`,
    ]),
    `  <text x="${left + plotWidth / 2}" y="${height - 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#17202A">Fixed seed</text>`,
    '  <circle cx="640" cy="74" r="4" fill="#185FA5"/><text x="650" y="79" font-family="system-ui, sans-serif" font-size="12" fill="#17202A">Diffusion</text>',
    '  <circle cx="735" cy="74" r="4" fill="#BA7517"/><text x="745" y="79" font-family="system-ui, sans-serif" font-size="12" fill="#17202A">Zero-diffusion control</text>',
    '</svg>',
    '',
  ].join('\n');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    throw new Error('Usage: node scripts/generate-t2424-1863-evidence-figure.mjs <raw_metrics.json> <output.svg>');
  }
  const raw = JSON.parse(await readFile(input, 'utf8'));
  await writeFile(output, renderEvidenceFigure(raw), 'utf8');
}
