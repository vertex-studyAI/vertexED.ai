import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { normalizeTelemetry } from '../api/_handlers/telemetry.js';

test('telemetry keeps only fixed privacy-safe fields', () => {
  const event = normalizeTelemetry({
    event: 'client_error',
    route: '/planner?token=secret#fragment',
    capability: 'planner',
    errorClass: 'type_error',
    outcome: 'failed',
    durationMs: 123.7,
    email: 'student@example.com',
    message: 'private answer text',
    prompt: 'secret prompt',
  }, new Date('2026-09-01T00:00:00Z'));

  assert.deepEqual(event, {
    schema: 'vertexed.telemetry.v1',
    event: 'client_error',
    route: '/planner',
    capability: 'planner',
    errorClass: 'type_error',
    outcome: 'failed',
    durationMs: 124,
    recordedAt: '2026-09-01T00:00:00.000Z',
  });
});

test('telemetry rejects unknown event classes', () => {
  assert.equal(normalizeTelemetry({ event: 'upload_everything' }), null);
});

test('telemetry bounds duration and rejects unsafe route text', () => {
  const event = normalizeTelemetry({ event: 'performance', route: 'https://evil.example/?x=1', durationMs: 9e9 });
  assert.equal(event.route, 'unknown');
  assert.equal(event.durationMs, 300_000);
});

test('client monitoring never sends raw messages or stacks', async () => {
  const source = await readFile(new URL('../src/lib/monitoring.ts', import.meta.url), 'utf8');
  assert.match(source, /\/api\/telemetry/);
  assert.doesNotMatch(source, /message, context/);
  assert.doesNotMatch(source, /stack:/);
});
