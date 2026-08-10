import assert from 'node:assert/strict';
import test from 'node:test';

import {
  discoverMotifs,
  piecewiseAggregate,
  summarizeDictionary,
  windowSignature,
  zNormalize
} from '../portfolio/project2424/projects/T2424-0053/src/core.mjs';

const motif = [0, 1, 2, 3, 3, 2, 1, 0];

test('z-normalized signatures are invariant to positive affine rescaling', () => {
  const scaled = motif.map((value) => 10 + 3 * value);
  assert.equal(
    windowSignature(motif, 0, { windowSize: 8, segments: 4 }),
    windowSignature(scaled, 0, { windowSize: 8, segments: 4 })
  );
});

test('piecewise aggregation preserves the requested segment count', () => {
  const normalized = zNormalize(motif);
  const aggregate = piecewiseAggregate(normalized, 4);
  assert.equal(aggregate.length, 4);
  assert.ok(aggregate.every(Number.isFinite));
});

test('dictionary recovers a repeated non-overlapping shape', () => {
  const scaled = motif.map((value) => 20 + 2 * value);
  const series = [...motif, 8, 8, 8, 8, 8, 8, 8, 8, ...scaled];
  const signature = windowSignature(series, 0, { windowSize: 8, segments: 4 });
  const motifs = discoverMotifs(series, { windowSize: 8, segments: 4, minSupport: 2 });
  const recovered = motifs.find((entry) => entry.signature === signature);
  assert.ok(recovered, 'expected the repeated shape to appear in the dictionary');
  assert.ok(recovered.positions.includes(0));
  assert.ok(recovered.positions.includes(16));
  assert.ok(recovered.support >= 2);
});

test('opposite trends have different normalized signatures', () => {
  const rising = [0, 1, 2, 3, 4, 5, 6, 7];
  const falling = [...rising].reverse();
  assert.notEqual(
    windowSignature(rising, 0, { windowSize: 8, segments: 4 }),
    windowSignature(falling, 0, { windowSize: 8, segments: 4 })
  );
});

test('summary and malformed configuration fail deterministically', () => {
  const series = [...motif, ...motif];
  const summary = summarizeDictionary(series, { windowSize: 8, segments: 4, minSupport: 2 });
  assert.equal(summary.observations, 16);
  assert.ok(Array.isArray(summary.motifs));
  assert.throws(() => windowSignature(series, 0, { windowSize: 7, segments: 4 }), /divisible/);
  assert.throws(() => discoverMotifs([1, 2], { windowSize: 3 }), /cannot exceed/);
  assert.throws(() => zNormalize([1, Number.NaN]), /finite/);
});
