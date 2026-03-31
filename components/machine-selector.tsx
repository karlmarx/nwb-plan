"use client";

import React from "react";
import type { MachineVariant } from "@/lib/exercises";

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
    <div className="grid grid-cols-2 gap-2.5">
      {variants.map((variant) => {
        const isSelected = selected === variant.id;
        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            className="rounded-xl p-4 text-left cursor-pointer font-[inherit] min-h-[80px] transition-colors duration-150"
            style={{
              background: isSelected
                ? "var(--color-accent-dim)"
                : "var(--color-card)",
              border: isSelected
                ? "2px solid var(--color-accent)"
                : "2px solid var(--color-border)",
              opacity: 1,
            }}
          >
            <div className="text-2xl mb-1.5">{variant.icon}</div>
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
          </button>
        );
      })}
    </div>
  );
}
