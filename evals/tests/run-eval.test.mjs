import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runEval } from '../scripts/run-eval.mjs';

function tmpGolden(lines) {
  const dir = mkdtempSync(join(tmpdir(), 'eval-test-'));
  const path = join(dir, 'golden.jsonl');
  writeFileSync(path, lines.join('\n'));
  return { path, dir };
}

const SIMPLE_GOLDEN = [
  JSON.stringify({
    id: 't-001',
    category: 'math',
    title: 'simple algebra',
    request: { question: 'solve 2x=10' },
    rubric: { mustContainAny: [['5']], minLength: 10, maxLength: 200 },
  }),
  JSON.stringify({
    id: 't-002',
    category: 'math',
    title: 'too short',
    request: { question: 'ping' },
    rubric: { minLength: 1000 },
  }),
];

test('runEval: aggregates pass/fail per prompt in fixture mode', async () => {
  const { path, dir } = tmpGolden(SIMPLE_GOLDEN);
  const fixture = {
    't-001': { answer: 'The answer is 5. Try dividing both sides by 2.' },
    't-002': { answer: 'short' },
  };

  try {
    const report = await runEval({ goldenPath: path, fixture, label: 'unit' });
    assert.equal(report.summary.totalPrompts, 2);
    // t-001: mustContainAny [[5]] hits, length ~46, score = 5 -> pass
    // t-002: minLength 1000 violated, -1, score = 4 -> still pass (>= 3)
    assert.equal(report.summary.passed, 2);
    assert.equal(report.summary.failed, 0);
    assert.equal(report.summary.byCategory.math.total, 2);
    assert.ok(report.summary.avgScore >= 4 && report.summary.avgScore <= 5);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runEval: handler mode is used when fixture is null', async () => {
  const { path, dir } = tmpGolden(SIMPLE_GOLDEN);
  const calls = [];
  const handler = async (req) => {
    calls.push(req.question);
    return { answer: 'The answer is 5. ' + req.question };
  };

  try {
    const report = await runEval({ goldenPath: path, fixture: null, handler, label: 'handler' });
    assert.equal(calls.length, 2);
    assert.equal(report.summary.totalPrompts, 2);
    for (const r of report.results) {
      assert.equal(r.mode, 'live');
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runEval: handler errors are caught and marked failed', async () => {
  const { path, dir } = tmpGolden(SIMPLE_GOLDEN);
  const handler = async () => {
    throw new Error('boom');
  };

  try {
    const report = await runEval({ goldenPath: path, fixture: null, handler, label: 'errors' });
    assert.equal(report.summary.totalPrompts, 2);
    assert.equal(report.summary.failed, 2);
    for (const r of report.results) {
      assert.equal(r.score, 1);
      assert.match(r.error, /boom/);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runEval: failThresholdPct triggers overallPass', async () => {
  const { path, dir } = tmpGolden([
    JSON.stringify({
      id: 't-100',
      category: 'fail',
      title: 'always fails',
      request: { question: 'x' },
      rubric: {
        mustContainAny: [['NEVER_PRESENT']],
        mustNotContain: ['something else'],
        minLength: 10000,
      },
    }),
  ]);
  try {
    const strict = await runEval({ goldenPath: path, fixture: { 't-100': { answer: 'something else' } }, label: 'strict' });
    assert.equal(strict.summary.failed, 1);
    assert.equal(strict.summary.overallPass, false);

    const lenient = await runEval({
      goldenPath: path,
      fixture: { 't-100': { answer: 'something else' } },
      label: 'lenient',
      failThresholdPct: 100,
    });
    assert.equal(lenient.summary.overallPass, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runEval: byCategory aggregates correctly', async () => {
  const { path, dir } = tmpGolden([
    JSON.stringify({ id: 'm1', category: 'math', request: { q: '1' }, rubric: { mustContainAny: [['1']] } }),
    JSON.stringify({ id: 'm2', category: 'math', request: { q: '2' }, rubric: { mustContainAny: [['2']] } }),
    JSON.stringify({ id: 's1', category: 'science', request: { q: '3' }, rubric: { mustContainAny: [['3']] } }),
  ]);
  try {
    const fixture = {
      m1: { answer: '1' },
      m2: { answer: '2' },
      s1: { answer: '3' },
    };
    const report = await runEval({ goldenPath: path, fixture, label: 'cat' });
    assert.equal(report.summary.byCategory.math.total, 2);
    assert.equal(report.summary.byCategory.science.total, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});