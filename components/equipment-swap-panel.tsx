"use client";

import React, { useState, useMemo } from "react";
import type { Exercise, MachineVariant } from "@/lib/exercises";
import { EX, EQUIPMENT, isExerciseAvailable } from "@/lib/exercises";
import { cssAlpha } from "@/lib/css-utils";

/**
 * Resolve a variant's effective equipment requirements. Variants may override
 * the parent exercise's `requires` (e.g. a Smith-machine variant of a DB lift)
 * — when they don't, they inherit the parent's. Used by the swap panel so that
 * cross-equipment variants render under their actual equipment group instead
 * of being lumped under the parent's primary.
 */
function variantRequires(variant: MachineVariant, parent: Exercise): string[] {
  return variant.requires ?? parent.requires;
}

// ── Equipment category mapping ──────────────────────────────────────────

interface EquipCategoryInfo {
  label: string;
  icon: string;
  order: number;
}

const EQUIP_CATEGORIES: Record<string, EquipCategoryInfo> = {
  cables: { label: "Cable Station", icon: "⚖️", order: 1 },
  latpulldown: { label: "Lat Pulldown Machine", icon: "⬇️", order: 2 },
  legpress: { label: "Leg Press", icon: "🦵", order: 3 },
  hacksquat: { label: "Hack Squat", icon: "🦿", order: 4 },
  hamcurl: { label: "Ham Curl Machine", icon: "🦵", order: 5 },
  chestpress: { label: "Chest Press Machine", icon: "💪", order: 6 },
  pecdeck: { label: "Pec Deck / Fly Machine", icon: "🦋", order: 7 },
  dipMachine: { label: "Dip Machine", icon: "⬇️", order: 8 },
  preacher: { label: "Preacher Bench", icon: "💺", order: 9 },
  rowMachine: { label: "Row Machine (Chest-Pad)", icon: "🏋️", order: 8 },
  tbar: { label: "T-Bar / Landmine Row", icon: "🔩", order: 8 },
  smith: { label: "Smith Machine", icon: "🛠️", order: 8 },
  barbell: { label: "Barbell", icon: "🏋️", order: 9 },
  dumbbells: { label: "Dumbbells", icon: "💪", order: 10 },
  ezbar: { label: "EZ-Bar", icon: "🔩", order: 11 },
  pullupbar: { label: "Pull-Up Bar", icon: "🪜", order: 12 },
  rings: { label: "Rings", icon: "⭕", order: 13 },
  trx: { label: "TRX / Suspension", icon: "🏋️", order: 14 },
  parallettes: { label: "Parallettes", icon: "🤸", order: 15 },
  bands: { label: "Resistance Bands", icon: "🔗", order: 16 },
  stabball: { label: "Stability Ball", icon: "⚽", order: 17 },
  mat: { label: "Mat / Floor", icon: "🧘", order: 18 },
  bench: { label: "Bench", icon: "🛋️", order: 19 },
  plyobox: { label: "Plyo Box", icon: "📦", order: 20 },
};

function getPrimaryEquipKey(requires: string[]): string {
  const generic = new Set(["mat", "bench"]);
  for (const key of requires) {
    if (!generic.has(key)) return key;
  }
  return requires[0] || "bodyweight";
}

function getCategoryInfo(equipKey: string): EquipCategoryInfo {
  return (
    EQUIP_CATEGORIES[equipKey] ?? {
      label: EQUIPMENT[equipKey]?.name ?? equipKey,
      icon: EQUIPMENT[equipKey]?.icon ?? "🔧",
      order: 99,
    }
  );
}

// ── Types ───────────────────────────────────────────────────────────────

interface SwapOption {
  name: string;
  ex: Exercise;
  isCurrent: boolean;
}

interface EquipmentGroup {
  key: string;
  label: string;
  icon: string;
  order: number;
  options: SwapOption[];
  /** Machine variants that should render under this group (filtered by effective requires). */
  variants: MachineVariant[];
  hasCurrentExercise: boolean;
}

// ── Props ───────────────────────────────────────────────────────────────

interface EquipmentSwapPanelProps {
  currentName: string;
  currentExercise: Exercise;
  onSwap: (exerciseName: string) => void;
  equipment: Record<string, boolean>;
  workoutExercises: string[];
  // Machine variant props (optional — only present when exercise has machineVariants)
  selectedVariantId?: string | null;
  onSelectVariant?: (id: string) => void;
}

// ── Component ───────────────────────────────────────────────────────────

