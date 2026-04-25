"use client";

import React, { useEffect, useState } from "react";
import {
  type LoggedSet,
  haptic,
  loadEquipmentPhotos,
  addEquipmentPhoto,
} from "@/lib/workout-log";
import type { WorkoutLogHook } from "@/lib/use-workout-log";

// ── Helpers (declared before consumer to avoid any hoisting/TDZ surprises in
//    bundlers that aggressively split client-component chunks). ──

function formatWeight(w: number): string {
  return w % 1 === 0 ? String(w) : w.toFixed(1);
}

function parsePrescribedLow(prescribed?: string): number | null {
  if (!prescribed) return null;
  const m = prescribed.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function NumStepper({
  value,
  onChange,
  onMinus,
  onPlus,
  label,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-stretch border border-border rounded-md overflow-hidden bg-bg">
      <button
        type="button"
        onClick={onMinus}
        className="px-2 text-text-dim text-lg font-bold min-w-[32px] active:bg-card-hover"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        type="text"
        inputMode={label === "lbs" ? "decimal" : "numeric"}
        pattern="[0-9.]*"
        value={value}
        onChange={(ev) => onChange(ev.target.value.replace(/[^0-9.]/g, ""))}
        placeholder={hint && hint.length > 0 ? hint : "0"}
        className="flex-1 min-w-0 px-1 py-2 text-center text-base font-bold tabular-nums bg-transparent text-text placeholder:text-text-dim focus:outline-none"
        style={{ color: value ? "var(--color-text)" : undefined }}
        aria-label={label}
      />
      <button
        type="button"
        onClick={onPlus}
        className="px-2 text-text-dim text-lg font-bold min-w-[32px] active:bg-card-hover"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

function LoggedRow({
  set,
  onRemove,
  onEdit,
}: {
  set: LoggedSet;
  onRemove: () => void;
  onEdit: (patch: Partial<LoggedSet>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [w, setW] = useState(() => String(set.weight || ""));
  const [r, setR] = useState(() => String(set.reps || ""));

  if (editing) {
    return (
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_auto] gap-2 items-center">
        <span className="text-[11px] font-bold text-text-muted w-6 text-center tabular-nums">
          {set.n}
        </span>
        <input
          type="number"
          inputMode="decimal"
          value={w}
          onChange={(e) => setW(e.target.value)}
          className="w-full px-2 py-1 text-sm rounded-md bg-bg border border-accent text-text tabular-nums"
        />
        <span className="text-text-muted text-xs">×</span>
        <input
          type="number"
          inputMode="numeric"
          value={r}
          onChange={(e) => setR(e.target.value)}
          className="w-full px-2 py-1 text-sm rounded-md bg-bg border border-accent text-text tabular-nums"
        />
        <button
          onClick={() => {
            onEdit({
              weight: parseFloat(w) || 0,
              reps: parseInt(r, 10) || 0,
            });
            setEditing(false);
          }}
          className="text-accent font-bold text-base px-2"
          aria-label="Save edit"
        >
          ✓
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-text-muted text-base px-2"
          aria-label="Cancel edit"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="logged-set"
      className="grid grid-cols-[auto_1fr_auto] gap-2 items-center text-sm"
      style={{ color: "var(--color-text)" }}
    >
      <span
        className="text-[11px] font-bold w-6 text-center tabular-nums"
        style={{ color: "var(--color-safe)" }}
      >
        ✓{set.n}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-left tabular-nums hover:underline decoration-dotted"
        aria-label="Edit set"
      >
        {set.weight ? `${formatWeight(set.weight)}lb × ` : ""}
        {set.reps}{set.durationSec ? `s` : ""}
        {set.note ? <span className="text-text-muted text-xs"> — {set.note}</span> : null}
      </button>
      <button
        onClick={onRemove}
        className="text-text-muted text-xs px-2 py-1"
        aria-label="Remove set"
        title="Remove set"
      >
        ✕
      </button>
    </div>
  );
}

function PhotoButton({ exerciseId }: { exerciseId: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCount(loadEquipmentPhotos().filter((p) => p.exerciseId === exerciseId).length);
  }, [exerciseId]);

  const onPick = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const next = addEquipmentPhoto(exerciseId, reader.result);
        setCount(next.filter((p) => p.exerciseId === exerciseId).length);
      }
    };
    reader.readAsDataURL(file);
    ev.target.value = "";
  };

  return (
    <label
      className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] rounded-md border border-border bg-bg text-text-dim cursor-pointer active:bg-card-hover"
      title="Photograph the equipment you used"
    >
      📷
      {count > 0 && <span className="text-[10px] font-bold text-accent">{count}</span>}
      <input type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
    </label>
  );
}

// ── Main component ──

interface SetTrackerProps {
  exerciseId: string;
  exerciseName: string;
  variantId?: string;
  /** Default rest seconds from the exercise definition. */
  defaultRest: number;
  /** Prescribed reps (e.g. "8-10") for the current phase — used as a hint. */
  prescribedReps?: string;
  log: WorkoutLogHook;
  /** Triggers the global RestTimer with the given seconds. */
  onStartTimer?: (seconds: number) => void;
}

/**
 * Inline set-tracker rendered inside an expanded ExerciseRow.
 *
 * Tap ✓ to commit a set → fires haptic, starts the rest timer, opens a fresh
 * pending row prefilled from the just-logged set. Logged rows are tap-to-edit
 * or ✕-to-remove. Per-set notes for vague freestyle ("RPE", "neutral grip",
 * pain notes). Per-exercise note + a photo button (caches base64 in
 * localStorage under `equipment-photos`).
 */
