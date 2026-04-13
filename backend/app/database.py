"""
SQLite database via aiosqlite. Zero cost, zero external services.
DB file lives at ./nwb_workout.db (gitignored).
"""

import aiosqlite
import os
from pathlib import Path

DB_PATH = os.getenv("DATABASE_PATH", str(Path(__file__).parent.parent / "nwb_workout.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    github_id   INTEGER UNIQUE NOT NULL,
    username    TEXT NOT NULL,
    avatar_url  TEXT,
    hevy_api_key TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_logs (
    id              TEXT PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    workout_key     TEXT NOT NULL,
    workout_title   TEXT NOT NULL,
    phase_index     INTEGER NOT NULL,
    started_at      INTEGER NOT NULL,
    completed_at    INTEGER,
    duration_seconds INTEGER,
    exercises_json  TEXT NOT NULL DEFAULT '[]',
    synced_to_hevy  INTEGER DEFAULT 0,
    source          TEXT DEFAULT 'phone',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS personal_records (
    id              TEXT PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    exercise_id     TEXT NOT NULL,
    exercise_name   TEXT NOT NULL,
    type            TEXT NOT NULL,
    value           REAL NOT NULL,
    achieved_at     INTEGER NOT NULL,
    workout_log_id  TEXT REFERENCES workout_logs(id)
);

CREATE INDEX IF NOT EXISTS idx_logs_user ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_started ON workout_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_prs_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_prs_exercise ON personal_records(exercise_id);
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    db = await get_db()
    try:
        await db.executescript(SCHEMA)
        await db.commit()
    finally:
        await db.close()
