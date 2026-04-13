"""
Auth routes: GitHub OAuth login + callback + user info.

GET /auth/github         → redirect to GitHub authorize page
GET /auth/callback       → handle GitHub callback, issue JWT
GET /auth/me             → current user info (requires auth)
PUT /auth/hevy-key       → store Hevy API key (requires auth)
"""

import os
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import RedirectResponse

from ..auth import (
    create_github_auth_url,
    create_token,
    exchange_code_for_token,
    fetch_github_user,
    require_user,
    upsert_user,
)
from ..database import get_db
from ..models import HevyKeyUpdate, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nfit.93.fyi")
AUTH_CALLBACK_URL = os.getenv("AUTH_CALLBACK_URL", "https://me.93.fyi/auth/callback")


@router.get("/github")
async def github_login(
    redirect: str = Query(default=None, description="Where to redirect after login"),
):
    """
    Start GitHub OAuth flow.
    Opens in a browser (phone Custom Tab or watch companion browser).
    """
    auth_url = create_github_auth_url(AUTH_CALLBACK_URL)
    if redirect:
        # Encode the final redirect destination in state param
        auth_url += f"&state={redirect}"
    return RedirectResponse(auth_url)


@router.get("/callback")
async def github_callback(
    code: str = Query(...),
    state: str = Query(default=None),
):
    """
    GitHub redirects here with an auth code.
    Exchange it for a user profile, create JWT, redirect client.
    """
    # Exchange code for GitHub access token
    access_token = await exchange_code_for_token(code)

    # Fetch GitHub user profile
    gh_user = await fetch_github_user(access_token)
    github_id = gh_user["id"]
    username = gh_user["login"]
    avatar_url = gh_user.get("avatar_url", "")

    # Upsert user in our DB
    user_id = await upsert_user(github_id, username, avatar_url)

    # Create JWT
    token = create_token(user_id, github_id, username)

    # Redirect based on where the request came from
    if state and state.startswith("nwb://"):
        # Mobile deep link — redirect to app with token
        return RedirectResponse(f"{state}?token={token}")

    # Web redirect — send token as URL param for the frontend to capture
    redirect_url = state or FRONTEND_URL
    return RedirectResponse(f"{redirect_url}?token={token}")


@router.get("/me", response_model=UserOut)
async def get_me(user: UserOut = Depends(require_user)):
    """Get current authenticated user."""
    return user


@router.put("/hevy-key")
async def update_hevy_key(
    body: HevyKeyUpdate,
    user: UserOut = Depends(require_user),
):
    """Store or update the user's Hevy API key."""
    db = await get_db()
    try:
        await db.execute(
            "UPDATE users SET hevy_api_key=?, updated_at=datetime('now') WHERE id=?",
            (body.hevy_api_key, user.id),
        )
        await db.commit()
        return {"ok": True}
    finally:
        await db.close()
