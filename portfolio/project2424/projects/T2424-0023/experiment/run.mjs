import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildBenchmarkReport, compareLanguages } from '../src/core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const recordsPath = resolve(process.argv[2] ?? `${here}/sample-records.json`);
const records = JSON.parse(await readFile(recordsPath, 'utf8'));
const report = buildBenchmarkReport(records, { blindSpotConfidence: 0.8 });
const englishSpanish = compareLanguages(records, 'en', 'es', { blindSpotConfidence: 0.8 });

console.log(JSON.stringify({
  project: 'T2424-0023',
  benchmark: 'bounded multilingual blind-spot mechanics screen',
  threshold: 0.8,
  input: basename(recordsPath),
  report,
  englishSpanish,
  verdict: report.crossLanguageBlindSpotCount > 0 ? 'DETECTS_INJECTED_CROSS_LANGUAGE_BLIND_SPOT' : 'NO_INJECTED_BLIND_SPOT_DETECTED',
}, null, 2));
