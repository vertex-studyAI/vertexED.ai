import test from "node:test";
import assert from "node:assert/strict";
import {
  createJetEngineDocument,
  createPlateDocument,
  interpretPrompt,
  serializeCADDocument,
  summarizeDocument,
  toAssemblyOpenScad,
  validateCADDocument,
  validateCADObject,
  validateJetEngineParams
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";
import { toOpenScad, validatePlateSpec } from "../portfolio/project2424/projects/T2424-0037/src/core.mjs";

test("direct plate renderers reject injection-shaped numeric values", () => {
  const malicious = { type: "rectangular_plate", units: "mm", width: "80]); import(\"evil.stl\");", height: 40, thickness: 3, holes: [] };
  assert.throws(() => validatePlateSpec(malicious), /finite positive number/);
  assert.throws(() => toOpenScad(malicious), /finite positive number/);
});

test("primitive validation rejects impossible tube and unsafe identifiers", () => {
  assert.throws(() => validateCADObject({ id: "tube", type: "tube", params: { outerRadius: 20, innerRadius: 21, length: 50 } }), /less than outerRadius/);
  assert.throws(() => validateCADObject({ id: "bad;import", type: "cylinder", params: { radius: 2, length: 4 } }), /safe identifier/);
});

test("default jet engine is a validated multi-part assembly", () => {
  const document = createJetEngineDocument();
  assert.equal(document.name, "Turbojet Concept");
  assert.equal(document.metadata.jetEngineParams.compressorStages, 6);
  assert.equal(document.metadata.jetEngineParams.turbineStages, 2);
  assert.ok(document.objects.length >= 18);
  assert.equal(document.assemblies.length, 1);
  assert.ok(document.objects.some((entry) => entry.id === "outer_casing"));
  assert.ok(document.objects.some((entry) => entry.id === "central_shaft"));
  assert.ok(document.objects.some((entry) => entry.id === "exhaust_nozzle"));
  assert.equal(summarizeDocument(document).validation, "PASS");
});

test("jet engine stage bounds and shaft/casing proportions fail closed", () => {
  assert.throws(() => validateJetEngineParams({ compressorStages: 2 }), /\[3, 12\]/);
  assert.throws(() => validateJetEngineParams({ compressorStages: 13 }), /\[3, 12\]/);
  assert.throws(() => validateJetEngineParams({ turbineStages: 0 }), /\[1, 4\]/);
  assert.throws(() => validateJetEngineParams({ outerDiameterMm: 300, shaftDiameterMm: 130 }), /below 40%/);
  assert.throws(() => validateJetEngineParams({ inletLengthRatio: 0.2 }), /sum to 1.0/);
});

test("jet engine generator handles deterministic minimum and maximum stage configurations", () => {
  for (const params of [
    { compressorStages: 3, turbineStages: 1 },
    { compressorStages: 12, turbineStages: 4 },
    { compressorStages: 8, turbineStages: 2, engineLengthMm: 1200, outerDiameterMm: 360, shaftDiameterMm: 50 }
  ]) {
    const document = createJetEngineDocument(params);
    validateCADDocument(document);
    const serialized = serializeCADDocument(document);
    assert.doesNotMatch(serialized, /NaN|Infinity/);
  }
});

test("jet engine prompt creates assembly and parses stage counts", () => {
  const result = interpretPrompt("Generate a simplified jet engine concept with 8 compressor stages and 3 turbine stages");
  assert.equal(result.intent, "CREATE_ASSEMBLY");
  assert.equal(result.document.metadata.jetEngineParams.compressorStages, 8);
  assert.equal(result.document.metadata.jetEngineParams.turbineStages, 3);
});

test("follow-up commands regenerate document state and view state", () => {
  const created = interpretPrompt("Generate a jet engine concept with 6 compressor stages and 2 turbine stages");
  const increased = interpretPrompt("Increase compressor stages to 9", created.document);
  assert.equal(increased.intent, "MODIFY_PARAMETER");
  assert.equal(increased.document.metadata.jetEngineParams.compressorStages, 9);

  const hidden = interpretPrompt("Hide the outer casing", increased.document);
  assert.equal(hidden.view.casingVisible, false);
  assert.equal(hidden.document.objects.find((entry) => entry.id === "outer_casing").visible, false);

  const exploded = interpretPrompt("Show exploded view", hidden.document);
  assert.equal(exploded.view.exploded, true);
});

test("plate workflow is wrapped in the alpha CAD document without changing bounded grammar", () => {
  const document = createPlateDocument("plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6");
  assert.equal(document.objects.length, 1);
  assert.equal(document.objects[0].type, "rectangular_plate");
  assert.equal(document.objects[0].params.holes.length, 4);
});

test("assembly OpenSCAD is numeric-only and contains conceptual engine primitives", () => {
  const document = createJetEngineDocument({ compressorStages: 5, turbineStages: 1 });
  const scad = toAssemblyOpenScad(document);
  assert.match(scad, /NON-MANUFACTURING/);
  assert.match(scad, /difference\(\)/);
  assert.match(scad, /for\(a=\[/);
  assert.doesNotMatch(scad, /eval\(|import\(|include\s*</u);
  assert.doesNotMatch(scad, /NaN|Infinity/);
});

test("document validator rejects duplicate IDs, dangling assemblies and object-count abuse", () => {
  const base = createJetEngineDocument({ compressorStages: 3, turbineStages: 1 });
  assert.throws(() => validateCADDocument({ ...base, objects: [...base.objects, base.objects[0]] }), /duplicate CAD object id/);
  assert.throws(() => validateCADDocument({ ...base, assemblies: [{ id: "bad", name: "Bad", children: ["missing"] }] }), /references missing object/);
  assert.throws(() => validateCADDocument({ ...base, objects: Array.from({ length: 257 }, (_, index) => ({ id: `x_${index}`, type: "cylinder", params: { radius: 1, length: 1 } })) }), /1-256/);
});
