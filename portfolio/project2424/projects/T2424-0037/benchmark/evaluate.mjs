import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePlatePrompt, toOpenScad } from "../src/core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultBenchmarkPath = path.join(here, "prompts.json");

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function validSpec(spec) {
  return Boolean(
    spec &&
    spec.type === "rectangular_plate" &&
    spec.units === "mm" &&
    finitePositive(spec.width) &&
    finitePositive(spec.height) &&
    finitePositive(spec.thickness) &&
    Array.isArray(spec.holes) &&
    spec.holes.every((hole) => finitePositive(hole.radius) && Number.isFinite(hole.x) && Number.isFinite(hole.y))
  );
}

function nearlyEqual(a, b, tolerance = 1e-9) {
  return Math.abs(a - b) <= tolerance;
}

function geometryMatches(actual, expected) {
  if (!actual || !expected) return false;
  if (actual.type !== expected.type || actual.units !== expected.units) return false;
  if (!["width", "height", "thickness"].every((key) => nearlyEqual(actual[key], expected[key]))) return false;
  if (!Array.isArray(actual.holes) || actual.holes.length !== expected.holes.length) return false;
  return actual.holes.every((hole, index) => {
    const target = expected.holes[index];
    return ["x", "y", "radius"].every((key) => nearlyEqual(hole[key], target[key]));
  });
}

function safeOpenScad(source) {
  return typeof source === "string" && source.length > 0 && !/(?:\bimport\b|\binclude\b|\buse\s*</u).test(source);
}

function rate(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export async function evaluateBenchmark(benchmarkPath = defaultBenchmarkPath) {
  const benchmark = JSON.parse(await fs.readFile(benchmarkPath, "utf8"));
  const rows = [];

  for (const item of benchmark) {
    const row = {
      id: item.id,
      complexity: item.complexity,
      parse_valid: false,
      ir_schema_valid: false,
      cad_source_generated: false,
      geometry_target_match: false,
      constraint_satisfied: false,
      backend_execution: "NOT_MEASURED",
      failure: null
    };

    try {
      const spec = parsePlatePrompt(item.prompt);
      row.parse_valid = true;
      row.ir_schema_valid = validSpec(spec);
      row.geometry_target_match = geometryMatches(spec, item.expected);
      row.constraint_satisfied = row.geometry_target_match;
      row.cad_source_generated = safeOpenScad(toOpenScad(spec));
    } catch (error) {
      row.failure = `${error?.name ?? "Error"}: ${error?.message ?? String(error)}`;
    }
    rows.push(row);
  }

  const byComplexity = {};
  for (const row of rows) {
    const bucket = byComplexity[row.complexity] ?? { total: 0, target_matches: 0 };
    bucket.total += 1;
    if (row.geometry_target_match) bucket.target_matches += 1;
    byComplexity[row.complexity] = bucket;
  }
  for (const bucket of Object.values(byComplexity)) {
    bucket.success_rate = rate(bucket.target_matches, bucket.total);
  }

  const total = rows.length;
  const count = (key) => rows.filter((row) => row[key] === true).length;
  return {
    benchmark: "T2424-0037 controlled NLP-to-CAD v1",
    total,
    metrics: {
      parse_validity: rate(count("parse_valid"), total),
      ir_schema_validity: rate(count("ir_schema_valid"), total),
      cad_source_generation_success: rate(count("cad_source_generated"), total),
      exact_dimension_and_layout_accuracy: rate(count("geometry_target_match"), total),
      constraint_satisfaction: rate(count("constraint_satisfied"), total),
      backend_execution_success: null,
      backend_execution_note: "Not measured by this dependency-free evaluator. A real OpenSCAD/CAD-kernel execution gate remains required."
    },
    complexity: byComplexity,
    rows
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await evaluateBenchmark(process.argv[2] ? path.resolve(process.argv[2]) : defaultBenchmarkPath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.rows.every((row) => row.geometry_target_match && row.cad_source_generated) ? 0 : 1;
}
