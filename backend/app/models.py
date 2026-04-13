"""Pydantic models for request/response validation."""

from pydantic import BaseModel
from typing import Optional


# ── Auth ──

class UserOut(BaseModel):
    id: int
    github_id: int
    username: str
    avatar_url: Optional[str] = None
    has_hevy_key: bool = False


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Workout Logging ──

class SetLogIn(BaseModel):
    index: int
    type: str = "weight_reps"
    weight_kg: Optional[float] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    completed: bool = False
    is_personal_record: bool = False
    timestamp: Optional[int] = None


class ExerciseLogIn(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: list[SetLogIn] = []
    notes: str = ""
    hevy_template_id: Optional[str] = None


class WorkoutLogIn(BaseModel):
    id: Optional[str] = None
    workout_key: str
    workout_title: str
    phase_index: int
    started_at: int
    completed_at: Optional[int] = None
    duration_seconds: Optional[int] = None
    exercises: list[ExerciseLogIn] = []
    source: str = "phone"


class WorkoutLogOut(BaseModel):
    id: str
    workout_key: str
    workout_title: str
    phase_index: int
    started_at: int
    completed_at: Optional[int] = None
    duration_seconds: Optional[int] = None
    exercises: list[dict] = []
    synced_to_hevy: bool = False
    source: str = "phone"
    created_at: Optional[str] = None


class PersonalRecordOut(BaseModel):
    id: str
    exercise_id: str
    exercise_name: str
    type: str
    value: float
    achieved_at: int
    workout_log_id: Optional[str] = None


# ── Hevy ──

class HevySyncRequest(BaseModel):
    workout_log_ids: Optional[list[str]] = None  # None = sync all unsynced


class HevyKeyUpdate(BaseModel):
    hevy_api_key: str
