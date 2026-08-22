import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../portfolio/project2424/projects/T2424-0037/web/", import.meta.url);
const text = (name) => readFile(new URL(name, root), "utf8");

test("alpha page exposes the demo workstation and honest export surface", async () => {
  const html = await text("index.html");
  for (const id of ["viewport", "assembly-tree", "parameter-form", "diagnostics", "cadspec", "export-json", "export-scad", "toggle-casing", "toggle-exploded"]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.match(html, /Language[^<]*→[^<]*Engineering Geometry/);
  assert.match(html, /conceptual\/educational geometry demonstration/i);
  assert.doesNotMatch(html, /STL[^<]*(?:download|export) button/i);
  assert.doesNotMatch(html, /STEP[^<]*(?:download|export) button/i);
});

test("browser app treats generated text as data and contains no dynamic-code execution", async () => {
  const app = await text("app.mjs");
  assert.match(app, /OrbitControls/);
  assert.match(app, /interpretNeuroCadCommand/);
  assert.match(app, /validateCADDocument/);
  assert.match(app, /textContent/);
  assert.doesNotMatch(app, /\.innerHTML\s*=/);
  assert.doesNotMatch(app, /\beval\s*\(/);
  assert.doesNotMatch(app, /\bFunction\s*\(/);
  assert.doesNotMatch(app, /child_process|execSync|spawnSync|shell:/);
});

test("browser dependency is version-pinned instead of floating latest", async () => {
  const html = await text("index.html");
  assert.match(html, /three@0\.179\.1/);
  assert.doesNotMatch(html, /three@latest/);
});
