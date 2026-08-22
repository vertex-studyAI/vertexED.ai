function finitePositive(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} must be finite and > 0`);
  return number;
}

function strictFinitePositive(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite positive number`);
  }
  return value;
}

function strictFiniteCoordinate(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number`);
  }
  return value;
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
  if (/(?:^|[\s,(])-\d+(?:\.\d+)?/u.test(text)) {
    throw new RangeError("negative numeric values are not supported");
  }
  if (!/\b(plate|panel|bracket|rectangle)\b/u.test(text)) {
    throw new Error("supported prompts must describe a plate, panel, bracket, or rectangle");
  }

  const dimensions = text.match(/(?:plate|panel|bracket|rectangle)?\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm\s*)?(?:by|wide\s+and)\s*(\d+(?:\.\d+)?)/u);
  if (!dimensions) throw new Error("prompt must include width and height, for example 'plate 80 by 40'");
  const width = finitePositive(dimensions[1], "width");
  const height = finitePositive(dimensions[2], "height");

  const thicknessMatch = text.match(/(?:thickness|thick)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const thickness = thicknessMatch ? finitePositive(thicknessMatch[1], "thickness") : 3;
  const holesMatch = text.match(/(?:with\s*)?(\d+)\s*(?:mounting\s*)?holes?/u);
  const holeCount = holesMatch ? integerInRange(holesMatch[1], "hole count", 0, 16) : 0;
  const radiusMatch = text.match(/\b(?:hole\s*)?(?:radius|r)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const diameterMatch = text.match(/\b(?:hole\s*)?(?:diameter|dia)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  let holeRadius = 0;
  if (holeCount > 0) {
    if (radiusMatch) holeRadius = finitePositive(radiusMatch[1], "hole radius");
    else if (diameterMatch) holeRadius = finitePositive(diameterMatch[1], "hole diameter") / 2;
    else throw new Error("hole prompts must specify a radius or diameter");
  }

  const insetMatch = text.match(/(?:inset|margin|edge offset)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?/u);
  const inset = holeCount > 0 ? finitePositive(insetMatch?.[1] ?? 5, "hole inset") : 0;

  if (width > 2_000 || height > 2_000 || thickness > 200) throw new RangeError("dimensions exceed the demo safety envelope");
  if (holeCount > 0) {
    if (holeRadius >= Math.min(width, height) / 2) throw new RangeError("hole radius is too large for the plate");
    if (inset <= holeRadius) throw new RangeError("hole inset must exceed hole radius");
    if (inset >= width / 2 || inset >= height / 2) throw new RangeError("hole inset must fit inside the plate");
  }

  return { type: "rectangular_plate", units: "mm", width, height, thickness, holes: buildHoleLayout({ width, height, count: holeCount, radius: holeRadius, inset }) };
}

export function buildHoleLayout({ width, height, count, radius, inset }) {
  if (count === 0) return [];
  if (![1, 2, 4].includes(count)) throw new RangeError("current controlled-language renderer supports 1, 2, or 4 holes");
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

export function validatePlateSpec(spec) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) throw new TypeError("CAD spec must be an object");
  if (spec.type !== "rectangular_plate") throw new TypeError("unsupported CAD spec");
  if (spec.units !== "mm") throw new TypeError("CAD spec units must be 'mm'");

  const width = strictFinitePositive(spec.width, "width");
  const height = strictFinitePositive(spec.height, "height");
  const thickness = strictFinitePositive(spec.thickness, "thickness");
  if (width > 2_000 || height > 2_000 || thickness > 200) throw new RangeError("dimensions exceed the demo safety envelope");

  if (!Array.isArray(spec.holes)) throw new TypeError("CAD spec holes must be an array");
  if (![0, 1, 2, 4].includes(spec.holes.length)) {
    throw new RangeError("current controlled-language renderer supports 0, 1, 2, or 4 holes");
  }

  const holes = spec.holes.map((hole, index) => {
    if (!hole || typeof hole !== "object" || Array.isArray(hole)) throw new TypeError(`hole ${index} must be an object`);
    const x = strictFiniteCoordinate(hole.x, `hole ${index} x`);
    const y = strictFiniteCoordinate(hole.y, `hole ${index} y`);
    const radius = strictFinitePositive(hole.radius, `hole ${index} radius`);
    if (x - radius < 0 || x + radius > width || y - radius < 0 || y + radius > height) {
      throw new RangeError(`hole ${index} must fit fully inside the plate`);
    }
    return { x, y, radius };
  });

  for (let left = 0; left < holes.length; left += 1) {
    for (let right = left + 1; right < holes.length; right += 1) {
      const dx = holes[left].x - holes[right].x;
      const dy = holes[left].y - holes[right].y;
      if (Math.hypot(dx, dy) <= holes[left].radius + holes[right].radius) {
        throw new RangeError(`holes ${left} and ${right} must not overlap`);
      }
    }
  }

  return { type: "rectangular_plate", units: "mm", width, height, thickness, holes };
}

export function toOpenScad(spec) {
  const validated = validatePlateSpec(spec);
  const holeBlocks = validated.holes.map((hole) => `    translate([${hole.x}, ${hole.y}, -1]) cylinder(h=${validated.thickness + 2}, r=${hole.radius}, $fn=48);`);
  const body = `    cube([${validated.width}, ${validated.height}, ${validated.thickness}], center=false);`;
  if (holeBlocks.length === 0) return `// T2424-0037 controlled NLP-to-CAD\n${body.trimStart()}\n`;
  return ["// T2424-0037 controlled NLP-to-CAD", "difference() {", body, ...holeBlocks, "}", ""].join("\n");
}

export function toSvg(spec, options = {}) {
  const validated = validatePlateSpec(spec);
  const scale = finitePositive(options.scale ?? 5, "scale");
  const padding = 12;
  const svgWidth = validated.width * scale + padding * 2;
  const svgHeight = validated.height * scale + padding * 2;
  const circles = validated.holes.map((hole) => `<circle cx="${padding + hole.x * scale}" cy="${padding + hole.y * scale}" r="${hole.radius * scale}" fill="white" stroke="currentColor" stroke-width="2"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Parametric plate preview"><rect x="${padding}" y="${padding}" width="${validated.width * scale}" height="${validated.height * scale}" rx="3" fill="none" stroke="currentColor" stroke-width="3"/>${circles}</svg>`;
}

export function summarizeSpec(spec) {
  const validated = validatePlateSpec(spec);
  const removedArea = validated.holes.reduce((sum, hole) => sum + Math.PI * hole.radius ** 2, 0);
  const plateArea = validated.width * validated.height;
  return {
    widthMm: validated.width,
    heightMm: validated.height,
    thicknessMm: validated.thickness,
    holeCount: validated.holes.length,
    planarAreaMm2: plateArea,
    removedHoleAreaMm2: removedArea,
    remainingPlanarAreaMm2: plateArea - removedArea,
    approximateVolumeMm3: (plateArea - removedArea) * validated.thickness
  };
}
