import { parsePlatePrompt, validatePlateSpec } from "./core.mjs";

export const NEUROCAD_VERSION = "0.1.0-alpha";
const MAX_OBJECTS = 256;
const MAX_SCENE_EXTENT_MM = 5_000;
const SUPPORTED_TYPES = new Set(["rectangular_plate", "cylinder", "tube", "disk", "frustum", "blade_ring"]);

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
  return value;
}

function finite(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError(`${label} must be a finite number`);
  return value;
}

function positive(value, label, max = MAX_SCENE_EXTENT_MM) {
  finite(value, label);
  if (value <= 0 || value > max) throw new RangeError(`${label} must be > 0 and <= ${max}`);
  return value;
}

function integerRange(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new RangeError(`${label} must be an integer in [${min}, ${max}]`);
  return value;
}

function idText(value, label) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/u.test(value)) throw new TypeError(`${label} must be a safe identifier`);
  return value;
}

function safeName(value, label) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 120) throw new TypeError(`${label} must be a non-empty string <= 120 characters`);
  return value.trim();
}

export function validateTransform(transform = {}) {
  assertObject(transform, "transform");
  return {
    x: finite(transform.x ?? 0, "transform.x"),
    y: finite(transform.y ?? 0, "transform.y"),
    z: finite(transform.z ?? 0, "transform.z"),
    rx: finite(transform.rx ?? 0, "transform.rx"),
    ry: finite(transform.ry ?? 0, "transform.ry"),
    rz: finite(transform.rz ?? 0, "transform.rz")
  };
}

function baseObject(object) {
  assertObject(object, "CAD object");
  const type = idText(object.type, "object.type");
  if (!SUPPORTED_TYPES.has(type)) throw new TypeError(`unsupported CAD object type: ${type}`);
  return {
    id: idText(object.id, "object.id"),
    name: safeName(object.name ?? object.id, "object.name"),
    type,
    group: idText(object.group ?? "root", "object.group"),
    visible: object.visible !== false,
    transform: validateTransform(object.transform ?? {})
  };
}

export function validateCADObject(object) {
  const base = baseObject(object);
  const params = assertObject(object.params ?? {}, `${base.id}.params`);
  let normalized;

  if (base.type === "rectangular_plate") {
    const plate = validatePlateSpec({ type: "rectangular_plate", units: "mm", ...params });
    normalized = { width: plate.width, height: plate.height, thickness: plate.thickness, holes: plate.holes };
  } else if (base.type === "cylinder" || base.type === "disk") {
    normalized = {
      radius: positive(params.radius, `${base.id}.radius`),
      length: positive(params.length ?? params.thickness, `${base.id}.length`)
    };
  } else if (base.type === "tube") {
    const outerRadius = positive(params.outerRadius, `${base.id}.outerRadius`);
    const innerRadius = positive(params.innerRadius, `${base.id}.innerRadius`);
    if (innerRadius >= outerRadius) throw new RangeError(`${base.id}.innerRadius must be less than outerRadius`);
    normalized = { outerRadius, innerRadius, length: positive(params.length, `${base.id}.length`) };
  } else if (base.type === "frustum") {
    normalized = {
      radius1: positive(params.radius1, `${base.id}.radius1`),
      radius2: positive(params.radius2, `${base.id}.radius2`),
      length: positive(params.length, `${base.id}.length`)
    };
  } else if (base.type === "blade_ring") {
    const hubRadius = positive(params.hubRadius, `${base.id}.hubRadius`);
    const tipRadius = positive(params.tipRadius, `${base.id}.tipRadius`);
    if (hubRadius >= tipRadius) throw new RangeError(`${base.id}.hubRadius must be less than tipRadius`);
    normalized = {
      hubRadius,
      tipRadius,
      length: positive(params.length, `${base.id}.length`),
      bladeCount: integerRange(params.bladeCount, `${base.id}.bladeCount`, 4, 64),
      bladeThickness: positive(params.bladeThickness ?? Math.max(1, (tipRadius - hubRadius) * 0.16), `${base.id}.bladeThickness`)
    };
  }

  return { ...base, params: normalized };
}

