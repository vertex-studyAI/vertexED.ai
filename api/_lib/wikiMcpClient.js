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
export async function listWikiTools() {
  const client = await getWikiMcpClient();
  const { tools } = await client.listTools();
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
  });

  const text = (result.content ?? [])
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

  return { text, structured: result.structuredContent ?? null, isError: Boolean(result.isError) };
}

/** Test seam: drops the memoised connection. */
export function resetWikiMcpClient() {
  connectionPromise = undefined;
}
