#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function readJson(path) {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8'));
}

function runFor(report, provider) {
  return report?.runs?.find((run) => run.provider === provider) || null;
}

function fmt(value, suffix = '') {
  return value === null || value === undefined ? 'n/a' : `${value}${suffix}`;
}

function money(value) {
  return value === null || value === undefined ? 'n/a' : `$${Number(value).toFixed(6)}`;
}

function pairRegressions(report) {
  const openai = runFor(report, 'openai');
  const nvidia = runFor(report, 'nvidia');
  if (!openai || !nvidia) return [];
  const base = new Map(openai.results.map((row) => [row.id, row]));
  return nvidia.results
    .filter((row) => {
      const other = base.get(row.id);
      return other?.passed && !row.passed;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      nvidiaScore: row.score,
      error: row.error,
    }));
}

function tableRows(label, report) {
  return ['openai', 'nvidia'].map((provider) => {
    const run = runFor(report, provider);
    if (!run) return `| ${label} | ${provider} | n/a | n/a | n/a | n/a | n/a | n/a | n/a |`;
    const s = run.summary;
    return `| ${label} | ${provider} | ${run.model} | ${fmt(s.passRatePct, '%')} | ${fmt(s.avgScore, '/5')} | ${fmt(s.errorRatePct, '%')} | ${fmt(s.latencyP50Ms, ' ms')} | ${fmt(s.latencyP95Ms, ' ms')} | ${money(s.estimatedTotalCostUsd)} |`;
  });
}

function detailedRows(label, report) {
  return ['openai', 'nvidia'].map((provider) => {
    const run = runFor(report, provider);
    if (!run) return `| ${label} | ${provider} | n/a | n/a | n/a |`;
    const s = run.summary;
    return `| ${label} | ${provider} | ${fmt(s.groundedSourceCompliancePct, '%')} | ${fmt(s.safetyAdversarialPassRatePct, '%')} | ${fmt(s.avgOutputChars)} |`;
  });
}

const [goldenArg, pocArg, outputArg = 'docs/NVIDIA_POC_REPORT.md'] = process.argv.slice(2);
if (!goldenArg || !pocArg) {
  console.error('Usage: generate-nvidia-poc-report.mjs GOLDEN.json POC.json [OUTPUT.md]');
  process.exit(2);
}

const golden = readJson(goldenArg);
const poc = readJson(pocArg);
for (const [label, report] of [['golden', golden], ['poc', poc]]) {
  if (!['vertexed.provider_benchmark.v2', 'vertexed.provider_benchmark.v3'].includes(report.schema)) {
    throw new Error(`${label} report is not a recognized provider benchmark artifact`);
  }
  if (!report.sourceBound) throw new Error(`${label} report is not source-bound`);
}

if (golden.sourceRevision !== poc.sourceRevision) {
  throw new Error('Golden and POC reports must bind to the same source revision');
}

const goldenOpenAi = runFor(golden, 'openai');
const goldenNvidia = runFor(golden, 'nvidia');
const pocOpenAi = runFor(poc, 'openai');
const pocNvidia = runFor(poc, 'nvidia');
const complete = [goldenOpenAi, goldenNvidia, pocOpenAi, pocNvidia].every(Boolean);
const regressions = [...pairRegressions(golden), ...pairRegressions(poc)];

let evidenceStatement;
if (!complete) {
  evidenceStatement = 'The evidence set is incomplete. No provider-switch conclusion is supported.';
} else if (
  goldenNvidia.summary.passRatePct < goldenOpenAi.summary.passRatePct ||
  pocNvidia.summary.passRatePct < pocOpenAi.summary.passRatePct ||
  goldenNvidia.summary.errorRatePct > goldenOpenAi.summary.errorRatePct ||
  pocNvidia.summary.errorRatePct > pocOpenAi.summary.errorRatePct
) {
  evidenceStatement = 'Keep OpenAI as the production default. The NVIDIA candidate has at least one measured reliability or pass-rate regression in this evidence set. Continue NVIDIA evaluation only in shadow mode until the regression is resolved and re-measured.';
} else {
  evidenceStatement = 'Keep OpenAI as the production default for now. The NVIDIA candidate cleared this bounded evidence set without a pass-rate or error-rate regression, which supports a deeper technical review, not an automatic production switch.';
}

