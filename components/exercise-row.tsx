"use client";

import React from "react";
import Badge from "@/components/badge";
import { Exercise, EQUIPMENT } from "@/lib/exercises";
import { EXERCISE_TO_DIAGRAM } from "@/components/diagrams";
import { useLongPress } from "@/lib/use-long-press";
import { cssAlpha } from "@/lib/css-utils";

interface ExerciseRowProps {
  name: string;
  ex: Exercise;
  phase: number;
  isExpanded: boolean;
  onToggle: () => void;
  onLongPress?: () => void;
  onStartTimer?: (seconds: number) => void;
  onDiagram: (diagram: string) => void;
  onOpenDiagram?: (diagramId: string) => void;
  unavailable: boolean;
  equipment: Record<string, boolean>;
  variantSetupCues?: string[];
  variantLabel?: string;
  /**
   * Requires override from the active machine variant. When present it
   * replaces `ex.requires` for the equipment-chip display so the chips
   * match what the selected variant actually needs.
   */
  variantRequires?: string[];
  /** Add-complement pill rendered below the exercise's detail block */
  addComplementSlot?: React.ReactNode;
  /** Small top-right action button (opens edit sheet). Hidden if omitted. */
  showActionButton?: boolean;
}

export default function ExerciseRow({
  name,
  ex,
  phase,
  isExpanded,
  onToggle,
  onLongPress,
  onStartTimer,
  onDiagram,
  onOpenDiagram,
  unavailable,
  equipment,
  variantSetupCues,
  variantLabel,
  variantRequires,
  addComplementSlot,
  showActionButton = true,
}: ExerciseRowProps) {
  const longPressHandlers = useLongPress(
    () => onLongPress?.(),
    () => onToggle(),
    { delay: 500 },
  );

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
      data-testid="exercise-row"
      className="mb-2 rounded-xl overflow-hidden transition-all duration-150"
      style={{
        background: isExpanded ? "var(--color-card)" : "var(--color-bg)",
        borderLeft: `3px solid ${unavailable ? "var(--color-danger)" : safetyColor}`,
        opacity: unavailable ? 0.5 : 1,
        boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
      }}
    >
      {/* Collapsed header — tappable (long-press aware) */}
      <div
        data-testid="exercise-row-header"
        className="px-3.5 py-3 cursor-pointer min-h-[48px] flex items-center select-none"
        onTouchStart={longPressHandlers.onTouchStart}
        onTouchMove={longPressHandlers.onTouchMove}
        onTouchEnd={longPressHandlers.onTouchEnd}
        onTouchCancel={longPressHandlers.onTouchCancel}
        onContextMenu={longPressHandlers.onContextMenu}
        onClick={longPressHandlers.onClick}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
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
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isExpanded && (
              <span className="text-xs text-text-dim font-medium tabular-nums">
                {s[0]}&times;{s[1]}
              </span>
            )}
            <span
              className="text-xs transition-transform duration-200"
              style={{
                color: isExpanded
                  ? "var(--color-accent)"
                  : "var(--color-text-muted)",
              }}
            >
              {isExpanded ? "\u25B2" : "\u25BC"}
            </span>
            {showActionButton && onLongPress && (
              <button
                data-testid="exercise-row-action"
                aria-label="Equipment & edit"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onLongPress();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  lineHeight: 1,
                }}
                title="Equipment swap, machine, reorder (long-press on mobile)"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="section-content px-3.5 pb-4">
          {/* Sets / Reps / Rest stats — first so it's the action-focused header */}
          <div className="flex gap-4 mb-3 py-2.5 border-b border-border">
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
                <div className="text-base font-bold text-text tabular-nums mt-0.5">
                  {ex.rest}s
                </div>
              </div>
            )}
          </div>

          {/* Diagram buttons — directly under sets/reps for fastest access */}
          {EXERCISE_TO_DIAGRAM[ex.id] && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onOpenDiagram?.(EXERCISE_TO_DIAGRAM[ex.id]);
              }}
              data-testid="view-diagram"
              className="w-full p-3 rounded-xl cursor-pointer font-[inherit] flex items-center justify-center gap-2 text-[13px] font-bold text-accent min-h-[48px] transition-colors duration-150 mb-3"
              style={{
                background: cssAlpha("var(--color-accent)", 7),
                border: `1px solid ${cssAlpha("var(--color-accent)", 20)}`,
              }}
            >
              {"\u{1F4D0}"} View Movement Diagram
            </button>
          )}
          {ex.diagram && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onDiagram(ex.diagram!);
              }}
              data-testid="view-safety-diagram"
              className="w-full p-3 rounded-xl cursor-pointer font-[inherit] flex items-center justify-center gap-2 text-[13px] font-bold min-h-[48px] transition-colors duration-150 mb-3"
              style={{
                background: cssAlpha("var(--color-warning)", 7),
                border: `1px solid ${cssAlpha("var(--color-warning)", 20)}`,
                color: "var(--color-warning)",
              }}
            >
              {"\u{1F6E1}\uFE0F"} View Safety Diagram
            </button>
          )}

          {/* Add-complement pill — right under the diagram button */}
          {addComplementSlot}

          {/* Instructions */}
          <div className="text-[13px] leading-relaxed space-y-3 mt-3">
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
                    border: `1px solid ${cssAlpha("var(--color-accent)", 20)}`,
                  }}
                >
                  <div className="text-[10px] font-bold text-accent uppercase mb-1">
                    {variantLabel
                      ? `${variantLabel} Setup`
                      : "Machine-Specific Setup"}
                  </div>
                  <ul className="m-0 pl-4 list-disc">
                    {variantSetupCues.map((cue, i) => (
                      <li key={i} className="text-text-dim mb-0.5">
                        {cue}
                      </li>
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
          </div>

          {/* Equipment chips — show the active variant's requires when set,
              otherwise fall back to the exercise-level requires. */}
          {(() => {
            const chipReqs = variantRequires ?? ex.requires;
            return chipReqs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
              {chipReqs.map((eq) => {
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
                    {eqData ? eqData.icon : ""} {eqData ? eqData.name : eq}
                  </span>
                );
              })}
            </div>
            );
          })()}

          {/* Rest timer button */}
          {ex.rest > 0 && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onStartTimer?.(ex.rest);
              }}
              className="mt-3 w-full p-3 rounded-xl text-sm font-bold cursor-pointer font-[inherit] text-accent min-h-[48px] transition-colors duration-150"
              style={{
                background: cssAlpha("var(--color-accent)", 8),
                border: `1px solid ${cssAlpha("var(--color-accent)", 20)}`,
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
