import test from 'node:test';
import assert from 'node:assert/strict';
import { LOGICAL_AGENT_COUNT, SQUAD_COUNT } from '../tools/percy-runtime/logical-agents.mjs';
import {
  MAX_ACTIVE_PER_CELL,
  MAX_NETWORK_ACTIVE,
  NETWORK_CELL_COUNT,
  cellForAgent,
  cellId,
  cellIndexForSquad,
  networkSummary,
  routeTask,
} from '../tools/percy-runtime/network-topology.mjs';

test('network fabric exposes 16 bounded cells and 64 aggregate active slots', () => {
  assert.equal(NETWORK_CELL_COUNT, 16);
  assert.equal(MAX_ACTIVE_PER_CELL, 4);
  assert.equal(MAX_NETWORK_ACTIVE, 64);
  const summary = networkSummary();
  assert.equal(summary.cell_count, 16);
  assert.equal(summary.max_network_active, 64);
  assert.equal(summary.logical_agent_count, LOGICAL_AGENT_COUNT);
  assert.equal(summary.cells.reduce((sum, cell) => sum + cell.agent_count, 0), LOGICAL_AGENT_COUNT);
});

test('every squad deterministically maps to exactly one valid cell', () => {
  const seen = new Set();
  for (let squadIndex = 0; squadIndex < SQUAD_COUNT; squadIndex += 1) {
    const cellIndex = cellIndexForSquad(squadIndex);
    assert.ok(cellIndex >= 0 && cellIndex < NETWORK_CELL_COUNT);
    seen.add(`${squadIndex}:${cellIndex}`);
  }
  assert.equal(seen.size, SQUAD_COUNT);
  assert.equal(cellId(0), 'C00');
  assert.equal(cellId(15), 'C15');
});

test('agent affinity is stable across registry boundaries', () => {
  const first = cellForAgent('P00000');
  const squadBoundary = cellForAgent('P00128');
  const last = cellForAgent('P16255');
  assert.equal(first.cell_id, 'C00');
  assert.equal(squadBoundary.cell_id, 'C01');
  assert.equal(last.cell_id, 'C14');
  assert.equal(routeTask({ agent_id: 'P00128' }).cell_id, 'C01');
});

test('project routing is stable without claiming physical execution', () => {
  const a = routeTask({ project: 'vertexed' });
  const b = routeTask({ project: 'vertexed' });
  const c = routeTask({ project: 'financemeta' });
  assert.deepEqual(a, b);
  assert.ok(a.cell_index >= 0 && a.cell_index < NETWORK_CELL_COUNT);
  assert.ok(c.cell_index >= 0 && c.cell_index < NETWORK_CELL_COUNT);
});

test('invalid cell and squad indexes fail closed', () => {
  for (const invalid of [-1, 16, 1.2]) assert.throws(() => cellId(invalid));
  for (const invalid of [-1, SQUAD_COUNT, 1.2]) assert.throws(() => cellIndexForSquad(invalid));
});