const report = `# VertexED × NVIDIA Technical Proof-of-Value Report

**Evidence status:** ${complete ? 'complete for the bounded benchmark described below' : 'incomplete'}  
**Source revision:** \`${golden.sourceRevision}\`  
**Generated:** ${new Date().toISOString()}  
**Production provider change:** none

## Executive summary

This report evaluates an NVIDIA OpenAI-compatible inference candidate against VertexED's existing OpenAI-backed Apex tutoring path. The exercise is intentionally a shadow evaluation. It does not route production traffic to NVIDIA and it does not treat API connectivity as quality evidence.

${evidenceStatement}

## Architecture and isolation

The production-safe default remains \`CHATBOT_PROVIDER=openai\`. The NVIDIA adapter is opt-in through \`CHATBOT_PROVIDER=nvidia\`, \`NVIDIA_API_KEY\`, and an explicit \`NVIDIA_CHATBOT_MODEL\`. Both providers flow through the same bounded message construction, grounding rules, deterministic rubric scorer, request evidence hashing, and response evidence capture.

| Provider | Model | Endpoint |
|---|---|---|
| OpenAI | ${goldenOpenAi?.model || pocOpenAi?.model || 'n/a'} | ${goldenOpenAi?.endpoint || pocOpenAi?.endpoint || 'n/a'} |
| NVIDIA | ${goldenNvidia?.model || pocNvidia?.model || 'n/a'} | ${goldenNvidia?.endpoint || pocNvidia?.endpoint || 'n/a'} |

No API keys are stored in benchmark artifacts.

## Method

Two prompt sets are run at the exact same source revision and request configuration.

1. **Regression continuity:** the existing 13-prompt \`evals/ask/golden.jsonl\` set.
2. **NVIDIA POC stress set:** \`evals/ask/nvidia-poc.jsonl\`, covering IB/IGCSE/A-Level tutoring, source grounding, mathematical reasoning, multi-turn context, academic-integrity boundaries, hallucination pressure, and retrieval prompt injection.

Both providers use temperature 0.4 and a maximum of 1200 output tokens. The runner records deterministic rubric score, pass/fail, error rate, latency p50/p95, output length, token usage, source-citation compliance for grounded prompts, safety/adversarial pass rate, request/response evidence hashes, and estimated cost only when explicit per-token pricing is supplied to the runner.

## Primary results

| Set | Provider | Model | Pass rate | Avg score | Error rate | p50 latency | p95 latency | Est. total cost |
|---|---|---|---:|---:|---:|---:|---:|---:|
${[...tableRows('Golden', golden), ...tableRows('NVIDIA POC', poc)].join('\n')}

## Grounding and safety

| Set | Provider | Grounded-source compliance | Safety/adversarial pass rate | Avg output chars |
|---|---|---:|---:|---:|
${[...detailedRows('Golden', golden), ...detailedRows('NVIDIA POC', poc)].join('\n')}

A grounding score is reported only for prompts that explicitly require a \`[Source: ...]\` citation. Safety/adversarial performance is reported only for prompts tagged for those stress categories. Missing pricing is shown as \`n/a\`; it must not be interpreted as zero cost.

## Regressions

${regressions.length
  ? regressions.map((item) => `- \`${item.id}\` — ${item.title}; NVIDIA score ${item.nvidiaScore}/5${item.error ? `; error: ${item.error}` : ''}.`).join('\n')
  : '- No case was observed where OpenAI passed and NVIDIA failed in the retained reports.'}

## Deployment recommendation

${evidenceStatement}

Any future provider change should require a fresh source-bound benchmark on the exact release candidate, acceptable grounding and safety results, production-like latency measurements, and an explicit rollback plan.

## Reproducibility

Golden report: \`${goldenArg}\`  
POC report: \`${pocArg}\`  
Golden prompt hash: \`${golden.promptSetSha256 || golden.goldenSetSha256 || 'n/a'}\`  
POC prompt hash: \`${poc.promptSetSha256 || poc.goldenSetSha256 || 'n/a'}\`

The machine-readable JSON reports are the authoritative evidence. This Markdown file is a deterministic summary generated from them.

## Open questions for NVIDIA technical review

- Which currently supported NVIDIA model/endpoints are recommended for low-latency educational tutoring with grounded context?
- Which inference configuration provides the best latency/quality tradeoff for short Socratic responses versus long-form reasoning?
- What is the recommended production path for observability, rate limiting, and regional deployment for this workload?
- Which Inception or Innovation Lab resources are appropriate for moving from hosted API benchmarking to optimized NVIDIA inference infrastructure?
- What pricing basis should VertexED use for a production cost model for the selected NVIDIA deployment path?
`;

const out = resolve(process.cwd(), outputArg);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, report);
console.log(`report: ${out}`);
