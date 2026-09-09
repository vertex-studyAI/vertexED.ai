import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, stat, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { binIndex, validateDataset, summarize, renderReport, main } from '../scripts/render-recommendation-calibration.mjs';

const digest = 'b'.repeat(64);
const record = (id, confidence, outcome, version = 'v1') => ({ id, confidence, outcome, version, outcomeSource: `fixture:${id}` });
const dataset = (records = []) => ({ schemaVersion: 1, evidenceKind: 'synthetic-test', provenance: {
  sourceCommit: 'a'.repeat(40), sourceArtifact: 'UNIT TEST ONLY',
  confidenceDefinition: 'Synthetic probability of binary success', outcomeDefinition: 'Synthetic binary fixture label; not observed user results',
}, records });
const fixture = () => dataset([
  record('overconfident-failure', .95, 0), record('successful-comparison', 1, 1),
  record('unresolved', .99, null), record('other-version', .1, 1, 'v2'),
]);
const approx = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);

for (let i = 0; i <= 10; i += 1) {
  test(`exact edge ${i}/10 and adjacent representable range`, () => {
    assert.equal(binIndex(i / 10), Math.min(i, 9));
    if (i > 0) assert.equal(binIndex(i / 10 - Number.EPSILON), i - 1);
    if (i < 10) assert.equal(binIndex(i / 10 + Number.EPSILON), i);
  });
}
test('rejects non-probabilities without coercion', () => {
  for (const x of [NaN, Infinity, -Infinity, -1, 1.01, null, undefined, '0.9', true]) assert.throws(() => binIndex(x));
});
test('calculates labeled counts, bins, ECE and Brier without treating missing as failure', () => {
  const s = summarize(fixture(), 'v1');
  assert.deepEqual([s.total, s.n, s.missing], [3, 2, 1]);
  assert.deepEqual([s.bins[9].total, s.bins[9].n, s.bins[9].missing], [3, 2, 1]);
  approx(s.bins[9].meanConfidence, .975);
  approx(s.bins[9].empiricalRate, .5);
  approx(s.ece, .475);
  approx(s.brier, .45125);
  assert.equal(s.highConfidenceFailures[0].id, 'overconfident-failure');
  assert.equal(s.bins[9].state, 'sparse');
});
test('weights ECE by labeled n, not equally across bins', () => {
  const s = summarize(dataset([record('a', .1, 0), record('b', .9, 1), record('c', .9, 0)]), 'v1');
  approx(s.ece, (.1 + 2 * .4) / 3);
});
test('never pools versions', () => {
  const s = summarize(fixture(), 'v2');
  assert.equal(s.n, 1);
  assert.equal(s.records[0].id, 'other-version');
  assert.equal(s.highConfidenceFailures.length, 0);
  approx(s.brier, .81);
});
test('unknown version and all-unresolved inputs are empty, not zero evidence', () => {
  for (const s of [summarize(fixture(), 'unknown'), summarize(dataset([record('x', .95, null)]), 'v1')]) {
    assert.equal(s.n, 0);
    assert.equal(s.ece, null);
    assert.equal(s.brier, null);
    assert.ok(s.bins.every((b) => b.meanConfidence === null && b.empiricalRate === null && b.gap === null));
  }
});
test('duplicate identities cannot silently inflate sample size', () => {
  assert.throws(() => validateDataset(dataset([record('a', .1, 0), record('a', .9, 1)])), /duplicate/);
  assert.doesNotThrow(() => validateDataset(dataset([record('a', .1, 0), record('a', .9, 1, 'v2')])));
});
test('requires explicit binary outcomes and retained source identifiers', () => {
  for (const outcome of [undefined, .5, '1', true, NaN]) assert.throws(() => validateDataset(dataset([record('a', .5, outcome)])), /outcome/);
  const r = record('a', .5, 1); delete r.outcomeSource;
  assert.throws(() => validateDataset(dataset([r])), /outcomeSource/);
});
test('requires evidence kind, nonempty definitions, version and exact source SHA', () => {
  for (const modify of [
    (d) => { d.schemaVersion = 2; }, (d) => { d.evidenceKind = 'verified'; },
    (d) => { d.provenance.sourceCommit = 'main'; }, (d) => { d.provenance.outcomeDefinition = ''; },
    (d) => { d.records[0].version = ' '; }, (d) => { d.records[0].id = 'a'.repeat(501); },
  ]) { const d = fixture(); modify(d); assert.throws(() => validateDataset(d)); }
});
test('bounded data size and object validation', () => {
  for (const d of [null, [], {}, dataset([null])]) assert.throws(() => validateDataset(d));
  assert.throws(() => validateDataset(dataset(Array(10001).fill(record('a', 1, 1)))), /at most/);
});
test('renderer displays inspectable failures, counts, empty and synthetic states', () => {
  const html = renderReport(fixture(), 'v1', digest);
  assert.match(html, /High-confidence observed failures: 1/);
  assert.match(html, /<th scope="row">overconfident-failure<\/th>/);
  assert.match(html, /<summary>Inspect all 3 selected recommendation records/);
  assert.match(html, /n=2/);
  assert.match(html, /SYNTHETIC TEST FIXTURE — NOT RESEARCH OR PRODUCTION EVIDENCE/);
  assert.doesNotMatch(html, /other-version/);
  const empty = renderReport(dataset(), 'v1', digest);
  assert.match(empty, /No labeled outcomes for this version/);
  assert.doesNotMatch(empty, /<circle/);
});
test('escapes untrusted strings and disables active/external content', () => {
  const d = fixture();
  d.records[0].id = '<script>alert(1)</script>';
  d.records[0].outcomeSource = '<img src=https://example.invalid/x onerror=alert(1)>';
  d.provenance.sourceArtifact = '"/><iframe src="x">';
  d.records[0].version = 'v1<script>';
  const html = renderReport(d, 'v1<script>', digest);
  assert.doesNotMatch(html, /<script|<iframe|<img|<a href=/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /default-src 'none'/);
});
test('observed declaration is never advertised as independent verification', () => {
  const d = fixture(); d.evidenceKind = 'observed';
  assert.match(renderReport(d, 'v1', digest), /not independently authenticated/);
});
test('summary does not mutate observations; rendering is deterministic', () => {
  const d = fixture(); const before = JSON.stringify(d);
  summarize(d, 'v1');
  assert.equal(renderReport(d, 'v1', digest), renderReport(d, 'v1', digest));
  assert.equal(JSON.stringify(d), before);
});
test('high-confidence threshold is inclusive and unresolved is never a failed observation', () => {
  const s = summarize(dataset([record('edge', .8, 0), record('below', .8 - Number.EPSILON, 0), record('missing', 1, null)]), 'v1');
  assert.deepEqual(s.highConfidenceFailures.map((r) => r.id), ['edge']);
});
test('dense label starts at n=10 but is still descriptive, not a significance claim', () => {
  const s = summarize(dataset(Array.from({ length: 10 }, (_, i) => record(String(i), .8, 1))), 'v1');
  assert.equal(s.bins[8].state, 'descriptive only');
});
test('CLI binds exact bytes, writes private artifact, and refuses overwrite/symlink/input clobber', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'calibration-'));
  try {
    const input = join(dir, 'input.json'); const output = join(dir, 'output.html');
    const raw = JSON.stringify(fixture(), null, 2) + '\n'; await writeFile(input, raw);
    const result = await main([input, output, '--version', 'v1']);
    assert.equal(result.inputSha256, createHash('sha256').update(raw).digest('hex'));
    assert.equal(result.selectedRecords, 3);
    assert.match(await readFile(output, 'utf8'), new RegExp(result.inputSha256));
    if (process.platform !== 'win32') assert.equal((await stat(output)).mode & 0o777, 0o600);
    await assert.rejects(main([input, output, '--version', 'v1']), { code: 'EEXIST' });
    await assert.rejects(main([input, input, '--version', 'v1']), /different files/);
    if (process.platform !== 'win32') {
      const link = join(dir, 'link.html'); await symlink(input, link);
      await assert.rejects(main([input, link, '--version', 'v1']), { code: 'EEXIST' });
    }
    assert.equal(await readFile(input, 'utf8'), raw);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('CLI rejects malformed JSON, invalid UTF-8, oversized inputs and bad usage', async () => {
  await assert.rejects(main([]), /Usage/);
  const dir = await mkdtemp(join(tmpdir(), 'calibration-invalid-'));
  try {
    const input = join(dir, 'bad.json'); const output = join(dir, 'never.html');
    for (const data of ['{bad', Buffer.from([0xff]), ' '.repeat(5 * 1024 * 1024 + 1)]) {
      await writeFile(input, data);
      await assert.rejects(main([input, output, '--version', 'v1']));
      await assert.rejects(stat(output), { code: 'ENOENT' });
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
