import test from "node:test";
import assert from "node:assert/strict";
import { createCADDocument, validateCADDocument } from "../src/cad.mjs";
import { createJetEngineConcept, updateJetEngineConcept, validateJetEngineParameters } from "../src/jet-engine.mjs";
import { serializeCADDocument, toSceneDescription } from "../src/render3d.mjs";

test("general CAD document validates supported primitives", () => {
  const document = createCADDocument({
    name: "tube demo",
    objects: [{ id: "tube", type: "tube", outerRadius: 30, innerRadius: 25, length: 120, visible: true }]
  });
  assert.equal(validateCADDocument(document).status, "PASS");
});

test("CAD validation fails closed on malformed and unsafe geometry", () => {
  const bad = { version: "neurocad-0.1", units: "mm", name: "bad", objects: [
    { id: "bad_tube", type: "tube", outerRadius: 20, innerRadius: 25, length: 10 },
    { id: "bad_stage", type: "blade_ring", hubRadius: 30, tipRadius: 20, length: 5, bladeThickness: 2, bladeCount: 1000 }
  ] };
  const result = validateCADDocument(bad);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((item) => item.code === "INNER_RADIUS_EXCEEDS_OUTER_RADIUS"));
  assert.ok(result.errors.some((item) => item.code === "INVALID_BLADE_COUNT"));
});

test("default jet engine concept is a valid bounded assembly", () => {
  const document = createJetEngineConcept();
  assert.equal(document.assemblies.length, 1);
  assert.equal(document.metadata.parameters.compressorStages, 6);
  assert.equal(document.metadata.parameters.turbineStages, 2);
  assert.ok(document.objects.some((object) => object.id === "outer_casing"));
  assert.ok(document.objects.some((object) => object.id === "exhaust_nozzle"));
  assert.equal(validateCADDocument(document).status, "PASS");
});

test("jet engine supports documented min and max stage counts", () => {
  for (const params of [
    { compressorStages: 3, turbineStages: 1 },
    { compressorStages: 12, turbineStages: 4 }
  ]) {
    const document = createJetEngineConcept(params);
    assert.equal(document.metadata.parameters.compressorStages, params.compressorStages);
    assert.equal(document.metadata.parameters.turbineStages, params.turbineStages);
  }
});

test("jet engine rejects unsafe parameter combinations", () => {
  assert.throws(() => validateJetEngineParameters({ compressorStages: 2 }), /compressorStages/);
  assert.throws(() => validateJetEngineParameters({ turbineStages: 5 }), /turbineStages/);
  assert.throws(() => validateJetEngineParameters({ outerDiameterMm: 100, shaftDiameterMm: 60 }), /shaftDiameterMm/);
  assert.throws(() => validateJetEngineParameters({ engineLengthMm: -1 }), /engineLengthMm/);
});

test("editing regenerates deterministic document state", () => {
  const original = createJetEngineConcept();
  const updated = updateJetEngineConcept(original, { compressorStages: 9, turbineStages: 1 });
  assert.equal(updated.metadata.parameters.compressorStages, 9);
  assert.equal(updated.metadata.parameters.turbineStages, 1);
  assert.ok(updated.objects.length > original.objects.length);
});

test("scene and CADSpec serialization contain no non-finite numeric output", () => {
  const document = createJetEngineConcept();
  const scene = toSceneDescription(document);
  const serialized = serializeCADDocument(document);
  assert.equal(scene.objects.length, document.objects.length);
  assert.ok(!serialized.includes("NaN"));
  assert.ok(!serialized.includes("Infinity"));
});
