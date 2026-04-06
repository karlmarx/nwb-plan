"use client";

import React, { useState, useMemo } from "react";
import type { Exercise, MachineVariant } from "@/lib/exercises";
import { EX, EQUIPMENT } from "@/lib/exercises";

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
  pecdeck: { label: "Pec Deck / Fly Machine", icon: "🦋", order: 6 },
  dipMachine: { label: "Dip Machine", icon: "⬇️", order: 7 },
  preacher: { label: "Preacher Bench", icon: "💺", order: 8 },
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

    const currentKey = getPrimaryEquipKey(currentExercise.requires);
    const currentCat = getCategoryInfo(currentKey);
    groupMap.set(currentKey, {
      key: currentKey,
      label: currentCat.label,
      icon: currentCat.icon,
      order: currentCat.order,
      options: [
        { name: currentName, ex: currentExercise, isCurrent: true },
      ],
      hasCurrentExercise: true,
    });

    const availableSwaps = (currentExercise.swaps ?? []).filter(
      (sw) => !workoutExercises.includes(sw) || sw === currentName,
    );

    for (const swapName of availableSwaps) {
      const swapEx = EX[swapName];
      if (!swapEx) continue;

      const equipKey = getPrimaryEquipKey(swapEx.requires);
      const cat = getCategoryInfo(equipKey);

      if (!groupMap.has(equipKey)) {
        groupMap.set(equipKey, {
          key: equipKey,
          label: cat.label,
          icon: cat.icon,
          order: cat.order,
          options: [],
          hasCurrentExercise: false,
        });
      }

      const group = groupMap.get(equipKey)!;
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

  const variants = currentExercise.machineVariants;
  const hasVariantsOrSwaps =
    (groups.length > 1) ||
    (groups[0]?.options.length > 1) ||
    (variants && variants.length > 0);

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
              o.ex.requires.length > 0 &&
              o.ex.requires.some((r) => equipment[r] === false),
          );

          // Count includes variants for the current group
          const totalCount =
            group.options.length +
            (group.hasCurrentExercise && variants ? variants.length : 0);

          return (
            <div
              key={group.key}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                background: group.hasCurrentExercise
                  ? "var(--color-accent-dim)"
                  : "var(--color-card)",
                border: group.hasCurrentExercise
                  ? "1px solid var(--color-accent)44"
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
                      background: "var(--color-accent)22",
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
                  {/* Machine variants (only in the current equipment group) */}
                  {group.hasCurrentExercise && variants && variants.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Machine type at your station
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {variants.map((variant) => {
                          const isSelected = selectedVariantId === variant.id;
                          return (
                            <button
                              key={variant.id}
                              data-testid={`machine-${variant.id}`}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                onSelectVariant?.(variant.id);
                              }}
                              className="rounded-lg p-3 text-left cursor-pointer font-[inherit] min-h-[64px] transition-colors duration-150"
                              style={{
                                background: isSelected
                                  ? "var(--color-accent-dim)"
                                  : "var(--color-bg)",
                                border: isSelected
                                  ? "2px solid var(--color-accent)"
                                  : "1px solid var(--color-border)",
                              }}
                            >
                              <div className="text-lg mb-1">{variant.icon}</div>
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
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Separator if we have both variants and swap options */}
                  {group.hasCurrentExercise && variants && variants.length > 0 && group.options.length > 0 && (
                    <div className="border-t border-border my-1" />
                  )}

                  {/* Swap exercise options */}
                  {group.options.map((option) => {
                    const isUnavailable =
                      option.ex.requires.length > 0 &&
                      option.ex.requires.some((r) => equipment[r] === false);
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
                            ? "var(--color-accent)15"
                            : "var(--color-bg)",
                          border: option.isCurrent
                            ? `1px solid var(--color-accent)44`
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
                                background: "var(--color-warning)22",
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
                                background: "var(--color-danger)22",
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
