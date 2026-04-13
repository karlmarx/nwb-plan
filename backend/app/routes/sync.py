"""
Hevy sync endpoint — pushes completed workouts to Hevy API.
Requires authentication + stored Hevy API key.

POST /sync/hevy  → sync unsynced (or specified) workout logs to Hevy
"""

import json
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..database import get_db, release_db
from ..models import HevySyncRequest, UserOut

router = APIRouter(prefix="/sync", tags=["sync"])

HEVY_BASE = "https://api.hevyapp.com/v1"


@router.post("/hevy")
async def sync_to_hevy(
    body: HevySyncRequest,
    user: UserOut = Depends(require_user),
):
    conn = await get_db()
    try:
        row = await conn.fetchrow("SELECT hevy_api_key FROM users WHERE id=$1", user.id)
        if not row or not row["hevy_api_key"]:
            raise HTTPException(400, "No Hevy API key configured. Go to Settings to add one.")

        hevy_key = row["hevy_api_key"]

        if body.workout_log_ids:
            logs = await conn.fetch(
                "SELECT * FROM workout_logs WHERE id = ANY($1) AND user_id=$2 AND completed_at IS NOT NULL",
                body.workout_log_ids, user.id,
            )
        else:
            logs = await conn.fetch(
                "SELECT * FROM workout_logs WHERE user_id=$1 AND synced_to_hevy=FALSE AND completed_at IS NOT NULL ORDER BY started_at",
                user.id,
            )

        if not logs:
            return {"synced": 0, "message": "No workouts to sync"}

        synced = 0
        errors = []

        async with httpx.AsyncClient() as client:
            for log in logs:
                exercises_data = json.loads(log["exercises_json"]) if log["exercises_json"] else []
                hevy_workout = _convert_to_hevy(log, exercises_data)

                try:
                    resp = await client.post(
                        f"{HEVY_BASE}/workouts",
                        json=hevy_workout,
                        headers={"api-key": hevy_key, "Content-Type": "application/json"},
                    )
                    if resp.status_code in (200, 201):
                        await conn.execute(
                            "UPDATE workout_logs SET synced_to_hevy=TRUE, updated_at=NOW() WHERE id=$1",
                            log["id"],
                        )
                        synced += 1
                    else:
                        errors.append(f"{log['id']}: HTTP {resp.status_code}")
                except Exception as e:
                    errors.append(f"{log['id']}: {str(e)}")

        result = {"synced": synced, "total": len(logs)}
        if errors:
            result["errors"] = errors
        return result
    finally:
        await release_db(conn)


def _convert_to_hevy(log, exercises_data: list[dict]) -> dict:
    hevy_exercises = []
    for idx, ex in enumerate(exercises_data):
        sets = []
        for s_idx, s in enumerate(ex.get("sets", [])):
            if not s.get("completed"):
                continue
            hevy_set = {"index": s_idx, "type": s.get("type", "weight_reps")}
            if s.get("weight_kg") is not None:
                hevy_set["weight_kg"] = s["weight_kg"]
            if s.get("reps") is not None:
                hevy_set["reps"] = s["reps"]
            if s.get("duration_seconds") is not None:
                hevy_set["duration_seconds"] = s["duration_seconds"]
            sets.append(hevy_set)

        if not sets:
            continue

        hevy_ex = {
            "index": idx,
            "title": ex.get("exercise_name", ""),
            "notes": ex.get("notes", ""),
            "sets": sets,
        }
        if ex.get("hevy_template_id"):
            hevy_ex["exercise_template_id"] = ex["hevy_template_id"]
        hevy_exercises.append(hevy_ex)

    start_iso = datetime.fromtimestamp(log["started_at"] / 1000, tz=timezone.utc).isoformat()
    end_iso = datetime.fromtimestamp((log["completed_at"] or log["started_at"]) / 1000, tz=timezone.utc).isoformat()

    return {
        "title": log["workout_title"],
        "description": f"NWB · Phase {log['phase_index'] + 1} · via {log['source']}",
        "start_time": start_iso,
        "end_time": end_iso,
        "exercises": hevy_exercises,
    }
