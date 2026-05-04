"""Integration tests for the /api/exercises REST endpoints (PR #90).

Setup
-----
The shared `conftest.py` boots a Next.js production server on
`localhost:3000` for the session via `subprocess.Popen` — which inherits
the parent process env by default — so exporting `EXERCISE_API_TOKEN` in
the shell that runs pytest causes the server to see the same value the
tests read here.

If `EXERCISE_API_TOKEN` is not set, every bearer-gated request would 503
("Server misconfigured: EXERCISE_API_TOKEN not set") instead of 401, which
masks the auth-gate behaviour we want to test. Rather than produce
unhelpful failures, the whole module is skipped in that case with a clear
"how to fix" reason.

Run locally:

    EXERCISE_API_TOKEN=test-token npm run test:e2e -- \\
        e2e/test_api_exercises.py e2e/test_api_mcp.py

CI: the workflow's `Run Playwright tests` step needs `EXERCISE_API_TOKEN`
in its `env:` block — until that lands, this module skips on CI too.

DB-dependent tests are individually gated on `POSTGRES_URL`; auth-gate and
shape tests run unconditionally because they don't reach the database.
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
EXERCISES = f"{BASE_URL}/api/exercises"

# Module-level skip when the bearer token isn't shared with the server.
# Without it the server returns 503 to every write, so the auth tests
# cannot distinguish a missing-bearer 401 from a misconfigured-server 503.
NO_TOKEN = os.environ.get("EXERCISE_API_TOKEN") is None
pytestmark = pytest.mark.skipif(
    NO_TOKEN,
    reason="EXERCISE_API_TOKEN must be set in the shell that spawns the "
    "Next.js server. Run with `EXERCISE_API_TOKEN=test-token "
    "npm run test:e2e -- e2e/test_api_exercises.py`.",
)

# Per-test skip for anything that touches Postgres.
NO_DB = os.environ.get("POSTGRES_URL") is None
NO_DB_REASON = "POSTGRES_URL not set; skipping DB-dependent test"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #


def _token() -> str:
    """The bearer token shared with the running Next.js server."""
    tok = os.environ.get("EXERCISE_API_TOKEN")
    assert tok, "EXERCISE_API_TOKEN unset (module-level skip should have fired)"
    return tok


def _request(
    method: str,
    url: str,
    *,
    body: Any = None,
    headers: dict[str, str] | None = None,
) -> tuple[int, dict[str, str], Any]:
    """Make an HTTP request, returning (status, headers, parsed_body).

    Catches `HTTPError` so non-2xx responses can be inspected like 2xx.
    """
    data = None
    final_headers = {**(headers or {})}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        final_headers.setdefault("Content-Type", "application/json")

    req = Request(url, data=data, method=method, headers=final_headers)
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


def _valid_exercise_body(eid: str = "test_e2e_pushup") -> dict[str, Any]:
    """A minimally-valid exercise payload that satisfies POST validation."""
    return {
        "id": eid,
        "name": "Test E2E Pushup",
        "category": "push",
        "rest": 90,
        "setup": "Test setup",
        "execution": "Test execution",
        "nwbCues": "Test cues",
        "why": "Test rationale",
        "safety": "safe",
        "requires": ["floor"],
        "swaps": [],
        "sets": [["3", "10"]],
        "constraints": {
            "requiresIliopsoas": False,
            "maxHipFlexion": 0,
            "requiresWeightBearing": False,
        },
    }


# --------------------------------------------------------------------------- #
# GET /api/exercises
# --------------------------------------------------------------------------- #


def test_get_exercises_responds_with_object_shape():
    """GET returns 200 (with DB) or 500 (DB absent), but always JSON shape."""
    status, _headers, body = _request("GET", EXERCISES)
    if NO_DB:
        # Without Postgres the route's try/catch returns a JSON 500.
        assert status in (200, 500), f"Unexpected status {status}: {body}"
        if status == 200:
            assert isinstance(body, dict) and "exercises" in body
        else:
            assert isinstance(body, dict) and "error" in body
    else:
        assert status == 200, f"Expected 200, got {status}: {body}"
        assert isinstance(body, dict) and "exercises" in body
        assert isinstance(body["exercises"], list)


def test_get_exercises_sets_cache_control_header():
    """200 GET responses carry `public, max-age=3600, stale-while-revalidate=…`."""
    status, headers, _body = _request("GET", EXERCISES)
    if status != 200:
        # Cache-Control is only set on the success branch of the route.
        # No DB locally → 500 → skip rather than assert against absence.
        pytest.skip(f"GET returned {status}; Cache-Control only set on 200 path")
    cc = headers.get("cache-control", "")
    assert "max-age=3600" in cc, f"Cache-Control missing max-age=3600: {cc!r}"
    assert "stale-while-revalidate" in cc, (
        f"Cache-Control missing stale-while-revalidate: {cc!r}"
    )


# --------------------------------------------------------------------------- #
# POST /api/exercises (auth gate + create)
# --------------------------------------------------------------------------- #


def test_post_exercises_without_bearer_returns_401():
    """Missing Authorization header → 401 with JSON error body."""
    status, _h, body = _request("POST", EXERCISES, body=_valid_exercise_body())
    assert status == 401, f"Expected 401, got {status}: {body}"
    assert isinstance(body, dict) and "error" in body


def test_post_exercises_with_wrong_bearer_returns_401():
    """Incorrect bearer token → 401."""
    status, _h, body = _request(
        "POST",
        EXERCISES,
        body=_valid_exercise_body(),
        headers={"Authorization": "Bearer not-the-real-token-aaaaaaaaaaaaaa"},
    )
    assert status == 401, f"Expected 401, got {status}: {body}"
    assert isinstance(body, dict) and "error" in body


def test_post_exercises_malformed_bearer_returns_401():
    """Auth header without 'Bearer ' prefix → 401."""
    status, _h, body = _request(
        "POST",
        EXERCISES,
        body=_valid_exercise_body(),
        headers={"Authorization": "Token foo"},
    )
    assert status == 401, f"Expected 401, got {status}: {body}"


@pytest.mark.skipif(NO_DB, reason=NO_DB_REASON)
def test_post_exercises_with_correct_bearer_creates_201():
    """Valid bearer + DB → 201 and an `exercise` payload echoed back."""
    body = _valid_exercise_body(eid="e2e_test_created")
    status, _h, resp = _request(
        "POST",
        EXERCISES,
        body=body,
        headers={"Authorization": f"Bearer {_token()}"},
    )
    try:
        assert status == 201, f"Expected 201, got {status}: {resp}"
        assert isinstance(resp, dict) and "exercise" in resp
        assert resp["exercise"]["id"] == "e2e_test_created"
        assert resp["exercise"]["name"] == "Test E2E Pushup"
    finally:
        # Best-effort cleanup so the row doesn't leak between runs.
        _request(
            "DELETE",
            f"{EXERCISES}/e2e_test_created",
            headers={"Authorization": f"Bearer {_token()}"},
        )


def test_post_exercises_invalid_body_returns_400_when_authed():
    """Valid bearer but missing required fields → 400 (no DB needed)."""
    status, _h, body = _request(
        "POST",
        EXERCISES,
        body={"id": "incomplete"},
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert status == 400, f"Expected 400, got {status}: {body}"
    assert isinstance(body, dict) and "error" in body


# --------------------------------------------------------------------------- #
# GET /api/exercises/[id]
# --------------------------------------------------------------------------- #


@pytest.mark.skipif(NO_DB, reason=NO_DB_REASON)
def test_get_missing_exercise_returns_404():
    """Slug that doesn't exist → 404 with error body."""
    status, _h, body = _request(
        "GET",
        f"{EXERCISES}/this-id-definitely-does-not-exist-123abc",
    )
    assert status == 404, f"Expected 404, got {status}: {body}"
    assert isinstance(body, dict) and "error" in body


