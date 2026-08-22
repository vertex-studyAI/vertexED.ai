import { validateCADDocument } from "./alpha.mjs";

function finitePositive(value, label, max = 2_000) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) {
    throw new RangeError(`${label} must be a finite positive number <= ${max}`);
  }
  return value;
}

export function createFlangedTubeDocument(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("flanged tube parameters must be an object");
  const length = finitePositive(input.lengthMm ?? 160, "lengthMm");
  const outerRadius = finitePositive(input.outerRadiusMm ?? 34, "outerRadiusMm");
  const wallThickness = finitePositive(input.wallThicknessMm ?? 5, "wallThicknessMm");
  const flangeRadius = finitePositive(input.flangeRadiusMm ?? 56, "flangeRadiusMm");
  const flangeThickness = finitePositive(input.flangeThicknessMm ?? 9, "flangeThicknessMm");
  if (wallThickness >= outerRadius * 0.7) throw new RangeError("wallThicknessMm is too large for the tube radius");
  if (flangeRadius <= outerRadius) throw new RangeError("flangeRadiusMm must exceed outerRadiusMm");
  if (flangeThickness * 2 >= length) throw new RangeError("flange thickness must leave positive tube span");
  const innerRadius = outerRadius - wallThickness;
  const x0 = -length / 2;
  const x1 = length / 2 - flangeThickness;

  const objects = [
    {
      id: "tube_body",
      name: "Tube Body",
      type: "tube",
      group: "body",
      visible: true,
      transform: { x: x0, y: 0, z: 0 },
      params: { outerRadius, innerRadius, length }
    },
    {
      id: "flange_left",
      name: "Left Flange",
      type: "tube",
      group: "flanges",
      visible: true,
      transform: { x: x0, y: 0, z: 0 },
      params: { outerRadius: flangeRadius, innerRadius, length: flangeThickness }
    },
    {
      id: "flange_right",
      name: "Right Flange",
      type: "tube",
      group: "flanges",
      visible: true,
      transform: { x: x1, y: 0, z: 0 },
      params: { outerRadius: flangeRadius, innerRadius, length: flangeThickness }
    }
  ];

  return validateCADDocument({
    version: "neurocad-0.1",
    units: "mm",
    name: "Flanged Tube Concept",
    objects,
    assemblies: [{ id: "flanged_tube", name: "Flanged Tube Concept", children: objects.map((object) => object.id) }],
    metadata: {
      generator: "neurocad-flanged-tube-v0.1",
      scope: "conceptual-parametric-mechanical-component",
      mechanicalParams: { lengthMm: length, outerRadiusMm: outerRadius, wallThicknessMm: wallThickness, flangeRadiusMm: flangeRadius, flangeThicknessMm: flangeThickness }
    }
  });
}

export function interpretMechanicalPrompt(prompt) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) throw new TypeError("prompt must be a non-empty string");
  const text = prompt.toLowerCase().replace(/\s+/gu, " ").trim();
  if (!/\b(flanged tube|tube with flanges|flange tube)\b/u.test(text)) return null;
  const lengthMatch = text.match(/(?:length|long)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const outerMatch = text.match(/outer\s*(?:radius|r)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const wallMatch = text.match(/wall\s*(?:thickness|thick)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  return createFlangedTubeDocument({
    ...(lengthMatch ? { lengthMm: Number(lengthMatch[1]) } : {}),
    ...(outerMatch ? { outerRadiusMm: Number(outerMatch[1]) } : {}),
    ...(wallMatch ? { wallThicknessMm: Number(wallMatch[1]) } : {})
  });
}
