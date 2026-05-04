"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  loadSessions,
  type LoggedExercise,
  type LoggedSet,
  type WorkoutSession,
} from "@/lib/workout-log";
import { EX } from "@/lib/exercises";

/**
 * History view — shows previously completed (archived) workout sessions
 * read from `workout-log:sessions` in localStorage.
 *
 * Read-only: no mutation of the log here. Renders newest-first, with each
 * exercise's sets formatted as `135 lb × 8, 10, 8` and a tiny inline-SVG
 * sparkline of top weight across the last few times this exercise appeared.
 */
export default function HistoryView() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. We read once — when the user logs
  // a new session, they'll come back to this tab and we re-mount via the
  // tab switch which triggers a fresh read.
  useEffect(() => {
    setSessions(loadSessions());
    setHydrated(true);
  }, []);

  const ordered = useMemo(() => {
    // Reverse-chronological by endedAt (fallback startedAt for anything
    // weirdly persisted without an end timestamp).
    return [...sessions].sort((a, b) => {
      const at = a.endedAt ?? a.startedAt;
      const bt = b.endedAt ?? b.startedAt;
      return bt - at;
    });
  }, [sessions]);

  if (!hydrated) {
    return (
      <div data-testid="history-view" className="text-text-muted text-xs">
        Loading history…
      </div>
    );
  }

  if (ordered.length === 0) {
    return (
      <div data-testid="history-view">
        <div
          className="rounded-2xl bg-card p-6 text-center"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div className="text-text-muted text-sm leading-relaxed">
            No completed workouts yet.
            <br />
            End a workout to see history here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="history-view" className="flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-wider font-bold text-text-muted px-1">
        {ordered.length} {ordered.length === 1 ? "session" : "sessions"} logged
      </div>
      {ordered.map((s) => (
        <SessionCard key={s.id} session={s} allSessions={sessions} />
      ))}
    </div>
  );
}

interface SessionCardProps {
  session: WorkoutSession;
  /** Full session list — passed so we can compute per-exercise history sparklines. */
  allSessions: WorkoutSession[];
}

