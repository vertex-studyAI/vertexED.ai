import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeDataImageSrc, safeImageSrc, isBlockedImageHostname } from '../src/lib/safeImageSrc.mjs';
import { validateImages } from '../api/_handlers/paper-generator.js';

test('safeImageSrc allows https and safe data URLs', () => {
  assert.equal(safeImageSrc('https://cdn.example.com/a.png'), 'https://cdn.example.com/a.png');
  assert.match(
    safeDataImageSrc('image/png', 'QUJDRA=='),
    /^data:image\/png;base64,QUJDRA==$/,
  );
});

test('safeImageSrc blocks javascript, data html, and private hosts', () => {
  assert.equal(safeImageSrc('javascript:alert(1)'), undefined);
  assert.equal(safeImageSrc('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), undefined);
  assert.equal(safeImageSrc('data:image/svg+xml;base64,PHN2Zy8+'), undefined);
  assert.equal(safeImageSrc('https://127.0.0.1/secret'), undefined);
  assert.equal(safeImageSrc('https://169.254.169.254/latest/meta-data/'), undefined);
  assert.equal(safeImageSrc('https://192.168.1.1/cam'), undefined);
  assert.equal(safeImageSrc('https://user:pass@example.com/a.png'), undefined);
  assert.equal(safeImageSrc('http://example.com/a.png'), undefined);
});

test('safeImageSrc blocks bracketed IPv6, ULA, link-local, and IPv4-mapped forms', () => {
  assert.equal(safeImageSrc('https://[::1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[fc00::1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[fd12:3456:789a::1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[fe80::1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[::ffff:127.0.0.1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[::ffff:7f00:1]/a.png'), undefined);
  assert.equal(safeImageSrc('https://[::ffff:169.254.169.254]/latest/meta-data/'), undefined);
  assert.equal(safeImageSrc('https://[::ffff:a9fe:a9fe]/latest/meta-data/'), undefined);
  assert.equal(safeImageSrc('https://[2001:db8::1]/a.png'), 'https://[2001:db8::1]/a.png');
});

test('isBlockedImageHostname covers loopback, ULA, and mapped forms', () => {
  assert.equal(isBlockedImageHostname('localhost'), true);
  assert.equal(isBlockedImageHostname('10.0.0.2'), true);
  assert.equal(isBlockedImageHostname('[::ffff:7f00:1]'), true);
  assert.equal(isBlockedImageHostname('::ffff:169.254.169.254'), true);
  assert.equal(isBlockedImageHostname('fc00::1'), true);
  assert.equal(isBlockedImageHostname('cdn.example.com'), false);
  assert.equal(isBlockedImageHostname('2001:db8::1'), false);
});

test('paper validateImages rejects private HTTPS hosts', () => {
  assert.throws(
    () => validateImages([{ name: 'meta', url: 'https://169.254.169.254/latest/meta-data/' }]),
    /host is not allowed/,
  );
  assert.throws(
    () => validateImages([{ name: 'v6meta', url: 'https://[::ffff:169.254.169.254]/latest/meta-data/' }]),
    /host is not allowed/,
  );
  assert.throws(
    () => validateImages([{ name: 'ula', url: 'https://[fc00::1]/diagram.png' }]),
    /host is not allowed/,
  );
  assert.throws(
    () => validateImages([{ name: 'cred', url: 'https://user:pass@cdn.example.com/a.png' }]),
    /credentials/,
  );
  const ok = validateImages([{ name: 'ok', url: 'https://cdn.example.com/diagram.png' }]);
  assert.equal(ok.length, 1);
  assert.equal(ok[0].url, 'https://cdn.example.com/diagram.png');
});
