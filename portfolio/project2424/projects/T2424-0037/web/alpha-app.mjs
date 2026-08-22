import { createJetEngineConcept, updateJetEngineConcept } from "../src/jet-engine.mjs";
import { parseIntent } from "../src/intent.mjs";
import { serializeCADDocument } from "../src/render3d.mjs";
import { toOpenScadDocument } from "../src/scad.mjs";

const state = {
  document: createJetEngineConcept(),
  exploded: false,
  casingVisible: true,
  selected: null,
  yaw: -0.45,
  pitch: 0.18,
  zoom: 1
};

const el = (id) => document.getElementById(id);
const canvas = el("viewport");
const ctx = canvas.getContext("2d");

function project(point, width, height) {
  const [x, y, z] = point;
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y1 = y * cp - z1 * sp;
  const scale = Math.min(width / 1150, height / 440) * state.zoom;
  return [width / 2 + (x1 - 440) * scale, height / 2 - y1 * scale];
}

function objectX(object) { return object.transform?.translate?.[0] ?? 0; }
function explodeOffset(object) {
  if (!state.exploded) return 0;
  const groups = { inlet: -75, compressor: -35, shaft: 0, casing: 0, combustor: 20, turbine: 55, nozzle: 95 };
  return groups[object.group] ?? 0;
}

function drawCylinder(object, color, alpha = 1) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const x = objectX(object) + explodeOffset(object);
  const length = object.length ?? 30;
  const radius = object.radius ?? object.outerRadius ?? object.radiusStart ?? object.tipRadius ?? 40;
  const endRadius = object.radiusEnd ?? radius;
  const [x1, y1] = project([x, radius, 0], width, height);
  const [x2, y2] = project([x + length, endRadius, 0], width, height);
  const [x3, y3] = project([x + length, -endRadius, 0], width, height);
  const [x4, y4] = project([x, -radius, 0], width, height);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.strokeStyle = state.selected === object.id ? "#f8fafc" : "#64748b";
  ctx.lineWidth = state.selected === object.id ? 3 : 1;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

function drawBladeRing(object) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const x = objectX(object) + explodeOffset(object);
  const radius = object.tipRadius;
  const count = Math.min(object.bladeCount, 32);
  const [cx, cy] = project([x, 0, 0], width, height);
  ctx.save();
  ctx.strokeStyle = state.selected === object.id ? "#f8fafc" : object.group === "turbine" ? "#fb923c" : "#60a5fa";
  ctx.lineWidth = state.selected === object.id ? 3 : 1.5;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const [px, py] = project([x, Math.cos(angle) * radius, Math.sin(angle) * radius], width, height);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  }
  ctx.restore();
}

function renderViewport() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr)); canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
  const objects = state.document.objects.filter((object) => object.visible !== false && (object.id !== "outer_casing" || state.casingVisible));
  for (const object of objects) {
    if (object.type === "blade_ring") drawBladeRing(object);
    else {
      const colors = { inlet: "#334155", compressor: "#1d4ed8", shaft: "#475569", combustor: "#a16207", turbine: "#c2410c", casing: "#0f172a", nozzle: "#334155" };
      drawCylinder(object, colors[object.group] ?? "#475569", object.translucent ? 0.28 : 0.9);
    }
  }
  el("object-count").textContent = `${state.document.objects.length} components`;
}

function renderTree() {
  const groups = new Map();
  for (const object of state.document.objects) {
    if (!groups.has(object.group)) groups.set(object.group, []);
    groups.get(object.group).push(object);
  }
  const root = el("assembly-tree"); root.textContent = "";
  for (const [group, objects] of groups) {
    const section = document.createElement("section");
    const heading = document.createElement("h4"); heading.textContent = group?.replaceAll("_", " ") ?? "components"; section.appendChild(heading);
    for (const object of objects) {
      const button = document.createElement("button"); button.type = "button"; button.className = "tree-item"; button.textContent = object.id.replaceAll("_", " ");
      button.addEventListener("click", () => { state.selected = object.id; renderViewport(); document.querySelectorAll(".tree-item").forEach((node) => node.classList.toggle("active", node === button)); });
      section.appendChild(button);
    }
    root.appendChild(section);
  }
}

