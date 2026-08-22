import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const artifacts = path.join(root, "artifacts/neurocad-alpha");
await mkdir(artifacts, { recursive: true });
const server = spawn("python3", ["-m", "http.server", "4174", "--bind", "127.0.0.1", "--directory", "public"], { stdio: ["ignore", "pipe", "pipe"] });

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4174/neurocad/index.html");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("NeuroCAD smoke server did not become ready");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("http://127.0.0.1:4174/neurocad/index.html", { waitUntil: "networkidle" });
  await page.locator("#validation-status").waitFor({ state: "visible" });
  assert.equal(await page.locator("#validation-status").textContent(), "PASS");
  assert.equal(await page.locator("#viewport").getAttribute("data-renderer"), "webgl2");
  assert.match(await page.locator("#object-count").textContent(), /components/);

  await page.locator("#prompt").fill("Create a simplified jet engine concept with eight compressor stages and three turbine stages.");
  await page.locator("#generate").click();
  assert.equal(await page.locator("#compressor-stages").inputValue(), "8");
  assert.equal(await page.locator("#turbine-stages").inputValue(), "3");
  assert.match(await page.locator("#pipeline").textContent(), /READY/);

  await page.locator("#toggle-casing").click();
  assert.equal(await page.locator("#toggle-casing").textContent(), "Show casing");
  await page.locator("#toggle-exploded").click();
  assert.equal(await page.locator("#toggle-exploded").textContent(), "Assembled view");

  await page.locator("#show-spec").click();
  const specText = await page.locator("#cadspec").textContent();
  assert.match(specText, /"compressorStages": 8/);
  assert.match(specText, /"turbineStages": 3/);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-scad").click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "neurocad-jet-engine-concept.scad");
  const scadPath = path.join(artifacts, "browser-export.scad");
  await download.saveAs(scadPath);
  const scad = await readFile(scadPath, "utf8");
  assert.match(scad, /NeuroCAD Alpha 0\.1/);
  assert.match(scad, /compressor_blades_08/);

  await page.screenshot({ path: path.join(artifacts, "neurocad-alpha-browser.png"), fullPage: true });
  assert.deepEqual(pageErrors, []);
  console.log("PASS NeuroCAD browser smoke: WebGL2 + prompt + edit + visibility + exploded + CADSpec + SCAD export");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
