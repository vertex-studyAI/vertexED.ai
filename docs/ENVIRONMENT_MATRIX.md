# VertexED production environment matrix

Last repository verification: 2026-08-02

This file is the authoritative list of runtime configuration expected by the current code. It records variable names and risk only; values must never be committed or copied into logs.

`Production present` remains **Unknown** until verified in the relevant Vercel project or through a live behavior that uniquely proves the variable is configured.

| Variable | Surface | Required | Used by | Production present | Risk if absent or wrong |
| --- | --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Client, public | Yes | Browser Supabase client | Unknown | Login, OAuth, and client auth fail. Safe to expose only because it is the project URL. |
| `VITE_SUPABASE_ANON_KEY` | Client, public | Yes | Browser Supabase client | Unknown | Login and browser auth fail. Must be the anon/publishable key, never the service-role key. |
| `SUPABASE_URL` | Server | Yes | JWT verification, waitlist, signup, admin, artifact persistence | Unknown | Protected routes or account creation return configuration errors. |
| `SUPABASE_ANON_KEY` | Server | Yes | Server-side JWT verification | Unknown | Authenticated AI and content routes cannot verify sessions. May match the browser anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Yes | Admin client, waitlist approval, account creation, rate-limit table | Unknown | Waitlist/admin/signup operations fail. Critical: exposure grants privileged database access. |
| `WAITLIST_RATE_LIMIT_SALT` | Server secret | Recommended | Hashes rate-limit identities | Unknown | Code derives a fallback from the Supabase server secret; dedicated rotation and isolation are lost. |
| `ADMIN_EMAILS` | Server | Yes for admin flow | `/api/admin-status`, `/api/waitlist-admin` | Unknown | No administrator is authorized, or the wrong accounts receive admin access. |
| `SIGNUP_INVITE_CODE` | Server secret | Required for team-code signup | `/api/signup-invite` | Unknown | Team invite signup returns `503`; approved waitlist links still work. Rotate if disclosed. |
| `OPENAI_API_KEY` | Server secret | Yes for OpenAI-backed features | Review and OpenAI handlers | Unknown | Affected AI features return provider/configuration errors. |
| `ChatbotKey` | Server secret, legacy alias | Required while legacy handlers reference it | Chatbot/note/quiz/paper handlers | Unknown | Legacy AI routes may fail even when `OPENAI_API_KEY` is present. Remove alias only after code consolidation. |
| `GEMINI_API_KEY` | Server secret | Yes for planner | `/api/planner` | Unknown | AI study planner generation fails. |
| `CHATBOT_MODEL` | Server | No | Primary chatbot model override | Unknown | Repository default model is used. An invalid model causes provider errors. |
| `CHATBOT_FALLBACK_MODEL` | Server | No | Chatbot fallback model | Unknown | Repository default fallback is used. |
| `OPENAI_MODEL` | Server | No | General OpenAI model override | Unknown | Repository default is used. |
| `RESEND_API_KEY` | Server secret | Recommended | Waitlist approval email | Unknown | Approval can still generate a link, but email is logged rather than delivered. |
| `RESEND_FROM` | Server | Recommended with Resend | Approval email sender | Unknown | Email sending may fail domain/sender validation. |
| `APP_URL` | Server | Yes for production links | Approval-link generation and email | Unknown | Generated links may point at the wrong origin. Expected: `https://www.vertexed.app`. |
| `ALLOWED_ORIGINS` | Server | No | Additional CORS origins | Unknown | Defaults allow only the two VertexED production origins; add only trusted origins. |
| `VITE_CHATBOT_API_URL` | Client, public | No | Chatbot API URL override | Unknown | Same-origin `/api/ask` path is used. Wrong value can break chat or send traffic elsewhere. |
| `VITE_ADMIN_EMAILS` | Client, public | No | Navigation hint only | Unknown | Admin navigation may be hidden or shown incorrectly; server authorization remains authoritative. |
| `WORKFLOW_ID` | Server | No | Optional agent workflow integration | Unknown | Optional workflow path is unavailable. |
| `ENABLE_TEST_AGENTS` | Server | No | Explicit test-agent switch | Unknown | Test agents remain disabled, which is the safe production default. |
| `VERCEL_ENV` | Platform | Automatic | Production detection and secure failure behavior | Platform-managed | Incorrect local emulation can change fallback behavior. |
| `NODE_ENV` | Platform/build | Automatic | Production detection and framework behavior | Platform-managed | Incorrect value can enable development behavior. |

## Required production verification

1. Check both Vercel projects currently attached to the repository; two successful deployments do not prove their environment sets are identical.
2. Confirm server-only variables are not prefixed with `VITE_` and do not appear in generated browser assets.
3. Confirm Preview and Production environments intentionally differ only where expected.
4. Rotate any secret that has appeared in a repository, screenshot, issue, chat, build log, or browser bundle.
5. After changes, redeploy and run `npm run test:smoke` plus the Playwright production certification job.

## Configuration rules

- The Supabase service-role key, AI keys, Resend key, invite code, and rate-limit salt are server-only.
- `VITE_*` variables are compiled into browser assets and must be treated as public.
- Do not use fallback values for production secrets.
- Keep `.env.example`, this matrix, runtime code, Vercel settings, and launch documentation synchronized.