"use client";

import React, { useState, useEffect } from "react";
import Section from "@/components/section";
import Callout from "@/components/callout";
import Badge from "@/components/badge";
import { loadState, saveState } from "@/lib/storage";
import {
  PT_EXERCISES,
  getPTExercisesForPhase,
  groupPTByCategory,
  type PTExercise,
  type PTCategory,
  type RehabPhase,
} from "@/lib/pt-exercises";

// ===== PHASE METADATA =====

const PHASES: { id: RehabPhase; short: string; full: string }[] = [
  { id: "TTWB", short: "TTWB", full: "Toe-Touch Weight-Bearing" },
  { id: "PWB-25", short: "PWB-25", full: "Partial Weight-Bearing 25%" },
  { id: "PWB-50", short: "PWB-50", full: "Partial Weight-Bearing 50%" },
  { id: "PWB-75", short: "PWB-75", full: "Partial Weight-Bearing 75%" },
  { id: "FWB", short: "FWB", full: "Full Weight-Bearing" },
];

const PHASE_BLURB: Record<RehabPhase, string> = {
  TTWB: "Toe-Touch — light potato-chip-pressure on left foot only. Crutches for ambulation.",
  "PWB-25": "Partial Weight-Bearing 25% of body weight on left.",
  "PWB-50": "Partial Weight-Bearing 50% of body weight on left.",
  "PWB-75": "Partial Weight-Bearing 75% of body weight on left.",
  FWB: "Full Weight-Bearing — single-leg-LEFT loaded work introduced cautiously.",
};

// ===== CATEGORY METADATA =====

const CATEGORY_META: Record<
  PTCategory,
  { label: string; icon: string }
> = {
  "glute-activation": { label: "Glute Activation", icon: "\u{1F351}" },
  "quad-activation": { label: "Quad Activation", icon: "\u{1F4AA}" },
  "hip-rotator": { label: "Hip Rotators", icon: "\u{1F501}" },
  "open-chain-knee": { label: "Open-Chain Knee", icon: "\u{1F9B5}" },
  "open-chain-hip": { label: "Open-Chain Hip", icon: "\u{1F9B5}" },
  "closed-chain-bilateral": {
    label: "Closed-Chain Bilateral",
    icon: "\u{1F9CD}",
  },
  "step-work": { label: "Step Work", icon: "\u{1FA9C}" },
  balance: { label: "Balance / Proprioception", icon: "⚖️" },
  "gait-drill": { label: "Gait Drills", icon: "\u{1F6B6}" },
  calf: { label: "Calf", icon: "\u{1F9B6}" },
};

// Stable category render order (matches the order in lib/pt-exercises.ts).
const CATEGORY_ORDER: PTCategory[] = [
  "glute-activation",
  "quad-activation",
  "hip-rotator",
  "open-chain-hip",
  "open-chain-knee",
  "closed-chain-bilateral",
  "step-work",
  "balance",
  "gait-drill",
  "calf",
];

// ===== HELPERS =====

function sideBadgeColor(side: PTExercise["side"]): string {
  switch (side) {
    case "left":
      return "var(--color-danger)";
    case "right":
      return "var(--color-accent)";
    case "weight-shifted-left":
      return "var(--color-warning)";
    case "bilateral":
    default:
      return "var(--color-text-muted)";
  }
}

function sideBadgeLabel(side: PTExercise["side"]): string {
  switch (side) {
    case "left":
      return "LEFT";
    case "right":
      return "RIGHT";
    case "weight-shifted-left":
      return "L-BIAS";
    case "bilateral":
    default:
      return "BILATERAL";
  }
}

// ===== PT EXERCISE CARD =====

