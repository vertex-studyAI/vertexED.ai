import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';
import test from 'node:test';
import { MAX_AUDIO_BYTES } from '../api/_lib/auth.js';
import { parseTranscriptionRequest, TranscriptionInputError } from '../api/_lib/transcriptionInput.js';

const headers = { 'content-type': 'application/json' };
const audioBody = (bytes = Buffer.from('recording')) => ({
  audioBase64: bytes.toString('base64'),
  filename: 'lecture.webm',
  mimeType: 'audio/webm',
});
const inputError = (status) => (error) => error instanceof TranscriptionInputError && error.status === status;

async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('upload reader did not settle')), 250); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

test('buffered multipart bodies enforce their wire limit before parsing', async (t) => {
  const boundary = 'vertexed-upload-boundary';
  const raw = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="lecture.webm"\r\nContent-Type: audio/webm\r\n\r\naudio\r\n--${boundary}--\r\n${'x'.repeat(MAX_AUDIO_BYTES + 512 * 1024)}`);
  for (const [name, body] of [['Buffer', raw], ['Uint8Array', new Uint8Array(raw)], ['string', raw.toString()]]) {
    await t.test(name, async () => {
      await assert.rejects(() => parseTranscriptionRequest({
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        body,
      }), inputError(413));
    });
  }
});

test('JSON wire allowance includes base64 expansion at the advertised audio limit', async () => {
  const bytes = Buffer.alloc(MAX_AUDIO_BYTES, 0x61);
  const raw = JSON.stringify(audioBody(bytes));
  const request = Readable.from([Buffer.from(raw)]);
  request.headers = { ...headers, 'content-length': String(Buffer.byteLength(raw)) };
  const parsed = await parseTranscriptionRequest(request);
  assert.equal(parsed.audioBuffer.length, MAX_AUDIO_BYTES);
  assert.deepEqual(parsed.audioBuffer, bytes);
});

test('preparsed JSON cannot bypass the decoded audio limit', async () => {
  await assert.rejects(() => parseTranscriptionRequest({
    headers,
    body: audioBody(Buffer.alloc(MAX_AUDIO_BYTES + 1)),
  }), inputError(413));
});

test('raw Uint8Array JSON is parsed like Buffer and string JSON', async () => {
  const raw = new TextEncoder().encode(JSON.stringify(audioBody()));
  const parsed = await parseTranscriptionRequest({ headers, body: raw });
  assert.deepEqual(parsed.audioBuffer, Buffer.from('recording'));
});

test('JSON null, arrays and scalars are classified as client input errors', async (t) => {
  for (const value of [null, [], true, 7, 'recording']) {
    await t.test(JSON.stringify(value), async () => {
      await assert.rejects(() => parseTranscriptionRequest({ headers, body: JSON.stringify(value) }), inputError(400));
    });
  }
});

test('upload abort and premature close settle and release body listeners', async (t) => {
  for (const event of ['aborted', 'close']) {
    await t.test(event, async () => {
      const request = new PassThrough();
      request.headers = headers;
      const pending = parseTranscriptionRequest(request);
      request.write('{"audioBase64":"');
      request.emit(event);
      try {
        await assert.rejects(() => bounded(pending), inputError(400));
        for (const name of ['data', 'end', 'aborted']) {
          assert.equal(request.listenerCount(name), 0, `${name} listener must be released`);
        }
        assert.equal(request.listenerCount('error'), event === 'aborted' ? 1 : 0);
      } finally {
        request.destroy();
      }
    });
  }
});

test('already destroyed uploads fail promptly', async () => {
  const request = new PassThrough();
  request.headers = headers;
  request.destroy();
  await new Promise((resolve) => request.once('close', resolve));
  await assert.rejects(() => bounded(parseTranscriptionRequest(request)), inputError(400));
});

test('stream overflow releases retained data listeners without requiring end', async () => {
  const request = new PassThrough();
  request.headers = { 'content-type': 'multipart/form-data; boundary=bounded' };
  const pending = parseTranscriptionRequest(request);
  request.write(Buffer.alloc(MAX_AUDIO_BYTES + 512 * 1024 + 1));
  try {
    await assert.rejects(() => bounded(pending), inputError(413));
    assert.equal(request.listenerCount('data'), 0);
    assert.equal(request.listenerCount('end'), 0);
  } finally {
    request.destroy();
  }
});

test('transport errors following abort or overflow are handled until close', () => {
  const source = `
    import assert from 'node:assert/strict';
    import { PassThrough } from 'node:stream';
    import { MAX_AUDIO_BYTES } from './api/_lib/auth.js';
    import { parseTranscriptionRequest } from './api/_lib/transcriptionInput.js';
    for (const mode of ['abort', 'overflow']) {
      const request = new PassThrough();
      request.headers = { 'content-type': 'multipart/form-data; boundary=bounded' };
      const pending = parseTranscriptionRequest(request);
      if (mode === 'abort') {
        request.write('partial upload');
        request.emit('aborted');
      } else {
        request.write(Buffer.alloc(MAX_AUDIO_BYTES + 512 * 1024 + 1));
      }
      const closed = new Promise((resolve) => request.once('close', resolve));
      request.destroy(new Error('transport reset after ' + mode));
      await assert.rejects(pending, (error) => error.status === (mode === 'abort' ? 400 : 413));
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
