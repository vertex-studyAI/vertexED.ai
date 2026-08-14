import { directFlatParse } from './direct_baseline.mjs';

function finitePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be finite and > 0`);
  return value;
}

function originalHoleCount(prompt) {
  const text = prompt.toLowerCase().replace(/[×x]/gu, ' by ').replace(/\s+/gu, ' ').trim();
  const holesMatch = text.match(/(?:with\s*)?(\d+)\s*(?:mounting\s*)?holes?/u);
  return holesMatch ? Number(holesMatch[1]) : 0;
}

// B1: preserve the direct flat extractor, then add a fail-closed validation
// layer comparable in intent to the method's safety/geometry envelope. This
// intentionally does not call parsePlatePrompt or reuse its template regexes.
export function validatedDirectParse(prompt) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) throw new TypeError('prompt must be non-empty');
  const text = prompt.toLowerCase().replace(/[×x]/gu, ' by ').replace(/\s+/gu, ' ').trim();
  if (!/\b(plate|panel|bracket|rectangle)\b/u.test(text)) {
    throw new Error('supported prompts must describe a plate, panel, bracket, or rectangle');
  }

  const spec = directFlatParse(prompt);
  finitePositive(spec.width, 'width');
  finitePositive(spec.height, 'height');
  finitePositive(spec.thickness, 'thickness');
  if (spec.width > 2_000 || spec.height > 2_000 || spec.thickness > 200) {
    throw new RangeError('dimensions exceed the demo safety envelope');
  }

  const requestedCount = originalHoleCount(prompt);
  if (![0, 1, 2, 4].includes(requestedCount)) {
    throw new RangeError('current controlled-language renderer supports 1, 2, or 4 holes');
  }
  if (!Array.isArray(spec.holes) || spec.holes.length !== requestedCount) {
    throw new RangeError('parsed hole count does not match requested hole count');
  }

  for (const hole of spec.holes) {
    finitePositive(hole.radius, 'hole radius');
    if (!Number.isFinite(hole.x) || !Number.isFinite(hole.y)) {
      throw new RangeError('hole center must be finite');
    }
    if (hole.radius >= Math.min(spec.width, spec.height) / 2) {
      throw new RangeError('hole radius is too large for the plate');
    }
    if (
      hole.x - hole.radius <= 0 ||
      hole.y - hole.radius <= 0 ||
      hole.x + hole.radius >= spec.width ||
      hole.y + hole.radius >= spec.height
    ) {
      throw new RangeError('hole geometry must fit inside the plate');
    }
  }

  return spec;
}
