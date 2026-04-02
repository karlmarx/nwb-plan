"use client";

import React, { useState, useEffect, useRef } from "react";

interface RestTimerProps {
  seconds: number;
  onClose: () => void;
}

export default function RestTimer({ seconds, onClose }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const display =
    remaining === 0
      ? "GO!"
      : (mins > 0 ? mins + ":" : "") +
        (secs < 10 && mins > 0 ? "0" : "") +
        secs;

  return (
    <div
      data-testid="rest-timer"
      className="fixed bottom-[70px] left-1/2 z-[100] flex items-center gap-3 rounded-2xl px-6 py-3"
      style={{
        transform: "translateX(-50%)",
        background: "#111827",
        border: "2px solid var(--color-accent)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div
        data-testid="timer-display"
        className="text-[28px] font-extrabold min-w-[60px] text-center"
        style={{
          fontVariantNumeric: "tabular-nums",
          color:
            remaining === 0 ? "var(--color-safe)" : "var(--color-accent)",
          animation: remaining === 0 ? "pulse-glow 1s infinite" : "none",
        }}
      >
        {display}
      </div>
      <button
        data-testid="timer-close"
        onClick={onClose}
        className="border rounded-lg px-3 py-1.5 text-xs cursor-pointer font-[inherit] min-h-[44px] min-w-[44px]"
        style={{
          background: "none",
          borderColor: "var(--color-border)",
          color: "var(--color-text-dim)",
        }}
      >
        &#10005; Close
      </button>
    </div>
  );
}
