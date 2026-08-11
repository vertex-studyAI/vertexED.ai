import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderPortfolioHtml, renderPortfolioJson, summarizePortfolio } from '../src/core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const recordsPath = resolve(process.argv[2] ?? `${here}/demo-records.json`);
const outputDirectory = resolve(process.argv[3] ?? `${here}/../results`);
const records = JSON.parse(await readFile(recordsPath, 'utf8'));
const html = renderPortfolioHtml(records, { title: 'Project 2424 — Verified Package Snapshot' });
const json = renderPortfolioJson(records);

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, 'project24.html'), html, 'utf8');
await writeFile(resolve(outputDirectory, 'project24.json'), json, 'utf8');

console.log(JSON.stringify({
  project: 'AUX-P2424-PROJECT24-RENDER',
  name: 'Project24 Render',
  first100RegistryEntry: false,
  input: recordsPath,
  outputDirectory,
  summary: summarizePortfolio(records),
  claimBoundary: 'static rendering of supplied evidence records only; completion and validity are never inferred',
}, null, 2));
