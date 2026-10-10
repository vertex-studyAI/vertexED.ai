import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';
import test from 'node:test';
import { ensureJsonBody } from '../api/_lib/routes.js';

function requestStream({ method = 'POST', type = 'application/json' } = {}) {
  const request = new PassThrough();
  request.method = method;
  request.headers = { 'content-type': type };
  return request;
}

async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('reader did not settle')), 250); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

test('interrupted JSON requests reject and release retained body listeners', async (t) => {
  for (const event of ['aborted', 'close']) {
    await t.test(event, async () => {
      const request = requestStream();
      const pending = ensureJsonBody(request);
      request.write('{"draft":"partial');
      request.emit(event);
      try {
        await assert.rejects(() => bounded(pending), /BODY_INTERRUPTED/);
        assert.equal(request.body, undefined);
        assert.equal(request.listenerCount('data'), 0);
        assert.equal(request.listenerCount('end'), 0);
      } finally {
        request.destroy();
      }
    });
  }
});

test('already destroyed and already consumed JSON streams cannot hang', async (t) => {
  await t.test('destroyed', async () => {
    const request = requestStream();
    request.destroy();
    await new Promise((resolve) => request.once('close', resolve));
    await assert.rejects(() => bounded(ensureJsonBody(request)), /BODY_INTERRUPTED/);
    await new Promise(setImmediate);
    assert.equal(request.listenerCount('error'), 0);
    assert.equal(request.listenerCount('close'), 0);
  });
  await t.test('consumed', async () => {
    const request = Readable.from(['{}'], { autoDestroy: false });
    request.method = 'POST';
    request.headers = { 'content-type': 'application/json' };
    request.resume();
    await new Promise((resolve) => request.once('end', resolve));
    try {
      await assert.rejects(() => bounded(ensureJsonBody(request)), /BODY_INTERRUPTED/);
    } finally {
      const closed = new Promise((resolve) => request.once('close', resolve));
      request.destroy();
      await closed;
      assert.equal(request.listenerCount('error'), 0);
      assert.equal(request.listenerCount('close'), 0);
    }
  });
});

test('JSON overflow keeps the established 413 marker and releases data listeners', async () => {
  const request = requestStream();
  const pending = ensureJsonBody(request, 4);
  request.write(Buffer.from('{"large":true}'));
  try {
    await bounded(pending);
    assert.equal(request._bodyTooLarge, true);
    assert.equal(request.body, null);
    assert.equal(request.listenerCount('data'), 0);
    assert.equal(request.listenerCount('end'), 0);
  } finally {
    request.destroy();
  }
});

test('decoded UTF-8 stream chunks preserve JSON and count bytes', async (t) => {
  const payload = JSON.stringify({ text: 'é🎓' });
  const bytes = Buffer.byteLength(payload);
  for (const limit of [bytes - 1, bytes]) {
    await t.test(String(limit), async () => {
      const request = requestStream();
      request.setEncoding('utf8');
      const pending = ensureJsonBody(request, limit);
      request.end(payload);
      await pending;
      if (limit < bytes) {
        assert.equal(request._bodyTooLarge, true);
        assert.equal(request.body, null);
      } else {
        assert.equal(request._bodyTooLarge, undefined);
        assert.deepEqual(request.body, { text: 'é🎓' });
      }
    });
  }
});

test('stream errors preserve their original identity', async () => {
  const request = requestStream();
  const pending = ensureJsonBody(request);
  const error = new Error('original transport failure');
  request.destroy(error);
  await assert.rejects(pending, (caught) => caught === error);
});

test('preparsed, non-body and multipart requests retain their existing bypasses', async () => {
  const parsed = { method: 'POST', headers: {}, body: { keep: true } };
  await ensureJsonBody(parsed);
  assert.deepEqual(parsed.body, { keep: true });
  await ensureJsonBody({ method: 'GET', headers: {} });
  await ensureJsonBody({ method: 'POST', headers: { 'content-type': 'multipart/form-data; boundary=x' } });
});

test('late errors after JSON abort or overflow cannot crash the process', () => {
  const source = `
    import assert from 'node:assert/strict';
    import { PassThrough } from 'node:stream';
    import { ensureJsonBody } from './api/_lib/routes.js';
    for (const mode of ['abort', 'overflow']) {
      const request = new PassThrough();
      request.method = 'POST';
      request.headers = { 'content-type': 'application/json' };
      const pending = ensureJsonBody(request, 20);
      request.write(mode === 'abort' ? '{' : 'x'.repeat(21));
      if (mode === 'abort') request.emit('aborted');
      const closed = new Promise((resolve) => request.once('close', resolve));
      request.destroy(new Error('late transport reset'));
      if (mode === 'abort') await assert.rejects(pending, /BODY_INTERRUPTED/);
      else { await pending; assert.equal(request._bodyTooLarge, true); }
      await closed;
      for (const name of ['data', 'end', 'error', 'aborted', 'close']) {
        assert.equal(request.listenerCount(name), 0, mode + ': ' + name);
      }
    }
  `;
  const result = spawnSync(process.execPath, [...process.execArgv, '--input-type=module', '-e', source], {
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('an error queued before JSON parsing is consumed and cleaned up', () => {
  const source = `
    import assert from 'node:assert/strict';
    import { PassThrough } from 'node:stream';
    import { ensureJsonBody } from './api/_lib/routes.js';
    const request = new PassThrough();
    request.method = 'POST';
    request.headers = { 'content-type': 'application/json' };
    const closed = new Promise((resolve) => request.once('close', resolve));
    request.destroy(new Error('queued before parser'));
    await assert.rejects(ensureJsonBody(request), /BODY_INTERRUPTED/);
    await closed;
    await new Promise(setImmediate);
    for (const name of ['data', 'end', 'error', 'aborted', 'close']) {
      assert.equal(request.listenerCount(name), 0, name);
    }
  `;
  const result = spawnSync(process.execPath, [...process.execArgv, '--input-type=module', '-e', source], {
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('a completed non-auto-destroy JSON stream keeps only a transport guard until close', async () => {
  const request = Readable.from([Buffer.from('{"draft":"saved"}')], { autoDestroy: false });
  request.method = 'POST';
  request.headers = { 'content-type': 'application/json' };
  await ensureJsonBody(request);
  assert.deepEqual(request.body, { draft: 'saved' });
  assert.equal(request.listenerCount('data'), 0);
  assert.equal(request.listenerCount('end'), 0);
  const closed = new Promise((resolve) => request.once('close', resolve));
  request.destroy(new Error('transport reset after body completion'));
  await closed;
  assert.equal(request.listenerCount('error'), 0);
  assert.equal(request.listenerCount('close'), 0);
});
