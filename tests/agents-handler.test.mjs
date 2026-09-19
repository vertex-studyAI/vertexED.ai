import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import agentsHandler, { BUILT_IN_STUDY_AGENTS } from '../api/_handlers/agents.js';
import { createMocks } from './helpers/mock-http.mjs';

test('agents rejects unauthenticated GET requests before provider work', async () => {
  const { req, res, getStatus, getJson } = createMocks({ method: 'GET' });
  await agentsHandler(req, res);
  assert.equal(getStatus(), 401);
  assert.equal(getJson()?.error, 'Authentication required. Please log in.');
});

test('agents route is registered for GET only', () => {
  const routes = readFileSync(new URL('../api/_lib/routes.js', import.meta.url), 'utf8');
  assert.match(
    routes,
    /agents:\s*\{[\s\S]*?loader:\s*\(\)\s*=>\s*import\('\.\.\/_handlers\/agents\.js'\)[\s\S]*?methods:\s*\['GET'\]/,
  );
});

test('agents handler exposes a public built-in catalog without instructions', () => {
  assert.ok(BUILT_IN_STUDY_AGENTS.length >= 8);
  for (const agent of BUILT_IN_STUDY_AGENTS) {
    assert.equal(typeof agent.id, 'string');
    assert.equal(typeof agent.name, 'string');
    assert.equal(typeof agent.capability, 'string');
    assert.equal('instructions' in agent, false);
    assert.equal('system' in agent, false);
    assert.equal('prompt' in agent, false);
  }
  const source = readFileSync(new URL('../api/_handlers/agents.js', import.meta.url), 'utf8');
  assert.match(source, /verifyAuthUser/);
  assert.match(source, /rateLimitUserEndpoint\(user\.id, 'agents', res/);
  assert.match(source, /req\.method !== 'GET'/);
  assert.match(source, /Cache-Control['"],\s*['"]private, no-store['"]/);
  assert.doesNotMatch(source, /instructions:/);
});

test('agents rejects non-GET methods before auth', async () => {
  const { req, res, getStatus, getJson } = createMocks({ method: 'POST' });
  await agentsHandler(req, res);
  assert.equal(getStatus(), 405);
  assert.equal(getJson()?.error, 'Method not allowed');
});
