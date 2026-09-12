#!/usr/bin/env node

import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import https from 'node:https';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const TARGET_URL = new URL(process.env.TRANSPORT_DIAGNOSTIC_URL || 'https://www.vertexed.app');
const TIMEOUT_MS = Number(process.env.TRANSPORT_DIAGNOSTIC_TIMEOUT_MS || 10_000);
const OUTPUT_PATH = process.env.TRANSPORT_DIAGNOSTIC_OUTPUT || '';
const DNS_CNAME_MAX_HOPS = 8;

function describeError(error) {
  const details = [];
  const seen = new Set();
  const queue = [error];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || (typeof current !== 'object' && typeof current !== 'function') || seen.has(current)) {
      continue;
    }

    seen.add(current);
    const parts = [];

    if (typeof current.message === 'string' && current.message.trim()) {
      parts.push(current.message.trim());
    }
    if (typeof current.code === 'string' || typeof current.code === 'number') {
      parts.push(`code=${String(current.code)}`);
    }
    if (typeof current.errno === 'string' || typeof current.errno === 'number') {
      parts.push(`errno=${String(current.errno)}`);
    }
    if (typeof current.syscall === 'string' && current.syscall.trim()) {
      parts.push(`syscall=${current.syscall.trim()}`);
    }

    if (parts.length > 0) {
      details.push(parts.join(' '));
    }
    if (current.cause) {
      queue.push(current.cause);
    }
    if (Array.isArray(current.errors)) {
      queue.push(...current.errors.slice(0, 3));
    }
  }

  return details.length > 0 ? details.join(' <- ') : String(error);
}

function withSocketTimeout(socket, reject, label) {
  socket.setTimeout(TIMEOUT_MS, () => {
    socket.destroy();
    reject(new Error(`${label} timed out after ${TIMEOUT_MS}ms`));
  });
}

function isExpectedCnameAbsence(error) {
  return error?.code === 'ENODATA' || error?.code === 'ENOTFOUND';
}

async function diagnoseCnameChain(hostname) {
  const chain = [];
  const seen = new Set([hostname]);
  let current = hostname;

  for (let hop = 0; hop < DNS_CNAME_MAX_HOPS; hop += 1) {
    try {
      const targets = await dns.resolveCname(current);
      if (targets.length === 0) {
        return { ok: true, chain, terminalName: current };
      }

      const next = targets[0];
      chain.push({ from: current, to: next });

      if (seen.has(next)) {
        return {
          ok: false,
          chain,
          terminalName: current,
          error: `CNAME loop detected at ${next}`,
        };
      }

      seen.add(next);
      current = next;
    } catch (error) {
      if (isExpectedCnameAbsence(error)) {
        return { ok: true, chain, terminalName: current };
      }

      return {
        ok: false,
        chain,
        terminalName: current,
        error: describeError(error),
      };
    }
  }

  return {
    ok: false,
    chain,
    terminalName: current,
    error: `CNAME chain exceeded ${DNS_CNAME_MAX_HOPS} hops`,
  };
}

async function diagnoseDns(hostname) {
  const cname = await diagnoseCnameChain(hostname);

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    return {
      ok: addresses.length > 0,
      addresses: addresses.map(({ address, family }) => ({ address, family })),
      cname,
    };
  } catch (error) {
    return { ok: false, error: describeError(error), cname };
  }
}

async function diagnoseTcp(hostname, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: hostname, port });
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.once('connect', () => finish({ ok: true, remoteAddress: socket.remoteAddress, remoteFamily: socket.remoteFamily }));
    socket.once('error', (error) => finish({ ok: false, error: describeError(error) }));
    withSocketTimeout(socket, (error) => finish({ ok: false, error: describeError(error) }), 'TCP connect');
  });
}

async function diagnoseTls(hostname, port, connectHost = hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: connectHost, port, servername: hostname, rejectUnauthorized: true });
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.once('secureConnect', () => {
      const certificate = socket.getPeerCertificate();
      finish({
        ok: socket.authorized,
        authorized: socket.authorized,
        authorizationError: socket.authorizationError || null,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher()?.name || null,
        peerCommonName: certificate?.subject?.CN || null,
        validTo: certificate?.valid_to || null,
      });
    });
    socket.once('error', (error) => finish({ ok: false, error: describeError(error) }));
    withSocketTimeout(socket, (error) => finish({ ok: false, error: describeError(error) }), 'TLS handshake');
  });
}

async function diagnoseHttps(url, connectHost = url.hostname) {
  return new Promise((resolve) => {
    const request = https.get({
      protocol: url.protocol,
      hostname: connectHost,
      port: Number(url.port || 443),
      path: `${url.pathname}${url.search}`,
      servername: url.hostname,
      rejectUnauthorized: true,
      headers: { Host: url.host },
      timeout: TIMEOUT_MS,
    }, (response) => {
      response.resume();
      response.once('end', () => {
        resolve({
          ok: true,
          status: response.statusCode ?? null,
          headers: {
            cacheControl: response.headers['cache-control'] || null,
            vertexApi: response.headers['x-vertex-api'] || null,
            vertexHealth: response.headers['x-vertexed-health'] || null,
            vertexRevision: response.headers['x-vertexed-revision'] || null,
            server: response.headers.server || null,
          },
        });
      });
    });

    request.once('timeout', () => request.destroy(new Error(`HTTPS request timed out after ${TIMEOUT_MS}ms`)));
    request.once('error', (error) => resolve({ ok: false, error: describeError(error) }));
  });
}

async function diagnoseAddress(hostname, port, healthUrl, { address, family }) {
  const [tcpResult, tlsResult, httpsResult] = await Promise.all([
    diagnoseTcp(address, port),
    diagnoseTls(hostname, port, address),
    diagnoseHttps(healthUrl, address),
  ]);

  return {
    address,
    family,
    tcp: tcpResult,
    tls: tlsResult,
    https: httpsResult,
  };
}

async function main() {
  if (TARGET_URL.protocol !== 'https:') {
    throw new Error(`Transport diagnostics require HTTPS, got ${TARGET_URL.protocol}`);
  }

  const port = Number(TARGET_URL.port || 443);
  const checkedAt = new Date().toISOString();
  const healthUrl = new URL('/api/health', TARGET_URL);

  const dnsResult = await diagnoseDns(TARGET_URL.hostname);
  const tcpResult = await diagnoseTcp(TARGET_URL.hostname, port);
  const tlsResult = await diagnoseTls(TARGET_URL.hostname, port);
  const httpsResult = await diagnoseHttps(healthUrl);
  const perAddress = await Promise.all((dnsResult.addresses || []).map((entry) => (
    diagnoseAddress(TARGET_URL.hostname, port, healthUrl, entry)
  )));

  const report = {
    checkedAt,
    target: TARGET_URL.origin,
    runtime: process.version,
    timeoutMs: TIMEOUT_MS,
    layers: {
      dns: dnsResult,
      tcp: tcpResult,
      tls: tlsResult,
      https: httpsResult,
      perAddress,
    },
  };

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  process.stdout.write(serialized);

  if (OUTPUT_PATH) {
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, serialized, 'utf8');
  }
}

main().catch((error) => {
  console.error(`[transport-diagnostics] fatal: ${describeError(error)}`);
  process.exit(1);
});
