"use client";

import React from "react";

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  accent?: string;
  count?: number;
}

export default function Section({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  accent,
  count,
}: SectionProps) {
  const ac = accent ?? "#38bdf8";

  return (
    <div
      data-testid="section"
      className="mb-3 rounded-xl bg-card overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? ac + "55" : "var(--color-border)"}`,
        boxShadow: isOpen ? `0 0 20px ${ac}08` : "none",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-transparent border-none text-text cursor-pointer text-left font-[inherit] min-h-[52px] transition-colors duration-150"
        style={{
          background: isOpen ? ac + "08" : "transparent",
        }}
      >
        <span className="text-lg leading-none">{icon}</span>
        <span className="flex-1 font-semibold text-[15px] tracking-tight">{title}</span>
        {count != null && (
          <span
            className="text-[11px] font-medium rounded-full px-2 py-0.5"
            style={{
              background: isOpen ? ac + "18" : "var(--color-bg)",
              color: isOpen ? ac : "var(--color-text-muted)",
              border: `1px solid ${isOpen ? ac + "33" : "var(--color-border)"}`,
            }}
          >
            {count}
          </span>
        )}
        <span
          className="text-xs text-text-muted transition-transform duration-200"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          &#9660;
        </span>
      </button>

      {isOpen && (
        <div className="section-content px-4 pb-4 leading-relaxed">{children}</div>
      )}
    </div>
  );
}