export function validateCADDocument(document) {
  assertObject(document, "CAD document");
  if (document.version !== "neurocad-0.1") throw new TypeError("CAD document version must be 'neurocad-0.1'");
  if (document.units !== "mm") throw new TypeError("CAD document units must be 'mm'");
  const name = safeName(document.name, "document.name");
  if (!Array.isArray(document.objects)) throw new TypeError("document.objects must be an array");
  if (document.objects.length === 0 || document.objects.length > MAX_OBJECTS) throw new RangeError(`document.objects must contain 1-${MAX_OBJECTS} objects`);
  const objects = document.objects.map(validateCADObject);
  const ids = new Set();
  for (const object of objects) {
    if (ids.has(object.id)) throw new RangeError(`duplicate CAD object id: ${object.id}`);
    ids.add(object.id);
    const { x, y, z } = object.transform;
    if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) > MAX_SCENE_EXTENT_MM) throw new RangeError(`${object.id} transform exceeds scene safety envelope`);
  }

  const assemblies = Array.isArray(document.assemblies) ? document.assemblies.map((assembly) => {
    assertObject(assembly, "assembly");
    const id = idText(assembly.id, "assembly.id");
    const children = Array.isArray(assembly.children) ? assembly.children.map((child) => idText(child, `${id}.child`)) : [];
    for (const child of children) if (!ids.has(child)) throw new RangeError(`assembly ${id} references missing object ${child}`);
    return { id, name: safeName(assembly.name ?? id, "assembly.name"), children };
  }) : [];

  return {
    version: "neurocad-0.1",
    units: "mm",
    name,
    objects,
    assemblies,
    metadata: document.metadata && typeof document.metadata === "object" && !Array.isArray(document.metadata) ? structuredClone(document.metadata) : {}
  };
}

export function validateJetEngineParams(input = {}) {
  assertObject(input, "jet engine parameters");
  const engineLengthMm = positive(input.engineLengthMm ?? 900, "engineLengthMm", 1_600);
  if (engineLengthMm < 600) throw new RangeError("engineLengthMm must be >= 600 for this visual concept model");
  const outerDiameterMm = positive(input.outerDiameterMm ?? 320, "outerDiameterMm", 500);
  if (outerDiameterMm < 200) throw new RangeError("outerDiameterMm must be >= 200 for this visual concept model");
  const shaftDiameterMm = positive(input.shaftDiameterMm ?? 45, "shaftDiameterMm", 150);
  if (shaftDiameterMm >= outerDiameterMm * 0.4) throw new RangeError("shaftDiameterMm must stay below 40% of outerDiameterMm");
  const compressorStages = integerRange(input.compressorStages ?? 6, "compressorStages", 3, 12);
  const turbineStages = integerRange(input.turbineStages ?? 2, "turbineStages", 1, 4);
  const ratios = {
    inlet: input.inletLengthRatio ?? 0.12,
    compressor: input.compressorLengthRatio ?? 0.32,
    combustor: input.combustorLengthRatio ?? 0.20,
    turbine: input.turbineLengthRatio ?? 0.18,
    nozzle: input.nozzleLengthRatio ?? 0.18
  };
  for (const [key, value] of Object.entries(ratios)) {
    finite(value, `${key}LengthRatio`);
    if (value <= 0.04 || value >= 0.6) throw new RangeError(`${key}LengthRatio is outside the conceptual demo envelope`);
  }
  const ratioSum = Object.values(ratios).reduce((sum, value) => sum + value, 0);
  if (Math.abs(ratioSum - 1) > 0.001) throw new RangeError("jet engine section length ratios must sum to 1.0");
  return {
    engineLengthMm,
    outerDiameterMm,
    shaftDiameterMm,
    compressorStages,
    turbineStages,
    inletLengthRatio: ratios.inlet,
    compressorLengthRatio: ratios.compressor,
    combustorLengthRatio: ratios.combustor,
    turbineLengthRatio: ratios.turbine,
    nozzleLengthRatio: ratios.nozzle
  };
}

