import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import {
  focusInitialModalElement,
  getModalFocusableElements,
  restoreModalFocus,
  restoreModalFocusWithRetry,
  trapModalFocus,
} from '../src/lib/modalFocus.mjs';

function fixture() {
  const dom = new JSDOM(`
    <button id="opener">Open</button>
    <div id="dialog" tabindex="-1">
      <input id="first" />
      <button id="disabled" disabled>Disabled</button>
      <div aria-hidden="true"><button id="hidden">Hidden</button></div>
      <button id="last">Save</button>
    </div>
  `, { pretendToBeVisual: true });
  const document = dom.window.document;
  return {
    dom,
    document,
    opener: document.getElementById('opener'),
    dialog: document.getElementById('dialog'),
    first: document.getElementById('first'),
    last: document.getElementById('last'),
  };
}

test('modal focus list excludes disabled and hidden controls', () => {
  const { dialog, first, last } = fixture();
  assert.deepEqual(getModalFocusableElements(dialog), [first, last]);
});

test('initial focus prefers the requested element inside the modal', () => {
  const { document, dialog, last } = fixture();
  assert.equal(focusInitialModalElement(dialog, last), last);
  assert.equal(document.activeElement, last);
});

test('Tab and Shift+Tab wrap inside the modal', () => {
  const { document, dialog, first, last } = fixture();
  let prevented = false;

  last.focus();
  assert.equal(
    trapModalFocus({ key: 'Tab', shiftKey: false, preventDefault: () => { prevented = true; } }, dialog),
    true,
  );
  assert.equal(prevented, true);
  assert.equal(document.activeElement, first);

  prevented = false;
  first.focus();
  assert.equal(
    trapModalFocus({ key: 'Tab', shiftKey: true, preventDefault: () => { prevented = true; } }, dialog),
    true,
  );
  assert.equal(prevented, true);
  assert.equal(document.activeElement, last);
});

test('focus outside a modal is pulled back into its tab sequence', () => {
  const { document, opener, dialog, first } = fixture();
  opener.focus();
  trapModalFocus({ key: 'Tab', shiftKey: false, preventDefault: () => {} }, dialog);
  assert.equal(document.activeElement, first);
});

test('closing a modal restores focus to the connected invoking control', () => {
  const { document, opener, last } = fixture();
  last.focus();
  assert.equal(restoreModalFocus(opener), true);
  assert.equal(document.activeElement, opener);
});

test('focus restoration reports a browser that ignores the focus request', () => {
  const { document, opener, last } = fixture();
  last.focus();
  opener.focus = () => {};

  assert.equal(restoreModalFocus(opener), false);
  assert.equal(document.activeElement, last);
});

test('focus restoration retries once on the next frame after an ignored request', () => {
  const { document, opener, last } = fixture();
  last.focus();
  const focus = opener.focus.bind(opener);
  let focusCalls = 0;
  let scheduled;
  opener.focus = () => {
    focusCalls += 1;
    if (focusCalls > 1) focus();
  };

  assert.equal(restoreModalFocusWithRetry(opener, callback => { scheduled = callback; }), false);
  assert.equal(document.activeElement, last);
  assert.equal(focusCalls, 1);
  assert.equal(typeof scheduled, 'function');

  scheduled();
  assert.equal(document.activeElement, opener);
  assert.equal(focusCalls, 2);
});