# --------------------------------------------------------------------------- #
# PATCH /api/exercises/[id]
# --------------------------------------------------------------------------- #


def test_patch_without_bearer_returns_401():
    """PATCH without Authorization → 401."""
    status, _h, body = _request(
        "PATCH",
        f"{EXERCISES}/anything",
        body={"why": "updated reason"},
    )
    assert status == 401, f"Expected 401, got {status}: {body}"


@pytest.mark.skipif(NO_DB, reason=NO_DB_REASON)
def test_patch_with_bearer_updates_and_returns_200():
    """Round-trip: create, patch, fetch back, then delete."""
    eid = "e2e_test_patch"
    auth = {"Authorization": f"Bearer {_token()}"}
    try:
        status, _h, _ = _request(
            "POST", EXERCISES, body=_valid_exercise_body(eid=eid), headers=auth
        )
        assert status == 201, f"setup POST failed: {status}"
        status, _h, body = _request(
            "PATCH",
            f"{EXERCISES}/{eid}",
            body={"why": "patched-reason"},
            headers=auth,
        )
        assert status == 200, f"Expected 200, got {status}: {body}"
        assert isinstance(body, dict) and "exercise" in body
        assert body["exercise"]["why"] == "patched-reason"
    finally:
        _request("DELETE", f"{EXERCISES}/{eid}", headers=auth)


# --------------------------------------------------------------------------- #
# DELETE /api/exercises/[id]
# --------------------------------------------------------------------------- #


def test_delete_without_bearer_returns_401():
    """DELETE without Authorization → 401."""
    status, _h, body = _request("DELETE", f"{EXERCISES}/anything")
    assert status == 401, f"Expected 401, got {status}: {body}"


@pytest.mark.skipif(NO_DB, reason=NO_DB_REASON)
def test_delete_with_bearer_returns_200():
    """Create then delete; second delete returns 404 (already gone)."""
    eid = "e2e_test_delete"
    auth = {"Authorization": f"Bearer {_token()}"}
    status, _h, _ = _request(
        "POST", EXERCISES, body=_valid_exercise_body(eid=eid), headers=auth
    )
    assert status == 201, f"setup POST failed: {status}"
    status, _h, body = _request("DELETE", f"{EXERCISES}/{eid}", headers=auth)
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert isinstance(body, dict)
    assert body.get("ok") is True
    # Second delete: 404 (gone)
    status, _h, _body = _request("DELETE", f"{EXERCISES}/{eid}", headers=auth)
    assert status == 404, f"Expected 404 on second delete, got {status}"