function object(id, name, type, group, params, x, visible = true) {
  return { id, name, type, group, params, transform: { x, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }, visible };
}

export function createJetEngineDocument(input = {}) {
  const p = validateJetEngineParams(input);
  const radius = p.outerDiameterMm / 2;
  const shaftRadius = p.shaftDiameterMm / 2;
  const lengths = {
    inlet: p.engineLengthMm * p.inletLengthRatio,
    compressor: p.engineLengthMm * p.compressorLengthRatio,
    combustor: p.engineLengthMm * p.combustorLengthRatio,
    turbine: p.engineLengthMm * p.turbineLengthRatio,
    nozzle: p.engineLengthMm * p.nozzleLengthRatio
  };
  const x = {
    inlet: -p.engineLengthMm / 2,
    compressor: -p.engineLengthMm / 2 + lengths.inlet,
    combustor: -p.engineLengthMm / 2 + lengths.inlet + lengths.compressor,
    turbine: -p.engineLengthMm / 2 + lengths.inlet + lengths.compressor + lengths.combustor,
    nozzle: -p.engineLengthMm / 2 + lengths.inlet + lengths.compressor + lengths.combustor + lengths.turbine
  };
  const objects = [];
  objects.push(object("inlet", "Inlet", "frustum", "inlet", { radius1: radius * 0.82, radius2: radius * 0.96, length: lengths.inlet }, x.inlet));
  objects.push(object("central_shaft", "Central Shaft", "cylinder", "shaft", { radius: shaftRadius, length: p.engineLengthMm * 0.88 }, -p.engineLengthMm * 0.44));

  const compPitch = lengths.compressor / p.compressorStages;
  for (let i = 0; i < p.compressorStages; i += 1) {
    const stageX = x.compressor + compPitch * (i + 0.18);
    const stage = String(i + 1).padStart(2, "0");
    const taper = 0.82 + 0.12 * ((i + 1) / p.compressorStages);
    objects.push(object(`compressor_rotor_${stage}`, `Compressor Rotor ${stage}`, "blade_ring", "compressor", {
      hubRadius: shaftRadius * 1.5,
      tipRadius: radius * taper,
      length: Math.max(4, compPitch * 0.18),
      bladeCount: 18,
      bladeThickness: Math.max(2, radius * 0.025)
    }, stageX));
    objects.push(object(`compressor_stator_${stage}`, `Compressor Stator ${stage}`, "blade_ring", "compressor", {
      hubRadius: shaftRadius * 1.7,
      tipRadius: radius * Math.min(0.95, taper + 0.025),
      length: Math.max(3, compPitch * 0.12),
      bladeCount: 16,
      bladeThickness: Math.max(2, radius * 0.022)
    }, stageX + compPitch * 0.45));
  }

  objects.push(object("combustor_envelope", "Combustor Envelope", "tube", "combustor", {
    outerRadius: radius * 0.9,
    innerRadius: Math.max(shaftRadius * 2.2, radius * 0.42),
    length: lengths.combustor
  }, x.combustor));

  const turbinePitch = lengths.turbine / p.turbineStages;
  for (let i = 0; i < p.turbineStages; i += 1) {
    const stageX = x.turbine + turbinePitch * (i + 0.25);
    const stage = String(i + 1).padStart(2, "0");
    objects.push(object(`turbine_rotor_${stage}`, `Turbine Rotor ${stage}`, "blade_ring", "turbine", {
      hubRadius: shaftRadius * 1.6,
      tipRadius: radius * (0.78 - i * 0.035),
      length: Math.max(5, turbinePitch * 0.22),
      bladeCount: 14,
      bladeThickness: Math.max(2, radius * 0.03)
    }, stageX));
  }

  objects.push(object("outer_casing", "Outer Casing", "tube", "casing", {
    outerRadius: radius,
    innerRadius: radius * 0.965,
    length: p.engineLengthMm - lengths.nozzle * 0.45
  }, -p.engineLengthMm / 2 + lengths.inlet * 0.3));
  objects.push(object("exhaust_nozzle", "Exhaust Nozzle", "frustum", "nozzle", {
    radius1: radius * 0.82,
    radius2: radius * 0.52,
    length: lengths.nozzle
  }, x.nozzle));

  const document = {
    version: "neurocad-0.1",
    units: "mm",
    name: "Turbojet Concept",
    objects,
    assemblies: [{ id: "turbojet", name: "Turbojet Concept", children: objects.map((entry) => entry.id) }],
    metadata: {
      generator: "neurocad-jet-concept-v0.1",
      scope: "conceptual-educational-non-manufacturing",
      jetEngineParams: p
    }
  };
  return validateCADDocument(document);
}