function SessionCard({ session, allSessions }: SessionCardProps) {
  const totalSets = session.exercises.reduce(
    (acc, e) => acc + e.sets.length,
    0,
  );
  const dateLabel = formatSessionDate(session.endedAt ?? session.startedAt);
  const durationLabel = formatDuration(session);

  return (
    <div
      data-testid="history-session"
      className="rounded-2xl bg-card overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <div
        className="px-4 py-3 flex items-baseline justify-between gap-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-text truncate">
            {session.workoutKey || "Workout"}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {dateLabel}
            {durationLabel && (
              <>
                {" · "}
                {durationLabel}
              </>
            )}
            {" · "}
            {totalSets} {totalSets === 1 ? "set" : "sets"}
          </div>
        </div>
      </div>

      {session.exercises.length === 0 ? (
        <div className="px-4 py-3 text-text-muted text-xs italic">
          No exercises logged.
        </div>
      ) : (
        <div className="flex flex-col">
          {session.exercises.map((ex, i) => (
            <ExerciseRow
              key={`${session.id}-${ex.exerciseId}-${i}`}
              ex={ex}
              session={session}
              allSessions={allSessions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExerciseRowProps {
  ex: LoggedExercise;
  session: WorkoutSession;
  allSessions: WorkoutSession[];
}

function ExerciseRow({ ex, session, allSessions }: ExerciseRowProps) {
  const displayName = ex.name || EX[ex.exerciseId]?.name || ex.exerciseId;
  const setsLabel = formatSets(ex.sets);
  const topWeight = ex.sets.reduce((m, s) => Math.max(m, s.weight ?? 0), 0);

  // Top weight per session for this exercise across history (oldest→newest).
  // Used to draw the inline sparkline.
  const topWeights = useMemo(() => {
    const points: number[] = [];
    const ordered = [...allSessions].sort((a, b) => {
      const at = a.endedAt ?? a.startedAt;
      const bt = b.endedAt ?? b.startedAt;
      return at - bt;
    });
    for (const s of ordered) {
      const match = s.exercises.find((e) => e.exerciseId === ex.exerciseId);
      if (match && match.sets.length > 0) {
        const top = match.sets.reduce(
          (m, set) => Math.max(m, set.weight ?? 0),
          0,
        );
        points.push(top);
      }
    }
    return points;
  }, [allSessions, ex.exerciseId]);

  // Index of THIS session's data point inside topWeights (so we can highlight
  // the current dot). This relies on point order matching session order.
  const sessionIndexInPoints = useMemo(() => {
    const ordered = [...allSessions].sort((a, b) => {
      const at = a.endedAt ?? a.startedAt;
      const bt = b.endedAt ?? b.startedAt;
      return at - bt;
    });
    let idx = -1;
    for (const s of ordered) {
      const match = s.exercises.find((e) => e.exerciseId === ex.exerciseId);
      if (match && match.sets.length > 0) {
        idx += 1;
        if (s.id === session.id) return idx;
      }
    }
    return -1;
  }, [allSessions, ex.exerciseId, session.id]);

  return (
    <div
      data-testid="history-exercise"
      className="px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <div className="font-semibold text-sm text-text leading-tight truncate">
          {displayName}
        </div>
        {topWeights.length >= 2 && (
          <Sparkline
            values={topWeights}
            highlightIndex={sessionIndexInPoints}
          />
        )}
      </div>
      <div className="text-[12px] text-text-dim tabular-nums leading-snug">
        {setsLabel}
      </div>
      {ex.note && (
        <div className="text-[11px] text-text-muted italic mt-1 leading-snug">
          {ex.note}
        </div>
      )}
      {topWeights.length >= 2 && (
        <DiffLabel values={topWeights} highlightIndex={sessionIndexInPoints} />
      )}
      {topWeights.length < 2 && topWeight > 0 && (
        <div className="text-[10px] text-text-muted mt-1">
          Top {topWeight} lb · first time logged
        </div>
      )}
    </div>
  );
}

interface SparklineProps {
  values: number[];
  highlightIndex: number;
}

function Sparkline({ values, highlightIndex }: SparklineProps) {
  // Show up to the 5 most recent points. We slice from the end and adjust
  // the highlight index so the current session's dot still maps correctly.
  const maxPoints = 5;
  const start = Math.max(0, values.length - maxPoints);
  const view = values.slice(start);
  const localHighlight = highlightIndex >= start ? highlightIndex - start : -1;

  const w = 60;
  const h = 16;
  const pad = 2;

  const min = Math.min(...view);
  const max = Math.max(...view);
  const range = max - min || 1;

  const xFor = (i: number) =>
    view.length === 1
      ? w / 2
      : pad + (i * (w - pad * 2)) / (view.length - 1);
  const yFor = (v: number) =>
    h - pad - ((v - min) / range) * (h - pad * 2);

  const path = view
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      data-testid="history-sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />
      {view.map((v, i) => {
        const isCurrent = i === localHighlight;
        return (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor(v)}
            r={isCurrent ? 2.2 : 1.2}
            fill={isCurrent ? "var(--color-accent)" : "var(--color-text-muted)"}
            opacity={isCurrent ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

interface DiffLabelProps {
  values: number[];
  highlightIndex: number;
}

function DiffLabel({ values, highlightIndex }: DiffLabelProps) {
  // Compare the current session's top weight vs. the immediately previous
  // session's top weight for the same exercise.
  if (highlightIndex < 1) return null;
  const current = values[highlightIndex];
  const prev = values[highlightIndex - 1];
  if (current == null || prev == null || prev === 0) return null;
  const delta = current - prev;
  if (delta === 0) {
    return (
      <div className="text-[10px] text-text-muted mt-1">
        Top {current} lb · same as last time
      </div>
    );
  }
  const arrow = delta > 0 ? "▲" : "▼";
  const color = delta > 0 ? "var(--color-safe)" : "var(--color-warning)";
  const sign = delta > 0 ? "+" : "";
  return (
    <div className="text-[10px] mt-1 flex items-center gap-1">
      <span style={{ color }}>
        {arrow} {sign}
        {delta} lb
      </span>
      <span className="text-text-muted">vs. last session</span>
    </div>
  );
}

// ===== Formatting helpers =====

function formatSets(sets: LoggedSet[]): string {
  if (sets.length === 0) return "(no sets)";

  // Group consecutive sets with the same weight so we can render
  // `135 lb × 8, 10, 8` instead of `135 × 8 / 135 × 10 / 135 × 8`.
  type Group = { weight: number; reps: (number | string)[] };
  const groups: Group[] = [];
  for (const s of sets) {
    const w = s.weight ?? 0;
    const repPart =
      s.reps > 0
        ? String(s.reps)
        : s.durationSec
          ? `${s.durationSec}s`
          : "—";
    const last = groups[groups.length - 1];
    if (last && last.weight === w) {
      last.reps.push(repPart);
    } else {
      groups.push({ weight: w, reps: [repPart] });
    }
  }

  return groups
    .map((g) => {
      const weightLabel = g.weight > 0 ? `${g.weight} lb` : "BW";
      return `${weightLabel} × ${g.reps.join(", ")}`;
    })
    .join(" · ");
}

function formatSessionDate(epochMs: number): string {
  const d = new Date(epochMs);
  // "Tue, Apr 22"
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  return `${weekday}, ${month} ${day}`;
}

function formatDuration(s: WorkoutSession): string | null {
  if (!s.endedAt) return null;
  const ms = Math.max(0, s.endedAt - s.startedAt);
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
