import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePlatePrompt, toOpenScad } from '../src/core.mjs';
import { directFlatParse } from './direct_baseline.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const benchmarkPath = path.join(here, 'ood_prompts_v1.json');

function nearlyEqual(a, b, tolerance = 1e-9) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
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

function safeCad(spec) {
  try {
    const source = toOpenScad(spec);
    return typeof source === 'string' && source.length > 0 && !/(?:\bimport\b|\binclude\b|\buse\s*<)/u.test(source);
  } catch {
    return false;
  }
}

function classifyFailure(message = '') {
  const text = String(message).toLowerCase();
  if (text.includes('plate, panel, bracket, or rectangle')) return 'OBJECT_CLASS_REJECTED';
  if (text.includes('width and height')) return 'DIMENSION_PARSE_FAILURE';
  if (text.includes('must be finite and > 0')) return 'NON_POSITIVE_DIMENSION';
  if (text.includes('dimensions exceed')) return 'DIMENSION_SAFETY_LIMIT';
  if (text.includes('supports 1, 2, or 4 holes')) return 'UNSUPPORTED_HOLE_COUNT';
  if (text.includes('radius or diameter')) return 'MISSING_HOLE_SIZE';
  if (text.includes('hole radius') || text.includes('hole inset')) return 'HOLE_GEOMETRY_INVALID';
  return 'UNEXPECTED_REJECT';
}

function rate(num, den) {
  return den ? num / den : null;
}

function evaluateSystem(name, parse, cases, requireSafeCad) {
  const rows = [];
  for (const item of cases) {
    let accepted = false;
    let exact = false;
    let cadSafe = false;
    let failure = null;
    let failureClass = null;
    try {
      const spec = parse(item.prompt);
      accepted = true;
      exact = item.kind === 'valid' && geometryMatches(spec, item.expected);
      cadSafe = requireSafeCad ? safeCad(spec) : true;
      if (item.kind === 'valid' && !exact) failureClass = 'TARGET_MISMATCH';
      if (item.kind === 'invalid') failureClass = 'UNEXPECTED_ACCEPT';
    } catch (error) {
      failure = `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`;
      failureClass = classifyFailure(error?.message);
    }
    const success = item.kind === 'valid' ? (accepted && exact && cadSafe) : !accepted;
    rows.push({
      id: item.id,
      kind: item.kind,
      success,
      accepted,
      exact_geometry: exact,
      cad_safe: cadSafe,
      expected_failure_class: item.failure_class ?? null,
      observed_failure_class: failureClass,
      failure
    });
  }

  const valid = rows.filter((row) => row.kind === 'valid');
  const invalid = rows.filter((row) => row.kind === 'invalid');
  const validExact = valid.filter((row) => row.success).length;
  const invalidRejected = invalid.filter((row) => row.success).length;
  const totalSuccess = rows.filter((row) => row.success).length;
  return {
    system: name,
    metrics: {
      valid_exact_geometry_accuracy: rate(validExact, valid.length),
      invalid_rejection_accuracy: rate(invalidRejected, invalid.length),
      overall_success: rate(totalSuccess, rows.length),
      accepted_invalid_count: invalid.filter((row) => row.accepted).length,
      valid_failures: valid.length - validExact
    },
    rows
  };
}

export async function evaluateOodBenchmark() {
  const cases = JSON.parse(await fs.readFile(benchmarkPath, 'utf8'));
  if (cases.length !== 20) throw new Error(`frozen benchmark must contain 20 cases, found ${cases.length}`);
  const validCount = cases.filter((item) => item.kind === 'valid').length;
  const invalidCount = cases.filter((item) => item.kind === 'invalid').length;
  if (validCount !== 12 || invalidCount !== 8) throw new Error('frozen benchmark must contain 12 valid and 8 invalid cases');

  const method = evaluateSystem('typed_validated_compiler', parsePlatePrompt, cases, true);
  const baseline = evaluateSystem('direct_flat_extraction', directFlatParse, cases, false);
  const delta = method.metrics.overall_success - baseline.metrics.overall_success;
  const criteria = {
    valid_exact_geometry_accuracy_min: 0.80,
    invalid_rejection_accuracy_min: 0.80,
    delta_overall_min: 0.15
  };
  const pass =
    method.metrics.valid_exact_geometry_accuracy >= criteria.valid_exact_geometry_accuracy_min &&
    method.metrics.invalid_rejection_accuracy >= criteria.invalid_rejection_accuracy_min &&
    delta >= criteria.delta_overall_min;

  return {
    protocol: 'T2424-0037-held-out-linguistic-template-v1',
    benchmark_kind: 'template_OOD_within_rectangular_plate_scope',
    cases: { total: cases.length, valid: validCount, invalid: invalidCount },
    frozen_criteria: criteria,
    method,
    baseline,
    delta_overall: delta,
    verdict: pass ? 'PASS_HELD_OUT_TEMPLATE_GATE' : 'FAIL_HELD_OUT_TEMPLATE_GATE',
    claim_boundary: 'Controlled deterministic rectangular-plate template robustness only; no general NLP-to-CAD, new-part-family OOD, LLM superiority, manufacturing, or paper-novelty claim.'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await evaluateOodBenchmark();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
