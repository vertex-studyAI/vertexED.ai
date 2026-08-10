function finitePositive(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} must be finite and > 0`);
  return number;
}

function integerInRange(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new RangeError(`${label} must be an integer in [${minimum}, ${maximum}]`);
  }
  return number;
}

export function parsePlatePrompt(prompt) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new TypeError("prompt must be a non-empty string");
  }
  const text = prompt.toLowerCase().replace(/[×x]/gu, " by ").replace(/\s+/gu, " ").trim();
  if (!/\b(plate|panel|bracket|rectangle)\b/u.test(text)) {
    throw new Error("supported prompts must describe a plate, panel, bracket, or rectangle");
  }

  const dimensions = text.match(/(?:plate|panel|bracket|rectangle)?\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm\s*)?(?:by|wide\s+and)\s*(\d+(?:\.\d+)?)/u);
  if (!dimensions) {
    throw new Error("prompt must include width and height, for example 'plate 80 by 40'");
  }
  const width = finitePositive(dimensions[1], "width");
  const height = finitePositive(dimensions[2], "height");

  const thicknessMatch = text.match(/(?:thickness|thick)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const thickness = thicknessMatch ? finitePositive(thicknessMatch[1], "thickness") : 3;

  const holesMatch = text.match(/(?:with\s*)?(\d+)\s*(?:mounting\s*)?holes?/u);
  const holeCount = holesMatch ? integerInRange(holesMatch[1], "hole count", 0, 16) : 0;
  const radiusMatch = text.match(/(?:hole\s*)?(?:radius|r)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const diameterMatch = text.match(/(?:hole\s*)?(?:diameter|dia)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  let holeRadius = 0;
  if (holeCount > 0) {
    if (radiusMatch) holeRadius = finitePositive(radiusMatch[1], "hole radius");
    else if (diameterMatch) holeRadius = finitePositive(diameterMatch[1], "hole diameter") / 2;
    else throw new Error("hole prompts must specify a radius or diameter");
  }

  const insetMatch = text.match(/(?:inset|margin|edge offset)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const inset = holeCount > 0 ? finitePositive(insetMatch?.[1] ?? 5, "hole inset") : 0;

  if (width > 2_000 || height > 2_000 || thickness > 200) {
    throw new RangeError("dimensions exceed the demo safety envelope");
  }
  if (holeCount > 0) {
    if (holeRadius >= Math.min(width, height) / 2) throw new RangeError("hole radius is too large for the plate");
    if (inset <= holeRadius) throw new RangeError("hole inset must exceed hole radius");
    if (inset >= width / 2 || inset >= height / 2) throw new RangeError("hole inset must fit inside the plate");
  }

  return {
    type: "rectangular_plate",
    units: "mm",
    width,
    height,
    thickness,
    holes: buildHoleLayout({ width, height, count: holeCount, radius: holeRadius, inset })
  };
}

export function buildHoleLayout({ width, height, count, radius, inset }) {
  if (count === 0) return [];
  if (![1, 2, 4].includes(count)) {
    throw new RangeError("current controlled-language renderer supports 1, 2, or 4 holes");
  }
  const candidates = [
    { x: inset, y: inset },
    { x: width - inset, y: inset },
    { x: width - inset, y: height - inset },
    { x: inset, y: height - inset }
  ];
  if (count === 1) return [{ x: width / 2, y: height / 2, radius }];
  if (count === 2) return [candidates[0], candidates[2]].map((hole) => ({ ...hole, radius }));
  return candidates.map((hole) => ({ ...hole, radius }));
}

export function toOpenScad(spec) {
  if (!spec || spec.type !== "rectangular_plate") throw new TypeError("unsupported CAD spec");
  const holeBlocks = spec.holes.map((hole) =>
    `    translate([${hole.x}, ${hole.y}, -1]) cylinder(h=${spec.thickness + 2}, r=${hole.radius}, $fn=48);`
  );
  const body = `    cube([${spec.width}, ${spec.height}, ${spec.thickness}], center=false);`;
  if (holeBlocks.length === 0) return `// T2424-0037 controlled NLP-to-CAD\n${body.trimStart()}\n`;
  return [
    "// T2424-0037 controlled NLP-to-CAD",
    "difference() {",
    body,
    ...holeBlocks,
    "}",
    ""
  ].join("\n");
}

export function toSvg(spec, options = {}) {
  if (!spec || spec.type !== "rectangular_plate") throw new TypeError("unsupported CAD spec");
  const scale = finitePositive(options.scale ?? 5, "scale");
  const padding = 12;
  const svgWidth = spec.width * scale + padding * 2;
  const svgHeight = spec.height * scale + padding * 2;
  const circles = spec.holes.map((hole) =>
    `<circle cx="${padding + hole.x * scale}" cy="${padding + hole.y * scale}" r="${hole.radius * scale}" fill="white" stroke="currentColor" stroke-width="2"/>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Parametric plate preview"><rect x="${padding}" y="${padding}" width="${spec.width * scale}" height="${spec.height * scale}" rx="3" fill="none" stroke="currentColor" stroke-width="3"/>${circles}</svg>`;
}

export function summarizeSpec(spec) {
  const removedArea = spec.holes.reduce((sum, hole) => sum + Math.PI * hole.radius ** 2, 0);
  const plateArea = spec.width * spec.height;
  return {
    widthMm: spec.width,
    heightMm: spec.height,
    thicknessMm: spec.thickness,
    holeCount: spec.holes.length,
    planarAreaMm2: plateArea,
    removedHoleAreaMm2: removedArea,
    remainingPlanarAreaMm2: plateArea - removedArea,
    approximateVolumeMm3: (plateArea - removedArea) * spec.thickness
  };
}
