export const NEUROCAD_VERSION = "neurocad-0.1";
export const NEUROCAD_PRODUCT_NAME = "NeuroCAD Alpha 0.1";
export const NEUROCAD_SCOPE_NOTICE = "Conceptual/educational parametric geometry only; not airworthy, manufacturable, combustion-qualified, structurally validated, thermodynamically optimized, or certified.";
export const SUPPORTED_PRIMITIVES = Object.freeze(["rectangular_plate", "cylinder", "tube", "ring", "disk", "frustum", "blade_ring"]);

const LIMITS = Object.freeze({ objects: 200, assemblies: 80, children: 120, extentMm: 5000 });

export class CADValidationError extends Error {
  constructor(diagnostics) {
    super(diagnostics?.errors?.[0]?.message ?? "CAD document validation failed");
    this.name = "CADValidationError";
    this.diagnostics = diagnostics;
  }
}

export function diagnostic(code, message, object = null, field = null) { return { code, message, object, field }; }
export function isPlainRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function finite(value, label, errors, options = {}) {
  const { min = -Infinity, max = Infinity, positive = false, integer = false, object = null, field = null } = options;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(diagnostic("NON_FINITE_NUMBER", `${label} must be a finite number`, object, field)); return null;
  }
  if (positive && value <= 0) { errors.push(diagnostic("NON_POSITIVE_DIMENSION", `${label} must be > 0`, object, field)); return null; }
  if (integer && !Number.isInteger(value)) { errors.push(diagnostic("NON_INTEGER_VALUE", `${label} must be an integer`, object, field)); return null; }
  if (value < min || value > max) { errors.push(diagnostic("OUT_OF_RANGE", `${label} must be in [${min}, ${max}]`, object, field)); return null; }
  return value;
}

function vector(value, label, errors, positive = false, maximum = LIMITS.extentMm) {
  if (!Array.isArray(value) || value.length !== 3) { errors.push(diagnostic("INVALID_VECTOR", `${label} must contain exactly three numbers`)); return positive ? [1,1,1] : [0,0,0]; }
  return value.map((entry, index) => finite(entry, `${label}[${index}]`, errors, { min: positive ? Number.MIN_VALUE : -maximum, max: maximum, positive }) ?? (positive ? 1 : 0));
}

function transform(value, errors, id) {
  if (value === undefined) return { position:[0,0,0], rotation:[0,0,0], scale:[1,1,1] };
  if (!isPlainRecord(value)) { errors.push(diagnostic("INVALID_TRANSFORM", "transform must be an object", id, "transform")); return { position:[0,0,0], rotation:[0,0,0], scale:[1,1,1] }; }
  return {
    position: vector(value.position ?? [0,0,0], `${id}.position`, errors),
    rotation: vector(value.rotation ?? [0,0,0], `${id}.rotation`, errors, false, Math.PI * 8),
    scale: vector(value.scale ?? [1,1,1], `${id}.scale`, errors, true, 20)
  };
}

function dimensions(input, errors, validatePlateSpec) {
  const id = input.id, d = input.dimensions;
  if (!isPlainRecord(d)) { errors.push(diagnostic("INVALID_DIMENSIONS", "dimensions must be an object", id, "dimensions")); return {}; }
  const v = (field, opts={}) => finite(d[field], `${id}.${field}`, errors, { min: opts.min ?? .001, max: opts.max ?? 2000, positive: true, integer: !!opts.integer, object:id, field });
  if (input.type === "rectangular_plate") {
    try {
      const plate = validatePlateSpec({ type:"rectangular_plate", units:"mm", width:d.width, height:d.height, thickness:d.thickness, holes:d.holes });
      return { width:plate.width, height:plate.height, thickness:plate.thickness, holes:plate.holes.map(h => ({...h})) };
    } catch (error) { errors.push(diagnostic("INVALID_PLATE_GEOMETRY", error instanceof Error ? error.message : String(error), id, "dimensions")); return {}; }
  }
  if (input.type === "cylinder") return { radius:v("radius"), length:v("length") };
  if (["tube","ring","disk"].includes(input.type)) {
    const outerRadius=v("outerRadius"), innerRadius=finite(d.innerRadius ?? 0, `${id}.innerRadius`, errors, {min:0,max:1999,object:id,field:"innerRadius"}), length=v("length");
    if (outerRadius !== null && innerRadius !== null && innerRadius >= outerRadius) errors.push(diagnostic("INNER_RADIUS_EXCEEDS_OUTER_RADIUS", "innerRadius must be smaller than outerRadius", id, "innerRadius"));
    return { outerRadius, innerRadius, length };
  }
  if (input.type === "frustum") return { startRadius:v("startRadius"), endRadius:v("endRadius"), length:v("length") };
  if (input.type === "blade_ring") {
    const hubRadius=v("hubRadius"), tipRadius=v("tipRadius"), thickness=v("thickness",{max:120}), bladeChord=v("bladeChord",{max:120}), bladeCount=v("bladeCount",{min:6,max:40,integer:true});
    if (hubRadius !== null && tipRadius !== null && hubRadius >= tipRadius) errors.push(diagnostic("HUB_RADIUS_EXCEEDS_TIP_RADIUS", "hubRadius must be smaller than tipRadius", id, "hubRadius"));
    return { hubRadius, tipRadius, thickness, bladeChord, bladeCount };
  }
  return {};
}

