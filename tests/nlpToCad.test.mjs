import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePlatePrompt,
  summarizeSpec,
  toOpenScad,
  toSvg,
  validatePlateSpec
} from "../portfolio/project2424/projects/T2424-0037/src/core.mjs";

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

test("signed-negative numeric prompts fail closed instead of losing the sign", () => {
  assert.throws(() => parsePlatePrompt("plate -80 by 40 thickness 3"), /negative numeric values/);
  assert.throws(() => parsePlatePrompt("plate 80 by 40 thickness -3"), /negative numeric values/);
  assert.throws(() => parsePlatePrompt("plate 80 by 40 with 1 hole radius -2 inset 6"), /negative numeric values/);
  assert.throws(() => parsePlatePrompt("plate 80 by 40 with 1 hole radius 2 inset -6"), /negative numeric values/);
});

test("direct CAD specs are normalized only after strict schema and numeric validation", () => {
  const input = {
    type: "rectangular_plate",
    units: "mm",
    width: 80,
    height: 40,
    thickness: 3,
    holes: [{ x: 10, y: 10, radius: 2 }]
  };
  const validated = validatePlateSpec(input);
  assert.deepEqual(validated, input);
  assert.notEqual(validated, input);
  assert.notEqual(validated.holes, input.holes);
});

test("direct renderer entrypoints reject string/source-injection geometry", () => {
  const malicious = {
    type: "rectangular_plate",
    units: "mm",
    width: "80]); import(\"evil.stl\"); cube([1,1,1",
    height: 40,
    thickness: 3,
    holes: []
  };
  assert.throws(() => validatePlateSpec(malicious), /finite positive number/);
  assert.throws(() => toOpenScad(malicious), /finite positive number/);
  assert.throws(() => toSvg(malicious), /finite positive number/);
  assert.throws(() => summarizeSpec(malicious), /finite positive number/);
});

test("direct CAD specs reject out-of-bounds and overlapping holes", () => {
  assert.throws(
    () => validatePlateSpec({
      type: "rectangular_plate",
      units: "mm",
      width: 20,
      height: 10,
      thickness: 2,
      holes: [{ x: 1, y: 5, radius: 2 }]
    }),
    /fit fully inside/
  );

  assert.throws(
    () => validatePlateSpec({
      type: "rectangular_plate",
      units: "mm",
      width: 20,
      height: 10,
      thickness: 2,
      holes: [
        { x: 5, y: 5, radius: 2 },
        { x: 8, y: 5, radius: 2 }
      ]
    }),
    /must not overlap/
  );
});

test("direct CAD specs require explicit millimetre units and supported hole counts", () => {
  assert.throws(
    () => validatePlateSpec({
      type: "rectangular_plate",
      width: 20,
      height: 10,
      thickness: 2,
      holes: []
    }),
    /units must be 'mm'/
  );

  assert.throws(
    () => validatePlateSpec({
      type: "rectangular_plate",
      units: "mm",
      width: 30,
      height: 20,
      thickness: 2,
      holes: [
        { x: 5, y: 5, radius: 1 },
        { x: 15, y: 5, radius: 1 },
        { x: 25, y: 5, radius: 1 }
      ]
    }),
    /0, 1, 2, or 4 holes/
  );
});
