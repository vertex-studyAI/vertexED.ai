import {
  createJetEngineDocument,
  interpretPrompt,
  serializeCADDocument,
  summarizeDocument,
  toAssemblyOpenScad,
  validateCADDocument
} from "../src/alpha.mjs";

const $ = (selector) => document.querySelector(selector);
const promptInput = $("#prompt");
const runButton = $("#run");
const errorBox = $("#error");
const statusBox = $("#status");
const tree = $("#tree");
const cadSpec = $("#cad-spec");
const summary = $("#summary");
const canvas = $("#viewer");
const ctx = canvas.getContext("2d");
const compressorInput = $("#compressor-stages");
const turbineInput = $("#turbine-stages");
const lengthInput = $("#engine-length");
const diameterInput = $("#outer-diameter");
const casingInput = $("#casing-visible");
const explodedInput = $("#exploded");

let documentState = createJetEngineDocument();
let selectedId = null;
let camera = { yaw: -0.45, pitch: 0.28, zoom: 0.78 };
let dragging = false;
let pointer = { x: 0, y: 0 };

const GROUP_OFFSET = { inlet: -1.2, compressor: -0.45, shaft: 0, combustor: 0.25, turbine: 0.75, casing: 0, nozzle: 1.25, plate: 0 };

function setStatus(message) { statusBox.textContent = message; }
function fail(error) {
  errorBox.textContent = error instanceof Error ? error.message : String(error);
  setStatus("Validation failed");
}

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rotate([x, y, z]) {
  const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  return [x1, y2, z2];
}

function project(point, scale, cx, cy) {
  const [x, y, z] = rotate(point);
  const perspective = 1 / Math.max(0.35, 1 + z / 1700);
  return [cx + x * scale * perspective, cy - y * scale * perspective, z];
}

function radiusPair(object) {
  const p = object.params;
  if (object.type === "tube") return [p.outerRadius, p.outerRadius];
  if (object.type === "cylinder" || object.type === "disk") return [p.radius, p.radius];
  if (object.type === "blade_ring") return [p.tipRadius, p.tipRadius];
  if (object.type === "frustum") return [p.radius1, p.radius2];
  return [0, 0];
}

function lengthOf(object) {
  if (object.type === "rectangular_plate") return object.params.width;
  return object.params.length ?? object.params.thickness ?? 1;
}

function groupExplodeOffset(object) {
  if (!explodedInput.checked) return 0;
  const engineLength = documentState.metadata.jetEngineParams?.engineLengthMm ?? 900;
  return (GROUP_OFFSET[object.group] ?? 0) * engineLength * 0.12;
}

function objectSegments(object) {
  if (object.type === "rectangular_plate") {
    const p = object.params;
    const x = object.transform.x - p.width / 2;
    const y0 = -p.height / 2, y1 = p.height / 2;
    const z0 = -p.thickness / 2, z1 = p.thickness / 2;
    const pts = [[x,y0,z0],[x+p.width,y0,z0],[x+p.width,y1,z0],[x,y1,z0],[x,y0,z1],[x+p.width,y0,z1],[x+p.width,y1,z1],[x,y1,z1]];
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    return edges.map(([a,b]) => [pts[a], pts[b]]);
  }
  const [r0, r1] = radiusPair(object);
  const length = lengthOf(object);
  const x0 = object.transform.x + groupExplodeOffset(object);
  const x1 = x0 + length;
  const steps = object.type === "blade_ring" ? 24 : 18;
  const rings = [[], []];
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    rings[0].push([x0, Math.cos(a) * r0, Math.sin(a) * r0]);
    rings[1].push([x1, Math.cos(a) * r1, Math.sin(a) * r1]);
  }
  const segments = [];
  for (let i = 0; i < steps; i += 1) {
    segments.push([rings[0][i], rings[0][i + 1]], [rings[1][i], rings[1][i + 1]]);
    if (i % 3 === 0) segments.push([rings[0][i], rings[1][i]]);
  }
  if (object.type === "blade_ring") {
    for (let i = 0; i < steps; i += 2) {
      const a = (i / steps) * Math.PI * 2;
      const hub = object.params.hubRadius;
      segments.push([[x0 + length / 2, Math.cos(a) * hub, Math.sin(a) * hub], [x0 + length / 2, Math.cos(a) * r0, Math.sin(a) * r0]]);
    }
  }
  return segments;
}

