import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(here, '../evidence/raw/results.json');
const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const m = data.metrics;

const bars = [
  ['Raw concept', m.rawConceptAccuracy],
  ['Centered concept', m.centeredConceptAccuracy],
  ['Raw language', m.rawLanguageAccuracy],
  ['Language-centered language', m.centeredLanguageAccuracy],
  ['Global-centered language', m.globalCenteredLanguageAccuracy],
];

const W = 960;
const H = 560;
const L = 255;
const R = 55;
const T = 75;
const B = 80;
const plotW = W - L - R;
const plotH = H - T - B;
const rowH = plotH / bars.length;
const x = (v) => L + Math.max(0, Math.min(1, v)) * plotW;

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
out.push('<rect width="100%" height="100%" fill="white"/>');
out.push('<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.title{font-size:21px;font-weight:700}.label{font-size:14px}.small{font-size:12px}.axis{stroke:#111;stroke-width:1.4}.grid{stroke:#bbb;stroke-width:1;stroke-dasharray:3 5}.bar{fill:#ddd;stroke:#111;stroke-width:1.5}.chance{stroke:#111;stroke-width:2;stroke-dasharray:7 5}.value{font-size:13px;font-weight:700}</style>');
out.push(`<text x="${W / 2}" y="32" text-anchor="middle" class="title">T2424-0027 held-out probe accuracies</text>`);
out.push(`<text x="${W / 2}" y="54" text-anchor="middle" class="small">Deterministic synthetic diagnostic; chance language accuracy = ${(m.languageChance * 100).toFixed(2)}%</text>`);

for (const tick of [0, 0.25, 0.5, 0.75, 1]) {
  const xx = x(tick);
  out.push(`<line x1="${xx.toFixed(2)}" y1="${T}" x2="${xx.toFixed(2)}" y2="${H - B}" class="grid"/>`);
  out.push(`<text x="${xx.toFixed(2)}" y="${H - B + 24}" text-anchor="middle" class="small">${Math.round(tick * 100)}%</text>`);
}

bars.forEach(([label, value], i) => {
  const cy = T + rowH * (i + 0.5);
  const y0 = cy - 19;
  out.push(`<text x="${L - 14}" y="${(cy + 5).toFixed(2)}" text-anchor="end" class="label">${label}</text>`);
  out.push(`<rect x="${L}" y="${y0.toFixed(2)}" width="${Math.max(1, x(value) - L).toFixed(2)}" height="38" class="bar"/>`);
  out.push(`<text x="${Math.min(W - R - 4, x(value) + 8).toFixed(2)}" y="${(cy + 5).toFixed(2)}" class="value">${(value * 100).toFixed(2)}%</text>`);
});

const chanceX = x(m.languageChance);
out.push(`<line x1="${chanceX.toFixed(2)}" y1="${T}" x2="${chanceX.toFixed(2)}" y2="${H - B}" class="chance"/>`);
out.push(`<text x="${(chanceX + 7).toFixed(2)}" y="${T + 15}" class="small">language chance</text>`);
out.push(`<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" class="axis"/>`);
out.push(`<text x="${(L + W - R) / 2}" y="${H - 25}" text-anchor="middle" class="label">Accuracy</text>`);
out.push(`<text x="${L}" y="${H - 5}" class="small">Source: evidence/raw/results.json; verdict: ${data.verdict}</text>`);
out.push('</svg>');

fs.writeFileSync(path.join(here, 'figure1_probe_accuracies.svg'), `${out.join('\n')}\n`, 'utf8');
fs.writeFileSync(path.join(here, 'FIGURE_DATA.json'), `${JSON.stringify({
  source: '../evidence/raw/results.json',
  metrics: m,
  verdict: data.verdict,
}, null, 2)}\n`, 'utf8');

console.log('Generated figure1_probe_accuracies.svg and FIGURE_DATA.json');