export function createPlateDocument(prompt) {
  const plate = validatePlateSpec(parsePlatePrompt(prompt));
  return validateCADDocument({
    version: "neurocad-0.1",
    units: "mm",
    name: "Mounting Plate",
    objects: [{ id: "plate", name: "Mounting Plate", type: "rectangular_plate", group: "plate", params: plate, transform: {}, visible: true }],
    assemblies: [{ id: "plate_assembly", name: "Mounting Plate", children: ["plate"] }],
    metadata: { generator: "neurocad-plate-v0.1", sourcePrompt: prompt }
  });
}

function numberFrom(text, pattern) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : undefined;
}

export function interpretPrompt(prompt, currentDocument = null) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) throw new TypeError("prompt must be a non-empty string");
  const text = prompt.toLowerCase().replace(/\s+/gu, " ").trim();

  if (/\b(jet engine|turbojet|turbine engine)\b/u.test(text) && /\b(create|generate|build|concept)\b/u.test(text)) {
    const compressorStages = numberFrom(text, /(\d+)\s+compressor\s+stages?/u);
    const turbineStages = numberFrom(text, /(\d+)\s+turbine\s+stages?/u);
    return {
      intent: "CREATE_ASSEMBLY",
      document: createJetEngineDocument({
        ...(compressorStages === undefined ? {} : { compressorStages }),
        ...(turbineStages === undefined ? {} : { turbineStages })
      }),
      view: { exploded: false, casingVisible: true }
    };
  }

  if (/\b(plate|panel|bracket|rectangle)\b/u.test(text) && /\b(create|generate|plate|panel|bracket|rectangle)\b/u.test(text)) {
    return { intent: "CREATE_OBJECT", document: createPlateDocument(prompt), view: { exploded: false, casingVisible: true } };
  }

  if (!currentDocument?.metadata?.jetEngineParams) throw new Error("follow-up command requires an active jet-engine concept document");
  const currentParams = currentDocument.metadata.jetEngineParams;
  const next = { ...currentParams };
  let changed = false;
  const view = { exploded: false, casingVisible: currentDocument.objects.find((entry) => entry.id === "outer_casing")?.visible !== false };

  const compressorStages = numberFrom(text, /(?:compressor\s+stages?(?:\s+to)?|to)\s+(\d+)/u);
  if (/compressor/u.test(text) && compressorStages !== undefined) { next.compressorStages = compressorStages; changed = true; }
  const turbineStages = numberFrom(text, /(?:turbine\s+stages?(?:\s+to)?|to)\s+(\d+)/u);
  if (/turbine/u.test(text) && turbineStages !== undefined) { next.turbineStages = turbineStages; changed = true; }
  if (/\b(make|set).*(engine).*longer\b/u.test(text) || /^make it longer[.!]?$/u.test(text)) { next.engineLengthMm = Math.min(1_600, Math.round(next.engineLengthMm * 1.15)); changed = true; }
  if (/shaft.*(thicker|larger)/u.test(text)) { next.shaftDiameterMm = Math.min(next.outerDiameterMm * 0.35, Math.round(next.shaftDiameterMm * 1.15)); changed = true; }
  if (/\bhide\b.*\bcasing\b/u.test(text)) view.casingVisible = false;
  if (/\b(show|unhide)\b.*\bcasing\b/u.test(text)) view.casingVisible = true;
  if (/\bexploded\b/u.test(text)) view.exploded = true;
  if (/\breset\b/u.test(text)) return { intent: "RESET", document: createJetEngineDocument(), view: { exploded: false, casingVisible: true } };

  let document = changed ? createJetEngineDocument(next) : validateCADDocument(currentDocument);
  if (!view.casingVisible) document = { ...document, objects: document.objects.map((entry) => entry.id === "outer_casing" ? { ...entry, visible: false } : entry) };
  return { intent: changed ? "MODIFY_PARAMETER" : "SET_VIEW_MODE", document: validateCADDocument(document), view };
}

