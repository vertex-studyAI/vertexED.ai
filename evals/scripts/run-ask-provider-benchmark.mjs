#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import {
  callChatProvider,
  extractChatAnswer,
  resolveChatProvider,
} from '../../api/_lib/aiProviders.js';
import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from '../../api/_lib/grounding.js';
import { scoreResponse } from './score.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const goldenPath = resolve(root, 'evals/ask/golden.jsonl');

function parseArgs(argv) {
  const out = { provider: 'both', out: '', limit: 0 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--provider') out.provider = argv[++i] || 'both';
    else if (arg === '--out') out.out = argv[++i] || '';
    else if (arg === '--limit') out.limit = Number.parseInt(argv[++i] || '0', 10) || 0;
  }
  return out;
}

function percentile(values, pct) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
  return sorted[index];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildMessages(request) {
  const { question, history, context, sources } = request ?? {};
  const trimmedQuestion = typeof question === 'string' ? question.trim() : '';
  const messages = [];

  if (context && typeof context === 'object') {
    const label = typeof context.label === 'string' ? context.label.trim().slice(0, 120) : 'VertexED';
    const hint = typeof context.hint === 'string' ? context.hint.trim().slice(0, 2000) : '';
    messages.push({
      role: 'system',
      content: `You are Apex, VertexED's discussion-first study tutor. The student is on: ${label}. ${hint}\n\nRules:\n- Deliberate step-by-step; ask what they've tried before giving full solutions.\n- Prefer Socratic follow-ups over dumping answers.\n- Use clear structure for math (steps, not just final values).\n- When relevant, reference exam technique, command terms, and mark-scheme thinking.\n- Keep responses focused; if a topic is large, offer a sensible first step and invite follow-up.`,
    });
  }

  const sourceBlock = formatSourcesForPrompt(sources);
  if (sourceBlock && messages.length > 0) {
    messages[0].content += `\n\n${GROUNDED_CHAT_RULES}\n\n${sourceBlock}`;
  } else if (sourceBlock) {
    messages.push({ role: 'system', content: `${GROUNDED_CHAT_RULES}\n\n${sourceBlock}` });
  }

  if (Array.isArray(history)) {
    const recentHistory = history.slice(-10);
    for (const [index, entry] of recentHistory.entries()) {
      const role = entry?.role === 'assistant' ? 'assistant' : 'user';
      const text = typeof entry?.text === 'string' ? entry.text.trim() : '';
      const duplicatesCurrentQuestion =
        index === recentHistory.length - 1 && role === 'user' && text === trimmedQuestion;
      if (text && !duplicatesCurrentQuestion) messages.push({ role, content: text.slice(0, 2000) });
    }
  }

  messages.push({ role: 'user', content: trimmedQuestion });
  return messages;
}

function loadGolden(limit) {
  const prompts = readFileSync(goldenPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  return limit > 0 ? prompts.slice(0, limit) : prompts;
}

function usageFrom(data) {
  const usage = data?.usage ?? {};
  return {
    inputTokens: usage.prompt_tokens ?? usage.input_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? usage.output_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}

async function runProvider(providerName, prompts) {
  const config = resolveChatProvider({ ...process.env, CHATBOT_PROVIDER: providerName });
  const rows = [];

  for (const prompt of prompts) {
    const started = performance.now();
    let status = 0;
    let error = null;
    let answer = '';
    let model = config.primaryModel;
    let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    try {
      const call = await callChatProvider({
        config,
        model,
        messages: buildMessages(prompt.request),
        temperature: 0.4,
        maxTokens: 1200,
      });
      status = call.response.status;
      const data = JSON.parse(call.raw);
      usage = usageFrom(data);
      answer = extractChatAnswer(data) || '';
      if (!call.response.ok) error = `HTTP ${call.response.status}`;
      else if (!answer) error = 'empty_answer';
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const latencyMs = performance.now() - started;
    const { score, breakdown } = scoreResponse(answer, prompt.rubric);
    rows.push({
      id: prompt.id,
      category: prompt.category,
      title: prompt.title,
      provider: providerName,
      model,
      status,
      error,
      passed: !error && score >= 3,
      score,
      breakdown,
      latencyMs: Number(latencyMs.toFixed(1)),
      outputChars: answer.length,
      usage,
    });

    const marker = rows.at(-1).passed ? 'PASS' : 'FAIL';
    console.log(`${providerName.padEnd(7)} ${marker} ${prompt.id.padEnd(20)} score=${score}/5 latency=${latencyMs.toFixed(0)}ms${error ? ` error=${error}` : ''}`);
  }

  const latencies = rows.map((row) => row.latencyMs);
  const outputs = rows.map((row) => row.outputChars);
  const failures = rows.filter((row) => !row.passed);
  const errors = rows.filter((row) => row.error);
  const tokenTotals = rows.reduce(
    (acc, row) => ({
      inputTokens: acc.inputTokens + row.usage.inputTokens,
      outputTokens: acc.outputTokens + row.usage.outputTokens,
      totalTokens: acc.totalTokens + row.usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  return {
    provider: providerName,
    model: config.primaryModel,
    summary: {
      prompts: rows.length,
      passed: rows.length - failures.length,
      failed: failures.length,
      passRatePct: rows.length ? Number((((rows.length - failures.length) / rows.length) * 100).toFixed(1)) : 0,
      avgScore: Number(average(rows.map((row) => row.score)).toFixed(2)),
      errorRatePct: rows.length ? Number(((errors.length / rows.length) * 100).toFixed(1)) : 0,
      latencyP50Ms: Number(percentile(latencies, 50).toFixed(1)),
      latencyP95Ms: Number(percentile(latencies, 95).toFixed(1)),
      avgOutputChars: Number(average(outputs).toFixed(1)),
      usage: tokenTotals,
    },
    results: rows,
  };
}

const args = parseArgs(process.argv.slice(2));
const allowed = new Set(['openai', 'nvidia', 'both']);
if (!allowed.has(args.provider)) {
  console.error('Usage: run-ask-provider-benchmark.mjs --provider openai|nvidia|both [--limit N] [--out report.json]');
  process.exit(2);
}

const prompts = loadGolden(args.limit);
const providers = args.provider === 'both' ? ['openai', 'nvidia'] : [args.provider];
const runs = [];

for (const provider of providers) {
  console.log(`\n=== ${provider.toUpperCase()} / ${prompts.length} prompts ===`);
  runs.push(await runProvider(provider, prompts));
}

const report = {
  generatedAt: new Date().toISOString(),
  goldenPath: 'evals/ask/golden.jsonl',
  promptCount: prompts.length,
  runs,
};

console.log('\n=== SUMMARY ===');
for (const run of runs) {
  const s = run.summary;
  console.log(`${run.provider.padEnd(7)} pass=${s.passRatePct}% avg=${s.avgScore}/5 errors=${s.errorRatePct}% p50=${s.latencyP50Ms}ms p95=${s.latencyP95Ms}ms tokens=${s.usage.totalTokens}`);
}

if (args.out) {
  const outputPath = resolve(process.cwd(), args.out);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`report: ${outputPath}`);
}
