"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { CATEGORIES, EXERCISES, type ExerciseDiagram } from "./data";
import { SUPINE_ANIMS } from "./supine";
import { TRX_ANIMS } from "./trx";
import { ARM_BALANCE_ANIMS } from "./arm-balance";
import { RACK_CORE_ANIMS } from "./rack-core";
import { PRONE_ANIMS } from "./prone";
import { GLUTE_ANIMS } from "./glute";
import { YOGA_ANIMS } from "./yoga";
import { EQUIPMENT_ANIMS } from "./equipment";

// Merge all animation maps
const ALL_ANIMS: Record<string, ComponentType<{ t: number }>> = {
  ...RACK_CORE_ANIMS,
  ...SUPINE_ANIMS,
  ...PRONE_ANIMS,
  ...GLUTE_ANIMS,
  ...TRX_ANIMS,
  ...ARM_BALANCE_ANIMS,
  ...YOGA_ANIMS,
  ...EQUIPMENT_ANIMS,
};

interface DiagramGalleryProps {
  initialExercise?: string; // Pre-select by exercise ID
  onClose?: () => void;
}

export default function DiagramGallery({ initialExercise, onClose }: DiagramGalleryProps) {
  // Find initial category from exercise ID
  const initialCat = initialExercise
    ? EXERCISES.find(e => e.id === initialExercise)?.category ?? "rack"
    : "rack";

  const [cat, setCat] = useState(initialCat);
  const [active, setActive] = useState(initialExercise ?? "r1");
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);

  // Animation loop
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => setT(p => (p + 0.006) % 1), 25);
    return () => clearInterval(iv);
  }, [paused]);

  // Reset animation when exercise changes
  useEffect(() => {
    setT(0);
    setPaused(false);
  }, [active]);

  // When category changes, select first exercise
  useEffect(() => {
    const first = EXERCISES.find(e => e.category === cat);
    if (first) setActive(first.id);
  }, [cat]);

  const catExercises = EXERCISES.filter(e => e.category === cat);
  const ex = EXERCISES.find(e => e.id === active);
  const AnimComponent = ALL_ANIMS[active];
  const catInfo = CATEGORIES.find(c => c.key === cat);
  const accent = catInfo?.accent ?? "#2ecc71";

  // Navigation to specific exercise (from cross-link)
  const goToExercise = useCallback((id: string) => {
    const exercise = EXERCISES.find(e => e.id === id);
    if (exercise) {
      setCat(exercise.category);
      setActive(exercise.id);
    }
  }, []);

  // If initialExercise is set and different from current, navigate
  useEffect(() => {
    if (initialExercise) {
      goToExercise(initialExercise);
    }
  }, [initialExercise, goToExercise]);

  if (!ex) return null;

  return (
    <div className="min-h-full" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="max-w-[500px] mx-auto px-3 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] tracking-[3px] uppercase" style={{ color: "var(--color-text-muted)" }}>
              NWB Safe · Exercise Library
            </div>
            <h1 className="text-lg font-bold m-0" style={{ color: accent }}>
              Diagram Gallery
            </h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs cursor-pointer font-[inherit] min-h-[36px]"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              &times; Close
            </button>
          )}
        </div>

        {/* Category tabs — wrapped pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES.map(c => {
            const isActive = c.key === cat;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className="px-2.5 py-1.5 text-[11px] font-[inherit] rounded-md cursor-pointer transition-all min-h-[36px]"
                style={{
                  border: isActive ? `1.5px solid ${c.accent}` : "1.5px solid var(--color-border)",
                  background: isActive ? c.accent + "18" : "var(--color-card)",
                  color: isActive ? c.accent : "var(--color-text-muted)",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Exercise selector pills */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {catExercises.map((e) => {
            const isActive = e.id === active;
            return (
              <button
                key={e.id}
                onClick={() => setActive(e.id)}
                className="px-2.5 py-1.5 text-[11px] font-[inherit] rounded-md cursor-pointer transition-all min-h-[36px]"
                style={{
                  border: isActive ? `1.5px solid ${accent}` : "1.5px solid var(--color-border)",
                  background: isActive ? accent + "15" : "var(--color-card)",
                  color: isActive ? accent : "var(--color-text-muted)",
                }}
              >
                {e.name}
              </button>
            );
          })}
        </div>

        {/* Exercise title + target */}
        <div className="mb-2.5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-sm font-semibold m-0 text-text">{ex.name}</h2>
            {ex.equipment?.map(eq => (
              <span
                key={eq}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--color-card)",
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {eq}
              </span>
            ))}
          </div>
          <div className="text-[11px]" style={{ color: accent }}>{ex.target}</div>
        </div>

        {/* SVG Animation area */}
        <div
          className="rounded-xl overflow-hidden mb-3 relative cursor-pointer"
          onClick={() => setPaused(!paused)}
          style={{
            background: "#0e0e0e",
            border: "1px solid var(--color-border)",
          }}
        >
          <svg viewBox="0 0 400 240" width="100%" style={{ display: "block" }}>
            {AnimComponent && <AnimComponent t={t} />}
          </svg>

          {/* Legend bar */}
          <div className="flex gap-3 justify-center py-2 text-[9px]" style={{ color: "var(--color-text-muted)" }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#e74c3c" }} />
              Left (passive)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#2ecc71" }} />
              Active
            </span>
            {(cat === "trx" || cat === "arm") && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 inline-block" style={{ background: "#f39c12" }} />
                TRX/Strap
              </span>
            )}
          </div>

          {/* Play/pause button */}
          <button
            onClick={(e) => { e.stopPropagation(); setPaused(!paused); }}
            className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-[10px] cursor-pointer font-[inherit]"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            {paused ? "\u25B6" : "\u23F8"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded mb-3" style={{ background: "var(--color-border)" }}>
          <div className="h-full rounded" style={{ width: `${t * 100}%`, background: accent }} />
        </div>

        {/* Coaching cues */}
        <div
          className="rounded-lg p-3 mb-3"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-text-muted)" }}>
            Coaching Cues
          </div>
          <div className="flex flex-col gap-2">
            {ex.cues.map((cue, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div
                  className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: accent + "20",
                    color: accent,
                    border: `1px solid ${accent}44`,
                  }}
                >
                  {i + 1}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-dim)" }}>{cue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety note */}
        {ex.safetyNote && (
          <div
            className="rounded-lg p-3 mb-3"
            style={{
              background: "#1a130822",
              border: "1px solid var(--color-warning)33",
            }}
          >
            <span className="text-[11px] font-bold mr-1.5" style={{ color: "var(--color-warning)" }}>
              {"\u26A0"} NWB Safety:
            </span>
            <span className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-dim)" }}>
              {ex.safetyNote}
            </span>
          </div>
        )}

        {/* Global safety footer */}
        <div className="text-center text-[9px] py-3 tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Zero Left Iliopsoas &middot; NWB Left &middot; Hip Flexion &lt;90&deg;
        </div>
      </div>
    </div>
  );
}

// Export the animation map so exercise cards can check if a diagram exists
export { ALL_ANIMS };
