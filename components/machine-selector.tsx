"use client";

import React from "react";
import type { MachineVariant } from "@/lib/exercises";
import { cssAlpha } from "@/lib/css-utils";

interface MachineSelectorProps {
  variants: MachineVariant[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function MachineSelector({
  variants,
  selected,
  onSelect,
}: MachineSelectorProps) {
  return (
    <div data-testid="machine-selector" className="grid grid-cols-2 gap-2.5">
      {variants.map((variant) => {
        const isSelected = selected === variant.id;
        const isConditional = variant.status === "conditional";
        const statusLabel =
          variant.status === "preferred"
            ? "Preferred"
            : variant.status === "secondary"
              ? "Backup"
              : isConditional
                ? "Conditional"
                : null;
        const statusColor =
          variant.status === "preferred"
            ? "var(--color-safe)"
            : "var(--color-warning)";
        return (
          <button
            key={variant.id}
            data-testid={`machine-${variant.id}`}
            onClick={() => onSelect(variant.id)}
            title={
              isConditional && variant.caveat
                ? `⚠ ${variant.caveat}`
                : undefined
            }
            className="rounded-xl p-4 text-left cursor-pointer font-[inherit] min-h-[80px] transition-colors duration-150"
            style={{
              background: isSelected
                ? "var(--color-accent-dim)"
                : "var(--color-card)",
              border: isSelected
                ? "2px solid var(--color-accent)"
                : "2px solid var(--color-border)",
              borderLeft: isConditional
                ? "4px solid var(--color-warning)"
                : undefined,
              opacity: 1,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-2xl">{variant.icon}</span>
              {isConditional && (
                <span
                  aria-label="Conditional safety warning"
                  className="text-base"
                  style={{ color: "var(--color-warning)" }}
                >
                  {"⚠️"}
                </span>
              )}
            </div>
            <div
              className="text-sm font-semibold mb-0.5"
              style={{
                color: isSelected
                  ? "var(--color-accent)"
                  : "var(--color-text)",
              }}
            >
              {variant.label}
            </div>
            <div className="text-[11px] text-text-dim leading-snug">
              {variant.description}
            </div>
            {statusLabel && (
              <div
                className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5"
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
                className="mt-2 text-[11px] leading-snug rounded p-2"
                style={{
                  background: cssAlpha("var(--color-warning)", 13),
                  color: "var(--color-warning)",
                  border: `1px solid ${cssAlpha("var(--color-warning)", 27)}`,
                }}
              >
                <strong>{"⚠️ Safety:"}</strong> {variant.caveat}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
