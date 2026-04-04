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

  const isDone = remaining === 0;

  return (
    <div
      data-testid="rest-timer"
      className="fixed bottom-20 left-1/2 z-[100] flex items-center gap-4 rounded-2xl px-6 py-4"
      style={{
        transform: "translateX(-50%)",
        background: "var(--color-card)",
        border: `2px solid ${isDone ? "var(--color-safe)" : "var(--color-accent)"}`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${isDone ? "var(--color-safe)" : "var(--color-accent)"}22`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        data-testid="timer-display"
        className="text-3xl font-extrabold min-w-[70px] text-center tabular-nums"
        style={{
          color: isDone ? "var(--color-safe)" : "var(--color-accent)",
          animation: isDone ? "pulse-glow 1s infinite" : "none",
        }}
      >
        {display}
      </div>
      <button
        data-testid="timer-close"
        onClick={onClose}
        className="border rounded-xl px-4 py-2 text-sm cursor-pointer font-[inherit] min-h-[44px] min-w-[44px] transition-colors duration-150"
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
