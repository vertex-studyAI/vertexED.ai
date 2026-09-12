# VertexED production environment matrix

Last repository verification: 2026-09-12. Production values remain unverified.

This file is the authoritative list of runtime configuration expected by the current code. It records variable names and risk only; values must never be committed or copied into logs.

`Production present` remains **Unknown** until verified in the relevant Vercel project or through a live behavior that uniquely proves the variable is configured.

A read-only connector audit on 8 September reached the configured Supabase project and found critical schema capabilities absent. This proves database drift, not that the Vercel production environment points at this project or has the required secrets. The project also serves another application; schema changes need cross-application review. See [the execution report](./ASTRA_EXECUTION_2026-09-08.md).

| Variable | Surface | Required | Used by | Production present | Risk if absent or wrong |
| --- | --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Client, public | Yes | Browser Supabase client | Unknown | Login, OAuth, and client auth fail. Safe to expose only because it is the project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY` | Client, public | One required | Browser Supabase client, publishable key preferred | Unknown | Login and browser auth fail. Never use a service-role/secret key here. |
| `SUPABASE_URL` | Server | Yes | JWT verification, waitlist, signup, admin, artifact persistence | Unknown | Protected routes or account creation return configuration errors. |
| `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` | Server, public key | One public key required; client aliases supported | Server-side JWT verification | Unknown | Authenticated AI and content routes cannot verify sessions. |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` | Server secret | One required | Admin client, waitlist approval, account creation, artifacts, learner-state sync, observability, readiness | Unknown | Server-owned persistence and deep readiness fail. Critical: exposure grants privileged database access. |
| `WAITLIST_RATE_LIMIT_SALT` | Server secret | Yes | Hashes rate-limit identities | Unknown | Production rate-limited routes fail closed without a dedicated salt. |
| `ADMIN_EMAILS` | Server | Yes for admin flow | `/api/admin-status`, `/api/waitlist-admin` | Unknown | No administrator is authorized, or the wrong accounts receive admin access. |
| `SIGNUP_INVITE_CODE` | Server secret | Required for team-code signup | `/api/signup-invite` | Unknown | Team invite signup returns `503`; approved waitlist links still work. Rotate if disclosed. |
| `OPENAI_API_KEY` | Server secret | Yes for OpenAI-backed features | Review and OpenAI handlers | Unknown | Affected AI features return provider/configuration errors. |
| `ChatbotKey` | Server secret, legacy alias | No | OpenAI-backed handlers accept it as a fallback | Unknown | `OPENAI_API_KEY` is preferred; the alias can be removed from the environment after migration. |
| `GEMINI_API_KEY` | Server secret | Yes for planner | `/api/planner` | Unknown | AI study planner generation fails. |
| `CHATBOT_MODEL` | Server | No | Default Apex chatbot model | Unknown | Repository default model is used. An invalid model causes provider errors. |
| `CHATBOT_FALLBACK_MODEL` | Server | No | Default Apex fallback model | Unknown | Repository default fallback is used. |
| `CHATBOT_FAST_MODEL` / `CHATBOT_FAST_FALLBACK_MODEL` | Server | No | Apex `quick` mode | Unknown | When absent, the default chatbot model/fallback is used. Invalid IDs break only quick-mode requests. |
| `CHATBOT_TUTOR_MODEL` / `CHATBOT_TUTOR_FALLBACK_MODEL` | Server | No | Apex `tutor` mode | Unknown | When absent, the default chatbot model/fallback is used. Invalid IDs break tutor-mode requests. |
| `CHATBOT_REASONING_MODEL` / `CHATBOT_REASONING_FALLBACK_MODEL` | Server | No | Apex `deep` mode | Unknown | When absent, the default chatbot model/fallback is used. Invalid IDs break deep-mode requests. |
| `OPENAI_MODEL` | Server | No | General OpenAI model override | Unknown | Repository default is used. |
| `RESEND_API_KEY` | Server secret | Recommended | Waitlist approval email | Unknown | Approval still returns a one-time link to the authorized admin, but no email is delivered. Recipient addresses and invite links are not logged. |
| `RESEND_FROM` | Server | Recommended with Resend | Approval email sender | Unknown | Email sending may fail domain/sender validation. |
| `APP_URL` | Server | Yes for production links | Approval-link generation and email | Unknown | Generated links may point at the wrong origin. Expected: `https://www.vertexed.app`. |
| `ALLOWED_ORIGINS` | Server | No | Additional CORS origins | Unknown | Defaults allow only the two VertexED production origins; add only trusted origins. |
| `VITE_CHATBOT_API_URL` | Client, public | No | Chatbot API URL override | Unknown | Same-origin `/api/ask` path is used. Wrong value can break chat or send traffic elsewhere. |
| `VITE_ADMIN_EMAILS` | Client, public | No | Navigation hint only | Unknown | Admin navigation may be hidden or shown incorrectly; server authorization remains authoritative. |
| `VERCEL_ENV` | Platform | Automatic | Production detection and secure failure behavior | Platform-managed | Incorrect local emulation can change fallback behavior. |
| `NODE_ENV` | Platform/build | Automatic | Production detection and framework behavior | Platform-managed | Incorrect value can enable development behavior. |

## AI routing rules

- Browser clients request only a semantic mode: `quick`, `tutor`, or `deep`.
- Model IDs, API keys, provider base URLs, and provider selection remain server-side.
- Missing role-specific model overrides fall back to `CHATBOT_MODEL` and `CHATBOT_FALLBACK_MODEL`, preserving current behavior.
- A role can select another model within the configured provider, but routing does not silently switch providers.
- Change a role-specific model only after it passes the VertexED offline evals and an intentional live benchmark.

## Required production verification

1. Check both Vercel projects currently attached to the repository; two successful deployments do not prove their environment sets are identical.
2. Confirm server-only variables are not prefixed with `VITE_` and do not appear in generated browser assets.
3. Confirm Preview and Production environments intentionally differ only where expected.
4. Rotate any secret that has appeared in a repository, screenshot, issue, chat, build log, or browser bundle.
5. Require `/api/health?readiness=1` to prove the live database RPCs/tables, not only the presence of environment variables.
6. After changes, redeploy and run `npm run test:smoke` plus the authenticated Playwright certification job.
7. Confirm direct signup is disabled in Supabase Auth; private-beta accounts must originate from `/api/signup-invite`.
8. For each role-specific chatbot model enabled in production, record the corresponding eval/benchmark evidence before rollout.

## Configuration rules

- The Supabase service-role key, AI keys, Resend key, invite code, and rate-limit salt are server-only.
- `VITE_*` variables are compiled into browser assets and must be treated as public.
- Do not use fallback values for production secrets.
- Keep `.env.example`, this matrix, runtime code, Vercel settings, and launch documentation synchronized.
