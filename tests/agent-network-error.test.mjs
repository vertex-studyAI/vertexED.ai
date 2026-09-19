import assert from 'node:assert/strict';
import test from 'node:test';
import { agentNetworkError } from '../src/lib/agentNetworkError.mjs';

test('agentNetworkError never echoes raw provider text', () => {
  assert.equal(
    agentNetworkError(new Error('OpenAI project agents returned HTTP 503 upstream detail xyz')),
    'The agent directory is temporarily unavailable.',
  );
});

test('agentNetworkError maps auth and rate-limit cases', () => {
  assert.match(agentNetworkError(new Error('Unauthorized')), /Sign in/i);
  assert.match(agentNetworkError(new Error('Too many requests rate limit')), /Too many/i);
  assert.match(agentNetworkError(new Error('Network timeout')), /could not reach/i);
});
