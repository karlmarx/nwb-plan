"use client";

import React from "react";

interface BadgeProps {
  color: string;
  children: React.ReactNode;
}

export default function Badge({ color, children }: BadgeProps) {
  return (
    <span
      className="inline-block rounded-md text-[10px] font-bold uppercase tracking-wide leading-none"
      style={{
        padding: "3px 8px",
        background: color + "18",
        color: color,
        border: `1px solid ${color}33`,
      }}
    >
      {children}
    </span>
  );
}
