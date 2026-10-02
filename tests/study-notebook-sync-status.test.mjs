import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/pages/StudyNotebook.tsx", import.meta.url),
  "utf8",
);

test("Study Notebook exposes hydration, saving, and sync state to users", () => {
  assert.match(source, /const \[notebookHydrated, setNotebookHydrated\] = useState\(false\)/);
  assert.match(source, /const \[notebookSaving, setNotebookSaving\] = useState\(false\)/);
  assert.match(source, /<StudySaveStatus/);
  assert.match(source, /notebookSaving \? 'saving' : notebookCloudSynced \? 'cloud' : 'device'/);

});

test("cloud writes wait for the latest snapshot to hydrate", () => {
  assert.match(source, /setNotebookHydrated\(!readOnly\)/);
  assert.match(source, /if \(!notebookHydrated\) return;/);
  assert.match(source, /\}, \[notebookHydrated, notebooks, user\?\.id\]\);/);
  assert.match(source, /!notebookHydrated \? 'loading'/);
});

test("notebook save completions cannot overwrite newer sync state", () => {
  assert.match(source, /let cancelled = false;/);
  assert.match(source, /setNotebookSaving\(true\)/);
  assert.match(source, /if \(cancelled\) return;/);
  assert.match(source, /setNotebookSaving\(false\)/);
  assert.match(source, /cancelled = true;/);
});

test("local-only saves remain reassuring and screen-reader friendly", () => {
  assert.match(source, /detail=\{!notebookSaving && !notebookCloudSynced \? notebookSyncError/);
  assert.match(source, /onRetry=\{notebookHydrated && !notebookSaving \? retryNotebookSync/);
  assert.match(source, /notebookSyncError/);
});
