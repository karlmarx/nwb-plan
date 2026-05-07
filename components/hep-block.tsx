"use client";

import React, { useEffect, useState, useCallback } from "react";
import { loadState, saveState } from "@/lib/storage";
import { getActiveHEP, type HEPExercise } from "@/lib/hep-exercises";

// ----- Date helper -------------------------------------------------------

/** ISO date in local time (YYYY-MM-DD). Stable per calendar day. */
function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ----- Hook --------------------------------------------------------------

interface HEPCompletionApi {
  doneIds: string[];
  totalCount: number;
  doneCount: number;
  toggle: (id: string) => void;
  isDone: (id: string) => boolean;
}

export function useHEPCompletion(): HEPCompletionApi {
  const dateKey = todayKey();
  const storageKey = `nwb_hep_done_${dateKey}`;
  const total = getActiveHEP().length;

  const [doneIds, setDoneIds] = useState<string[]>(() =>
    loadState<string[]>(storageKey, []),
  );

  // Listen for storage events from other tabs / components on same page.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setDoneIds(loadState<string[]>(storageKey, []));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  // Re-load when the date key rolls over (page open past midnight).
  useEffect(() => {
    setDoneIds(loadState<string[]>(storageKey, []));
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setDoneIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        saveState(storageKey, next);
        // Manually fire a same-tab storage event so other <HEPBlock /> instances
        // on the same page re-read. (Native StorageEvent only fires across tabs.)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: storageKey,
            newValue: JSON.stringify(next),
          }),
        );
        return next;
      });
    },
    [storageKey],
  );

  const isDone = useCallback((id: string) => doneIds.includes(id), [doneIds]);

  return {
    doneIds,
    totalCount: total,
    doneCount: doneIds.length,
    toggle,
    isDone,
  };
}

// ----- Component ---------------------------------------------------------

export type HEPBlockMode = "pill" | "full" | "strip";

interface HEPBlockProps {
  mode: HEPBlockMode;
  workoutKey?: string;
}

function HEPRow({
  ex,
  done,
  onToggle,
  compact,
}: {
  ex: HEPExercise;
  done: boolean;
  onToggle: () => void;
  compact: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  const setsReps = ex.holdSeconds
    ? `${ex.sets} × ${ex.reps ?? "—"} · ${ex.holdSeconds}s hold`
    : `${ex.sets} × ${ex.reps ?? "—"}`;

  return (
    <div
      data-testid={`hep-row-${ex.id}`}
      className="flex flex-wrap items-center gap-2 py-1.5"
    >
      <button
        data-testid={`hep-checkbox-${ex.id}`}
        onClick={onToggle}
        aria-label={done ? `Uncheck ${ex.name}` : `Check ${ex.name}`}
        className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer"
        style={{
          background: done ? "#34d399" : "transparent",
          borderColor: done ? "#34d399" : "var(--color-border)",
          color: done ? "#0a0a0a" : "transparent",
        }}
      >
        {done ? "✓" : ""}
      </button>
      <span className="font-semibold flex-1 text-sm">{ex.name}</span>
      {!compact && (
        <span className="text-xs text-text-dim">{setsReps}</span>
      )}
      {ex.videoUrl && (
        <a
          data-testid={`hep-video-${ex.id}`}
          href={ex.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs"
          aria-label={`Video for ${ex.name}`}
        >
          ▶
        </a>
      )}
      <button
        data-testid={`hep-info-${ex.id}`}
        onClick={() => setShowInfo((v) => !v)}
        aria-label={`Instructions for ${ex.name}`}
        className="text-xs text-text-dim cursor-pointer"
      >
        ℹ
      </button>
      {showInfo && (
        <div
          data-testid={`hep-instructions-${ex.id}`}
          className="basis-full text-xs text-text-dim pl-7 pt-1"
        >
          {ex.instructions}
        </div>
      )}
    </div>
  );
}

export default function HEPBlock({ mode, workoutKey }: HEPBlockProps) {
  const exercises = getActiveHEP();
  const completion = useHEPCompletion();
  const [expanded, setExpanded] = useState(mode !== "pill");

  if (mode === "pill") {
    return (
      <div
        data-testid="hep-block-pill"
        data-hep-total={completion.totalCount}
        data-hep-done={completion.doneCount}
        data-hep-expanded={expanded}
        className="rounded-xl border my-3 px-3 py-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
      >
        <button
          data-testid="hep-pill-toggle"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between cursor-pointer"
          aria-expanded={expanded}
        >
          <span className="text-sm font-semibold">
            🏥 HEP — {completion.doneCount}/{completion.totalCount} done today
          </span>
          <span className="text-xs">{expanded ? "▼" : "▶"}</span>
        </button>
        {expanded && (
          <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
            {exercises.map((ex) => (
              <HEPRow
                key={ex.id}
                ex={ex}
                done={completion.isDone(ex.id)}
                onToggle={() => completion.toggle(ex.id)}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // full and strip modes implemented in Tasks 4 and 5
  return (
    <div
      data-testid={mode === "strip" ? `hep-strip-${workoutKey ?? "unknown"}` : `hep-block-${mode}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
    />
  );
}