function PTCard({ ex }: { ex: PTExercise }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-testid="pt-exercise-card"
      className="mb-2 rounded-xl overflow-hidden transition-all duration-150"
      style={{
        background: open ? "var(--color-card)" : "var(--color-bg)",
        borderLeft: "3px solid #34d399", // emerald-400 — distinct from PWB accent
        boxShadow: open ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-3.5 py-3 cursor-pointer min-h-[48px] flex items-center bg-transparent border-none font-[inherit]"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <span className="font-semibold text-sm text-text">{ex.name}</span>
            <Badge color="#34d399">PT</Badge>
            <Badge color={sideBadgeColor(ex.side)}>{sideBadgeLabel(ex.side)}</Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!open && (
              <span className="text-xs text-text-dim font-medium tabular-nums">
                {ex.sets}
              </span>
            )}
            <span
              className="text-xs transition-transform duration-200"
              style={{
                color: open ? "var(--color-accent)" : "var(--color-text-muted)",
              }}
            >
              {open ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-3.5 pb-3.5 text-[12px] leading-relaxed">
          <div className="mb-2.5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-text-dim">
              <span className="font-semibold text-text">Dose:</span> {ex.sets}
            </span>
            <span className="text-xs text-text-dim">
              <span className="font-semibold text-text">Frequency:</span>{" "}
              {ex.frequency}
            </span>
          </div>

          <div className="mb-2.5">
            <div className="font-semibold text-text text-[12px] mb-0.5">
              Setup
            </div>
            <div className="text-text-dim">{ex.setup}</div>
          </div>

          <div className="mb-2.5">
            <div className="font-semibold text-text text-[12px] mb-0.5">
              Execution
            </div>
            <div className="text-text-dim">{ex.execution}</div>
          </div>

          <div
            className="mb-2.5 rounded-lg p-2.5"
            style={{
              background: "rgba(56,189,248,0.08)",
              borderLeft: "2px solid var(--color-accent)",
            }}
          >
            <div className="font-semibold text-accent text-[12px] mb-0.5">
              PT Cues
            </div>
            <div className="text-text-dim">{ex.ptCues}</div>
          </div>

          <div
            className="mb-2.5 rounded-lg p-2.5"
            style={{
              background: "rgba(52,211,153,0.08)",
              borderLeft: "2px solid #34d399",
            }}
          >
            <div
              className="font-semibold text-[12px] mb-0.5"
              style={{ color: "#34d399" }}
            >
              Progression
            </div>
            <div className="text-text-dim">{ex.progressionCriteria}</div>
          </div>

          {ex.redFlags && (
            <div className="mb-1">
              <Callout type="danger">
                <span className="font-semibold">Red flags:</span> {ex.redFlags}
              </Callout>
            </div>
          )}

          {ex.evidence && (
            <div className="text-[10px] text-text-muted mt-1.5 italic">
              {ex.evidence}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== PHASE PICKER =====

function PhasePicker({
  current,
  onSelect,
}: {
  current: RehabPhase;
  onSelect: (p: RehabPhase) => void;
}) {
  return (
    <div className="mb-3">
      <div
        data-testid="rehab-phase-picker"
        className="flex gap-1 rounded-xl p-1"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        {PHASES.map((p) => {
          const active = p.id === current;
          return (
            <button
              key={p.id}
              data-testid={`rehab-phase-${p.id}`}
              onClick={() => onSelect(p.id)}
              className="flex-1 min-w-0 rounded-lg text-[11px] font-semibold cursor-pointer font-[inherit] transition-all duration-150 px-1 py-2"
              style={{
                background: active ? "#34d39922" : "transparent",
                border: `1px solid ${active ? "#34d39988" : "transparent"}`,
                color: active ? "#34d399" : "var(--color-text-muted)",
              }}
            >
              {p.short}
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-text-dim mt-1.5 px-1">
        <span className="font-semibold text-text">
          {PHASES.find((p) => p.id === current)?.full ?? current}
        </span>
        {" — "}
        {PHASE_BLURB[current]}
      </div>
    </div>
  );
}

// ===== MAIN REHAB TAB =====

export default function RehabTab() {
  const [phase, setPhase] = useState<RehabPhase>(() =>
    loadState<RehabPhase>("nwb_pt_phase", "TTWB"),
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => ({ "rehab-glute-activation": true }),
  );

  useEffect(() => {
    saveState("nwb_pt_phase", phase);
  }, [phase]);

  const filtered = getPTExercisesForPhase(phase);
  const grouped = groupPTByCategory(filtered);
  const totalCount = filtered.length;

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div data-testid="rehab-tab">
      <Callout type="info">
        <span className="font-semibold">Rehab block.</span> Phase-gated PT
        exercises from your prescribed left-leg progression. Daily / EOD dosing
        per the cues on each card. Source of truth: PT clinic protocol.
      </Callout>

      <PhasePicker current={phase} onSelect={setPhase} />

      <div className="text-[11px] text-text-muted mb-3 px-1">
        {totalCount} exercise{totalCount === 1 ? "" : "s"} cleared for{" "}
        <span className="font-semibold text-text">{phase}</span>{" "}
        {`(of ${Object.keys(PT_EXERCISES).length} total).`}
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const meta = CATEGORY_META[cat];
        const sectionKey = `rehab-${cat}`;
        return (
          <Section
            key={sectionKey}
            title={meta.label}
            icon={meta.icon}
            count={items.length}
            isOpen={!!openSections[sectionKey]}
            onToggle={() => toggleSection(sectionKey)}
            accent="#34d399"
            coloredBorder
          >
            {items.map((ex) => (
              <PTCard key={ex.id} ex={ex} />
            ))}
          </Section>
        );
      })}

      {totalCount === 0 && (
        <div
          className="rounded-xl p-4 text-center text-[12px] text-text-dim"
          style={{
            background: "var(--color-card)",
            border: "1px dashed var(--color-border)",
          }}
        >
          No PT exercises cleared for this phase yet. Check with PT.
        </div>
      )}
    </div>
  );
}
