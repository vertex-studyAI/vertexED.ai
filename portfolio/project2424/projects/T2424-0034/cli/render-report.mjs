#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { buildQuantReport, renderQuantReportHtml } from '../src/quantVisualizer.mjs';

function usage() {
  console.error('Usage: node cli/render-report.mjs <input.json> <output.html>');
  console.error('Input JSON: { "prices": [100, 101, ...], "dates"?: [...], "periodsPerYear"?: 252, "rollingWindow"?: 20, "title"?: "..." }');
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    usage();
    process.exitCode = 2;
    return;
  }

  const source = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
  const report = buildQuantReport({
    prices: source.prices,
    dates: source.dates ?? null,
    periodsPerYear: source.periodsPerYear ?? 252,
    rollingWindow: source.rollingWindow ?? 20,
  });
  const html = renderQuantReportHtml(report, { title: source.title ?? 'Quant ML Visualizer' });
  await writeFile(resolve(outputPath), html, 'utf8');
  console.log(JSON.stringify(report.summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
