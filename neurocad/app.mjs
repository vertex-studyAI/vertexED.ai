import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  DEFAULT_JET_ENGINE_PARAMETERS,
  NEUROCAD_PRODUCT_NAME,
  createJetEngineDocument,
  interpretNeuroCadCommand,
  serializeCADDocument,
  summarizeCADDocument,
  toOpenScadDocument,
  validateCADDocument
} from "./src/alpha.mjs";

const PRESETS = Object.freeze({
  plate: "Create a plate 100 by 60 mm, thickness 4 mm, with 4 mounting holes, hole radius 4 mm, edge offset 10 mm.",
  flange: "Create a flanged tube assembly.",
  jet: "Generate a simplified axial jet-engine concept with an inlet, six compressor stages, a central shaft, combustor envelope, two turbine stages, outer casing and exhaust nozzle."
});

const $ = (selector) => document.querySelector(selector);
const promptElement = $("#prompt");
const generateButton = $("#generate");
const errorElement = $("#error");
const validationChip = $("#validation-chip");
const cadspecElement = $("#cadspec");
const assemblyTreeElement = $("#assembly-tree");
const diagnosticsElement = $("#diagnostics");
const parameterForm = $("#parameter-form");
const modelNameElement = $("#model-name");
const objectCountElement = $("#object-count");
const selectionLabel = $("#selection-label");
const toggleCasingButton = $("#toggle-casing");
const toggleExplodedButton = $("#toggle-exploded");
const exportJsonButton = $("#export-json");
const exportScadButton = $("#export-scad");
const copyJsonButton = $("#copy-json");
const canvas = $("#viewport");
const viewportWrap = $("#viewport-wrap");
const viewerFallback = $("#viewer-fallback");

let currentDocument = null;
let selectedObjectId = null;
let renderer = null;
let scene = null;
let camera = null;
let controls = null;
let modelRoot = null;
let animationFrame = null;
let raycaster = null;
let pointer = null;
const renderedObjects = new Map();
const objectMaterials = new Map();

function setPipeline(activeIndex, failed = false) {
  const steps = [...document.querySelectorAll("#pipeline li")];
  steps.forEach((step, index) => {
    step.classList.toggle("done", !failed && index < activeIndex);
    step.classList.toggle("active", !failed && index === activeIndex);
  });
}

function setError(error) {
  errorElement.textContent = error ? (error instanceof Error ? error.message : String(error)) : "";
}

function setValidation(diagnostics) {
  if (!diagnostics) {
    validationChip.textContent = "NOT RUN";
    validationChip.className = "status-chip neutral";
    diagnosticsElement.replaceChildren(createText("p", "No validation run yet.", "empty"));
    return;
  }
  const pass = diagnostics.status === "PASS";
  validationChip.textContent = pass ? "VALIDATION PASS" : "VALIDATION FAIL";
  validationChip.className = `status-chip ${pass ? "pass" : "fail"}`;
  diagnosticsElement.replaceChildren();
  if (pass && diagnostics.warnings.length === 0) {
    diagnosticsElement.append(createDiagnostic("PASS", "All schema, finite-number, primitive and assembly-graph checks passed.", "pass"));
  }
  for (const error of diagnostics.errors) diagnosticsElement.append(createDiagnostic(error.code, error.message, "error"));
  for (const warning of diagnostics.warnings) diagnosticsElement.append(createDiagnostic(warning.code, warning.message, "warn"));
}

function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function createDiagnostic(code, message, kind) {
  const item = document.createElement("div");
  item.className = `diagnostic-item ${kind}`;
  item.append(createText("strong", code), createText("p", message));
  return item;
}

