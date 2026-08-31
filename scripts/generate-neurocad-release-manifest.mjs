import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "portfolio/project2424/projects/T2424-0037/RELEASE_MANIFEST_20260831.json");

export const evidenceFiles = [
  "portfolio/project2424/NEUROCAD_IDENTITY_ACCOUNTING_20260829.md",
  "portfolio/project2424/projects/T2424-0037/CLAIM_AUDIT_20260829.md",
  "portfolio/project2424/projects/T2424-0037/EVIDENCE.md",
  "portfolio/project2424/projects/T2424-0037/MANUSCRIPT.md",
  "portfolio/project2424/projects/T2424-0037/NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md",
  "portfolio/project2424/projects/T2424-0037/NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md",
  "portfolio/project2424/projects/T2424-0037/PREPRINT_READINESS_20260829.md",
  "portfolio/project2424/projects/T2424-0037/RELATED_WORK_AUDIT_20260829.md",
  "portfolio/project2424/projects/T2424-0037/RELEASE_AUDIT_20260829.md",
  "portfolio/project2424/projects/T2424-0037/TABLE_DATA_20260829.json"
];

export async function generateManifest() {
  const artifacts = {};
  for (const relativePath of evidenceFiles) {
    const bytes = await readFile(path.join(root, relativePath));
    artifacts[relativePath] = {
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex")
    };
  }

  return {
    schema_version: 1,
    project: "T2424-0037",
    scientific_status: "VALIDATION_DOMINANT_TYPED_PARSER_CAUSALITY_FALSIFIED_ON_REUSED_DIAGNOSTIC",
    preprint_ready: false,
    generated_by: "scripts/generate-neurocad-release-manifest.mjs",
    artifacts
  };
}

const expected = JSON.stringify(await generateManifest(), null, 2) + "\n";
if (process.argv.includes("--check")) {
  const retained = await readFile(manifestPath, "utf8");
  if (retained !== expected) {
    throw new Error("NeuroCAD release manifest is stale; regenerate it before claiming artifact integrity.");
  }
} else {
  await writeFile(manifestPath, expected);
}
