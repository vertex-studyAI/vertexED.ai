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
