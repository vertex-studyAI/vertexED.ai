import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ADAPTIVE_QUESTION_BANK, ADAPTIVE_QUESTION_METADATA } from '../src/content/adaptiveQuestionBank.mjs';
import { verifyPublishedContent } from '../scripts/verify-published-content.mjs';

test('emitted-content inspection rejects hidden keys, raw body strings and offline draft URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vertex-content-build-'));
  try {
    await mkdir(join(dir, 'assets'));
    await writeFile(join(dir, 'assets', 'app.js'), `const metadata=${JSON.stringify(ADAPTIVE_QUESTION_METADATA)};`);
    assert.equal((await verifyPublishedContent(dir, { approvals: [] })).status, 'PASS');
    const question = ADAPTIVE_QUESTION_BANK[0];
    await writeFile(join(dir, 'assets', 'leak.js'), `const body=${JSON.stringify(question.prompt)};const hidden=${JSON.stringify({ id: question.id, answer: question.answer })};`);
    await writeFile(join(dir, 'sw.js'), 'const MANIFEST={entries:[{url:"/ap-content/calculus-ab.json"}]};');
    const report = await verifyPublishedContent(dir, { approvals: [] });
    assert.equal(report.status, 'FAIL');
    assert.deepEqual(new Set(report.violations.map((item) => item.reason)), new Set(['held-adaptive-body-or-definition', 'held-adaptive-answer-object', 'held-offline-url']));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
