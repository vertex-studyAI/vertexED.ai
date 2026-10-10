import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { createServerSupabaseClient } from '../api/_lib/serverSupabase.js';
import { ProviderTimeoutError } from '../api/_lib/fetchWithTimeout.js';

async function serve(t, handler) {
  const sockets = new Set();
  const timers = new Set();
  const server = createServer((request, response) => handler(request, response, (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timers.add(timer);
    return timer;
  }));
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    for (const timer of timers) clearTimeout(timer);
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

function transport(timeoutMs = 150) {
  return createServerSupabaseClient('https://fixture.supabase.co', 'fixture-key', {
    timeoutMs,
    clientFactory: (_url, _key, options) => options.global.fetch,
  });
}

for (const status of [200, 401]) {
  test(`server Supabase bounds a partial HTTP ${status} body after headers arrive`, async (t) => {
    const origin = await serve(t, (_request, response, later) => {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.write('{"result":');
      // A finite delayed tail keeps the regression bounded on the old source too.
      later(() => response.end('true}'), 600);
    });
    await assert.rejects(async () => {
      const response = await transport()(origin);
      await response.text();
    }, ProviderTimeoutError);
  });
}

test('server Supabase retains caller cancellation while receiving the body', async (t) => {
  const caller = new AbortController();
  const reason = new Error('Caller cancelled the database read');
  const origin = await serve(t, (_request, response, later) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write('{"result":');
    later(() => caller.abort(reason), 30);
    later(() => response.end('true}'), 600);
  });
  await assert.rejects(async () => {
    const response = await transport(1_000)(origin, { signal: caller.signal });
    await response.text();
  }, (error) => !(error instanceof ProviderTimeoutError) && caller.signal.aborted);
});

test('server Supabase returns complete response metadata and an unread JSON body', async (t) => {
  const origin = await serve(t, (_request, response) => {
    response.writeHead(201, { 'Content-Type': 'application/json', 'X-Request-Id': 'fixture-request' });
    response.end('[{"id":"fixture-member"}]');
  });
  const response = await transport(1_000)(`${origin}/rest/v1/profiles`);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('x-request-id'), 'fixture-request');
  assert.equal(response.url, `${origin}/rest/v1/profiles`);
  assert.equal(response.bodyUsed, false);
  assert.deepEqual(await response.json(), [{ id: 'fixture-member' }]);
});

test('server Supabase preserves a successful bodyless mutation response', async (t) => {
  const origin = await serve(t, (_request, response) => {
    response.writeHead(204);
    response.end();
  });
  const response = await transport(1_000)(origin, { method: 'POST' });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});

test('actual Supabase query consumes the complete response through the bounded transport', async (t) => {
  const origin = await serve(t, (_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('[{"id":"fixture-member"}]');
  });
  const client = createServerSupabaseClient(origin, 'fixture-key', { timeoutMs: 1_000 });
  const result = await client.from('profiles').select('id');
  assert.equal(result.error, null);
  assert.deepEqual(result.data, [{ id: 'fixture-member' }]);
});
