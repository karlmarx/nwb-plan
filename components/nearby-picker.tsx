"use client";

import React from "react";
import { NEARBY_EQUIPMENT } from "@/lib/exercises";

interface NearbyPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function NearbyPicker({
  selected,
  onToggle,
}: NearbyPickerProps) {
  return (
    <div>
      <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
        What&apos;s within reach?
      </div>
      <div className="flex flex-wrap gap-2">
        {NEARBY_EQUIPMENT.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="rounded-lg cursor-pointer font-[inherit] transition-colors duration-150 min-h-[44px] min-w-[44px]"
              style={{
                padding: "8px 14px",
                background: isSelected
                  ? "var(--color-accent-dim)"
                  : "var(--color-card)",
                border: isSelected
                  ? "2px solid var(--color-accent)"
                  : "2px solid var(--color-border)",
                color: isSelected
                  ? "var(--color-accent)"
                  : "var(--color-text-muted)",
              }}
            >
              <span className="text-base mr-1.5">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
