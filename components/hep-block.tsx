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
  /** Only meaningful for mode="strip" — used in the test-id for that surface. */
  workoutKey?: string;
}

export default function HEPBlock({ mode, workoutKey }: HEPBlockProps) {
  const _exercises = getActiveHEP();
  const completion = useHEPCompletion();

  // Stub — real UI comes in Tasks 3, 4, 5.
  return (
    <div
      data-testid={mode === "strip" ? `hep-strip-${workoutKey ?? "unknown"}` : `hep-block-${mode}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
    >
      {/* HEP {mode} placeholder — {_exercises.length} exercises */}
    </div>
  );
}
