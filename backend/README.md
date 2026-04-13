# NWB Workout API — Python Backend

FastAPI backend for the NWB Watch/Phone workout tracker.
Neon Postgres (free tier) + GitHub OAuth + Render.com deployment.

## Stack (all free)

| Layer | Service | Cost |
|-------|---------|------|
| API | FastAPI on Render.com | Free |
| Database | Neon Postgres (512MB) | Free |
| Auth | GitHub OAuth | Free |

## Local Dev

```bash
cd backend
cp .env.example .env   # Fill in DATABASE_URL + GitHub OAuth creds
uv run uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for Swagger UI.

## Neon Setup

1. Go to https://neon.tech → sign up (free)
2. Create a project (any region)
3. Copy the connection string from the dashboard
4. Paste into `DATABASE_URL` in your `.env` / Render env vars

Tables are created automatically on first startup.

## GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create a new OAuth App:
   - **Application name**: NWB Workout
   - **Homepage URL**: https://nfit.93.fyi
   - **Authorization callback URL**: https://me.93.fyi/auth/callback
3. Copy Client ID and Client Secret to env vars

## Render Deployment

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Runtime** | Python |
| **Build Command** | `pip install uv && uv sync --no-dev` |
| **Start Command** | `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Branch** | `claude/hevy-features-sync` |

Environment variables:
```
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
AUTH_CALLBACK_URL=https://me.93.fyi/auth/callback
JWT_SECRET=<python -c "import secrets; print(secrets.token_hex(32))">
FRONTEND_URL=https://nfit.93.fyi
```

Custom domain: add `me.93.fyi` in Render settings, CNAME to `<service>.onrender.com`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth/github` | No | Start GitHub OAuth flow |
| GET | `/auth/callback` | No | GitHub OAuth callback |
| GET | `/auth/me` | Yes | Current user info |
| PUT | `/auth/hevy-key` | Yes | Store Hevy API key |
| POST | `/workouts` | Yes | Create/upsert workout log |
| GET | `/workouts` | Yes | List recent workouts |
| GET | `/workouts/{id}` | Yes | Get single workout |
| PUT | `/workouts/{id}` | Yes | Update workout |
| DELETE | `/workouts/{id}` | Yes | Delete workout |
| GET | `/workouts/prs` | Yes | List personal records |
| POST | `/sync/hevy` | Yes | Push workouts to Hevy |
| GET | `/health` | No | Health check |
