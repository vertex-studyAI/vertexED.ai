import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evidenceFiles, generateManifest } from "../scripts/generate-neurocad-release-manifest.mjs";

const read = (relativePath) => readFile(new URL("../" + relativePath, import.meta.url), "utf8");

test("NeuroCAD release manifest deterministically binds every current evidence file", async () => {
  const retained = JSON.parse(await read("portfolio/project2424/projects/T2424-0037/RELEASE_MANIFEST_20260831.json"));
  const generated = await generateManifest();

  assert.deepEqual(retained, generated);
  assert.equal(Object.keys(retained.artifacts).length, evidenceFiles.length);
  assert.equal(retained.preprint_ready, false);
  assert.equal(
    retained.scientific_status,
    "VALIDATION_DOMINANT_TYPED_PARSER_CAUSALITY_FALSIFIED_ON_REUSED_DIAGNOSTIC"
  );
  for (const entry of Object.values(retained.artifacts)) {
    assert.match(entry.sha256, /^[0-9a-f]{64}$/);
    assert.ok(entry.bytes > 0);
  }
});

test("NeuroCAD release evidence preserves the frozen falsification and stop rules", async () => {
  const [table, manuscript, protocol, result, claimAudit, readiness, identity] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0037/TABLE_DATA_20260829.json").then(JSON.parse),
    read("portfolio/project2424/projects/T2424-0037/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0037/NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md"),
    read("portfolio/project2424/projects/T2424-0037/NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md"),
    read("portfolio/project2424/projects/T2424-0037/CLAIM_AUDIT_20260829.md"),
    read("portfolio/project2424/projects/T2424-0037/PREPRINT_READINESS_20260829.md"),
    read("portfolio/project2424/NEUROCAD_IDENTITY_ACCOUNTING_20260829.md")
  ]);

  assert.deepEqual(table.matched_validation_diagnostic, {
    case_set: "reused_20_case_component_diagnostic",
    typed_validated_accuracy: 1,
    direct_matched_validation_accuracy: 1,
    original_direct_accuracy: 0.6,
    validation_recovery_fraction: 1,
    verdict: "VALIDATION_DOMINANT"
  });
  assert.equal(table.mechanism_evidence.source_protocol_commit, "2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8");
  assert.equal(table.mechanism_evidence.workflow_run, 31777954088);
  assert.equal(table.mechanism_evidence.artifact_id, 9210587354);
  assert.equal(table.mechanism_evidence.artifact_sha256, "b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c");
  assert.equal(table.claim_boundary.typed_parser_specific_causality, "FALSIFIED_ON_REUSED_DIAGNOSTIC");

  for (const text of [manuscript, result, claimAudit, readiness]) {
    assert.match(text, /VALIDATION_DOMINANT/);
  }
  assert.match(manuscript, /falsif(?:y|ies|ied).*typed-parser-specific|typed-parser-specific.*falsif/is);
  assert.match(manuscript, /reused 20-case|reused diagnostic/i);
  assert.match(protocol, /Do not edit thresholds, cases, baseline validation rules, or interpretation after the first output/);
  assert.match(readiness, /NO-GO \/ NOT PREPRINT_READY/);
  assert.match(readiness, /Do not tune on the reused 20-case component diagnostic/);
  assert.match(identity, /COUNT ONCE HERE/);
  assert.match(identity, /BLOCKED; DO NOT COUNT A SECOND PAPER/);
});
