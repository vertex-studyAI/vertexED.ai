import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import {
  focusInitialModalElement,
  getModalFocusableElements,
  restoreModalFocus,
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

test('initial focus can announce a requested heading without adding it to the Tab sequence', () => {
  const { dom, document, dialog, first, last } = fixture();
  try {
    const heading = document.createElement('h2');
    heading.tabIndex = -1;
    heading.textContent = 'Mock exam';
    dialog.prepend(heading);

    assert.equal(focusInitialModalElement(dialog, heading) === heading, true, 'requested heading receives initial focus');
    assert.equal(document.activeElement === heading, true, 'heading is the active element');
    assert.deepEqual(getModalFocusableElements(dialog), [first, last]);
    trapModalFocus({ key: 'Tab', preventDefault() {} }, dialog);
    assert.equal(document.activeElement, first);
    trapModalFocus({ key: 'Tab', shiftKey: true, preventDefault() {} }, dialog);
    assert.equal(document.activeElement, last);
  } finally {
    dom.window.close();
  }
});

test('requested programmatic focus still rejects unavailable or outside targets', () => {
  const { dom, document, dialog, first, opener } = fixture();
  try {
    dialog.insertAdjacentHTML('afterbegin', `
      <h2 id="plain-title">Not programmatically focusable</h2>
      <h2 id="hidden-title" tabindex="-1" hidden>Hidden</h2>
      <h2 id="invisible-title" tabindex="-1" style="visibility:hidden">Invisible</h2>
      <div inert><h2 id="inert-title" tabindex="-1">Inert</h2></div>
      <div aria-hidden="true"><h2 id="aria-hidden-title" tabindex="-1">Hidden from assistive technology</h2></div>
      <button id="disabled-preference" tabindex="-1" disabled>Disabled</button>
    `);
    for (const id of ['plain-title', 'hidden-title', 'invisible-title', 'inert-title', 'aria-hidden-title', 'disabled-preference']) {
      assert.equal(focusInitialModalElement(dialog, document.getElementById(id)), first, id);
      assert.equal(document.activeElement, first, id);
    }
    assert.equal(focusInitialModalElement(dialog, opener), first, 'outside the modal');
    assert.equal(document.activeElement, first);
  } finally {
    dom.window.close();
  }
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

test('restoration reports a refused focus attempt instead of claiming success', () => {
  const { dom, opener, last } = fixture();
  try {
    last.focus();
    opener.focus = () => {};
    assert.equal(restoreModalFocus(opener), false);
  } finally { dom.window.close(); }
});

test('restoration rejects unavailable targets before invoking focus', () => {
  const { dom, opener } = fixture();
  try {
    let attempts = 0;
    opener.focus = () => { attempts++; };
    opener.disabled = true;
    assert.equal(restoreModalFocus(opener), false);
    opener.disabled = false;
    opener.parentElement.setAttribute('inert', '');
    assert.equal(restoreModalFocus(opener), false);
    assert.equal(attempts, 0);
  } finally { dom.window.close(); }
});

test('Tab from an answer field explicitly reaches buttons even when the browser would skip them', () => {
  const dom = new JSDOM('<div id="dialog"><button id="exit">Exit</button><textarea id="answer"></textarea><button id="submit">Submit</button></div>');
  const document = dom.window.document;
  const dialog = document.getElementById('dialog');
  const answer = document.getElementById('answer');
  const submit = document.getElementById('submit');
  let prevented = false;
  answer.focus();
  assert.equal(trapModalFocus({ key: 'Tab', preventDefault: () => { prevented = true; } }, dialog), true);
  assert.equal(prevented, true, 'native WebKit tab filtering must not move focus outside the dialog');
  assert.equal(document.activeElement, submit);
  trapModalFocus({ key: 'Tab', shiftKey: true, preventDefault() {} }, dialog);
  assert.equal(document.activeElement, answer);
});

test('explicit tab navigation skips CSS-hidden and disabled controls with a tab index', () => {
  const dom = new JSDOM('<div id="dialog"><input id="answer"><div style="display:none"><button>Collapsed</button></div><button style="visibility:hidden">Hidden</button><button disabled tabindex="0">Disabled</button><button id="save">Save</button></div>');
  const document = dom.window.document;
  const answer = document.getElementById('answer');
  const save = document.getElementById('save');
  const dialog = document.getElementById('dialog');
  assert.deepEqual(getModalFocusableElements(dialog), [answer, save]);
  answer.focus();
  trapModalFocus({ key: 'Tab', preventDefault() {} }, dialog);
  assert.equal(document.activeElement, save);
});

test('explicit tab navigation preserves positive tab index order before ordinary controls', () => {
  const dom = new JSDOM('<div id="dialog"><button id="ordinary">Ordinary</button><button id="second" tabindex="2">Second</button><button id="first" tabindex="1">First</button></div>');
  const document = dom.window.document;
  const dialog = document.getElementById('dialog');
  const first = document.getElementById('first');
  const second = document.getElementById('second');
  const ordinary = document.getElementById('ordinary');
  assert.deepEqual(getModalFocusableElements(dialog), [first, second, ordinary]);
  first.focus();
  trapModalFocus({ key: 'Tab', preventDefault() {} }, dialog);
  assert.equal(document.activeElement, second);
});

test('a consumed Tab and non-Tab editing keys keep their existing focus behavior', () => {
  const { document, dialog, first } = fixture();
  first.focus();
  let prevented = false;
  for (const event of [{ key: 'Tab', defaultPrevented: true }, { key: 'ArrowRight' }]) {
    assert.equal(trapModalFocus({ ...event, preventDefault: () => { prevented = true; } }, dialog), false);
    assert.equal(document.activeElement, first);
  }
  assert.equal(prevented, false);
});
