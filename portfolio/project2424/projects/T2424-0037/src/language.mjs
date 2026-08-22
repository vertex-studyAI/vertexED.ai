import { interpretPrompt, validateCADDocument } from "./alpha.mjs";
import { interpretMechanicalPrompt } from "./mechanical.mjs";

const NUMBER_WORDS = new Map([
  ["one", "1"], ["two", "2"], ["three", "3"], ["four", "4"],
  ["five", "5"], ["six", "6"], ["seven", "7"], ["eight", "8"],
  ["nine", "9"], ["ten", "10"], ["eleven", "11"], ["twelve", "12"]
]);

export function normalizeEngineeringCommand(prompt, hasCurrentDocument = false) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) throw new TypeError("prompt must be a non-empty string");
  let normalized = prompt.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/giu, (word) => NUMBER_WORDS.get(word.toLowerCase()));
  const lower = normalized.toLowerCase();
  const isJetCreation = /\b(create|generate|build|concept)\b/u.test(lower) && /\b(jet engine|turbojet|turbine engine)\b/u.test(lower);
  if (hasCurrentDocument && !isJetCreation) {
    normalized = normalized
      .replace(/\b(?:use\s+only\s+)?(\d+)\s+compressor\s+stages?\b/giu, "compressor stages to $1")
      .replace(/\b(?:use\s+only\s+)?(\d+)\s+turbine\s+stages?\b/giu, "turbine stages to $1");
  }
  return normalized;
}

export function interpretCADCommand(prompt, currentDocument = null) {
  const normalized = normalizeEngineeringCommand(prompt, Boolean(currentDocument));
  const mechanical = interpretMechanicalPrompt(normalized);
  if (mechanical) {
    return {
      intent: "CREATE_ASSEMBLY",
      document: mechanical,
      view: { exploded: false, casingVisible: true }
    };
  }

  const result = interpretPrompt(normalized, currentDocument);
  const text = normalized.toLowerCase().replace(/\s+/gu, " ").trim();
  if (/\b(show|unhide)\b.*\bcasing\b/u.test(text) && result.document.objects.some((object) => object.id === "outer_casing")) {
    result.document = validateCADDocument({
      ...result.document,
      objects: result.document.objects.map((object) => object.id === "outer_casing" ? { ...object, visible: true } : object)
    });
    result.view = { ...result.view, casingVisible: true };
  }
  return result;
}
