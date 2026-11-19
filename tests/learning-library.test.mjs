import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { CURRICULA, FEATURES } from '../src/content/curriculumDirectory.ts';
import { ARCHIVE_COLLECTIONS, LIBRARY_TOOLS, RESOURCE_ARTICLES } from '../src/content/resourceLibrary.ts';

test('the learning library central registries cover every publishable content surface', () => {
  assert.equal(RESOURCE_ARTICLES.length, 23);
  assert.equal(LIBRARY_TOOLS.length, 11);
  assert.equal(ARCHIVE_COLLECTIONS.length, 3);
  assert.equal(Object.keys(CURRICULA).length, 8);
  assert.equal(Object.keys(FEATURES).length, 6);
  assert.equal(Object.keys(CURRICULA).length * Object.keys(FEATURES).length, 48);

  const routes = [...RESOURCE_ARTICLES, ...LIBRARY_TOOLS, ...ARCHIVE_COLLECTIONS].map((entry) => entry.to);
  assert.equal(new Set(routes).size, routes.length, 'library registry routes must be unique');
  assert.ok(routes.every((route) => route.startsWith('/')), 'library routes must be absolute app paths');
});

test('the public learning library exposes coverage and keeps imported guides held', () => {
  const library = fs.readFileSync('src/pages/resources/Index.tsx', 'utf8');
  assert.match(library, /MYP5_CONTENT_TOTALS/);
  assert.match(library, /MYP5_SUBJECT_TOTALS/);
  assert.match(library, /CURRICULUM_ENTRIES/);
  assert.match(library, /RESOURCE_ARTICLES/);
  assert.match(library, /245 imported guide files remain held/);
  assert.doesNotMatch(library, /more subjects on the way/i);
});

test('global search is generated from the same curriculum and resource registries', () => {
  const searchIndex = fs.readFileSync('src/lib/globalSearchIndex.ts', 'utf8');
  assert.match(searchIndex, /CURRICULA, FEATURES/);
  assert.match(searchIndex, /ARCHIVE_COLLECTIONS, LIBRARY_TOOLS, RESOURCE_ARTICLES/);
  assert.match(searchIndex, /Object\.entries\(CURRICULA\)\.flatMap/);
  assert.match(searchIndex, /RESOURCE_ARTICLES\.map/);
});

test('every editorial guide registry route remains mounted', () => {
  const routes = fs.readFileSync('src/app/App.tsx', 'utf8');
  for (const article of RESOURCE_ARTICLES) {
    assert.match(routes, new RegExp(`path=["']${article.to.slice(1).replaceAll('/', '\\/')}["']`), `${article.to} must stay routed`);
  }
});

test('anonymous foundation learners are sent to the mounted login route before device saving', () => {
  const reader = fs.readFileSync('src/pages/resources/FoundationLessons.tsx', 'utf8');
  const routes = fs.readFileSync('src/app/App.tsx', 'utf8');
  assert.match(reader, /<Link to="\/login">Sign in<\/Link> to save on this device/);
  assert.match(routes, /<Route path="login" element=\{<Login \/>\} \/>/);
});
