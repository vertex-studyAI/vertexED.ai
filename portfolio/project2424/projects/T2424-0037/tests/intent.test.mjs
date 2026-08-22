import test from "node:test";
import assert from "node:assert/strict";
import { parseIntent } from "../src/intent.mjs";
import { createJetEngineConcept } from "../src/jet-engine.mjs";

test("jet engine prompt becomes a bounded create-assembly intent", () => {
  const intent = parseIntent("Generate a simplified axial jet engine concept with six compressor stages and two turbine stages.");
  assert.equal(intent.type, "CREATE_ASSEMBLY");
  assert.equal(intent.assembly, "jet_engine_concept");
  assert.equal(intent.parameters.compressorStages, 6);
  assert.equal(intent.parameters.turbineStages, 2);
});

test("follow-up commands retain document context", () => {
  const document = createJetEngineConcept();
  assert.deepEqual(parseIntent("Increase compressor stages to 8", document), { type: "MODIFY_PARAMETER", patch: { compressorStages: 8 } });
  assert.deepEqual(parseIntent("Hide the outer casing", document), { type: "SET_VISIBILITY", target: "outer_casing", visible: false });
  assert.deepEqual(parseIntent("Show exploded view", document), { type: "SET_VIEW_MODE", mode: "exploded" });
  assert.equal(parseIntent("Make the engine longer", document).type, "MODIFY_PARAMETER");
});

test("unsupported language fails closed", () => {
  assert.throws(() => parseIntent("Design an arbitrary manufacturable rocket engine"), /unsupported alpha command/);
});
