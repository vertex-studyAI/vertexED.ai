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

export const pdfProvenance = {
  source_head: "0011292fcfd4109bce271025c9a467f9ac333acb",
  workflow_run_id: 33368603717,
  workflow_url: "https://github.com/vertex-studyAI/vertexED.ai/actions/runs/33368603717",
  artifact_id: 9749201374,
  artifact_name: "t2424-0050-darcy-rendered-paper",
  artifact_expires_at: "2026-09-30T07:30:28Z",
  artifact_archive_sha256: "5803474339e84d17257e8dcb6f2e51749ad4dbc77a59428153373bafa696abfe",
  permanent_archive: false,
  pdf: {
    filename: "T2424-0050-Darcy-bounded-mixed-result.pdf",
    bytes: 84630,
    sha256: "9be0a8d53bc20512e46b874651768d22cd1b2001626b3e77afdbf26529483c4e",
    pages: 4,
    page_size: "A4",
    encrypted: false,
    javascript: false
  }
};

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
    pdf_provenance: pdfProvenance,
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
