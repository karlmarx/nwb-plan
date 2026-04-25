# Connecting to the NWB-Plan MCP Server

Karl's exercise library is exposed to Claude Code and Claude.ai as a remote
MCP (Model Context Protocol) server. Once connected, Claude can list,
search, mutate, and recommend exercises against the live Postgres-backed
library — no code edits required.

## Endpoints

| Environment | URL                                  |
|-------------|--------------------------------------|
| Production  | `https://nfit.93.fyi/api/mcp`        |
| Dev         | `https://dev.nfit.93.fyi/api/mcp`    |
| Local       | `http://localhost:3000/api/mcp`      |

Transport: MCP "Streamable HTTP" — a single POST per JSON-RPC request.
Server-Sent Events are not used (no streaming tools). Send `Accept:
application/json` (or just nothing — JSON is the default).

## Authentication

Every request — read or write — must include the bearer token:

```
Authorization: Bearer <EXERCISE_API_TOKEN>
```

The token lives in Vercel env (`EXERCISE_API_TOKEN`). Generate with
`openssl rand -hex 32` and set with `vercel env add EXERCISE_API_TOKEN`.
The same token gates the REST endpoints under `/api/exercises/*`.

Missing/invalid token → 401. Token unset on the server → 503 (so you
know it's an ops issue, not your bug).

## Tools exposed

| Tool                | Purpose                                                |
|---------------------|--------------------------------------------------------|
| `list_exercises`    | Compact list, filter by category or safety            |
| `get_exercise`      | Full record by slug id                                 |
| `create_exercise`   | Insert / upsert                                        |
| `update_exercise`   | Partial patch                                          |
| `delete_exercise`   | Remove from library                                    |
| `whats_on_today`    | Resolve today's prescribed workout                     |
| `swap_in_workout`   | Phase 1 — currently errors                             |
| `add_finisher`      | Phase 1 — currently errors                             |

`swap_in_workout` and `add_finisher` need the workouts table in DB
(landed in Phase 1 of `docs/exercise-backend.md`). Until that
migration runs they return JSON-RPC error code `-32001` with a
human-readable Phase-1 hint.

## Connecting from Claude Code

Add an entry to `~/.claude.json` under `mcpServers`:

```jsonc
{
  "mcpServers": {
    "nwb-plan": {
      "type": "http",
      "url": "https://nfit.93.fyi/api/mcp",
      "headers": {
        "Authorization": "Bearer ${EXERCISE_API_TOKEN}"
      }
    }
  }
}
```

Set the env var in your shell rc:

```bash
export EXERCISE_API_TOKEN='paste-the-token-here'
```

Restart Claude Code and verify with `/mcp`. You should see `nwb-plan` listed
with its 8 tools.

## Connecting from Claude.ai

In Settings → Connectors → Custom Connectors → Add custom MCP server:

- **Name:** `NWB Plan`
- **URL:** `https://nfit.93.fyi/api/mcp`
- **Auth:** Custom header
  - Header name: `Authorization`
  - Header value: `Bearer paste-the-token-here`

Save. The 8 tools become available in chat.

## Smoke test (curl)

Confirm auth + tool listing without a client:

```bash
TOKEN='paste-the-token-here'

# 1) Auth check — should be 401 without a header
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST https://nfit.93.fyi/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# expect: 401

# 2) Tool list — should return an array of 8 tools
curl -sS -X POST https://nfit.93.fyi/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
# expect: 8

# 3) Call list_exercises (legs only, safe only)
curl -sS -X POST https://nfit.93.fyi/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "list_exercises",
      "arguments": { "category": "legs", "safety": "safe" }
    }
  }' | jq '.result.structuredContent.count'

# 4) What's on today
curl -sS -X POST https://nfit.93.fyi/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": { "name": "whats_on_today", "arguments": {} }
  }' | jq '.result.structuredContent.workoutId'
```

## Protocol notes

- JSON-RPC 2.0. Responses are wrapped `{ jsonrpc, id, result | error }`.
- Tool results follow MCP's content/structuredContent shape:
  ```jsonc
  {
    "content": [{ "type": "text", "text": "<pretty JSON>" }],
    "structuredContent": { /* the actual JS value */ },
    "isError": false
  }
  ```
- Phase-0 errors (`swap_in_workout`, `add_finisher`) come back as
  JSON-RPC errors with `code: -32001`, message explaining the gap, and
  `data.pendingPhase: 1`.
- Batches are accepted: send an array of requests, receive an array
  of responses (notifications filtered out).

## Troubleshooting

| Symptom                                 | Likely cause                                     |
|-----------------------------------------|--------------------------------------------------|
| 401 from every call                     | `EXERCISE_API_TOKEN` mismatch or header dropped  |
| 503 from every call                     | Server has no `EXERCISE_API_TOKEN` configured    |
| 405 GET                                 | You sent GET; this transport is POST-only        |
| 500 on `list_exercises`                 | DB env vars missing — Neon not provisioned yet   |
| Phase-1 error on swap/finisher          | Expected until workouts table lands              |
