"use client";

import React, { useEffect, useState } from "react";
import type { WorkoutLogHook } from "@/lib/use-workout-log";

interface SessionBarProps {
  log: WorkoutLogHook;
  /** Workout label shown in the bar (e.g. "Push B"). */
  workoutLabel: string;
}

/**
 * Sticky top status bar for the active workout session.
 *
 * Renders only when there's an active session — invisible until the user
 * logs their first set. Shows elapsed time live (1Hz tick), the workout
 * name, set count, and a "Finish" button that archives the session.
 */
export default function SessionBar({ log, workoutLabel }: SessionBarProps) {
  const { active, endWorkout, hydrated } = log;
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);

  // Tick once a second to keep the elapsed-time readout live.
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [active]);

  if (!hydrated || !active) return null;

  const elapsedMs = Math.max(0, now - active.startedAt);
  const totalSets = active.exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <div
      data-testid="session-bar"
      className="sticky top-0 z-30 flex items-center gap-3 px-3 py-2 border-b border-border"
      style={{
        background: "var(--color-card)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: "var(--color-safe)", boxShadow: "0 0 8px var(--color-safe)" }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted leading-tight">
          {workoutLabel} &middot; {totalSets} {totalSets === 1 ? "set" : "sets"}
        </div>
        <div className="text-base font-bold tabular-nums text-text leading-tight">
          {formatElapsed(elapsedMs)}
        </div>
      </div>

      {confirming ? (
        <div className="flex gap-1.5">
          <button
            data-testid="end-confirm"
            onClick={() => {
              endWorkout();
              setConfirming(false);
            }}
            className="rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: "var(--color-safe)", color: "#000" }}
          >
            Finish
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-md px-2 py-1.5 text-[11px] uppercase tracking-wide text-text-muted border border-border"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          data-testid="end-workout"
          onClick={() => setConfirming(true)}
          className="rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent border border-border"
          style={{ background: "var(--color-bg)" }}
        >
          End
        </button>
      )}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
