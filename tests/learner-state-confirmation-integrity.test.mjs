import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

import { partitionLearnerStateSyncResults } from '../src/lib/learnerStateSyncResult.mjs';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const revision = 'state:1791720000000:aaaaaaaa-bbbb-4000-8000-cccccccccccc';
const winnerRevision = 'state:1791720001000:dddddddd-eeee-4000-8000-ffffffffffff';
const item = {
  stateType: 'retry', stateKey: 'topic-a', payload: { id: 'topic-a', status: 'scheduled' },
  clientRevision: revision, clientUpdatedAt: '2026-10-11T12:00:00.000Z',
};
const acknowledgement = (value = item, overrides = {}) => ({
  stateType: value.stateType, stateKey: value.stateKey,
  requestedRevision: value.clientRevision, currentRevision: value.clientRevision,
  applied: true, serverUpdatedAt: '2026-10-11T12:01:00.000Z', ...overrides,
});

const malformedResults = [
  ['wrong state type', acknowledgement(item, { stateType: 'weakness' })],
  ['wrong state key', acknowledgement(item, { stateKey: 'topic-b' })],
  ['missing state type', acknowledgement(item, { stateType: undefined })],
  ['missing state key', acknowledgement(item, { stateKey: undefined })],
  ['missing current revision', acknowledgement(item, { currentRevision: undefined })],
  ['different applied revision', acknowledgement(item, { currentRevision: winnerRevision })],
  ['conflict without a stored revision', acknowledgement(item, { applied: false, currentRevision: null })],
  ['conflict with the requested revision', acknowledgement(item, { applied: false })],
  ['invalid winning revision', acknowledgement(item, { applied: false, currentRevision: 'unknown' })],
];

for (const [name, result] of malformedResults) {
  test(`learner sync keeps ${name} unresolved`, () => {
    assert.deepEqual(partitionLearnerStateSyncResults([item], [result]), {
      applied: [], rejected: [], unresolved: [item],
    });
  });
}

test('duplicate confirmations stay unresolved regardless of response order', () => {
  const applied = acknowledgement();
  const rejected = acknowledgement(item, { applied: false, currentRevision: winnerRevision });
  for (const results of [[applied, rejected], [rejected, applied], [applied, applied]]) {
    assert.deepEqual(partitionLearnerStateSyncResults([item], results), {
      applied: [], rejected: [], unresolved: [item],
    });
  }
});

test('each confirmation belongs to the complete item identity even when revisions coincide', () => {
  const other = { ...item, stateKey: 'topic-b', payload: { id: 'topic-b' } };
  assert.deepEqual(partitionLearnerStateSyncResults([item, other], [acknowledgement()]), {
    applied: [item], rejected: [], unresolved: [other],
  });
  assert.deepEqual(partitionLearnerStateSyncResults([item, other], [
    acknowledgement(other, { applied: false, currentRevision: winnerRevision }), acknowledgement(),
  ]), { applied: [item], rejected: [other], unresolved: [] });
});

