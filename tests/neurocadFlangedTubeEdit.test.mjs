import test from "node:test";
import assert from "node:assert/strict";
import {
  interpretNeuroCadCommand,
  serializeCADDocument,
  toOpenScadDocument,
  validateCADDocument
} from "../portfolio/project2424/projects/T2424-0037/src/alpha.mjs";

function byId(document, id) {
  return document.objects.find((object) => object.id === id);
}

test("flanged tube supports deterministic parameter edits and regeneration", () => {
  const created = interpretNeuroCadCommand(
    "Create a flanged tube 200 mm long with outer diameter 100 mm, 5 mm wall thickness, flange diameter 130 mm, and 12 mm flange thickness."
  );
  assert.equal(created.intent, "CREATE_ASSEMBLY");
  assert.equal(created.diagnostics.status, "PASS");

  const edited = interpretNeuroCadCommand(
    "Set tube length to 240 mm and wall thickness to 6 mm.",
    created.document
  );
  assert.equal(edited.intent, "EDIT_ASSEMBLY");
  assert.equal(edited.diagnostics.status, "PASS");
  assert.equal(validateCADDocument(edited.document).status, "PASS");

  const tube = byId(edited.document, "tube_body");
  const front = byId(edited.document, "front_flange");
  const rear = byId(edited.document, "rear_flange");
  assert.equal(tube.dimensions.length, 240);
  assert.equal(tube.dimensions.outerRadius, 50);
  assert.equal(tube.dimensions.innerRadius, 44);
  assert.equal(front.dimensions.outerRadius, 65);
  assert.equal(front.dimensions.length, 12);
  assert.deepEqual(front.transform.position, [-114, 0, 0]);
  assert.deepEqual(rear.transform.position, [114, 0, 0]);

  const resizedFlange = interpretNeuroCadCommand(
    "Set flange outer diameter to 150 mm and flange thickness to 14 mm.",
    edited.document
  );
  assert.equal(byId(resizedFlange.document, "tube_body").dimensions.outerRadius, 50);
  assert.equal(byId(resizedFlange.document, "front_flange").dimensions.outerRadius, 75);
  assert.equal(byId(resizedFlange.document, "front_flange").dimensions.length, 14);

  const repeated = interpretNeuroCadCommand(
    "Set flange outer diameter to 150 mm and flange thickness to 14 mm.",
    edited.document
  );
  assert.deepEqual(repeated.document, resizedFlange.document);

  const json = serializeCADDocument(resizedFlange.document);
  const scad = toOpenScadDocument(resizedFlange.document);
  assert.equal(JSON.parse(json).metadata.kind, "flanged_tube");
  assert.match(scad, /tube_body/);
  assert.match(scad, /front_flange/);
  assert.doesNotMatch(scad, /\b(?:NaN|Infinity)\b/u);
});

test("invalid flanged tube edits fail closed instead of retaining stale geometry", () => {
  const created = interpretNeuroCadCommand("Create a flanged tube 200 mm long with outer diameter 100 mm.");
  assert.throws(
    () => interpretNeuroCadCommand("Set tube length to -20 mm.", created.document),
    /must be > 0/
  );
});

test("ambiguous flanged tube edit dimensions remain rejected", () => {
  const created = interpretNeuroCadCommand("Create a flanged tube 200 mm long with outer diameter 100 mm.");
  assert.throws(
    () => interpretNeuroCadCommand("Set outer radius to 40 mm and outer diameter to 100 mm.", created.document),
    /Conflicting tube outer radius and diameter values/
  );
});
