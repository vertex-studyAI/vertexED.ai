import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);

test("NeuroCAD public build is generated from canonical alpha sources and clean URL is routed", async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "neurocad-public-"));
  try {
    const run = spawnSync(process.execPath, [path.join(root, "scripts/generate-neurocad-public.mjs")], {
      cwd: root,
      env: { ...process.env, NEUROCAD_PUBLIC_DIR: output },
      encoding: "utf8"
    });
    assert.equal(run.status, 0, run.stderr || run.stdout);

    const [html, app, alpha, language, mechanical, core, manifestText, vercelText] = await Promise.all([
      readFile(path.join(output, "neurocad.html"), "utf8"),
      readFile(path.join(output, "neurocad-assets/app.mjs"), "utf8"),
      readFile(path.join(output, "neurocad-assets/alpha.mjs"), "utf8"),
      readFile(path.join(output, "neurocad-assets/language.mjs"), "utf8"),
      readFile(path.join(output, "neurocad-assets/mechanical.mjs"), "utf8"),
      readFile(path.join(output, "neurocad-assets/core.mjs"), "utf8"),
      readFile(path.join(output, "neurocad-assets/manifest.json"), "utf8"),
      readFile(path.join(root, "vercel.json"), "utf8")
    ]);

    assert.match(html, /src="\/neurocad-assets\/app\.mjs"/u);
    assert.doesNotMatch(html, /src="\.\/app\.mjs"/u);
    assert.match(app, /from "\.\/alpha\.mjs";/u);
    assert.match(app, /from "\.\/language\.mjs";/u);
    assert.doesNotMatch(app, /\.\.\/src\/(?:alpha|language)\.mjs/u);
    assert.match(alpha, /createJetEngineDocument/u);
    assert.match(language, /interpretCADCommand/u);
    assert.match(language, /from "\.\/mechanical\.mjs";/u);
    assert.match(mechanical, /createFlangedTubeDocument/u);
    assert.match(core, /validatePlateSpec/u);

    const manifest = JSON.parse(manifestText);
    assert.equal(manifest.version, "neurocad-public-v0.1");
    assert.equal(Object.keys(manifest.generatedFiles).length, 6);
    for (const digest of Object.values(manifest.generatedFiles)) assert.match(digest, /^[a-f0-9]{64}$/u);

    const vercel = JSON.parse(vercelText);
    assert.deepEqual(vercel.rewrites[0], { source: "/neurocad", destination: "/neurocad.html" });
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
