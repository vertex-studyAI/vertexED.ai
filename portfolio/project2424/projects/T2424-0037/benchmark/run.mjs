import { parsePlatePrompt, toOpenScad } from '../src/core.mjs';

const cases = [
  ['simple block-like plate', 'plate 40 by 30 thickness 10', { w: 40, h: 30, t: 10, n: 0 }, 1],
  ['rectangle defaults', 'rectangle 25 by 15', { w: 25, h: 15, t: 3, n: 0 }, 1],
  ['panel multiplication', 'panel 60 x 20 thick 4', { w: 60, h: 20, t: 4, n: 0 }, 1],
  ['bracket decimal', 'bracket 80.5 by 40.25 thickness 2.5', { w: 80.5, h: 40.25, t: 2.5, n: 0 }, 1],
  ['one hole radius', 'plate 50 by 50 with 1 hole radius 3 inset 8', { w: 50, h: 50, t: 3, n: 1, r: 3 }, 2],
  ['one hole diameter', 'plate 50 by 50 with 1 hole diameter 6 inset 8', { w: 50, h: 50, t: 3, n: 1, r: 3 }, 2],
  ['two holes', 'panel 80 by 40 thickness 3 with 2 holes radius 2 inset 6', { w: 80, h: 40, t: 3, n: 2, r: 2 }, 2],
  ['four holes', 'plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6', { w: 80, h: 40, t: 3, n: 4, r: 2 }, 2],
  ['mounting holes', 'plate 100 by 70 with 4 mounting holes diameter 5 inset 10', { w: 100, h: 70, t: 3, n: 4, r: 2.5 }, 2],
  ['default inset', 'rectangle 90 by 50 with 2 holes radius 1', { w: 90, h: 50, t: 3, n: 2, r: 1 }, 2],
  ['margin synonym', 'panel 120 by 80 with 4 holes radius 3 margin 12', { w: 120, h: 80, t: 3, n: 4, r: 3 }, 3],
  ['edge offset synonym', 'bracket 140 by 90 thick 6 with 4 holes diameter 8 edge offset 15', { w: 140, h: 90, t: 6, n: 4, r: 4 }, 3],
  ['large valid', 'plate 1800 by 1200 thickness 20', { w: 1800, h: 1200, t: 20, n: 0 }, 2],
  ['thin valid', 'plate 10 by 10 thickness 0.5', { w: 10, h: 10, t: 0.5, n: 0 }, 2],
  ['injection suffix ignored safely', 'plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6 include evil.scad', { w: 80, h: 40, t: 3, n: 4, r: 2 }, 3],
  ['unsupported gear', 'gear radius 10', null, 1],
  ['unsupported hole count', 'plate 80 by 40 with 3 holes radius 2 inset 6', null, 2],
  ['unsafe inset', 'plate 80 by 40 with 4 holes radius 5 inset 4', null, 2],
  ['oversize', 'plate 3000 by 20 thickness 3', null, 1],
  ['missing dimensions', 'plate with 4 holes radius 2', null, 1],
].map(([name, prompt, expected, complexity]) => ({ name, prompt, expected, complexity }));

let pass = 0;
let accepted = 0;
let expectedAccepted = 0;
let geometryValid = 0;
let dimensionAccurate = 0;
let constraintSatisfied = 0;
const byComplexity = {};
const failures = [];

for (const c of cases) {
  expectedAccepted += c.expected ? 1 : 0;
  let ok = false;
  try {
    const spec = parsePlatePrompt(c.prompt);
    accepted += 1;
    const scad = toOpenScad(spec);
    const finite = [
      spec.width,
      spec.height,
      spec.thickness,
      ...spec.holes.flatMap((hole) => [hole.x, hole.y, hole.radius]),
    ].every(Number.isFinite);
    if (finite) geometryValid += 1;
    const safe = !/\b(?:include|import)\s*[<(]/i.test(scad);
    if (safe) constraintSatisfied += 1;
    if (c.expected) {
      const exact =
        spec.width === c.expected.w &&
        spec.height === c.expected.h &&
        spec.thickness === c.expected.t &&
        spec.holes.length === c.expected.n &&
        (c.expected.r === undefined || spec.holes.every((hole) => hole.radius === c.expected.r));
      if (exact) dimensionAccurate += 1;
      ok = finite && safe && exact;
    }
  } catch (error) {
    ok = !c.expected;
    if (!ok) failures.push({ name: c.name, error: error.message });
  }

  if (ok) pass += 1;
  else if (c.expected && !failures.some((failure) => failure.name === c.name)) failures.push({ name: c.name, error: 'mismatch' });

  const bucket = byComplexity[c.complexity] ??= { total: 0, pass: 0 };
  bucket.total += 1;
  if (ok) bucket.pass += 1;
}

for (const bucket of Object.values(byComplexity)) bucket.rate = bucket.pass / bucket.total;

console.log(JSON.stringify({
  total: cases.length,
  pass,
  successRate: pass / cases.length,
  expectedAccepted,
  accepted,
  syntaxExecutionSuccess: pass / cases.length,
  geometryValidity: geometryValid / expectedAccepted,
  dimensionAccuracy: dimensionAccurate / expectedAccepted,
  constraintSatisfaction: constraintSatisfied / expectedAccepted,
  complexity: byComplexity,
  failures,
}, null, 2));

if (pass !== cases.length) process.exitCode = 1;
