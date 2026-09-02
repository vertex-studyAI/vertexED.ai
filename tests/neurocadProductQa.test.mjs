import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  createFlangedTubeDocument,
  createJetEngineDocument,
  documentFromPlateSpec,
  serializeCADDocument,
  toOpenScadDocument,
  validateCADDocument
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";
import {
  NEUROCAD_VERSION,
  makeAssembly,
  makeObject,
  objectRef,
  assemblyRef
} from "../portfolio/project2424/projects/T2424-0037/src/alpha/schema.mjs";
import { parsePlatePrompt } from "../portfolio/project2424/projects/T2424-0037/src/core.mjs";

const ARTIFACT_JSON = resolve("artifacts/neurocad-alpha/product-qa.json");
const ARTIFACT_MD = resolve("artifacts/neurocad-alpha/NEUROCAD_ALPHA_PRODUCT_QA.md");

function rootDocument(name, objects, assemblies, metadata = {}) {
  return {
    version: NEUROCAD_VERSION,
    units: "mm",
    name,
    objects,
    assemblies,
    metadata: { rootAssemblyId: assemblies.at(-1)?.id ?? null, productQa: true, ...metadata }
  };
}

function certifyValid(category, id, build) {
  const started = performance.now();
  try {
    const document = build();
    const diagnostics = validateCADDocument(document);
    assert.equal(diagnostics.status, "PASS", `${category}/${id} schema validation failed`);
    const serialized = serializeCADDocument(document);
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.version, NEUROCAD_VERSION);
    const scad = toOpenScadDocument(document);
    assert.ok(scad.length > 80, `${category}/${id} generated empty SCAD`);
    assert.doesNotMatch(scad, /\b(?:NaN|Infinity)\b/u, `${category}/${id} emitted non-finite geometry`);
    return {
      category,
      id,
      expected: "PASS",
      parseSuccess: true,
      schemaValid: true,
      geometryGenerated: true,
      serializationValid: true,
      failClosedCorrect: null,
      durationMs: Number((performance.now() - started).toFixed(3)),
      error: null
    };
  } catch (error) {
    return {
      category,
      id,
      expected: "PASS",
      parseSuccess: false,
      schemaValid: false,
      geometryGenerated: false,
      serializationValid: false,
      failClosedCorrect: null,
      durationMs: Number((performance.now() - started).toFixed(3)),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function certifyRejected(id, action) {
  const started = performance.now();
  let rejected = false;
  let message = null;
  try {
    const value = action();
    if (value?.status === "FAIL") {
      rejected = true;
      message = value.errors?.map((entry) => entry.code).join(", ") ?? "FAIL diagnostics";
    }
  } catch (error) {
    rejected = true;
    message = error instanceof Error ? error.message : String(error);
  }
  return {
    category: "malformed_adversarial",
    id,
    expected: "REJECT",
    parseSuccess: null,
    schemaValid: null,
    geometryGenerated: false,
    serializationValid: false,
    failClosedCorrect: rejected,
    durationMs: Number((performance.now() - started).toFixed(3)),
    error: rejected ? null : `unsafe input '${id}' was accepted`,
    diagnostic: message
  };
}

function plateCases() {
  return Array.from({ length: 25 }, (_, index) => {
    const width = 70 + index * 4;
    const height = 45 + (index % 5) * 6;
    const thickness = 2 + (index % 4);
    const holeCount = [0, 1, 2, 4][index % 4];
    const radius = 2 + (index % 2);
    const inset = 8 + (index % 3);
    const holes = holeCount ? ` with ${holeCount} holes radius ${radius} inset ${inset}` : "";
    return {
      id: `plate-${String(index + 1).padStart(2, "0")}`,
      build: () => documentFromPlateSpec(parsePlatePrompt(`plate ${width} by ${height} thickness ${thickness}${holes}`))
    };
  });
}

function tubeCylinderCases() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `tube-cylinder-${String(index + 1).padStart(2, "0")}`,
    build: () => {
      const even = index % 2 === 0;
      const object = even
        ? makeObject("body", "cylinder", "Cylinder", { radius: 12 + index, length: 70 + index * 5 })
        : makeObject("body", "tube", "Tube", { outerRadius: 24 + index, innerRadius: 12 + index * 0.4, length: 75 + index * 4 });
      return rootDocument(`QA ${even ? "cylinder" : "tube"} ${index + 1}`, [object], [makeAssembly("root", "Root", [objectRef("body")], { root: true })], { kind: even ? "cylinder_qa" : "tube_qa" });
    }
  }));
}

