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
  assert.deepEqual(retained.generated_artifacts, {
    "dist/t2424-0037-paper/T2424-0037-NeuroCAD-bounded-result.pdf": {
      bytes: 89197,
      sha256: "1108c9f78eaf078b84a0e73f5dbeb0ff8734f363b84956c6eaa3f5d401209e04",
      workflow_run: 33355893567,
      artifact_id: 9745116157,
      artifact_archive_sha256: "3f91345ace7bc5999e38e41a1550babccb6dc4309d7fc10ebefedb5b15cb3c4f",
      permanent_archive: false
    }
  });
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

test("NeuroCAD PDF workflow retains authored and executed GitHub identities", async () => {
  const workflow = await read(".github/workflows/t2424-0037-paper-pdf.yml");
  assert.match(workflow, /SOURCE_HEAD: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(workflow, /EXECUTED_REF: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /source_head:process\.env\.SOURCE_HEAD/);
  assert.match(workflow, /executed_ref:process\.env\.EXECUTED_REF/);
});

test("NeuroCAD bibliography identities and non-comparison boundaries remain fail-closed", async () => {
  const [bibliography, manuscript, release] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0037/BIBLIOGRAPHY_AUDIT_20260831.md"),
    read("portfolio/project2424/projects/T2424-0037/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0037/RELEASE_AUDIT_20260829.md")
  ]);

  assert.ok(evidenceFiles.includes("portfolio/project2424/projects/T2424-0037/BIBLIOGRAPHY_AUDIT_20260831.md"));
  const arxivIds = [
    "2105.09492",
    "2007.08506",
    "2409.17106",
    "2412.14042",
    "2605.18430",
    "2607.05750"
  ];
  for (const id of arxivIds) {
    assert.ok(bibliography.includes("arXiv:" + id));
    assert.ok(bibliography.includes("10.48550/arXiv." + id));
    assert.ok(manuscript.includes("arXiv:" + id));
  }

  assert.ok(bibliography.includes("10.52202/079017-0242"));
  assert.match(bibliography, /All six references are contextual only; none was executed/);
  assert.match(bibliography, /No relabeling of the reused 20-case diagnostic as held-out or OOD/);
  assert.match(bibliography, /does not change `VALIDATION_DOMINANT`/);
  assert.match(manuscript, /These systems are contextual references, not matched NeuroCAD baselines/);
  assert.match(release, /Final bibliography identities, complete author lists/);
  assert.doesNotMatch(release, /\[ \] Verify final bibliography metadata/);
});

test("NeuroCAD sentence audit preserves quantitative truth and prohibits claim inflation", async () => {
  const [audit, manuscript, release, table] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0037/SENTENCE_CLAIM_AUDIT_20260831.md"),
    read("portfolio/project2424/projects/T2424-0037/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0037/RELEASE_AUDIT_20260829.md"),
    read("portfolio/project2424/projects/T2424-0037/TABLE_DATA_20260829.json").then(JSON.parse)
  ]);

  assert.ok(evidenceFiles.includes("portfolio/project2424/projects/T2424-0037/SENTENCE_CLAIM_AUDIT_20260831.md"));
  assert.match(audit, /Audited manuscript bytes: `12877`/);
  assert.match(audit, /fd2e6c026c0f1ed146ed820b9d890bff743b2c45b3850eeca122c244d93a9ac5/);
  for (let index = 1; index <= 15; index += 1) {
    assert.match(audit, new RegExp("N" + String(index).padStart(2, "0")));
  }

  assert.equal(table.historical_v1.typed_validated_pass / table.historical_v1.benchmark_n, 0.95);
  assert.equal(table.historical_v1.original_direct_pass / table.historical_v1.benchmark_n, 0.6);
  assert.equal(table.historical_v1.typed_validated_accuracy - table.historical_v1.original_direct_accuracy, 0.35);
  assert.equal(table.matched_validation_diagnostic.validation_recovery_fraction, 1);
  assert.equal(table.matched_validation_diagnostic.verdict, "VALIDATION_DOMINANT");

  assert.match(audit, /typed-parser-specific causality is falsified on the reused diagnostic/i);
  assert.match(audit, /S3 is unexecuted and unauthorized/i);
  assert.match(audit, /NOT PREPRINT_READY remains unchanged/);
  assert.match(manuscript, /no claim of out-of-distribution generalization, manufacturing correctness, external validation, or superiority/i);
  assert.match(manuscript, /not a typed-parser causal breakthrough/i);
  assert.match(release, /Independent sentence-level audit reconciles 15/);
  assert.doesNotMatch(release, /\[ \] Perform an independent sentence-level claim audit/);
});
