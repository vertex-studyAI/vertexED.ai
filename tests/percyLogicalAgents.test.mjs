import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOGICAL_AGENT_COUNT,
  SQUAD_COUNT,
  SQUAD_SIZE,
  agentId,
  logicalAgent,
  parseAgentId,
  registrySummary,
  squadIdFromOrdinal,
} from '../tools/percy-runtime/logical-agents.mjs';

test('registry is exactly 16,256 logical agents in 127 squads of 128', () => {
  assert.equal(LOGICAL_AGENT_COUNT, 16256);
  assert.equal(SQUAD_COUNT, 127);
  assert.equal(SQUAD_SIZE, 128);
  assert.equal(SQUAD_COUNT * SQUAD_SIZE, LOGICAL_AGENT_COUNT);
  assert.deepEqual(registrySummary(), {
    agent_count: 16256,
    first_agent: 'P00000',
    last_agent: 'P16255',
    squad_count: 127,
    squad_size: 128,
    first_squad: 'S000',
    last_squad: 'S126',
    logical_only: true,
  });
});

test('agent and squad boundaries are deterministic', () => {
  assert.equal(agentId(0), 'P00000');
  assert.equal(agentId(127), 'P00127');
  assert.equal(agentId(128), 'P00128');
  assert.equal(agentId(16255), 'P16255');
  assert.equal(squadIdFromOrdinal(0), 'S000');
  assert.equal(squadIdFromOrdinal(127), 'S000');
  assert.equal(squadIdFromOrdinal(128), 'S001');
  assert.equal(squadIdFromOrdinal(16255), 'S126');
});

test('all logical agent IDs are unique and every squad contains exactly 128 identities', () => {
  const ids = new Set();
  const counts = new Map();
  for (let ordinal = 0; ordinal < LOGICAL_AGENT_COUNT; ordinal += 1) {
    const agent = logicalAgent(ordinal);
    ids.add(agent.agent_id);
    counts.set(agent.squad_id, (counts.get(agent.squad_id) ?? 0) + 1);
    assert.equal(parseAgentId(agent.agent_id), ordinal);
    assert.equal(agent.status, 'IDLE');
  }
  assert.equal(ids.size, LOGICAL_AGENT_COUNT);
  assert.equal(counts.size, SQUAD_COUNT);
  for (const count of counts.values()) assert.equal(count, SQUAD_SIZE);
});

test('invalid identities fail closed', () => {
  for (const invalid of [-1, 16256, 1.2]) assert.throws(() => agentId(invalid));
  for (const invalid of ['P16256', 'P99999', 'P1234', 'A00000', '']) assert.throws(() => parseAgentId(invalid));
});
