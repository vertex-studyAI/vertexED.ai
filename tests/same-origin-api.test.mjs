import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSameOriginApiPath } from '../src/lib/sameOriginApi.mjs';

test('returns the fallback when no override is configured', () => {
  assert.equal(resolveSameOriginApiPath(undefined, '/api/ask', 'https://www.vertexed.app'), '/api/ask');
});

test('accepts relative same-origin API paths', () => {
  assert.equal(resolveSameOriginApiPath('/api/custom', '/api/ask', 'https://www.vertexed.app'), '/api/custom');
});

test('normalizes an absolute same-origin URL to a relative path', () => {
  assert.equal(
    resolveSameOriginApiPath('https://www.vertexed.app/api/ask?mode=1', '/api/ask', 'https://www.vertexed.app'),
    '/api/ask?mode=1',
  );
});

test('rejects an absolute cross-origin URL', () => {
  assert.equal(
    resolveSameOriginApiPath('https://api.example.com/ask', '/api/ask', 'https://www.vertexed.app'),
    '/api/ask',
  );
});

test('rejects protocol-relative cross-origin URLs', () => {
  assert.equal(
    resolveSameOriginApiPath('//api.example.com/ask', '/api/ask', 'https://www.vertexed.app'),
    '/api/ask',
  );
});

test('fails closed to the fallback when runtime origin is unavailable', () => {
  assert.equal(resolveSameOriginApiPath('https://www.vertexed.app/api/ask', '/api/ask'), '/api/ask');
});