// Exercise the actual sync orchestration and local outbox. Only authentication,
// HTTP and the IndexedDB boundary are fixtures; partitioning/removal stay real.
const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const boundary = encode(`
  export const getAccessToken = async () => 'synthetic-access-token';
  export const authFetchWithAccessToken = (...args) => globalThis.__learnerConfirmation.request(...args);
  export const listDurableOutboxRecords = async (channel, scope) =>
    [...globalThis.__learnerConfirmation.durable.values()].filter(row => row.channel === channel && row.scope === scope);
  export const putDurableOutboxRecord = async record => {
    globalThis.__learnerConfirmation.durable.set(record.logicalKey, record); return true;
  };
  export const deleteDurableOutboxRecord = async (channel, scope, key, revision) => {
    const current = globalThis.__learnerConfirmation.durable.get(key);
    if (current?.channel === channel && current?.scope === scope && current?.revision === revision)
      globalThis.__learnerConfirmation.durable.delete(key);
    return true;
  };
`);
let code = ts.transpileModule(fs.readFileSync('src/lib/learnerStateSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])(?:@\/lib\/|\.\/)([^'"]+)\1/g, (_, quote, file) =>
  JSON.stringify(['apiAuth', 'durableOutbox'].includes(file)
    ? boundary : pathToFileURL(`${process.cwd()}/src/lib/${file}`).href));
const { syncLearnerState } = await import(encode(code));

async function withOutbox(values, response, verify) {
  const scope = 'confirmation-fixture';
  const key = userContentStorageKeys(scope).learnerStateOutbox;
  const local = new Map([[key, JSON.stringify(values)]]);
  const durableRecord = value => ({
    channel: 'learner-state', scope, logicalKey: `${value.stateType}:${value.stateKey}`,
    revision: value.clientRevision, payload: value, updatedAt: value.clientUpdatedAt,
  });
  const durable = new Map(values.map(value => {
    const record = durableRecord(value); return [record.logicalKey, record];
  }));
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: name => local.get(name) ?? null,
      setItem: (name, value) => local.set(name, value),
    },
    dispatchEvent() {},
  };
  setUserContentStorageScope(scope);
  globalThis.__learnerConfirmation = {
    durable,
    request: async (url, token, options) => {
      assert.equal(url, '/api/learner-state');
      assert.equal(token, 'synthetic-access-token');
      assert.deepEqual(JSON.parse(options.body).items, values);
      return response({ local, key, durable, durableRecord });
    },
  };
  try {
    await verify(await syncLearnerState(), JSON.parse(local.get(key)), [...durable.values()]);
  } finally {
    setUserContentStorageScope(null);
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    delete globalThis.__learnerConfirmation;
  }
}

const jsonResponse = (results, status = 200) => new Response(JSON.stringify({
  contractVersion: 'vertexed.learner-state.v1', results,
}), { status });

test('actual sync preserves both recovery copies after a wrong-record acknowledgement', async () => {
  await withOutbox([item], () => jsonResponse([acknowledgement(item, { stateKey: 'other-topic' })]),
    (result, local, durable) => {
      assert.deepEqual(result, { synced: 0, remaining: 1 });
      assert.deepEqual(local, [item]);
      assert.deepEqual(durable.map(row => row.payload), [item]);
    });
});

test('actual sync clears only the confirmed logical item when two pending revisions coincide', async () => {
  const other = { ...item, stateKey: 'topic-b', payload: { id: 'topic-b' } };
  await withOutbox([item, other], () => jsonResponse([acknowledgement()]), (result, local, durable) => {
    assert.deepEqual(result, { synced: 1, remaining: 1 });
    assert.deepEqual(local, [other]);
    assert.deepEqual(durable.map(row => row.payload), [other]);
  });
});

test('actual sync preserves both recovery copies for duplicate contradictory confirmations', async () => {
  await withOutbox([item], () => jsonResponse([
    acknowledgement(), acknowledgement(item, { applied: false, currentRevision: winnerRevision }),
  ]), (result, local, durable) => {
    assert.deepEqual(result, { synced: 0, remaining: 1 });
    assert.deepEqual(local, [item]);
    assert.deepEqual(durable.map(row => row.payload), [item]);
  });
});

for (const applied of [true, false]) {
  test(`actual sync handles a valid ${applied ? 'applied' : 'conflict'} acknowledgement`, async () => {
    await withOutbox([item], () => jsonResponse([acknowledgement(item, {
      applied, currentRevision: applied ? revision : winnerRevision,
    })], applied ? 200 : 409), (result, local, durable) => {
      assert.deepEqual(result, { synced: applied ? 1 : 0, remaining: 0 });
      assert.deepEqual(local, []);
      assert.deepEqual(durable, []);
    });
  });
}

test('actual sync retains a newer edit queued while confirmation is in flight', async () => {
  const newer = { ...item, clientRevision: winnerRevision, clientUpdatedAt: '2026-10-11T12:00:01.000Z' };
  await withOutbox([item], ({ local, key, durable, durableRecord }) => {
    local.set(key, JSON.stringify([newer]));
    const record = durableRecord(newer);
    durable.set(record.logicalKey, record);
    return jsonResponse([acknowledgement()]);
  }, (result, local, durable) => {
    assert.deepEqual(result, { synced: 1, remaining: 1 });
    assert.deepEqual(local, [newer]);
    assert.deepEqual(durable.map(row => row.payload), [newer]);
  });
});
