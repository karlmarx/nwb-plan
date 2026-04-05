"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/badge";
import EquipmentSwapPanel from "@/components/equipment-swap-panel";
import { Exercise, EQUIPMENT } from "@/lib/exercises";

interface ExerciseRowProps {
  name: string;
  ex: Exercise;
  phase: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSwap: (name: string) => void;
  onDiagram: (diagram: string) => void;
  unavailable: boolean;
  equipment: Record<string, boolean>;
  workoutExercises?: string[];
  variantSetupCues?: string[];
  variantLabel?: string;
  supplementSlot?: React.ReactNode;
  selectedVariantId?: string | null;
  onSelectVariant?: (id: string) => void;
  editMode?: boolean;
}

export default function ExerciseRow({
  name,
  ex,
  phase,
  isExpanded,
  onToggle,
  onSwap,
  onDiagram,
  unavailable,
  equipment,
  workoutExercises = [],
  variantSetupCues,
  variantLabel,
  supplementSlot,
  selectedVariantId,
  onSelectVariant,
  editMode = true,
}: ExerciseRowProps) {
  const [swapOpen, setSwapOpen] = useState(false);
  useEffect(() => { if (!editMode) setSwapOpen(false); }, [editMode]);

  if (!ex) return null;

  const showInstructions = editMode && !swapOpen;
  const showSwap = editMode && swapOpen;
  const hasSwapOptions =
    (ex.swaps && ex.swaps.length > 0) ||
    (ex.machineVariants && ex.machineVariants.length > 0);

  const safetyColor =
    ex.safety === "caution"
      ? "var(--color-warning)"
      : ex.safety === "danger"
        ? "var(--color-danger)"
        : "var(--color-safe)";

  const s = ex.sets[phase] ?? ex.sets[0];

  return (
    <div
      data-testid="exercise-row"
      className="mb-2 rounded-xl overflow-hidden transition-all duration-150"
      style={{
        background: isExpanded ? "var(--color-card)" : "var(--color-bg)",
        borderLeft: `3px solid ${unavailable ? "var(--color-danger)" : safetyColor}`,
        opacity: unavailable ? 0.5 : 1,
        boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
      }}
    >
      {/* Collapsed header - tappable */}
      <div
        onClick={onToggle}
        className="px-3.5 py-3 cursor-pointer min-h-[48px] flex items-center"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <span
              data-testid="exercise-name"
              className="font-semibold text-sm"
              style={{
                color: unavailable
                  ? "var(--color-danger)"
                  : "var(--color-text)",
              }}
            >
              {name}
            </span>
            {ex.safety === "caution" && (
              <Badge color="var(--color-warning)">MODIFIED</Badge>
            )}
            {ex.phase != null && phase < ex.phase && (
              <Badge color="var(--color-text-muted)">
                Wk {ex.phase * 2 + 1}+
              </Badge>
            )}
            {unavailable && (
              <Badge color="var(--color-danger)">NO EQUIP</Badge>
            )}
            {!isExpanded && variantLabel && (
              <Badge color="var(--color-accent)">{variantLabel}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {!isExpanded && (
              <span className="text-xs text-text-dim font-medium tabular-nums">
                {s[0]}&times;{s[1]}
              </span>
            )}
            <span
              className="text-xs transition-transform duration-200"
              style={{
                color: isExpanded ? "var(--color-accent)" : "var(--color-text-muted)",
              }}
            >
              {isExpanded ? "\u25B2" : "\u25BC"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="section-content px-3.5 pb-4">
          {/* Superset cards — rendered first so they're the first thing seen on expand */}
          {supplementSlot}

          {/* Sets / Reps / Rest stats */}
          <div className="flex gap-4 mb-4 py-2.5 border-b border-border">
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                Sets &times; Reps
              </div>
              <div className="text-base font-bold text-accent tabular-nums mt-0.5">
                {s[0]} &times; {s[1]}
              </div>
            </div>
            {ex.rest > 0 && (
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                  Rest
                </div>
                <div className="text-base font-bold text-text tabular-nums mt-0.5">{ex.rest}s</div>
              </div>
            )}
          </div>

          {showInstructions && <div className="text-[13px] leading-relaxed space-y-3">
            {/* SETUP */}
            <div>
              <div className="font-bold text-accent mb-1 text-[11px] uppercase tracking-wide">
                {"\u{1F4CD}"} Setup &amp; Position
              </div>
              <div className="text-text-dim">{ex.setup}</div>
              {variantSetupCues && variantSetupCues.length > 0 && (
                <div
                  className="mt-2 rounded-lg"
                  style={{
                    padding: "8px 10px",
                    background: "var(--color-accent-dim)",
                    border: "1px solid var(--color-accent)33",
                  }}
                >
                  <div className="text-[10px] font-bold text-accent uppercase mb-1">
                    {variantLabel ? `${variantLabel} Setup` : "Machine-Specific Setup"}
                  </div>
                  <ul className="m-0 pl-4 list-disc">
                    {variantSetupCues.map((cue, i) => (
                      <li key={i} className="text-text-dim mb-0.5">{cue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* EXECUTE */}
            <div>
              <div className="font-bold text-safe mb-1 text-[11px] uppercase tracking-wide">
                {"\u{1F504}"} How to Execute
              </div>
              <div className="text-text-dim">{ex.execution}</div>
            </div>

            {/* NWB SAFETY */}
            <div>
              <div className="font-bold text-warning mb-1 text-[11px] uppercase tracking-wide">
                {"\u{1F6E1}\uFE0F"} NWB Safety Cues
              </div>
              <div className="text-text-dim">{ex.nwbCues}</div>
            </div>

            {/* WHY THIS EXERCISE */}
            <div>
              <div className="font-bold text-text mb-1 text-[11px] uppercase tracking-wide">
                {"\u{1F3AF}"} Why This Exercise
              </div>
              <div className="text-text-dim">{ex.why}</div>
            </div>

            {/* Diagram button */}
            {ex.diagram && (
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  onDiagram(ex.diagram!);
                }}
                data-testid="view-diagram"
                className="w-full p-3 rounded-xl cursor-pointer font-[inherit] flex items-center justify-center gap-2 text-[13px] font-bold text-accent min-h-[48px] transition-colors duration-150"
                style={{
                  background: "var(--color-accent)11",
                  border: "1px solid var(--color-accent)33",
                }}
              >
                {"\u{1F4D0}"} View Movement Diagram
              </button>
            )}

            {/* Visual guide (pre block) */}
            {ex.visual && !ex.diagram && (
              <div>
                <div className="font-bold text-accent mb-1 text-[11px] uppercase tracking-wide">
                  {"\u{1F4D0}"} Visual Guide
                </div>
                <pre className="font-mono text-[12px] whitespace-pre overflow-x-auto rounded-xl p-3 m-0 text-text-dim bg-bg border border-border">
                  {ex.visual}
                </pre>
              </div>
            )}

            {/* Tempo */}
            {ex.tempo && (
              <div className="flex gap-2.5 items-center">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  Tempo
                </span>
                <span className="text-sm text-accent font-semibold font-mono">
                  {ex.tempo}
                </span>
              </div>
            )}

            {/* Amplification tiers */}
            {ex.amp && (
              <div>
                <div className="text-[10px] text-text-muted uppercase font-bold mb-2 tracking-wider">
                  {"\u{1F525}"} Amplification Tiers
                </div>
                {ex.amp.map((level, i) => {
                  const colors = [
                    "var(--color-safe)",
                    "var(--color-warning)",
                    "var(--color-danger)",
                  ];
                  return (
                    <div
                      key={`amp-${i}`}
                      className="py-2 px-2.5 mb-1 rounded-lg text-[13px] text-text-dim leading-relaxed"
                      style={{
                        background: colors[i] + "11",
                        borderLeft: `3px solid ${colors[i]}66`,
                      }}
                    >
                      {level}
                    </div>
                  );
                })}
              </div>
            )}
          </div>}

          {/* Equipment chips */}
          {showInstructions && ex.requires.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
              {ex.requires.map((eq) => {
                const eqData = EQUIPMENT[eq];
                const has = equipment[eq] !== false;
                return (
                  <span
                    key={eq}
                    className="text-[11px] rounded-md font-medium"
                    style={{
                      padding: "3px 8px",
                      background: has
                        ? "var(--color-safe-bg)"
                        : "var(--color-danger-bg)",
                      color: has
                        ? "var(--color-safe)"
                        : "var(--color-danger)",
                      border: `1px solid ${has ? "var(--color-safe-border)" : "var(--color-danger-border)"}`,
                    }}
                  >
                    {eqData ? eqData.icon : ""}{" "}
                    {eqData ? eqData.name : eq}
                  </span>
                );
              })}
            </div>
          )}

          {/* Equipment toggle + swap panel (edit mode only) */}
          {hasSwapOptions && editMode && (
            <>
              <button
                onClick={(ev) => { ev.stopPropagation(); setSwapOpen((v) => !v); }}
                className="mt-3 w-full p-2.5 rounded-xl cursor-pointer font-[inherit] flex items-center justify-between text-[12px] font-semibold min-h-[44px] transition-all duration-150"
                style={{
                  background: swapOpen ? "var(--color-accent)15" : "var(--color-bg)",
                  border: `1px solid ${swapOpen ? "var(--color-accent)55" : "var(--color-border)"}`,
                  color: swapOpen ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                <span>🔄 Equipment &amp; Alternatives</span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{ transform: swapOpen ? "rotate(180deg)" : "none" }}
                >▼</span>
              </button>
              {showSwap && (
                <EquipmentSwapPanel
                  currentName={name}
                  currentExercise={ex}
                  onSwap={onSwap}
                  equipment={equipment}
                  workoutExercises={workoutExercises}
                  selectedVariantId={selectedVariantId}
                  onSelectVariant={onSelectVariant}
                />
              )}
            </>
          )}

          {/* Rest timer button */}
          {ex.rest > 0 && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onSwap("__timer__" + ex.rest);
              }}
              className="mt-3 w-full p-3 rounded-xl text-sm font-bold cursor-pointer font-[inherit] text-accent min-h-[48px] transition-colors duration-150"
              style={{
                background: "var(--color-accent)" + "15",
                border: `1px solid var(--color-accent)33`,
              }}
            >
              {"\u23F1"} Start {ex.rest}s Rest Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
