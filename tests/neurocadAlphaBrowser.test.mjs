import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const htmlUrl = new URL("../portfolio/project2424/projects/T2424-0037/web/index.html", import.meta.url);
const appUrl = new URL("../portfolio/project2424/projects/T2424-0037/web/app.mjs", import.meta.url);

function installCanvasStub(window) {
  const context = {
    clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fillText() {},
    setTransform() {},
    fillStyle: "", strokeStyle: "", lineWidth: 1, globalAlpha: 1, font: ""
  };
  Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value(kind) { return kind === "2d" ? context : null; }
  });
  Object.defineProperty(window.HTMLCanvasElement.prototype, "clientWidth", { configurable: true, get() { return 900; } });
  Object.defineProperty(window.HTMLCanvasElement.prototype, "clientHeight", { configurable: true, get() { return 560; } });
  window.HTMLCanvasElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 0, y: 0, left: 0, top: 0, right: 900, bottom: 560, width: 900, height: 560, toJSON() { return {}; } };
  };
  window.HTMLCanvasElement.prototype.setPointerCapture = function setPointerCapture() {};
}

async function loadDemo() {
  const html = await readFile(htmlUrl, "utf8");
  const dom = new JSDOM(html, { url: "http://localhost:8000/web/", pretendToBeVisual: true });
  installCanvasStub(dom.window);
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: globalThis.navigator,
    Blob: globalThis.Blob,
    URL: globalThis.URL
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  globalThis.Blob = dom.window.Blob;
  globalThis.URL = dom.window.URL;
  dom.window.URL.createObjectURL = () => "blob:neurocad-test";
  dom.window.URL.revokeObjectURL = () => {};

  await import(`${appUrl.href}?browser-smoke=${Date.now()}`);

  return {
    dom,
    restore() {
      dom.window.close();
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      Object.defineProperty(globalThis, "navigator", { configurable: true, value: previous.navigator });
      globalThis.Blob = previous.Blob;
      globalThis.URL = previous.URL;
    }
  };
}

test("NeuroCAD alpha browser demo exercises simple, mechanical, and jet-engine workflows", async () => {
  const demo = await loadDemo();
  try {
    const { document, Event } = demo.dom.window;
    const status = document.querySelector("#status");
    const error = document.querySelector("#error");
    const tree = document.querySelector("#tree");
    const cadSpec = document.querySelector("#cad-spec");

    assert.match(status.textContent, /READY/);
    assert.equal(error.textContent, "");
    assert.match(tree.textContent, /Compressor Rotor 01/);
    assert.match(tree.textContent, /Outer Casing/);
    assert.match(cadSpec.textContent, /"name": "Turbojet Concept"/);

    document.querySelector("#preset-plate").click();
    assert.equal(error.textContent, "");
    assert.match(cadSpec.textContent, /"name": "Mounting Plate"/);
    assert.match(tree.textContent, /Mounting Plate/);

    document.querySelector("#preset-mechanical").click();
    assert.equal(error.textContent, "");
    assert.match(cadSpec.textContent, /"name": "Flanged Tube Concept"/);
    assert.match(tree.textContent, /Left Flange/);
    assert.match(tree.textContent, /Right Flange/);
    assert.equal(document.querySelector("#update-params").disabled, true);

    document.querySelector("#preset-jet").click();
    assert.match(status.textContent, /validation PASS/);
    assert.match(cadSpec.textContent, /"compressorStages": 6/);
    assert.equal(document.querySelector("#update-params").disabled, false);

    const compressor = document.querySelector("#compressor-stages");
    compressor.value = "9";
    document.querySelector("#update-params").click();
    assert.equal(error.textContent, "");
    assert.match(cadSpec.textContent, /"compressorStages": 9/);
    assert.match(tree.textContent, /Compressor Rotor 09/);

    const casing = document.querySelector("#casing-visible");
    casing.checked = false;
    casing.dispatchEvent(new Event("change", { bubbles: true }));
    assert.equal(error.textContent, "");
    assert.match(cadSpec.textContent, /"id": "outer_casing"[\s\S]*?"visible": false/);

    const exploded = document.querySelector("#exploded");
    exploded.checked = true;
    exploded.dispatchEvent(new Event("change", { bubbles: true }));
    assert.match(status.textContent, /READY/);
  } finally {
    demo.restore();
  }
});
