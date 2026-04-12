"use client";

import React, { useEffect, useState } from "react";
import type { Exercise } from "@/lib/exercises";
import EquipmentSwapPanel from "@/components/equipment-swap-panel";
import { cssAlpha } from "@/lib/css-utils";

interface EditExerciseSheetProps {
  exerciseName: string;
  exercise: Exercise;
  workoutExercises: string[];
  equipment: Record<string, boolean>;
  selectedVariantId: string | null;
  onSelectVariant: (id: string) => void;
  onSwap: (newName: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onClose: () => void;
}

type Tab = "swap" | "move";

export default function EditExerciseSheet({
  exerciseName,
  exercise,
  workoutExercises,
  equipment,
  selectedVariantId,
  onSelectVariant,
  onSwap,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onRemove,
  onClose,
}: EditExerciseSheetProps) {
  const [tab, setTab] = useState<Tab>("swap");

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const hasSwapOptions =
    (exercise.swaps && exercise.swaps.length > 0) ||
    (exercise.machineVariants && exercise.machineVariants.length > 0);

  return (
    <div
      data-testid="edit-exercise-sheet"
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
        {/* Drag handle (mobile) */}
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
              Edit exercise
            </div>
            <div className="text-base font-bold text-text truncate">
              {exerciseName}
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

        {/* Tab pills */}
        {hasSwapOptions && (
          <div className="flex gap-1 px-3 pt-3">
            {(["swap", "move"] as const).map((t) => {
              const isActive = tab === t;
              const label = t === "swap" ? "Swap / Machine" : "Move / Remove";
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 rounded-lg text-[12px] font-semibold cursor-pointer font-[inherit] transition-colors duration-150"
                  style={{
                    padding: "8px 12px",
                    background: isActive
                      ? cssAlpha("var(--color-accent)", 9)
                      : "var(--color-bg)",
                    border: `1px solid ${isActive ? cssAlpha("var(--color-accent)", 33) : "var(--color-border)"}`,
                    color: isActive
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Body (scrollable) */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 pt-2">
          {(tab === "swap" || !hasSwapOptions) && hasSwapOptions && (
            <EquipmentSwapPanel
              currentName={exerciseName}
              currentExercise={exercise}
              onSwap={(name) => {
                onSwap(name);
                onClose();
              }}
              equipment={equipment}
              workoutExercises={workoutExercises}
              selectedVariantId={selectedVariantId}
              onSelectVariant={(id) => {
                onSelectVariant(id);
              }}
            />
          )}

          {(tab === "move" || !hasSwapOptions) && (
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Reorder
              </div>
              <button
                onClick={() => {
                  onMoveUp();
                  onClose();
                }}
                disabled={!canMoveUp}
                className="w-full rounded-xl cursor-pointer font-[inherit] flex items-center gap-2 text-[13px] font-semibold min-h-[48px] px-4 disabled:cursor-default"
                style={{
                  background: canMoveUp
                    ? "var(--color-bg)"
                    : "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: canMoveUp
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                  opacity: canMoveUp ? 1 : 0.45,
                }}
              >
                <span className="text-base">↑</span>
                Move up
              </button>
              <button
                onClick={() => {
                  onMoveDown();
                  onClose();
                }}
                disabled={!canMoveDown}
                className="w-full rounded-xl cursor-pointer font-[inherit] flex items-center gap-2 text-[13px] font-semibold min-h-[48px] px-4 disabled:cursor-default"
                style={{
                  background: canMoveDown
                    ? "var(--color-bg)"
                    : "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: canMoveDown
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                  opacity: canMoveDown ? 1 : 0.45,
                }}
              >
                <span className="text-base">↓</span>
                Move down
              </button>

              <div
                className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 mt-4 pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                Danger zone
              </div>
              <button
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="w-full rounded-xl cursor-pointer font-[inherit] flex items-center gap-2 text-[13px] font-semibold min-h-[48px] px-4"
                style={{
                  background: "var(--color-danger-bg)",
                  border: "1px solid var(--color-danger-border)",
                  color: "var(--color-danger)",
                }}
              >
                <span className="text-base">✕</span>
                Remove from today
              </button>
              <div className="text-[10px] text-text-muted mt-1 px-1 leading-snug">
                Only affects today&rsquo;s session. The exercise will return
                tomorrow.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

EditExerciseSheet.displayName = "EditExerciseSheet";
