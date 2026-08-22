import { DEFAULT_JET_ENGINE_PARAMETERS } from "./jet-engine.mjs";

const numberWords = new Map([["one",1],["two",2],["three",3],["four",4],["five",5],["six",6],["seven",7],["eight",8],["nine",9],["ten",10],["eleven",11],["twelve",12]]);

function parseCount(text, pattern) {
  const match = text.match(pattern);
  if (!match) return null;
  const token = match[1].toLowerCase();
  const numeric = Number(token);
  return Number.isInteger(numeric) ? numeric : numberWords.get(token) ?? null;
}

export function parseIntent(prompt, currentDocument = null) {
  if (typeof prompt !== "string" || !prompt.trim()) throw new TypeError("prompt must be a non-empty string");
  const text = prompt.toLowerCase().replace(/\s+/g, " ").trim();

  if (/\b(show|use)\s+(an?\s+)?exploded\s+view\b|\bexplode(d)?\b/.test(text)) return { type: "SET_VIEW_MODE", mode: "exploded" };
  if (/\b(assembled|reset)\s+view\b/.test(text)) return { type: "SET_VIEW_MODE", mode: "assembled" };
  if (/\bhide\b.*\b(casing|outer casing)\b/.test(text)) return { type: "SET_VISIBILITY", target: "outer_casing", visible: false };
  if (/\bshow\b.*\b(casing|outer casing)\b/.test(text)) return { type: "SET_VISIBILITY", target: "outer_casing", visible: true };

  const isEngine = /\b(jet engine|turbojet|axial engine)\b/.test(text);
  if (isEngine) {
    const compressorStages = parseCount(text, /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+compressor\s+stages?\b/);
    const turbineStages = parseCount(text, /\b(\d+|one|two|three|four)\s+turbine\s+stages?\b/);
    return { type: "CREATE_ASSEMBLY", assembly: "jet_engine_concept", parameters: { ...DEFAULT_JET_ENGINE_PARAMETERS, ...(compressorStages ? { compressorStages } : {}), ...(turbineStages ? { turbineStages } : {}) } };
  }

  if (currentDocument?.metadata?.generator === "jet-engine-0.1") {
    const compressorStages = parseCount(text, /(?:compressor\s+stages?\s+(?:to\s+)?|increase\s+compressor\s+stages?\s+to\s+)(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/);
    if (compressorStages != null) return { type: "MODIFY_PARAMETER", patch: { compressorStages } };
    const turbineStages = parseCount(text, /(?:turbine\s+stages?\s+(?:to\s+)?|(?:use|set)\s+(?:only\s+)?)(\d+|one|two|three|four)(?:\s+turbine\s+stages?)?/);
    if (turbineStages != null && /turbine/.test(text)) return { type: "MODIFY_PARAMETER", patch: { turbineStages } };
    if (/\bmake\b.*\blonger\b/.test(text)) return { type: "MODIFY_PARAMETER", patch: { engineLengthMm: Math.round(currentDocument.metadata.parameters.engineLengthMm * 1.15) } };
    if (/\bshaft\b.*\b(thicker|larger)\b/.test(text)) return { type: "MODIFY_PARAMETER", patch: { shaftDiameterMm: Math.round(currentDocument.metadata.parameters.shaftDiameterMm * 1.15) } };
  }

  throw new Error("unsupported alpha command; try the jet-engine concept prompt or a documented modification command");
}
