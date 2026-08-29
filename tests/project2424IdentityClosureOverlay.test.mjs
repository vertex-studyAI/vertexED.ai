import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const projectDir = path.join(root, 'portfolio/project2424');
const closurePath = path.join(projectDir, 'IDENTITY_PROVENANCE_CLOSURE_PASS_20260829.json');
const overlayPath = path.join(projectDir, 'FIRST_100_IDENTITY_CLOSURE_OVERRIDES_20260829.json');
const resolverPath = path.join(projectDir, 'tools/resolve-first-100.mjs');

function resolvedRows() {
  return execFileSync(process.execPath, [resolverPath], { encoding: 'utf8' })
    .split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

function row(id) {
  const value = resolvedRows().find((candidate) => candidate.id === id);
  assert.ok(value, `missing resolved First-100 row ${id}`);
  return value;
}

test('identity closure overlay preserves fail-closed counting rules', () => {
  const closure = JSON.parse(fs.readFileSync(closurePath, 'utf8'));
  const overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));

  assert.equal(closure.integrity_rules.numeric_suffix_identity_inference_allowed, false);
  assert.equal(closure.integrity_rules.unresolved_mapping_increases_implementation_count, false);
  assert.equal(closure.integrity_rules.unresolved_mapping_increases_completion_count, false);
  assert.equal(overlay.integrity_rules.numeric_suffix_identity_inference_allowed, false);
  assert.equal(overlay.integrity_rules.unresolved_mapping_increases_implementation_count, false);
  assert.equal(overlay.integrity_rules.unresolved_mapping_increases_completion_count, false);
});

test('all 100 First-100 rows resolve exactly once to the sealed disposition counts', () => {
  const closure = JSON.parse(fs.readFileSync(closurePath, 'utf8'));
  const rows = resolvedRows();
  const ids = new Set(rows.map((value) => value.id));
  const counts = Object.fromEntries(
    Object.keys(closure.first_100_accounting.classification_counts).map((key) => [key, 0]),
  );

  assert.equal(rows.length, 100);
  assert.equal(ids.size, 100);
  for (const value of rows) {
    assert.ok(Object.hasOwn(counts, value.disposition), `unexpected disposition ${value.disposition}`);
    counts[value.disposition] += 1;
  }

  assert.deepEqual(counts, closure.first_100_accounting.classification_counts);
  assert.equal(closure.first_100_accounting.registry_rows, 100);
  assert.equal(closure.first_100_accounting.classified_rows, 100);
});

test('NPMS controlled source lineage resolves to frozen negative rather than stale source-blocked state', () => {
  const npms = row('T2424-0019');
  assert.equal(npms.disposition, 'FREEZE_NEGATIVE');
  assert.equal(npms.reason_code, 'CONTROLLED_SOURCE_REPRODUCED_MECHANISM_CONFOUNDED');
  assert.equal(npms.mapping_status, 'CONTROLLED_SOURCE_LINEAGE_CLOSED');
  assert.equal(npms.identity_closure_override, true);
  assert.match(npms.note, /10e4a5641ab5345e2c3356275ea668c1e822f0e0/);
  assert.match(npms.note, /PARAMETER_CONFOUNDED_OR_NON_UNIQUE/);
  assert.match(npms.note, /PROTOCOL_BLOCKED/);
});

test('PST remains terminal source-blocked until exact source bytes are recovered', () => {
  const pst = row('T2424-0016');
  assert.equal(pst.disposition, 'BLOCKED');
  assert.equal(pst.reason_code, 'SOURCE_BLOCKED');
  assert.equal(pst.mapping_status, 'ALIAS_CORROBORATED_SOURCE_MIGRATION_BLOCKED');
  assert.match(pst.note, /exact source, checkpoint and raw-evidence bytes are not recovered/);
});

test('NeuroCAD scientific lineage is counted once and unresolved aliases stay blocked', () => {
  const neurocad = row('T2424-0007');
  const nlpToCad = row('T2424-0037');

  assert.equal(neurocad.disposition, 'BLOCKED');
  assert.equal(neurocad.mapping_status, 'UNRESOLVED');
  assert.match(neurocad.note, /zero implementation\/completion credit/i);

  assert.equal(nlpToCad.disposition, 'FREEZE_NEGATIVE');
  assert.equal(nlpToCad.reason_code, 'TYPED_PARSER_CAUSAL_MECHANISM_FALSIFIED');
  assert.equal(nlpToCad.mapping_status, 'CURRENT_EVIDENCE_BEARING_NEUROCAD_SCIENTIFIC_LINEAGE');
  assert.match(nlpToCad.note, /VALIDATION_DOMINANT/);
  assert.match(nlpToCad.note, /once at T2424-0037/);
});

test('all explicit unresolved alias candidates remain blocked', () => {
  for (const id of ['T2424-0005', 'T2424-0007', 'T2424-0017', 'T2424-0018', 'T2424-0033']) {
    const value = row(id);
    assert.equal(value.disposition, 'BLOCKED', `${id} must remain blocked`);
    assert.equal(value.mapping_status, 'UNRESOLVED', `${id} must remain explicitly unresolved`);
    assert.equal(value.identity_closure_override, true);
  }
});
