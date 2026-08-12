import { parsePlatePrompt, toOpenScad } from "./core.mjs";

function numberPattern() {
  return "(\\d+(?:\\.\\d+)?)";
}

function directRegexCompile(prompt) {
  if (typeof prompt !== "string" || prompt.trim() === "") throw new Error("no prompt");
  const text = prompt.toLowerCase().replace(/[×x]/gu, " by ").replace(/\s+/gu, " ").trim();
  const pair = text.match(new RegExp(`${numberPattern()}\\s*(?:mm\\s*)?by\\s*${numberPattern()}`, "u"));
  if (!pair) throw new Error("no rectangular dimensions");
  const triad = text.match(new RegExp(`${numberPattern()}\\s*(?:mm\\s*)?by\\s*${numberPattern()}\\s*(?:mm\\s*)?by\\s*${numberPattern()}`, "u"));
  const thicknessMatch = text.match(/(?:thickness|thick)\s*(?:of\s*)?(\d+(?:\.\d+)?)/u);
  const width = Number(pair[1]);
  const height = Number(pair[2]);
  const thickness = Number(thicknessMatch?.[1] ?? triad?.[3] ?? 3);
  const spec = { type: "rectangular_plate", units: "mm", width, height, thickness, holes: [] };
  return { spec, source: `cube([${width}, ${height}, ${thickness}], center=false);\n` };
}

function templateOnlyCompile(prompt) {
  if (typeof prompt !== "string") throw new Error("no prompt");
  const text = prompt.toLowerCase().replace(/[×x]/gu, " by ").replace(/\s+/gu, " ").trim();
  const exact = text.match(/^(?:create a )?(?:plate|block)\s+(\d+(?:\.\d+)?)\s*(?:mm\s*)?by\s*(\d+(?:\.\d+)?)\s*(?:mm\s*)?(?:(?:by\s*(\d+(?:\.\d+)?)\s*(?:mm)?)|(?:thickness\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:mm)?))?\.?$/u);
  if (!exact) throw new Error("template mismatch");
  const width = Number(exact[1]);
  const height = Number(exact[2]);
  const thickness = Number(exact[3] ?? exact[4] ?? 3);
  const spec = { type: "rectangular_plate", units: "mm", width, height, thickness, holes: [] };
  return { spec, source: `cube([${width}, ${height}, ${thickness}], center=false);\n` };
}

function structuredIrCompile(prompt) {
  const spec = parsePlatePrompt(prompt);
  return { spec, source: toOpenScad(spec) };
}

export const baselines = {
  template_only: templateOnlyCompile,
  direct_regex: directRegexCompile,
  structured_ir: structuredIrCompile,
};

function numericClose(left, right, tolerance = 1e-9) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= tolerance;
}

function geometryMatches(actual, expected) {
  if (!actual || !expected) return false;
  if (!["width", "height", "thickness"].every((key) => numericClose(actual[key], expected[key]))) return false;
  if (!Array.isArray(actual.holes) || !Array.isArray(expected.holes) || actual.holes.length !== expected.holes.length) return false;
  return actual.holes.every((hole, index) => {
    const target = expected.holes[index];
    return numericClose(hole.x, target.x) && numericClose(hole.y, target.y) && numericClose(hole.radius, target.radius);
  });
}

export function staticOpenScadValidity(source) {
  if (typeof source !== "string" || source.trim() === "") return false;
  if (/\b(import|include|use)\b/u.test(source)) return false;
  if (!/\bcube\s*\(/u.test(source)) return false;
  let balance = 0;
  for (const char of source) {
    if (char === "{") balance += 1;
    if (char === "}") balance -= 1;
    if (balance < 0) return false;
  }
  return balance === 0;
}

export function evaluateBaseline(cases, compile) {
  let correctDecisions = 0;
  let accepted = 0;
  let validSyntax = 0;
  let positiveCases = 0;
  let geometryMatchesCount = 0;
  let unsafeAcceptances = 0;
  const failures = [];

  for (const testCase of cases) {
    const expectedAccept = testCase.expected.accept;
    if (expectedAccept) positiveCases += 1;
    try {
      const result = compile(testCase.prompt);
      accepted += 1;
      if (staticOpenScadValidity(result.source)) validSyntax += 1;
      if (expectedAccept) {
        correctDecisions += 1;
        if (geometryMatches(result.spec, testCase.expected.spec)) geometryMatchesCount += 1;
        else failures.push({ id: testCase.id, kind: "geometry_mismatch", actual: result.spec });
      } else {
        unsafeAcceptances += 1;
        failures.push({ id: testCase.id, kind: "unexpected_acceptance", actual: result.spec });
      }
    } catch (error) {
      if (!expectedAccept) correctDecisions += 1;
      else failures.push({ id: testCase.id, kind: "unexpected_rejection", message: error.message });
    }
  }

  return {
    prompts: cases.length,
    expectedPositive: positiveCases,
    expectedNegative: cases.length - positiveCases,
    accepted,
    decisionAccuracy: correctDecisions / cases.length,
    syntaxValidityRateAmongAccepted: accepted > 0 ? validSyntax / accepted : 0,
    constraintAdherenceRate: positiveCases > 0 ? geometryMatchesCount / positiveCases : 0,
    unsafeAcceptanceCount: unsafeAcceptances,
    failures,
  };
}

export function runBenchmark(cases) {
  return Object.fromEntries(Object.entries(baselines).map(([name, compile]) => [name, evaluateBaseline(cases, compile)]));
}
