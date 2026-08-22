import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const project = path.join(root, "portfolio/project2424/projects/T2424-0037");
const web = path.join(project, "web");
const src = path.join(project, "src");
const out = path.join(root, "public/neurocad");
const outSrc = path.join(out, "src");

await rm(out, { recursive: true, force: true });
await mkdir(outSrc, { recursive: true });

const htmlSource = await readFile(path.join(web, "alpha.html"), "utf8");
const html = htmlSource
  .replace('href="./alpha.css"', 'href="/neurocad/alpha.css"')
  .replace('src="./alpha-app.mjs"', 'src="/neurocad/alpha-app.mjs"');
await writeFile(path.join(out, "index.html"), html);
await writeFile(path.join(out, "alpha.css"), await readFile(path.join(web, "alpha.css"), "utf8"));

const appSource = await readFile(path.join(web, "alpha-app.mjs"), "utf8");
await writeFile(path.join(out, "alpha-app.mjs"), appSource.replaceAll('"../src/', '"./src/'));

for (const file of ["cad.mjs", "jet-engine.mjs", "intent.mjs", "render3d.mjs", "scad.mjs", "webgl.mjs"]) {
  await writeFile(path.join(outSrc, file), await readFile(path.join(src, file), "utf8"));
}

await writeFile(path.join(out, "BUILD_INFO.json"), JSON.stringify({
  product: "NeuroCAD Alpha",
  version: "0.1.0-alpha.1",
  source: "portfolio/project2424/projects/T2424-0037",
  generated: true
}, null, 2) + "\n");

console.log(`Staged NeuroCAD Alpha at ${path.relative(root, out)}`);
