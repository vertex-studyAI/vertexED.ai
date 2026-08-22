import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  createJetEngineDocument,
  serializeCADDocument,
  toOpenScadDocument,
  validateCADDocument,
} from '../portfolio/project2424/projects/T2424-0037/src/alpha.mjs';

const OUTPUT_DIR = resolve('artifacts/neurocad-alpha/openscad');
mkdirSync(OUTPUT_DIR, { recursive: true });

const cases = [
  { id: 'J1', description: '5 compressor / 1 turbine', parameters: { compressorStages: 5, turbineStages: 1 } },
  { id: 'J2', description: '8 compressor / 2 turbine', parameters: { compressorStages: 8, turbineStages: 2 } },
  { id: 'J3', description: '3 compressor / 3 turbine', parameters: { compressorStages: 3, turbineStages: 3 } },
  { id: 'J4', description: 'maximum supported stages', parameters: { compressorStages: 12, turbineStages: 4 } },
  { id: 'J5', description: 'minimum supported dimensions', parameters: { engineLengthMm: 400, outerDiameterMm: 160, shaftDiameterMm: 12, compressorStages: 3, turbineStages: 1 } },
  { id: 'J6', description: 'casing hidden', parameters: { casingVisible: false } },
  { id: 'J7', description: 'exploded state', parameters: { explodedSpacingMm: 90 } },
];

function runOpenScad(args) {
  return spawnSync('openscad', args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

const versionRun = runOpenScad(['--version']);
const versionText = `${versionRun.stdout || ''}${versionRun.stderr || ''}`.trim();
if (versionRun.error || versionRun.status !== 0) {
  throw new Error(`OpenSCAD is unavailable: ${versionRun.error?.message || versionText || `exit ${versionRun.status}`}`);
}

const results = [];
let failed = false;

for (const item of cases) {
  const started = performance.now();
  const scadPath = resolve(OUTPUT_DIR, `${item.id}.scad`);
  const stlPath = resolve(OUTPUT_DIR, `${item.id}.stl`);
  const jsonPath = resolve(OUTPUT_DIR, `${item.id}.json`);
  const logPath = resolve(OUTPUT_DIR, `${item.id}.openscad.log`);

  let record;
  try {
    const document = createJetEngineDocument(item.parameters);
    const diagnostics = validateCADDocument(document);
    if (diagnostics.status !== 'PASS') {
      throw new Error(`CADDocument validation failed: ${JSON.stringify(diagnostics.errors)}`);
    }

    const scad = toOpenScadDocument(document);
    if (!scad || /\b(?:NaN|Infinity)\b/u.test(scad)) {
      throw new Error('Generated OpenSCAD source is empty or contains a non-finite value');
    }

    writeFileSync(scadPath, scad);
    writeFileSync(jsonPath, `${serializeCADDocument(document)}\n`);

    const openScadRun = runOpenScad(['-o', stlPath, scadPath]);
    const combinedLog = `${openScadRun.stdout || ''}${openScadRun.stderr || ''}`;
    writeFileSync(logPath, combinedLog);

    if (openScadRun.error) throw openScadRun.error;
    if (openScadRun.status !== 0) {
      throw new Error(`OpenSCAD exited ${openScadRun.status}: ${combinedLog.slice(-2000)}`);
    }

    const stlBytes = statSync(stlPath).size;
    if (stlBytes <= 0) throw new Error('OpenSCAD produced an empty STL file');

    const topologyWarning = /not a valid 2-manifold|not closed|non[- ]?manifold/iu.test(combinedLog);
    record = {
      id: item.id,
      description: item.description,
      parameters: item.parameters,
      validationStatus: diagnostics.status,
      objectCount: document.objects.length,
      assemblyCount: document.assemblies.length,
      scadBytes: Buffer.byteLength(scad),
      stlBytes,
      openScadExitCode: openScadRun.status,
      topologyWarning,
      durationMs: Number((performance.now() - started).toFixed(3)),
      status: 'PASS',
      error: null,
    };
  } catch (error) {
    failed = true;
    record = {
      id: item.id,
      description: item.description,
      parameters: item.parameters,
      validationStatus: 'UNKNOWN',
      objectCount: null,
      assemblyCount: null,
      scadBytes: null,
      stlBytes: null,
      openScadExitCode: null,
      topologyWarning: null,
      durationMs: Number((performance.now() - started).toFixed(3)),
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
    };
  }
  results.push(record);
  console.log(`${record.id}: ${record.status} — ${record.description}${record.topologyWarning ? ' — topology warning preserved' : ''}`);
}

const summary = {
  schema: 'neurocad-alpha-openscad-qa-0.1',
  kind: 'PRODUCT_QA_NOT_MANUFACTURING_VALIDATION',
  openScadVersion: versionText,
  total: results.length,
  passed: results.filter((entry) => entry.status === 'PASS').length,
  failed: results.filter((entry) => entry.status === 'FAIL').length,
  topologyWarnings: results.filter((entry) => entry.topologyWarning === true).map((entry) => entry.id),
  cases: results,
  scope: 'Conceptual/educational geometry only. Non-empty STL generation does not establish manifold, manufacturing, structural, propulsion, airworthiness, or certification validity.',
};

writeFileSync(resolve(OUTPUT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(
  resolve(OUTPUT_DIR, 'SUMMARY.md'),
  `# NeuroCAD Alpha 0.1 — OpenSCAD QA\n\n` +
  `- OpenSCAD: **${versionText}**\n` +
  `- Cases: **${summary.passed}/${summary.total} passed**\n` +
  `- Topology warnings: **${summary.topologyWarnings.length ? summary.topologyWarnings.join(', ') : 'none detected'}**\n\n` +
  `| Case | Configuration | Result | STL bytes | Topology warning |\n|---|---|---:|---:|---:|\n` +
  results.map((entry) => `| ${entry.id} | ${entry.description} | ${entry.status} | ${entry.stlBytes ?? '—'} | ${entry.topologyWarning === true ? 'YES' : entry.topologyWarning === false ? 'NO' : '—'} |`).join('\n') +
  `\n\nThis is product/backend QA only. It does not establish manufacturing validity or propulsion performance.\n`,
);

if (failed) {
  process.exitCode = 1;
}
