"use client";

import React, { useMemo } from "react";
import {
  NEARBY_SUPERSETS,
  SUPPLEMENT_LEFT_LEG,
  SUPPLEMENT_CORE,
  SUPPLEMENT_EX,
  EQUIP_TO_NEARBY,
  MOBILITY_SUPPLEMENTS,
  type NearbySuperset,
  type MobilitySupplement,
} from "@/lib/supplements";
import {
  getLeftLegConditioningPT,
  type RehabPhase,
} from "@/lib/pt-exercises";
import { loadState } from "@/lib/storage";
import { cssAlpha } from "@/lib/css-utils";

/**
 * A complement the user can add to an exercise. There are seven kinds:
 *  - "nearby"   — one of NEARBY_SUPERSETS (needs nearby equipment)
 *  - "supp"     — a left-leg supplement (looked up in SUPPLEMENT_EX by name)
 *  - "core"     — a core drill from SUPPLEMENT_CORE for the current workout day
 *                 (also looked up in SUPPLEMENT_EX by name; distinct kind so it
 *                 can render with a CORE label + region color)
 *  - "mobility" — a zero-equipment mobility / stretch / breathing drill
 *  - "pt"       — a phase-gated PT exercise from PT_EXERCISES (left-leg
 *                 conditioning surface; filtered by current nwb_pt_phase)
 *  - "lib"      — any catalog exercise looked up in EX by display name
 *  - "text"     — free-form user text (base64-encoded payload)
 */
export type ComplementId = string;

const SEP = "|";

export function encodeNearbyId(ns: NearbySuperset): ComplementId {
  return `nearby${SEP}${ns.nearbyId}${SEP}${ns.title}`;
}
export function encodeSuppId(name: string): ComplementId {
  return `supp${SEP}${name}`;
}
export function encodeCoreId(name: string): ComplementId {
  return `core${SEP}${name}`;
}
export function encodeMobilityId(m: MobilitySupplement): ComplementId {
  return `mob${SEP}${m.id}`;
}
export function encodePTId(ptId: string): ComplementId {
  return `pt${SEP}${ptId}`;
}

export function encodeLibId(exerciseName: string): ComplementId {
  return `lib${SEP}${exerciseName}`;
}

export function encodeTextId(text: string): ComplementId {
  // base64 keeps the SEP delimiter safe even if the user types pipes
  return `text${SEP}${btoa(text)}`;
}

export function decodeComplement(id: ComplementId): {
  kind: "nearby" | "supp" | "core" | "mobility" | "pt" | "lib" | "text";
  value: string;
  sub?: string;
} {
  // Backward compat: try pipe first, fall back to colon for legacy IDs
  const sep = id.includes("|") ? "|" : ":";
  const [kind, ...rest] = id.split(sep);
  if (kind === "nearby") {
    return { kind: "nearby", value: rest[0], sub: rest.slice(1).join(sep) };
  }
  if (kind === "mob") {
    return { kind: "mobility", value: rest.join(sep) };
  }
  if (kind === "core") {
    return { kind: "core", value: rest.join(sep) };
  }
  if (kind === "pt") {
    return { kind: "pt", value: rest.join(sep) };
  }
  if (kind === "lib") {
    return { kind: "lib", value: rest.join(sep) };
  }
  if (kind === "text") {
    const encoded = rest.join(sep);
    let decoded = encoded;
    try {
      decoded = atob(encoded);
    } catch {
      decoded = encoded;
    }
    return { kind: "text", value: decoded };
  }
  return { kind: "supp", value: rest.join(sep) };
}

// ── Search helpers ───────────────────────────────────────────────────────

export type ComplementSource =
  | "catalog"
  | "nearby"
  | "supp"
  | "core"
  | "mobility"
  | "pt";

export interface SearchResult {
  id: ComplementId;
  source: ComplementSource;
  /** Short uppercase label shown on the chip (NEARBY / CATALOG / etc.). */
  label: string;
  /** Source accent color (matches existing color scheme). */
  color: string;
  /** Display title — exercise name or supplement name. */
  title: string;
  /** "3×10" or similar; empty string if not applicable. */
  sets: string;
  /** First line of execution / instruction. */
  description: string;
}

interface SearchInputs {
  nearbyAvail: NearbySuperset[];
  suppAvail: Array<{ name: string; data: (typeof SUPPLEMENT_EX)[string] }>;
  coreAvail: Array<{
    name: string;
    region: string;
    data: (typeof SUPPLEMENT_EX)[string];
  }>;
  ptAvail: Array<{ id: string; name: string; sets: string; execution: string }>;
  mobilityAvail: MobilitySupplement[];
  /** All exercise display-names from EX (only searched when query is non-empty). */
  catalogNames: string[];
  /** EX lookup so we can build sets/description for catalog hits. */
  catalogLookup: Record<string, { name: string; sets: [string, string][]; execution?: string }>;
}

