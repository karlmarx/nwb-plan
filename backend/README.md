# NWB Workout API — Python Backend

FastAPI backend for the NWB Watch/Phone workout tracker.
Zero cost: SQLite database, GitHub OAuth, deployable on any free tier.

## Features

- **GitHub OAuth** via `me.93.fyi` — login on phone, token shared to watch
- **Workout log CRUD** — create, read, update, delete workout sessions
- **Personal records** — auto-detected on workout completion (max weight, max reps, max volume)
- **Hevy sync** — push completed workouts to Hevy API (requires Hevy API key)
- **SQLite** — zero-cost file database, no external service needed

## Setup

```bash
cd backend
cp .env.example .env   # Edit with your GitHub OAuth credentials
uv run uvicorn app.main:app --reload --port 8000
```

`uv` auto-creates the venv and installs deps on first run.

Then open http://localhost:8000/docs for the interactive API docs.

## GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create a new OAuth App:
   - **Application name**: NWB Workout
   - **Homepage URL**: https://nfit.93.fyi
   - **Authorization callback URL**: https://me.93.fyi/auth/callback
3. Copy Client ID and Client Secret to `.env`

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

## Auth Flow (Mobile)

1. Phone app opens `https://me.93.fyi/auth/github?redirect=nwb://auth`
2. User authorizes on GitHub
3. Callback redirects to `nwb://auth?token=xxx`
4. Phone app captures deep link, stores token
5. Token shared to watch via Wear Data Layer

## Deployment (Free)

**Render.com** (recommended):
- New Web Service → connect repo → set root to `backend/`
- Build: `pip -m ensurepip && pip install uv && uv sync --no-dev`
- Start: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars from `.env.example`
- Custom domain: `me.93.fyi` → CNAME to `<service>.onrender.com`
- Free tier sleeps after 15min inactivity (fine for personal use)

**fly.io**:
```bash
cd backend
fly launch   # Uses the Dockerfile
fly secrets set GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx JWT_SECRET=xxx
```

## Cost

$0. SQLite is a file. Python runs anywhere. GitHub OAuth is free.
