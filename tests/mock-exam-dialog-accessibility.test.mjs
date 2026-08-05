import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

import {
  getModalFocusableElements,
  getWrappedFocusTarget,
  isModalCloseKey,
} from "../src/lib/modalDialogA11y.mjs";

test("modal focus discovery excludes disabled and hidden controls", () => {
  const dom = new JSDOM(`
    <div id="dialog">
      <button id="first">First</button>
      <button id="disabled" disabled>Disabled</button>
      <a id="link" href="/next">Next</a>
      <button id="hidden" hidden>Hidden</button>
      <textarea id="answer"></textarea>
    </div>
  `);
  const previousHTMLElement = globalThis.HTMLElement;
  globalThis.HTMLElement = dom.window.HTMLElement;

  try {
    const dialog = dom.window.document.getElementById("dialog");
    assert.deepEqual(
      getModalFocusableElements(dialog).map((element) => element.id),
      ["first", "link", "answer"],
    );
  } finally {
    globalThis.HTMLElement = previousHTMLElement;
    dom.window.close();
  }
});

test("modal tab navigation wraps only at focus boundaries", () => {
  assert.equal(getWrappedFocusTarget({ activeIndex: 0, count: 3, shiftKey: true }), 2);
  assert.equal(getWrappedFocusTarget({ activeIndex: 2, count: 3, shiftKey: false }), 0);
  assert.equal(getWrappedFocusTarget({ activeIndex: 1, count: 3, shiftKey: false }), -1);
  assert.equal(getWrappedFocusTarget({ activeIndex: -1, count: 3, shiftKey: false }), 0);
  assert.equal(getWrappedFocusTarget({ activeIndex: -1, count: 3, shiftKey: true }), 2);
  assert.equal(getWrappedFocusTarget({ activeIndex: 0, count: 0, shiftKey: false }), -1);
});

test("Escape is the only modal close key", () => {
  assert.equal(isModalCloseKey("Escape"), true);
  assert.equal(isModalCloseKey("Enter"), false);
  assert.equal(isModalCloseKey("Tab"), false);
});

test("mock exam exposes the WAI-ARIA dialog and generated-content contracts", async () => {
  const source = await readFile(
    new URL("../src/components/MockExamMode.tsx", import.meta.url),
    "utf8",
  );
  const hookSource = await readFile(
    new URL("../src/hooks/useModalDialogA11y.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="mock-exam-title"/);
  assert.match(source, /role="timer"/);
  assert.match(source, /aria-label={`Go to question/);
  assert.match(source, /<label htmlFor="mock-exam-answer"/);
  assert.match(source, /aria-expanded={showRubric}/);
  assert.match(hookSource, /event\.key !== 'Tab'/);
  assert.match(hookSource, /onCloseRef\.current\(\)/);
  assert.match(hookSource, /previousFocus\?\.isConnected/);
});
