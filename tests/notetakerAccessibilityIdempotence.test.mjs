import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

import { applyNotetakerAccessibility } from '../src/lib/notetakerAccessibility.mjs';

test('Notetaker accessibility augmentation is idempotent across repeated React mutations', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="root">
      <input id="topic" placeholder="e.g. IB Biology — photosynthesis">
      <div id="progress">4 questions • 1 answered</div>
      <div class="rounded-2xl">
        <div class="mb-3 break-words text-sm">State one function of mitochondria.</div>
        <textarea id="answer" placeholder="Write your answer..."></textarea>
      </div>
    </div>
  </body></html>`);
  const root = dom.window.document.getElementById('root');

  applyNotetakerAccessibility(root);
  const first = {
    topicName: dom.window.document.getElementById('topic').getAttribute('aria-label'),
    answerName: dom.window.document.getElementById('answer').getAttribute('aria-label'),
    progressRole: dom.window.document.getElementById('progress').getAttribute('role'),
    progressLive: dom.window.document.getElementById('progress').getAttribute('aria-live'),
  };

  applyNotetakerAccessibility(root);
  const second = {
    topicName: dom.window.document.getElementById('topic').getAttribute('aria-label'),
    answerName: dom.window.document.getElementById('answer').getAttribute('aria-label'),
    progressRole: dom.window.document.getElementById('progress').getAttribute('role'),
    progressLive: dom.window.document.getElementById('progress').getAttribute('aria-live'),
  };

  assert.deepEqual(second, first);
  assert.deepEqual(first, {
    topicName: 'Study topic or source material',
    answerName: 'Free-response answer: State one function of mitochondria.',
    progressRole: 'status',
    progressLive: 'polite',
  });
});
