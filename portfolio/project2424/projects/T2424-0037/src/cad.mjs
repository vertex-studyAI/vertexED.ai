export const NEUROCAD_VERSION = "neurocad-0.1";

const MAX_SCENE_MM = 5000;
const MAX_OBJECTS = 256;

function diagnostic(code, object, field, message) {
  return { code, object, field, message };
}

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function validateTransform(transform, id, errors) {
  if (transform == null) return;
  for (const key of ["translate", "rotate", "scale"]) {
    if (transform[key] == null) continue;
    const value = transform[key];
    if (!Array.isArray(value) || value.length !== 3 || value.some((n) => !Number.isFinite(n))) {
      errors.push(diagnostic("INVALID_TRANSFORM", id, key, `${key} must be a finite 3-vector`));
    }
  }
  if (Array.isArray(transform.scale) && transform.scale.some((n) => n <= 0)) {
    errors.push(diagnostic("INVALID_SCALE", id, "scale", "scale values must be > 0"));
  }
}

function validatePrimitive(object, errors) {
  const id = object?.id ?? "unknown";
  if (!object || typeof object !== "object") {
    errors.push(diagnostic("INVALID_OBJECT", id, null, "CAD object must be an object"));
    return;
  }
  if (typeof object.id !== "string" || !object.id.trim()) errors.push(diagnostic("INVALID_ID", id, "id", "object id is required"));
  if (object.visible != null && typeof object.visible !== "boolean") errors.push(diagnostic("INVALID_VISIBILITY", id, "visible", "visible must be boolean"));
  validateTransform(object.transform, id, errors);

  const requirePositive = (fields) => {
    for (const field of fields) {
      if (!finitePositive(object[field])) errors.push(diagnostic("NON_POSITIVE_DIMENSION", id, field, `${field} must be finite and > 0`));
      else if (object[field] > MAX_SCENE_MM) errors.push(diagnostic("SCENE_BOUND_EXCEEDED", id, field, `${field} exceeds the demo scene bound`));
    }
  };

  switch (object.type) {
    case "box":
      requirePositive(["width", "height", "depth"]);
      break;
    case "cylinder":
    case "shaft":
    case "disk":
      requirePositive(["radius", "length"]);
      break;
    case "tube":
    case "ring":
    case "housing":
      requirePositive(["outerRadius", "innerRadius", "length"]);
      if (finitePositive(object.innerRadius) && finitePositive(object.outerRadius) && object.innerRadius >= object.outerRadius) {
        errors.push(diagnostic("INNER_RADIUS_EXCEEDS_OUTER_RADIUS", id, "innerRadius", "innerRadius must be smaller than outerRadius"));
      }
      break;
    case "frustum":
    case "cone":
      requirePositive(["radiusStart", "radiusEnd", "length"]);
      break;
    case "blade_ring":
      requirePositive(["hubRadius", "tipRadius", "length", "bladeThickness"]);
      if (!Number.isInteger(object.bladeCount) || object.bladeCount < 3 || object.bladeCount > 96) errors.push(diagnostic("INVALID_BLADE_COUNT", id, "bladeCount", "bladeCount must be an integer in [3, 96]"));
      if (finitePositive(object.hubRadius) && finitePositive(object.tipRadius) && object.hubRadius >= object.tipRadius) errors.push(diagnostic("INVALID_BLADE_RADII", id, "hubRadius", "hubRadius must be smaller than tipRadius"));
      break;
    default:
      errors.push(diagnostic("UNSUPPORTED_OBJECT_TYPE", id, "type", `unsupported object type: ${object.type}`));
  }
}

export function validateCADDocument(document) {
  const errors = [];
  if (!document || typeof document !== "object") return { status: "FAIL", errors: [diagnostic("INVALID_DOCUMENT", "document", null, "document must be an object")] };
  if (document.version !== NEUROCAD_VERSION) errors.push(diagnostic("UNSUPPORTED_VERSION", "document", "version", `expected ${NEUROCAD_VERSION}`));
  if (document.units !== "mm") errors.push(diagnostic("UNSUPPORTED_UNITS", "document", "units", "only mm is supported in NeuroCAD Alpha 0.1"));
  if (!Array.isArray(document.objects)) errors.push(diagnostic("INVALID_OBJECTS", "document", "objects", "objects must be an array"));
  else {
    if (document.objects.length > MAX_OBJECTS) errors.push(diagnostic("OBJECT_LIMIT_EXCEEDED", "document", "objects", `maximum object count is ${MAX_OBJECTS}`));
    const ids = new Set();
    for (const object of document.objects) {
      validatePrimitive(object, errors);
      if (object?.id) {
        if (ids.has(object.id)) errors.push(diagnostic("DUPLICATE_ID", object.id, "id", "object ids must be unique"));
        ids.add(object.id);
      }
    }
    if (Array.isArray(document.assemblies)) {
      for (const assembly of document.assemblies) {
        if (!assembly || typeof assembly.id !== "string" || !Array.isArray(assembly.children)) {
          errors.push(diagnostic("INVALID_ASSEMBLY", assembly?.id ?? "assembly", null, "assembly requires id and children"));
          continue;
        }
        for (const child of assembly.children) if (!ids.has(child)) errors.push(diagnostic("UNKNOWN_ASSEMBLY_CHILD", assembly.id, "children", `unknown child ${child}`));
      }
    }
  }
  return errors.length ? { status: "FAIL", errors } : { status: "PASS", errors: [] };
}

export function assertValidCADDocument(document) {
  const result = validateCADDocument(document);
  if (result.status !== "PASS") {
    const error = new Error(`invalid CAD document: ${result.errors.map((item) => item.code).join(", ")}`);
    error.diagnostics = result.errors;
    throw error;
  }
  return document;
}

export function createCADDocument({ name, objects, assemblies = [], metadata = {} }) {
  return assertValidCADDocument({ version: NEUROCAD_VERSION, units: "mm", name, objects, assemblies, metadata });
}
