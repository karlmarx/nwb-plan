"use client";

import React from "react";
import { NEARBY_EQUIPMENT } from "@/lib/exercises";

interface NearbyPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
  inUse?: string[];
}

export default function NearbyPicker({
  selected,
  onToggle,
  inUse = [],
}: NearbyPickerProps) {
  const hasManualSelection = selected.length > 0;
  const noneActive = !hasManualSelection && inUse.length === 0;
  return (
    <div data-testid="nearby-picker">
      <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
        What&apos;s within reach?
      </div>
      <div className="flex flex-wrap gap-2">
        {/* None chip — clears all manual selections */}
        <button
          onClick={() => {
            // Clear all manual selections by toggling each off
            selected.forEach((id) => onToggle(id));
          }}
          className="rounded-lg cursor-pointer font-[inherit] transition-colors duration-150 min-h-[44px] min-w-[44px]"
          style={{
            padding: "8px 14px",
            background: noneActive
              ? "var(--color-accent-dim)"
              : "var(--color-card)",
            border: noneActive
              ? "2px solid var(--color-accent)"
              : "2px solid var(--color-border)",
            color: noneActive
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
          }}
        >
          <span className="text-base mr-1.5">{"\u2205"}</span>
          <span className="text-xs font-semibold">None</span>
        </button>
        {NEARBY_EQUIPMENT.map((item) => {
          const isInUse = inUse.includes(item.id);
          const isSelected = isInUse || selected.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isInUse) onToggle(item.id);
              }}
              className="rounded-lg cursor-pointer font-[inherit] transition-colors duration-150 min-h-[44px] min-w-[44px]"
              style={{
                padding: "8px 14px",
                background: isInUse
                  ? "#14b8a615"
                  : isSelected
                    ? "var(--color-accent-dim)"
                    : "var(--color-card)",
                border: isInUse
                  ? "2px solid #14b8a6"
                  : isSelected
                    ? "2px solid var(--color-accent)"
                    : "2px solid var(--color-border)",
                color: isInUse
                  ? "#14b8a6"
                  : isSelected
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                opacity: isInUse ? 1 : undefined,
              }}
            >
              <span className="text-base mr-1.5">{item.icon}</span>
              <span className="text-xs font-semibold">
                {item.label}
                {isInUse ? " (in use)" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
