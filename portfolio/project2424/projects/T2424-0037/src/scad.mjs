import { assertValidCADDocument } from "./cad.mjs";

function num(value) {
  if (!Number.isFinite(value)) throw new TypeError("SCAD numeric value must be finite");
  return Number(value.toFixed(6)).toString();
}

function transform(object, body) {
  const t = object.transform?.translate ?? [0, 0, 0];
  const r = object.transform?.rotate ?? [0, 0, 0];
  const s = object.transform?.scale ?? [1, 1, 1];
  return `translate([${t.map(num).join(",")}]) rotate([${r.map(num).join(",")}]) scale([${s.map(num).join(",")}]) ${body}`;
}

function primitiveToScad(object) {
  switch (object.type) {
    case "box":
      return `cube([${num(object.width)},${num(object.height)},${num(object.depth)}], center=true);`;
    case "cylinder":
    case "shaft":
    case "disk":
      return `cylinder(h=${num(object.length)}, r=${num(object.radius)}, $fn=64);`;
    case "tube":
    case "ring":
    case "housing":
      return `difference() { cylinder(h=${num(object.length)}, r=${num(object.outerRadius)}, $fn=72); translate([0,0,-0.5]) cylinder(h=${num(object.length + 1)}, r=${num(object.innerRadius)}, $fn=72); }`;
    case "frustum":
    case "cone":
      return `cylinder(h=${num(object.length)}, r1=${num(object.radiusStart)}, r2=${num(object.radiusEnd)}, $fn=72);`;
    case "blade_ring": {
      const bladeLength = object.tipRadius - object.hubRadius;
      const bladeDepth = object.length;
      const blade = `translate([${num(object.hubRadius)},-${num(object.bladeThickness / 2)},0]) cube([${num(bladeLength)},${num(object.bladeThickness)},${num(bladeDepth)}], center=false);`;
      const repeated = Array.from({ length: object.bladeCount }, (_, i) => `rotate([0,0,${num((360 / object.bladeCount) * i)}]) ${blade}`).join("\n    ");
      return `union() { cylinder(h=${num(object.length)}, r=${num(object.hubRadius)}, $fn=64);\n    ${repeated}\n  }`;
    }
    default:
      throw new TypeError(`unsupported SCAD object type: ${object.type}`);
  }
}

export function toOpenScadDocument(document, options = {}) {
  assertValidCADDocument(document);
  const includeHidden = options.includeHidden === true;
  const blocks = document.objects
    .filter((object) => includeHidden || object.visible !== false)
    .map((object) => `// ${object.id}\n${transform(object, primitiveToScad(object))}`);
  return [
    "// NeuroCAD Alpha 0.1 — conceptual geometry export",
    "// NOT manufacturing-, structural-, thermal-, or propulsion-validated.",
    "$fn = 64;",
    "",
    ...blocks,
    ""
  ].join("\n");
}
