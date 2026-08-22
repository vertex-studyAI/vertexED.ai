import test from "node:test";
import assert from "node:assert/strict";
import {
  CADValidationError,
  DEFAULT_JET_ENGINE_PARAMETERS,
  createFlangedTubeDocument,
  createJetEngineDocument,
  documentFromPlateSpec,
  interpretNeuroCadCommand,
  serializeCADDocument,
  summarizeCADDocument,
  toOpenScadDocument,
  validateCADDocument
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";
import { parsePlatePrompt } from "../portfolio/project2424/projects/T2424-0037/src/core.mjs";

function deepNumbers(value, output = []) {
  if (typeof value === "number") output.push(value);
  else if (Array.isArray(value)) for (const entry of value) deepNumbers(entry, output);
  else if (value && typeof value === "object") for (const entry of Object.values(value)) deepNumbers(entry, output);
  return output;
}

test("default jet-engine concept validates with bounded deterministic assemblies", () => {
  const document = createJetEngineDocument();
  const diagnostics = validateCADDocument(document);
  assert.equal(diagnostics.status, "PASS");
  assert.equal(document.metadata.kind, "jet_engine_concept");
  assert.equal(document.metadata.parameters.compressorStages, 6);
  assert.equal(document.metadata.parameters.turbineStages, 2);
  assert.equal(document.assemblies.filter((a) => a.id.startsWith("compressor_stage_")).length, 6);
  assert.equal(document.assemblies.filter((a) => a.id.startsWith("turbine_stage_")).length, 2);
  assert.ok(document.objects.length < 80);
  assert.ok(deepNumbers(document).every(Number.isFinite));
});

test("supported jet-engine stage extrema remain valid", () => {
  for (const parameters of [{ compressorStages: 3, turbineStages: 1 }, { compressorStages: 12, turbineStages: 4 }]) {
    const document = createJetEngineDocument(parameters);
    assert.equal(validateCADDocument(document).status, "PASS");
  }
});

test("jet-engine parameters fail closed outside conceptual geometry limits", () => {
  assert.throws(() => createJetEngineDocument({ compressorStages: 2 }), CADValidationError);
  assert.throws(() => createJetEngineDocument({ turbineStages: 5 }), CADValidationError);
  assert.throws(() => createJetEngineDocument({ outerDiameterMm: 160, shaftDiameterMm: 80 }), /45%/);
  assert.throws(() => createJetEngineDocument({ inletLengthRatio: 0.2 }), /sum to 1.0/);
  assert.throws(() => createJetEngineDocument({ engineLengthMm: Number.NaN }), /finite number/);
});

test("natural-language jet creation and stateful follow-ups are deterministic", () => {
  let result = interpretNeuroCadCommand("Generate a simplified axial jet-engine concept with an inlet, six compressor stages, a central shaft, combustor envelope, two turbine stages, outer casing and exhaust nozzle.");
  assert.equal(result.intent, "CREATE_ASSEMBLY");
  assert.equal(result.document.metadata.parameters.compressorStages, 6);
  assert.equal(result.document.metadata.parameters.turbineStages, 2);
  const explicit = interpretNeuroCadCommand("Create an axial jet engine with eight compressor stages and three turbine stages.");
  assert.equal(explicit.document.metadata.parameters.compressorStages, 8);
  assert.equal(explicit.document.metadata.parameters.turbineStages, 3);
  result = interpretNeuroCadCommand("Increase compressor stages to 8.", result.document);
  assert.equal(result.document.metadata.parameters.compressorStages, 8);
  result = interpretNeuroCadCommand("Use only one turbine stage.", result.document);
  assert.equal(result.document.metadata.parameters.turbineStages, 1);
  result = interpretNeuroCadCommand("Hide the outer casing.", result.document);
  assert.equal(result.document.metadata.parameters.casingVisible, false);
  result = interpretNeuroCadCommand("Show exploded view.", result.document);
  assert.ok(result.document.metadata.parameters.explodedSpacingMm >= 60);
  const oldLength = result.document.metadata.parameters.engineLengthMm;
  result = interpretNeuroCadCommand("Make it longer.", result.document);
  assert.ok(result.document.metadata.parameters.engineLengthMm > oldLength);
  const oldShaft = result.document.metadata.parameters.shaftDiameterMm;
  result = interpretNeuroCadCommand("Make the shaft slightly thicker.", result.document);
  assert.ok(result.document.metadata.parameters.shaftDiameterMm > oldShaft);
  result = interpretNeuroCadCommand("Reset.", result.document);
  assert.deepEqual(result.document.metadata.parameters, DEFAULT_JET_ENGINE_PARAMETERS);
});

test("engine export produces finite generated OpenSCAD without raw source directives", () => {
  const document = createJetEngineDocument({ compressorStages: 8, turbineStages: 2, explodedSpacingMm: 70 });
  const source = toOpenScadDocument(document);
  const json = serializeCADDocument(document);
  assert.match(source, /NeuroCAD Alpha 0\.1/);
  assert.match(source, /compressor_rotor_08/);
  assert.doesNotMatch(source, /NaN|Infinity/);
  assert.doesNotMatch(source, /\bimport\s*\(|\binclude\s*<|\buse\s*</u);
  assert.doesNotMatch(json, /NaN|Infinity/);
  assert.equal(JSON.parse(json).metadata.kind, "jet_engine_concept");
});

test("flanged-tube and legacy plate adapt into the general CAD document", () => {
  const flange = createFlangedTubeDocument();
  assert.equal(validateCADDocument(flange).status, "PASS");
  assert.equal(summarizeCADDocument(flange).objectCount, 3);
  const plate = documentFromPlateSpec(parsePlatePrompt("plate 100 by 60 thickness 4 with 4 holes radius 4 inset 10"));
  assert.equal(validateCADDocument(plate).status, "PASS");
  assert.equal(plate.objects[0].type, "rectangular_plate");
  assert.match(toOpenScadDocument(plate), /difference\(\)/);
});

test("general CAD validation returns structured errors for malformed geometry and assembly cycles", () => {
  const malformed = {
    version: "neurocad-0.1", units: "mm", name: "bad",
    objects: [{ id: "bad_tube", type: "tube", name: "bad", dimensions: { outerRadius: 10, innerRadius: 12, length: 20 }, transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] } }],
    assemblies: [{ id: "a", name: "a", children: [{ kind: "assembly", ref: "b" }] }, { id: "b", name: "b", children: [{ kind: "assembly", ref: "a" }] }]
  };
  const result = validateCADDocument(malformed);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((error) => error.code === "INNER_RADIUS_EXCEEDS_OUTER_RADIUS"));
  assert.ok(result.errors.some((error) => error.code === "ASSEMBLY_CYCLE"));
  assert.equal(result.document, null);
});

test("unsupported alpha prompts fail closed instead of guessing", () => {
  assert.throws(() => interpretNeuroCadCommand("Design a certified high-performance propulsion system"), /Supported alpha commands/);
});