export function validateCADDocument(input, validatePlateSpec) {
  const errors=[], warnings=[];
  if (!isPlainRecord(input)) return { status:"FAIL", errors:[diagnostic("INVALID_DOCUMENT","CAD document must be a plain object")], warnings, document:null };
  if (input.version !== NEUROCAD_VERSION) errors.push(diagnostic("UNSUPPORTED_DOCUMENT_VERSION", `version must be '${NEUROCAD_VERSION}'`, null, "version"));
  if (input.units !== "mm") errors.push(diagnostic("UNSUPPORTED_UNITS", "units must be 'mm'", null, "units"));
  if (!Array.isArray(input.objects)) errors.push(diagnostic("INVALID_OBJECTS", "objects must be an array", null, "objects"));
  if (Array.isArray(input.objects) && input.objects.length > LIMITS.objects) errors.push(diagnostic("OBJECT_LIMIT_EXCEEDED", `objects cannot exceed ${LIMITS.objects}`, null, "objects"));
  if (input.assemblies !== undefined && !Array.isArray(input.assemblies)) errors.push(diagnostic("INVALID_ASSEMBLIES", "assemblies must be an array", null, "assemblies"));
  if (Array.isArray(input.assemblies) && input.assemblies.length > LIMITS.assemblies) errors.push(diagnostic("ASSEMBLY_LIMIT_EXCEEDED", `assemblies cannot exceed ${LIMITS.assemblies}`, null, "assemblies"));

  const objectIds=new Set();
  const objects=(Array.isArray(input.objects)?input.objects.slice(0,LIMITS.objects):[]).map((entry) => {
    if (!isPlainRecord(entry)) { errors.push(diagnostic("INVALID_OBJECT","each CAD object must be a plain object")); return null; }
    const id=typeof entry.id === "string" && /^[a-z0-9][a-z0-9_-]{0,63}$/u.test(entry.id) ? entry.id : null;
    if (!id) { errors.push(diagnostic("INVALID_OBJECT_ID","object id is invalid")); return null; }
    if (objectIds.has(id)) { errors.push(diagnostic("DUPLICATE_OBJECT_ID",`duplicate object id '${id}'`,id)); return null; }
    objectIds.add(id);
    if (!SUPPORTED_PRIMITIVES.includes(entry.type)) { errors.push(diagnostic("UNSUPPORTED_PRIMITIVE",`unsupported primitive '${String(entry.type)}'`,id,"type")); return null; }
    return { id, type:entry.type, name:typeof entry.name === "string" && entry.name.trim()?entry.name.trim().slice(0,120):id, dimensions:dimensions({...entry,id},errors,validatePlateSpec), transform:transform(entry.transform,errors,id), visible:entry.visible!==false, materialRole:typeof entry.materialRole === "string"?entry.materialRole.slice(0,40):"structure", section:typeof entry.section === "string"?entry.section.slice(0,40):null, metadata:isPlainRecord(entry.metadata)?structuredClone(entry.metadata):{} };
  }).filter(Boolean);

  const assemblyIds=new Set();
  const assemblies=(Array.isArray(input.assemblies)?input.assemblies.slice(0,LIMITS.assemblies):[]).map((entry) => {
    if (!isPlainRecord(entry)) { errors.push(diagnostic("INVALID_ASSEMBLY","each assembly must be a plain object")); return null; }
    const id=typeof entry.id === "string" && /^[a-z0-9][a-z0-9_-]{0,63}$/u.test(entry.id) ? entry.id : null;
    if (!id) { errors.push(diagnostic("INVALID_ASSEMBLY_ID","assembly id is invalid")); return null; }
    if (assemblyIds.has(id)) { errors.push(diagnostic("DUPLICATE_ASSEMBLY_ID",`duplicate assembly id '${id}'`,id)); return null; }
    assemblyIds.add(id);
    if (!Array.isArray(entry.children) || entry.children.length > LIMITS.children) { errors.push(diagnostic("INVALID_ASSEMBLY_CHILDREN",`assembly '${id}' children are invalid`,id,"children")); return null; }
    const children=entry.children.map((child,index) => isPlainRecord(child) && ["object","assembly"].includes(child.kind) && typeof child.ref === "string" ? {kind:child.kind,ref:child.ref} : (errors.push(diagnostic("INVALID_ASSEMBLY_REFERENCE",`assembly '${id}' child ${index} is invalid`,id,"children")),null)).filter(Boolean);
    return { id, name:typeof entry.name === "string" && entry.name.trim()?entry.name.trim().slice(0,120):id, children, metadata:isPlainRecord(entry.metadata)?structuredClone(entry.metadata):{} };
  }).filter(Boolean);

  const graph=new Map(assemblies.map(a => [a.id,a.children.filter(c=>c.kind==="assembly").map(c=>c.ref)]));
  for (const a of assemblies) for (const c of a.children) {
    if (c.kind === "object" && !objectIds.has(c.ref)) errors.push(diagnostic("MISSING_OBJECT_REFERENCE",`assembly '${a.id}' references unknown object '${c.ref}'`,a.id,"children"));
    if (c.kind === "assembly" && !assemblyIds.has(c.ref)) errors.push(diagnostic("MISSING_ASSEMBLY_REFERENCE",`assembly '${a.id}' references unknown assembly '${c.ref}'`,a.id,"children"));
    if (c.kind === "assembly" && c.ref === a.id) errors.push(diagnostic("ASSEMBLY_SELF_REFERENCE",`assembly '${a.id}' cannot reference itself`,a.id,"children"));
  }
  const visiting=new Set(), visited=new Set();
  const visit=(id)=>{ if(visiting.has(id)){errors.push(diagnostic("ASSEMBLY_CYCLE",`assembly graph contains a cycle at '${id}'`,id));return;} if(visited.has(id))return; visiting.add(id); for(const next of graph.get(id)??[])visit(next); visiting.delete(id); visited.add(id); };
  for (const id of graph.keys()) visit(id);
  if (!objects.length) warnings.push(diagnostic("EMPTY_DOCUMENT","document contains no geometry"));
  const document={ version:NEUROCAD_VERSION, units:"mm", name:typeof input.name === "string"&&input.name.trim()?input.name.trim().slice(0,160):"Untitled NeuroCAD Document", objects, assemblies, metadata:isPlainRecord(input.metadata)?structuredClone(input.metadata):{} };
  return { status:errors.length?"FAIL":"PASS", errors, warnings, document:errors.length?null:document };
}

export function assertCADDocument(input, validatePlateSpec) {
  const result=validateCADDocument(input,validatePlateSpec); if(result.status!=="PASS") throw new CADValidationError(result); return result.document;
}

export function makeObject(id,type,name,dimensions,options={}) { return { id,type,name,dimensions,transform:{position:[...(options.position??[0,0,0])],rotation:[...(options.rotation??[0,0,0])],scale:[...(options.scale??[1,1,1])]},visible:options.visible!==false,materialRole:options.materialRole??"structure",section:options.section??null,metadata:options.metadata??{} }; }
export function makeAssembly(id,name,children,metadata={}) { return {id,name,children,metadata}; }
export const objectRef=(ref)=>({kind:"object",ref});
export const assemblyRef=(ref)=>({kind:"assembly",ref});
export function validateNumeric(value,label,min,max,integer=false){const errors=[];const result=finite(value,label,errors,{min,max,positive:true,integer,field:label});if(errors.length)throw new CADValidationError({status:"FAIL",errors,warnings:[],document:null});return result;}
