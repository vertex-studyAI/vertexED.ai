import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

import {
  applyNotetakerAccessibility,
  enhanceNotetakerDialog,
  installNotetakerAccessibility,
} from '../src/lib/notetakerAccessibility.mjs';

function createDom(body) {
  return new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
    pretendToBeVisual: true,
    url: 'https://www.vertexed.app/notetaker',
  });
}

function tick(window) {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

test('Notetaker accessibility controller names core study controls and live output', () => {
  const dom = createDom(`
    <div id="root">
      <input id="topic" placeholder="e.g. IB Biology — photosynthesis, or paste after generating">
      <select id="format"><option>Quick Notes</option><option>Custom</option></select>
      <input id="custom" placeholder="Describe custom format (max 64 chars)">
      <select id="length"><option>Short notes</option><option>Medium notes</option></select>
      <select id="cards"><option>4 flashcards</option><option>8 flashcards</option></select>
      <textarea id="extra" placeholder="Board, command words, equations to include, or topics to emphasise (optional)"></textarea>
      <textarea id="notes" placeholder="Notes appear here after generation — edit, then create flashcards and quiz from this text"></textarea>
      <select id="quiz-type"><option>Adaptive Learning</option><option>Exam Oriented</option></select>
      <select id="difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
      <select id="frq"><option>Short FRQ</option><option>Long FRQ</option></select>
      <select id="mcq"><option>2</option><option>3</option><option>4</option><option>5</option></select>
      <div id="quiz-status">5 questions • 2 answered</div>
      <div id="accuracy">Accuracy: 80%</div>
      <div id="words">Words: 412</div>
      <div class="overflow-auto"><button class="bg-primary/20">1</button><button>2</button></div>
      <div class="rounded-2xl">
        <div class="mb-3 break-words text-sm">Explain photosynthesis.</div>
        <textarea id="frq-answer" placeholder="Write your answer..."></textarea>
      </div>
      <div class="rounded-2xl">
        <div class="mb-3 break-words text-sm">Which organelle captures light?</div>
        <div class="space-y-2">
          <label><input type="radio" name="q_2" value="chloroplast">Chloroplast</label>
          <label><input type="radio" name="q_2" value="nucleus">Nucleus</label>
        </div>
      </div>
    </div>
  `);
  const root = dom.window.document.getElementById('root');

  applyNotetakerAccessibility(root);

  assert.equal(dom.window.document.getElementById('topic').getAttribute('aria-label'), 'Study topic or source material');
  assert.equal(dom.window.document.getElementById('format').getAttribute('aria-label'), 'Note format');
  assert.equal(dom.window.document.getElementById('custom').getAttribute('aria-label'), 'Custom note format');
  assert.equal(dom.window.document.getElementById('length').getAttribute('aria-label'), 'Note length');
  assert.equal(dom.window.document.getElementById('cards').getAttribute('aria-label'), 'Flashcard count');
  assert.equal(dom.window.document.getElementById('extra').getAttribute('aria-label'), 'Additional information');
  assert.equal(dom.window.document.getElementById('notes').getAttribute('aria-label'), 'Editable study notes');
  assert.equal(dom.window.document.getElementById('quiz-type').getAttribute('aria-label'), 'Quiz type');
  assert.equal(dom.window.document.getElementById('difficulty').getAttribute('aria-label'), 'Quiz difficulty');
  assert.equal(dom.window.document.getElementById('frq').getAttribute('aria-label'), 'Free-response length');
  assert.equal(dom.window.document.getElementById('mcq').getAttribute('aria-label'), 'Multiple-choice option count');
  assert.equal(
    dom.window.document.getElementById('frq-answer').getAttribute('aria-label'),
    'Free-response answer: Explain photosynthesis.',
  );

  const group = dom.window.document.querySelector('[role="radiogroup"]');
  assert.ok(group);
  assert.equal(group.getAttribute('aria-label'), 'Which organelle captures light?');

  for (const id of ['quiz-status', 'accuracy', 'words']) {
    const status = dom.window.document.getElementById(id);
    assert.equal(status.getAttribute('role'), 'status');
    assert.equal(status.getAttribute('aria-live'), 'polite');
    assert.equal(status.getAttribute('aria-atomic'), 'true');
  }

  const flashButtons = root.querySelectorAll('.overflow-auto button');
  assert.equal(flashButtons[0].getAttribute('aria-label'), 'Show flashcard 1');
  assert.equal(flashButtons[0].getAttribute('aria-current'), 'true');
  assert.equal(flashButtons[1].getAttribute('aria-label'), 'Show flashcard 2');
});

test('Notetaker controller preserves existing accessible names', () => {
  const dom = createDom(`
    <div id="root">
      <label for="topic">Course topic</label>
      <input id="topic" placeholder="e.g. IB Biology — photosynthesis" aria-label="Specific existing name">
    </div>
  `);
  const root = dom.window.document.getElementById('root');
  applyNotetakerAccessibility(root);
  assert.equal(dom.window.document.getElementById('topic').getAttribute('aria-label'), 'Specific existing name');
});

test('study overlays gain dialog semantics, focus containment and Escape close', () => {
  const dom = createDom(`
    <button id="opener">Study Mode</button>
    <div id="overlay" class="fixed inset-0">
      <div id="dialog">
        <button id="close"><svg class="lucide-x"></svg></button>
        <p>Spaced Repetition · Study Mode</p>
        <p>Card 1 of 2</p>
        <button id="show">Show answer</button>
      </div>
    </div>
  `);
  const { document, KeyboardEvent } = dom.window;
  const opener = document.getElementById('opener');
  const overlay = document.getElementById('overlay');
  const dialog = document.getElementById('dialog');
  const close = document.getElementById('close');
  const show = document.getElementById('show');
  opener.focus();

  let closeClicks = 0;
  close.addEventListener('click', () => { closeClicks += 1; });
  const enhanced = enhanceNotetakerDialog(overlay, opener);
  assert.ok(enhanced);

  assert.equal(dialog.getAttribute('role'), 'dialog');
  assert.equal(dialog.getAttribute('aria-modal'), 'true');
  assert.equal(dialog.getAttribute('aria-label'), 'Spaced repetition study mode');
  assert.equal(close.getAttribute('aria-label'), 'Close Spaced repetition study mode');
  assert.equal(document.activeElement, close);

  show.focus();
  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert.equal(document.activeElement, close, 'Tab from the last control wraps to the first control');

  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(closeClicks, 1, 'Escape activates the dialog close control');

  enhanced.cleanup({ restoreFocus: true });
  assert.equal(document.activeElement, opener);
});

test('installed controller enhances dynamically mounted study dialog and restores focus after removal', async () => {
  const dom = createDom('<div id="root"><button id="opener">Enlarge</button></div>');
  const { document } = dom.window;
  const root = document.getElementById('root');
  const opener = document.getElementById('opener');
  opener.focus();

  const uninstall = installNotetakerAccessibility(root);
  root.insertAdjacentHTML('beforeend', `
    <div id="overlay" class="fixed inset-0">
      <div id="dialog">
        <button id="close"><svg class="lucide-x"></svg></button>
        <div>Flashcard front</div>
        <button>Reveal</button>
        <button>Previous</button>
        <button>Next</button>
        <div>Card 1/3</div>
      </div>
    </div>
  `);

  await tick(dom.window);
  const dialog = document.getElementById('dialog');
  assert.equal(dialog.getAttribute('role'), 'dialog');
  assert.equal(dialog.getAttribute('aria-label'), 'Fullscreen flashcard study');
  assert.equal(document.getElementById('close').getAttribute('aria-label'), 'Close Fullscreen flashcard study');

  document.getElementById('overlay').remove();
  await tick(dom.window);
  assert.equal(document.activeElement, opener);
  uninstall();
});
