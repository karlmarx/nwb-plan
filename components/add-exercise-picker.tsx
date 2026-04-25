"use client";

import React, { useMemo, useState } from "react";
import { EX } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import { cssAlpha } from "@/lib/css-utils";

interface AddExercisePickerProps {
  /** Exercises already in the workout — shown disabled so the user knows they're already there. */
  currentExercises: string[];
  /** Optional hint for which category matches this workout (pre-selects the filter). */
  preferredCategory?: string;
  onAdd: (name: string) => void;
  onClose: () => void;
}

type CategoryKey = "all" | "push" | "pull" | "legs" | "core" | "cardio";

const CATEGORY_CHIPS: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "push", label: "Push" },
  { key: "pull", label: "Pull" },
  { key: "legs", label: "Legs" },
  { key: "core", label: "Core" },
  { key: "cardio", label: "Cardio" },
];

const CATEGORY_COLOR: Record<string, string> = {
  push: "#3498db",
  pull: "#a78bfa",
  legs: "#10b981",
  core: "#f39c12",
  cardio: "#ef4444",
};

export default function AddExercisePicker({
  currentExercises,
  preferredCategory,
  onAdd,
  onClose,
}: AddExercisePickerProps) {
  const initialCat = (CATEGORY_CHIPS.find(
    (c) => c.key === preferredCategory,
  )?.key ?? "all") as CategoryKey;
  const [cat, setCat] = useState<CategoryKey>(initialCat);
  const [query, setQuery] = useState("");

  const already = useMemo(() => new Set(currentExercises), [currentExercises]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const entries: Array<{ name: string; ex: Exercise }> = Object.entries(EX).map(
      ([name, ex]) => ({ name, ex }),
    );
    return entries
      .filter(({ ex }) => cat === "all" || ex.category === cat)
      .filter(({ name, ex }) => {
        if (!q) return true;
        return (
          name.toLowerCase().includes(q) ||
          ex.setup?.toLowerCase().includes(q) ||
          ex.execution?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cat, query]);

  return (
    <div
      data-testid="add-exercise-picker"
      className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              Add exercise
            </div>
            <div className="text-sm font-semibold text-text">
              Pick any exercise from the catalog
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer text-lg font-bold flex-shrink-0 ml-2"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            &times;
          </button>
        </div>

        {/* Search + category chips */}
        <div
          className="px-4 pt-3 pb-2 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full rounded-lg px-3 py-2 text-sm font-[inherit] mb-2 outline-none"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORY_CHIPS.map((c) => {
              const isActive = cat === c.key;
              const color =
                c.key === "all"
                  ? "var(--color-accent)"
                  : CATEGORY_COLOR[c.key] ?? "var(--color-accent)";
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className="text-[11px] font-semibold rounded-full px-3 py-1 cursor-pointer font-[inherit] transition-colors"
                  style={{
                    background: isActive ? color + "22" : "var(--color-bg)",
                    border: `1px solid ${isActive ? color + "66" : "var(--color-border)"}`,
                    color: isActive ? color : "var(--color-text-muted)",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {rows.length === 0 && (
            <div className="text-[12px] text-text-muted py-6 text-center">
              No exercises match.
            </div>
          )}
          <div className="space-y-1.5">
            {rows.map(({ name, ex }) => {
              const disabled = already.has(name);
              const color = CATEGORY_COLOR[ex.category] ?? "var(--color-accent)";
              const s = ex.sets[0];
              return (
                <button
                  key={name}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onAdd(name);
                    onClose();
                  }}
                  className="w-full text-left rounded-xl cursor-pointer font-[inherit] p-3 transition-colors duration-150 disabled:cursor-default"
                  style={{
                    background: disabled ? "var(--color-bg)" : "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderLeft: `3px solid ${color}`,
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[9px] font-extrabold rounded px-1.5 py-0.5 uppercase"
                      style={{
                        background: color + "22",
                        border: `1px solid ${color}44`,
                        color,
                      }}
                    >
                      {ex.category}
                    </span>
                    <span className="text-sm font-semibold text-text">{name}</span>
                    <span className="ml-auto text-[10px] text-text-dim tabular-nums">
                      {s ? `${s[0]}\u00D7${s[1]}` : ""}
                    </span>
                    {disabled && (
                      <span className="text-[10px] text-text-muted">already added</span>
                    )}
                  </div>
                  {ex.execution && (
                    <div className="text-[11px] text-text-dim leading-snug line-clamp-2">
                      {ex.execution}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={onClose}
            className="w-full rounded-xl text-sm font-bold cursor-pointer font-[inherit] min-h-[44px]"
            style={{
              background: cssAlpha("var(--color-accent)", 9),
              border: `1px solid ${cssAlpha("var(--color-accent)", 33)}`,
              color: "var(--color-accent)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

AddExercisePicker.displayName = "AddExercisePicker";
