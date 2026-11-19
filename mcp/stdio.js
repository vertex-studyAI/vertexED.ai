#!/usr/bin/env node
/**
 * Stdio entrypoint for the MYP wiki MCP server.
 *
 * Point any MCP client at it from the repo root:
 *
 *   {
 *     "mcpServers": {
 *       "myp-wiki": {
 *         "command": "node",
 *         "args": ["mcp/stdio.js"],
 *         "cwd": "/absolute/path/to/vertexED.ai"
 *       }
 *     }
 *   }
 *
 * The wiki is read from ./public/study-guides/myp; set WIKI_ROOT to point at a
 * different copy.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createWikiMcpServer } from './server.js';
import { loadWikiIndex } from './wikiIndex.js';

async function main() {
  // Fail loudly at startup rather than on the first tool call if the wiki copy
  // is missing — an MCP client only surfaces the stderr of a crashed server.
  const index = await loadWikiIndex();
  console.error(
    `[myp-wiki] indexed ${index.pages.length} pages across ${index.subjects.length} subjects`,
  );

  const server = createWikiMcpServer();
  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  console.error('[myp-wiki] failed to start:', error);
  process.exit(1);
});