function flangeCases() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `flange-${String(index + 1).padStart(2, "0")}`,
    build: () => createFlangedTubeDocument({
      length: 120 + index * 8,
      outerRadius: 28 + (index % 7) * 3,
      wallThickness: 3 + (index % 3),
      flangeOuterRadius: 48 + (index % 7) * 4,
      flangeThickness: 7 + (index % 4)
    })
  }));
}

function assemblyCases() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `assembly-${String(index + 1).padStart(2, "0")}`,
    build: () => {
      const radius = 16 + index;
      const objects = [
        makeObject("shaft", "cylinder", "Shaft", { radius: radius * 0.3, length: 80 + index * 3 }),
        makeObject("ring", "ring", "Ring", { outerRadius: radius, innerRadius: radius * 0.55, length: 8 + (index % 4) }),
        makeObject("nozzle", "frustum", "Frustum", { startRadius: radius * 0.9, endRadius: radius * 0.6, length: 35 + index })
      ];
      const sub = makeAssembly("subassembly", "Subassembly", [objectRef("ring"), objectRef("nozzle")], { qa: true });
      const root = makeAssembly("root", "Root", [objectRef("shaft"), assemblyRef("subassembly")], { root: true });
      return rootDocument(`QA nested assembly ${index + 1}`, objects, [sub, root], { kind: "assembly_qa" });
    }
  }));
}

function jetCases() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `jet-${String(index + 1).padStart(2, "0")}`,
    build: () => createJetEngineDocument({
      engineLengthMm: 520 + index * 45,
      outerDiameterMm: 220 + (index % 6) * 45,
      shaftDiameterMm: 28 + (index % 5) * 9,
      compressorStages: 3 + (index % 10),
      turbineStages: 1 + (index % 4),
      casingVisible: index % 3 !== 0,
      explodedSpacingMm: (index % 5) * 30
    })
  }));
}

function malformedCases() {
  const base = () => rootDocument("malformed", [makeObject("body", "cylinder", "Body", { radius: 10, length: 20 })], [makeAssembly("root", "Root", [objectRef("body")], { root: true })]);
  return [
    ["negative-engine-length", () => createJetEngineDocument({ engineLengthMm: -1 })],
    ["nan-engine-length", () => createJetEngineDocument({ engineLengthMm: Number.NaN })],
    ["infinite-engine-length", () => createJetEngineDocument({ engineLengthMm: Number.POSITIVE_INFINITY })],
    ["zero-outer-diameter", () => createJetEngineDocument({ outerDiameterMm: 0 })],
    ["shaft-too-large", () => createJetEngineDocument({ outerDiameterMm: 200, shaftDiameterMm: 100 })],
    ["million-compressor-stages", () => createJetEngineDocument({ compressorStages: 1_000_000 })],
    ["negative-turbine-stages", () => createJetEngineDocument({ turbineStages: -1 })],
    ["fractional-stage-count", () => createJetEngineDocument({ compressorStages: 6.5 })],
    ["exploded-spacing-over-limit", () => createJetEngineDocument({ explodedSpacingMm: 181 })],
    ["bad-ratio-sum", () => createJetEngineDocument({ inletLengthRatio: 0.25 })],
    ["wrong-version", () => validateCADDocument({ ...base(), version: "neurocad-999" })],
    ["wrong-units", () => validateCADDocument({ ...base(), units: "inch" })],
    ["unsupported-primitive", () => validateCADDocument({ ...base(), objects: [{ ...base().objects[0], type: "gear" }] })],
    ["nan-object-radius", () => validateCADDocument({ ...base(), objects: [makeObject("body", "cylinder", "Body", { radius: Number.NaN, length: 20 })] })],
    ["inner-radius-exceeds-outer", () => validateCADDocument(rootDocument("bad tube", [makeObject("body", "tube", "Body", { outerRadius: 20, innerRadius: 21, length: 40 })], [makeAssembly("root", "Root", [objectRef("body")])]))],
    ["missing-object-reference", () => validateCADDocument(rootDocument("bad ref", [makeObject("body", "cylinder", "Body", { radius: 10, length: 20 })], [makeAssembly("root", "Root", [objectRef("missing")])]))],
    ["assembly-self-reference", () => validateCADDocument(rootDocument("self ref", [makeObject("body", "cylinder", "Body", { radius: 10, length: 20 })], [makeAssembly("root", "Root", [assemblyRef("root")])]))],
    ["assembly-cycle", () => validateCADDocument(rootDocument("cycle", [makeObject("body", "cylinder", "Body", { radius: 10, length: 20 })], [makeAssembly("a", "A", [assemblyRef("b")]), makeAssembly("b", "B", [assemblyRef("a")])]))],
    ["prototype-shaped-document", () => validateCADDocument(Object.assign(Object.create({ polluted: true }), base()))],
    ["non-object-document", () => validateCADDocument([base()])]
  ].map(([id, action]) => ({ id, action }));
}