function initializeViewer() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x070b10, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 1, 10000);
    camera.position.set(1150, 760, 920);
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 0, 0);
    controls.minDistance = 120;
    controls.maxDistance = 5000;
    scene.add(new THREE.HemisphereLight(0xc8e6ff, 0x152030, 2.25));
    const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(600, 800, 900); scene.add(key);
    const rim = new THREE.DirectionalLight(0x62c9ff, 2.1); rim.position.set(-900, 120, -600); scene.add(rim);
    const grid = new THREE.GridHelper(2600, 52, 0x33506b, 0x1b2938); grid.rotation.z = Math.PI / 2; grid.position.x = -600; scene.add(grid);
    modelRoot = new THREE.Group(); scene.add(modelRoot);
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2();
    const resizeObserver = new ResizeObserver(resizeViewer); resizeObserver.observe(viewportWrap);
    canvas.addEventListener("pointerup", onViewportPointer);
    animate();
  } catch (error) {
    viewerFallback.hidden = false;
    console.error("NeuroCAD 3D viewer initialization failed", error);
  }
}

function resizeViewer() {
  if (!renderer || !camera) return;
  const rect = viewportWrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  if (!renderer || !scene || !camera) return;
  controls?.update(); renderer.render(scene, camera); animationFrame = requestAnimationFrame(animate);
}

function disposeObject(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) { if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose()); else child.material.dispose(); }
  });
}

function clearModel() {
  selectedObjectId = null; renderedObjects.clear(); objectMaterials.clear();
  if (!modelRoot) return;
  while (modelRoot.children.length) { const child = modelRoot.children.pop(); disposeObject(child); }
  selectionLabel.textContent = "Nothing selected";
}

function materialForObject(object) {
  const role = object.materialRole, casing = role === "casing";
  const material = new THREE.MeshStandardMaterial({
    color: role.includes("turbine") ? 0xe4a96b : role.includes("compressor") ? 0x78b9e8 : role === "shaft" ? 0xc8d2de : role === "combustor" ? 0xd6a05e : casing ? 0x5f7489 : 0x91a7bc,
    metalness: casing ? 0.52 : 0.68, roughness: casing ? 0.38 : 0.28, transparent: casing, opacity: casing ? 0.23 : 1, side: THREE.DoubleSide
  });
  objectMaterials.set(object.id, material); return material;
}

function annulusGeometry(innerRadius, outerRadius, length) {
  const shape = new THREE.Shape(); shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  if (innerRadius > 0) { const hole = new THREE.Path(); hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true); shape.holes.push(hole); }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false, curveSegments: 48, steps: 1 });
  geometry.translate(0, 0, -length / 2); geometry.rotateY(Math.PI / 2); geometry.computeVertexNormals(); return geometry;
}

function roleTwist(role) { if (role === "compressor_rotor") return 0.10; if (role === "compressor_stator") return -0.10; if (role === "turbine") return 0.18; return 0; }
function bladeRingGroup(object, material) {
  const { hubRadius, tipRadius, thickness, bladeChord, bladeCount } = object.dimensions;
  const group = new THREE.Group();
  const hubGeometry = new THREE.CylinderGeometry(hubRadius, hubRadius, thickness, 40); hubGeometry.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeometry, material); hub.userData.objectId = object.id; group.add(hub);
  const radialLength = tipRadius - hubRadius, bladeGeometry = new THREE.BoxGeometry(thickness, radialLength, bladeChord), centerRadius = hubRadius + radialLength / 2;
  for (let index = 0; index < bladeCount; index += 1) {
    const angle = index / bladeCount * Math.PI * 2, blade = new THREE.Mesh(bladeGeometry, material);
    blade.position.set(0, Math.cos(angle) * centerRadius, Math.sin(angle) * centerRadius); blade.rotation.x = -angle; blade.rotation.z = roleTwist(object.materialRole); blade.userData.objectId = object.id; group.add(blade);
  }
  return group;
}

