"use client";

import React from "react";

type CalloutType = "danger" | "warning" | "safe" | "info";

interface CalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

const CONFIG: Record<
  CalloutType,
  { icon: string; bg: string; border: string; text: string }
> = {
  danger: {
    icon: "\u{1F6AB}",
    bg: "bg-danger-bg",
    border: "border-danger-border",
    text: "text-danger",
  },
  warning: {
    icon: "\u26A0\uFE0F",
    bg: "bg-warning-bg",
    border: "border-warning-border",
    text: "text-warning",
  },
  safe: {
    icon: "\u2705",
    bg: "bg-safe-bg",
    border: "border-safe-border",
    text: "text-safe",
  },
  info: {
    icon: "\u{1F4A1}",
    bg: "bg-accent-dim/40",
    border: "border-accent-dim",
    text: "text-accent",
  },
};

export default function Callout({ type, children }: CalloutProps) {
  const c = CONFIG[type] ?? CONFIG.info;

  return (
    <div
      className={`rounded-xl border p-3.5 mb-3 text-[13px] leading-relaxed ${c.bg} ${c.border} ${c.text}`}
    >
      <span className="mr-1.5">{c.icon}</span>
      {children}
    </div>
  );
}