function markdownReport(result) {
  const categoryRows = Object.entries(result.categories).map(([name, summary]) => `| ${name} | ${summary.total} | ${summary.passed} | ${summary.failed} |`).join("\n");
  return `# NeuroCAD Alpha 0.1 — Product QA\n\nGenerated mechanically by \`tests/neurocadProductQa.test.mjs\`. This is **product QA**, not a scientific/OOD benchmark.\n\n- Total cases: **${result.total}**\n- Passed: **${result.passed}**\n- Failed: **${result.failed}**\n- Result: **${result.failed === 0 ? "PASS" : "FAIL"}**\n\n| Category | Cases | Passed | Failed |\n|---|---:|---:|---:|\n${categoryRows}\n\n## Measures\n\nValid cases require schema validation, non-empty finite OpenSCAD generation, and JSON serialization. Adversarial cases pass only when the system rejects them or returns structured FAIL diagnostics.\n\n## Scope\n\nNo result here establishes manufacturing validity, propulsion performance, airworthiness, thermodynamic correctness, structural correctness, or scientific superiority.\n`;
}

test("NeuroCAD Alpha deterministic 125-case product QA matrix", () => {
  const records = [];
  for (const item of plateCases()) records.push(certifyValid("plate", item.id, item.build));
  for (const item of tubeCylinderCases()) records.push(certifyValid("tube_cylinder", item.id, item.build));
  for (const item of flangeCases()) records.push(certifyValid("flange_component", item.id, item.build));
  for (const item of assemblyCases()) records.push(certifyValid("assembly", item.id, item.build));
  for (const item of jetCases()) records.push(certifyValid("jet_engine", item.id, item.build));
  for (const item of malformedCases()) records.push(certifyRejected(item.id, item.action));

  assert.equal(records.length, 125);
  const categories = {};
  for (const record of records) {
    const passed = record.error === null && (record.expected === "PASS" || record.failClosedCorrect === true);
    const summary = categories[record.category] ??= { total: 0, passed: 0, failed: 0 };
    summary.total += 1;
    if (passed) summary.passed += 1; else summary.failed += 1;
  }
  const failedRecords = records.filter((record) => record.error !== null || (record.expected === "REJECT" && record.failClosedCorrect !== true));
  const result = {
    schema: "neurocad-product-qa-0.1",
    kind: "PRODUCT_QA_NOT_SCIENTIFIC_BENCHMARK",
    total: records.length,
    passed: records.length - failedRecords.length,
    failed: failedRecords.length,
    categories,
    records
  };

  // The ordinary test suite must be read-only. Runtime timings are inherently
  // machine-dependent and must not dirty a checkout merely because CI ran.
  // Refresh the retained human-readable evidence only through an explicit run.
  if (process.env.UPDATE_NEUROCAD_PRODUCT_QA === "1") {
    mkdirSync(dirname(ARTIFACT_JSON), { recursive: true });
    writeFileSync(ARTIFACT_JSON, `${JSON.stringify(result, null, 2)}\n`);
    writeFileSync(ARTIFACT_MD, markdownReport(result));
  }

  assert.deepEqual(failedRecords.map((record) => ({ id: record.id, error: record.error })), []);
});
