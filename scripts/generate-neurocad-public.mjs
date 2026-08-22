import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = path.join(repositoryRoot, "portfolio/project2424/projects/T2424-0037");
const outputRoot = process.env.NEUROCAD_PUBLIC_DIR
  ? path.resolve(process.env.NEUROCAD_PUBLIC_DIR)
  : path.join(repositoryRoot, "public");
const assetsRoot = path.join(outputRoot, "neurocad-assets");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function source(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

const [canonicalHtml, canonicalApp, alphaSource, mechanicalSource, coreSource] = await Promise.all([
  source("web/index.html"),
  source("web/app.mjs"),
  source("src/alpha.mjs"),
  source("src/mechanical.mjs"),
  source("src/core.mjs")
]);

const publicHtml = canonicalHtml.replace(
  '<script type="module" src="./app.mjs"></script>',
  '<script type="module" src="/neurocad-assets/app.mjs"></script>'
);
if (publicHtml === canonicalHtml) {
  throw new Error("NeuroCAD public build could not locate canonical browser script tag");
}

let publicApp = canonicalApp.replace(
  'from "../src/alpha.mjs";',
  'from "./alpha.mjs";'
);
if (publicApp === canonicalApp) {
  throw new Error("NeuroCAD public build could not locate canonical alpha-module import");
}
const beforeMechanicalRewrite = publicApp;
publicApp = publicApp.replace(
  'from "../src/mechanical.mjs";',
  'from "./mechanical.mjs";'
);
if (publicApp === beforeMechanicalRewrite) {
  throw new Error("NeuroCAD public build could not locate canonical mechanical-module import");
}

await mkdir(assetsRoot, { recursive: true });
await Promise.all([
  writeFile(path.join(outputRoot, "neurocad.html"), publicHtml, "utf8"),
  writeFile(path.join(assetsRoot, "app.mjs"), publicApp, "utf8"),
  writeFile(path.join(assetsRoot, "alpha.mjs"), alphaSource, "utf8"),
  writeFile(path.join(assetsRoot, "mechanical.mjs"), mechanicalSource, "utf8"),
  writeFile(path.join(assetsRoot, "core.mjs"), coreSource, "utf8")
]);

const manifest = {
  version: "neurocad-public-v0.1",
  source: "portfolio/project2424/projects/T2424-0037",
  generatedFiles: {
    "neurocad.html": sha256(publicHtml),
    "neurocad-assets/app.mjs": sha256(publicApp),
    "neurocad-assets/alpha.mjs": sha256(alphaSource),
    "neurocad-assets/mechanical.mjs": sha256(mechanicalSource),
    "neurocad-assets/core.mjs": sha256(coreSource)
  },
  canonicalSources: {
    "web/index.html": sha256(canonicalHtml),
    "web/app.mjs": sha256(canonicalApp),
    "src/alpha.mjs": sha256(alphaSource),
    "src/mechanical.mjs": sha256(mechanicalSource),
    "src/core.mjs": sha256(coreSource)
  }
};
await writeFile(path.join(assetsRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Generated NeuroCAD public alpha at ${path.relative(repositoryRoot, outputRoot) || "."}/neurocad.html`);
