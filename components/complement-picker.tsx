"use client";

import React, { useMemo } from "react";
import {
  NEARBY_SUPERSETS,
  SUPPLEMENT_LEFT_LEG,
  SUPPLEMENT_EX,
  EQUIP_TO_NEARBY,
  MOBILITY_SUPPLEMENTS,
  type NearbySuperset,
  type MobilitySupplement,
} from "@/lib/supplements";

/**
 * A complement the user can add to an exercise. There are three kinds:
 *  - "nearby"   — one of NEARBY_SUPERSETS (needs nearby equipment)
 *  - "supp"     — a left-leg supplement (looked up in SUPPLEMENT_EX by name)
 *  - "mobility" — a zero-equipment mobility / stretch / breathing drill
 */
export type ComplementId = string;

export function encodeNearbyId(ns: NearbySuperset): ComplementId {
  return `nearby:${ns.nearbyId}:${ns.title}`;
}
export function encodeSuppId(name: string): ComplementId {
  return `supp:${name}`;
}
export function encodeMobilityId(m: MobilitySupplement): ComplementId {
  return `mob:${m.id}`;
}

export function decodeComplement(id: ComplementId): {
  kind: "nearby" | "supp" | "mobility";
  value: string;
  sub?: string;
} {
  const [kind, ...rest] = id.split(":");
  if (kind === "nearby") {
    return { kind: "nearby", value: rest[0], sub: rest.slice(1).join(":") };
  }
  if (kind === "mob") {
    return { kind: "mobility", value: rest.join(":") };
  }
  return { kind: "supp", value: rest.join(":") };
}

interface ComplementPickerProps {
  exerciseRequires: string[];
  exerciseCategory: string;
  nearbySelections: string[];
  activeIds: ComplementId[];
  onToggle: (id: ComplementId) => void;
  onClose: () => void;
}

/**
 * Show only complements whose required equipment is either:
 *  - already in use by the current exercise, OR
 *  - marked nearby by the user, OR
 *  - a generic left-leg supplement that needs no equipment
 */
