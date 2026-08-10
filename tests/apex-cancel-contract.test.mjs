import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const apiSource = fs.readFileSync('src/lib/chatbotApi.ts', 'utf8');
const hookSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');

test('chatbot API propagates an optional AbortSignal through authFetch', () => {
  assert.match(apiSource, /signal\?: AbortSignal/);
  assert.match(apiSource, /signal: request\.signal/);
});

test('Apex owns and releases one abort controller per in-flight request', () => {
  assert.match(hookSource, /useRef<AbortController \| null>\(null\)/);
  assert.match(hookSource, /const requestController = new AbortController\(\)/);
  assert.match(hookSource, /signal: requestController\.signal/);
  assert.match(hookSource, /requestAbortRef\.current === requestController/);
  assert.match(hookSource, /requestAbortRef\.current = null/);
});

test('cancel, clear, account changes, and unmount abort in-flight Apex requests', () => {
  const abortCalls = hookSource.match(/requestAbortRef\.current\?\.abort\(\)/g) ?? [];
  assert.ok(abortCalls.length >= 4, `expected at least four abort boundaries, saw ${abortCalls.length}`);
  assert.match(hookSource, /const cancelMessage = useCallback\(\(\) => \{[\s\S]*?requestAbortRef\.current\?\.abort\(\)/);
  assert.match(hookSource, /const clearChat = useCallback\(\(\) => \{[\s\S]*?requestAbortRef\.current\?\.abort\(\)/);
});
