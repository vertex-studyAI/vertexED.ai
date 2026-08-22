import test from "node:test";
import assert from "node:assert/strict";
import { interpretCADCommand, normalizeEngineeringCommand } from "../portfolio/project2424/projects/T2424-0037/src/language.mjs";

test("engineering command adapter normalizes bounded number words", () => {
  assert.equal(
    normalizeEngineeringCommand("Generate a jet engine with six compressor stages and two turbine stages"),
    "Generate a jet engine with 6 compressor stages and 2 turbine stages"
  );
  assert.equal(
    normalizeEngineeringCommand("Generate a jet engine with six compressor stages and two turbine stages", true),
    "Generate a jet engine with 6 compressor stages and 2 turbine stages"
  );
  assert.equal(
    normalizeEngineeringCommand("Use only one turbine stage", true),
    "turbine stages to 1"
  );
});

test("hero prompt supports spelled stage counts", () => {
  const result = interpretCADCommand("Generate a simplified axial jet engine concept with six compressor stages and two turbine stages");
  assert.equal(result.document.metadata.jetEngineParams.compressorStages, 6);
  assert.equal(result.document.metadata.jetEngineParams.turbineStages, 2);
});

test("new creation preserves non-default stage counts even with a current document", () => {
  const current = interpretCADCommand("Generate a jet engine concept with 6 compressor stages and 2 turbine stages").document;
  const recreated = interpretCADCommand("Generate a jet engine concept with eight compressor stages and three turbine stages", current);
  assert.equal(recreated.intent, "CREATE_ASSEMBLY");
  assert.equal(recreated.document.metadata.jetEngineParams.compressorStages, 8);
  assert.equal(recreated.document.metadata.jetEngineParams.turbineStages, 3);
});

test("stateful follow-up supports 'use only one turbine stage'", () => {
  const created = interpretCADCommand("Generate a jet engine concept with 6 compressor stages and 2 turbine stages");
  const changed = interpretCADCommand("Use only one turbine stage", created.document);
  assert.equal(changed.intent, "MODIFY_PARAMETER");
  assert.equal(changed.document.metadata.jetEngineParams.turbineStages, 1);
});

test("hide then show casing restores CAD object visibility", () => {
  const created = interpretCADCommand("Generate a jet engine concept with 6 compressor stages and 2 turbine stages");
  const hidden = interpretCADCommand("Hide the outer casing", created.document);
  assert.equal(hidden.document.objects.find((object) => object.id === "outer_casing").visible, false);
  assert.equal(hidden.view.casingVisible, false);

  const shown = interpretCADCommand("Show the outer casing", hidden.document);
  assert.equal(shown.document.objects.find((object) => object.id === "outer_casing").visible, true);
  assert.equal(shown.view.casingVisible, true);
});

test("mechanical preset routes through the same public command adapter", () => {
  const result = interpretCADCommand("Create a flanged tube concept length 210 mm outer radius 38 mm wall thickness 4 mm");
  assert.equal(result.intent, "CREATE_ASSEMBLY");
  assert.equal(result.document.name, "Flanged Tube Concept");
  assert.equal(result.document.metadata.mechanicalParams.lengthMm, 210);
});
