"use client";

import React, { useState, useEffect } from "react";

// Program start: March 17, 2026 at noon EDT = 16:00 UTC
const PROG_START = new Date("2026-03-17T16:00:00Z");
const PROG_DURATION = 42 * 24 * 60 * 60 * 1000; // 6 weeks in ms
const PROG_END = new Date(PROG_START.getTime() + PROG_DURATION);

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

export default function ProgressClock({ compact }: { compact?: boolean } = {}) {
  const [now, setNow] = useState(() => new Date());
  const [countdown, setCountdown] = useState(false);
  const [flash, setFlash] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Minimize on scroll
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 20) setMinimized(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const elapsed = now.getTime() - PROG_START.getTime();
  const remaining = PROG_END.getTime() - now.getTime();
  const progress = Math.min(1, Math.max(0, elapsed / PROG_DURATION));
  const pct = Math.round(progress * 100);
  const weekNum = Math.min(
    6,
    Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1
  );
  const totalDayNum = Math.min(
    42,
    Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1
  );

  const t = fmt(countdown ? remaining : elapsed);

  // Color shifts: green (0-33%) -> blue (33-66%) -> amber (66-100%)
  const clr =
    progress < 0.33
      ? "var(--color-safe)"
      : progress < 0.66
        ? "var(--color-accent)"
        : "var(--color-warning)";

  // Raw hex for inline computed styles
  const clrHex =
    progress < 0.33 ? "#10b981" : progress < 0.66 ? "#38bdf8" : "#f59e0b";

  const pctDisplay = countdown
    ? 100 - pct + "% remaining"
    : pct + "% complete";

  function handleClick() {
    if (minimized) {
      setMinimized(false);
      return;
    }
    setCountdown((v) => !v);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }

  // ===== COMPACT RING (v2) =====
  if (compact) {
    const size = 44;
    const strokeW = 3.5;
    const r = (size - strokeW) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - progress);
    return (
      <div
        data-testid="progress-ring"
        onClick={handleClick}
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        title={`${countdown ? "Remaining" : "Elapsed"}: ${t.d}d ${pad(t.h)}h ${pad(t.m)}m · ${pctDisplay}`}
      >
        <svg width={size} height={size} className="block" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeW}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={clrHex}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-extrabold leading-none" style={{ color: clr }}>
            W{weekNum}
          </span>
          <span className="text-[8px] font-bold text-text-muted leading-none mt-0.5">
            D{totalDayNum}
          </span>
        </div>
      </div>
    );
  }

  // ===== MINIMIZED STATE =====
  if (minimized) {
    return (
      <div
        data-testid="progress-clock"
        onClick={handleClick}
        className="cursor-pointer mb-4 rounded-xl px-4 py-2.5 flex items-center justify-between min-h-[44px] transition-all duration-200"
        style={{
          background: "var(--color-card)",
          border: `1px solid ${clrHex}33`,
        }}
      >
        <span
          className="text-[11px] font-bold"
          style={{ color: clr }}
        >
          W{weekNum} &middot; D{totalDayNum}
        </span>
        <span
          className="text-[11px] text-text-muted tabular-nums"
        >
          {t.d > 0
            ? t.d + "d " + pad(t.h) + "h " + pad(t.m) + "m"
            : pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s)}
          {" \u00B7 "}
          {pctDisplay}
        </span>
        <span className="text-[10px] text-text-muted">{countdown ? "\u2193" : "\u2191"}</span>
      </div>
    );
  }

  // ===== EXPANDED STATE =====
  return (
    <div
      data-testid="progress-clock"
      onClick={handleClick}
      className="cursor-pointer mb-5 rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: flash
          ? clrHex + "18"
          : "var(--color-card)",
        border: `1px solid ${clrHex}55`,
        boxShadow: `0 0 24px ${clrHex}18, inset 0 1px 0 ${clrHex}22`,
        transition: "background 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3.5 pt-2.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: clrHex,
              boxShadow: `0 0 6px ${clrHex}`,
              animation: "pulse-glow 2s infinite",
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: clr }}
          >
            {progress >= 1
              ? "Program Complete"
              : `Week ${weekNum} \u00B7 Day ${totalDayNum} of 42`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-text-muted uppercase tracking-wide">
            {countdown ? "remaining" : "elapsed"}
          </span>
          <div
            className="rounded text-[9px] font-bold"
            style={{
              padding: "2px 7px",
              background: clrHex + "22",
              border: `1px solid ${clrHex}44`,
              color: clr,
            }}
          >
            {countdown ? "\u2193" : "\u2191"}
          </div>
        </div>
      </div>

      {/* Time display */}
      <div className="flex items-center justify-center gap-0 px-3.5 pt-2.5 pb-2">
        {t.d > 0 && (
          <>
            <TimeUnit value={t.d.toString()} label="days" color={clrHex} />
            <TimeSep color={clrHex} />
          </>
        )}
        <TimeUnit value={pad(t.h)} label="hrs" color={clrHex} />
        <TimeSep color={clrHex} />
        <TimeUnit value={pad(t.m)} label="min" color={clrHex} />
        <TimeSep color={clrHex} />
        <TimeUnit value={pad(t.s)} label="sec" color={clrHex} />
      </div>

      {/* Progress bar */}
      <div
        className="relative h-1.5"
        style={{ background: "var(--color-border)" }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-r-sm"
          style={{
            width: pct + "%",
            background: `linear-gradient(90deg, ${clrHex}99, ${clrHex})`,
            boxShadow: `0 0 8px ${clrHex}66`,
            transition: "width 1s linear",
          }}
        />
        {/* Glowing tip */}
        {pct > 0 && pct < 100 && (
          <div
            className="absolute rounded-sm"
            style={{
              top: -1,
              width: 4,
              height: 8,
              background: clrHex,
              boxShadow: `0 0 6px ${clrHex}`,
              left: `calc(${pct}% - 2px)`,
              transition: "left 1s linear",
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3.5 py-1.5">
        <span className="text-[9px] text-text-muted" />
        <span className="text-[9px] text-text-muted uppercase tracking-wide">
          {pctDisplay} &middot; tap to toggle
        </span>
        <span className="text-[9px] text-text-muted" />
      </div>
    </div>
  );
}

// ===== Sub-components =====

function TimeUnit({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[46px]">
      <div
        className="text-[28px] font-extrabold leading-none"
        style={{
          fontVariantNumeric: "tabular-nums",
          color: color,
          letterSpacing: "-1px",
        }}
      >
        {value}
      </div>
      <div className="text-[8px] font-bold text-text-muted uppercase tracking-[1.5px]">
        {label}
      </div>
    </div>
  );
}

function TimeSep({ color }: { color: string }) {
  return (
    <div
      className="text-2xl font-light self-start mt-1 leading-none"
      style={{ color: color + "66" }}
    >
      :
    </div>
  );
}
