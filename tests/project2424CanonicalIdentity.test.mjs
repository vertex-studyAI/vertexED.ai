import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project2424Root = path.join(repoRoot, 'portfolio/project2424');
const projectsRoot = path.join(project2424Root, 'projects');

function readFrozenQueue() {
  return fs
    .readFileSync(path.join(project2424Root, 'FIRST_100_QUEUE.ndjson'), 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function normalizeTitle(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function hasCanonicalRecoveredEvidenceIdentity(id, queueEntry) {
  const statusPath = path.join(projectsRoot, id, 'STATUS.md');
  if (!fs.existsSync(statusPath)) return false;

  const status = fs.readFileSync(statusPath, 'utf8');
  const projectLine = status
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^\*\*Project:\*\*/.test(line));
  const recoveredAliasLine = status
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^\*\*Recovered\/source alias:\*\*/.test(line));
  const stateLine = status
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^State:\s+`RECOVERED_/.test(line));

  if (!projectLine || !recoveredAliasLine || !stateLine) return false;

  const declaredProject = projectLine.replace(/^\*\*Project:\*\*\s*/, '');
  return normalizeTitle(declaredProject) === normalizeTitle(queueEntry.name);
}

test('every canonical T2424 package identity agrees with the frozen First-100 queue', () => {
  const queue = readFrozenQueue();
  const queueById = new Map(queue.map((entry) => [entry.id, entry]));
  const canonicalDirectories = fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^T2424-\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const conflicts = [];
  for (const id of canonicalDirectories) {
    const queueEntry = queueById.get(id);
    if (!queueEntry) {
      conflicts.push(`${id}: canonical package has no frozen queue entry`);
      continue;
    }

    const readmePath = path.join(projectsRoot, id, 'README.md');
    if (!fs.existsSync(readmePath)) {
      conflicts.push(`${id}: canonical package is missing README.md`);
      continue;
    }

    const readme = fs.readFileSync(readmePath, 'utf8');
    const heading = readme
      .split('\n')
      .map((line) => line.trim())
      .find((line) => /^#\s+/.test(line));
    if (!heading) {
      conflicts.push(`${id}: README.md has no H1 title`);
      continue;
    }

    const normalizedHeading = normalizeTitle(heading.replace(/^#\s+/, ''));
    const normalizedQueueName = normalizeTitle(queueEntry.name);
    if (
      !normalizedHeading.includes(normalizedQueueName) &&
      !hasCanonicalRecoveredEvidenceIdentity(id, queueEntry)
    ) {
      conflicts.push(`${id}: README title '${heading}' does not match frozen name '${queueEntry.name}'`);
    }
  }

  assert.deepEqual(conflicts, []);
});

test('T2424-0050 is Darcy Latent Operator and Benchmark Augmentation Theory is not a canonical First-100 package', () => {
  const queue = readFrozenQueue();
  const darcy = queue.find((entry) => entry.id === 'T2424-0050');
  assert.ok(darcy);
  assert.equal(darcy.name, 'Darcy Latent Operator');
  assert.equal(darcy.slug, 'darcy-latent-operator');

  const darcyReadme = fs.readFileSync(
    path.join(projectsRoot, 'T2424-0050', 'README.md'),
    'utf8',
  );
  assert.match(darcyReadme.split('\n')[0], /Darcy Latent Operator/);

  const auxiliaryReadme = path.join(
    project2424Root,
    'tools/benchmark-augmentation-theory/README.md',
  );
  assert.equal(fs.existsSync(auxiliaryReadme), true);
  assert.equal(
    fs.existsSync(path.join(projectsRoot, 'AUX-P2424-BENCHMARK-AUGMENTATION')),
    false,
  );
});
