"""Integration tests for the /api/mcp MCP server (PR #92).

Setup
-----
The shared `conftest.py` boots a Next.js production server on
`localhost:3000` for the session via `subprocess.Popen`, which inherits
the parent process env. Exporting `EXERCISE_API_TOKEN` in the shell that
runs pytest causes the server to see the same value the tests read.

If `EXERCISE_API_TOKEN` is unset, every MCP call would 503 ("Server
misconfigured") instead of 401, so the whole module is skipped with a
clear "how to fix" reason rather than producing low-signal failures.

Run locally:

    EXERCISE_API_TOKEN=test-token npm run test:e2e -- \\
        e2e/test_api_exercises.py e2e/test_api_mcp.py

Covers:
- JSON-RPC 2.0 transport (single, batch, notification)
- Bearer-token auth on every method (read or write)
- Tool registry (`tools/list` returns 8 known tools)
- Per-tool dispatch (`whats_on_today` works without DB; `swap_in_workout`
  is a Phase-0 stub returning RPC error -32001; unknown tool errors).

DB-dependent tool calls are gated on `POSTGRES_URL`.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any
from urllib.request import Request

import pytest


BASE_URL = "http://localhost:3000"
MCP = f"{BASE_URL}/api/mcp"

NO_TOKEN = os.environ.get("EXERCISE_API_TOKEN") is None
pytestmark = pytest.mark.skipif(
    NO_TOKEN,
    reason="EXERCISE_API_TOKEN must be set in the shell that spawns the "
    "Next.js server. Run with `EXERCISE_API_TOKEN=test-token "
    "npm run test:e2e -- e2e/test_api_mcp.py`.",
)

NO_DB = os.environ.get("POSTGRES_URL") is None
NO_DB_REASON = "POSTGRES_URL not set; skipping DB-dependent test"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #


def _token() -> str:
    tok = os.environ.get("EXERCISE_API_TOKEN")
    assert tok, "EXERCISE_API_TOKEN unset (module-level skip should have fired)"
    return tok


def _post(
    body: Any,
    *,
    bearer: str | None = "default",
) -> tuple[int, dict[str, str], Any]:
    """POST a JSON-RPC body to /api/mcp.

    `bearer="default"` uses the test token. `bearer=None` omits the header.
    `bearer="<string>"` sends that literal value.
    """
    headers = {"Content-Type": "application/json"}
    if bearer == "default":
        headers["Authorization"] = f"Bearer {_token()}"
    elif bearer is not None:
        headers["Authorization"] = f"Bearer {bearer}"

    data = json.dumps(body).encode("utf-8")
    req = Request(MCP, data=data, method="POST", headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        status = resp.status
        raw = resp.read()
        resp_headers = {k.lower(): v for k, v in resp.headers.items()}
    except urllib.error.HTTPError as e:
        status = e.code
        raw = e.read()
        resp_headers = {k.lower(): v for k, v in e.headers.items()}
    if not raw:
        return status, resp_headers, None
    try:
        return status, resp_headers, json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError:
        return status, resp_headers, raw.decode("utf-8", errors="replace")


def _rpc(
    method: str,
    *,
    params: Any = None,
    rpc_id: int | str | None = 1,
) -> dict[str, Any]:
    out: dict[str, Any] = {"jsonrpc": "2.0", "method": method}
    if rpc_id is not None:
        out["id"] = rpc_id
    if params is not None:
        out["params"] = params
    return out


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #


def test_mcp_without_bearer_returns_401():
    """Even read-only `tools/list` requires bearer auth on /api/mcp."""
    status, _h, body = _post(_rpc("tools/list"), bearer=None)
    assert status == 401, f"Expected 401, got {status}: {body}"
    assert isinstance(body, dict) and "error" in body


def test_mcp_with_wrong_bearer_returns_401():
    """Mismatched token → 401."""
    status, _h, body = _post(
        _rpc("tools/list"),
        bearer="not-the-real-token-aaaaaaaaaaaaaaa",
    )
    assert status == 401, f"Expected 401, got {status}: {body}"


# --------------------------------------------------------------------------- #
# initialize
# --------------------------------------------------------------------------- #


def test_mcp_initialize_returns_capabilities():
    """`initialize` returns serverInfo + protocolVersion + capabilities."""
    status, _h, body = _post(
        _rpc("initialize", params={"protocolVersion": "2025-06-18"})
    )
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert body["jsonrpc"] == "2.0"
    assert body["id"] == 1
    result = body["result"]
    assert "protocolVersion" in result
    assert "serverInfo" in result
    assert result["serverInfo"]["name"] == "nwb-plan-exercise-library"
    assert "capabilities" in result
    assert "tools" in result["capabilities"]


# --------------------------------------------------------------------------- #
# tools/list
# --------------------------------------------------------------------------- #


EXPECTED_TOOL_NAMES = {
    "list_exercises",
    "get_exercise",
    "create_exercise",
    "update_exercise",
    "delete_exercise",
    "whats_on_today",
    "swap_in_workout",
    "add_finisher",
}


def test_mcp_tools_list_returns_eight_tools():
    """tools/list returns exactly the 8 expected tool descriptors."""
    status, _h, body = _post(_rpc("tools/list"))
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert "result" in body, body
    tools = body["result"]["tools"]
    assert isinstance(tools, list)
    assert len(tools) == 8, (
        f"Expected 8 tools, got {len(tools)}: "
        f"{[t['name'] for t in tools]}"
    )
    names = {t["name"] for t in tools}
    assert names == EXPECTED_TOOL_NAMES, f"Tool name mismatch: {names}"
    # Every tool must declare its inputSchema.
    for t in tools:
        assert "name" in t
        assert "description" in t
        assert "inputSchema" in t
        assert t["inputSchema"].get("type") == "object"


# --------------------------------------------------------------------------- #
# tools/call
# --------------------------------------------------------------------------- #


@pytest.mark.skipif(NO_DB, reason=NO_DB_REASON)
def test_mcp_tools_call_list_exercises_returns_structured_content():
    """list_exercises returns structuredContent with `count` and `exercises`."""
    status, _h, body = _post(
        _rpc(
            "tools/call",
            params={"name": "list_exercises", "arguments": {}},
        )
    )
    assert status == 200, f"Expected 200, got {status}: {body}"
    result = body["result"]
    assert "content" in result
    assert "structuredContent" in result
    sc = result["structuredContent"]
    assert "count" in sc
    assert "exercises" in sc
    assert isinstance(sc["exercises"], list)
    assert sc["count"] == len(sc["exercises"])


def test_mcp_tools_call_whats_on_today_works_without_db():
    """whats_on_today resolves SCHED+WORKOUTS in code; falls back to a
    skeleton when the DB lookup fails. Pin dayOfWeek=1 (Mon → Push A) so
    the assertion is deterministic.
    """
    status, _h, body = _post(
        _rpc(
            "tools/call",
            params={
                "name": "whats_on_today",
                "arguments": {"dayOfWeek": 1},  # Monday → Push A
            },
        )
    )
    assert status == 200, f"Expected 200, got {status}: {body}"
    sc = body["result"]["structuredContent"]
    assert "dayLabel" in sc
    assert "title" in sc
    assert "exercises" in sc
    assert sc["dayLabel"] == "Mon"
    assert sc["workoutId"] == "Push A"
    # Must surface a non-empty exercises list whether DB is up or not.
    assert isinstance(sc["exercises"], list)
    assert len(sc["exercises"]) > 0
    # Each entry has a name and `found` flag even when DB lookup failed.
    for ex in sc["exercises"]:
        assert "name" in ex
        assert "found" in ex


def test_mcp_tools_call_swap_in_workout_returns_phase0_error():
    """swap_in_workout is a stub in Phase 0; returns RPC error -32001."""
    status, _h, body = _post(
        _rpc(
            "tools/call",
            params={
                "name": "swap_in_workout",
                "arguments": {
                    "workoutId": "Push A",
                    "oldExerciseName": "Foo",
                    "newExerciseName": "Bar",
                },
            },
        )
    )
    assert status == 200, f"Expected HTTP 200, got {status}: {body}"
    # Phase-0 stub raises RpcAppError(-32001) → JSON-RPC error envelope.
    assert "error" in body, f"Expected JSON-RPC error, got: {body}"
    assert body["error"]["code"] == -32001
    # The handler attaches { phase: 0, pendingPhase: 1, docs: ... } as data.
    data = body["error"].get("data") or {}
    assert data.get("phase") == 0, f"Expected phase=0 in error.data, got {data}"


def test_mcp_tools_call_unknown_tool_returns_jsonrpc_error():
    """Calling a tool that isn't registered → JSON-RPC error envelope."""
    status, _h, body = _post(
        _rpc(
            "tools/call",
            params={"name": "no_such_tool", "arguments": {}},
        )
    )
    # HTTP stays 200; the error is in the JSON-RPC envelope.
    assert status == 200, f"Expected 200 with rpc error, got {status}: {body}"
    assert "error" in body, f"Expected JSON-RPC error, got: {body}"
    # Unknown tools surface as MethodNotFound (-32601) per the dispatcher.
    assert body["error"]["code"] in (-32601, -32603), (
        f"Unexpected error code: {body['error']}"
    )


