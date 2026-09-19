import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const panelSource = readFileSync(new URL('../src/components/chat/AgentNetworkPanel.tsx', import.meta.url), 'utf8');

test('agent network panel exposes alert semantics and a labeled retry control on failure', () => {
  assert.match(panelSource, /aria-busy=\{!network && !error\}/);
  assert.match(panelSource, /role="alert"/);
  assert.match(panelSource, /aria-label="Retry loading the agent network directory"/);
  assert.match(panelSource, /Try again/);
});

test('agent network panel keeps loading feedback as polite status, not alert', () => {
  assert.match(panelSource, /role="status">Checking the linked project/);
  const alertIndex = panelSource.indexOf('role="alert"');
  const loadingIndex = panelSource.indexOf('Checking the linked project');
  assert.ok(loadingIndex >= 0 && alertIndex > loadingIndex);
});
