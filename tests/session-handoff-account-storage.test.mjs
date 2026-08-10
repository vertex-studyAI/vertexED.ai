import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const quickAskSource = fs.readFileSync('src/components/chat/ApexQuickAsk.tsx', 'utf8');
const chatbotSource = fs.readFileSync('src/pages/AIChatbot.tsx', 'utf8');
const examFlowSource = fs.readFileSync('src/lib/examFlow.ts', 'utf8');

test('transient learner handoffs use distinct account-scoped keys', () => {
  const first = userContentStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = userContentStorageKeys('22222222-2222-4222-8222-222222222222');

  for (const key of ['apexPrefill', 'mockReviewHandoff']) {
    assert.notEqual(first[key], second[key]);
    assert.match(first[key], /^vertex_content:/);
    assert.match(second[key], /^vertex_content:/);
  }
});

test('Apex quick-ask prefill cannot cross accounts through a shared session key', () => {
  assert.match(quickAskSource, /userContentStorageKeys\(user\?\.id \?\? null\)\.apexPrefill/);
  assert.match(chatbotSource, /userContentStorageKeys\(user\?\.id \?\? null\)\.apexPrefill/);
  assert.doesNotMatch(quickAskSource, /vertex_apex_prefill/);
  assert.doesNotMatch(chatbotSource, /vertex_apex_prefill/);
});

test('mock-review handoff follows the active authenticated content scope', () => {
  assert.match(examFlowSource, /userContentStorageKeys\(\)\.mockReviewHandoff/);
  assert.doesNotMatch(examFlowSource, /vertex_mock_review_handoff/);
  assert.match(examFlowSource, /sessionStorage\.setItem\(mockReviewStorageKey\(\)/);
  assert.match(examFlowSource, /sessionStorage\.getItem\(mockReviewStorageKey\(\)/);
});
