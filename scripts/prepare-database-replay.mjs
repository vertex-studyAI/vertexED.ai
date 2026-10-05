import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function prepareDatabaseReplay({ source = process.cwd(), destination, projectId, portBase = 54320 }) {
  if (!destination || !/^vertexed-test-[a-z0-9-]+$/.test(projectId ?? '')) {
    throw new Error('Supply a new destination and a unique vertexed-test-* project ID.');
  }
  if (!Number.isInteger(portBase) || portBase < 1024 || portBase > 65520) throw new Error('Invalid local port base.');
  const target = resolve(destination);
  if (existsSync(target)) throw new Error('Replay destination already exists; preserve it and choose a new directory.');
  const schema = join(resolve(source), 'supabase');
  const counters = new Map();
  const versions = new Set();
  const migrations = readdirSync(join(schema, 'migrations')).filter(name => name.endsWith('.sql')).sort().map(name => {
    const match = /^(\d{8}|\d{14})_(.+)\.sql$/.exec(name);
    if (!match) throw new Error(`Invalid migration filename: ${name}`);
    let version = match[1];
    if (version.length === 8) {
      const index = counters.get(version) ?? 0;
      counters.set(version, index + 1);
      if (index >= 60) throw new Error('Too many legacy migrations for one date.');
      version += String(index).padStart(6, '0');
    }
    if (versions.has(version)) throw new Error(`Replay version collision: ${version}`);
    versions.add(version);
    const bytes = readFileSync(join(schema, 'migrations', name));
    return { original: name, local: `${version}_${match[2]}.sql`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes };
  });
  if (!migrations.length) throw new Error('Refusing an empty migration replay.');
  const tests = readdirSync(join(schema, 'tests'), { recursive: true }).filter(name => name.endsWith('.sql')).sort().map(name => ({
    path: name,
    sha256: createHash('sha256').update(readFileSync(join(schema, 'tests', name))).digest('hex'),
  }));
  if (!tests.length) throw new Error('No SQL tests found; refusing to prepare an untested replay.');
  let config = readFileSync(join(schema, 'config.toml'), 'utf8');
  if (!/^project_id\s*=\s*"[^"]+"/m.test(config)) throw new Error('Missing source project ID.');
  config = config.replace(/^project_id\s*=\s*"[^"]+"/m, `project_id = "${projectId}"`);
  config = config.replace(/\b543(2[0-9])\b/g, (_, suffix) => String(portBase + Number(suffix) - 20));
  mkdirSync(join(target, 'supabase', 'migrations'), { recursive: true });
  writeFileSync(join(target, 'supabase', 'config.toml'), config);
  cpSync(join(schema, 'tests'), join(target, 'supabase', 'tests'), { recursive: true });
  for (const item of migrations) writeFileSync(join(target, 'supabase', 'migrations', item.local), item.bytes);
  const manifest = { schemaVersion: 1, purpose: 'disposable-local-replay', projectId, source: resolve(source), portBase,
    migrations: migrations.map(({ original, local, sha256 }) => ({ original, local, sha256 })), tests };
  writeFileSync(join(target, 'replay-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function verifyReplayTarget(destination) {
  if (!destination) throw new Error('Set VERTEXED_TEST_DB_WORKDIR to a prepared disposable local replay.');
  const target = resolve(destination);
  const manifest = JSON.parse(readFileSync(join(target, 'replay-manifest.json'), 'utf8'));
  if (manifest.purpose !== 'disposable-local-replay' || !/^vertexed-test-[a-z0-9-]+$/.test(manifest.projectId)) throw new Error('Not a disposable VertexED test project.');
  const schema = join(target, 'supabase');
  const config = readFileSync(join(schema, 'config.toml'), 'utf8');
  if (!config.includes(`project_id = "${manifest.projectId}"`) || existsSync(join(schema, '.temp', 'project-ref'))) throw new Error('Project identity changed or replay is linked to a remote project.');
  const actual = readdirSync(join(schema, 'migrations')).filter(name => name.endsWith('.sql')).sort();
  const expected = manifest.migrations.map(item => item.local).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Replay migration inventory changed.');
  for (const item of manifest.migrations) {
    if (basename(item.local) !== item.local) throw new Error('Invalid replay path.');
    const hash = createHash('sha256').update(readFileSync(join(schema, 'migrations', item.local))).digest('hex');
    if (hash !== item.sha256) throw new Error(`Replay migration changed: ${item.local}`);
  }
  const testPaths = readdirSync(join(schema, 'tests'), { recursive: true }).filter(name => name.endsWith('.sql')).sort();
  if (!manifest.tests?.length || JSON.stringify(testPaths) !== JSON.stringify(manifest.tests.map(item => item.path).sort())) throw new Error('Replay SQL test inventory changed or is empty.');
  for (const item of manifest.tests) {
    if (item.path.split(/[\\/]/).includes('..') || resolve(schema, 'tests', item.path) !== join(schema, 'tests', item.path)) throw new Error('Invalid test path.');
    const hash = createHash('sha256').update(readFileSync(join(schema, 'tests', item.path))).digest('hex');
    if (hash !== item.sha256) throw new Error(`Replay SQL test changed: ${item.path}`);
  }
  return target;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , destination, projectId, port] = process.argv;
  const result = prepareDatabaseReplay({ destination, projectId, portBase: port ? Number(port) : 54320 });
  console.log(`Prepared ${result.migrations.length} unchanged SQL migrations for ${result.projectId}.`);
}
