import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { agentNetworkError } from '../src/lib/agentNetworkError.mjs';

const apiSource = readFileSync(new URL('../src/lib/agentNetworkApi.ts', import.meta.url), 'utf8');
const panelSource = readFileSync(new URL('../src/components/chat/AgentNetworkPanel.tsx', import.meta.url), 'utf8');

test('agentNetworkApi maps 429/401 to typed AgentNetworkRequestError without trusting server error text', () => {
  assert.match(apiSource, /export class AgentNetworkRequestError extends Error/);
  assert.match(apiSource, /response\.status === 429/);
  assert.match(apiSource, /response\.status === 401/);
  assert.match(apiSource, /retryAfterSec/);
  assert.doesNotMatch(apiSource, /serverMessage/);
  assert.doesNotMatch(apiSource, /payload as \{ error/);
});

test('agentNetworkError uses typed 429 retryAfterSec when present', () => {
  const err = Object.assign(new Error('Rate limit exceeded. Try again in 12s.'), {
    status: 429,
    retryAfterSec: 12,
  });
  assert.match(agentNetworkError(err), /about 12 seconds/i);
  assert.doesNotMatch(agentNetworkError(err), /Rate limit exceeded\. Try again in 12s\./);
});

test('AgentNetworkPanel keeps sanitized copy and rate-limit retry labeling', () => {
  assert.match(panelSource, /agentNetworkError\(reason\)/);
  assert.match(panelSource, /setRateLimited\(reason instanceof AgentNetworkRequestError && reason\.status === 429\)/);
  assert.match(panelSource, /aria-label=\{rateLimited \? 'Retry loading the agent network directory after rate limit' : 'Retry loading the agent network directory'\}/);
  assert.doesNotMatch(panelSource, /setError\(reason\.message\)/);
  assert.doesNotMatch(panelSource, /setError\(reason instanceof Error \? reason\.message/);
});