export default function ComplementPicker({
  exerciseRequires,
  exerciseCategory,
  nearbySelections,
  activeIds,
  onToggle,
  onClose,
}: ComplementPickerProps) {
  const activeSet = useMemo(() => new Set(activeIds), [activeIds]);

  const { nearbyAvail, suppAvail, mobilityAvail } = useMemo(() => {
    // Collect all "near" equipment: what's in use + what's marked nearby
    const inUseIds = new Set(
      exerciseRequires.map((r) => EQUIP_TO_NEARBY[r]).filter(Boolean),
    );
    const reach = new Set<string>([...inUseIds, ...nearbySelections]);

    // Nearby supersets filtered to reachable equipment only
    const nearbyAvail = NEARBY_SUPERSETS.filter((ns) => reach.has(ns.nearbyId));

    // Left-leg supplements are always available (they need no external equipment)
    const suppAvail = [...SUPPLEMENT_LEFT_LEG.base, ...SUPPLEMENT_LEFT_LEG.legsExtra]
      .map((name) => {
        const data = SUPPLEMENT_EX[name];
        return data ? { name, data } : null;
      })
      .filter(Boolean) as Array<{
      name: string;
      data: (typeof SUPPLEMENT_EX)[string];
    }>;

    // Mobility / stretch / breathing — always available, filtered by category
    const mobilityAvail = MOBILITY_SUPPLEMENTS.filter((m) =>
      m.appliesTo.includes("all") ||
      m.appliesTo.includes(exerciseCategory as "push" | "pull" | "legs" | "core" | "cardio"),
    );

    return { nearbyAvail, suppAvail, mobilityAvail };
  }, [exerciseRequires, exerciseCategory, nearbySelections]);

  const hasAny =
    nearbyAvail.length > 0 || suppAvail.length > 0 || mobilityAvail.length > 0;

  return (
    <div
      data-testid="complement-picker"
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
              Add complement
            </div>
            <div className="text-sm font-semibold text-text">
              Equipment-aware rehab &amp; core suggestions
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 pt-3">
          {!hasAny && (
            <div className="text-[12px] text-text-muted py-3 leading-relaxed">
              Nothing in reach right now. Open the edit sheet and select nearby
              equipment, or try adding generic quad sets below.
            </div>
          )}

          {nearbyAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                In reach ({nearbyAvail.length})
              </div>
              <div className="space-y-1.5 mb-4">
                {nearbyAvail.map((ns) => {
                  const id = encodeNearbyId(ns);
                  const active = activeSet.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => onToggle(id)}
                      className="w-full text-left rounded-xl cursor-pointer font-[inherit] p-3 transition-colors duration-150"
                      style={{
                        background: active
                          ? "#14b8a618"
                          : "var(--color-bg)",
                        border: active
                          ? "1px solid #14b8a655"
                          : "1px solid var(--color-border)",
                        borderLeft: "3px solid #14b8a6",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                          style={{
                            background: "#14b8a622",
                            border: "1px solid #14b8a644",
                            color: "#14b8a6",
                          }}
                        >
                          NEARBY
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#14b8a6" }}
                        >
                          {ns.title}
                        </span>
                        <span className="ml-auto text-[10px] text-text-dim">
                          {ns.sets}
                        </span>
                        {active && (
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "#14b8a6" }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-dim leading-snug">
                        {ns.instruction}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {suppAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Left-leg rehab ({suppAvail.length})
              </div>
              <div className="space-y-1.5 mb-4">
                {suppAvail.map(({ name, data }) => {
                  const id = encodeSuppId(name);
                  const active = activeSet.has(id);
                  const sets = data.sets[0];
                  return (
                    <button
                      key={id}
                      onClick={() => onToggle(id)}
                      className="w-full text-left rounded-xl cursor-pointer font-[inherit] p-3 transition-colors duration-150"
                      style={{
                        background: active
                          ? "#14b8a618"
                          : "var(--color-bg)",
                        border: active
                          ? "1px solid #14b8a655"
                          : "1px solid var(--color-border)",
                        borderLeft: "3px solid #14b8a6",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                          style={{
                            background: "#14b8a622",
                            border: "1px solid #14b8a644",
                            color: "#14b8a6",
                          }}
                        >
                          L-LEG
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#14b8a6" }}
                        >
                          {name}
                        </span>
                        <span className="ml-auto text-[10px] text-text-dim">
                          {sets[0]}&times;{sets[1]}
                        </span>
                        {active && (
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "#14b8a6" }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-dim leading-snug">
                        {data.execution}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mobilityAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Mobility &amp; stretches ({mobilityAvail.length})
              </div>
              <div className="text-[10px] text-text-muted mb-2 leading-snug">
                Zero equipment — do these right on the machine you&rsquo;re using.
              </div>
              <div className="space-y-1.5">
                {mobilityAvail.map((m) => {
                  const id = encodeMobilityId(m);
                  const active = activeSet.has(id);
                  const color =
                    m.kind === "breathing"
                      ? "#8b5cf6"
                      : m.kind === "stretch"
                        ? "#f59e0b"
                        : "#0ea5e9";
                  const label =
                    m.kind === "breathing"
                      ? "BREATH"
                      : m.kind === "stretch"
                        ? "STRETCH"
                        : "MOBILITY";
                  return (
                    <button
                      key={id}
                      onClick={() => onToggle(id)}
                      className="w-full text-left rounded-xl cursor-pointer font-[inherit] p-3 transition-colors duration-150"
                      style={{
                        background: active
                          ? color + "18"
                          : "var(--color-bg)",
                        border: active
                          ? `1px solid ${color}55`
                          : "1px solid var(--color-border)",
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                          style={{
                            background: color + "22",
                            border: `1px solid ${color}44`,
                            color,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color }}
                        >
                          {m.name}
                        </span>
                        <span className="ml-auto text-[10px] text-text-dim">
                          {m.sets}
                        </span>
                        {active && (
                          <span
                            className="text-[10px] font-bold"
                            style={{ color }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-dim leading-snug">
                        {m.instruction}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
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
              background: "var(--color-accent)18",
              border: "1px solid var(--color-accent)55",
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
