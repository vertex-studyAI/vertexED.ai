import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePlatePrompt,
  summarizeSpec,
  toOpenScad,
  toSvg
} from "../portfolio/new-projects/nlp-to-cad/src/core.mjs";

test("controlled language compiles a four-hole plate deterministically", () => {
  const spec = parsePlatePrompt("plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6");
  assert.equal(spec.width, 80);
  assert.equal(spec.height, 40);
  assert.equal(spec.thickness, 3);
  assert.deepEqual(spec.holes, [
    { x: 6, y: 6, radius: 2 },
    { x: 74, y: 6, radius: 2 },
    { x: 74, y: 34, radius: 2 },
    { x: 6, y: 34, radius: 2 }
  ]);
});

test("diameter prompts normalize to radius and two-hole diagonal layout", () => {
  const spec = parsePlatePrompt("panel 100 x 60 thick 4 with 2 holes diameter 8 edge offset 10");
  assert.equal(spec.holes.length, 2);
  assert.deepEqual(spec.holes, [
    { x: 10, y: 10, radius: 4 },
    { x: 90, y: 50, radius: 4 }
  ]);
});

test("OpenSCAD output contains bounded subtractive geometry", () => {
  const spec = parsePlatePrompt("bracket 50 by 30 thickness 5 with 1 hole radius 3 inset 8");
  const source = toOpenScad(spec);
  assert.match(source, /difference\(\)/);
  assert.match(source, /cube\(\[50, 30, 5\]/);
  assert.match(source, /translate\(\[25, 15, -1\]\) cylinder\(h=7, r=3/);
  assert.doesNotMatch(source, /import|include|use\s*</);
});

test("SVG preview and geometry summary agree with the parsed spec", () => {
  const spec = parsePlatePrompt("rectangle 20 by 10 thickness 2");
  const svg = toSvg(spec, { scale: 2 });
  const summary = summarizeSpec(spec);
  assert.match(svg, /width="40" height="20"/);
  assert.equal(summary.holeCount, 0);
  assert.equal(summary.remainingPlanarAreaMm2, 200);
  assert.equal(summary.approximateVolumeMm3, 400);
});

test("unsupported and unsafe geometry fails closed", () => {
  assert.throws(() => parsePlatePrompt("gear diameter 80 with 12 teeth"), /supported prompts/);
  assert.throws(() => parsePlatePrompt("plate 80 by 40 with 3 holes radius 2 inset 6"), /1, 2, or 4 holes/);
  assert.throws(() => parsePlatePrompt("plate 80 by 40 with 4 holes radius 10 inset 5"), /inset must exceed/);
  assert.throws(() => parsePlatePrompt("plate 5000 by 40"), /safety envelope/);
});
