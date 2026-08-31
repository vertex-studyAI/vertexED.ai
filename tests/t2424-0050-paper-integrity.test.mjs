import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  evidenceFiles,
  generateDarcyReleaseManifest,
  pdfProvenance,
} from "../scripts/generate-darcy-release-manifest.mjs";

const read = (relativePath) => readFile(new URL("../" + relativePath, import.meta.url), "utf8");

test("Darcy release manifest deterministically binds current evidence", async () => {
  const retained = JSON.parse(
    await read("portfolio/project2424/projects/T2424-0050/paper/RELEASE_MANIFEST.json"),
  );
  const generated = await generateDarcyReleaseManifest();

  assert.deepEqual(retained, generated);
  assert.equal(Object.keys(retained.artifacts).length, evidenceFiles.length);
  assert.ok(evidenceFiles.includes("portfolio/project2424/projects/T2424-0050/paper/BIBLIOGRAPHY_AUDIT.md"));
  assert.equal(retained.scientific_status, "HOLD_MIXED_ROBUSTNESS");
  assert.equal(retained.preprint_ready, false);
  assert.deepEqual(retained.pdf_provenance, pdfProvenance);
  assert.equal(retained.pdf_provenance.source_head, "0011292fcfd4109bce271025c9a467f9ac333acb");
  assert.equal(retained.pdf_provenance.pdf.sha256, "9be0a8d53bc20512e46b874651768d22cd1b2001626b3e77afdbf26529483c4e");
  assert.equal(retained.pdf_provenance.pdf.bytes, 84630);
  assert.equal(retained.pdf_provenance.pdf.pages, 4);
  assert.equal(retained.pdf_provenance.pdf.encrypted, false);
  assert.equal(retained.pdf_provenance.pdf.javascript, false);
  assert.equal(retained.pdf_provenance.permanent_archive, false);
  assert.match(retained.pdf_provenance.artifact_expires_at, /^2026-09-30T/);
  for (const entry of Object.values(retained.artifacts)) {
    assert.match(entry.sha256, /^[0-9a-f]{64}$/);
    assert.ok(entry.bytes > 0);
  }
});

test("Darcy manuscript metrics recompute from retained JSON", async () => {
  const [reference, audit, manuscript] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0050/results/reference.json").then(JSON.parse),
    read("portfolio/project2424/projects/T2424-0050/results/misaligned-audit.json").then(JSON.parse),
    read("portfolio/project2424/projects/T2424-0050/paper/MANUSCRIPT.md"),
  ]);

  assert.equal(reference.summary.seeds, 20);
  assert.equal(reference.summary.meanRelativeImprovement, 0.9787663202281432);
  assert.match(
    manuscript,
    new RegExp((reference.summary.meanRelativeImprovement * 100).toFixed(6) + "%"),
  );

  const expectedRhos = [0, 0.5, 0.9];
  const expectedPercentages = ["63.8317", "77.1634", "86.1675"];
  assert.deepEqual(audit.conditions.map(({ rho }) => rho), expectedRhos);
  assert.deepEqual(
    audit.conditions.map(({ meanHarmonicImprovement }) =>
      (meanHarmonicImprovement * 100).toFixed(4)),
    expectedPercentages,
  );
  for (const percentage of expectedPercentages) {
    assert.match(manuscript, new RegExp(percentage + "%"));
  }
});