function syncControls() {
  const params = state.document.metadata.parameters;
  el("engine-length").value = params.engineLengthMm; el("outer-diameter").value = params.outerDiameterMm; el("shaft-diameter").value = params.shaftDiameterMm; el("compressor-stages").value = params.compressorStages; el("turbine-stages").value = params.turbineStages;
}
function renderValidation() { el("validation-status").textContent = "PASS"; el("validation-copy").textContent = "Validated CADDocument · bounded conceptual geometry · no manufacturing or propulsion claims"; }
function renderAll() { syncControls(); renderTree(); renderValidation(); renderViewport(); el("cadspec").textContent = serializeCADDocument(state.document); }
function showError(error) { el("error-box").hidden = false; el("error-box").textContent = error.message; el("pipeline").textContent = "FAILED CLOSED"; }
function clearError() { el("error-box").hidden = true; el("error-box").textContent = ""; }

function updateFromControls() {
  state.document = updateJetEngineConcept(state.document, { engineLengthMm: Number(el("engine-length").value), outerDiameterMm: Number(el("outer-diameter").value), shaftDiameterMm: Number(el("shaft-diameter").value), compressorStages: Number(el("compressor-stages").value), turbineStages: Number(el("turbine-stages").value) });
  clearError(); el("pipeline").textContent = "VALIDATING → REGENERATING → READY"; renderAll();
}

function executePrompt() {
  try {
    el("pipeline").textContent = "UNDERSTANDING → STRUCTURING → VALIDATING → GENERATING";
    const intent = parseIntent(el("prompt").value, state.document);
    if (intent.type === "CREATE_ASSEMBLY") state.document = createJetEngineConcept(intent.parameters);
    else if (intent.type === "MODIFY_PARAMETER") state.document = updateJetEngineConcept(state.document, intent.patch);
    else if (intent.type === "SET_VISIBILITY") state.casingVisible = intent.visible;
    else if (intent.type === "SET_VIEW_MODE") state.exploded = intent.mode === "exploded";
    clearError();
    el("toggle-casing").textContent = state.casingVisible ? "Hide casing" : "Show casing";
    el("toggle-exploded").textContent = state.exploded ? "Assembled view" : "Exploded view";
    el("pipeline").textContent = "UNDERSTANDING → STRUCTURING → VALIDATING → GENERATING → READY";
    renderAll();
  } catch (error) { showError(error); }
}

function download(text, mime, filename) {
  const blob = new Blob([text], { type: mime }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

el("generate").addEventListener("click", executePrompt);
for (const id of ["engine-length", "outer-diameter", "shaft-diameter", "compressor-stages", "turbine-stages"]) el(id).addEventListener("change", () => { try { updateFromControls(); } catch (error) { showError(error); } });
el("toggle-casing").addEventListener("click", () => { state.casingVisible = !state.casingVisible; el("toggle-casing").textContent = state.casingVisible ? "Hide casing" : "Show casing"; renderViewport(); });
el("toggle-exploded").addEventListener("click", () => { state.exploded = !state.exploded; el("toggle-exploded").textContent = state.exploded ? "Assembled view" : "Exploded view"; renderViewport(); });
el("reset-view").addEventListener("click", () => { state.yaw = -0.45; state.pitch = 0.18; state.zoom = 1; renderViewport(); });
el("export-json").addEventListener("click", () => download(serializeCADDocument(state.document), "application/json", "neurocad-jet-engine-concept.json"));
el("export-scad").addEventListener("click", () => download(toOpenScadDocument(state.document), "text/plain", "neurocad-jet-engine-concept.scad"));
el("show-spec").addEventListener("click", () => { el("spec-panel").hidden = !el("spec-panel").hidden; });

let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener("pointerdown", (event) => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", (event) => { if (!dragging) return; state.yaw += (event.clientX - lastX) * 0.008; state.pitch += (event.clientY - lastY) * 0.008; state.pitch = Math.max(-1.1, Math.min(1.1, state.pitch)); lastX = event.clientX; lastY = event.clientY; renderViewport(); });
canvas.addEventListener("pointerup", () => { dragging = false; });
canvas.addEventListener("wheel", (event) => { event.preventDefault(); state.zoom = Math.max(0.5, Math.min(2.5, state.zoom * (event.deltaY > 0 ? 0.92 : 1.08))); renderViewport(); }, { passive: false });
window.addEventListener("resize", renderViewport);
renderAll();
