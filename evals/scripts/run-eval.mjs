#!/usr/bin/env node
/**
 * Generic AI eval runner. Loads a golden JSONL, calls a handler per prompt,
 * scores each response via evals/scripts/score.mjs, and prints a summary.
 *
 * Usage:
 *   node evals/scripts/run-eval.mjs \
 *     --golden evals/ask/golden.jsonl \
 *     --fixture evals/ask/fixtures/baseline.json \
 *     --label ask
 *
 * Or import and call programmatically:
 *   import { runEval } from './run-eval.mjs';
 *   const report = await runEval({ goldenPath, fixture, handler, label });
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreResponse } from './score.mjs';

const here = resolve(fileURLToPath(import.meta.url), '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (k.startsWith('--')) {
      const key = k.slice(2);
      const val = argv[i + 1];
      args[key] = val;
      i += 1;
    }
  }
  return args;
}

function loadJsonl(path) {
  const raw = readFileSync(path, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((l, idx) => {
    try {
      return JSON.parse(l);
    } catch (err) {
      throw new Error(`Invalid JSONL at ${path}:${idx + 1}: ${err.message}`);
    }
  });
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function groupBy(items, keyFn) {
  const out = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(it);
  }
  return out;
}

/**
 * @param {object} opts
 * @param {string} opts.goldenPath           path to JSONL of prompts
 * @param {object} [opts.fixture]            parsed baseline fixture
 * @param {(req:object)=>Promise<{answer:string}>} opts.handler  async handler
 * @param {string} [opts.label]              label for output
 * @param {number} [opts.failThresholdPct=10] percent of failures that causes non-zero exit
 */
export async function runEval({ goldenPath, fixture, handler, label = 'eval', failThresholdPct = 10 }) {
  const golden = loadJsonl(goldenPath);
  const results = [];

  for (const prompt of golden) {
    let response;
    let mode;
    try {
      if (fixture && !handler) {
        const canned = fixture[prompt.id];
        if (!canned) {
          throw new Error(`Fixture missing response for prompt ${prompt.id}`);
        }
        response = canned;
        mode = 'fixture';
      } else if (!handler) {
        throw new Error('runEval requires either a fixture or a handler');
      } else {
        response = await handler(prompt.request);
        mode = 'live';
      }
    } catch (err) {
      results.push({
        id: prompt.id,
        category: prompt.category,
        title: prompt.title,
        mode,
        error: err.message || String(err),
        score: 1,
        breakdown: {},
        passed: false,
      });
      continue;
    }

    const text = typeof response === 'string' ? response : response?.answer ?? '';
    const { score, breakdown } = scoreResponse(text, prompt.rubric);
    const passed = score >= 3;

    results.push({
      id: prompt.id,
      category: prompt.category,
      title: prompt.title,
      mode,
      score,
      passed,
      breakdown,
    });
  }

  const totalPrompts = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = totalPrompts - passedCount;
  const avgScore = mean(results.map((r) => r.score));
  const byCategory = {};
  for (const [cat, items] of groupBy(results, (r) => r.category || 'uncategorized')) {
    byCategory[cat] = {
      total: items.length,
      passed: items.filter((i) => i.passed).length,
      avgScore: mean(items.map((i) => i.score)),
    };
  }

  const failPct = totalPrompts === 0 ? 0 : (failedCount / totalPrompts) * 100;
  const overallPass = failPct <= failThresholdPct;

  return {
    label,
    goldenPath,
    summary: {
      totalPrompts,
      passed: passedCount,
      failed: failedCount,
      avgScore: Number(avgScore.toFixed(2)),
      failPct: Number(failPct.toFixed(1)),
      byCategory,
      overallPass,
      failThresholdPct,
    },
    results,
  };
}

function color(code, text) {
  if (!process.stdout.isTTY) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

function printReport(report) {
  const { label, summary, results } = report;
  const head = color('1m', `\n=== ${label.toUpperCase()} EVAL REPORT ===`);
  console.log(head);
  console.log(`prompts: ${summary.totalPrompts}  passed: ${summary.passed}  failed: ${summary.failed}  avgScore: ${summary.avgScore}`);
  console.log(`fail%:   ${summary.failPct}%  threshold: ${summary.failThresholdPct}%  ${summary.overallPass ? color('32', 'PASS') : color('31', 'FAIL')}`);

  console.log(color('1m', '\n-- by category --'));
  for (const [cat, c] of Object.entries(summary.byCategory)) {
    const line = `${cat.padEnd(20)} ${String(c.passed).padStart(2)}/${c.total}  avg=${c.avgScore.toFixed(2)}`;
    console.log(line);
  }

  console.log(color('1m', '\n-- per prompt --'));
  for (const r of results) {
    const tag = r.passed ? color('32', 'PASS') : color('31', 'FAIL');
    const mode = r.mode === 'fixture' ? color('2m', '[fix]') : color('36', '[live]');
    const score = `${r.score}/5`.padEnd(4);
    const id = r.id.padEnd(20);
    const title = (r.title || '').slice(0, 40);
    console.log(`${tag} ${mode} ${id} ${score} ${title}`);
    if (r.error) {
      console.log(color('31', `        error: ${r.error}`));
    } else if (!r.passed && Array.isArray(r.breakdown?.adjustments) && r.breakdown.adjustments.length > 0) {
      for (const a of r.breakdown.adjustments) {
        console.log(color('33', `        - ${a}`));
      }
    }
  }
  console.log('');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const goldenPath = args.golden ? resolve(here, '..', args.golden) : null;
  const fixturePath = args.fixture ? resolve(here, '..', args.fixture) : null;
  const label = args.label || 'eval';

  if (!goldenPath) {
    console.error('Usage: node evals/scripts/run-eval.mjs --golden <path> [--fixture <path>] [--label <name>]');
    process.exit(2);
  }

  let fixture = null;
  if (fixturePath) {
    try {
      fixture = loadJson(fixturePath);
    } catch (err) {
      console.error(`Could not load fixture at ${fixturePath}: ${err.message}`);
      process.exit(2);
    }
  }

  const report = await runEval({ goldenPath, fixture, handler: null, label });
  printReport(report);
  process.exit(report.summary.overallPass ? 0 : 1);
}

const isMain = (() => {
  try {
    return resolve(process.argv[1] || '') === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}