const SOURCE_META: Record<ComplementSource, { label: string; color: string }> = {
  catalog: { label: "CATALOG", color: "#3b82f6" },
  nearby: { label: "NEARBY", color: "#14b8a6" },
  supp: { label: "L-LEG", color: "#14b8a6" },
  core: { label: "CORE", color: "#f97316" },
  mobility: { label: "MOBILITY", color: "#0ea5e9" },
  pt: { label: "PT", color: "#34d399" },
};

export function searchComplements(
  query: string,
  filters: Set<ComplementSource>,
  inputs: SearchInputs,
): SearchResult[] {
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const want = (s: ComplementSource) => filters.size === 0 || filters.has(s);

  if (want("nearby")) {
    for (const ns of inputs.nearbyAvail) {
      results.push({
        id: encodeNearbyId(ns),
        source: "nearby",
        label: SOURCE_META.nearby.label,
        color: SOURCE_META.nearby.color,
        title: ns.title,
        sets: ns.sets,
        description: ns.instruction,
      });
    }
  }

  if (want("supp")) {
    for (const { name, data } of inputs.suppAvail) {
      const s = data.sets[0];
      results.push({
        id: encodeSuppId(name),
        source: "supp",
        label: SOURCE_META.supp.label,
        color: SOURCE_META.supp.color,
        title: name,
        sets: `${s[0]}×${s[1]}`,
        description: data.execution,
      });
    }
  }

  if (want("core")) {
    for (const { name, region, data } of inputs.coreAvail) {
      const s = data.sets[0];
      results.push({
        id: encodeCoreId(name),
        source: "core",
        label: region.toUpperCase(),
        color: SOURCE_META.core.color,
        title: name,
        sets: `${s[0]}×${s[1]}`,
        description: data.execution,
      });
    }
  }

  if (want("pt")) {
    for (const ex of inputs.ptAvail) {
      results.push({
        id: encodePTId(ex.id),
        source: "pt",
        label: SOURCE_META.pt.label,
        color: SOURCE_META.pt.color,
        title: ex.name,
        sets: ex.sets,
        description: ex.execution,
      });
    }
  }

  if (want("mobility")) {
    for (const m of inputs.mobilityAvail) {
      const color =
        m.kind === "breathing"
          ? "#8b5cf6"
          : m.kind === "stretch"
            ? "#f59e0b"
            : SOURCE_META.mobility.color;
      const label =
        m.kind === "breathing"
          ? "BREATH"
          : m.kind === "stretch"
            ? "STRETCH"
            : SOURCE_META.mobility.label;
      results.push({
        id: encodeMobilityId(m),
        source: "mobility",
        label,
        color,
        title: m.name,
        sets: m.sets,
        description: m.instruction,
      });
    }
  }

  // Catalog only surfaces when the user has typed something, OR when the
  // catalog filter is the only one active (so they explicitly opted into
  // browsing the full catalog without a query).
  const catalogOnly = filters.size === 1 && filters.has("catalog");
  if (want("catalog") && (q.length > 0 || catalogOnly)) {
    for (const name of inputs.catalogNames) {
      const data = inputs.catalogLookup[name];
      if (!data) continue;
      const s = data.sets[0];
      results.push({
        id: encodeLibId(name),
        source: "catalog",
        label: SOURCE_META.catalog.label,
        color: SOURCE_META.catalog.color,
        title: name,
        sets: s ? `${s[0]}×${s[1]}` : "",
        description: data.execution ?? "",
      });
    }
  }

  if (q.length === 0) return results;

  // Substring match on title; exact-prefix matches sort before substring matches.
  const filtered = results.filter((r) => r.title.toLowerCase().includes(q));
  filtered.sort((a, b) => {
    const aPrefix = a.title.toLowerCase().startsWith(q) ? 0 : 1;
    const bPrefix = b.title.toLowerCase().startsWith(q) ? 0 : 1;
    if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    return a.title.localeCompare(b.title);
  });
  return filtered;
}

// ── Shared button for all complement types ──────────────────────────────

