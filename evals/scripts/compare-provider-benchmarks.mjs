#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { compareDecisionRows } from '../research/provider-evidence.mjs';

const [beforeArg, currentArg, outputArg] = process.argv.slice(2);
if (!beforeArg || !currentArg) {
  console.error('Usage: compare-provider-benchmarks.mjs BEFORE.json CURRENT.json [OUTPUT.json]');
  process.exit(2);
}

const read = path => JSON.parse(readFileSync(resolve(path), 'utf8'));
const before = read(beforeArg);
const current = read(currentArg);
for (const [label, report] of [['before', before], ['current', current]]) {
  if (report.schema !== 'vertexed.provider_benchmark.v2' || !report.sourceBound) {
    throw new Error(`${label} report is not a source-bound provider benchmark v2 artifact`);
  }
}
if (before.goldenSetSha256 !== current.goldenSetSha256) {
  throw new Error('golden prompt set changed; provider drift is not identifiable');
}
if (JSON.stringify(before.requestConfig) !== JSON.stringify(current.requestConfig)) {
  throw new Error('request configuration changed; provider drift is not identifiable');
}

const comparisons = [];
for (const run of current.runs) {
  const prior = before.runs.find(value => value.provider === run.provider && value.model === run.model);
  if (!prior) throw new Error(`missing matched prior run for ${run.provider}/${run.model}`);
  comparisons.push({
    provider: run.provider,
    model: run.model,
    rows: compareDecisionRows(prior.results, run.results),
  });
}
const decisionChanges = comparisons.flatMap(item => item.rows).filter(row => row.decisionChanged);
const result = {
  schema: 'vertexed.provider_drift.v1',
  beforeRevision: before.sourceRevision,
  currentRevision: current.sourceRevision,
  decisionChangeCount: decisionChanges.length,
  pass: decisionChanges.length === 0,
  comparisons,
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (outputArg) writeFileSync(resolve(outputArg), serialized);
else process.stdout.write(serialized);
if (!result.pass) process.exitCode = 1;
