# VertexED API Reference

Base URL: `https://www.vertexed.app/api` (or `/api` in local dev)

All JSON endpoints return `X-Vertex-API: 1` and `X-Request-Id` headers.

## Public endpoints

### `GET /api/health`
Liveness check.

**Response:** `{ "ok": true }`

### `POST /api/waitlist`
Join the signup waitlist.

**Body:** `{ "email": "student@school.edu" }`

**Responses:**
- `200` — added to waitlist
- `409` — email already registered
- `429` — rate limited

### `POST /api/signup-invite`
Create an account with a team invite code or approved waitlist invite link.

**Body:** `{ "email", "password", "inviteCode?", "waitlistInviteToken?" }`

**Responses:**
- `200` — account created
- `403` — waitlist not approved / invalid invite
- `409` — email exists
- `429` — rate limited

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
