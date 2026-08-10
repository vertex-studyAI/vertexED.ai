import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const QUEUE_PATH = new URL('../portfolio/project2424/FIRST_100_QUEUE.ndjson', import.meta.url);
const WAVE_PATH = new URL('../portfolio/project2424/FIRST_100_EXECUTION_WAVE.md', import.meta.url);

const ALLOWED_TRACKS = new Set([
  'A — Paper rescue',
  'B — Prototype → benchmark',
  'C — Protocol / evaluation package',
  'C — Existing work → minimum experiment',
  'D — Architecture → surrogate',
  'E — Cheap falsification screen',
]);

async function loadQueue() {
  const raw = await readFile(QUEUE_PATH, 'utf8');
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid NDJSON at line ${index + 1}: ${error.message}`);
      }
    });
}

test('Project 2424 first-100 queue is exactly 100 unique, ordered executable records', async () => {
  const rows = await loadQueue();

  assert.equal(rows.length, 100, 'First-100 queue must contain exactly 100 records');

  const ids = new Set();
  const slugs = new Set();

  rows.forEach((row, index) => {
    const expectedRank = index + 1;

    assert.deepEqual(
      Object.keys(row).sort(),
      ['id', 'name', 'rank', 'slug', 'track'],
      `rank ${expectedRank} must use the stable queue schema`,
    );
    assert.equal(row.rank, expectedRank, `queue rank must be contiguous at ${expectedRank}`);
    assert.match(row.id, /^T2424-\d{4}$/, `rank ${expectedRank} has an invalid Project 2424 id`);
    assert.equal(typeof row.name, 'string');
    assert.ok(row.name.trim().length > 0, `rank ${expectedRank} must have a project name`);
    assert.match(row.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `rank ${expectedRank} has an invalid slug`);
    assert.ok(ALLOWED_TRACKS.has(row.track), `rank ${expectedRank} uses an unsupported execution track`);
    assert.ok(!ids.has(row.id), `duplicate Project 2424 id: ${row.id}`);
    assert.ok(!slugs.has(row.slug), `duplicate Project 2424 slug: ${row.slug}`);

    ids.add(row.id);
    slugs.add(row.slug);
  });
});

test('Project 2424 first-100 wave preserves the evidence-first truth boundary', async () => {
  const [rows, markdown] = await Promise.all([loadQueue(), readFile(WAVE_PATH, 'utf8')]);

  assert.match(markdown, /does \*\*not\*\* claim that any of these 100 projects are paper-ready/i);
  assert.match(markdown, /EXECUTION_READY.*does \*\*not\*\* mean submission-ready/i);
  assert.match(markdown, /independent QA before any paper-ready claim/i);

  for (const row of rows) {
    assert.ok(markdown.includes(`\`${row.id}\``), `wave markdown is missing ${row.id}`);
  }
});
