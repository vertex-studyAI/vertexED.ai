import test from 'node:test';
import assert from 'node:assert/strict';
import { payloadBytes, validateSubmission } from '../tools/percy-runtime/advanced.mjs';

test('Percy submission payload limits fail closed when misconfigured', () => {
  const task = { kind: 'echo', payload: { value: 'x' }, maxAttempts: 1 };
  for (const maxPayloadBytes of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.5]) {
    assert.throws(
      () => validateSubmission(task, { maxPayloadBytes }),
      /maxPayloadBytes must be >=1/,
    );
  }
});

test('Percy submission payload limit still accepts exact-bound payloads and rejects larger ones', () => {
  const payload = { value: 'bounded' };
  const bytes = payloadBytes(payload);
  const accepted = validateSubmission(
    { kind: 'echo', payload, maxAttempts: 1 },
    { maxPayloadBytes: bytes },
  );
  assert.equal(accepted.payloadBytes, bytes);

  assert.throws(
    () => validateSubmission(
      { kind: 'echo', payload, maxAttempts: 1 },
      { maxPayloadBytes: bytes - 1 },
    ),
    /payload too large/,
  );
});