function n(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("renderer received non-finite geometry");
  return Number(value.toFixed(6));
}

function transformPrefix(object) {
  const t = object.transform;
  return `translate([${n(t.x)},${n(t.y)},${n(t.z)}]) rotate([${n(t.rx)},${n(t.ry)},${n(t.rz)}])`;
}

export function toAssemblyOpenScad(inputDocument) {
  const document = validateCADDocument(inputDocument);
  const lines = [
    "// NeuroCAD Alpha 0.1 conceptual geometry",
    "// NON-MANUFACTURING / EDUCATIONAL CONCEPT MODEL",
    "$fn=48;"
  ];
  for (const object of document.objects) {
    if (!object.visible) continue;
    const p = object.params;
    const prefix = transformPrefix(object);
    if (object.type === "cylinder" || object.type === "disk") {
      lines.push(`${prefix} rotate([0,90,0]) cylinder(h=${n(p.length)}, r=${n(p.radius)});`);
    } else if (object.type === "tube") {
      lines.push(`${prefix} rotate([0,90,0]) difference(){ cylinder(h=${n(p.length)}, r=${n(p.outerRadius)}); translate([0,0,-1]) cylinder(h=${n(p.length + 2)}, r=${n(p.innerRadius)}); }`);
    } else if (object.type === "frustum") {
      lines.push(`${prefix} rotate([0,90,0]) cylinder(h=${n(p.length)}, r1=${n(p.radius1)}, r2=${n(p.radius2)});`);
    } else if (object.type === "blade_ring") {
      lines.push(`${prefix} rotate([0,90,0]) union(){ cylinder(h=${n(p.length)}, r=${n(p.hubRadius)}); for(a=[0:${n(360 / p.bladeCount)}:359]) rotate([0,0,a]) translate([${n(p.hubRadius)},${n(-p.bladeThickness / 2)},0]) cube([${n(p.tipRadius - p.hubRadius)},${n(p.bladeThickness)},${n(p.length)}]); }`);
    } else if (object.type === "rectangular_plate") {
      const plate = validatePlateSpec({ type: "rectangular_plate", units: "mm", ...p });
      const holes = plate.holes.map((hole) => `translate([${n(hole.x)},${n(hole.y)},-1]) cylinder(h=${n(plate.thickness + 2)},r=${n(hole.radius)});`).join(" ");
      lines.push(`${prefix} difference(){ cube([${n(plate.width)},${n(plate.height)},${n(plate.thickness)}]); ${holes} }`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function summarizeDocument(inputDocument) {
  const document = validateCADDocument(inputDocument);
  const groups = {};
  for (const object of document.objects) groups[object.group] = (groups[object.group] ?? 0) + 1;
  return {
    version: document.version,
    name: document.name,
    objectCount: document.objects.length,
    visibleObjectCount: document.objects.filter((entry) => entry.visible).length,
    groups,
    validation: "PASS",
    scope: document.metadata.scope ?? "bounded-parametric-cad"
  };
}

export function serializeCADDocument(inputDocument) {
  return `${JSON.stringify(validateCADDocument(inputDocument), null, 2)}\n`;
}
