import test from "node:test";
import assert from "node:assert/strict";
import { createFlangedTubeDocument, interpretMechanicalPrompt } from "../portfolio/project2424/projects/T2424-0037/src/mechanical.mjs";
import { serializeCADDocument, toAssemblyOpenScad, validateCADDocument } from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";

test("flanged tube preset is a valid three-part generic CAD assembly", () => {
  const document = createFlangedTubeDocument();
  assert.equal(document.name, "Flanged Tube Concept");
  assert.equal(document.objects.length, 3);
  assert.deepEqual(document.objects.map((object) => object.id), ["tube_body", "flange_left", "flange_right"]);
  assert.equal(document.assemblies[0].children.length, 3);
  assert.doesNotThrow(() => validateCADDocument(document));
});

test("flanged tube parameter validation fails closed", () => {
  assert.throws(() => createFlangedTubeDocument({ outerRadiusMm: 20, wallThicknessMm: 15 }), /wallThicknessMm/);
  assert.throws(() => createFlangedTubeDocument({ outerRadiusMm: 40, flangeRadiusMm: 39 }), /flangeRadiusMm/);
  assert.throws(() => createFlangedTubeDocument({ lengthMm: 20, flangeThicknessMm: 11 }), /flange thickness/);
  assert.throws(() => createFlangedTubeDocument({ lengthMm: -1 }), /finite positive/);
});

test("bounded mechanical language extracts supported dimensions", () => {
  const document = interpretMechanicalPrompt("Create a flanged tube concept length 240 mm outer radius 42 mm wall thickness 6 mm");
  assert.equal(document.metadata.mechanicalParams.lengthMm, 240);
  assert.equal(document.metadata.mechanicalParams.outerRadiusMm, 42);
  assert.equal(document.metadata.mechanicalParams.wallThicknessMm, 6);
  assert.equal(interpretMechanicalPrompt("make a sphere"), null);
});

test("flanged tube exports stable CADSpec and numeric OpenSCAD", () => {
  const document = createFlangedTubeDocument({ lengthMm: 180, outerRadiusMm: 36, wallThicknessMm: 4, flangeRadiusMm: 58 });
  const json = serializeCADDocument(document);
  const scad = toAssemblyOpenScad(document);
  assert.match(json, /"Flanged Tube Concept"/);
  assert.match(scad, /difference\(\)/);
  assert.doesNotMatch(scad, /NaN|Infinity|eval\(|import\(/u);
});
