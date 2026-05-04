"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type LoggedSet,
  type LoggedExercise,
  type WorkoutSession,
  loadActiveSession,
  saveActiveSession,
  loadSessions,
  saveSessions,
  startSession,
  endSession,
  getOrCreateLoggedExercise,
  isSessionStale,
  lastSetFor,
} from "./workout-log";

/**
 * React hook for the active set-logging session. Handles localStorage
 * hydration, stale-session cleanup, and exposes mutators that auto-persist.
 *
 * Singleton-ish: every call mutates the same localStorage keys, so opening
 * the hook in two places stays consistent across remounts (the state drift
 * within a single render tree is avoided by always re-reading on mount).
 */
export function useWorkoutLog(currentWorkoutKey: string) {
  const [active, setActive] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const a = loadActiveSession();
    const h = loadSessions();
    setHistory(h);
    if (a && isSessionStale(a)) {
      // Auto-archive a stale session (>4hr idle) so we don't accidentally
      // append today's sets to yesterday's workout.
      endSession(a);
      setHistory(loadSessions());
      setActive(null);
    } else {
      setActive(a);
    }
    setHydrated(true);
  }, []);

  // Persist active whenever it changes (post-hydration only).
  useEffect(() => {
    if (!hydrated) return;
    saveActiveSession(active);
  }, [active, hydrated]);

  /** Ensure an active session exists. Creates one targeted at currentWorkoutKey if missing. */
  const ensureActive = useCallback((): WorkoutSession => {
    if (active) return active;
    const fresh = startSession(currentWorkoutKey);
    setActive(fresh);
    return fresh;
  }, [active, currentWorkoutKey]);

  /** Log a new set for an exercise. Returns the updated set. */
  const logSet = useCallback(
    (
      exerciseId: string,
      name: string,
      set: Omit<LoggedSet, "n" | "completedAt">,
      variantId?: string,
    ): LoggedSet => {
      // Snapshot first so we mutate a fresh copy.
      const session = active ?? startSession(currentWorkoutKey);
      const next: WorkoutSession = {
        ...session,
        exercises: session.exercises.map((e) => ({ ...e, sets: [...e.sets] })),
      };
      const entry = getOrCreateLoggedExercise(next, exerciseId, name, variantId);
      const newSet: LoggedSet = {
        ...set,
        n: entry.sets.length + 1,
        completedAt: Date.now(),
      };
      entry.sets.push(newSet);
      setActive(next);
      return newSet;
    },
    [active, currentWorkoutKey],
  );

  /** Update a previously logged set in place (edit reps/weight/note). */
  const editSet = useCallback(
    (exerciseId: string, n: number, patch: Partial<LoggedSet>) => {
      if (!active) return;
      const next: WorkoutSession = {
        ...active,
        exercises: active.exercises.map((e) =>
          e.exerciseId === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.n === n ? { ...s, ...patch } : s)),
              }
            : e,
        ),
      };
      setActive(next);
    },
    [active],
  );

  /** Delete a set and renumber the remaining sets. */
  const removeSet = useCallback(
    (exerciseId: string, n: number) => {
      if (!active) return;
      const next: WorkoutSession = {
        ...active,
        exercises: active.exercises.map((e) =>
          e.exerciseId === exerciseId
            ? {
                ...e,
                sets: e.sets
                  .filter((s) => s.n !== n)
                  .map((s, i) => ({ ...s, n: i + 1 })),
              }
            : e,
        ),
      };
      setActive(next);
    },
    [active],
  );

  /** Set / replace the exercise-level note. */
  const setExerciseNote = useCallback(
    (exerciseId: string, name: string, note: string, variantId?: string) => {
      const session = active ?? startSession(currentWorkoutKey);
      const next: WorkoutSession = {
        ...session,
        exercises: session.exercises.map((e) => ({ ...e })),
      };
      const entry = getOrCreateLoggedExercise(next, exerciseId, name, variantId);
      entry.note = note || undefined;
      setActive(next);
    },
    [active, currentWorkoutKey],
  );

  /** End the current session and archive to history. */
  const endWorkout = useCallback(() => {
    if (!active) return;
    const { sessions } = endSession(active);
    setHistory(sessions);
    setActive(null);
  }, [active]);

  /** Lookup helpers. */
  const loggedFor = useCallback(
    (exerciseId: string): LoggedExercise | undefined =>
      active?.exercises.find((e) => e.exerciseId === exerciseId),
    [active],
  );

  const lastSet = useCallback(
    (exerciseId: string): LoggedSet | null => {
      // Prefer today's most recent if any, otherwise look back through history.
      const todays = loggedFor(exerciseId)?.sets;
      if (todays && todays.length > 0) return todays[todays.length - 1];
      return lastSetFor(exerciseId, history);
    },
    [loggedFor, history],
  );

  return {
    active,
    history,
    hydrated,
    ensureActive,
    logSet,
    editSet,
    removeSet,
    setExerciseNote,
    endWorkout,
    loggedFor,
    lastSet,
  };
}

export type WorkoutLogHook = ReturnType<typeof useWorkoutLog>;
