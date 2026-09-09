#!/usr/bin/env node
/** Offline descriptive diagnostics. Does not collect labels, fit models, or authorize experiments. */
import { createHash } from 'node:crypto';
import { open, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 10_000;
const EDGES = Array.from({ length: 11 }, (_, i) => i / 10);
const SPARSE_N = 10;
const fail = (message) => { throw new Error(message); };
const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = (x, name) => {
  if (typeof x !== 'string' || !x.trim() || x.length > 500) fail(`${name}: expected non-empty text (max 500 characters)`);
};
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => x === null ? '—' : `${(100 * x).toFixed(1)}%`;
const dec = (x) => x === null ? '—' : x.toFixed(4);

/** Exact edges belong to the bin starting at that edge; 1 belongs to the last bin. */
export function binIndex(confidence) {
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    fail('confidence: expected a finite number from 0 to 1');
  }
  for (let i = 0; i < 9; i += 1) if (confidence < EDGES[i + 1]) return i;
  return 9;
}

export function validateDataset(data) {
  if (!isObject(data) || data.schemaVersion !== 1) fail('schemaVersion must equal 1');
  if (!['observed', 'synthetic-test'].includes(data.evidenceKind)) fail('evidenceKind must be observed or synthetic-test');
  if (!isObject(data.provenance)) fail('provenance is required');
  const p = data.provenance;
  if (typeof p.sourceCommit !== 'string' || !/^[a-f0-9]{40}$/.test(p.sourceCommit)) fail('sourceCommit must be a lowercase 40-character commit SHA');
  for (const key of ['sourceArtifact', 'outcomeDefinition', 'confidenceDefinition']) text(p[key], key);
  if (!Array.isArray(data.records) || data.records.length > MAX_RECORDS) fail(`records must be an array of at most ${MAX_RECORDS} rows`);
  const seen = new Set();
  data.records.forEach((r, i) => {
    if (!isObject(r)) fail(`record ${i}: expected an object`);
    text(r.id, `record ${i} id`);
    text(r.version, `record ${i} version`);
    binIndex(r.confidence);
    // Binary only: normalized scores need a separate, explicit statistical contract.
    if (r.outcome !== null && r.outcome !== 0 && r.outcome !== 1) fail(`record ${i}: outcome must be 0, 1, or explicit null`);
    if (r.outcome !== null) text(r.outcomeSource, `record ${i} outcomeSource`);
    const key = JSON.stringify([r.version, r.id]);
    if (seen.has(key)) fail(`record ${i}: duplicate version/id`);
    seen.add(key);
  });
  return data;
}

export function summarize(data, version) {
  validateDataset(data);
  text(version, 'selected version');
  const records = data.records.filter((r) => r.version === version);
  const bins = EDGES.slice(0, -1).map((lower, i) => ({ lower, upper: EDGES[i + 1], total: 0, n: 0, missing: 0, sum: 0, successes: 0 }));
  let n = 0;
  let squaredError = 0;
  for (const r of records) {
    const bin = bins[binIndex(r.confidence)];
    bin.total += 1;
    if (r.outcome === null) { bin.missing += 1; continue; }
    n += 1;
    bin.n += 1;
    bin.sum += r.confidence;
    bin.successes += r.outcome;
    squaredError += (r.confidence - r.outcome) ** 2;
  }
  const result = bins.map(({ sum, successes, ...b }) => {
    const meanConfidence = b.n ? sum / b.n : null;
    const empiricalRate = b.n ? successes / b.n : null;
    return { ...b, meanConfidence, empiricalRate, gap: b.n ? Math.abs(empiricalRate - meanConfidence) : null,
      state: b.n === 0 ? 'no labeled outcomes' : b.n < SPARSE_N ? 'sparse' : 'descriptive only' };
  });
  return { version, records, total: records.length, n, missing: records.length - n, bins: result,
    highConfidenceFailures: records.filter((r) => r.confidence >= 0.8 && r.outcome === 0),
    brier: n ? squaredError / n : null,
    ece: n ? result.reduce((s, b) => s + b.n * (b.gap ?? 0), 0) / n : null };
}

