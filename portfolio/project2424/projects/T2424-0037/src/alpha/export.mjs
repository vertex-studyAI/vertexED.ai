import { validatePlateSpec } from "../core.mjs";
import { NEUROCAD_PRODUCT_NAME, SUPPORTED_PRIMITIVES, assertCADDocument } from "./schema.mjs";
const valid=(doc)=>assertCADDocument(doc,validatePlateSpec);
const n=(v)=>{if(typeof v!=="number"||!Number.isFinite(v))throw new TypeError("OpenSCAD export requires finite numeric geometry");return String(Number(v.toFixed(6)));};
const indent=(s,k=2)=>s.split("\n").map(line=>line?" ".repeat(k)+line:line).join("\n");
function primitive(o){const d=o.dimensions;
 if(o.type==="cylinder")return`rotate([0,90,0]) cylinder(h=${n(d.length)}, r=${n(d.radius)}, center=true, $fn=48);`;
 if(["tube","ring","disk"].includes(o.type)){if(d.innerRadius===0)return`rotate([0,90,0]) cylinder(h=${n(d.length)}, r=${n(d.outerRadius)}, center=true, $fn=48);`;return`difference() {\n  rotate([0,90,0]) cylinder(h=${n(d.length)}, r=${n(d.outerRadius)}, center=true, $fn=48);\n  rotate([0,90,0]) cylinder(h=${n(d.length+2)}, r=${n(d.innerRadius)}, center=true, $fn=48);\n}`;}
 if(o.type==="frustum")return`rotate([0,90,0]) cylinder(h=${n(d.length)}, r1=${n(d.startRadius)}, r2=${n(d.endRadius)}, center=true, $fn=64);`;
 if(o.type==="blade_ring"){const radial=d.tipRadius-d.hubRadius,center=d.hubRadius+radial/2;return`union() {\n  rotate([0,90,0]) cylinder(h=${n(d.thickness)}, r=${n(d.hubRadius)}, center=true, $fn=48);\n  for (a=[0:${n(360/d.bladeCount)}:${n(360-360/d.bladeCount)}]) {\n    rotate([a,0,0]) translate([0,${n(center)},0]) cube([${n(d.thickness)},${n(radial)},${n(d.bladeChord)}], center=true);\n  }\n}`;}
 if(o.type==="rectangular_plate"){const holes=d.holes.map(h=>`  translate([0,${n(h.x-d.width/2)},${n(h.y-d.height/2)}]) rotate([0,90,0]) cylinder(h=${n(d.thickness+2)}, r=${n(h.radius)}, center=true, $fn=48);`);return holes.length?`difference() {\n  cube([${n(d.thickness)},${n(d.width)},${n(d.height)}], center=true);\n${holes.join("\n")}\n}`:`cube([${n(d.thickness)},${n(d.width)},${n(d.height)}], center=true);`;}
 throw new TypeError(`unsupported primitive '${o.type}'`);
}
function transformed(o,source){const[p1,p2,p3]=o.transform.position,[r1,r2,r3]=o.transform.rotation.map(v=>v*180/Math.PI),[s1,s2,s3]=o.transform.scale;return`translate([${n(p1)},${n(p2)},${n(p3)}]) rotate([${n(r1)},${n(r2)},${n(r3)}]) scale([${n(s1)},${n(s2)},${n(s3)}]) {\n${indent(source)}\n}`;}
export function toOpenScadDocument(input){const doc=valid(input),body=doc.objects.filter(o=>o.visible).map(o=>`// ${o.id} — ${o.name}\n${transformed(o,primitive(o))}`).join("\n\n");return`// ${NEUROCAD_PRODUCT_NAME}\n// Conceptual parametric geometry only. Not a manufacturing or propulsion-performance specification.\n// Document: ${doc.name.replace(/[^a-zA-Z0-9 _.-]/gu,"")}\nunion() {\n${indent(body)}\n}\n`;}
export const serializeCADDocument=(input)=>`${JSON.stringify(valid(input),null,2)}\n`;
export function summarizeCADDocument(input){const doc=valid(input),counts=Object.fromEntries(SUPPORTED_PRIMITIVES.map(t=>[t,0]));for(const o of doc.objects)counts[o.type]++;return{version:doc.version,name:doc.name,units:doc.units,objectCount:doc.objects.length,assemblyCount:doc.assemblies.length,visibleObjectCount:doc.objects.filter(o=>o.visible).length,primitiveCounts:counts,kind:doc.metadata.kind??null,validation:"PASS"};}
