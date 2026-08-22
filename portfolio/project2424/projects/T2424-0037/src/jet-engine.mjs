import { createCADDocument, validateCADDocument } from "./cad.mjs";

export const DEFAULT_JET_ENGINE_PARAMETERS = Object.freeze({
  engineLengthMm: 900,
  outerDiameterMm: 320,
  shaftDiameterMm: 45,
  compressorStages: 6,
  turbineStages: 2,
  inletLengthRatio: 0.12,
  compressorLengthRatio: 0.32,
  combustorLengthRatio: 0.20,
  turbineLengthRatio: 0.18,
  nozzleLengthRatio: 0.18
});

function requireInteger(value, name, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new RangeError(`${name} must be an integer in [${min}, ${max}]`);
}

export function validateJetEngineParameters(input) {
  const p = { ...DEFAULT_JET_ENGINE_PARAMETERS, ...input };
  for (const key of ["engineLengthMm", "outerDiameterMm", "shaftDiameterMm"]) {
    if (!Number.isFinite(p[key]) || p[key] <= 0) throw new RangeError(`${key} must be finite and > 0`);
  }
  requireInteger(p.compressorStages, "compressorStages", 3, 12);
  requireInteger(p.turbineStages, "turbineStages", 1, 4);
  if (p.shaftDiameterMm >= p.outerDiameterMm * 0.5) throw new RangeError("shaftDiameterMm must remain well inside the casing");
  const ratios = [p.inletLengthRatio, p.compressorLengthRatio, p.combustorLengthRatio, p.turbineLengthRatio, p.nozzleLengthRatio];
  if (ratios.some((ratio) => !Number.isFinite(ratio) || ratio <= 0)) throw new RangeError("section ratios must be finite and > 0");
  const ratioSum = ratios.reduce((sum, value) => sum + value, 0);
  if (Math.abs(ratioSum - 1) > 1e-6) throw new RangeError("section ratios must sum to 1");
  if (p.engineLengthMm > 3000 || p.outerDiameterMm > 1200) throw new RangeError("jet engine concept exceeds the alpha demo envelope");
  return p;
}

function xform(x) {
  return { translate: [x, 0, 0], rotate: [0, 90, 0], scale: [1, 1, 1] };
}

function addStage(objects, prefix, x, radius, shaftRadius, length, index, turbine = false) {
  const diskId = `${prefix}_disk_${String(index + 1).padStart(2, "0")}`;
  const bladeId = `${prefix}_blades_${String(index + 1).padStart(2, "0")}`;
  objects.push({ id: diskId, type: "disk", radius: radius * (turbine ? 0.76 : 0.82), length: Math.max(6, length * 0.12), transform: xform(x), visible: true, group: prefix });
  objects.push({ id: bladeId, type: "blade_ring", hubRadius: shaftRadius * 1.35, tipRadius: radius * (turbine ? 0.88 : 0.93), length: Math.max(8, length * 0.16), bladeCount: turbine ? 18 : 24, bladeThickness: Math.max(2, radius * 0.025), transform: xform(x + length * 0.12), visible: true, group: prefix });
  return [diskId, bladeId];
}

export function createJetEngineConcept(input = {}) {
  const p = validateJetEngineParameters(input);
  const radius = p.outerDiameterMm / 2;
  const shaftRadius = p.shaftDiameterMm / 2;
  const length = p.engineLengthMm;
  const inletLength = length * p.inletLengthRatio;
  const compressorLength = length * p.compressorLengthRatio;
  const combustorLength = length * p.combustorLengthRatio;
  const turbineLength = length * p.turbineLengthRatio;
  const nozzleLength = length * p.nozzleLengthRatio;
  const objects = [];
  const children = [];

  const inlet = { id: "inlet", type: "frustum", radiusStart: radius * 1.02, radiusEnd: radius * 0.94, length: inletLength, transform: xform(0), visible: true, group: "inlet" };
  objects.push(inlet); children.push(inlet.id);

  const shaft = { id: "central_shaft", type: "shaft", radius: shaftRadius, length: length * 0.86, transform: xform(inletLength * 0.55), visible: true, group: "shaft" };
  objects.push(shaft); children.push(shaft.id);

  const casing = { id: "outer_casing", type: "housing", outerRadius: radius, innerRadius: radius * 0.94, length: compressorLength + combustorLength + turbineLength, transform: xform(inletLength), visible: true, group: "casing", translucent: true };
  objects.push(casing); children.push(casing.id);

  const compressorStep = compressorLength / p.compressorStages;
  for (let i = 0; i < p.compressorStages; i += 1) {
    const ids = addStage(objects, "compressor", inletLength + compressorStep * (i + 0.18), radius, shaftRadius, compressorStep, i, false);
    children.push(...ids);
  }

  const combustorX = inletLength + compressorLength;
  const combustor = { id: "combustor_envelope", type: "tube", outerRadius: radius * 0.78, innerRadius: radius * 0.48, length: combustorLength, transform: xform(combustorX), visible: true, group: "combustor" };
  objects.push(combustor); children.push(combustor.id);

  const turbineX = combustorX + combustorLength;
  const turbineStep = turbineLength / p.turbineStages;
  for (let i = 0; i < p.turbineStages; i += 1) {
    const ids = addStage(objects, "turbine", turbineX + turbineStep * (i + 0.2), radius * 0.9, shaftRadius, turbineStep, i, true);
    children.push(...ids);
  }

  const nozzleX = turbineX + turbineLength;
  const nozzle = { id: "exhaust_nozzle", type: "frustum", radiusStart: radius * 0.91, radiusEnd: radius * 0.54, length: nozzleLength, transform: xform(nozzleX), visible: true, group: "nozzle" };
  objects.push(nozzle); children.push(nozzle.id);

  const document = createCADDocument({
    name: "Simplified Axial Jet Engine Concept",
    objects,
    assemblies: [{ id: "turbojet_concept", name: "Turbojet Concept", children }],
    metadata: { kind: "conceptual_educational_assembly", generator: "jet-engine-0.1", parameters: p, nonClaims: ["airworthy", "manufacturable", "thermodynamically validated", "structurally validated"] }
  });
  const validation = validateCADDocument(document);
  if (validation.status !== "PASS") throw new Error("generated jet engine concept failed CAD validation");
  return document;
}

export function updateJetEngineConcept(document, patch) {
  return createJetEngineConcept({ ...(document?.metadata?.parameters ?? {}), ...patch });
}
