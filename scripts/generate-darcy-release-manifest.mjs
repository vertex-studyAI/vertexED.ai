import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "portfolio/project2424/projects/T2424-0050/paper/RELEASE_MANIFEST.json");

export const evidenceFiles = [
  "portfolio/project2424/projects/T2424-0050/LEARNED_OPERATOR_OOD_PROTOCOL_V2.md",
  "portfolio/project2424/projects/T2424-0050/STATUS.md",
  "portfolio/project2424/projects/T2424-0050/v2-freeze-config.json",
  "portfolio/project2424/projects/T2424-0050/results/reference.json",
  "portfolio/project2424/projects/T2424-0050/results/misaligned-audit.json",
  "portfolio/project2424/projects/T2424-0050/paper/CLAIM_EVIDENCE_MATRIX.md",
  "portfolio/project2424/projects/T2424-0050/paper/MANUSCRIPT.md",
  "portfolio/project2424/projects/T2424-0050/paper/RELEASE_AUDIT.md"
];

export async function generateDarcyReleaseManifest() {
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
    project: "T2424-0050",
    scientific_status: "HOLD_MIXED_ROBUSTNESS",
    preprint_ready: false,
    generated_by: "scripts/generate-darcy-release-manifest.mjs",
    artifacts
  };
}

const expected = JSON.stringify(await generateDarcyReleaseManifest(), null, 2) + "\n";
if (process.argv.includes("--check")) {
  const retained = await readFile(manifestPath, "utf8");
  if (retained !== expected) {
    throw new Error("Darcy release manifest is stale; regenerate before claiming artifact integrity.");
  }
} else {
  await writeFile(manifestPath, expected);
}
