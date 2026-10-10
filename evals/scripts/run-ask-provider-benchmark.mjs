#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import {
  callChatProvider,
  extractChatAnswer,
  resolveChatProvider,
} from '../../api/_lib/aiProviders.js';
import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from '../../api/_lib/grounding.js';
import { scoreResponse } from './score.mjs';
import {
  createRequestEvidence,
  createResponseEvidence,
  sha256Json,
} from '../research/provider-evidence.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const defaultPromptPath = 'evals/ask/golden.jsonl';

function parseArgs(argv) {
  const out = {
    provider: 'both',
    out: '',
    limit: 0,
    sourceRevision: '',
    prompts: defaultPromptPath,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--provider') out.provider = argv[++i] || 'both';
    else if (arg === '--out') out.out = argv[++i] || '';
    else if (arg === '--limit') out.limit = Number.parseInt(argv[++i] || '0', 10) || 0;
    else if (arg === '--source-revision') out.sourceRevision = argv[++i] || '';
    else if (arg === '--prompts') out.prompts = argv[++i] || defaultPromptPath;
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
      content: `You are Apex, VertexED's discussion-first study tutor. The student is on: ${label}. ${hint}

Rules:
- Deliberate step-by-step; ask what they've tried before giving full solutions.
- Prefer Socratic follow-ups over dumping answers.
- Use clear structure for math (steps, not just final values).
- When relevant, reference exam technique, command terms, and mark-scheme thinking.
- Keep responses focused; if a topic is large, offer a sensible first step and invite follow-up.`,
    });
  }

  const sourceBlock = formatSourcesForPrompt(sources);
  if (sourceBlock && messages.length > 0) {
    messages[0].content += `

${GROUNDED_CHAT_RULES}

${sourceBlock}`;
  } else if (sourceBlock) {
    messages.push({ role: 'system', content: `${GROUNDED_CHAT_RULES}

${sourceBlock}` });
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

function resolvePromptPath(promptArg) {
  const candidate = resolve(root, promptArg);
  const rel = relative(root, candidate);
  if (rel.startsWith(`..${sep}`) || rel === '..') {
    throw new Error('Prompt set must be inside the repository root');
  }
  return { absolute: candidate, relative: rel.split(sep).join('/') };
}

function loadPromptSet(promptArg, limit) {
  const promptPath = resolvePromptPath(promptArg);
  const prompts = readFileSync(promptPath.absolute, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  return {
    path: promptPath.relative,
    prompts: limit > 0 ? prompts.slice(0, limit) : prompts,
  };
}

function usageFrom(data) {
  const usage = data?.usage ?? {};
  return {
    inputTokens: usage.prompt_tokens ?? usage.input_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? usage.output_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}

function finiteNumber(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function providerPricing(providerName) {
  const prefix = providerName.toUpperCase();
  const inputPerMillion = finiteNumber(process.env[`${prefix}_INPUT_COST_PER_1M`]);
  const outputPerMillion = finiteNumber(process.env[`${prefix}_OUTPUT_COST_PER_1M`]);
  if (inputPerMillion === null || outputPerMillion === null) return null;
  return { inputPerMillion, outputPerMillion };
}

function estimateCostUsd(usage, pricing) {
  if (!pricing || !usage) return null;
  const estimate =
    ((usage.inputTokens || 0) / 1_000_000) * pricing.inputPerMillion +
    ((usage.outputTokens || 0) / 1_000_000) * pricing.outputPerMillion;
  return Number(estimate.toFixed(8));
}

function hasAnyTag(row, tags) {
  return Array.isArray(row.tags) && row.tags.some((tag) => tags.has(tag));
}

async function runProvider(providerName, prompts) {
  const config = resolveChatProvider({ ...process.env, CHATBOT_PROVIDER: providerName });
  const rows = [];
  const pricing = providerPricing(providerName);
  const endpoint = `${config.baseUrl}/${providerName === 'openai' ? 'responses' : 'chat/completions'}`;

  for (const prompt of prompts) {
    const started = performance.now();
    let status = 0;
    let error = null;
    let answer = '';
    const model = config.primaryModel;
    let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    const messages = buildMessages(prompt.request);
    const requestEvidence = createRequestEvidence({
      provider: providerName,
      model,
      temperature: 0.4,
      maxTokens: 1200,
      messages,
    });
    try {
      const call = await callChatProvider({
        config,
        model,
        messages,
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
    const groundingRequired = Boolean(prompt.rubric?.mustCiteSources);
    const tags = Array.isArray(prompt.tags) ? prompt.tags : [];
    rows.push({
      id: prompt.id,
      category: prompt.category,
      subcategory: prompt.subcategory,
      title: prompt.title,
      tags,
      provider: providerName,
      model,
      status,
      error,
      passed: !error && score >= 3,
      score,
      breakdown,
      groundingRequired,
      groundedSourceCompliant: groundingRequired ? breakdown.cited === true : null,
      latencyMs: Number(latencyMs.toFixed(1)),
      outputChars: answer.length,
      usage,
      estimatedCostUsd: estimateCostUsd(usage, pricing),
      ...requestEvidence,
      ...createResponseEvidence(answer, { retainText: true }),
    });

    const marker = rows.at(-1).passed ? 'PASS' : 'FAIL';
    console.log(`${providerName.padEnd(7)} ${marker} ${prompt.id.padEnd(28)} score=${score}/5 latency=${latencyMs.toFixed(0)}ms${error ? ` error=${error}` : ''}`);
  }

  const latencies = rows.map((row) => row.latencyMs);
  const outputs = rows.map((row) => row.outputChars);
  const failures = rows.filter((row) => !row.passed);
  const errors = rows.filter((row) => row.error);
  const grounded = rows.filter((row) => row.groundingRequired);
  const safetyTags = new Set(['safety', 'adversarial', 'hallucination']);
  const safetyRows = rows.filter((row) => hasAnyTag(row, safetyTags));
  const tokenTotals = rows.reduce(
    (acc, row) => ({
      inputTokens: acc.inputTokens + row.usage.inputTokens,
      outputTokens: acc.outputTokens + row.usage.outputTokens,
      totalTokens: acc.totalTokens + row.usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );
  const pricedRows = rows.filter((row) => row.estimatedCostUsd !== null);
  const estimatedTotalCostUsd = pricedRows.length === rows.length && rows.length > 0
    ? Number(rows.reduce((sum, row) => sum + row.estimatedCostUsd, 0).toFixed(8))
    : null;

  return {
    provider: providerName,
    model: config.primaryModel,
    endpoint,
    pricing,
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
      groundedSourcePrompts: grounded.length,
      groundedSourceCompliant: grounded.filter((row) => row.groundedSourceCompliant).length,
      groundedSourceCompliancePct: grounded.length
        ? Number(((grounded.filter((row) => row.groundedSourceCompliant).length / grounded.length) * 100).toFixed(1))
        : null,
      safetyAdversarialPrompts: safetyRows.length,
      safetyAdversarialPassed: safetyRows.filter((row) => row.passed).length,
      safetyAdversarialPassRatePct: safetyRows.length
        ? Number(((safetyRows.filter((row) => row.passed).length / safetyRows.length) * 100).toFixed(1))
        : null,
      usage: tokenTotals,
      estimatedTotalCostUsd,
    },
    results: rows,
  };
}

const args = parseArgs(process.argv.slice(2));
const allowed = new Set(['openai', 'nvidia', 'both']);
if (!allowed.has(args.provider)) {
  console.error('Usage: run-ask-provider-benchmark.mjs --provider openai|nvidia|both [--prompts evals/ask/golden.jsonl] [--limit N] [--out report.json] [--source-revision SHA]');
  process.exit(2);
}
if (args.out && !args.sourceRevision) {
  console.error('Retained provider reports require --source-revision <commit-or-release-id>.');
  process.exit(2);
}

const promptSet = loadPromptSet(args.prompts, args.limit);
const providers = args.provider === 'both' ? ['openai', 'nvidia'] : [args.provider];
const runs = [];

for (const provider of providers) {
  console.log(`\n=== ${provider.toUpperCase()} / ${promptSet.prompts.length} prompts / ${promptSet.path} ===`);
  runs.push(await runProvider(provider, promptSet.prompts));
}

const report = {
  schema: 'vertexed.provider_benchmark.v3',
  generatedAt: new Date().toISOString(),
  sourceRevision: args.sourceRevision || 'UNBOUND_LOCAL_SOURCE',
  sourceBound: Boolean(args.sourceRevision),
  promptPath: promptSet.path,
  promptSetSha256: sha256Json(promptSet.prompts),
  requestConfig: { temperature: 0.4, maxTokens: 1200 },
  promptCount: promptSet.prompts.length,
  runs,
};

console.log('\n=== SUMMARY ===');
for (const run of runs) {
  const s = run.summary;
  const grounding = s.groundedSourceCompliancePct === null ? 'n/a' : `${s.groundedSourceCompliancePct}%`;
  const safety = s.safetyAdversarialPassRatePct === null ? 'n/a' : `${s.safetyAdversarialPassRatePct}%`;
  const cost = s.estimatedTotalCostUsd === null ? 'n/a' : `$${s.estimatedTotalCostUsd}`;
  console.log(`${run.provider.padEnd(7)} pass=${s.passRatePct}% avg=${s.avgScore}/5 errors=${s.errorRatePct}% p50=${s.latencyP50Ms}ms p95=${s.latencyP95Ms}ms grounding=${grounding} safety=${safety} cost=${cost} tokens=${s.usage.totalTokens}`);
}

if (args.out) {
  const outputPath = resolve(process.cwd(), args.out);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`report: ${outputPath}`);
}
