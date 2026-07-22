#!/usr/bin/env node
/**
 * `/api/ask` (Apex) eval entry point. Runs the generic runner with the
 * ask-specific golden set and baseline fixture.
 *
 * By default uses the fixture (offline / regression mode). Pass --live to
 * call the actual handler with mocked OpenAI client.
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEval } from './run-eval.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');

const goldenPath = resolve(root, 'evals/ask/golden.jsonl');
const fixturePath = resolve(root, 'evals/ask/fixtures/baseline.json');

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const isLive = args.has('--live');

if (isDryRun) {
  const { readFileSync } = await import('node:fs');
  const lines = readFileSync(goldenPath, 'utf-8').split(/\r?\n/).filter((l) => l.trim());
  console.log(`golden: ${goldenPath}`);
  console.log(`prompts: ${lines.length}`);
  for (const l of lines) {
    const obj = JSON.parse(l);
    console.log(`  ${obj.id.padEnd(20)} ${(obj.category || '').padEnd(14)} ${(obj.title || '').slice(0, 50)}`);
  }
  process.exit(0);
}

const { readFileSync } = await import('node:fs');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

let handler = null;
if (isLive) {
  // Lazy import so fixture-mode doesn't load OpenAI client.
  const mod = await import('../../api/_handlers/ask.js');
  handler = async (req) => {
    const fakeRes = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; },
      setHeader() { return this; },
      end(data) { if (data) this.body = { answer: String(data) }; return this; },
    };
    const fakeReq = { method: 'POST', body: req, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
    await mod.default(fakeReq, fakeRes);
    return fakeRes.body || { answer: '' };
  };
}

const report = await runEval({
  goldenPath,
  fixture: isLive ? null : fixture,
  handler,
  label: 'ask',
  failThresholdPct: 15,
});

// Pretty print
console.log(`\n=== ASK EVAL (${isLive ? 'live' : 'fixture'}) ===`);
console.log(`prompts: ${report.summary.totalPrompts}  passed: ${report.summary.passed}  failed: ${report.summary.failed}  avgScore: ${report.summary.avgScore}`);
console.log(`fail%:   ${report.summary.failPct}%  threshold: ${report.summary.failThresholdPct}%  ${report.summary.overallPass ? 'PASS' : 'FAIL'}`);
for (const [cat, c] of Object.entries(report.summary.byCategory)) {
  console.log(`  ${cat.padEnd(20)} ${String(c.passed).padStart(2)}/${c.total}  avg=${c.avgScore.toFixed(2)}`);
}
console.log('');
process.exit(report.summary.overallPass ? 0 : 1);