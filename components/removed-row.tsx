"use client";

import React from "react";
import Badge from "@/components/badge";

interface RemovedRowProps {
  name: string;
  reason: string;
}

export default function RemovedRow({ name, reason }: RemovedRowProps) {
  return (
    <div
      className="rounded-lg mb-1 opacity-70"
      style={{
        padding: "8px 11px",
        background: "var(--color-danger-bg)",
        border: "1px solid var(--color-danger-border)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="line-through text-danger text-xs font-semibold">
          {name}
        </span>
        <Badge color="var(--color-danger)">REMOVED</Badge>
      </div>
      <div className="text-[11px] text-danger mt-0.5">
        {"\u26A0"} {reason}
      </div>
    </div>
  );
}
