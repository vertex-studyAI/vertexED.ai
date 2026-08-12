import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_RESULT = resolve(HERE, 'retained-result.json');
const TOLERANCE = 1e-12;

function target(x) {
  return 0.75 * x + 0.25;
}

function expertPredictions(x, corrupted) {
  const expected = target(x);
  return [
    expected + 0.04 * x,
    expected - 0.03 * (1 - x * x),
    expected + 0.02 * Math.sin(3 * x) + (corrupted && x > 0.2 ? 6 : 0),
  ];
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evaluate({ sampleCount, acceptedOutputRange, corrupted }) {
  const [lower, upper] = acceptedOutputRange;
  const verifiedErrors = [];
  const unverifiedErrors = [];
  let rejected = 0;
  let exhausted = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const x = -1 + (2 * index) / (sampleCount - 1);
    const expected = target(x);
    const predictions = expertPredictions(x, corrupted);
    const accepted = predictions.map((prediction) => prediction >= lower && prediction <= upper);
    const acceptedPredictions = predictions.filter((_, expertIndex) => accepted[expertIndex]);

    rejected += accepted.filter((value) => !value).length;
    if (acceptedPredictions.length === 0) {
      exhausted += 1;
    } else {
      const verifiedPrediction = mean(acceptedPredictions);
      verifiedErrors.push(Math.abs(verifiedPrediction - expected));
    }

    const unverifiedPrediction = mean(predictions);
    unverifiedErrors.push(Math.abs(unverifiedPrediction - expected));
  }

  return {
    verifiedMeanAbsoluteError: verifiedErrors.length ? mean(verifiedErrors) : null,
    unverifiedMeanAbsoluteError: mean(unverifiedErrors),
    rejectedExpertRate: rejected / (sampleCount * 3),
    exhaustedRate: exhausted / sampleCount,
  };
}

function close(actual, expected, name) {
  if (actual === null || expected === null) {
    if (actual !== expected) throw new Error(`${name}: ${actual} != ${expected}`);
    return;
  }
  if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual - expected) > TOLERANCE) {
    throw new Error(`${name}: ${actual} != ${expected}`);
  }
}

function compareMetrics(actual, expected, prefix) {
  close(actual.verifiedMeanAbsoluteError, expected.verifiedMeanAbsoluteError, `${prefix}.verifiedMeanAbsoluteError`);
  close(actual.unverifiedMeanAbsoluteError, expected.unverifiedMeanAbsoluteError, `${prefix}.unverifiedMeanAbsoluteError`);
  close(actual.rejectedExpertRate, expected.rejectedExpertRate, `${prefix}.rejectedExpertRate`);
  close(actual.exhaustedRate, expected.exhaustedRate, `${prefix}.exhaustedRate`);
}

export function verifyRetainedResult(report) {
  if (!report || report.project !== 'T2424-1768') throw new Error('wrong project identity');
  const { sampleCount, expertCount, router, acceptedOutputRange } = report.protocol || {};
  if (sampleCount !== 81 || expertCount !== 3 || router !== 'uniform-fixed-scores') {
    throw new Error('retained protocol does not match the frozen fixture');
  }
  if (!Array.isArray(acceptedOutputRange) || acceptedOutputRange.length !== 2) {
    throw new Error('acceptedOutputRange must contain two bounds');
  }

  const recomputedCorrupted = evaluate({ sampleCount, acceptedOutputRange, corrupted: true });
  const recomputedClean = evaluate({ sampleCount, acceptedOutputRange, corrupted: false });
  compareMetrics(report.corrupted, recomputedCorrupted, 'corrupted');
  compareMetrics(report.clean, recomputedClean, 'clean');

  const cleanDelta = Math.abs(
    recomputedClean.verifiedMeanAbsoluteError - recomputedClean.unverifiedMeanAbsoluteError,
  );
  close(report.cleanDelta, cleanDelta, 'cleanDelta');

  const gates = {
    catchesInjectedViolation: recomputedCorrupted.rejectedExpertRate > 0,
    improvesCorruptedControl:
      recomputedCorrupted.verifiedMeanAbsoluteError <
      recomputedCorrupted.unverifiedMeanAbsoluteError * 0.5,
    preservesCleanControl: recomputedClean.rejectedExpertRate === 0 && cleanDelta <= TOLERANCE,
    neverExhaustsFixture:
      recomputedCorrupted.exhaustedRate === 0 && recomputedClean.exhaustedRate === 0,
  };

  for (const [name, value] of Object.entries(gates)) {
    if (report.gates?.[name] !== value) throw new Error(`gate mismatch: ${name}`);
  }

  const verdict = Object.values(gates).every(Boolean)
    ? 'PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS'
    : 'FAIL_CONTROLLED_SELF_VERIFICATION_MECHANICS';
  if (report.verdict !== verdict) throw new Error(`verdict mismatch: ${report.verdict} != ${verdict}`);

  return {
    ok: true,
    project: report.project,
    corrupted: recomputedCorrupted,
    clean: recomputedClean,
    gates,
    verdict,
  };
}

export async function verifyRetainedResultFile(path = DEFAULT_RESULT) {
  const report = JSON.parse(await readFile(path, 'utf8'));
  return verifyRetainedResult(report);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  verifyRetainedResultFile(process.argv[2] ? resolve(process.argv[2]) : DEFAULT_RESULT)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(`[T2424-1768 verifier] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
