"""
Workout log CRUD endpoints.

- Authenticated: reads/writes from SQLite DB
- Unauthenticated: returns 401 (client falls back to localStorage)

POST   /workouts            → create/upsert a workout log
GET    /workouts             → list workout logs (recent first)
GET    /workouts/{id}        → get a single workout log
PUT    /workouts/{id}        → update exercises/completion
DELETE /workouts/{id}        → delete a workout log
GET    /workouts/prs         → get all personal records
"""

import json
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..auth import require_user
from ..database import get_db
from ..models import (
    ExerciseLogIn,
    PersonalRecordOut,
    UserOut,
    WorkoutLogIn,
    WorkoutLogOut,
)

router = APIRouter(prefix="/workouts", tags=["workouts"])


def _generate_id() -> str:
    import random
    import string
    return "".join(random.choices(string.ascii_letters + string.digits, k=12))


@router.post("", response_model=WorkoutLogOut)
async def create_workout(
    body: WorkoutLogIn,
    user: UserOut = Depends(require_user),
):
    """Create or upsert a workout log."""
    log_id = body.id or _generate_id()
    exercises_json = json.dumps([e.model_dump() for e in body.exercises])

    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO workout_logs
               (id, user_id, workout_key, workout_title, phase_index,
                started_at, completed_at, duration_seconds, exercises_json, source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET
                 exercises_json=excluded.exercises_json,
                 completed_at=excluded.completed_at,
                 duration_seconds=excluded.duration_seconds,
                 updated_at=datetime('now')
            """,
            (
                log_id, user.id, body.workout_key, body.workout_title,
                body.phase_index, body.started_at, body.completed_at,
                body.duration_seconds, exercises_json, body.source,
            ),
        )
        await db.commit()

        # Check for personal records if workout is completed
        if body.completed_at and body.exercises:
            await _check_prs(db, user.id, log_id, body.exercises, body.completed_at)

        cursor = await db.execute("SELECT * FROM workout_logs WHERE id=?", (log_id,))
        row = await cursor.fetchone()
        return _row_to_log(row)
    finally:
        await db.close()


@router.get("", response_model=list[WorkoutLogOut])
async def list_workouts(
    user: UserOut = Depends(require_user),
    limit: int = Query(default=30, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List workout logs, most recent first."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM workout_logs WHERE user_id=? ORDER BY started_at DESC LIMIT ? OFFSET ?",
            (user.id, limit, offset),
        )
        rows = await cursor.fetchall()
        return [_row_to_log(r) for r in rows]
    finally:
        await db.close()


@router.get("/prs", response_model=list[PersonalRecordOut])
async def list_prs(user: UserOut = Depends(require_user)):
    """Get all personal records for the user."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM personal_records WHERE user_id=? ORDER BY achieved_at DESC",
            (user.id,),
        )
        rows = await cursor.fetchall()
        return [
            PersonalRecordOut(
                id=r["id"],
                exercise_id=r["exercise_id"],
                exercise_name=r["exercise_name"],
                type=r["type"],
                value=r["value"],
                achieved_at=r["achieved_at"],
                workout_log_id=r["workout_log_id"],
            )
            for r in rows
        ]
    finally:
        await db.close()


@router.get("/{log_id}", response_model=WorkoutLogOut)
async def get_workout(log_id: str, user: UserOut = Depends(require_user)):
    """Get a single workout log."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM workout_logs WHERE id=? AND user_id=?",
            (log_id, user.id),
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Workout not found")
        return _row_to_log(row)
    finally:
        await db.close()


@router.put("/{log_id}", response_model=WorkoutLogOut)
async def update_workout(
    log_id: str,
    body: WorkoutLogIn,
    user: UserOut = Depends(require_user),
):
    """Update a workout log (exercises, completion)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM workout_logs WHERE id=? AND user_id=?",
            (log_id, user.id),
        )
        if not await cursor.fetchone():
            raise HTTPException(404, "Workout not found")

        exercises_json = json.dumps([e.model_dump() for e in body.exercises])
        await db.execute(
            """UPDATE workout_logs SET
                 exercises_json=?, completed_at=?, duration_seconds=?,
                 updated_at=datetime('now')
               WHERE id=? AND user_id=?""",
            (exercises_json, body.completed_at, body.duration_seconds, log_id, user.id),
        )
        await db.commit()

        if body.completed_at and body.exercises:
            await _check_prs(db, user.id, log_id, body.exercises, body.completed_at)

        cursor = await db.execute("SELECT * FROM workout_logs WHERE id=?", (log_id,))
        row = await cursor.fetchone()
        return _row_to_log(row)
    finally:
        await db.close()


