import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePlatePrompt, toOpenScad } from '../src/core.mjs';
import { directFlatParse } from './direct_baseline.mjs';
import { validatedDirectParse } from './validated_direct_baseline.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const benchmarkPath = path.join(here, 'ood_prompts_v1.json');

function nearlyEqual(a, b, tolerance = 1e-9) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}

function geometryMatches(actual, expected) {
  if (!actual || !expected) return false;
  if (actual.type !== expected.type || actual.units !== expected.units) return false;
  if (!['width', 'height', 'thickness'].every((key) => nearlyEqual(actual[key], expected[key]))) return false;
  if (!Array.isArray(actual.holes) || actual.holes.length !== expected.holes.length) return false;
  return actual.holes.every((hole, index) => {
    const target = expected.holes[index];
    return ['x', 'y', 'radius'].every((key) => nearlyEqual(hole[key], target[key]));
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

function evaluateSystem(name, parse, cases, requireSafeCad) {
  const rows = cases.map((item) => {
    let accepted = false;
    let exact = false;
    let cadSafe = false;
    let error = null;
    try {
      const spec = parse(item.prompt);
      accepted = true;
      exact = item.kind === 'valid' && geometryMatches(spec, item.expected);
      cadSafe = requireSafeCad ? safeCad(spec) : true;
    } catch (caught) {
      error = `${caught?.name ?? 'Error'}: ${caught?.message ?? String(caught)}`;
    }
    const success = item.kind === 'valid' ? accepted && exact && cadSafe : !accepted;
    return { id: item.id, kind: item.kind, success, accepted, exact_geometry: exact, cad_safe: cadSafe, error };
  });

  const valid = rows.filter((row) => row.kind === 'valid');
  const invalid = rows.filter((row) => row.kind === 'invalid');
  const validSuccess = valid.filter((row) => row.success).length;
  const invalidSuccess = invalid.filter((row) => row.success).length;
  const allSuccess = rows.filter((row) => row.success).length;
  return {
    system: name,
    metrics: {
      valid_exact_geometry_accuracy: validSuccess / valid.length,
      invalid_rejection_accuracy: invalidSuccess / invalid.length,
      overall_success: allSuccess / rows.length,
      accepted_invalid_count: invalid.filter((row) => row.accepted).length,
      valid_failures: valid.length - validSuccess
    },
    rows
  };
}

export async function evaluateComponentAblation() {
  const cases = JSON.parse(await fs.readFile(benchmarkPath, 'utf8'));
  if (cases.length !== 20) throw new Error(`frozen diagnostic benchmark must contain 20 cases, found ${cases.length}`);
  const valid = cases.filter((item) => item.kind === 'valid').length;
  const invalid = cases.filter((item) => item.kind === 'invalid').length;
  if (valid !== 12 || invalid !== 8) throw new Error('frozen diagnostic benchmark must contain 12 valid and 8 invalid cases');

  const method = evaluateSystem('current_typed_validated_compiler', parsePlatePrompt, cases, true);
  const direct = evaluateSystem('direct_flat_extraction', directFlatParse, cases, false);
  const validatedDirect = evaluateSystem('direct_extraction_plus_validation', validatedDirectParse, cases, true);

  const originalGap = method.metrics.overall_success - direct.metrics.overall_success;
  const remainingGap = method.metrics.overall_success - validatedDirect.metrics.overall_success;
  const recoveryFraction = originalGap > 0
    ? (validatedDirect.metrics.overall_success - direct.metrics.overall_success) / originalGap
    : null;

  let interpretation = 'MIXED_OR_UNRESOLVED';
  if (recoveryFraction !== null && recoveryFraction >= 0.80 && remainingGap <= 0.05) {
    interpretation = 'VALIDATION_DOMINANT';
  } else if (recoveryFraction !== null && recoveryFraction <= 0.20 && remainingGap >= 0.15) {
    interpretation = 'PARSER_OR_TYPED_PATH_REMAINS_MATERIAL';
  }

  return {
    protocol: 'T2424-0037-neurocad-component-ablation-v2-20260814',
    protocol_status: 'frozen_before_first_execution',
    benchmark_role: 'component_diagnostic_only_not_unseen_OOD',
    cases: { total: cases.length, valid, invalid },
    systems: { method, direct, validated_direct: validatedDirect },
    diagnostics: {
      original_gap: originalGap,
      remaining_gap: remainingGap,
      validation_recovery_fraction: recoveryFraction,
      interpretation
    },
    frozen_thresholds: {
      validation_dominant_recovery_fraction_min: 0.80,
      validation_dominant_remaining_gap_max: 0.05,
      typed_path_material_recovery_fraction_max: 0.20,
      typed_path_material_remaining_gap_min: 0.15
    },
    claim_boundary: 'Deterministic component diagnostic on reused 20-case plate benchmark only. Does not establish general text-to-CAD, learned-model superiority, new-part-family OOD, manufacturing correctness, or typed-IR novelty.'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await evaluateComponentAblation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
