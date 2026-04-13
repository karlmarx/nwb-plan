"""
NWB Workout API — FastAPI backend.

- GitHub OAuth via me.93.fyi
- SQLite database (zero cost)
- Workout log CRUD + personal records
- Hevy API sync for authenticated users

Run locally:
    cd backend && uvicorn app.main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routes import auth, sync, workouts

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nfit.93.fyi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database
    await init_db()
    yield
    # Shutdown: nothing to clean up (SQLite handles itself)


app = FastAPI(
    title="NWB Workout API",
    description="Backend for NWB Watch/Phone workout tracking with GitHub auth and Hevy sync.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the PWA, phone app, and watch app to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "https://nfit.93.fyi",
        "https://me.93.fyi",
        "http://localhost:3000",  # Next.js dev
        "http://localhost:8000",  # FastAPI dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(sync.router)


@app.get("/")
async def root():
    return {
        "name": "NWB Workout API",
        "version": "1.0.0",
        "docs": "/docs",
        "auth": "/auth/github",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
