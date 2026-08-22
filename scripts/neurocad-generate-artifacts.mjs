import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createJetEngineConcept } from "../portfolio/project2424/projects/T2424-0037/src/jet-engine.mjs";
import { serializeCADDocument } from "../portfolio/project2424/projects/T2424-0037/src/render3d.mjs";
import { toOpenScadDocument } from "../portfolio/project2424/projects/T2424-0037/src/scad.mjs";

const outputDir = path.resolve(process.argv[2] || "artifacts/neurocad-alpha");
await mkdir(outputDir, { recursive: true });
const document = createJetEngineConcept({ compressorStages: 6, turbineStages: 2 });
await writeFile(path.join(outputDir, "jet-engine-concept.json"), serializeCADDocument(document) + "\n");
await writeFile(path.join(outputDir, "jet-engine-concept.scad"), toOpenScadDocument(document));
await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify({
  product: "NeuroCAD Alpha",
  version: "0.1.0-alpha.1",
  conceptual: true,
  objectCount: document.objects.length,
  compressorStages: document.metadata.parameters.compressorStages,
  turbineStages: document.metadata.parameters.turbineStages,
  files: ["jet-engine-concept.json", "jet-engine-concept.scad"]
}, null, 2) + "\n");
console.log(`Generated NeuroCAD artifacts in ${outputDir}`);