function renderViewer() {
  fitCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#071019";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(95, 240, 200, .09)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

  const engineLength = documentState.metadata.jetEngineParams?.engineLengthMm ?? 900;
  const scale = (Math.min(width / (engineLength * 1.45), height / 520) || 0.4) * camera.zoom;
  const cx = width / 2;
  const cy = height / 2;
  const visible = documentState.objects.filter((object) => object.visible && (casingInput.checked || object.id !== "outer_casing"));
  const drawable = visible.map((object) => {
    const segments = objectSegments(object);
    const depth = segments.reduce((sum, segment) => sum + rotate(segment[0])[2] + rotate(segment[1])[2], 0) / Math.max(1, segments.length * 2);
    return { object, segments, depth };
  }).sort((a, b) => a.depth - b.depth);

  for (const entry of drawable) {
    const selected = entry.object.id === selectedId;
    ctx.strokeStyle = selected ? "#f8fafc" : entry.object.group === "compressor" ? "#67e8f9" : entry.object.group === "turbine" ? "#fbbf24" : entry.object.group === "combustor" ? "#fb7185" : entry.object.group === "shaft" ? "#c4b5fd" : "#86efac";
    ctx.globalAlpha = entry.object.id === "outer_casing" ? 0.42 : 0.9;
    ctx.lineWidth = selected ? 2.5 : 1.25;
    for (const [a, b] of entry.segments) {
      const pa = project(a, scale, cx, cy);
      const pb = project(b, scale, cx, cy);
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#91a4bb";
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("DRAG TO ORBIT · SCROLL TO ZOOM", 18, height - 18);
}

function renderTree() {
  tree.replaceChildren();
  const groups = new Map();
  for (const object of documentState.objects) {
    if (!groups.has(object.group)) groups.set(object.group, []);
    groups.get(object.group).push(object);
  }
  for (const [group, objects] of groups) {
    const section = document.createElement("section");
    section.className = "tree-group";
    const heading = document.createElement("h3");
    heading.textContent = group.replaceAll("_", " ").toUpperCase();
    section.append(heading);
    for (const object of objects) {
      const button = document.createElement("button");
      button.className = `tree-item${selectedId === object.id ? " selected" : ""}`;
      button.type = "button";
      button.textContent = `${object.visible ? "●" : "○"} ${object.name}`;
      button.addEventListener("click", () => { selectedId = selectedId === object.id ? null : object.id; renderTree(); renderViewer(); });
      section.append(button);
    }
    tree.append(section);
  }
}

function syncControls() {
  const p = documentState.metadata.jetEngineParams;
  if (!p) return;
  compressorInput.value = p.compressorStages;
  turbineInput.value = p.turbineStages;
  lengthInput.value = p.engineLengthMm;
  diameterInput.value = p.outerDiameterMm;
  casingInput.checked = documentState.objects.find((object) => object.id === "outer_casing")?.visible !== false;
}

function renderAll() {
  documentState = validateCADDocument(documentState);
  const info = summarizeDocument(documentState);
  summary.textContent = JSON.stringify(info, null, 2);
  cadSpec.textContent = serializeCADDocument(documentState);
  renderTree();
  syncControls();
  renderViewer();
  setStatus(`READY · ${info.objectCount} components · validation ${info.validation}`);
}

function runPrompt() {
  errorBox.textContent = "";
  setStatus("UNDERSTANDING → STRUCTURING → VALIDATING → GENERATING");
  try {
    const result = interpretPrompt(promptInput.value, documentState);
    documentState = result.document;
    explodedInput.checked = Boolean(result.view?.exploded);
    casingInput.checked = result.view?.casingVisible !== false;
    renderAll();
  } catch (error) { fail(error); }
}

function updateParameters() {
  errorBox.textContent = "";
  try {
    documentState = createJetEngineDocument({
      ...documentState.metadata.jetEngineParams,
      compressorStages: Number(compressorInput.value),
      turbineStages: Number(turbineInput.value),
      engineLengthMm: Number(lengthInput.value),
      outerDiameterMm: Number(diameterInput.value)
    });
    if (!casingInput.checked) documentState = { ...documentState, objects: documentState.objects.map((object) => object.id === "outer_casing" ? { ...object, visible: false } : object) };
    renderAll();
  } catch (error) { fail(error); }
}

function download(name, type, content) {
  const href = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = href; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

runButton.addEventListener("click", runPrompt);
$("#preset-jet").addEventListener("click", () => { promptInput.value = "Generate a simplified axial jet engine concept with 6 compressor stages and 2 turbine stages"; runPrompt(); });
$("#preset-plate").addEventListener("click", () => { promptInput.value = "Create a plate 100 by 60 mm thickness 4 with 4 holes radius 4 inset 10"; runPrompt(); });
$("#update-params").addEventListener("click", updateParameters);
$("#export-json").addEventListener("click", () => download("neurocad-model.json", "application/json", serializeCADDocument(documentState)));
$("#export-scad").addEventListener("click", () => download("neurocad-model.scad", "text/plain", toAssemblyOpenScad(documentState)));
casingInput.addEventListener("change", () => {
  documentState = { ...documentState, objects: documentState.objects.map((object) => object.id === "outer_casing" ? { ...object, visible: casingInput.checked } : object) };
  renderAll();
});
explodedInput.addEventListener("change", renderViewer);
window.addEventListener("resize", renderViewer);
canvas.addEventListener("pointerdown", (event) => { dragging = true; pointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  camera.yaw += (event.clientX - pointer.x) * 0.008;
  camera.pitch = Math.max(-1.25, Math.min(1.25, camera.pitch + (event.clientY - pointer.y) * 0.008));
  pointer = { x: event.clientX, y: event.clientY };
  renderViewer();
});
canvas.addEventListener("pointerup", () => { dragging = false; });
canvas.addEventListener("wheel", (event) => { event.preventDefault(); camera.zoom = Math.max(0.35, Math.min(2.4, camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08))); renderViewer(); }, { passive: false });

renderAll();
