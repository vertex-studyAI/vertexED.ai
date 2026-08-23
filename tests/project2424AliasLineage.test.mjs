import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lineageUrl = new URL('../portfolio/project2424/RECOVERED_ALIAS_LINEAGE_20260823.json', import.meta.url);
const lineage = JSON.parse(await readFile(lineageUrl, 'utf8'));

test('P2424 and T2424 namespaces cannot be suffix-collapsed', () => {
  assert.equal(lineage.global_namespace_boundary.T2424_identity_count, 2424);
  assert.equal(lineage.global_namespace_boundary.P2424_identity_count, 2424);
  assert.equal(lineage.global_namespace_boundary.same_suffix_identity_inference_allowed, false);
  assert.equal(lineage.global_namespace_boundary.same_number_normalized_name_matches, '0/2424 in retained forensic audit');
});

test('PST and NPMS aliases are corroborated without inventing source migration', () => {
  const pst = lineage.corroborated_aliases.find((row) => row.canonical_id === 'T2424-0016');
  const npms = lineage.corroborated_aliases.find((row) => row.canonical_id === 'T2424-0019');

  assert.ok(pst);
  assert.ok(npms);
  assert.deepEqual(pst.historical_aliases, ['MODEL-PST', 'MODEL-008', 'PST']);
  assert.deepEqual(npms.historical_aliases, ['MODEL-NPMS', 'MODEL-007', 'NPMS']);
  assert.equal(pst.source_migration_complete, false);
  assert.equal(npms.source_migration_complete, false);
  assert.equal(pst.status, 'ALIAS_CORROBORATED_SOURCE_MIGRATION_BLOCKED');
  assert.equal(npms.status, 'ALIAS_CORROBORATED_SOURCE_MIGRATION_BLOCKED');
});

test('known P-series relationships remain unresolved unless explicitly crosswalked', () => {
  assert.ok(lineage.known_explicit_P_namespace_relationships.length >= 5);
  for (const row of lineage.known_explicit_P_namespace_relationships) {
    assert.ok(row.p_id.startsWith('P2424-'));
    assert.match(row.relationship_to_T_namespace, /UNRESOLVED|CONFLICT_GROUP/);
  }
});
