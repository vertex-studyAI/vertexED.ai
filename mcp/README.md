# MYP wiki MCP server

An [MCP](https://modelcontextprotocol.io) server over the local copy of the MYP
study-guide wiki in `public/study-guides/myp/` — 8 subjects, ~244 Markdown
pages of overviews, topic notes, command terms, question banks, revision plans
and per-session eAssessment paper breakdowns.

Everything is indexed at **heading level**, so a question about one exam
question returns that heading rather than the whole 68-page paper.

## Tools

| Tool | What it does |
|---|---|
| `list_wiki_pages` | Subjects and their pages. Orientation before searching. |
| `search_wiki` | Ranked full-text search, returning sections with `path` + `anchor`. |
| `read_wiki_page` | A whole page as Markdown, truncated on a line boundary. |
| `read_wiki_section` | One heading plus everything nested under it — the cheap way to pull a full table. |

Tool results carry `structuredContent` alongside the text, so a client can
build citations without re-parsing the prose.

## Who connects to it

- **The site.** `api/_lib/wikiMcpClient.js` links a client and this server over
  an in-memory transport — real MCP (initialize, `tools/list`, `tools/call`),
  no subprocess, which is what makes it viable inside a serverless function.
  `api/_handlers/study-guide-chat.js` then lets an OpenAI model drive those
  tools, so the study-guide tutor searches and reads the wiki instead of
  answering from a single pre-baked retrieval pass.
- **External MCP clients**, over stdio, via `mcp/stdio.js`.

## Running it standalone

```bash
npm run mcp
```

`.mcp.json` in the repo root already registers it, so any MCP client that
reads project-scoped config (Claude Code, for one) picks it up with no setup:

```json
{
  "mcpServers": {
    "myp-wiki": {
      "command": "node",
      "args": ["mcp/stdio.js"]
    }
  }
}
```

For a client configured elsewhere, give the absolute path to `mcp/stdio.js` —
no `cwd` needed. The server resolves the wiki from `WIKI_ROOT` if set, then
`./public`, then the `public/` next to this directory, so it works whatever
directory it is launched from. Set `WIKI_ROOT` to read a different copy (it
should be the directory *containing* `study-guides/`).

## Layout

- `wikiIndex.js` — loads the manifest, splits pages into sections, scoring and
  snippets. No MCP knowledge; this is the piece worth unit-testing.
- `server.js` — the tool definitions and their handlers.
- `stdio.js` — the stdio entrypoint.

Tests live in `tests/wiki-mcp.test.mjs` and run under `npm test`.
