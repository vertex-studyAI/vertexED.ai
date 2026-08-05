import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/pages/StudyNotebook.tsx", import.meta.url),
  "utf8",
);

test("Study Notebook text controls have programmatic names", () => {
  assert.match(source, /aria-label="Source title"/);
  assert.match(source, /aria-label="Source content"/);
  assert.match(source, /aria-label="Choose a source file"/);
  assert.match(source, /aria-label="Notebook title"/);
});

test("Study Notebook icon controls have explicit contextual names", () => {
  assert.match(source, /aria-label={`Preview \${src\.title}`}/);
  assert.match(source, /aria-label={`Remove \${src\.title}`}/);
  assert.match(source, /aria-label="Upload a text, Markdown, or CSV source"/);
  assert.match(source, /aria-label="Import saved work as a source"/);
  assert.match(source, /<Upload className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(source, /<BookOpen className="h-3\.5 w-3\.5" aria-hidden \/>/);
});

test("the selected notebook exposes its pressed state", () => {
  assert.match(source, /aria-pressed={nb\.id === activeId}/);
});
