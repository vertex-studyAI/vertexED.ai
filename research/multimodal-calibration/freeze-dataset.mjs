import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OFFICIAL_SOURCE = Object.freeze({
  revision: '2cbf8318e07b9ece895bb2ae605e71e38d623264',
  pidSplitsPath: 'data/scienceqa/pid_splits.json',
  pidSplitsGitBlobSha: 'bde005092576ebebfed08087879ff774fcd75b62',
  problemsPath: 'data/scienceqa/problems.json',
  problemsGitBlobSha: '3920b762556abfbfa001f298c9740c36d4e041e1'
});

export const SPLIT_MAPPING = Object.freeze({
  development: 'val',
  evaluation: 'test'
});

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return createHash('sha1').update(header).update(buffer).digest('hex');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function requireExactBlob(buffer, expectedSha, label) {
  const actual = gitBlobSha(buffer);
  if (actual !== expectedSha) {
    throw new Error(`${label} source identity mismatch: expected git blob ${expectedSha}, got ${actual}`);
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function requireUniqueOrderedIds(ids, label) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  const seen = new Set();
  for (const id of ids) {
    if (typeof id !== 'string' || id.length === 0) throw new Error(`${label} contains an invalid record id`);
    if (seen.has(id)) throw new Error(`${label} contains duplicate record id ${id}`);
    seen.add(id);
  }
}

export function buildImagePresentManifest({ splitName, ids, problems }) {
  requireUniqueOrderedIds(ids, `${splitName} split`);
  requireObject(problems, 'problems');

  const rows = [];
  for (const id of ids) {
    const problem = problems[id];
    requireObject(problem, `problem ${id}`);
    if (problem.image == null || problem.image === '') continue;
    if (typeof problem.image !== 'string') {
      throw new Error(`problem ${id} image must be a string, empty, or null`);
    }
    rows.push({
      id,
      source_split: splitName,
      image: problem.image
    });
  }

  if (rows.length === 0) {
    throw new Error(`${splitName} image-present subset is empty`);
  }

  const bytes = Buffer.from(rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
  return {
    rows,
    bytes,
    sha256: sha256(bytes)
  };
}

export async function freezeScienceQaImagePresent({ dataRoot, outputRoot }) {
  if (typeof dataRoot !== 'string' || dataRoot.length === 0) throw new Error('dataRoot is required');
  if (typeof outputRoot !== 'string' || outputRoot.length === 0) throw new Error('outputRoot is required');

  const pidPath = path.join(dataRoot, 'pid_splits.json');
  const problemsPath = path.join(dataRoot, 'problems.json');
  const [pidBytes, problemsBytes] = await Promise.all([
    fs.readFile(pidPath),
    fs.readFile(problemsPath)
  ]);

  requireExactBlob(pidBytes, OFFICIAL_SOURCE.pidSplitsGitBlobSha, 'pid_splits.json');
  requireExactBlob(problemsBytes, OFFICIAL_SOURCE.problemsGitBlobSha, 'problems.json');

  const pidSplits = JSON.parse(pidBytes.toString('utf8'));
  const problems = JSON.parse(problemsBytes.toString('utf8'));
  requireObject(pidSplits, 'pid_splits');
  requireObject(problems, 'problems');

  const development = buildImagePresentManifest({
    splitName: SPLIT_MAPPING.development,
    ids: pidSplits[SPLIT_MAPPING.development],
    problems
  });
  const evaluation = buildImagePresentManifest({
    splitName: SPLIT_MAPPING.evaluation,
    ids: pidSplits[SPLIT_MAPPING.evaluation],
    problems
  });

  const developmentIds = new Set(development.rows.map((row) => row.id));
  for (const row of evaluation.rows) {
    if (developmentIds.has(row.id)) {
      throw new Error(`development/evaluation leakage detected for record ${row.id}`);
    }
  }

  await fs.mkdir(outputRoot, { recursive: true });
  const developmentPath = path.join(outputRoot, 'development_ids.jsonl');
  const evaluationPath = path.join(outputRoot, 'evaluation_ids.jsonl');
  const freezePath = path.join(outputRoot, 'FREEZE.json');
  await fs.writeFile(developmentPath, development.bytes, { flag: 'wx' });
  await fs.writeFile(evaluationPath, evaluation.bytes, { flag: 'wx' });

  const freeze = {
    schema_version: 'multimodal-calibration.dataset-freeze.v1',
    source: {
      repository: 'https://github.com/lupantech/ScienceQA',
      revision: OFFICIAL_SOURCE.revision,
      pid_splits: {
        path: OFFICIAL_SOURCE.pidSplitsPath,
        git_blob_sha: OFFICIAL_SOURCE.pidSplitsGitBlobSha
      },
      problems: {
        path: OFFICIAL_SOURCE.problemsPath,
        git_blob_sha: OFFICIAL_SOURCE.problemsGitBlobSha
      }
    },
    mapping: SPLIT_MAPPING,
    development: {
      source_split: SPLIT_MAPPING.development,
      count: development.rows.length,
      sha256: development.sha256,
      path: 'development_ids.jsonl'
    },
    evaluation: {
      source_split: SPLIT_MAPPING.evaluation,
      count: evaluation.rows.length,
      sha256: evaluation.sha256,
      path: 'evaluation_ids.jsonl'
    },
    filter: 'problem.image is a non-empty string',
    overlap_count: 0
  };
  const freezeBytes = Buffer.from(JSON.stringify(freeze, null, 2) + '\n');
  await fs.writeFile(freezePath, freezeBytes, { flag: 'wx' });

  return {
    ...freeze,
    freeze_sha256: sha256(freezeBytes)
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  const args = process.argv.slice(2);
  const dataIndex = args.indexOf('--data-root');
  const outputIndex = args.indexOf('--output-root');
  if (dataIndex === -1 || !args[dataIndex + 1] || outputIndex === -1 || !args[outputIndex + 1]) {
    throw new Error('usage: node freeze-dataset.mjs --data-root <exact ScienceQA data/scienceqa dir> --output-root <new freeze dir>');
  }
  const result = await freezeScienceQaImagePresent({
    dataRoot: args[dataIndex + 1],
    outputRoot: args[outputIndex + 1]
  });
  console.log(JSON.stringify(result, null, 2));
}