# --------------------------------------------------------------------------- #
# JSON-RPC batch + notification
# --------------------------------------------------------------------------- #


def test_mcp_jsonrpc_batch_returns_array_of_results():
    """Two tools/list calls in a batch → array of two responses by id."""
    batch = [
        _rpc("tools/list", rpc_id=10),
        _rpc("tools/list", rpc_id=11),
    ]
    status, _h, body = _post(batch)
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert isinstance(body, list), (
        f"Expected array response, got {type(body)}: {body}"
    )
    assert len(body) == 2, f"Expected 2 responses, got {len(body)}: {body}"
    ids = sorted([r["id"] for r in body])
    assert ids == [10, 11]
    for r in body:
        assert "result" in r
        assert "tools" in r["result"]


def test_mcp_jsonrpc_notification_returns_no_response_body():
    """A notifications/initialized request without `id` is a JSON-RPC
    notification; the server returns 204 No Content with no body."""
    notif = {"jsonrpc": "2.0", "method": "notifications/initialized"}  # no id
    status, _h, body = _post(notif)
    assert status == 204, f"Expected 204, got {status}: {body}"
    assert body is None or body == "", f"Expected empty body, got {body!r}"


# --------------------------------------------------------------------------- #
# GET on /api/mcp (sanity)
# --------------------------------------------------------------------------- #


def test_mcp_get_returns_405_with_allow_post():
    """The endpoint advertises POST-only Streamable HTTP via 405 + Allow."""
    req = Request(MCP, method="GET")
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        status = resp.status
        allow = resp.headers.get("allow", "")
    except urllib.error.HTTPError as e:
        status = e.code
        allow = e.headers.get("allow", "")
    assert status == 405, f"Expected 405, got {status}"
    assert "POST" in allow.upper(), f"Allow header should include POST: {allow!r}"
