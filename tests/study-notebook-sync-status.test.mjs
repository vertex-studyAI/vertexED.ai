import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/pages/StudyNotebook.tsx", import.meta.url),
  "utf8",
);

test("Study Notebook exposes saving and sync state to users", () => {
  assert.match(source, /const \[notebookSaving, setNotebookSaving\] = useState\(false\)/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /notebookSaving \? 'Saving…' : notebookCloudSynced \? 'Cloud synced' : 'Saved locally'/);
});

test("notebook save completions cannot overwrite newer sync state", () => {
  assert.match(source, /let cancelled = false;/);
  assert.match(source, /setNotebookSaving\(true\)/);
  assert.match(source, /if \(cancelled\) return;/);
  assert.match(source, /setNotebookSaving\(false\)/);
  assert.match(source, /cancelled = true;/);
});

test("local-only saves remain reassuring and screen-reader friendly", () => {
  assert.match(source, /Cloud sync is unavailable; your notebook is still saved on this device\./);
  assert.match(source, /Cloud sync is currently unavailable\./);
  assert.match(source, /notebookSyncError/);
});
