import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  MAX_POINTS_PER_STROKE,
  MAX_SKETCH_STROKES,
  normalizeSketchStrokes,
  readSketchStrokes,
  writeSketchStrokes,
} from '../src/lib/sketchStorage.mjs';

const source = fs.readFileSync('src/components/sketch/SketchPad.tsx', 'utf8');

const validStroke = {
  color: '#7dd3fc',
  width: 3,
  tool: 'pen',
  points: [
    { x: 10, y: 12, pressure: 0.5 },
    { x: 14, y: 16, pressure: 0.7 },
  ],
};

test('sketch normalization rejects malformed roots and unsafe stroke shapes', () => {
  assert.deepEqual(normalizeSketchStrokes(null), []);
  assert.deepEqual(normalizeSketchStrokes({ stroke: validStroke }), []);

  const normalized = normalizeSketchStrokes([
    null,
    'bad',
    { ...validStroke, tool: 'spray' },
    { ...validStroke, color: '' },
    { ...validStroke, width: 0 },
    { ...validStroke, width: Number.POSITIVE_INFINITY },
    { ...validStroke, points: 'not-an-array' },
    { ...validStroke, points: [{ x: 1, y: 2, pressure: 2 }] },
    validStroke,
  ]);

  assert.deepEqual(normalized, [validStroke]);
});

test('sketch normalization bounds stored strokes and point counts', () => {
  const manyPoints = Array.from({ length: MAX_POINTS_PER_STROKE + 25 }, (_, index) => ({
    x: index,
    y: index + 1,
    pressure: 0.5,
  }));
  const rows = Array.from({ length: MAX_SKETCH_STROKES + 12 }, (_, index) => ({
    ...validStroke,
    color: index % 2 ? '#7dd3fc' : '#a78bfa',
    points: index === MAX_SKETCH_STROKES + 11 ? manyPoints : validStroke.points,
  }));

  const normalized = normalizeSketchStrokes(rows);
  assert.equal(normalized.length, MAX_SKETCH_STROKES);
  assert.equal(normalized.at(-1).points.length, MAX_POINTS_PER_STROKE);
});

test('sketch persistence fails closed when browser storage is unavailable', () => {
  const unavailable = {
    get localStorage() {
      throw new Error('blocked');
    },
  };
  assert.deepEqual(readSketchStrokes(unavailable, 'sketch'), []);
  assert.equal(writeSketchStrokes(unavailable, 'sketch', [validStroke]), false);

  const throwingStorage = {
    getItem() { throw new Error('blocked read'); },
    setItem() { throw new Error('full'); },
  };
  const owner = { localStorage: throwingStorage };
  assert.deepEqual(readSketchStrokes(owner, 'sketch'), []);
  assert.equal(writeSketchStrokes(owner, 'sketch', [validStroke]), false);
});

test('sketch pad uses the hardened persistence boundary', () => {
  assert.match(source, /readSketchStrokes\(window, storageKey\)/);
  assert.match(source, /writeSketchStrokes\(window, storageKey, strokesRef\.current\)/);
  assert.match(source, /writeSketchStrokes\(window, storageKey, \[\]\)/);
  assert.doesNotMatch(source, /(?:window\.)?localStorage\.(?:getItem|setItem|removeItem)/);
});
