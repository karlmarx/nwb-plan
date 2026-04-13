"""
GitHub OAuth + token management.

Flow:
1. Client opens: GET /auth/github → redirect to GitHub authorize URL
2. GitHub redirects: GET /auth/callback?code=xxx → exchange for access token
3. Backend fetches GitHub user profile → upsert in SQLite
4. Backend issues a signed token → redirects client with token
5. Client stores token, sends in Authorization header for all API calls

The callback URL is me.93.fyi/auth/callback — configure this in your
GitHub OAuth App settings at https://github.com/settings/developers

Token format: HMAC-signed JSON (stdlib only, no PyJWT dependency).
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import get_db
from .models import UserOut

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
TOKEN_EXPIRY_DAYS = 90  # Long-lived for mobile apps

security = HTTPBearer(auto_error=False)


# ── Token helpers (stdlib-only, no PyJWT) ──

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * padding)


def create_token(user_id: int, github_id: int, username: str) -> str:
    """Create an HMAC-signed token."""
    payload = {
        "sub": user_id,
        "github_id": github_id,
        "username": username,
        "iat": int(time.time()),
        "exp": int(time.time()) + (TOKEN_EXPIRY_DAYS * 86400),
    }
    payload_b64 = _b64encode(json.dumps(payload).encode())
    sig = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def decode_token(token: str) -> dict:
    """Verify and decode a token. Raises HTTPException on failure."""
    parts = token.split(".")
    if len(parts) != 2:
        raise HTTPException(401, "Invalid token format")

    payload_b64, sig = parts
    expected = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(sig, expected):
        raise HTTPException(401, "Invalid token signature")

    try:
        payload = json.loads(_b64decode(payload_b64))
    except Exception:
        raise HTTPException(401, "Malformed token")

    if payload.get("exp", 0) < time.time():
        raise HTTPException(401, "Token expired — please log in again")

    return payload


# ── GitHub OAuth ──

def create_github_auth_url(redirect_uri: str) -> str:
    return (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=read:user"
    )


async def exchange_code_for_token(code: str) -> str:
    """Exchange GitHub OAuth code for an access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        data = resp.json()
        if "access_token" not in data:
            raise HTTPException(400, f"GitHub OAuth failed: {data.get('error_description', 'unknown')}")
        return data["access_token"]


async def fetch_github_user(access_token: str) -> dict:
    """Fetch GitHub user profile with the OAuth token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to fetch GitHub user")
        return resp.json()


async def upsert_user(github_id: int, username: str, avatar_url: str) -> int:
    """Create or update user in SQLite. Returns user ID."""
    db = await get_db()
    try:
        await db.execute(
            "UPDATE users SET username=?, avatar_url=?, updated_at=datetime('now') WHERE github_id=?",
            (username, avatar_url, github_id),
        )
        cursor = await db.execute("SELECT id FROM users WHERE github_id=?", (github_id,))
        row = await cursor.fetchone()

        if row:
            await db.commit()
            return row["id"]

        cursor = await db.execute(
            "INSERT INTO users (github_id, username, avatar_url) VALUES (?, ?, ?)",
            (github_id, username, avatar_url),
        )
        await db.commit()
        return cursor.lastrowid
    finally:
        await db.close()


# ── FastAPI dependencies ──

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[UserOut]:
    """
    Returns the current user or None.
    None = not logged in — caller decides whether to allow anonymous access.
    """
    if credentials is None:
        return None

    payload = decode_token(credentials.credentials)
    user_id = payload["sub"]

    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id=?", (user_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        return UserOut(
            id=row["id"],
            github_id=row["github_id"],
            username=row["username"],
            avatar_url=row["avatar_url"],
            has_hevy_key=bool(row["hevy_api_key"]),
        )
    finally:
        await db.close()


async def require_user(
    user: Optional[UserOut] = Depends(get_current_user),
) -> UserOut:
    """Requires authentication. 401 if not logged in."""
    if user is None:
        raise HTTPException(401, "Login required")
    return user
