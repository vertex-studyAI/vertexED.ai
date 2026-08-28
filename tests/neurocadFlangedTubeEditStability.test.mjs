import test from "node:test";
import assert from "node:assert/strict";
import {
  interpretNeuroCadCommand,
  serializeCADDocument,
  validateCADDocument
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";

function byId(document, id) {
  return document.objects.find((object) => object.id === id);
}

function snapshot(document) {
  const tube = byId(document, "tube_body");
  const flange = byId(document, "front_flange");
  return {
    length: tube.dimensions.length,
    outerRadius: tube.dimensions.outerRadius,
    wallThickness: tube.dimensions.outerRadius - tube.dimensions.innerRadius,
    flangeOuterRadius: flange.dimensions.outerRadius,
    flangeThickness: flange.dimensions.length
  };
}

function createBase() {
  return interpretNeuroCadCommand(
    "Create a flanged tube 200 mm long with outer diameter 100 mm, 5 mm wall thickness, flange diameter 130 mm, and 12 mm flange thickness."
  ).document;
}

const validFamilies = [
  { key: "length", values: [160, 180, 220, 240], prompt: (v) => `Set tube length to ${v} mm.` },
  { key: "outerRadius", values: [42, 46, 52, 56], prompt: (v) => `Set tube outer radius to ${v} mm.` },
  { key: "outerRadius", values: [84, 92, 104, 112], expected: (v) => v / 2, prompt: (v) => `Set tube OD to ${v} mm.` },
  { key: "wallThickness", values: [3, 4, 6, 8], prompt: (v) => `Set wall thickness to ${v} mm.` },
  { key: "flangeOuterRadius", values: [58, 62, 70, 78], prompt: (v) => `Set flange outer radius to ${v} mm.` },
  { key: "flangeOuterRadius", values: [116, 124, 140, 156], expected: (v) => v / 2, prompt: (v) => `Set flange OD to ${v} mm.` },
  { key: "flangeThickness", values: [8, 10, 14, 18], prompt: (v) => `Set flange thickness to ${v} mm.` }
];

test("NeuroCAD flanged-tube edits preserve independent parameters across >=100 deterministic perturbations", () => {
  let count = 0;
  for (let repeat = 0; repeat < 4; repeat += 1) {
    for (const family of validFamilies) {
      for (const value of family.values) {
        const before = createBase();
        const beforeSnapshot = snapshot(before);
        const result = interpretNeuroCadCommand(family.prompt(value), before);
        assert.equal(result.intent, "EDIT_ASSEMBLY");
        assert.equal(result.diagnostics.status, "PASS");
        assert.equal(validateCADDocument(result.document).status, "PASS");
        const after = snapshot(result.document);
        assert.equal(after[family.key], family.expected ? family.expected(value) : value);
        for (const key of Object.keys(beforeSnapshot)) {
          if (key !== family.key) assert.equal(after[key], beforeSnapshot[key]);
        }
        count += 1;
      }
    }
  }
  assert.ok(count >= 100, `expected >=100 deterministic perturbations, got ${count}`);
});

test("OD aliases are semantically equivalent to explicit diameter forms", () => {
  const base = createBase();
  const tubeAlias = interpretNeuroCadCommand("Set tube OD to 108 mm.", base).document;
  const tubeExplicit = interpretNeuroCadCommand("Set tube outer diameter to 108 mm.", base).document;
  assert.deepEqual(tubeAlias, tubeExplicit);
  const flangeAlias = interpretNeuroCadCommand("Set flange OD to 148 mm.", base).document;
  const flangeExplicit = interpretNeuroCadCommand("Set flange outer diameter to 148 mm.", base).document;
  assert.deepEqual(flangeAlias, flangeExplicit);
});

test("serialize/reload/edit regeneration retains the edited parameter source", () => {
  const edited = interpretNeuroCadCommand("Set tube length to 236 mm and flange thickness to 16 mm.", createBase()).document;
  const reloaded = JSON.parse(serializeCADDocument(edited));
  assert.deepEqual(snapshot(reloaded), snapshot(edited));
  const regenerated = interpretNeuroCadCommand("Set wall thickness to 7 mm.", reloaded).document;
  assert.equal(snapshot(regenerated).length, 236);
  assert.equal(snapshot(regenerated).flangeThickness, 16);
  assert.equal(snapshot(regenerated).wallThickness, 7);
});

const invalidPrompts = [
  "Set tube length to -1 mm.",
  "Set tube length to 0 mm.",
  "Set tube outer radius to -2 mm.",
  "Set tube OD to -4 mm.",
  "Set wall thickness to -1 mm.",
  "Set flange outer radius to 40 mm.",
  "Set wall thickness to 60 mm.",
  "Set flange outer radius to -3 mm.",
  "Set flange OD to -6 mm.",
  "Set flange thickness to -2 mm.",
  "Set flange thickness to 0 mm.",
  "Set outer radius to 40 mm and outer diameter to 100 mm.",
  "Set flange outer radius to 60 mm and flange outer diameter to 140 mm."
];

test("invalid/conflicting edits fail closed without mutating retained state in >=25 deterministic cases", () => {
  let count = 0;
  for (let repeat = 0; repeat < 2; repeat += 1) {
    for (const prompt of invalidPrompts) {
      const base = createBase();
      const before = serializeCADDocument(base);
      assert.throws(() => interpretNeuroCadCommand(prompt, base));
      assert.equal(serializeCADDocument(base), before);
      count += 1;
    }
  }
  assert.ok(count >= 25, `expected >=25 invalid/conflicting perturbations, got ${count}`);
});
