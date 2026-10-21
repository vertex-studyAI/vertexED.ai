/**
 * MCP server exposing the local MYP study-guide wiki as tools.
 *
 * The same server definition serves two clients:
 *   - mcp/stdio.js, for external MCP clients (Claude Desktop, Cursor, ...)
 *   - api/_lib/wikiMcpClient.js, over an in-memory transport, for the
 *     study-guide chat endpoint
 *
 * Keeping one definition means the tutor on the site and an external agent see
 * exactly the same wiki, with the same tool contract.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
  findSection,
  loadWikiIndex,
  readPage,
  resolvePage,
  searchWiki,
  sectionWithChildren,
} from './wikiIndex.js';

export const WIKI_MCP_SERVER_INFO = { name: 'vertexed-myp-wiki', version: '1.0.0' };

function textResult(text, structuredContent) {
  return { content: [{ type: 'text', text }], ...(structuredContent ? { structuredContent } : {}) };
}

function errorResult(text) {
  return { content: [{ type: 'text', text }], isError: true };
}

function formatSearchHit(hit, position) {
  return [
    `[${position}] ${hit.label} > ${hit.heading}`,
    `path: ${hit.pagePath}#${hit.anchor}`,
    '',
    hit.text,
  ].join('\n');
}

/** Builds a fresh McpServer wired to the wiki index. */
export function createWikiMcpServer() {
  const server = new McpServer(WIKI_MCP_SERVER_INFO, {
    capabilities: { tools: {} },
    instructions:
      'Tools over VertexED\'s local copy of the IB MYP study-guide wiki (8 subjects: overviews, ' +
      'topic notes, command terms, question banks, revision plans, and per-session eAssessment ' +
      'paper breakdowns). Start with search_wiki; use read_wiki_section to pull a full table or ' +
      'heading once search shows where the answer lives. Never answer from prior knowledge about ' +
      'MYP papers — the wiki is the source of truth.',
  });

  server.registerTool(
    'list_wiki_pages',
    {
      title: 'List wiki pages',
      description:
        'List the subjects in the MYP wiki and the pages each one holds. Use this to orient ' +
        'yourself before searching, or to check whether a subject or exam session exists.',
      inputSchema: {
        subject: z
          .string()
          .optional()
          .describe('Restrict to one subject, by name or slug (e.g. "Physics" or "physics").'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ subject }) => {
      const index = await loadWikiIndex();
      const wanted = subject?.trim().toLowerCase();
      const subjects = wanted
        ? index.subjects.filter((item) => item.slug === wanted || item.name.toLowerCase() === wanted)
        : index.subjects;

      if (subjects.length === 0) {
        return errorResult(
          `No subject matches "${subject}". Available: ${index.subjects.map((item) => item.slug).join(', ')}.`,
        );
      }

      const listing = subjects.map((item) => {
        const pages = index.pages.filter((page) => page.subjectSlug === item.slug);
        return {
          subject: item.name,
          slug: item.slug,
          pages: pages.map((page) => ({ path: page.id, title: page.title, url: page.url })),
        };
      });

      const text = listing
        .map((entry) =>
          [
            `## ${entry.subject} (${entry.pages.length} pages)`,
            ...entry.pages.map((page) => `- ${page.path} — ${page.title}`),
          ].join('\n'),
        )
        .join('\n\n');

      return textResult(text, { subjects: listing });
    },
  );

  server.registerTool(
    'search_wiki',
    {
      title: 'Search the wiki',
      description:
        'Full-text search across every page of the MYP wiki, ranked at heading level. Returns ' +
        'the matching sections with their page path and anchor, which you can pass to ' +
        'read_wiki_section. Prefer specific queries ("half-life calculation M24", "criterion B ' +
        'hypothesis command terms") over single generic words.',
      inputSchema: {
        query: z.string().min(2).describe('What to look for, in natural language or keywords.'),
        subject: z.string().optional().describe('Restrict to one subject, by name or slug.'),
        limit: z.number().int().min(1).max(12).optional().describe('Max results (default 6).'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, subject, limit }, extra) => {
      const index = await loadWikiIndex();
      const hits = searchWiki(index, query, {
        subject,
        limit: limit ?? 6,
        // The chat endpoint passes the page the reader has open; it nudges
        // ambiguous questions ("explain this table") toward the right page.
        boostPath: extra?._meta?.currentGuidePath,
      });

      if (hits.length === 0) {
        return textResult(
          `No wiki section matches "${query}"${subject ? ` in ${subject}` : ''}. Try different wording, ` +
            'a broader query, or list_wiki_pages to see what exists.',
          { results: [] },
        );
      }

      return textResult(
        hits.map((hit, position) => formatSearchHit(hit, position + 1)).join('\n\n---\n\n'),
        { results: hits },
      );
    },
  );

  server.registerTool(
    'read_wiki_page',
    {
      title: 'Read a wiki page',
      description:
        'Read a full wiki page as Markdown. Pages such as session paper breakdowns are long — ' +
        'prefer read_wiki_section when you already know which heading you need.',
      inputSchema: {
        path: z
          .string()
          .describe('Page path from search_wiki or list_wiki_pages, e.g. "physics/sessions/M24.md".'),
        max_chars: z
          .number()
          .int()
          .min(500)
          .max(40000)
          .optional()
          .describe('Truncate the page to roughly this many characters (default 12000).'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ path, max_chars: maxChars }) => {
      const index = await loadWikiIndex();
      const page = resolvePage(index, path);
      if (!page) return errorResult(`No wiki page at "${path}". Use list_wiki_pages or search_wiki to find valid paths.`);

      const { text, truncated } = readPage(page, maxChars ?? 12000);
      const headings = page.sections.map((section) => `${'  '.repeat(Math.max(0, section.level - 1))}- ${section.heading}`);
      const body = [
        `# ${page.label}`,
        `path: ${page.id}`,
        '',
        text,
        truncated
          ? `\n\n[Truncated. Remaining headings on this page:\n${headings.join('\n')}\nUse read_wiki_section for any of them.]`
          : '',
      ].join('\n');

      return textResult(body.trim(), {
        page: { path: page.id, label: page.label, url: page.url, truncated },
      });
    },
  );

  server.registerTool(
    'read_wiki_section',
    {
      title: 'Read a wiki section',
      description:
        'Read one heading of a wiki page, including everything nested under it. This is the ' +
        'cheapest way to pull a complete table (topic frequency, mark distribution, command ' +
        'terms) without loading the whole page.',
      inputSchema: {
        path: z.string().describe('Page path, e.g. "physics/sessions/M24.md".'),
        section: z
          .string()
          .describe('Section anchor from search_wiki (e.g. "paper-structure-table") or the heading text.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ path, section }) => {
      const index = await loadWikiIndex();
      const page = resolvePage(index, path);
      if (!page) return errorResult(`No wiki page at "${path}". Use list_wiki_pages or search_wiki to find valid paths.`);

      const match = findSection(page, section);
      if (!match) {
        return errorResult(
          `No section "${section}" on ${page.id}. Available headings:\n${page.sections
            .map((item) => `- ${item.heading} (${item.anchor})`)
            .join('\n')}`,
        );
      }

      const text = `# ${page.label}\npath: ${page.id}#${match.anchor}\n\n${sectionWithChildren(page, match)}`;
      return textResult(text, {
        section: { path: page.id, anchor: match.anchor, heading: match.heading, label: page.label, url: page.url },
      });
    },
  );

  return server;
}
