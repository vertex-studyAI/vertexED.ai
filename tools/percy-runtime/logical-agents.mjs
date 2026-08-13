import { writeFileSync } from 'node:fs';

export const LOGICAL_AGENT_COUNT = 16_256;
export const SQUAD_COUNT = 127;
export const SQUAD_SIZE = 128;

if (SQUAD_COUNT * SQUAD_SIZE !== LOGICAL_AGENT_COUNT) {
  throw new Error('logical-agent partition is inconsistent');
}

const pad = (value, width) => String(value).padStart(width, '0');

export function agentId(ordinal) {
  if (!Number.isInteger(ordinal) || ordinal < 0 || ordinal >= LOGICAL_AGENT_COUNT) {
    throw new RangeError(`agent ordinal must be in [0, ${LOGICAL_AGENT_COUNT - 1}]`);
  }
  return `P${pad(ordinal, 5)}`;
}

export function squadIdFromOrdinal(ordinal) {
  if (!Number.isInteger(ordinal) || ordinal < 0 || ordinal >= LOGICAL_AGENT_COUNT) {
    throw new RangeError(`agent ordinal must be in [0, ${LOGICAL_AGENT_COUNT - 1}]`);
  }
  return `S${pad(Math.floor(ordinal / SQUAD_SIZE), 3)}`;
}

export function parseAgentId(id) {
  const match = /^P(\d{5})$/.exec(String(id));
  if (!match) throw new TypeError('agent id must match P00000..P16255');
  const ordinal = Number(match[1]);
  if (ordinal < 0 || ordinal >= LOGICAL_AGENT_COUNT) {
    throw new RangeError('agent id outside P00000..P16255');
  }
  return ordinal;
}

export function logicalAgent(value) {
  const ordinal = typeof value === 'string' ? parseAgentId(value) : value;
  const id = agentId(ordinal);
  const squadIndex = Math.floor(ordinal / SQUAD_SIZE);
  return {
    agent_id: id,
    ordinal,
    squad_id: `S${pad(squadIndex, 3)}`,
    squad_index: squadIndex,
    squad_offset: ordinal % SQUAD_SIZE,
    status: 'IDLE',
  };
}

export function registrySummary() {
  return {
    agent_count: LOGICAL_AGENT_COUNT,
    first_agent: agentId(0),
    last_agent: agentId(LOGICAL_AGENT_COUNT - 1),
    squad_count: SQUAD_COUNT,
    squad_size: SQUAD_SIZE,
    first_squad: squadIdFromOrdinal(0),
    last_squad: squadIdFromOrdinal(LOGICAL_AGENT_COUNT - 1),
    logical_only: true,
  };
}

export function materializeJsonl(path) {
  const rows = Array.from({ length: LOGICAL_AGENT_COUNT }, (_, ordinal) => JSON.stringify(logicalAgent(ordinal)));
  writeFileSync(path, `${rows.join('\n')}\n`, 'utf8');
  return { path, ...registrySummary() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command = 'summary', value] = process.argv.slice(2);
  if (command === 'summary') {
    console.log(JSON.stringify(registrySummary(), null, 2));
  } else if (command === 'agent') {
    if (!value) throw new Error('usage: logical-agents.mjs agent P00000');
    console.log(JSON.stringify(logicalAgent(value), null, 2));
  } else if (command === 'materialize') {
    if (!value) throw new Error('usage: logical-agents.mjs materialize <output.jsonl>');
    console.log(JSON.stringify(materializeJsonl(value), null, 2));
  } else {
    throw new Error(`unknown command: ${command}`);
  }
}
