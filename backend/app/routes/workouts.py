"""
Workout log CRUD endpoints.

- Authenticated: reads/writes from Neon Postgres
- Unauthenticated: returns 401 (client falls back to local storage)

POST   /workouts            → create/upsert a workout log
GET    /workouts             → list workout logs (recent first)
GET    /workouts/{id}        → get a single workout log
PUT    /workouts/{id}        → update exercises/completion
DELETE /workouts/{id}        → delete a workout log
GET    /workouts/prs         → get all personal records
"""

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..auth import require_user
from ..database import get_db, release_db
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
    log_id = body.id or _generate_id()
    exercises_json = json.dumps([e.model_dump() for e in body.exercises])

    conn = await get_db()
    try:
        await conn.execute(
            """INSERT INTO workout_logs
               (id, user_id, workout_key, workout_title, phase_index,
                started_at, completed_at, duration_seconds, exercises_json, source)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
               ON CONFLICT(id) DO UPDATE SET
                 exercises_json=EXCLUDED.exercises_json,
                 completed_at=EXCLUDED.completed_at,
                 duration_seconds=EXCLUDED.duration_seconds,
                 updated_at=NOW()
            """,
            log_id, user.id, body.workout_key, body.workout_title,
            body.phase_index, body.started_at, body.completed_at,
            body.duration_seconds, exercises_json, body.source,
        )

        if body.completed_at and body.exercises:
            await _check_prs(conn, user.id, log_id, body.exercises, body.completed_at)

        row = await conn.fetchrow("SELECT * FROM workout_logs WHERE id=$1", log_id)
        return _row_to_log(row)
    finally:
        await release_db(conn)


@router.get("", response_model=list[WorkoutLogOut])
async def list_workouts(
    user: UserOut = Depends(require_user),
    limit: int = Query(default=30, le=100),
    offset: int = Query(default=0, ge=0),
):
    conn = await get_db()
    try:
        rows = await conn.fetch(
            "SELECT * FROM workout_logs WHERE user_id=$1 ORDER BY started_at DESC LIMIT $2 OFFSET $3",
            user.id, limit, offset,
        )
        return [_row_to_log(r) for r in rows]
    finally:
        await release_db(conn)


@router.get("/prs", response_model=list[PersonalRecordOut])
async def list_prs(user: UserOut = Depends(require_user)):
    conn = await get_db()
    try:
        rows = await conn.fetch(
            "SELECT * FROM personal_records WHERE user_id=$1 ORDER BY achieved_at DESC",
            user.id,
        )
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
        await release_db(conn)


@router.get("/{log_id}", response_model=WorkoutLogOut)
async def get_workout(log_id: str, user: UserOut = Depends(require_user)):
    conn = await get_db()
    try:
        row = await conn.fetchrow(
            "SELECT * FROM workout_logs WHERE id=$1 AND user_id=$2",
            log_id, user.id,
        )
        if not row:
            raise HTTPException(404, "Workout not found")
        return _row_to_log(row)
    finally:
        await release_db(conn)


@router.put("/{log_id}", response_model=WorkoutLogOut)
async def update_workout(
    log_id: str,
    body: WorkoutLogIn,
    user: UserOut = Depends(require_user),
):
    conn = await get_db()
    try:
        row = await conn.fetchrow(
            "SELECT id FROM workout_logs WHERE id=$1 AND user_id=$2",
            log_id, user.id,
        )
        if not row:
            raise HTTPException(404, "Workout not found")

        exercises_json = json.dumps([e.model_dump() for e in body.exercises])
        await conn.execute(
            """UPDATE workout_logs SET
                 exercises_json=$1, completed_at=$2, duration_seconds=$3,
                 updated_at=NOW()
               WHERE id=$4 AND user_id=$5""",
            exercises_json, body.completed_at, body.duration_seconds, log_id, user.id,
        )

        if body.completed_at and body.exercises:
            await _check_prs(conn, user.id, log_id, body.exercises, body.completed_at)

        row = await conn.fetchrow("SELECT * FROM workout_logs WHERE id=$1", log_id)
        return _row_to_log(row)
    finally:
        await release_db(conn)


@router.delete("/{log_id}")
async def delete_workout(log_id: str, user: UserOut = Depends(require_user)):
    conn = await get_db()
    try:
        await conn.execute(
            "DELETE FROM workout_logs WHERE id=$1 AND user_id=$2",
            log_id, user.id,
        )
        return {"ok": True}
    finally:
        await release_db(conn)


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
        created_at=str(row["created_at"]) if row["created_at"] else None,
    )


async def _check_prs(conn, user_id: int, log_id: str, exercises: list[ExerciseLogIn], completed_at: int):
    for ex in exercises:
        completed_sets = [s for s in ex.sets if s.completed]
        if not completed_sets:
            continue

        # Max weight
        weights = [s.weight_kg for s in completed_sets if s.weight_kg and s.weight_kg > 0]
        if weights:
            max_w = max(weights)
            pr_id = f"{ex.exercise_id}_max_weight"
            existing = await conn.fetchrow(
                "SELECT value FROM personal_records WHERE id=$1 AND user_id=$2",
                pr_id, user_id,
            )
            if not existing or max_w > existing["value"]:
                await conn.execute(
                    """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                       ON CONFLICT(id) DO UPDATE SET value=EXCLUDED.value, achieved_at=EXCLUDED.achieved_at, workout_log_id=EXCLUDED.workout_log_id""",
                    pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_weight", max_w, completed_at, log_id,
                )

        # Max reps
        reps_list = [s.reps for s in completed_sets if s.reps and s.reps > 0]
        if reps_list:
            max_r = max(reps_list)
            pr_id = f"{ex.exercise_id}_max_reps"
            existing = await conn.fetchrow(
                "SELECT value FROM personal_records WHERE id=$1 AND user_id=$2",
                pr_id, user_id,
            )
            if not existing or max_r > existing["value"]:
                await conn.execute(
                    """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                       ON CONFLICT(id) DO UPDATE SET value=EXCLUDED.value, achieved_at=EXCLUDED.achieved_at, workout_log_id=EXCLUDED.workout_log_id""",
                    pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_reps", float(max_r), completed_at, log_id,
                )

        # Max volume
        volumes = [(s.weight_kg or 0) * (s.reps or 0) for s in completed_sets if s.weight_kg and s.reps]
        if volumes:
            max_v = max(volumes)
            if max_v > 0:
                pr_id = f"{ex.exercise_id}_max_volume"
                existing = await conn.fetchrow(
                    "SELECT value FROM personal_records WHERE id=$1 AND user_id=$2",
                    pr_id, user_id,
                )
                if not existing or max_v > existing["value"]:
                    await conn.execute(
                        """INSERT INTO personal_records (id, user_id, exercise_id, exercise_name, type, value, achieved_at, workout_log_id)
                           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                           ON CONFLICT(id) DO UPDATE SET value=EXCLUDED.value, achieved_at=EXCLUDED.achieved_at, workout_log_id=EXCLUDED.workout_log_id""",
                        pr_id, user_id, ex.exercise_id, ex.exercise_name, "max_volume", max_v, completed_at, log_id,
                    )
