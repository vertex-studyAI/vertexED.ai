import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/pages/StudyNotebook.tsx", import.meta.url),
  "utf8",
);
const importer = await readFile(new URL('../src/components/notebook/SourceFileImport.tsx', import.meta.url), 'utf8');

test("Study Notebook text controls have programmatic names", () => {
  assert.match(source, /aria-label="Source title"/);
  assert.match(source, /aria-label="Source content"/);
  assert.match(importer, /aria-label="Choose a source file"/);
  assert.match(source, /aria-label="Notebook title"/);
});

test("Study Notebook icon controls have explicit contextual names", () => {
  assert.match(source, /aria-label={`Preview \${src\.title}`}/);
  assert.match(source, /aria-label={`Remove \${src\.title}`}/);
  assert.match(importer, /Import a source file<\/strong>/);
  assert.match(source, /aria-label="Import saved work as a source"/);
  assert.match(importer, /<Upload className="h-5 w-5 shrink-0" aria-hidden \/>/);
  assert.match(source, /<BookOpen className="h-3\.5 w-3\.5" aria-hidden \/>/);
});

test("the selected notebook exposes its pressed state", () => {
  assert.match(source, /aria-pressed={nb\.id === activeId}/);
});
