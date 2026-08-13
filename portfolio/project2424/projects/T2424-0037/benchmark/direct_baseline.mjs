function numberOr(value, fallback) {
  if (value === undefined) return fallback;
  return Number(value);
}

function directHoleLayout({ width, height, count, radius, inset }) {
  if (!count) return [];
  if (count === 1) return [{ x: width / 2, y: height / 2, radius }];
  const candidates = [
    { x: inset, y: inset },
    { x: width - inset, y: inset },
    { x: width - inset, y: height - inset },
    { x: inset, y: height - inset }
  ];
  if (count === 2) return [candidates[0], candidates[2]].map((hole) => ({ ...hole, radius }));
  return candidates.slice(0, Math.min(count, candidates.length)).map((hole) => ({ ...hole, radius }));
}

// B0: direct flat-regex extraction without the typed method's object whitelist,
// numeric safety envelope, hole-count policy, or geometric validity checks.
export function directFlatParse(prompt) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) throw new TypeError('prompt must be non-empty');
  const text = prompt.toLowerCase().replace(/[×x]/gu, ' by ').replace(/\s+/gu, ' ').trim();

  const dimensions = text.match(/(-?\d+(?:\.\d+)?)\s*(?:mm\s*)?(?:by|wide\s+and)\s*(-?\d+(?:\.\d+)?)/u);
  if (!dimensions) throw new Error('dimensions not found');
  const width = Number(dimensions[1]);
  const height = Number(dimensions[2]);

  const thicknessMatch = text.match(/(?:thickness|thick)\s*(?:of\s*)?(-?\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const thickness = numberOr(thicknessMatch?.[1], 3);
  const holesMatch = text.match(/(?:with\s*)?(\d+)\s*(?:mounting\s*)?holes?/u);
  const holeCount = numberOr(holesMatch?.[1], 0);
  const radiusMatch = text.match(/\b(?:hole\s*)?(?:radius|r)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const diameterMatch = text.match(/\b(?:hole\s*)?(?:diameter|dia)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const radius = radiusMatch ? Number(radiusMatch[1]) : diameterMatch ? Number(diameterMatch[1]) / 2 : 0;
  const insetMatch = text.match(/(?:inset|margin|edge offset)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const inset = holeCount > 0 ? numberOr(insetMatch?.[1], 5) : 0;

  return {
    type: 'rectangular_plate',
    units: 'mm',
    width,
    height,
    thickness,
    holes: directHoleLayout({ width, height, count: holeCount, radius, inset })
  };
}
