#!/usr/bin/env node
/**
 * `/api/ask` (Apex) eval entry point. Runs the generic runner with the
 * ask-specific golden set and baseline fixture.
 *
 * By default uses the fixture (offline / regression mode). Pass --live to
 * call the configured provider directly with the same prompt builder as the API.
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
  const { buildAskMessages } = await import('../../api/_lib/askPrompt.js');
  const { callChatProvider, extractChatAnswer, resolveChatProvider } = await import('../../api/_lib/aiProviders.js');
  let providerConfig;
  try {
    providerConfig = resolveChatProvider(process.env);
  } catch (error) {
    console.error(`Live eval configuration error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }

  handler = async (req) => {
    const messages = buildAskMessages(req);
    const run = (model) => callChatProvider({
      config: providerConfig,
      model,
      messages,
      temperature: 0.4,
      maxTokens: 1200,
    });

    let result = await run(providerConfig.primaryModel);
    if (!result.response.ok && providerConfig.fallbackModel && result.response.status !== 401) {
      result = await run(providerConfig.fallbackModel);
    }
    if (!result.response.ok) {
      throw new Error(`${result.provider}/${result.model} returned HTTP ${result.response.status}`);
    }
    const parsed = JSON.parse(result.raw);
    let answer = extractChatAnswer(parsed);
    if (!answer && providerConfig.fallbackModel && result.model !== providerConfig.fallbackModel) {
      result = await run(providerConfig.fallbackModel);
      if (!result.response.ok) throw new Error(`${result.provider}/${result.model} returned HTTP ${result.response.status}`);
      answer = extractChatAnswer(JSON.parse(result.raw));
    }
    if (!answer) throw new Error(`${result.provider}/${result.model} returned an empty answer`);
    return { answer };
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
