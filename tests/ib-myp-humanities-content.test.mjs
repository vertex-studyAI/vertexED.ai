import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const guide = fs.readFileSync("src/pages/resources/IBMYPHumanitiesGuide.tsx", "utf8");
const directory = fs.readFileSync("src/pages/CurriculumToolsIndex.tsx", "utf8");
const app = fs.readFileSync("src/app/App.tsx", "utf8");
const curriculum = fs.readFileSync("src/lib/curriculum.ts", "utf8");

test("IB MYP Humanities guide is routed and discoverable", () => {
  assert.match(app, /resources\/ib-myp-humanities-guide/);
  assert.match(directory, /Open the Humanities answer studio/);
  assert.match(guide, /Research question/);
  assert.match(guide, /OPVL/);
  assert.match(guide, /Answer plan/);
});

test("learner-supplied Humanities content keeps its evidence boundary visible", () => {
  assert.match(guide, /learner-supplied Humanities notes/);
  assert.match(guide, /not official IB guidance/);
  assert.match(guide, /Nothing entered here is saved or sent to an AI provider/);
  assert.doesNotMatch(guide, /guarantee(?:s|d)? full marks/i);
  assert.doesNotMatch(guide, /the IB loves/i);
});

test("IB MYP metadata does not cross-reference DP-only TOK", () => {
  const mypBlock = curriculum.match(/IB_MYP:\s*\{[\s\S]*?\n\s*\},\n\s*IB_DP:/)?.[0] ?? "";
  assert.doesNotMatch(mypBlock, /TOK/);
  assert.match(mypBlock, /Inquiry and source evaluation/);
});