@router.delete("/{log_id}")
async def delete_workout(log_id: str, user: UserOut = Depends(require_user)):
    """Delete a workout log."""
    db = await get_db()
    try:
        await db.execute(
            "DELETE FROM workout_logs WHERE id=? AND user_id=?",
            (log_id, user.id),
        )
        await db.commit()
        return {"ok": True}
    finally:
        await db.close()


# ── Helpers ──

def _row_to_log(row) -> WorkoutLogOut:
    exercises = json.loads(row["exercises_json"]) if row["exercises_json"] else []
    return WorkoutLogOut(
        id=row["id"],
        workout_key=row["workout_key"],
        workout_title=row["workout_title"],
        phase_index=row["phase_index"],
        started_at=row["started_at"],
        completed_at=row["completed_at"],
        duration_seconds=row["duration_seconds"],
        exercises=exercises,
        synced_to_hevy=bool(row["synced_to_hevy"]),
        source=row["source"],
        created_at=row["created_at"],
    )


async def _check_prs(
    db,
    user_id: int,
    log_id: str,
    exercises: list[ExerciseLogIn],
    completed_at: int,
):
    """Detect and upsert personal records from a completed workout."""
    for ex in exercises:
        completed_sets = [s for s in ex.sets if s.completed]
        if not completed_sets:
            continue

        # Max weight
        weights = [s.weight_kg for s in completed_sets if s.weight_kg and s.weight_kg > 0]
        if weights:
            max_w = max(weights)
            pr_id = f"{ex.exercise_id}_max_weight"
            cursor = await db.execute(
                "SELECT value FROM personal_records WHERE id=? AND user_id=?",
                (pr_id, user_id),
            )
            existing = await cursor.fetchone()
            if not existing or max_w > existing["value"]:
                await db.execute(
                    """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                       VALUES (?,?,?,?,?,?,?,?)
                       ON CONFLICT(id) DO UPDATE SET value=excluded.value, achieved_at=excluded.achieved_at, workout_log_id=excluded.workout_log_id""",
                    (pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_weight", max_w, completed_at, log_id),
                )

        # Max reps
        reps_list = [s.reps for s in completed_sets if s.reps and s.reps > 0]
        if reps_list:
            max_r = max(reps_list)
            pr_id = f"{ex.exercise_id}_max_reps"
            cursor = await db.execute(
                "SELECT value FROM personal_records WHERE id=? AND user_id=?",
                (pr_id, user_id),
            )
            existing = await cursor.fetchone()
            if not existing or max_r > existing["value"]:
                await db.execute(
                    """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                       VALUES (?,?,?,?,?,?,?,?)
                       ON CONFLICT(id) DO UPDATE SET value=excluded.value, achieved_at=excluded.achieved_at, workout_log_id=excluded.workout_log_id""",
                    (pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_reps", float(max_r), completed_at, log_id),
                )

        # Max volume (weight * reps)
        volumes = [
            (s.weight_kg or 0) * (s.reps or 0)
            for s in completed_sets
            if s.weight_kg and s.reps
        ]
        if volumes:
            max_v = max(volumes)
            if max_v > 0:
                pr_id = f"{ex.exercise_id}_max_volume"
                cursor = await db.execute(
                    "SELECT value FROM personal_records WHERE id=? AND user_id=?",
                    (pr_id, user_id),
                )
                existing = await cursor.fetchone()
                if not existing or max_v > existing["value"]:
                    await db.execute(
                        """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                           VALUES (?,?,?,?,?,?,?,?)
                           ON CONFLICT(id) DO UPDATE SET value=excluded.value, achieved_at=excluded.achieved_at, workout_log_id=excluded.workout_log_id""",
                        (pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_volume", max_v, completed_at, log_id),
                    )

    await db.commit()