/** No scripts, external assets, interpolation across empty bins, or fabricated default observations. */
export function renderReport(data, version, inputSha256) {
  if (!/^[a-f0-9]{64}$/.test(inputSha256)) fail('inputSha256 must be a SHA-256 digest');
  const s = summarize(data, version);
  const p = data.provenance;
  const points = s.bins.filter((b) => b.n).map((b) => {
    const x = 60 + 460 * b.meanConfidence;
    const y = 340 - 280 * b.empiricalRate;
    return `<g><circle cx="${x}" cy="${y}" r="6" class="${b.n < SPARSE_N ? 'sparse' : 'observed'}"><title>${esc(`${pct(b.meanConfidence)} confidence; ${pct(b.empiricalRate)} empirical rate; n=${b.n}; ${b.state}`)}</title></circle><text x="${x}" y="${y - 12}" text-anchor="middle">n=${b.n}</text></g>`;
  }).join('');
  const binRows = s.bins.map((b, i) => `<tr><th scope="row">[${pct(b.lower)}, ${pct(b.upper)}${i === 9 ? ']' : ')'}</th><td>${b.total}</td><td>${b.n}</td><td>${b.missing}</td><td>${pct(b.meanConfidence)}</td><td>${pct(b.empiricalRate)}</td><td>${pct(b.gap)}</td><td>${b.state}</td></tr>`).join('');
  const row = (r) => `<tr${r.outcome === 0 && r.confidence >= 0.8 ? ' class="failure"' : ''}><th scope="row">${esc(r.id)}</th><td>${pct(r.confidence)}</td><td>${r.outcome === null ? 'Unresolved — excluded' : r.outcome === 1 ? 'Observed success' : 'Observed failure'}</td><td>${r.outcome === null ? '—' : esc(r.outcomeSource)}</td></tr>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Recommendation calibration — ${esc(version)}</title><style>
body{font:16px/1.55 system-ui,sans-serif;margin:0;color:#142236;background:#f5f7fa}main{max-width:1100px;margin:auto;padding:24px}h1{font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.2}h2{margin-top:2rem}section,.notice,details{background:white;border:1px solid #ccd5df;border-radius:10px;padding:20px;margin:16px 0}.notice{border-left:6px solid #7c5200}.failure{background:#fff0ef}.failure td,.failure th{border-bottom:1px solid #bc4436}table{border-collapse:collapse;width:100%;min-width:680px;font-size:.9rem}th,td{text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #d7dfe7;overflow-wrap:anywhere}caption{text-align:left;font-weight:700;padding:12px 0}.scroll{overflow-x:auto}svg{display:block;width:100%;max-width:640px;height:auto}svg text{font:12px system-ui;fill:#142236}.observed{fill:#143f68;stroke:#143f68}.sparse{fill:white;stroke:#7c5200;stroke-width:3}.meta{overflow-wrap:anywhere;font-size:.88rem}summary{cursor:pointer;font-weight:700}summary:focus-visible{outline:3px solid #143f68;outline-offset:6px}code{overflow-wrap:anywhere}a{color:#143f68}dt{font-weight:700}dd{margin:0 0 10px} @media(max-width:500px){main{padding:12px}section,.notice,details{padding:12px}th,td{padding:8px}}
</style></head><body><main><header><p>OFFLINE DIAGNOSTIC · NOT A RELEASE OR RESEARCH GATE</p><h1>Recommendation calibration</h1><p>Selected version: <strong>${esc(version)}</strong>. Other versions are excluded.</p></header>
${data.evidenceKind === 'synthetic-test' ? '<p class="notice"><strong>SYNTHETIC TEST FIXTURE — NOT RESEARCH OR PRODUCTION EVIDENCE.</strong></p>' : '<p class="notice">Input is declared observed by its exporter. Provenance is displayed, not independently authenticated by this renderer.</p>'}
<p>${s.total} selected records · <strong>${s.n} labeled outcomes</strong> · ${s.missing} unresolved outcomes excluded from all outcome metrics.</p>
${s.n === 0 ? '<p class="notice"><strong>No labeled outcomes for this version.</strong> Calibration metrics are unavailable, not zero. No curve is inferred.</p>' : ''}
<p class="notice">Bins with fewer than ${SPARSE_N} labeled outcomes are marked sparse. This is a display warning, not a power calculation. All bins remain descriptive; no causal effect, significance, deployment readiness, or performance guarantee is established.</p>
<section aria-labelledby="failures"><h2 id="failures">High-confidence observed failures: ${s.highConfidenceFailures.length}</h2><p>Display threshold: confidence ≥ 80% and observed outcome = 0. This threshold does not change the aggregate denominator.</p>
${s.highConfidenceFailures.length ? `<div class="scroll" role="region" aria-label="High-confidence failure records" tabindex="0"><table><caption>Failure cases (already observed)</caption><thead><tr><th scope="col">Recommendation ID</th><th scope="col">Confidence</th><th scope="col">Observed outcome</th><th scope="col">Outcome source</th></tr></thead><tbody>${s.highConfidenceFailures.map(row).join('')}</tbody></table></div>` : '<p>No labeled failure at this threshold in the selected records. This is not proof of reliability.</p>'}</section>
<section aria-labelledby="calibration"><h2 id="calibration">Confidence versus empirical outcome rate</h2><p>Each point is one nonempty labeled bin; its label is the labeled sample count. Hollow points are sparse. The dashed diagonal is ideal calibration, not a fitted result. Empty bins are not connected.</p>
<svg viewBox="0 0 620 410" role="img" aria-labelledby="plot-title plot-desc"><title id="plot-title">Calibration for ${esc(version)}</title><desc id="plot-desc">Labeled bin mean confidence against empirical outcome rate. All ten bins, counts and missing outcomes are in the accessible table below.</desc><path d="M60 60V340H520" fill="none" stroke="#65758a"/><path d="M60 340L520 60" stroke="#65758a" stroke-dasharray="6 5" fill="none"/><text x="60" y="360">0%</text><text x="500" y="360">100%</text><text x="22" y="343">0%</text><text x="15" y="65">100%</text><text x="270" y="392" text-anchor="middle">Mean confidence (labeled records only)</text><text x="60" y="30">Empirical outcome rate</text>${points}</svg>
<div class="scroll" role="region" aria-label="All calibration bins" tabindex="0"><table><caption>All confidence bins; n is the labeled denominator</caption><thead><tr><th scope="col">Bin</th><th scope="col">Total</th><th scope="col">n</th><th scope="col">Unresolved</th><th scope="col">Mean confidence</th><th scope="col">Empirical rate</th><th scope="col">Absolute gap</th><th scope="col">Evidence status</th></tr></thead><tbody>${binRows}</tbody></table></div></section>
<section><h2>Secondary descriptive summaries</h2><p>Brier score: <strong>${dec(s.brier)}</strong> · 10-bin ECE: <strong>${dec(s.ece)}</strong>.</p><p>Brier is the mean squared probability error over labeled records. ECE weights each bin's absolute calibration gap by its labeled n. Missing outcomes can introduce selection bias; neither score corrects for it. Repeated/correlated recommendations are not independent replication.</p></section>
<details><summary>Inspect all ${s.total} selected recommendation records</summary><div class="scroll" role="region" aria-label="Selected recommendation records" tabindex="0"><table><caption>Selected version only</caption><thead><tr><th scope="col">Recommendation ID</th><th scope="col">Confidence</th><th scope="col">Observed outcome</th><th scope="col">Outcome source</th></tr></thead><tbody>${s.records.map(row).join('')}</tbody></table></div></details>
<section class="meta"><h2>Input provenance</h2><dl><dt>Input bytes SHA-256</dt><dd><code>${inputSha256}</code></dd><dt>Source commit (exporter declared)</dt><dd><code>${esc(p.sourceCommit)}</code></dd><dt>Source artifact</dt><dd>${esc(p.sourceArtifact)}</dd><dt>Confidence definition</dt><dd>${esc(p.confidenceDefinition)}</dd><dt>Binary outcome definition</dt><dd>${esc(p.outcomeDefinition)}</dd><dt>Evidence kind</dt><dd>${esc(data.evidenceKind)}</dd></dl><p>This file can contain sensitive identifiers. Keep it private; do not upload student records, restricted data, or credentials to public CI artifacts. The renderer makes no network requests and modifies no source observations.</p></section></main></body></html>`;
}

