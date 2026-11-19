/**
 * MCP client for the MYP wiki server.
 *
 * The chat endpoint runs inside a serverless function, so spawning the stdio
 * server as a subprocess would be wasteful and fragile. Instead the client and
 * server are linked by an in-memory transport: real MCP over JSON-RPC
 * (initialize, tools/list, tools/call), no process boundary. The connection is
 * memoised for the lifetime of the warm function instance.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createHash } from 'node:crypto';
import { prepareSourceContext } from './grounding.js';

import { createWikiMcpServer } from '../../mcp/server.js';

const CLIENT_INFO = { name: 'vertexed-study-guide-chat', version: '1.0.0' };

let connectionPromise;

async function connect() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createWikiMcpServer();
  const client = new Client(CLIENT_INFO, { capabilities: {} });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

/** Connected MCP client, reused across requests on a warm instance. */
export function getWikiMcpClient() {
  connectionPromise ??= connect().catch((error) => {
    // Do not cache a failed handshake: the next request should retry.
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

/** Tool definitions advertised by the server, as returned by tools/list. */
export async function listWikiTools(options = {}) {
  const client = await getWikiMcpClient();
  const { tools } = await client.listTools({}, { signal: options.signal, timeout: options.timeoutMs });
  return tools;
}

/**
 * Call a wiki tool.
 *
 * @param {string} name
 * @param {Record<string, unknown>} args
 * @param {object} [options]
 * @param {string} [options.currentGuidePath] page the reader has open, passed
 *   through as request `_meta` so search can bias toward it
 * @returns {Promise<{ text: string, structured: unknown, isError: boolean }>}
 */
export async function callWikiTool(name, args, options = {}) {
  const client = await getWikiMcpClient();
  const result = await client.callTool({
    name,
    arguments: args ?? {},
    ...(options.currentGuidePath ? { _meta: { currentGuidePath: options.currentGuidePath } } : {}),
  }, undefined, { signal: options.signal, timeout: options.timeoutMs });

  const text = (result.content ?? [])
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

  const structured = result.structuredContent ?? null;
  const rawSources = [
    ...(Array.isArray(structured?.results) ? structured.results : []),
    ...(structured?.page ? [structured.page] : []),
    ...(structured?.section ? [structured.section] : []),
  ].map((entry) => {
    const path = `${entry.pagePath ?? entry.path}#${entry.anchor ?? ''}`;
    return {
      id: `wiki-${createHash('sha256').update(`${path}:${entry.contentHash}`).digest('hex').slice(0, 24)}`,
      title: [entry.label, entry.heading].filter(Boolean).join(' > '),
      // The site currently renders page headings without DOM anchors. Keep
      // section identity in the source ID/title and link to the working page.
      path: entry.url,
      content: entry.text,
      contentHash: entry.contentHash,
    };
  });
  const context = prepareSourceContext(rawSources, 8000);
  const byId = new Map(rawSources.map(source => [source.id, source]));
  const sources = context.sources.map(source => ({ ...source, path: byId.get(source.id)?.path, contentHash: byId.get(source.id)?.contentHash }));
  return { text: context.prompt || text, sources, structured, isError: Boolean(result.isError) };
}

/** Test seam: drops the memoised connection. */
export async function resetWikiMcpClient() {
  const pending = connectionPromise;
  connectionPromise = undefined;
  if (pending) await pending.then(client => client.close()).catch(() => {});
}
