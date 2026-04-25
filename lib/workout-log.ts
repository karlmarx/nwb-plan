// Set/rep tracking data model + localStorage helpers.
// Persists workout sessions across page reloads. No backend yet.

import { loadState, saveState } from "./storage";

export interface LoggedSet {
  /** Set ordinal within the exercise (1-indexed). */
  n: number;
  /** Weight in lbs. Empty / 0 = bodyweight or unloaded. */
  weight: number;
  /** Reps performed. Use 0 + duration for time-based sets. */
  reps: number;
  /** Optional duration in seconds for isometric / timed sets. */
  durationSec?: number;
  /** Free-text per-set note (RPE, "neutral grip", pain notes, etc). */
  note?: string;
  /** Epoch ms when the set was completed. */
  completedAt: number;
}

export interface LoggedExercise {
  /** Stable exercise id from EX (e.g. "barbell_floor_press") or "custom:<slug>" for ad-hoc entries. */
  exerciseId: string;
  /** Display name at the time it was logged (preserves history if exercise is later renamed). */
  name: string;
  /** Variant id if a machine variant was active. */
  variantId?: string;
  sets: LoggedSet[];
  /** Free-text exercise-level note. */
  note?: string;
}

export interface WorkoutSession {
  /** Random id (timestamp + suffix). */
  id: string;
  /** Workout name from WORKOUTS, or free-text "Freestyle". */
  workoutKey: string;
  /** Epoch ms. */
  startedAt: number;
  /** Epoch ms or undefined while in-progress. */
  endedAt?: number;
  exercises: LoggedExercise[];
}

const SESSIONS_KEY = "workout-log:sessions";
const ACTIVE_KEY = "workout-log:active";
const PHOTOS_KEY = "equipment-photos";

export type EquipmentPhoto = {
  /** Exercise id this photo was captured against. */
  exerciseId: string;
  /** Data URL (base64). */
  dataUrl: string;
  /** Epoch ms. */
  capturedAt: number;
  /** Optional bucket label assigned later. */
  bucket?: string;
};

export function loadSessions(): WorkoutSession[] {
  return loadState<WorkoutSession[]>(SESSIONS_KEY, []);
}

export function saveSessions(sessions: WorkoutSession[]): void {
  saveState(SESSIONS_KEY, sessions);
}

export function loadActiveSession(): WorkoutSession | null {
  return loadState<WorkoutSession | null>(ACTIVE_KEY, null);
}

export function saveActiveSession(session: WorkoutSession | null): void {
  saveState(ACTIVE_KEY, session);
}

/** Find or create the LoggedExercise entry inside the active session. */
export function getOrCreateLoggedExercise(
  session: WorkoutSession,
  exerciseId: string,
  name: string,
  variantId?: string,
): LoggedExercise {
  let entry = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (!entry) {
    entry = { exerciseId, name, variantId, sets: [] };
    session.exercises.push(entry);
  } else if (variantId && entry.variantId !== variantId) {
    entry.variantId = variantId;
  }
  return entry;
}

/** Most recent completed set for an exercise across all history. Used to prefill. */
export function lastSetFor(
  exerciseId: string,
  sessions: WorkoutSession[],
): LoggedSet | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) return ex.sets[ex.sets.length - 1];
  }
  return null;
}

export function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function startSession(workoutKey: string): WorkoutSession {
  return {
    id: newSessionId(),
    workoutKey,
    startedAt: Date.now(),
    exercises: [],
  };
}

/** Complete and archive a session: move active → sessions[]. */
export function endSession(active: WorkoutSession): {
  ended: WorkoutSession;
  sessions: WorkoutSession[];
} {
  const ended: WorkoutSession = { ...active, endedAt: Date.now() };
  const sessions = [...loadSessions(), ended];
  saveSessions(sessions);
  saveActiveSession(null);
  return { ended, sessions };
}

// ── Equipment photos ──

export function loadEquipmentPhotos(): EquipmentPhoto[] {
  return loadState<EquipmentPhoto[]>(PHOTOS_KEY, []);
}

export function saveEquipmentPhotos(photos: EquipmentPhoto[]): void {
  saveState(PHOTOS_KEY, photos);
}

export function addEquipmentPhoto(
  exerciseId: string,
  dataUrl: string,
): EquipmentPhoto[] {
  const photos = loadEquipmentPhotos();
  const next = [
    ...photos,
    { exerciseId, dataUrl, capturedAt: Date.now() },
  ];
  saveEquipmentPhotos(next);
  return next;
}

// ── Haptic feedback helper ──

/** Trigger device vibration if supported. Single short pulse for "set done". */
export function haptic(pattern: number | number[] = 30): void {
  if (typeof navigator === "undefined") return;
  // navigator.vibrate is widely supported on Android Chrome / Firefox; iOS Safari ignores.
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

// ── Active-session expiry guard ──

/** If the active session has been idle > 4hrs, treat it as abandoned. */
export function isSessionStale(s: WorkoutSession): boolean {
  const lastActivity =
    s.exercises
      .flatMap((e) => e.sets)
      .reduce((acc, set) => Math.max(acc, set.completedAt), s.startedAt) ||
    s.startedAt;
  return Date.now() - lastActivity > 4 * 60 * 60 * 1000;
}
