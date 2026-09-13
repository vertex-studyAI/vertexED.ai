import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compareDecisionRows,
  createRequestEvidence,
  createResponseEvidence,
  sha256Json,
} from '../evals/research/provider-evidence.mjs';

test('request fingerprint is canonical and binds model plus decoding config', () => {
  assert.equal(sha256Json({ b: 2, a: 1 }), sha256Json({ a: 1, b: 2 }));
  const base = createRequestEvidence({
    provider: 'openai', model: 'model-v1', temperature: 0, maxTokens: 100,
    messages: [{ role: 'user', content: 'frozen prompt' }],
  });
  const changed = createRequestEvidence({
    provider: 'openai', model: 'model-v2', temperature: 0, maxTokens: 100,
    messages: [{ role: 'user', content: 'frozen prompt' }],
  });
  assert.notEqual(base.requestSha256, changed.requestSha256);
});

test('response evidence retains text only when explicitly allowed', () => {
  assert.deepEqual(createResponseEvidence('answer'), {
    responseSha256: '0db52f4076c082518412afd3dd3576e2cb0c63703fd7fed5e23ade60efef31d9',
    responseChars: 6,
    responseRetained: false,
  });
  assert.equal(createResponseEvidence('answer', { retainText: true }).responseText, 'answer');
});

test('decision comparison distinguishes output drift from gate drift', () => {
  const rows = compareDecisionRows(
    [{ id: 'a', score: 3, passed: true, responseSha256: 'old' }],
    [{ id: 'a', score: 3, passed: true, responseSha256: 'new' }],
  );
  assert.deepEqual(rows[0], {
    id: 'a', comparable: true, scoreChanged: false, decisionChanged: false, responseChanged: true,
  });
});