export default function SetTracker({
  exerciseId,
  exerciseName,
  variantId,
  defaultRest,
  prescribedReps,
  log,
  onStartTimer,
}: SetTrackerProps) {
  const logged = log.loggedFor(exerciseId);
  const sets = logged?.sets ?? [];
  const lastEver = log.lastSet(exerciseId);

  // Pending-set draft state. Prefill chain:
  // 1. last set in today's session (if any), else
  // 2. last set across history, else
  // 3. blank — let user type.
  const seed = sets.length > 0 ? sets[sets.length - 1] : lastEver;
  const seedWeight = seed?.weight ?? 0;
  // Prefill reps: prefer last logged, else low end of prescribed range
  // ("5-6" → 5, "8" → 8) so user just adjusts ± rather than typing from blank.
  const prescribedLow = parsePrescribedLow(prescribedReps);
  const seedReps = seed?.reps ?? prescribedLow ?? 0;

  const [draftWeight, setDraftWeight] = useState<string>(() =>
    seedWeight ? String(seedWeight) : "",
  );
  const [draftReps, setDraftReps] = useState<string>(() =>
    seedReps ? String(seedReps) : "",
  );
  const [draftNote, setDraftNote] = useState("");

  // Re-seed inputs after a set is committed (the seed values change because
  // sets[] grew). Don't depend on the user's typed-in state — driven only by
  // the underlying seed numbers.
  useEffect(() => {
    setDraftWeight(seedWeight ? String(seedWeight) : "");
    setDraftReps(seedReps ? String(seedReps) : "");
  }, [seedWeight, seedReps]);

  const [exerciseNote, setExerciseNoteState] = useState(logged?.note ?? "");
  useEffect(() => {
    setExerciseNoteState(logged?.note ?? "");
  }, [logged?.note]);

  const handleLogSet = () => {
    const weight = parseFloat(draftWeight) || 0;
    const reps = parseInt(draftReps, 10) || 0;
    log.logSet(
      exerciseId,
      exerciseName,
      { weight, reps, note: draftNote || undefined },
      variantId,
    );
    setDraftNote("");
    haptic(35);
    if (defaultRest > 0) onStartTimer?.(defaultRest);
  };

  const adjustWeight = (delta: number) => {
    const cur = parseFloat(draftWeight) || 0;
    const next = Math.max(0, cur + delta);
    setDraftWeight(next % 1 === 0 ? String(next) : next.toFixed(1));
  };
  const adjustReps = (delta: number) => {
    const cur = parseInt(draftReps, 10) || 0;
    const next = Math.max(0, cur + delta);
    setDraftReps(String(next));
  };

  return (
    <div className="rounded-xl border border-border bg-card mb-3 overflow-hidden">
      <div className="px-3 pt-2.5 pb-2 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-text-muted">
        <span>Today's sets</span>
        {lastEver ? (
          <span className="normal-case tracking-normal text-text-dim">
            Last: {lastEver.weight ? `${formatWeight(lastEver.weight)}lb × ` : ""}
            {lastEver.reps}
            {lastEver.completedAt ? <> &middot; {timeAgo(lastEver.completedAt)}</> : null}
          </span>
        ) : null}
      </div>

      {sets.length > 0 ? (
        <div className="px-3 pb-2 space-y-1.5">
          {sets.map((s) => (
            <LoggedRow
              key={s.n}
              set={s}
              onRemove={() => log.removeSet(exerciseId, s.n)}
              onEdit={(patch) => log.editSet(exerciseId, s.n, patch)}
            />
          ))}
        </div>
      ) : null}

      <div className="px-3 pb-3">
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-2 items-center">
          <span className="text-[11px] font-bold text-text-dim w-6 text-center tabular-nums">
            {sets.length + 1}
          </span>

          <NumStepper
            value={draftWeight}
            onChange={setDraftWeight}
            onMinus={() => adjustWeight(-5)}
            onPlus={() => adjustWeight(5)}
            label="lbs"
          />

          <span className="text-text-muted text-sm">×</span>

          <NumStepper
            value={draftReps}
            onChange={setDraftReps}
            onMinus={() => adjustReps(-1)}
            onPlus={() => adjustReps(1)}
            label="reps"
            hint={prescribedReps}
          />

          <button
            onClick={handleLogSet}
            disabled={!draftReps && !draftWeight}
            data-testid="log-set"
            className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center font-bold text-base disabled:opacity-40"
            style={{ background: "var(--color-safe)", color: "#000" }}
            aria-label="Log set"
          >
            ✓
          </button>
        </div>

        <input
          type="text"
          value={draftNote}
          onChange={(ev) => setDraftNote(ev.target.value)}
          placeholder="Note for this set (RPE, grip, pain, etc.)"
          className="w-full mt-2 px-2.5 py-1.5 text-[12px] rounded-md bg-bg border border-border text-text-dim placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      <div className="border-t border-border px-3 py-2.5 flex gap-2 items-stretch">
        <input
          type="text"
          value={exerciseNote}
          onChange={(ev) => setExerciseNoteState(ev.target.value)}
          onBlur={() =>
            log.setExerciseNote(exerciseId, exerciseName, exerciseNote, variantId)
          }
          placeholder="Exercise note (custom variation, machine #, etc.)"
          className="flex-1 px-2.5 py-1.5 text-[12px] rounded-md bg-bg border border-border text-text-dim placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <PhotoButton exerciseId={exerciseId} />
      </div>
    </div>
  );
}
