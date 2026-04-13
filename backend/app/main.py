"""
NWB Workout API — FastAPI backend.

- GitHub OAuth via me.93.fyi
- Neon Postgres (free tier, 512MB)
- Workout log CRUD + personal records
- Hevy API sync for authenticated users

Run locally:
    cd backend && uv run uvicorn app.main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db, close_db
from .routes import auth, sync, workouts

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nfit.93.fyi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="NWB Workout API",
    description="Backend for NWB Watch/Phone workout tracking with GitHub auth and Hevy sync.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "https://nfit.93.fyi",
        "https://me.93.fyi",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(sync.router)


@app.get("/")
async def root():
    return {
        "name": "NWB Workout API",
        "version": "1.0.0",
        "db": "neon-postgres",
        "docs": "/docs",
        "auth": "/auth/github",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
