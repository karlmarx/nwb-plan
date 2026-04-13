"""
GitHub OAuth + token management.

Flow:
1. Client opens: GET /auth/github → redirect to GitHub authorize URL
2. GitHub redirects: GET /auth/callback?code=xxx → exchange for access token
3. Backend fetches GitHub user profile → upsert in Postgres
4. Backend issues a signed token → redirects client with token
5. Client stores token, sends in Authorization header for all API calls

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

from .database import get_db, release_db
from .models import UserOut

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
TOKEN_EXPIRY_DAYS = 90

security = HTTPBearer(auto_error=False)


# ── Token helpers (stdlib-only) ──

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * padding)


def create_token(user_id: int, github_id: int, username: str) -> str:
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
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to fetch GitHub user")
        return resp.json()


async def upsert_user(github_id: int, username: str, avatar_url: str) -> int:
    """Create or update user in Postgres. Returns user ID."""
    conn = await get_db()
    try:
        # Try update first
        await conn.execute(
            "UPDATE users SET username=$1, avatar_url=$2, updated_at=NOW() WHERE github_id=$3",
            username, avatar_url, github_id,
        )
        row = await conn.fetchrow("SELECT id FROM users WHERE github_id=$1", github_id)

        if row:
            return row["id"]

        # Insert new user
        row = await conn.fetchrow(
            "INSERT INTO users (github_id, username, avatar_url) VALUES ($1, $2, $3) RETURNING id",
            github_id, username, avatar_url,
        )
        return row["id"]
    finally:
        await release_db(conn)


# ── FastAPI dependencies ──

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[UserOut]:
    if credentials is None:
        return None

    payload = decode_token(credentials.credentials)
    user_id = payload["sub"]

    conn = await get_db()
    try:
        row = await conn.fetchrow("SELECT * FROM users WHERE id=$1", user_id)
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
        await release_db(conn)


async def require_user(
    user: Optional[UserOut] = Depends(get_current_user),
) -> UserOut:
    if user is None:
        raise HTTPException(401, "Login required")
    return user
