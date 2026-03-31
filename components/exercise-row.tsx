"use client";

import React from "react";
import Badge from "@/components/badge";
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
}: ExerciseRowProps) {
  if (!ex) return null;

  const safetyColor =
    ex.safety === "caution"
      ? "var(--color-warning)"
      : ex.safety === "danger"
        ? "var(--color-danger)"
        : "var(--color-safe)";

  const s = ex.sets[phase] ?? ex.sets[0];

  return (
    <div
      className="mb-1.5 rounded-lg overflow-hidden"
      style={{
        background: isExpanded ? "color-mix(in srgb, var(--color-card) 70%, var(--color-bg))" : "var(--color-bg)",
        borderLeft: `3px solid ${unavailable ? "var(--color-danger)" : safetyColor}`,
        opacity: unavailable ? 0.5 : 1,
      }}
    >
      {/* Collapsed header - tappable */}
      <div
        onClick={onToggle}
        className="px-3 py-2.5 cursor-pointer min-h-[44px] flex items-center"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <span
              className="font-semibold text-[13px]"
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
          </div>
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <span className="text-[11px] text-text-dim">
                {s[0]}&times;{s[1]}
              </span>
            )}
            <span className="text-[10px] text-accent">
              {isExpanded ? "\u25B2" : "\u24D8"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Sets / Reps / Rest stats */}
          <div className="flex gap-3 mb-3 py-2 border-b border-border">
            <div>
              <div className="text-[9px] text-text-muted uppercase">
                Sets &times; Reps
              </div>
              <div className="text-sm font-bold text-accent">
                {s[0]} &times; {s[1]}
              </div>
            </div>
            {ex.rest > 0 && (
              <div>
                <div className="text-[9px] text-text-muted uppercase">
                  Rest
                </div>
                <div className="text-sm font-bold text-text">{ex.rest}s</div>
              </div>
            )}
          </div>

          <div className="text-[11px] leading-[1.7]">
            {/* SETUP */}
            <div className="mb-2.5">
              <div className="font-bold text-accent mb-1 text-[10px]">
                {"\u{1F4CD}"} SETUP &amp; POSITION
              </div>
              <div className="text-text-dim">{ex.setup}</div>
            </div>

            {/* EXECUTE */}
            <div className="mb-2.5">
              <div className="font-bold text-safe mb-1 text-[10px]">
                {"\u{1F504}"} HOW TO EXECUTE
              </div>
              <div className="text-text-dim">{ex.execution}</div>
            </div>

            {/* NWB SAFETY */}
            <div className="mb-2.5">
              <div className="font-bold text-warning mb-1 text-[10px]">
                {"\u{1F6E1}\uFE0F"} NWB SAFETY CUES
              </div>
              <div className="text-text-dim">{ex.nwbCues}</div>
            </div>

            {/* WHY THIS EXERCISE */}
            <div className="mb-2.5">
              <div className="font-bold text-text mb-1 text-[10px]">
                {"\u{1F3AF}"} WHY THIS EXERCISE
              </div>
              <div className="text-text-dim">{ex.why}</div>
            </div>

            {/* Diagram button */}
            {ex.diagram && (
              <div className="mb-2.5">
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDiagram(ex.diagram!);
                  }}
                  className="w-full p-3 rounded-lg border cursor-pointer font-[inherit] flex items-center justify-center gap-2 text-xs font-bold text-accent min-h-[44px]"
                  style={{
                    background: "var(--color-bg)",
                    borderColor: "var(--color-accent)",
                    opacity: 0.7,
                  }}
                >
                  {"\u{1F4D0}"} View Movement Diagram
                </button>
              </div>
            )}

            {/* Visual guide (pre block) */}
            {ex.visual && !ex.diagram && (
              <div className="mb-2.5">
                <div className="font-bold text-accent mb-1 text-[10px]">
                  {"\u{1F4D0}"} VISUAL GUIDE
                </div>
                <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto rounded-lg p-2.5 m-0 text-text-dim bg-bg border border-border">
                  {ex.visual}
                </pre>
              </div>
            )}

            {/* Tempo */}
            {ex.tempo && (
              <div className="flex gap-2 mb-2.5 items-center">
                <span className="text-[9px] text-text-muted uppercase font-bold">
                  TEMPO
                </span>
                <span className="text-xs text-accent font-semibold font-mono">
                  {ex.tempo}
                </span>
              </div>
            )}

            {/* Amplification tiers */}
            {ex.amp && (
              <div className="mb-2.5">
                <div className="text-[9px] text-text-muted uppercase font-bold mb-1.5">
                  {"\u{1F525}"} AMPLIFICATION TIERS
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
                      className="py-1.5 px-2 mb-0.5 rounded-md text-[11px] text-text-dim leading-relaxed"
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
          </div>

          {/* Equipment chips */}
          {ex.requires.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {ex.requires.map((eq) => {
                const eqData = EQUIPMENT[eq];
                const has = equipment[eq] !== false;
                return (
                  <span
                    key={eq}
                    className="text-[10px] rounded"
                    style={{
                      padding: "2px 6px",
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

          {/* Swap buttons */}
          {ex.swaps && ex.swaps.length > 0 && (() => {
            const availableSwaps = ex.swaps.filter(
              (sw) => !workoutExercises.includes(sw) || sw === name
            );
            if (availableSwaps.length === 0) return null;
            return (
            <div>
              <div className="text-[10px] font-bold text-text-muted mb-1.5 uppercase">
                Swap for:
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSwaps.map((sw) => {
                  return (
                    <button
                      key={sw}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSwap(sw);
                      }}
                      className="text-[11px] rounded-md cursor-pointer font-[inherit] min-h-[44px]"
                      style={{
                        padding: "6px 10px",
                        background: "var(--color-accent)" + "22",
                        color: "var(--color-accent)",
                        border: `1px solid var(--color-accent)44`,
                      }}
                    >
                      {sw}
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })()}

          {/* Rest timer button */}
          {ex.rest > 0 && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onSwap("__timer__" + ex.rest);
              }}
              className="mt-2.5 w-full p-2.5 rounded-lg text-[13px] font-bold cursor-pointer font-[inherit] text-accent min-h-[44px]"
              style={{
                background: "var(--color-accent)" + "22",
                border: `1px solid var(--color-accent)44`,
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