export async function main(args = process.argv.slice(2)) {
  if (args.length !== 4 || args[2] !== '--version') fail('Usage: node scripts/render-recommendation-calibration.mjs INPUT.json OUTPUT.html --version VERSION');
  const [input, output, , version] = args;
  if (resolve(input) === resolve(output)) fail('Input and output must be different files');
  const handle = await open(input, 'r');
  let bytes;
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > MAX_BYTES) fail('Input must be a regular file of at most 5 MiB');
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let used = 0;
    while (used < buffer.length) {
      const part = await handle.read(buffer, used, buffer.length - used, null);
      if (!part.bytesRead) break;
      used += part.bytesRead;
    }
    if (used > MAX_BYTES) fail('Input exceeds 5 MiB');
    bytes = buffer.subarray(0, used);
  } finally { await handle.close(); }
  let data;
  try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { fail('Input must be valid UTF-8 JSON'); }
  const digest = createHash('sha256').update(bytes).digest('hex');
  const html = renderReport(data, version, digest);
  // Exclusive creation avoids overwriting an earlier evidence artifact or following an output symlink.
  await writeFile(output, html, { flag: 'wx', mode: 0o600 });
  return { inputSha256: digest, version, selectedRecords: summarize(data, version).total };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((result) => console.log(JSON.stringify(result))).catch((error) => {
    console.error(`Calibration report not written: ${error.code ?? error.message}`);
    process.exitCode = 1;
  });
}
