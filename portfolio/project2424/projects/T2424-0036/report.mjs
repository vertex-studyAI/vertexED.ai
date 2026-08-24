import fs from 'node:fs';

function usage() {
  console.error('Usage: node report.mjs <benchmark.json> [--out report.md]');
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length < 1) usage();
const inputPath = args[0];
let outPath = null;
for (let i = 1; i < args.length; i += 1) {
  if (args[i] === '--out' && i + 1 < args.length) outPath = args[++i];
  else usage();
}

const result = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(result.cases) || typeof result.claimBoundary !== 'string') {
  throw new Error('input is not a Rubik A* benchmark result');
}

const rows = result.cases.map((row) =>
  `| ${row.id} | ${JSON.stringify(row.scramble)} | ${row.status} | ${row.solutionLength ?? '—'} | ${row.nodesExpanded} | ${row.verified ? 'PASS' : 'FAIL'} |`
).join('\n');

const expanded = result.cases.map((row) => Number(row.nodesExpanded)).filter(Number.isFinite);
const meanExpanded = expanded.length ? expanded.reduce((a, b) => a + b, 0) / expanded.length : null;
const maxExpanded = expanded.length ? Math.max(...expanded) : null;

const md = `# T2424-0036 — Machine-Generated Fixed-Benchmark Report

> Generated from \`${inputPath}\`. Regenerate this report from benchmark JSON; do not hand-enter scientific values.

## Claim boundary

${result.claimBoundary}

## Search configuration

- model: ${result.model}
- move set: ${JSON.stringify(result.moveSet)}
- heuristic: ${result.heuristic}
- node budget: ${result.nodeBudget}
- maximum depth: ${result.maxDepth}

## Aggregate

| Metric | Value |
|---|---:|
| verified solved cases | ${result.solved}/${result.total} |
| mean nodes expanded | ${meanExpanded ?? '—'} |
| max nodes expanded | ${maxExpanded ?? '—'} |

## Fixed benchmark cases

| Case | Scramble | Status | Solution length | Nodes expanded | Independent solve check |
|---|---|---|---:|---:|---|
${rows}

## Interpretation boundary

This is a deterministic search-engine benchmark over **2×2 corner permutation only** with orientation omitted. It is not a full Rubik's Cube solver and is not evidence of general intelligence. A successor study should freeze full 2×2 orientation legality, scramble-length strata, and equal-budget A*/IDA*/pattern-database baselines before adding a learned heuristic.
`;

if (outPath) fs.writeFileSync(outPath, md, 'utf8');
else process.stdout.write(md);
