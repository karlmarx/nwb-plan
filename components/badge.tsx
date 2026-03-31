"use client";

import React from "react";

interface BadgeProps {
  color: string;
  children: React.ReactNode;
}

export default function Badge({ color, children }: BadgeProps) {
  return (
    <span
      className="inline-block rounded text-[10px] font-bold uppercase tracking-wide"
      style={{
        padding: "2px 7px",
        background: color + "22",
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}