function meshForObject(object) {
  const d = object.dimensions, material = materialForObject(object); let visual;
  if (object.type === "cylinder") { const geometry = new THREE.CylinderGeometry(d.radius, d.radius, d.length, 48); geometry.rotateZ(Math.PI / 2); visual = new THREE.Mesh(geometry, material); }
  else if (["tube", "ring", "disk"].includes(object.type)) visual = new THREE.Mesh(annulusGeometry(d.innerRadius, d.outerRadius, d.length), material);
  else if (object.type === "frustum") { const geometry = new THREE.CylinderGeometry(d.endRadius, d.startRadius, d.length, 64, 1, false); geometry.rotateZ(Math.PI / 2); visual = new THREE.Mesh(geometry, material); }
  else if (object.type === "blade_ring") visual = bladeRingGroup(object, material);
  else if (object.type === "rectangular_plate") visual = new THREE.Mesh(new THREE.BoxGeometry(d.thickness, d.width, d.height), material);
  else throw new Error(`No browser geometry renderer for ${object.type}`);
  visual.name = object.name; visual.userData.objectId = object.id; visual.position.fromArray(object.transform.position); visual.rotation.set(...object.transform.rotation); visual.scale.fromArray(object.transform.scale); visual.visible = object.visible; visual.traverse((child) => { child.userData.objectId = object.id; }); return visual;
}

function renderDocument(document) {
  clearModel(); if (!modelRoot) return;
  for (const object of document.objects) { const visual = meshForObject(object); modelRoot.add(visual); renderedObjects.set(object.id, visual); }
  objectCountElement.textContent = `${document.objects.length} components`; fitCameraToModel();
}

function fitCameraToModel() {
  if (!camera || !controls || !modelRoot || modelRoot.children.length === 0) return;
  const box = new THREE.Box3().setFromObject(modelRoot); if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere()); const distance = Math.max(250, sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.15); const direction = new THREE.Vector3(1, 0.65, 0.82).normalize();
  camera.position.copy(sphere.center).add(direction.multiplyScalar(distance)); controls.target.copy(sphere.center); camera.near = Math.max(0.5, distance / 1000); camera.far = Math.max(10000, distance * 6); camera.updateProjectionMatrix(); controls.update();
}
function resetCamera() { if (!camera || !controls) return; camera.position.set(1150, 760, 920); controls.target.set(0, 0, 0); controls.update(); }

function onViewportPointer(event) {
  if (!raycaster || !camera || !renderer || !modelRoot) return;
  const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(modelRoot, true), objectId = hits.find((hit) => hit.object.userData.objectId)?.object.userData.objectId; if (objectId) selectObject(objectId);
}

function selectObject(objectId) {
  selectedObjectId = objectId;
  for (const [id, material] of objectMaterials) { if (!(material instanceof THREE.MeshStandardMaterial)) continue; material.emissive.setHex(id === objectId ? 0x174a67 : 0x000000); material.emissiveIntensity = id === objectId ? 0.75 : 0; }
  const object = currentDocument?.objects.find((entry) => entry.id === objectId); selectionLabel.textContent = object ? object.name : objectId;
  for (const row of document.querySelectorAll(".tree-row")) row.classList.toggle("selected", row.dataset.objectId === objectId);
}

function renderAssemblyTree(cadDocument) {
  assemblyTreeElement.replaceChildren();
  const objectMap = new Map(cadDocument.objects.map((object) => [object.id, object])), assemblyMap = new Map(cadDocument.assemblies.map((assembly) => [assembly.id, assembly])), rootId = cadDocument.metadata.rootAssemblyId ?? cadDocument.assemblies.at(-1)?.id;
  if (!rootId || !assemblyMap.has(rootId)) { assemblyTreeElement.append(createText("p", "No assembly hierarchy available.", "empty")); return; }
  const renderAssembly = (assemblyId, ancestry = new Set()) => {
    const assembly = assemblyMap.get(assemblyId), wrapper = document.createElement("div"); wrapper.className = "tree-node"; if (!assembly || ancestry.has(assemblyId)) return wrapper;
    const row = document.createElement("div"); row.className = "tree-row"; row.append(createText("span", "A", "tree-kind"));
    const toggle = document.createElement("input"); toggle.type = "checkbox"; toggle.checked = true; toggle.setAttribute("aria-label", `Toggle ${assembly.name}`); toggle.addEventListener("change", () => setAssemblyVisibility(assembly, toggle.checked, assemblyMap)); row.append(toggle); row.append(createText("button", assembly.name)); wrapper.append(row);
    const children = document.createElement("div"); children.className = "tree-children"; const nextAncestry = new Set(ancestry).add(assemblyId);
    for (const child of assembly.children) {
      if (child.kind === "assembly") children.append(renderAssembly(child.ref, nextAncestry));
      else { const object = objectMap.get(child.ref); if (!object) continue; const childRow = document.createElement("div"); childRow.className = "tree-row"; childRow.dataset.objectId = object.id; childRow.append(createText("span", "O", "tree-kind")); const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = object.visible; checkbox.setAttribute("aria-label", `Toggle ${object.name}`); checkbox.addEventListener("change", () => { const visual = renderedObjects.get(object.id); if (visual) visual.visible = checkbox.checked; }); childRow.append(checkbox); const button = createText("button", object.name); button.type = "button"; button.addEventListener("click", () => selectObject(object.id)); childRow.append(button); children.append(childRow); }
    }
    wrapper.append(children); return wrapper;
  };
  assemblyTreeElement.append(renderAssembly(rootId));
}

