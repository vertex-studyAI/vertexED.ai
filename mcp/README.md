# Approved MYP guide MCP server

This server exposes the local MYP guide collection through four read-only MCP
tools. It indexes only pages accepted by the same publication gate used by the
site: published editorial approval, complete review metadata, a current review,
and an exact SHA-256 match with the reviewed Markdown. An empty approved corpus
is a valid result. Adding the server does not approve any guide.

| Tool | Result |
| --- | --- |
| `list_wiki_pages` | Approved subjects and pages. |
| `search_wiki` | Relevant approved sections, paths, anchors, and excerpts. |
| `read_wiki_page` | Approved page Markdown within the requested output bound. |
| `read_wiki_section` | A heading and its nested sections, including tables. |

The server reloads approval and content on every tool call. A warm connection
does not preserve revoked, expired, or edited content. Structured results bind
their excerpts to the approved page hash.

## Site integration

The site connects a real MCP client and server with an in-memory transport.
Initialization, tool discovery, and tool calls use the MCP protocol without
spawning another process inside a serverless request. The optional stdio entry
point uses the same server and publication rules.

The OpenAI guide tutor uses the configured provider model, routing token cap,
and fallback model. Every model round passes through the existing paid-usage
reservation, dispatch, settlement, cancellation, and telemetry path. The usage
policy accepts only the four read-only guide tools for this capability; other
capabilities retain their existing restrictions. Google and NVIDIA keep the
existing retrieval path.

The tutor has at most four tool rounds and eight tool calls, followed by a
tool-free final answer. A provider requesting tools after that budget is
rejected before execution. The total tutor budget is 25 seconds, including MCP
work, and cancellation reaches outstanding requests. The optional fallback
shares the same deadline. HTTP authentication failure does not trigger fallback.

Tool content is untrusted reference material. Only exact source IDs actually
returned by tools are accepted in the answer. The final answer rechecks page
approvals and hashes, then returns only cited sources. This verifies source
identity, not the truth or complete semantic support of every generated claim.

The dock reuses the site's authenticated, account-scoped conversation history,
status display, citation links, and sign-in flow. It respects reduced motion.
The generic floating chat is hidden on study-guide routes to avoid duplicate
controls.

## Run over stdio

Use the repository's supported Node 22 runtime and locked dependencies:

```sh
npm ci
npm run mcp
```

The root `.mcp.json` registers `node mcp/stdio.js`. For a client launched from a
different directory, use the absolute path to that script. `WIKI_ROOT` can point
to another `public` directory containing `study-guides/`; the corresponding
`contracts/content-publication-approvals.json` must sit beside that directory.
Alternate content does not bypass approval checks.

`OPENAI_STUDY_GUIDE_MODEL` optionally overrides the configured primary model.
Leaving it unset preserves the normal provider configuration. No additional
credentials are needed for local read-only MCP access.

## Validation

`tests/wiki-mcp.test.mjs` builds a small synthetic, explicitly approved fixture.
It covers protocol discovery, section retrieval, citation binding, edited and
revoked content, tool budgets, cancellation, and final-answer rejection.
Publication approvals in the real repository are not changed by these tests.
Paid-provider tests cover admission and metering without live paid calls.

This integration extracts the tutor work from PR #1143. The unrelated billing
and local preview authentication commits in that branch are outside this change.
