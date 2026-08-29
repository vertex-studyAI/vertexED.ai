import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const reference = JSON.parse(fs.readFileSync(path.join(PROJECT, 'results/reference.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(PROJECT, 'results/misaligned-audit.json'), 'utf8'));

const fmt = (x, n = 4) => Number(x).toFixed(n);
const write = (name, body) => fs.writeFileSync(path.join(HERE, name), body.trim() + '\n', 'utf8');

function maeSvg() {
  const W = 900, H = 540, L = 90, R = 30, T = 60, B = 80;
  const pw = W - L - R, ph = H - T - B;
  const rows = audit.conditions;
  const methods = [
    ['meanLinearMae', 'Linear baseline', ''],
    ['meanArithmeticMae', 'Arithmetic blocks', '7 4'],
    ['meanHarmonicMae', 'Harmonic blocks', '2 4'],
  ];
  const xmin = 0, xmax = 0.9, ymin = 0, ymax = 0.11;
  const x = (v) => L + ((v - xmin) / (xmax - xmin)) * pw;
  const y = (v) => T + ((ymax - v) / (ymax - ymin)) * ph;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`, '<rect width="100%" height="100%" fill="white"/>'];
  out.push('<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.axis{stroke:#111;stroke-width:1.5}.grid{stroke:#bbb;stroke-width:1;stroke-dasharray:3 5}.series{fill:none;stroke:#111;stroke-width:2.3}.pt{fill:white;stroke:#111;stroke-width:2}.title{font-size:20px;font-weight:700}.label{font-size:14px}.small{font-size:12px}.legend{font-size:13px}</style>');
  out.push(`<text x="${W/2}" y="30" text-anchor="middle" class="title">T2424-0050 harder audit: mean pressure MAE</text>`);
  for (const v of [0,0.02,0.04,0.06,0.08,0.10]) {
    const yy = y(v); out.push(`<line x1="${L}" y1="${fmt(yy,2)}" x2="${W-R}" y2="${fmt(yy,2)}" class="grid"/>`); out.push(`<text x="${L-10}" y="${fmt(yy+4,2)}" text-anchor="end" class="small">${fmt(v,2)}</text>`);
  }
  for (const v of [0,0.5,0.9]) {
    const xx = x(v); out.push(`<line x1="${fmt(xx,2)}" y1="${T}" x2="${fmt(xx,2)}" y2="${H-B}" class="grid"/>`); out.push(`<text x="${fmt(xx,2)}" y="${H-B+24}" text-anchor="middle" class="small">${v}</text>`);
  }
  out.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" class="axis"/>`, `<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" class="axis"/>`);
  out.push(`<text x="${(L+W-R)/2}" y="${H-28}" text-anchor="middle" class="label">AR(1) log-permeability correlation ρ</text>`);
  out.push(`<text x="24" y="${(T+H-B)/2}" transform="rotate(-90 24 ${(T+H-B)/2})" text-anchor="middle" class="label">Mean pressure-profile MAE</text>`);
  methods.forEach(([key,,dash]) => {
    const pts = rows.map(r => `${fmt(x(r.rho),2)},${fmt(y(r[key]),2)}`).join(' ');
    out.push(`<polyline points="${pts}" class="series"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    rows.forEach(r => out.push(`<circle cx="${fmt(x(r.rho),2)}" cy="${fmt(y(r[key]),2)}" r="4" class="pt"/>`));
  });
  methods.forEach(([key,label,dash], i) => {
    const yy = 82 + 23*i; out.push(`<line x1="610" y1="${yy}" x2="654" y2="${yy}" class="series"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`); out.push(`<text x="664" y="${yy+4}" class="legend">${label}</text>`);
  });
  out.push(`<text x="${L}" y="${H-8}" class="small">Source: results/misaligned-audit.json; 100 deterministic fields per condition.</text>`, '</svg>');
  return out.join('\n');
}

function improvementSvg() {
  const W = 900, H = 520, L = 90, R = 30, T = 60, B = 80;
  const pw = W - L - R, ph = H - T - B;
  const rows = audit.conditions;
  const xmin = 0, xmax = 0.9, ymin = 0.5, ymax = 0.9;
  const x = (v) => L + ((v - xmin) / (xmax - xmin)) * pw;
  const y = (v) => T + ((ymax - v) / (ymax - ymin)) * ph;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`, '<rect width="100%" height="100%" fill="white"/>'];
  out.push('<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.axis{stroke:#111;stroke-width:1.5}.grid{stroke:#bbb;stroke-width:1;stroke-dasharray:3 5}.series{fill:none;stroke:#111;stroke-width:2.5}.threshold{stroke:#111;stroke-width:1.5;stroke-dasharray:8 5}.pt{fill:white;stroke:#111;stroke-width:2}.title{font-size:20px;font-weight:700}.label{font-size:14px}.small{font-size:12px}.note{font-size:13px;font-weight:700}</style>');
  out.push(`<text x="${W/2}" y="30" text-anchor="middle" class="title">Harmonic-block improvement vs linear baseline</text>`);
  for (const v of [0.5,0.6,0.65,0.7,0.8,0.9]) {
    const yy = y(v); out.push(`<line x1="${L}" y1="${fmt(yy,2)}" x2="${W-R}" y2="${fmt(yy,2)}" class="grid"/>`); out.push(`<text x="${L-10}" y="${fmt(yy+4,2)}" text-anchor="end" class="small">${fmt(v*100,0)}%</text>`);
  }
  for (const v of [0,0.5,0.9]) {
    const xx = x(v); out.push(`<line x1="${fmt(xx,2)}" y1="${T}" x2="${fmt(xx,2)}" y2="${H-B}" class="grid"/>`); out.push(`<text x="${fmt(xx,2)}" y="${H-B+24}" text-anchor="middle" class="small">${v}</text>`);
  }
  out.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" class="axis"/>`, `<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" class="axis"/>`);
  const thresholdY = y(0.65); out.push(`<line x1="${L}" y1="${fmt(thresholdY,2)}" x2="${W-R}" y2="${fmt(thresholdY,2)}" class="threshold"/>`); out.push(`<text x="${W-R-4}" y="${fmt(thresholdY-8,2)}" text-anchor="end" class="small">65% parent-screen threshold (not a harder-audit promotion rule)</text>`);
  const pts = rows.map(r => `${fmt(x(r.rho),2)},${fmt(y(r.meanHarmonicImprovement),2)}`).join(' '); out.push(`<polyline points="${pts}" class="series"/>`);
  rows.forEach(r => { out.push(`<circle cx="${fmt(x(r.rho),2)}" cy="${fmt(y(r.meanHarmonicImprovement),2)}" r="4" class="pt"/>`); out.push(`<text x="${fmt(x(r.rho),2)}" y="${fmt(y(r.meanHarmonicImprovement)-12,2)}" text-anchor="middle" class="small">${fmt(r.meanHarmonicImprovement*100,2)}%</text>`); });
  const r0 = rows.find(r => r.rho === 0); out.push(`<text x="${x(0)+18}" y="${y(r0.meanHarmonicImprovement)+38}" class="note">ρ=0 is below 65%; seed 6 also loses to linear.</text>`);
  out.push(`<text x="${(L+W-R)/2}" y="${H-28}" text-anchor="middle" class="label">AR(1) log-permeability correlation ρ</text>`); out.push(`<text x="24" y="${(T+H-B)/2}" transform="rotate(-90 24 ${(T+H-B)/2})" text-anchor="middle" class="label">Mean relative pressure-MAE improvement</text>`);
  out.push(`<text x="${L}" y="${H-8}" class="small">Source: results/misaligned-audit.json. Negative evidence is intentionally retained.</text>`, '</svg>');
  return out.join('\n');
}

const figureData = {
  source_reference: '../results/reference.json',
  source_harder_audit: '../results/misaligned-audit.json',
  parent: reference.summary,
  harder_conditions: audit.conditions.map(r => ({
    rho: r.rho,
    meanLinearMae: r.meanLinearMae,
    meanHarmonicMae: r.meanHarmonicMae,
    meanArithmeticMae: r.meanArithmeticMae,
    meanHarmonicImprovement: r.meanHarmonicImprovement,
    harmonicBeatsLinear: r.harmonicBeatsLinear,
    harmonicBeatsArithmetic: r.harmonicBeatsArithmetic,
    worstHarmonicCase: r.worstHarmonicCase,
  })),
  interpretation: audit.interpretation,
};

write('figure1_harder_audit_mae.svg', maeSvg());
write('figure2_harmonic_improvement.svg', improvementSvg());
write('FIGURE_DATA.json', JSON.stringify(figureData, null, 2));
console.log('Generated Darcy evidence-derived figure package.');
