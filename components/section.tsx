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
      className="mb-2.5 rounded-[10px] bg-card overflow-hidden"
      style={{
        border: `1px solid ${isOpen ? ac + "44" : "var(--color-border)"}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 bg-transparent border-none text-text cursor-pointer text-left text-sm font-semibold font-[inherit] min-h-[44px]"
      >
        <span className="text-[17px]">{icon}</span>
        <span className="flex-1">{title}</span>
        {count != null && (
          <span className="text-[11px] text-text-muted mr-2">
            {count} exercises
          </span>
        )}
        <span
          className="text-[11px] text-text-muted transition-transform duration-200"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          &#9660;
        </span>
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 leading-relaxed">{children}</div>
      )}
    </div>
  );
}
