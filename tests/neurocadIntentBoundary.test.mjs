import test from "node:test";
import assert from "node:assert/strict";
import {
  interpretNeuroCadCommand,
  validateCADDocument
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";

test("flanged-tube intent preserves explicit dimensions instead of silently using defaults", () => {
  const result = interpretNeuroCadCommand(
    "Create a flanged tube 200 mm long with outer diameter 100 mm, 5 mm wall thickness, flange diameter 130 mm, and 12 mm flange thickness."
  );
  assert.equal(result.intent, "CREATE_ASSEMBLY");
  assert.equal(result.diagnostics.status, "PASS");
  assert.equal(validateCADDocument(result.document).status, "PASS");

  const byId = Object.fromEntries(result.document.objects.map((object) => [object.id, object]));
  assert.equal(byId.tube_body.dimensions.length, 200);
  assert.equal(byId.tube_body.dimensions.outerRadius, 50);
  assert.equal(byId.tube_body.dimensions.innerRadius, 45);
  assert.equal(byId.front_flange.dimensions.outerRadius, 65);
  assert.equal(byId.front_flange.dimensions.innerRadius, 45);
  assert.equal(byId.front_flange.dimensions.length, 12);
  assert.deepEqual(byId.front_flange.transform.position, [-94, 0, 0]);
  assert.deepEqual(byId.rear_flange.transform.position, [94, 0, 0]);
});

test("invalid signed flanged-tube dimensions fail closed instead of falling back to defaults", () => {
  assert.throws(
    () => interpretNeuroCadCommand("Create a flanged tube with length -20 mm and outer diameter 100 mm."),
    /must be > 0/
  );
});

test("conflicting radius and diameter language is rejected as ambiguous", () => {
  assert.throws(
    () => interpretNeuroCadCommand("Create a flanged tube with outer radius 40 mm and outer diameter 100 mm."),
    /Conflicting tube outer radius and diameter values/
  );
});

test("unsupported bracket language fails closed rather than being misrepresented as a plate", () => {
  assert.throws(
    () => interpretNeuroCadCommand("Create a simple L-bracket 100 by 60 mm."),
    /Brackets are not supported in NeuroCAD Alpha 0\.1/
  );
});

test("supported rectangular plate language remains available through the guarded interpreter", () => {
  const result = interpretNeuroCadCommand("plate 100 by 60 thickness 4 with 4 holes radius 4 inset 10");
  assert.equal(result.intent, "CREATE_OBJECT");
  assert.equal(result.diagnostics.status, "PASS");
  assert.equal(result.document.objects[0].type, "rectangular_plate");
});
