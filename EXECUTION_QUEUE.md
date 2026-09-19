# VertexED Immediate Execution Queue

Updated: 2026-09-18 (portfolio execution pass — reconciled after parallel main merges).

Current exact canonical source: `main@97fc507292a5201ca613f7e0fa54e5cd0643dcfd` (verified `git fetch` + `rev-parse origin/main`).

## 2026-09-18 live boundary (do not conflate)

| Surface | Result | Evidence |
|---|---|---|
| `origin/main` | **VERIFIED** at `97fc507...` | includes #899, #902, #903, #904, #906, #907 |
| Prior tip `7a468fd...` / `779cb66...` | **superseded** | still referenced in older issue #44 comments |
| `www.vertexed.app` HTTPS | **FAILED** TLS before HTTP | `SSL_ERROR_SYSCALL`; DNS A = Namecheap `104.219.250.37` + Worldstream `2.59.170.20` — not Vercel |
| `https://vertex-ed-ai.vercel.app/api/health` | **200** alive | app reachable on that project; revision is project-deploy evidence, not www proof |
| `vertex-ai-rho.vercel.app` HTML | **200** | catch-all host→www redirect previously also swallowed `/api` (source fix below) |
| Vercel CLI team `build-the-future-11` | **BLOCKED** for domain attach | VertexED projects not listed |
| Local branch `codex/vertexed-publication-readiness` @ `47b73e6` + dirty worktree | typecheck **PASS**; `npm run test:app` **931/931** on Node 22.14 after strip-types runner fix | this session |

Production recovery remains **provider/DNS/TLS ownership** (VX-203 / #44 / #652). Owner runbook: `docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`.

Do **not** roll back application source, remove ignored-build protection, or create sentinel commits to chase domain health.

### Source fixes this session (worktree; need review/merge)

| Change | Why | Verification |
|---|---|---|
| `scripts/run-test-scope.mjs` adds `--experimental-strip-types` | Node 22 failed 6 test files with `ERR_UNKNOWN_FILE_EXTENSION` on `.ts` imports | `npm run test:app` → **931 pass / 0 fail** |
| `vercel.json` host redirects exclude `/api` | Preview/apex API was 308'd onto broken www | `tests/vercelConfig.test.mjs` pass |
| `docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md` | Exact owner steps; no secrets | evidence table above |

| ID | Priority | Exact outcome | State |
|---|---:|---|---|
| VX-201 | P0 | Measured mastery / adaptive notes integrity | DONE |
| VX-202 | P0 | Canonical CI certification | BLOCKED on prod jobs until VX-203 |
| VX-203 | P0 | Custom-domain DNS/TLS + owning Vercel project | **BLOCKED** (human/registrar) |
| VX-204 | P0 | Production auth + isolation | BLOCKED on VX-203 |
| VX-205 | P0 | Production DB/RLS contract | BLOCKED on access |
| VX-206 | P1 | Adaptive notes browser coverage | DONE |
| VX-207 | P1 | Live provider quality gate | BLOCKED |
| VX-208 | P1 | School pilot package | BLOCKED |

## Execution rule

Do not create sentinel/no-op commits, weaken revision/readiness assertions, or add unrelated feature families to work around VX-203. Until VX-203 and VX-204 are green, prioritize release-path recovery, production certification, accessibility/reliability closure, and evidence-backed product work over expansion or outreach.
