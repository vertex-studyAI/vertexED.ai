# VertexED — verified status (2026-09-18, session continuation)

## Classifications

| Surface | Status |
|---|---|
| Canonical `origin/main` | **VERIFIED** at `97fc507292a5201ca613f7e0fa54e5cd0643dcfd` (supersedes earlier `7a468fd` checkpoint) |
| Local `codex/vertexed-publication-readiness` @ `47b73e6` + dirty WIP | **IN PROGRESS** — study UI + incomplete agents network files |
| App tests on dirty WIP (this agent) | **VERIFIED COMPLETE** — typecheck clean; **930→931** class suites green after agents handler tests |
| `https://vertex-ed-ai.vercel.app` | **VERIFIED WORKING** (HTTP 200; `/api/health` alive) |
| `https://www.vertexed.app` | **FAILED** — TLS before HTTP (`SSL_ERROR_SYSCALL` / `ECONNRESET`); DNS A not on Vercel |
| Domain repair via CLI `build-the-future-11` | **BLOCKED** — VertexED Vercel projects not in this team |

## Production vs source

Do **not** roll back product source for www TLS failure. See `docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md` and `EXECUTION_QUEUE.md` (VX-203).

Live `vertex-ed-ai.vercel.app` health ≠ www certification.

## This agent’s verified source work

1. Independent live TLS/HTTP probes matching issue #44/#652 failure class.
2. Exact-main worktree checks earlier at `7a468fd` (887 tests) before remote advanced; current main tip is `97fc507`.
3. Added `tests/agents-handler.test.mjs` for fail-closed `/api/agents` WIP; agents-related tests **9/9**; full dirty `test:app` **930/930** at that moment.
4. Flagged untracked agents set that must ship atomically:
   - `api/_handlers/agents.js`
   - `api/_lib/openAiAgents.js`
   - `src/lib/agentNetworkApi.ts`
   - `src/components/chat/AgentNetworkPanel.tsx`
   - plus dirty `api/_lib/routes.js` / `AIChatbot.tsx`

## Environment note

`/Users/ryan` hit **ENOSPC** during Research-Pilot `npm ci`. Cleared `~/.npm/_cacache` (~3 GiB freed). Prefer `npm_config_cache=/Volumes/PRO-BLADE/.npm-cache` on this machine.

## Next

1. Human: Gate 1 DNS/TLS ownership repair (VX-203).
2. Land agents WIP as one reviewed PR or revert route/UI references.
3. After www serves HTTP: auth + first-artifact certification (VX-204).
