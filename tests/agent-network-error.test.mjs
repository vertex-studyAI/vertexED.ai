import assert from 'node:assert/strict';
import test from 'node:test';
import { agentNetworkError } from '../src/lib/agentNetworkError.mjs';

test('agentNetworkError never echoes raw provider text', () => {
  assert.equal(
    agentNetworkError(new Error('OpenAI project key sk-secret leaked in stack')),
    'The agent directory is temporarily unavailable.',
  );
  assert.doesNotMatch(agentNetworkError(new Error('provider boom detail')), /provider boom detail/);
});

test('agentNetworkError maps auth and rate-limit cases', () => {
  assert.match(agentNetworkError(new Error('401 unauthorized')), /Sign in/i);
  assert.match(agentNetworkError(new Error('Too many requests rate limit')), /Too many/i);
  assert.match(agentNetworkError(new Error('Network timeout')), /could not reach/i);
});

test('agentNetworkError uses typed status and retryAfterSec when present', () => {
  const err = Object.assign(new Error('opaque upstream'), { status: 429, retryAfterSec: 12 });
  assert.match(agentNetworkError(err), /about 12 seconds/i);
  assert.doesNotMatch(agentNetworkError(err), /opaque upstream/);
  assert.match(agentNetworkError(Object.assign(new Error('x'), { status: 401 })), /Sign in/i);
  assert.match(agentNetworkError(Object.assign(new Error('x'), { status: 403 })), /cannot load/i);
});
