import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SourceMapConsumer } = require('source-map-js');
const postcss = require('postcss');

const css = '.study-guide { color: blue; }';

function sourceMap() {
  return {
    version: 3,
    sources: ['study-guide.css'],
    sourcesContent: [css],
    names: [],
    mappings: 'AAAA',
  };
}

function indexedMap(line, map = sourceMap()) {
  return { version: 3, sections: [{ offset: { line, column: 0 }, map }] };
}

test('source maps reject section offsets that would amplify a small input into excessive work', () => {
  // Constructing the consumer is enough to check the guard. Do not serialize
  // the malicious map or allocate output proportional to its claimed offset.
  assert.throws(
    () => new SourceMapConsumer(indexedMap(10_000_001)),
    /Section offset line must not exceed/,
  );
});

test('source maps apply the offset bound across nested sections', () => {
  const map = indexedMap(6_000_000, indexedMap(6_000_000));
  assert.throws(
    () => new SourceMapConsumer(map),
    /including offsets of nested sections/,
  );
});

test('PostCSS preserves CSS and source positions with a valid input map', async () => {
  const result = await postcss([]).process(css, {
    from: 'input.css',
    to: 'output.css',
    map: { prev: sourceMap(), inline: false, annotation: false },
  });

  assert.equal(result.css, css);
  const consumer = new SourceMapConsumer(result.map.toJSON());
  const original = consumer.originalPositionFor({ line: 1, column: 0 });
  assert.equal(original.source, 'study-guide.css');
  assert.equal(original.line, 1);
  assert.equal(original.column, 0);
  assert.equal(consumer.sourceContentFor(original.source), css);
});
