import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const QUARANTINED_TEST_PATTERNS = [
  /^adrPredictiveSurrogate/i,
  /^counterfactualDefectWorlds/i,
  /^darcy-v2-/i,
  /^financemeta-/i,
  /^grokkingAgent/i,
  /^iris-/i,
  /^neurocad/i,
  /^nlpToCad/i,
  /^outreachControlPlane/i,
  /^pdeRepresentationTransitions/i,
  /^percy/i,
  /^portfolio/i,
  /^project2424/i,
  /^residualEventTokenization/i,
  /^studentVentureQueue/i,
  /^theoryManifoldExperimentPlanner/i,
  /^webContentLaunchWave/i,
];

export function classifyTestFiles(testDirectory = resolve('tests')) {
  const all = readdirSync(testDirectory)
    .filter((file) => file.endsWith('.test.mjs'))
    .sort();
  const quarantine = all.filter((file) => QUARANTINED_TEST_PATTERNS.some((pattern) => pattern.test(file)));
  const quarantined = new Set(quarantine);
  return {
    all,
    app: all.filter((file) => !quarantined.has(file)),
    quarantine,
  };
}

function run(scope) {
  const groups = classifyTestFiles();
  if (scope === 'list') {
    process.stdout.write(`${JSON.stringify({
      canonicalVertexEdFiles: groups.app.length,
      quarantinedCrossProjectFiles: groups.quarantine.length,
      totalFiles: groups.all.length,
    }, null, 2)}\n`);
    return;
  }

  if (scope !== 'app' && scope !== 'quarantine') {
    throw new Error('Usage: node scripts/run-test-scope.mjs <app|quarantine|list>');
  }

  const files = groups[scope].map((file) => resolve('tests', file));
  if (files.length === 0) throw new Error(`No ${scope} tests were classified.`);
  const label = scope === 'app' ? 'canonical VertexED' : 'quarantined cross-project';
  process.stdout.write(`[tests] Running ${files.length} ${label} test files.\n`);
  const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run(process.argv[2] ?? 'list');
}