test("Darcy bibliography identities and non-comparison boundary remain fail-closed", async () => {
  const [bibliography, manuscript, release] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0050/paper/BIBLIOGRAPHY_AUDIT.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/RELEASE_AUDIT.md"),
  ]);

  const identities = [
    ["Fourier Neural Operator for Parametric Partial Differential Equations", "arXiv:2010.08895", "10.48550/arXiv.2010.08895"],
    ["Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators", "10.1038/s42256-021-00302-5"],
    ["A constrained proper orthogonal decomposition model for upscaling permeability", "10.1002/fld.5171"],
  ];
  for (const identity of identities) {
    for (const token of identity) {
      assert.match(bibliography, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    }
    assert.match(manuscript, new RegExp(identity[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  assert.match(bibliography, /none was executed as a matched baseline or comparator/);
  assert.match(bibliography, /do not supply evidence for superiority, reproduction, or readiness claims/);
  assert.match(manuscript, /These are relevant future comparator families, not baselines in the present experiment/);
  assert.match(manuscript, /No sentence in this manuscript should be read as a matched comparison/);
  assert.match(release, /Every bibliography entry is reconciled/);
  assert.doesNotMatch(release, /\[ \] Finalize bibliography metadata/);
});

test("Darcy HOLD/MIXED failure evidence and stop rules remain fail-closed", async () => {
  const [audit, status, manuscript, claims, release] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0050/results/misaligned-audit.json").then(JSON.parse),
    read("portfolio/project2424/projects/T2424-0050/STATUS.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/CLAIM_EVIDENCE_MATRIX.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/RELEASE_AUDIT.md"),
  ]);

  const iid = audit.conditions.find(({ rho }) => rho === 0);
  assert.ok(iid);
  assert.equal(audit.interpretation.harderAuditMixed, true);
  assert.equal(audit.interpretation.iidMeanImprovementClearsOriginal65PercentThreshold, false);
  assert.equal(iid.harmonicBeatsLinear, 99);
  assert.equal(iid.worstHarmonicCase.seed, 6);
  assert.ok(iid.worstHarmonicCase.harmonicMae > iid.worstHarmonicCase.linearMae);
  assert.ok(iid.worstHarmonicCase.harmonicImprovement < 0);

  assert.match(status, /HARDER_AUDIT_MIXED \/ HOLD/);
  assert.match(status, /\*\*HOLD\.\*\*/);
  assert.match(manuscript, /rho=0 condition falls below the earlier 65%/);
  assert.match(manuscript, /seed 6 reverses the ordering/);
  assert.match(manuscript, /This is not a neural-operator study/);
  assert.match(claims, /No conversion of HOLD\/MIXED into PASS/);
  assert.match(release, /NO-GO for PREPRINT_READY/);
  assert.match(release, /expiring workflow artifact is not permanent archival evidence/);
  assert.match(release, /No parent-paper edit may relax the original result, remove the rho=0 miss, or erase seed 6/);
});

test("Darcy sentence audit covers retained claims and prohibits scope inflation", async () => {
  const [sentenceAudit, manuscript, release] = await Promise.all([
    read("portfolio/project2424/projects/T2424-0050/paper/SENTENCE_CLAIM_AUDIT.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/MANUSCRIPT.md"),
    read("portfolio/project2424/projects/T2424-0050/paper/RELEASE_AUDIT.md"),
  ]);

  assert.match(sentenceAudit, /Audited manuscript: .*9,572 bytes/);
  assert.match(sentenceAudit, /f7523041fe13f04cb3f917aac41c5c0f3525a1be7bc89cb0f06d85f603cc4a35/);
  for (let id = 1; id <= 15; id += 1) {
    assert.match(sentenceAudit, new RegExp("S" + String(id).padStart(2, "0")));
  }

  const requiredEvidence = [
    "0.06589139155637647",
    "0.0011366559231966065",
    "97.876632%",
    "63.8317%",
    "77.1634%",
    "86.1675%",
    "99/100",
    "seed 6",
    "-10.0479%",
    "HOLD/MIXED",
  ];
  for (const token of requiredEvidence) {
    assert.ok(sentenceAudit.includes(token), "sentence audit missing " + token);
  }

  assert.match(sentenceAudit, /no claim of:[\s\S]*statistical significance/i);
  assert.match(sentenceAudit, /state-of-the-art superiority/);
  assert.match(sentenceAudit, /publication novelty, preprint readiness/);
  assert.match(sentenceAudit, /NO-GO for PREPRINT_READY remains unchanged/);
  assert.match(manuscript, /NO-GO for `PREPRINT_READY`/);
  assert.match(release, /Independent sentence-level audit maps every quantitative result/);
  assert.doesNotMatch(release, /\[ \] Perform independent sentence-level claim audit/);
});
