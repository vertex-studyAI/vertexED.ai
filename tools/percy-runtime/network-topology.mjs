import {
  LOGICAL_AGENT_COUNT,
  SQUAD_COUNT,
  SQUAD_SIZE,
  logicalAgent,
  parseAgentId,
} from './logical-agents.mjs';

export const NETWORK_CELL_COUNT = 16;
export const MAX_ACTIVE_PER_CELL = 4;
export const MAX_NETWORK_ACTIVE = NETWORK_CELL_COUNT * MAX_ACTIVE_PER_CELL;

const pad = (value, width) => String(value).padStart(width, '0');

if (NETWORK_CELL_COUNT < 1 || NETWORK_CELL_COUNT > SQUAD_COUNT) {
  throw new Error('network cell count must fit inside the logical squad registry');
}

export function cellId(cellIndex) {
  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex >= NETWORK_CELL_COUNT) {
    throw new RangeError(`cell index must be in [0, ${NETWORK_CELL_COUNT - 1}]`);
  }
  return `C${pad(cellIndex, 2)}`;
}

export function cellIndexForSquad(squadIndex) {
  if (!Number.isInteger(squadIndex) || squadIndex < 0 || squadIndex >= SQUAD_COUNT) {
    throw new RangeError(`squad index must be in [0, ${SQUAD_COUNT - 1}]`);
  }
  return squadIndex % NETWORK_CELL_COUNT;
}

export function cellForAgent(value) {
  const ordinal = typeof value === 'string' ? parseAgentId(value) : value;
  const agent = logicalAgent(ordinal);
  const cellIndex = cellIndexForSquad(agent.squad_index);
  return {
    ...agent,
    cell_id: cellId(cellIndex),
    cell_index: cellIndex,
    max_active_per_cell: MAX_ACTIVE_PER_CELL,
  };
}

export function cellSummary(cellIndex) {
  const id = cellId(cellIndex);
  const squadIndexes = [];
  for (let squadIndex = cellIndex; squadIndex < SQUAD_COUNT; squadIndex += NETWORK_CELL_COUNT) {
    squadIndexes.push(squadIndex);
  }
  const agentCount = squadIndexes.length * SQUAD_SIZE;
  return {
    cell_id: id,
    cell_index: cellIndex,
    squad_count: squadIndexes.length,
    agent_count: agentCount,
    max_active: MAX_ACTIVE_PER_CELL,
    logical_only: true,
  };
}

export function networkSummary() {
  const cells = Array.from({ length: NETWORK_CELL_COUNT }, (_, index) => cellSummary(index));
  const representedAgents = cells.reduce((sum, cell) => sum + cell.agent_count, 0);
  if (representedAgents !== LOGICAL_AGENT_COUNT) {
    throw new Error(`network partition lost agents: ${representedAgents} != ${LOGICAL_AGENT_COUNT}`);
  }
  return {
    cell_count: NETWORK_CELL_COUNT,
    max_active_per_cell: MAX_ACTIVE_PER_CELL,
    max_network_active: MAX_NETWORK_ACTIVE,
    logical_agent_count: LOGICAL_AGENT_COUNT,
    squad_count: SQUAD_COUNT,
    squad_size: SQUAD_SIZE,
    topology: 'round-robin-squad-sharding',
    logical_only: true,
    cells,
  };
}

export function routeTask(task = {}) {
  const explicitAgent = task.agent_id ?? task.agentId;
  if (explicitAgent != null) {
    const routed = cellForAgent(explicitAgent);
    return { cell_id: routed.cell_id, cell_index: routed.cell_index, reason: 'agent-affinity' };
  }

  const affinity = String(task.project ?? task.project_id ?? task.kind ?? 'default');
  let hash = 2166136261;
  for (const byte of Buffer.from(affinity, 'utf8')) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const cellIndex = hash % NETWORK_CELL_COUNT;
  return { cell_id: cellId(cellIndex), cell_index: cellIndex, reason: 'stable-affinity-hash' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command = 'summary', value] = process.argv.slice(2);
  if (command === 'summary') {
    console.log(JSON.stringify(networkSummary(), null, 2));
  } else if (command === 'agent') {
    if (!value) throw new Error('usage: network-topology.mjs agent P00000');
    console.log(JSON.stringify(cellForAgent(value), null, 2));
  } else {
    throw new Error(`unknown command: ${command}`);
  }
}