function setAssemblyVisibility(assembly, visible, assemblyMap, seen = new Set()) {
  if (seen.has(assembly.id)) return; seen.add(assembly.id);
  for (const child of assembly.children) { if (child.kind === "object") { const visual = renderedObjects.get(child.ref); if (visual) visual.visible = visible; } else { const nested = assemblyMap.get(child.ref); if (nested) setAssemblyVisibility(nested, visible, assemblyMap, seen); } }
}

function renderParameters(cadDocument) {
  parameterForm.replaceChildren();
  if (cadDocument.metadata.kind !== "jet_engine_concept") { parameterForm.append(createText("p", "Editable alpha parameters are currently exposed for the jet-engine concept only.", "empty")); return; }
  const parameters = cadDocument.metadata.parameters;
  const fields = [["engineLengthMm","Length (mm)",400,1600,10],["outerDiameterMm","Outer diameter (mm)",160,600,5],["shaftDiameterMm","Shaft diameter (mm)",12,140,1],["compressorStages","Compressor stages",3,12,1],["turbineStages","Turbine stages",1,4,1],["explodedSpacingMm","Exploded spacing (mm)",0,180,10]];
  for (const [key, labelText, min, max, step] of fields) { const label = document.createElement("label"); label.append(createText("span", labelText)); const input = document.createElement("input"); input.type = "number"; input.name = key; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(parameters[key]); label.append(input); parameterForm.append(label); }
  const casingLabel = document.createElement("label"); casingLabel.className = "toggle-label"; casingLabel.append(createText("span", "Outer casing visible")); const casingInput = document.createElement("input"); casingInput.type = "checkbox"; casingInput.name = "casingVisible"; casingInput.checked = parameters.casingVisible; casingLabel.append(casingInput); parameterForm.append(casingLabel);
  const update = createText("button", "Update model", "button primary"); update.type = "submit"; parameterForm.append(update);
}

parameterForm.addEventListener("submit", (event) => {
  event.preventDefault(); if (currentDocument?.metadata?.kind !== "jet_engine_concept") return;
  const form = new FormData(parameterForm), next = { ...currentDocument.metadata.parameters };
  for (const key of ["engineLengthMm", "outerDiameterMm", "shaftDiameterMm", "compressorStages", "turbineStages", "explodedSpacingMm"]) next[key] = Number(form.get(key));
  next.casingVisible = form.get("casingVisible") === "on"; try { commitDocument(createJetEngineDocument(next)); } catch (error) { handleGenerationError(error); }
});

