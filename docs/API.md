# VertexED API Reference

Base URL: `https://www.vertexed.app/api` (or `/api` in local dev)

All JSON endpoints return `X-Vertex-API: 1` and `X-Request-Id` headers.

## Public endpoints

### `GET /api/health`
Liveness check. This remains `200` even when optional or required integrations are unavailable, so it is safe for basic process monitoring.

**Response:**

```json
{
  "ok": true,
  "service": "vertexed",
  "apiVersion": "1",
  "status": "alive",
  "timestamp": "2026-08-05T00:00:00.000Z"
}
```

The response includes `Cache-Control: no-store` and `X-VertexED-Health: alive`.

### `GET /api/health?readiness=1`
Dependency-aware readiness check for deployment monitoring. `?mode=readiness` is an equivalent form.

The endpoint verifies that configuration exists for authentication, waitlist account creation, core OpenAI features, and Gemini planner features. It never returns secret values.

- `200` — all required capabilities are configured
- `503` — one or more required capabilities are missing

**Response:**

```json
{
  "ok": false,
  "service": "vertexed",
  "apiVersion": "1",
  "status": "degraded",
  "timestamp": "2026-08-05T00:00:00.000Z",
  "checks": {
    "authentication": true,
    "waitlist": false,
    "coreAi": true,
    "plannerAi": true
  }
}
```

The response includes `X-VertexED-Health: ready` or `X-VertexED-Health: degraded`. `HEAD` is supported for both liveness and readiness modes.

### `POST /api/waitlist`
Join the signup waitlist.

**Body:** `{ "email": "student@school.edu" }`

**Responses:**
- `200` — added to waitlist
- `409` — email already registered
- `429` — rate limited

### `POST /api/signup-invite`
Create an account with a team invite code or an approved waitlist link.

**Team invite body:**

```json
{ "email": "student@school.edu", "password": "...", "username": "student", "inviteCode": "..." }
```

**Approved waitlist body:**

```json
{ "password": "...", "username": "student", "waitlistInviteToken": "..." }
```

**Approval-link validation body:**

```json
{ "action": "validateInvite", "waitlistInviteToken": "..." }
```

Invite signup attempts are rate limited before shared-code validation. The configured `SIGNUP_INVITE_CODE` remains server-only.

**Responses:**
- `200` — account created, or approval link validated
- `400` — malformed account details or missing approval token
- `403` — waitlist not approved, approval token invalid, or team invite code invalid
- `409` — email already exists
- `429` — rate limited
- `503` — invite signup or account-creation backend unavailable

## Authenticated endpoints

Send `Authorization: Bearer <supabase_access_token>`.

### `POST /api/ask`
Apex chat tutor.

**Body:** `{ "question", "history?", "context?", "sources?" }`

### `POST /api/review`
AI answer review workflow (OpenAI Agents).

**Body:** `{ "input_as_text" | "prompt", "questionImages?", "answerImages?" }`

**Response:** `{ "safe_text", "output", "blocked?", "guardrails?" }`

### `GET /api/user-content?kind=&limit=`
List saved study artifacts (`note`, `review`, `paper`, `planner`, `notebook`).

### `POST /api/user-content`
Create artifact. Planner/notebook support `{ "replace": true }` for single-snapshot kinds.

### `PUT /api/user-content`
Update artifact by id (prevents duplicate rows).

**Body:** `{ "id", "title?", "payload?" }`

### `DELETE /api/user-content`
Delete artifact.

**Body:** `{ "id" }`

### `DELETE /api/account`
Permanently delete the authenticated user and cloud artifacts.

### `POST /api/planner`
Gemini-backed study planner.

**Body:** `{ "mode": "single" | "week", "prompt?", ... }`

### `POST /api/note`, `/api/quiz`, `/api/paper-generator`, `/api/notebook`, `/api/transcribe`, `/api/board-resource`
Feature-specific AI handlers. See handler files in `api/_handlers/`.

## Admin endpoints

Require admin JWT (`ADMIN_EMAILS` env).

### `GET /api/admin-status`
Returns `{ "isAdmin": true }` for authorized users.

### `POST /api/waitlist-admin`
**Actions:**
- `{ "action": "list", "status?": "pending|approved|rejected" }`
- `{ "action": "update", "id", "status" }` — approving generates `inviteLink` in response

## Error shape

```json
{ "error": "Human-readable message", "requestId": "uuid" }
```

Rate-limited responses include `retryAfter` (seconds).
