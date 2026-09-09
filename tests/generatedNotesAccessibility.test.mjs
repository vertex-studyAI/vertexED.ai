import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

import { applyNotetakerAccessibility } from '../src/lib/notetakerAccessibility.mjs';

function createDom(body) {
  return new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
    url: 'https://www.vertexed.app/notetaker',
  });
}

test('generated study notes preview is exposed as a named region', () => {
  const dom = createDom(`
    <div id="root">
      <div id="preview" class="max-h-[28rem] overflow-auto rounded-2xl border border-border/60 bg-background/80 p-4">
        <h2>Photosynthesis</h2>
        <p>Generated notes appear here.</p>
      </div>
    </div>
  `);
  const root = dom.window.document.getElementById('root');
  const preview = dom.window.document.getElementById('preview');

  applyNotetakerAccessibility(root);
  applyNotetakerAccessibility(root);

  assert.equal(preview.getAttribute('role'), 'region');
  assert.equal(preview.getAttribute('aria-label'), 'Generated study notes preview');
  assert.equal(preview.getAttribute('data-vertexed-generated-notes-region'), 'true');
});

test('generated notes region preserves an existing accessible name', () => {
  const dom = createDom(`
    <div id="root">
      <div id="preview" aria-label="Teacher-reviewed notes" class="max-h-[28rem] overflow-auto rounded-2xl border">
        Reviewed content
      </div>
    </div>
  `);
  const root = dom.window.document.getElementById('root');
  const preview = dom.window.document.getElementById('preview');

  applyNotetakerAccessibility(root);

  assert.equal(preview.getAttribute('role'), 'region');
  assert.equal(preview.getAttribute('aria-label'), 'Teacher-reviewed notes');
});