function commitDocument(document) {
  const diagnostics = validateCADDocument(document); setValidation(diagnostics); if (diagnostics.status !== "PASS") throw new Error(diagnostics.errors.map((error) => `${error.code}: ${error.message}`).join("\n"));
  currentDocument = diagnostics.document; cadspecElement.textContent = serializeCADDocument(currentDocument); const summary = summarizeCADDocument(currentDocument); modelNameElement.textContent = currentDocument.name; objectCountElement.textContent = `${summary.objectCount} components`; renderDocument(currentDocument); renderAssemblyTree(currentDocument); renderParameters(currentDocument);
  exportJsonButton.disabled = false; exportScadButton.disabled = false; copyJsonButton.disabled = false; const jet = currentDocument.metadata.kind === "jet_engine_concept"; toggleCasingButton.disabled = !jet; toggleExplodedButton.disabled = !jet;
  if (jet) { toggleCasingButton.textContent = currentDocument.metadata.parameters.casingVisible ? "Hide casing" : "Show casing"; toggleExplodedButton.textContent = currentDocument.metadata.parameters.explodedSpacingMm > 0 ? "Assembled" : "Exploded"; }
  setPipeline(4); requestAnimationFrame(() => setPipeline(5));
}
function handleGenerationError(error) { setPipeline(-1, true); setError(error); if (error?.diagnostics) setValidation(error.diagnostics); else validationChip.className = "status-chip fail", validationChip.textContent = "FAILED CLOSED"; }
function runCommand(text = promptElement.value) { setError(null); setPipeline(0); try { setPipeline(1); const result = interpretNeuroCadCommand(text, currentDocument); setPipeline(2); if (result.diagnostics.status !== "PASS") throw new Error(result.diagnostics.errors.map((entry) => entry.message).join("\n")); setPipeline(3); commitDocument(result.document); } catch (error) { handleGenerationError(error); } }
function downloadText(filename, content, type) { const blob = new Blob([content], { type }), url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
function switchTab(tabName) { for (const button of document.querySelectorAll("[data-tab]")) button.setAttribute("aria-selected", String(button.dataset.tab === tabName)); for (const panel of ["assembly", "parameters", "validation"]) $("#tab-" + panel).hidden = panel !== tabName; }
for (const button of document.querySelectorAll("[data-tab]")) button.addEventListener("click", () => switchTab(button.dataset.tab));
for (const button of document.querySelectorAll("[data-preset]")) button.addEventListener("click", () => { const preset = button.dataset.preset; promptElement.value = PRESETS[preset]; if (preset === "jet") currentDocument = null; runCommand(); });
generateButton.addEventListener("click", () => runCommand());
promptElement.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") runCommand(); });
$("#reset-command").addEventListener("click", () => { promptElement.value = PRESETS.jet; setError(null); });
$("#hero-jet").addEventListener("click", () => { promptElement.value = PRESETS.jet; document.querySelector("#demo").scrollIntoView({ behavior: "smooth", block: "start" }); currentDocument = null; runCommand(); });
$("#fit-camera").addEventListener("click", fitCameraToModel); $("#reset-camera").addEventListener("click", resetCamera);
toggleCasingButton.addEventListener("click", () => { if (currentDocument?.metadata?.kind !== "jet_engine_concept") return; commitDocument(createJetEngineDocument({ ...currentDocument.metadata.parameters, casingVisible: !currentDocument.metadata.parameters.casingVisible })); });
toggleExplodedButton.addEventListener("click", () => { if (currentDocument?.metadata?.kind !== "jet_engine_concept") return; const exploded = currentDocument.metadata.parameters.explodedSpacingMm > 0; commitDocument(createJetEngineDocument({ ...currentDocument.metadata.parameters, explodedSpacingMm: exploded ? 0 : 70 })); });
exportJsonButton.addEventListener("click", () => { if (currentDocument) downloadText("neurocad-model.json", serializeCADDocument(currentDocument), "application/json"); });
exportScadButton.addEventListener("click", () => { if (currentDocument) downloadText("neurocad-model.scad", toOpenScadDocument(currentDocument), "text/plain"); });
copyJsonButton.addEventListener("click", async () => { if (!currentDocument) return; try { await navigator.clipboard.writeText(serializeCADDocument(currentDocument)); copyJsonButton.textContent = "Copied"; setTimeout(() => { copyJsonButton.textContent = "Copy JSON"; }, 1200); } catch { copyJsonButton.textContent = "Copy unavailable"; } });
window.addEventListener("beforeunload", () => { if (animationFrame) cancelAnimationFrame(animationFrame); });
initializeViewer();
runCommand(PRESETS.jet);
