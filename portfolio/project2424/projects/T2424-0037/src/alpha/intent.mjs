import { validatePlateSpec } from "../core.mjs";
import {
  createFlangedTubeDocument,
  interpretNeuroCadCommand as interpretEngineCommand
} from "./engine.mjs";
import { validateCADDocument } from "./schema.mjs";

function normalizePrompt(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new TypeError("prompt must be a non-empty string");
  }
  return prompt.toLowerCase().replace(/\s+/gu, " ").trim();
}

function captureNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function resolveRadius(radius, diameter, label) {
  if (radius !== null && diameter !== null && Math.abs(radius * 2 - diameter) > 1e-9) {
    throw new Error(`Conflicting ${label} radius and diameter values.`);
  }
  if (radius !== null) return radius;
  if (diameter !== null) return diameter / 2;
  return null;
}

function parseFlangedTubeParameters(text) {
  const numeric = "-?\\d+(?:\\.\\d+)?";
  const length = captureNumber(text, [
    new RegExp(`\\b(?:tube\\s+)?length\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u"),
    new RegExp(`\\b(${numeric})\\s*mm\\s*(?:long|length)\\b`, "u")
  ]);
  const outerRadius = captureNumber(text, [
    new RegExp(`(?<!flange\\s)\\b(?:tube\\s+)?outer\\s+radius\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u")
  ]);
  const outerDiameter = captureNumber(text, [
    new RegExp(`(?<!flange\\s)\\b(?:tube\\s+)?outer\\s+diameter\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u")
  ]);
  const wallThickness = captureNumber(text, [
    new RegExp(`\\bwall(?:\\s+thickness)?\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u"),
    new RegExp(`\\b(${numeric})\\s*mm\\s+wall(?:\\s+thickness)?\\b`, "u")
  ]);
  const flangeOuterRadius = captureNumber(text, [
    new RegExp(`\\bflange\\s+outer\\s+radius\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u")
  ]);
  const flangeDiameter = captureNumber(text, [
    new RegExp(`\\bflange(?:\\s+outer)?\\s+diameter\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u")
  ]);
  const flangeThickness = captureNumber(text, [
    new RegExp(`\\bflange\\s+thickness\\s*(?:to|=|of|is)?\\s*(${numeric})\\s*mm\\b`, "u"),
    new RegExp(`\\b(${numeric})\\s*mm\\s+flange\\s+thickness\\b`, "u")
  ]);

  const resolvedOuterRadius = resolveRadius(outerRadius, outerDiameter, "tube outer");
  const resolvedFlangeOuterRadius = resolveRadius(flangeOuterRadius, flangeDiameter, "flange outer");
  const parameters = {};
  if (length !== null) parameters.length = length;
  if (resolvedOuterRadius !== null) parameters.outerRadius = resolvedOuterRadius;
  if (wallThickness !== null) parameters.wallThickness = wallThickness;
  if (resolvedFlangeOuterRadius !== null) parameters.flangeOuterRadius = resolvedFlangeOuterRadius;
  if (flangeThickness !== null) parameters.flangeThickness = flangeThickness;
  return parameters;
}

function currentFlangedTubeParameters(current) {
  const tube = current?.objects?.find((object) => object.id === "tube_body");
  const flange = current?.objects?.find((object) => object.id === "front_flange");
  if (!tube || !flange) {
    throw new Error("Cannot edit this flanged tube because its generated parameter source could not be recovered.");
  }
  const { length, outerRadius, innerRadius } = tube.dimensions ?? {};
  const flangeOuterRadius = flange.dimensions?.outerRadius;
  const flangeThickness = flange.dimensions?.length;
  if (![length, outerRadius, innerRadius, flangeOuterRadius, flangeThickness].every(Number.isFinite)) {
    throw new Error("Cannot edit this flanged tube because its current dimensions are invalid.");
  }
  return {
    length,
    outerRadius,
    wallThickness: outerRadius - innerRadius,
    flangeOuterRadius,
    flangeThickness
  };
}

function validatedResult(intent, document) {
  return {
    intent,
    document,
    diagnostics: validateCADDocument(document, validatePlateSpec)
  };
}

export function interpretNeuroCadCommand(prompt, current = null) {
  const text = normalizePrompt(prompt);

  if (/\bbrackets?\b/u.test(text)) {
    throw new Error(
      "Brackets are not supported in NeuroCAD Alpha 0.1. Use a rectangular plate/panel with optional holes, a flanged tube, or the conceptual jet-engine assembly."
    );
  }

  if (/\bflanged\s+tube\b/u.test(text)) {
    return validatedResult("CREATE_ASSEMBLY", createFlangedTubeDocument(parseFlangedTubeParameters(text)));
  }

  if (current?.metadata?.kind === "flanged_tube") {
    const updates = parseFlangedTubeParameters(text);
    if (Object.keys(updates).length > 0) {
      const parameters = { ...currentFlangedTubeParameters(current), ...updates };
      return validatedResult("EDIT_ASSEMBLY", createFlangedTubeDocument(parameters));
    }
  }

  return interpretEngineCommand(prompt, current);
}
