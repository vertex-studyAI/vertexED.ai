import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/pages/UserSettings.tsx", import.meta.url), "utf8");

test("the Font size label is explicitly associated with its select", () => {
  assert.match(source, /<label\s+htmlFor="settings-font-size">Font size<\/label>/);
  assert.match(source, /<select\s+id="settings-font-size"[\s\S]*?value=\{a11y\.fontSize\}/);
});
