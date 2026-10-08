import test from 'node:test';
import assert from 'node:assert/strict';
import https from 'node:https';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = process.env.TRANSPORT_TEST_SCRIPT || fileURLToPath(new URL('../scripts/diagnose-production-transport.mjs', import.meta.url));
const fixtureUrl = new URL('./fixtures/transport-localhost/', import.meta.url);
const certPath = fileURLToPath(new URL('cert.pem', fixtureUrl));
const key = await readFile(new URL('key.pem', fixtureUrl));
const cert = await readFile(certPath);

// Only DNS evidence is stubbed. TCP, authenticated TLS, and HTTP streaming use
// real loopback sockets. No public DNS or production endpoint is contacted.
const preload = `
  import dns from 'node:dns/promises';
  dns.resolveCname = async () => { throw Object.assign(new Error('fixture has no CNAME'), { code: 'ENODATA' }); };
  dns.lookup = async () => [{ address: '127.0.0.1', family: 4 }];
  await import(process.env.TRANSPORT_TEST_SCRIPT_URL);
`;

async function probe(t, handler, timeout = '1000', trustFixture = true) {
  const sockets = new Set();
  const server = https.createServer({ key, cert }, handler);
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });

  const { port } = server.address();
  const child = spawn(process.execPath, ['--input-type=module', '--eval', preload], {
    env: {
      ...process.env,
      NODE_EXTRA_CA_CERTS: trustFixture ? certPath : '',
      TRANSPORT_DIAGNOSTIC_URL: `https://127.0.0.1:${port}`,
      TRANSPORT_DIAGNOSTIC_TIMEOUT_MS: timeout,
      TRANSPORT_DIAGNOSTIC_OUTPUT: '',
      TRANSPORT_TEST_SCRIPT_URL: new URL(`file://${scriptPath}`).href,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  let killedForHang = false;
  child.stdout.setEncoding('utf8').on('data', (data) => { stdout += data; });
  child.stderr.setEncoding('utf8').on('data', (data) => { stderr += data; });
  const watchdog = setTimeout(() => {
    killedForHang = true;
    child.kill('SIGKILL');
  }, 10000);
  const exit = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  }).finally(() => clearTimeout(watchdog));
  return { ...exit, stdout, stderr, killedForHang };
}

function completeReport(result) {
  assert.equal(result.killedForHang, false, 'diagnostic exceeded the external 10 second fixture guard');
  assert.equal(result.code, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.timeoutMs, 1000);
  assert.equal(report.layers.dns.ok, true);
  assert.equal(report.layers.tcp.ok, true);
  assert.equal(report.layers.tls.ok, true, report.layers.tls.error);
  assert.equal(report.layers.tls.authorized, true);
  assert.equal(report.layers.perAddress.length, 1);
  return [report.layers.https, report.layers.perAddress[0].https];
}

for (const status of [200, 503]) {
  test(`completed HTTP ${status} retains transport reachability and headers`, async (t) => {
    const result = await probe(t, (_request, response) => {
      response.writeHead(status, {
        'x-vertexed-revision': 'a'.repeat(40),
        'x-vertex-api': 'fixture',
      });
      response.end('complete response');
    });
    for (const httpsResult of completeReport(result)) {
      assert.equal(httpsResult.ok, true);
      assert.equal(httpsResult.status, status);
      assert.equal(httpsResult.headers.vertexRevision, 'a'.repeat(40));
      assert.equal(httpsResult.headers.vertexApi, 'fixture');
    }
  });
}

test('continuous body traffic cannot extend the absolute HTTPS deadline', async (t) => {
  const result = await probe(t, (_request, response) => {
    response.writeHead(200);
    response.write('first byte');
    const drip = setInterval(() => response.write('.'), 15);
    response.once('close', () => clearInterval(drip));
  });
  for (const httpsResult of completeReport(result)) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /deadline.*1000ms/i);
  }
});

test('truncated response preserves structured evidence for all addresses', async (t) => {
  const result = await probe(t, (_request, response) => {
    response.writeHead(200, { 'content-length': '100' });
    response.write('short');
    setTimeout(() => response.destroy(), 20);
  });
  for (const httpsResult of completeReport(result)) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /abort|clos|reset/i);
  }
});

test('body that stops without ending cannot discard the diagnostic report', async (t) => {
  const result = await probe(t, (_request, response) => {
    response.writeHead(200);
    response.write('partial');
  });
  for (const httpsResult of completeReport(result)) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /deadline|timed out/i);
  }
});

test('no response headers preserves existing bounded failure behavior', async (t) => {
  const result = await probe(t, () => {});
  for (const httpsResult of completeReport(result)) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /deadline|timed out/i);
  }
});

test('reset before headers stays a failed transport result', async (t) => {
  const result = await probe(t, (request) => request.socket.destroy());
  for (const httpsResult of completeReport(result)) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /reset|hang up/i);
  }
});

test('untrusted certificates fail authenticated TLS before HTTP', async (t) => {
  let requests = 0;
  const result = await probe(t, (_request, response) => {
    requests += 1;
    response.end('must not reach HTTP');
  }, '1000', false);
  assert.equal(result.killedForHang, false);
  assert.equal(result.code, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.layers.tcp.ok, true);
  assert.equal(report.layers.tls.ok, false);
  assert.equal(requests, 0);
  for (const httpsResult of [report.layers.https, report.layers.perAddress[0].https]) {
    assert.equal(httpsResult.ok, false);
    assert.match(httpsResult.error, /certificate|self.signed/i);
  }
});

for (const timeout of ['0', '-1', 'NaN', '1.5', '2147483648']) {
  test(`invalid timeout ${timeout} is rejected before any HTTP request`, async (t) => {
    let requests = 0;
    const result = await probe(t, (_request, response) => {
      requests += 1;
      response.end('unexpected request');
    }, timeout);
    assert.equal(result.killedForHang, false);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /TRANSPORT_DIAGNOSTIC_TIMEOUT_MS.*integer.*1.*2147483647/);
    assert.equal(requests, 0);
    assert.equal(result.stdout, '');
  });
}
