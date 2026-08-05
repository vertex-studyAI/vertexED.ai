import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const notebookSource = await readFile(
  new URL("../src/pages/StudyNotebook.tsx", import.meta.url),
  "utf8",
);
const modalSource = await readFile(
  new URL("../src/components/AccessibleModal.tsx", import.meta.url),
  "utf8",
);

test("Study Notebook source preview reuses the shared accessible modal", () => {
  assert.match(notebookSource, /import AccessibleModal from '@\/components\/AccessibleModal'/);
  assert.match(notebookSource, /titleId="notebook-source-preview-title"/);
  assert.match(notebookSource, /descriptionId="notebook-source-preview-description"/);
  assert.match(notebookSource, /overlayClassName="notebook-modal-backdrop"/);
  assert.match(notebookSource, /className="notebook-modal"/);
  assert.match(notebookSource, /onClose={() => setPreviewSourceId\(null\)}/);
  assert.doesNotMatch(
    notebookSource,
    /className="notebook-modal-backdrop" role="dialog" aria-modal="true"/,
  );
});

test("source preview exposes a named close control and scrollable content", () => {
  assert.match(notebookSource, /id="notebook-source-preview-title"/);
  assert.match(notebookSource, /id="notebook-source-preview-description"/);
  assert.match(notebookSource, /aria-label={`Close preview for \${previewSource\.title}`}/);
  assert.match(notebookSource, /<X className="h-5 w-5" aria-hidden \/>/);
  assert.match(notebookSource, /<pre[\s\S]*tabIndex={0}[\s\S]*{previewSource\.content}/);
});

test("shared modal traps focus, closes on Escape, and restores the opener", () => {
  assert.match(modalSource, /event\.key === "Escape"/);
  assert.match(modalSource, /trapModalFocus\(event, dialogRef\.current\)/);
  assert.match(modalSource, /restoreModalFocus\(returnTarget\)/);
  assert.match(modalSource, /focusInitialModalElement/);
});
