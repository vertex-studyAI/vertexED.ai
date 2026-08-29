import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(HERE, '../raw_metrics/repro-wave-20260812.json');
const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const rows = data.ablation.summary;

const fmt = (n, digits = 2) => Number(n).toFixed(digits);
const escapeXml = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function write(name, content) {
  fs.writeFileSync(path.join(HERE, name), `${content.trim()}\n`, 'utf8');
}

function contaminationMaeFigure() {
  const W = 900, H = 540, L = 90, R = 30, T = 60, B = 80;
  const pw = W - L - R, ph = H - T - B;
  const xmin = 0, xmax = 0.35, ymin = 0.01, ymax = 1.0;
  const x = (v) => L + ((v - xmin) / (xmax - xmin)) * pw;
  const y = (v) => T + ((Math.log10(ymax) - Math.log10(v)) / (Math.log10(ymax) - Math.log10(ymin))) * ph;
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push('<rect width="100%" height="100%" fill="white"/>');
  out.push('<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.axis{stroke:#111;stroke-width:1.5}.grid{stroke:#bbb;stroke-width:1;stroke-dasharray:3 5}.series{fill:none;stroke:#111;stroke-width:2.2}.pt{fill:white;stroke:#111;stroke-width:1.8}.small{font-size:12px}.label{font-size:14px}.title{font-size:20px;font-weight:700}.legend{font-size:13px}</style>');
  out.push(`<text x="${W / 2}" y="30" text-anchor="middle" class="title">T2424-0025 contamination sweep: MAE by robust readout</text>`);

  for (const [value, label] of [[0.01,'0.01'],[0.02,'0.02'],[0.05,'0.05'],[0.1,'0.10'],[0.2,'0.20'],[0.5,'0.50'],[1.0,'1.00']]) {
    const yy = y(value);
    out.push(`<line x1="${L}" y1="${fmt(yy)}" x2="${W - R}" y2="${fmt(yy)}" class="grid"/>`);
    out.push(`<text x="${L - 10}" y="${fmt(yy + 4)}" text-anchor="end" class="small">${label}</text>`);
  }
  for (const value of [0,0.05,0.10,0.18,0.25,0.35]) {
    const xx = x(value);
    out.push(`<line x1="${fmt(xx)}" y1="${T}" x2="${fmt(xx)}" y2="${H - B}" class="grid"/>`);
    out.push(`<text x="${fmt(xx)}" y="${H - B + 24}" text-anchor="middle" class="small">${fmt(value)}</text>`);
  }

  out.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" class="axis"/>`);
  out.push(`<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" class="axis"/>`);
  out.push(`<text x="${(L + W - R) / 2}" y="${H - 28}" text-anchor="middle" class="label">Cauchy contamination fraction</text>`);
  out.push(`<text x="24" y="${(T + H - B) / 2}" transform="rotate(-90 24 ${(T + H - B) / 2})" text-anchor="middle" class="label">MAE (log scale)</text>`);

  const series = [
    ['mean', 'Arithmetic mean', ''],
    ['median', 'Weighted median', '6 4'],
    ['trim10', '10% trimmed mean', '2 4'],
    ['huber', 'Huber', '10 4 2 4'],
  ];
  for (const [key, , dash] of series) {
    const points = rows.map((row) => `${fmt(x(row.contamination))},${fmt(y(row[key].mae))}`).join(' ');
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : '';
    out.push(`<polyline points="${points}" class="series"${dashAttr}/>`);
    for (const row of rows) out.push(`<circle cx="${fmt(x(row.contamination))}" cy="${fmt(y(row[key].mae))}" r="3.3" class="pt"/>`);
  }

  const lx = 585, ly = 78;
  series.forEach(([key, name, dash], i) => {
    const yy = ly + i * 23;
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : '';
    out.push(`<line x1="${lx}" y1="${yy}" x2="${lx + 42}" y2="${yy}" class="series"${dashAttr}/>`);
    out.push(`<text x="${lx + 50}" y="${yy + 4}" class="legend">${escapeXml(name)}</text>`);
  });

  out.push(`<text x="${L}" y="${H - 8}" class="small">Source: raw_metrics/repro-wave-20260812.json; frozen source ${data.source_commit.slice(0, 12)}…</text>`);
  out.push('</svg>');
  return out.join('\n');
}