interface ComplementButtonProps {
  label: string;
  color: string;
  title: string;
  sets: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function ComplementButton({
  label,
  color,
  title,
  sets,
  description,
  active,
  onClick,
}: ComplementButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl cursor-pointer font-[inherit] p-3 transition-colors duration-150"
      style={{
        background: active ? color + "18" : "var(--color-bg)",
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
        <span className="text-sm font-semibold" style={{ color }}>
          {title}
        </span>
        <span className="ml-auto text-[10px] text-text-dim">{sets}</span>
        {active && (
          <span className="text-[10px] font-bold" style={{ color }}>
            ✓
          </span>
        )}
      </div>
      <div className="text-[11px] text-text-dim leading-snug">
        {description}
      </div>
    </button>
  );
}

ComplementButton.displayName = "ComplementButton";

// ── Main picker ──────────────────────────────────────────────────────────

interface ComplementPickerProps {
  exerciseRequires: string[];
  exerciseCategory: string;
  /** Workout day key (e.g. "Push A") — surfaces day-specific core routine. */
  workoutKey?: string;
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
  workoutKey,
  nearbySelections,
  activeIds,
  onToggle,
  onClose,
}: ComplementPickerProps) {
  const activeSet = useMemo(() => new Set(activeIds), [activeIds]);

  const ptPhase = useMemo<RehabPhase>(
    () => loadState<RehabPhase>("nwb_pt_phase", "TTWB"),
    [],
  );

  const { nearbyAvail, suppAvail, ptAvail, coreAvail, coreSubtitle, mobilityAvail } = useMemo(() => {
    const inUseIds = new Set(
      exerciseRequires.map((r) => EQUIP_TO_NEARBY[r]).filter(Boolean),
    );
    const reach = new Set<string>([...inUseIds, ...nearbySelections]);

    const nearbyAvail = NEARBY_SUPERSETS.filter((ns) => reach.has(ns.nearbyId));

    const suppAvail = [...SUPPLEMENT_LEFT_LEG.base, ...SUPPLEMENT_LEFT_LEG.legsExtra]
      .map((name) => {
        const data = SUPPLEMENT_EX[name];
        return data ? { name, data } : null;
      })
      .filter(Boolean) as Array<{
      name: string;
      data: (typeof SUPPLEMENT_EX)[string];
    }>;

    const ptAvail = getLeftLegConditioningPT(ptPhase);

    const coreDay = workoutKey ? SUPPLEMENT_CORE[workoutKey] : null;
    const coreAvail = (coreDay?.exercises ?? [])
      .map((ce) => {
        const data = SUPPLEMENT_EX[ce.name];
        return data ? { name: ce.name, region: ce.region, data } : null;
      })
      .filter(Boolean) as Array<{
      name: string;
      region: string;
      data: (typeof SUPPLEMENT_EX)[string];
    }>;
    const coreSubtitle = coreDay?.subtitle ?? "";

    const mobilityAvail = MOBILITY_SUPPLEMENTS.filter((m) =>
      m.appliesTo.includes("all") ||
      m.appliesTo.includes(exerciseCategory as "push" | "pull" | "legs" | "core" | "cardio"),
    );

    return { nearbyAvail, suppAvail, ptAvail, coreAvail, coreSubtitle, mobilityAvail };
  }, [exerciseRequires, exerciseCategory, workoutKey, nearbySelections, ptPhase]);

  const hasAny =
    nearbyAvail.length > 0 ||
    suppAvail.length > 0 ||
    ptAvail.length > 0 ||
    coreAvail.length > 0 ||
    mobilityAvail.length > 0;

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

          {coreAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Core ({coreAvail.length})
              </div>
              {coreSubtitle && (
                <div className="text-[10px] text-text-muted mb-2 leading-snug">
                  {coreSubtitle} &mdash; day-specific core routine for{" "}
                  {workoutKey}.
                </div>
              )}
              <div className="space-y-1.5 mb-4">
                {coreAvail.map(({ name, region, data }) => {
                  const id = encodeCoreId(name);
                  const sets = data.sets[0];
                  return (
                    <ComplementButton
                      key={id}
                      label={region.toUpperCase()}
                      color="#f97316"
                      title={name}
                      sets={`${sets[0]}\u00D7${sets[1]}`}
                      description={data.execution}
                      active={activeSet.has(id)}
                      onClick={() => onToggle(id)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {nearbyAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                In reach ({nearbyAvail.length})
              </div>
              <div className="space-y-1.5 mb-4">
                {nearbyAvail.map((ns) => {
                  const id = encodeNearbyId(ns);
                  return (
                    <ComplementButton
                      key={id}
                      label="NEARBY"
                      color="#14b8a6"
                      title={ns.title}
                      sets={ns.sets}
                      description={ns.instruction}
                      active={activeSet.has(id)}
                      onClick={() => onToggle(id)}
                    />
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
                  const sets = data.sets[0];
                  return (
                    <ComplementButton
                      key={id}
                      label="L-LEG"
                      color="#14b8a6"
                      title={name}
                      sets={`${sets[0]}\u00D7${sets[1]}`}
                      description={data.execution}
                      active={activeSet.has(id)}
                      onClick={() => onToggle(id)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {ptAvail.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                PT \u2014 Left-leg conditioning ({ptAvail.length})
              </div>
              <div className="text-[10px] text-text-muted mb-2 leading-snug">
                Phase: <strong>{ptPhase}</strong> &mdash; phase-gated PT
                progression. Switch phase from the Rehab tab.
              </div>
              <div className="space-y-1.5 mb-4">
                {ptAvail.map((ex) => {
                  const id = encodePTId(ex.id);
                  return (
                    <ComplementButton
                      key={id}
                      label="PT"
                      color="#34d399"
                      title={ex.name}
                      sets={ex.sets}
                      description={ex.execution}
                      active={activeSet.has(id)}
                      onClick={() => onToggle(id)}
                    />
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
                    <ComplementButton
                      key={id}
                      label={label}
                      color={color}
                      title={m.name}
                      sets={m.sets}
                      description={m.instruction}
                      active={activeSet.has(id)}
                      onClick={() => onToggle(id)}
                    />
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

ComplementPicker.displayName = "ComplementPicker";