export default function EquipmentSwapPanel({
  currentName,
  currentExercise,
  onSwap,
  equipment,
  workoutExercises,
  selectedVariantId,
  onSelectVariant,
}: EquipmentSwapPanelProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const groups = useMemo(() => {
    const groupMap = new Map<string, EquipmentGroup>();

    /** Get-or-create a group keyed by primary equipment. */
    function ensureGroup(equipKey: string): EquipmentGroup {
      let group = groupMap.get(equipKey);
      if (!group) {
        const cat = getCategoryInfo(equipKey);
        group = {
          key: equipKey,
          label: cat.label,
          icon: cat.icon,
          order: cat.order,
          options: [],
          variants: [],
          hasCurrentExercise: false,
        };
        groupMap.set(equipKey, group);
      }
      return group;
    }

    // Seed the current exercise's group with the exercise itself.
    const currentKey = getPrimaryEquipKey(currentExercise.requires);
    const currentGroup = ensureGroup(currentKey);
    currentGroup.options.push({
      name: currentName,
      ex: currentExercise,
      isCurrent: true,
    });
    currentGroup.hasCurrentExercise = true;

    // Distribute machine variants into groups by their effective requires.
    // Variants that share the parent's primary equipment land in the current
    // group; cross-equipment variants (Smith machine variant of a DB lift,
    // cable variant of a chest-supported row, etc.) get their own group.
    for (const variant of currentExercise.machineVariants ?? []) {
      const variantKey = getPrimaryEquipKey(
        variantRequires(variant, currentExercise),
      );
      const group = ensureGroup(variantKey);
      group.variants.push(variant);
    }

    // Swap candidates (other named exercises).
    const availableSwaps = (currentExercise.swaps ?? []).filter(
      (sw) => !workoutExercises.includes(sw) || sw === currentName,
    );
    for (const swapName of availableSwaps) {
      const swapEx = EX[swapName];
      if (!swapEx) continue;
      const equipKey = getPrimaryEquipKey(swapEx.requires);
      const group = ensureGroup(equipKey);
      if (!group.options.some((o) => o.name === swapName)) {
        group.options.push({ name: swapName, ex: swapEx, isCurrent: false });
      }
    }

    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.hasCurrentExercise) return -1;
      if (b.hasCurrentExercise) return 1;
      return a.order - b.order;
    });
  }, [currentName, currentExercise, workoutExercises]);

  const hasVariantsOrSwaps = groups.some(
    (g) =>
      g.options.length > 0 || g.variants.length > 0,
  ) && (groups.length > 1 ||
    groups[0]?.options.length > 1 ||
    groups[0]?.variants.length > 0);

  if (!hasVariantsOrSwaps) return null;

  return (
    <div className="mt-3" data-testid="equipment-swap-panel">
      <div className="text-[11px] font-bold text-text-muted mb-2 uppercase tracking-wider">
        🔄 Equipment &amp; Alternatives
      </div>

      <div className="space-y-1.5">
        {groups.map((group) => {
          const isExpanded = expandedGroup === group.key;
          const hasUnavailable = group.options.some(
            (o) =>
              o.ex.requires.length > 0 && !isExerciseAvailable(o.ex, equipment),
          );

          const totalCount = group.options.length + group.variants.length;

          return (
            <div
              key={group.key}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                background: group.hasCurrentExercise
                  ? "var(--color-accent-dim)"
                  : "var(--color-card)",
                border: group.hasCurrentExercise
                  ? `1px solid ${cssAlpha("var(--color-accent)", 27)}`
                  : "1px solid var(--color-border)",
                opacity: hasUnavailable && !group.hasCurrentExercise ? 0.6 : 1,
              }}
            >
              {/* Group header */}
              <button
                onClick={() =>
                  setExpandedGroup(isExpanded ? null : group.key)
                }
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none cursor-pointer text-left font-[inherit] min-h-[44px] transition-colors duration-150"
              >
                <span className="text-base leading-none">{group.icon}</span>
                <span
                  className="flex-1 text-[13px] font-semibold"
                  style={{
                    color: group.hasCurrentExercise
                      ? "var(--color-accent)"
                      : "var(--color-text)",
                  }}
                >
                  {group.label}
                </span>
                <span className="text-[11px] text-text-muted font-medium">
                  {totalCount}
                </span>
                {group.hasCurrentExercise && (
                  <span
                    className="text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5"
                    style={{
                      background: cssAlpha("var(--color-accent)", 13),
                      color: "var(--color-accent)",
                    }}
                  >
                    Current
                  </span>
                )}
                <span
                  className="text-[10px] text-text-muted transition-transform duration-200"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Expanded options */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  {/* Machine variants — bucketed under their effective equipment group */}
                  {group.variants.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        {group.hasCurrentExercise
                          ? "Machine type at your station"
                          : "Alternate station — same exercise"}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.variants.map((variant) => {
                          const isSelected = selectedVariantId === variant.id;
                          const isConditional = variant.status === "conditional";
                          const statusLabel =
                            variant.status === "preferred"
                              ? "Preferred"
                              : variant.status === "secondary"
                                ? "Backup"
                                : isConditional
                                  ? "Conditional"
                                  : null;
                          const statusColor = isConditional
                            ? "var(--color-warning)"
                            : variant.status === "secondary"
                              ? "var(--color-warning)"
                              : "var(--color-safe)";
                          return (
                            <button
                              key={variant.id}
                              data-testid={`machine-${variant.id}`}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                onSelectVariant?.(variant.id);
                              }}
                              title={
                                isConditional && variant.caveat
                                  ? `⚠ ${variant.caveat}`
                                  : undefined
                              }
                              className="rounded-lg p-3 text-left cursor-pointer font-[inherit] min-h-[64px] transition-colors duration-150"
                              style={{
                                background: isSelected
                                  ? "var(--color-accent-dim)"
                                  : "var(--color-bg)",
                                border: isSelected
                                  ? "2px solid var(--color-accent)"
                                  : "1px solid var(--color-border)",
                                borderLeft: isConditional
                                  ? "3px solid var(--color-warning)"
                                  : undefined,
                              }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-lg">{variant.icon}</span>
                                {isConditional && (
                                  <span
                                    aria-label="Conditional safety warning"
                                    className="text-sm"
                                    style={{ color: "var(--color-warning)" }}
                                  >
                                    {"⚠️"}
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-[12px] font-semibold mb-0.5"
                                style={{
                                  color: isSelected
                                    ? "var(--color-accent)"
                                    : "var(--color-text)",
                                }}
                              >
                                {variant.label}
                              </div>
                              <div className="text-[10px] text-text-dim leading-snug">
                                {variant.description}
                              </div>
                              {statusLabel && (
                                <div
                                  className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5"
                                  style={{
                                    background: cssAlpha(statusColor, 13),
                                    color: statusColor,
                                  }}
                                >
                                  {statusLabel}
                                </div>
                              )}
                              {isConditional && variant.caveat && isSelected && (
                                <div
                                  className="mt-2 text-[10px] leading-snug rounded p-2"
                                  style={{
                                    background: cssAlpha(
                                      "var(--color-warning)",
                                      13,
                                    ),
                                    color: "var(--color-warning)",
                                    border: `1px solid ${cssAlpha(
                                      "var(--color-warning)",
                                      27,
                                    )}`,
                                  }}
                                >
                                  <strong>{"⚠️ Safety:"}</strong>{" "}
                                  {variant.caveat}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Separator if we have both variants and swap options */}
                  {group.variants.length > 0 && group.options.length > 0 && (
                    <div className="border-t border-border my-1" />
                  )}

                  {/* Swap exercise options */}
                  {group.options.map((option) => {
                    const isUnavailable =
                      option.ex.requires.length > 0 &&
                      !isExerciseAvailable(option.ex, equipment);
                    const safetyColor =
                      option.ex.safety === "caution"
                        ? "var(--color-warning)"
                        : "var(--color-safe)";

                    return (
                      <button
                        key={option.name}
                        data-testid={`swap-option-${option.ex.id}`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (!option.isCurrent && !isUnavailable) {
                            onSwap(option.name);
                          }
                        }}
                        disabled={option.isCurrent || isUnavailable}
                        className="w-full text-left rounded-lg p-3 cursor-pointer font-[inherit] min-h-[48px] transition-colors duration-150 disabled:cursor-default"
                        style={{
                          background: option.isCurrent
                            ? cssAlpha("var(--color-accent)", 8)
                            : "var(--color-bg)",
                          border: option.isCurrent
                            ? `1px solid ${cssAlpha("var(--color-accent)", 27)}`
                            : `1px solid var(--color-border)`,
                          borderLeft: `3px solid ${option.isCurrent ? "var(--color-accent)" : safetyColor}`,
                          opacity: isUnavailable ? 0.4 : 1,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[13px] font-semibold flex-1"
                            style={{
                              color: option.isCurrent
                                ? "var(--color-accent)"
                                : "var(--color-text)",
                            }}
                          >
                            {option.name}
                          </span>
                          {option.isCurrent && (
                            <span className="text-[10px] text-accent font-bold">
                              ✓ Active
                            </span>
                          )}
                          {option.ex.safety === "caution" && !option.isCurrent && (
                            <span
                              className="text-[10px] font-bold rounded px-1 py-0.5"
                              style={{
                                background: cssAlpha("var(--color-warning)", 13),
                                color: "var(--color-warning)",
                              }}
                            >
                              MODIFIED
                            </span>
                          )}
                          {isUnavailable && (
                            <span
                              className="text-[10px] font-bold rounded px-1 py-0.5"
                              style={{
                                background: cssAlpha("var(--color-danger)", 13),
                                color: "var(--color-danger)",
                              }}
                            >
                              NO EQUIP
                            </span>
                          )}
                        </div>
                        {option.ex.requires.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {option.ex.requires.map((eq) => {
                              const eqData = EQUIPMENT[eq];
                              const has = equipment[eq] !== false;
                              return (
                                <span
                                  key={eq}
                                  className="text-[10px] rounded font-medium"
                                  style={{
                                    padding: "1px 5px",
                                    background: has
                                      ? "var(--color-safe-bg)"
                                      : "var(--color-danger-bg)",
                                    color: has
                                      ? "var(--color-safe)"
                                      : "var(--color-danger)",
                                  }}
                                >
                                  {eqData?.icon} {eqData?.name ?? eq}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {!option.isCurrent && option.ex.why && (
                          <div className="text-[11px] text-text-dim mt-1 line-clamp-2 leading-snug">
                            {option.ex.why}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