function relativeImprovementFigure() {
  const W = 900, H = 520, L = 90, R = 30, T = 60, B = 80;
  const pw = W - L - R, ph = H - T - B;
  const xmin = 0, xmax = 0.35, ymin = 0.4, ymax = 1.0;
  const x = (v) => L + ((v - xmin) / (xmax - xmin)) * pw;
  const y = (v) => T + ((ymax - v) / (ymax - ymin)) * ph;
  const values = rows.map((row) => [row.contamination, (row.mean.mae - row.median.mae) / row.mean.mae]);
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push('<rect width="100%" height="100%" fill="white"/>');
  out.push('<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.axis{stroke:#111;stroke-width:1.5}.grid{stroke:#bbb;stroke-width:1;stroke-dasharray:3 5}.series{fill:none;stroke:#111;stroke-width:2.4}.pt{fill:white;stroke:#111;stroke-width:2}.small{font-size:12px}.label{font-size:14px}.title{font-size:20px;font-weight:700}.note{font-size:13px;font-weight:700}</style>');
  out.push(`<text x="${W / 2}" y="30" text-anchor="middle" class="title">Median MAE reduction relative to arithmetic mean</text>`);

  for (const value of [0.4,0.5,0.6,0.7,0.8,0.9,1.0]) {
    const yy = y(value);
    out.push(`<line x1="${L}" y1="${fmt(yy)}" x2="${W - R}" y2="${fmt(yy)}" class="grid"/>`);
    out.push(`<text x="${L - 10}" y="${fmt(yy + 4)}" text-anchor="end" class="small">${Math.round(value * 100)}%</text>`);
  }
  for (const value of [0,0.05,0.10,0.18,0.25,0.35]) {
    const xx = x(value);
    out.push(`<line x1="${fmt(xx)}" y1="${T}" x2="${fmt(xx)}" y2="${H - B}" class="grid"/>`);
    out.push(`<text x="${fmt(xx)}" y="${H - B + 24}" text-anchor="middle" class="small">${fmt(value)}</text>`);
  }

  out.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" class="axis"/>`);
  out.push(`<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" class="axis"/>`);
  out.push(`<text x="${(L + W - R) / 2}" y="${H - 28}" text-anchor="middle" class="label">Cauchy contamination fraction</text>`);
  out.push(`<text x="24" y="${(T + H - B) / 2}" transform="rotate(-90 24 ${(T + H - B) / 2})" text-anchor="middle" class="label">Relative MAE reduction</text>`);

  const points = values.map(([c, v]) => `${fmt(x(c))},${fmt(y(v))}`).join(' ');
  out.push(`<polyline points="${points}" class="series"/>`);
  for (const [c, v] of values) {
    out.push(`<circle cx="${fmt(x(c))}" cy="${fmt(y(v))}" r="4" class="pt"/>`);
    out.push(`<text x="${fmt(x(c))}" y="${fmt(y(v) - 10)}" text-anchor="middle" class="small">${fmt(v * 100, 1)}%</text>`);
  }

  const [c0, v0] = values[0];
  out.push(`<line x1="${fmt(x(c0) + 8)}" y1="${fmt(y(v0) - 6)}" x2="${fmt(x(c0) + 145)}" y2="${fmt(y(v0) - 65)}" stroke="#111" stroke-width="1.2"/>`);
  out.push(`<text x="${fmt(x(c0) + 150)}" y="${fmt(y(v0) - 69)}" class="note">0% contamination still shows ${fmt(v0 * 100, 1)}% reduction</text>`);
  out.push(`<text x="${fmt(x(c0) + 150)}" y="${fmt(y(v0) - 51)}" class="small">Central negative control against unique heavy-tail attribution.</text>`);
  out.push(`<text x="${L}" y="${H - 8}" class="small">Source: raw_metrics/repro-wave-20260812.json; frozen source ${data.source_commit.slice(0, 12)}…</text>`);
  out.push('</svg>');
  return out.join('\n');
}

const derived = rows.map((row) => ({
  contamination: row.contamination,
  median_relative_improvement_vs_mean: (row.mean.mae - row.median.mae) / row.mean.mae,
}));

write('figure1_contamination_mae.svg', contaminationMaeFigure());
write('figure2_relative_improvement.svg', relativeImprovementFigure());
write('FIGURE_DATA.json', JSON.stringify({
  source: '../raw_metrics/repro-wave-20260812.json',
  source_commit: data.source_commit,
  formula: '(mean_mae - median_mae) / mean_mae',
  derived,
}, null, 2));

console.log('Generated evidence-derived SVG figures and FIGURE_DATA.json');
