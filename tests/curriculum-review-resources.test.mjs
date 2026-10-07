import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveReviewImage, reviewResourceUrl } from '../src/lib/curriculumReviewResources.mjs';

const diagram = { id: 'diagram.png', path: 'sources/physics/diagram.png', kind: 'image' };
const nested = { id: 'nested diagram.png', path: 'sources/physics/figures/nested diagram.png', kind: 'image' };
const document = { id: 'teacher.pdf', path: 'sources/physics/teacher.pdf', kind: 'pdf' };
const resources = [diagram, nested, document];
const source = 'sources/physics/lesson.md';

test('resolves sibling, dot and encoded nested references to exact retained images', () => {
  assert.equal(resolveReviewImage(resources, source, 'diagram.png'), diagram);
  assert.equal(resolveReviewImage(resources, source, './diagram.png'), diagram);
  assert.equal(resolveReviewImage(resources, source, 'figures/nested%20diagram.png'), nested);
  assert.equal(resolveReviewImage(resources, 'sources/physics/sections/lesson.md', '../diagram.png'), diagram);
});

test('does not fetch external, absolute, opaque or malformed Markdown image targets', () => {
  for (const target of ['https://tracker.example/diagram.png', '//tracker.example/diagram.png', '/diagram.png', 'data:image/png;base64,AAAA', 'file:///diagram.png', 'blob:source', 'javascript:alert(1)', '\\diagram.png', 'diagram.png?token=private', 'diagram.png#ref', '%', 'diagram.png%00', '%2f%2ftracker.example/diagram.png', ' diagram.png']) {
    assert.equal(resolveReviewImage(resources, source, target), null, target);
  }
});

test('a relative path cannot select another packet, undeclared file, document or ambiguous resource', () => {
  assert.equal(resolveReviewImage(resources, source, '../other/diagram.png'), null);
  assert.equal(resolveReviewImage(resources, source, '../../secret.png'), null);
  assert.equal(resolveReviewImage(resources, source, 'missing.png'), null);
  assert.equal(resolveReviewImage(resources, source, 'teacher.pdf'), null);
  assert.equal(resolveReviewImage([...resources, { ...diagram, id: 'duplicate' }], source, 'diagram.png'), null);
});

test('authenticated resource requests use one same-origin endpoint with escaped identity values', () => {
  const url = new URL(reviewResourceUrl('physics&action=list', '../diagram image.png?#'), 'https://vertexed.example');
  assert.equal(url.origin, 'https://vertexed.example');
  assert.equal(url.pathname, '/api/curriculum-review');
  assert.equal(url.searchParams.get('action'), 'resource');
  assert.equal(url.searchParams.get('packet'), 'physics&action=list');
  assert.equal(url.searchParams.get('resource'), '../diagram image.png?#');
  assert.equal(url.searchParams.size, 3);
});
