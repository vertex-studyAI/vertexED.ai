import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mirror notebook domain logic for unit tests (no DOM)
const MAX_TOTAL = 100_000;

function buildGroundingPayload(sources, enabledOnly = true) {
  const list = enabledOnly ? sources.filter((s) => s.enabled && s.content.trim()) : sources;
  let budget = MAX_TOTAL;
  const payloads = [];
  for (const source of list) {
    if (budget <= 500) break;
    const excerpt = source.content.length > budget ? source.content.slice(0, budget) : source.content;
    payloads.push({ id: source.id, title: source.title, excerpt });
    budget -= excerpt.length;
  }
  return payloads;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

test('buildGroundingPayload respects enabled flag', () => {
  const sources = [
    { id: 'a', title: 'A', content: 'hello world', enabled: true },
    { id: 'b', title: 'B', content: 'hidden', enabled: false },
  ];
  const payload = buildGroundingPayload(sources);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].title, 'A');
});

test('buildGroundingPayload truncates to char budget', () => {
  const big = 'x'.repeat(150_000);
  const sources = [{ id: 'a', title: 'Big', content: big, enabled: true }];
  const payload = buildGroundingPayload(sources);
  assert.equal(payload.length, 1);
  assert.ok(payload[0].excerpt.length <= MAX_TOTAL);
});

test('countWords handles empty and normal text', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('one two three'), 3);
});

test('notebook output modes are defined in handler', async () => {
  const { NOTEBOOK_OUTPUT_MODES } = await import('../api/_lib/grounding.js');
  assert.ok(NOTEBOOK_OUTPUT_MODES['study-guide']);
  assert.ok(NOTEBOOK_OUTPUT_MODES['audio-debate']);
  assert.ok(NOTEBOOK_OUTPUT_MODES.quiz?.quiz);
  assert.ok(NOTEBOOK_OUTPUT_MODES['mind-map']);
  assert.ok(Object.keys(NOTEBOOK_OUTPUT_MODES).length >= 14);
});
