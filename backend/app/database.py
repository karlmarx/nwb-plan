"""
Neon Postgres database via asyncpg.
Free tier: 512MB storage, always on, connection pooling built in.

Set DATABASE_URL in your environment:
  DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
"""

import os
from contextlib import asynccontextmanager

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    github_id    INTEGER UNIQUE NOT NULL,
    username     TEXT NOT NULL,
    avatar_url   TEXT,
    hevy_api_key TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_logs (
    id               TEXT PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id),
    workout_key      TEXT NOT NULL,
    workout_title    TEXT NOT NULL,
    phase_index      INTEGER NOT NULL,
    started_at       BIGINT NOT NULL,
    completed_at     BIGINT,
    duration_seconds INTEGER,
    exercises_json   TEXT NOT NULL DEFAULT '[]',
    synced_to_hevy   BOOLEAN DEFAULT FALSE,
    source           TEXT DEFAULT 'phone',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_records (
    id             TEXT PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id),
    exercise_id    TEXT NOT NULL,
    exercise_name  TEXT NOT NULL,
    type           TEXT NOT NULL,
    value          DOUBLE PRECISION NOT NULL,
    achieved_at    BIGINT NOT NULL,
    workout_log_id TEXT REFERENCES workout_logs(id)
);

CREATE INDEX IF NOT EXISTS idx_logs_user ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_started ON workout_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_prs_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_prs_exercise ON personal_records(exercise_id);
"""

_pool: asyncpg.Pool | None = None


async def init_db():
    """Create connection pool and run schema migration."""
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with _pool.acquire() as conn:
        await conn.execute(SCHEMA)


async def close_db():
    """Close connection pool on shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> asyncpg.Connection:
    """Acquire a connection from the pool."""
    if _pool is None:
        raise RuntimeError("Database not initialized — call init_db() first")
    return await _pool.acquire()


async def release_db(conn: asyncpg.Connection):
    """Release a connection back to the pool."""
    if _pool:
        await _pool.release(conn)
